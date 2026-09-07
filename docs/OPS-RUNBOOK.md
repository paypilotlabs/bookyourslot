# Operator runbook

The backlog items that produce no diff. Every command here was run against the live box
on 6 September 2026 and does what it says.

**Each part is independent.** Part A is the one that matters; the rest can wait as long
as you like. Nothing below blocks anything else, so skip freely and come back.

Reference for the items themselves: [BACKLOG.md](BACKLOG.md).

## Facts you will need

| Thing | Value |
| --- | --- |
| SSH | `ssh root@2.25.89.115` |
| Compose directory | `/opt/bookyourslot/deploy/production` |
| App container | `production-bookyourslot-1` |
| Database container | `production-database-1` |
| Postgres user / database | `bookyourslot` / `bookyourslot` |
| Env file | `/opt/bookyourslot/deploy/production/.env` |
| Pre-deploy snapshots | `/opt/bookyourslot/backups/` |
| n8n editor | `http://100.91.157.6:5678/`, tailnet only, never public |

Two standing rules:

- **Never** `docker compose down -v`. That deletes the database volume.
- **Never** run `yarn db-seed` on this box.

---

## Step 0. Connect and pull

*2 minutes. Do this before Part A or Part D, which read files off the box.*

The deploy pipeline updates the container image and `IMAGE_TAG`. It never updates the
source checkout, so everything read from disk drifts: compose files, `remote-deploy.sh`,
and the backup cron documented in the box's own README. It was measured **33 commits
behind** on 6 September.

```bash
ssh root@2.25.89.115 'cd /opt/bookyourslot && git pull && git rev-list --count HEAD..origin/main'
```

**Success looks like:** the last line prints `0`.

Done on 7 September 2026: the checkout was 41 behind and is now at the `#56` merge. It
will drift again with the next deploy, so re-run this before acting on anything below.

---

# Part A. Stop being one disk away from losing every booking

This is the only part with a real deadline. Everything else on this page can slide.

Right now your only backups are pre-deploy snapshots, so **backup age equals deploy
frequency**. Go a quiet month without shipping and the newest copy of your customers'
bookings is a month old.

## A1. Create the backup directory

*1 minute.*

The redirection in the cron job cannot create this. Without it the job fails every night
and cron's only complaint goes to root's local mail on a box with no mail reader.

```bash
ssh root@2.25.89.115 'mkdir -p /root/backups && ls -ld /root/backups'
```

## A2. Install the nightly dump

*5 minutes.*

SSH in and run `crontab -e`, then paste this as a single line:

```
0 3 * * * cd /opt/bookyourslot/deploy/production && bash -o pipefail -c 'docker compose exec -T database pg_dump --clean --if-exists -U bookyourslot bookyourslot | gzip > /root/backups/bys-$(date +\%F).sql.gz.part' && mv /root/backups/bys-$(date +\%F).sql.gz.part /root/backups/bys-$(date +\%F).sql.gz && find /root/backups -name 'bys-*.sql.gz' -mtime +14 -delete
```

Three details in that line each cost a working backup once already, so do not simplify it:

- **`bash -o pipefail`** because cron runs `/bin/sh`, where a pipeline's exit status is
  gzip's, not `pg_dump`'s. Without it a failed dump still produces a valid, empty `.gz`
  and the `&&` still fires.
- **`.part` then `mv`** so the dated filename only appears once the dump finished. A half
  written file can never be mistaken for a good one, and the 14 day prune cannot delete
  real history and leave you with empties.
- **`\%F`** because cron treats a bare `%` as a newline.

Confirm it saved:

```bash
ssh root@2.25.89.115 'crontab -l'
```

## A3. Prove the dump works, without waiting for 3am

*2 minutes.* Runs the same pipeline by hand.

```bash
ssh root@2.25.89.115 'cd /opt/bookyourslot/deploy/production && bash -o pipefail -c "docker compose exec -T database pg_dump --clean --if-exists -U bookyourslot bookyourslot | gzip > /root/backups/manual-test.sql.gz" && ls -lh /root/backups/manual-test.sql.gz'
```

**Success looks like:** a file of roughly **220KB**. Verified today at 227,297 bytes.

**Failure looks like:** a file of about **20 bytes**. That is a valid empty gzip and it
means `pipefail` is missing. This is exactly the failure the flag exists to catch.

Clean up:

```bash
ssh root@2.25.89.115 'rm /root/backups/manual-test.sql.gz'
```

Then check again tomorrow that `bys-<date>.sql.gz` appeared on its own.

## A4. Restore one backup into a scratch database

*20 minutes, once.* A backup nobody has restored is a belief, not a recovery plan.

The seven existing pre-deploy snapshots predate the `--clean --if-exists` change, so they
restore only into an **empty** target. That is what the scratch database is for.

SSH in first, then run these on the box:

```bash
SNAP=$(ls -t /opt/bookyourslot/backups/*.sql.gz | head -1); echo "using $SNAP"
```

```bash
docker exec production-database-1 psql -U bookyourslot -c "CREATE DATABASE restore_test;"
```

```bash
gunzip -c "$SNAP" | docker exec -i production-database-1 psql -U bookyourslot -d restore_test -q
```

Now compare the two. This is the whole point of the exercise:

```bash
echo -n "restored: "; docker exec production-database-1 psql -U bookyourslot -d restore_test -tAc 'select count(*) from "Booking";'
echo -n "live:     "; docker exec production-database-1 psql -U bookyourslot -d bookyourslot -tAc 'select count(*) from "Booking";'
```

**Success looks like:** two numbers that match, or the restored one being lower by
whatever was booked after the snapshot was taken. Live is 8 today.

Drop the scratch database when you are done. It is safe: `restore_test` is a separate
database and nothing points at it.

```bash
docker exec production-database-1 psql -U bookyourslot -c "DROP DATABASE restore_test;"
```

## A5. Get a copy off the box

*20 minutes, once you have somewhere to put it.*

`/root/backups` and `/opt/bookyourslot/backups` are both on the same volume as the
Postgres data. That survives a bad deploy or a dropped table. It does not survive the
disk.

**This one needs a decision from you before it is work.** `rclone` is not installed and
no remotes are configured. Pick a destination: Backblaze B2 is the cheapest sensible one,
S3 if you already have an account, or another machine you control via `scp`.

Once you have chosen, install and configure it:

```bash
ssh root@2.25.89.115 'curl -fsSL https://rclone.org/install.sh | bash'
```

```bash
ssh root@2.25.89.115 'rclone config'
```

Then append one line to the cron job from A2, after the `mv`, so the copy runs only when
the dump succeeded:

```
&& rclone copy /root/backups/bys-$(date +\%F).sql.gz REMOTE:bookyourslot-backups/
```

Do not put the remote's credentials in the repository. `rclone config` keeps them in
`/root/.config/rclone/rclone.conf` on the box, which is where they belong.

---

# Part B. After PR #56 merges

Merged and deployed on 7 September 2026 as `sha-5fa3431`. The holiday fix went out with
it. The voice fix did not, because n8n is not part of the deploy.

## B1. Re-import the voice workflow

*10 minutes.* **Nothing else in this part matters until you do this.**

**Confirmed still outstanding.** Checked the live workflow against the repo:
`continueRegularOutput` 0 vs 1, `cannot see the calendar` 0 vs 1, `res.body` 1 vs 2. The
n8n list agreeing, "Last updated 17 hours ago" against a fix merged the same night.

`automations/bookyourslot-retell-voice.n8n.json` is a checked-in export, **not deployed
config**. Merging the availability fix does nothing to live calls. Until you import it, a
failed slots lookup still returns an empty body and a caller still hears silence.

Open `http://100.91.157.6:5678/` on the tailnet, then:

1. Open the **existing** "BookYourSlot voice booking (Retell)" workflow and import into
   it. A fresh import creates a *second* workflow claiming `bookyourslot/availability`,
   the old active one keeps winning, and you will believe you shipped.
2. **Re-activate afterwards.** The file carries `"active": false`, and webhooks 404 while
   a workflow is inactive without n8n warning you.
3. **Re-enter the client config.** Both `Client config` nodes hold per-client values and
   the committed copy is `startwithleo` / `America/Detroit`. Importing over a configured
   client overwrites them.

Then verify from anywhere. Both webhooks are **POST only**, so a GET returns 404 even
when everything is healthy:

```bash
curl -s -X POST https://bookyourslot.online/webhook/bookyourslot/availability \
  -H 'Content-Type: application/json' -d '{"args":{}}' -w '\nHTTP %{http_code}\n'
```

**Success looks like:** HTTP 200 and a `spoken` field naming real times.

**Failure looks like:** HTTP 200 with `"I cannot see the calendar right now"`. That means
the response path in the formatting node is wrong, and every caller would hear that
sentence forever while the workflow looks perfectly healthy. Tell me if you see it.

## B2. Confirm the holidays page stopped erroring

*2 minutes.* **Deployed.** No action needed, but worth one look because it was customer
visible.

Open Settings, Out of office, Holidays while logged in.

**Before:** a red alert reading `GOOGLE_CALENDAR_API_KEY environment variable is not set`.

**After:** the page loads and the country dropdown is populated. Picking a country saves
and shows "no holidays found", which is true: the key is still unset, so no holidays are
fetched. Setting `GOOGLE_CALENDAR_API_KEY` in the env file is what makes the feature
actually work, and that is backlog 13c.

---

# Part C. Worth doing, no deadline

## C1. Alert when reminders stop

*30 minutes.*

The schedulers are active. If n8n is stopped, paused, or the Header Auth credential
expires, reminders stop and **the only symptom is silence**. The uptime monitor watches
the booking page, not the schedulers.

In n8n, create an error workflow and attach it to the four HTTP nodes in
`BookYourSlot schedulers`. Point it at the same Telegram chat the deploy alert uses.

To check by hand in the meantime, note the container log is short lived and a restart
clears it, so a zero here right after a deploy means nothing:

```bash
ssh root@2.25.89.115 'docker logs production-bookyourslot-1 --since 24h 2>&1 | grep -c "attendeeReminder"'
```

## C2. Rotate the Postgres password

*30 minutes, brief downtime.* **The riskiest thing on this page. Do A4 first so you have
a restore you trust.**

It was printed into an assistant transcript. Postgres is reachable only over the tailnet
and the internal Docker network, never publicly, so this is hygiene, not an emergency.

`POSTGRES_PASSWORD` only applies at **first init**. Changing the env var alone does
nothing to an existing volume, which is the trap. The order matters:

1. Generate a password yourself. Do not send it to me, and do not paste it into a chat.

   ```bash
   openssl rand -base64 24
   ```

2. Change it inside the running database:

   ```bash
   docker exec -it production-database-1 psql -U bookyourslot -c "ALTER USER bookyourslot WITH PASSWORD 'NEW_PASSWORD_HERE';"
   ```

3. Edit `/opt/bookyourslot/deploy/production/.env` and update **three** values to match:
   `POSTGRES_PASSWORD`, `DATABASE_URL`, and `DATABASE_DIRECT_URL`. The last two embed the
   password in the connection string, and missing one is how this goes wrong.

4. Restart, from the compose directory:

   ```bash
   cd /opt/bookyourslot/deploy/production && docker compose up -d
   ```

5. Confirm the app came back:

   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' https://bookyourslot.online/
   ```

If the app fails to start, the password in `DATABASE_URL` does not match what you set in
step 2. Fix the env file rather than rolling back the database.

## C3. Branch protection

*Minutes, plus a spending decision.*

CI is currently **advisory**: a red PR can be merged and `main` can be pushed to directly.
Verified still blocked today:

```bash
gh api repos/squid-beast/bookyourslot/branches/main/protection
```

Returns 403, "Upgrade to GitHub Pro or make this repository public to enable this
feature." Three options and no technical fourth: pay for Pro, make the repository public,
or accept it and rely on discipline.

## C4. Search Console and Bing

*30 minutes.* Indexing takes weeks to earn, so the clock only starts once the sitemap is
submitted. Nothing depends on this, which is why it is last.

## C5. Turn on call transfer

*30 minutes for the first client, 5 for each after.*

Specified in [BACKLOG.md](BACKLOG.md) item 16 and in
[../automations/retell-agent-script.md](../automations/retell-agent-script.md) under
"Not enabled yet: transfer to a human". Follow it there rather than a summary here.

The one thing worth repeating: the prompt line "Never claim you can transfer" is accurate
while this is off, and it is the thing that must change when it is on. A tool added
without the prompt edits is a tool the model never invokes.

---

## After the runbook: test it

Once Part B is done, work through [VOICE-TEST-PLAN.md](VOICE-TEST-PLAN.md). It covers the
phone path end to end, the reminders, and the regressions worth re-checking, with a bug
log to fill in as you go.

Two things that page will ask for and this one does not cover, because they live outside
the VPS entirely: the Retell agent prompt and its two function URLs, and the calendar
event name setting on each event type. Both were still unset as of 7 September.

## Related

- [VOICE-TEST-PLAN.md](VOICE-TEST-PLAN.md), the testing session
- [BACKLOG.md](BACKLOG.md), the items and why each matters
- [VOICE-BOOKING-RUNBOOK.md](VOICE-BOOKING-RUNBOOK.md), setting up a new voice client
- [N8N-REMINDERS.md](N8N-REMINDERS.md), the reminder bands
- [../deploy/production/README.md](../deploy/production/README.md), the full deploy reference
