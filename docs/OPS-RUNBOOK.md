# Operator runbook

The backlog items that produce no diff. Each one is a thing only someone with access to
the VPS, the n8n editor, the GitHub billing page or the Retell dashboard can do.

Ordered by what bites first. **Each step is independent.** Nothing here waits on anything
else, so skip freely and come back. The only exception is step 0, which every step that
reads a file off the server depends on.

Times are honest estimates for the work itself, not including the waiting.

## 0. Pull the VPS checkout first

Measured 6 September 2026: `/opt/bookyourslot` was **33 commits behind `origin/main`**.

This matters more than it looks. The deploy pipeline updates the container image and
`IMAGE_TAG`. It never updates the source checkout, so everything read from disk at
runtime stays frozen: the compose files, `remote-deploy.sh`, the fonts directory, and the
backup cron documented in the box's own `deploy/production/README.md`. Installing that
cron by copying it off the server would install a stale line.

```bash
ssh root@2.25.89.115 'cd /opt/bookyourslot && git pull'
```

Check what you got:

```bash
ssh root@2.25.89.115 'cd /opt/bookyourslot && git log --oneline -1 && git rev-list --count HEAD..origin/main'
```

The count should read `0`. Do this before steps 1, 2, 3 and 5.

## 1. Nightly backup (backlog 1)

*10 minutes.* Nothing else here protects against losing customer bookings.

Today the only backups are pre-deploy snapshots, so **backup age equals deploy
frequency**. A quiet month means the newest copy of your customers' bookings is a month
old.

Create the directory first, because the redirection cannot:

```bash
ssh root@2.25.89.115 'mkdir -p /root/backups'
```

Then add the job with `crontab -e` on the box. The line lives in
`deploy/production/README.md` and carries three details that each cost a working backup
once already: `mkdir` first, `bash -o pipefail` so a failed `pg_dump` does not produce a
valid empty gzip, and `.part` then `mv` so a half written file can never be mistaken for
a good one.

Verify the next morning rather than trusting it:

```bash
ssh root@2.25.89.115 'ls -lh /root/backups/'
```

A file of a few hundred KB is right. A file of ~20 bytes is an empty gzip, which means
`pipefail` is missing.

## 2. Restore one backup (backlog 2)

*30 minutes, once.* A backup nobody has restored is a belief, not a recovery plan.

Restore the newest snapshot into a scratch database and count the bookings. The seven
existing pre-deploy snapshots predate the `--clean --if-exists` change, so they restore
only into an **empty** target.

```bash
ssh root@2.25.89.115 'docker exec production-database-1 psql -U bookyourslot -c "CREATE DATABASE restore_test;"'
```

Then pipe the newest dump into `restore_test` and confirm the row count matches
production. Drop the scratch database afterwards. Do not restore over the live one.

## 3. Copy backups off the box (backlog 3)

*20 minutes once you have somewhere to put them.*

`/root/backups` and `/opt/bookyourslot/backups` are both on the same volume as the
Postgres data. That survives a bad deploy or a dropped table. It does not survive the
disk.

**Blocked on a decision, not on work:** `rclone` is not installed and no remotes are
configured. Pick a destination first (Backblaze B2, S3, or another box you control),
then install `rclone`, configure the remote, and append one `rclone copy` to the backup
cron so it runs after the dump.

Do not put the credentials in the repository.

## 4. Alert when reminders stop (backlog 13b)

*30 minutes.*

The schedulers are active. If n8n is stopped, paused, or the Header Auth credential
expires, reminders stop and **the only symptom is silence**. The uptime monitor watches
the booking page, not the schedulers.

Cheapest version: an n8n error workflow attached to the four HTTP nodes in
`BookYourSlot schedulers`, posting to the same Telegram chat the deploy alert uses.

Stronger version: a daily check that the app container log contains recent
`attendeeReminder[` lines. Note the log is short lived, so a container restart clears it:

```bash
ssh root@2.25.89.115 'docker logs production-bookyourslot-1 --since 24h 2>&1 | grep -c "attendeeReminder"'
```

## 5. Rotate the Postgres password (backlog 11)

*30 minutes, brief downtime.*

It was printed into an assistant transcript. Postgres is reachable only over the tailnet
and the internal Docker network, never publicly, so this is hygiene rather than an
emergency.

`POSTGRES_PASSWORD` only applies at **first init**, so changing the env var alone does
nothing to an existing volume. The order is: `ALTER USER ... WITH PASSWORD` inside the
container, then update `DATABASE_URL` and `DATABASE_DIRECT_URL` in `.env`, then restart.

Never `docker compose down -v`. That deletes the volume.

## 6. Branch protection (backlog 6)

*Minutes, plus a subscription decision.*

Verified still returning 403 on 6 September 2026:

```bash
gh api repos/squid-beast/bookyourslot/branches/main/protection
```

> Upgrade to GitHub Pro or make this repository public to enable this feature.

So CI is **advisory**: a red PR can be merged and `main` can be pushed to directly. Either
pay for Pro, make the repository public, or accept it and rely on discipline. There is no
third technical option.

## 7. Search Console and Bing (backlog 15)

*30 minutes.* Indexing takes weeks to earn, so the clock only starts once the sitemap is
submitted. Nothing downstream depends on this, which is why it sits here rather than
higher.

## 8. Turn on call transfer (backlog 16)

*30 minutes for the first client, 5 for each after.*

Fully specified in [BACKLOG.md](BACKLOG.md) item 16 and in
[../automations/retell-agent-script.md](../automations/retell-agent-script.md) under
"Not enabled yet: transfer to a human". Follow it there rather than a summary here.

The one thing worth repeating: the prompt line "Never claim you can transfer" is accurate
while this is off, and it is the thing that must change when it is on. A tool added
without the prompt edits is a tool the model never invokes.

## Standing: re-import the voice workflow after a merge

`automations/bookyourslot-retell-voice.n8n.json` is a checked-in export, **not deployed
config**. Merging a change to it does nothing to live calls. The availability fallback
shipped in this PR is inert until you import it.

Four traps, each of which will let you believe you shipped when you did not:

1. **Import into the existing workflow**, not as a new one. A fresh import creates a
   second workflow claiming `bookyourslot/availability`; the old active one keeps winning.
2. **Re-activate afterwards.** The file carries `"active": false`, and webhooks 404 while
   a workflow is inactive without n8n warning you.
3. **Re-enter the client config.** Both `Client config` nodes hold per-client values and
   the committed copy is `startwithleo` / `America/Detroit`. Importing over a configured
   client overwrites them.
4. **Clear any pinned data** before exporting again. The committed file has
   `"pinData": {}` and must stay that way, or the repo ships fake slots.

Then verify against the live webhook. Both webhooks are POST only, so a GET returns 404
even when everything works:

```bash
curl -s -X POST https://bookyourslot.online/webhook/bookyourslot/availability \
  -H 'Content-Type: application/json' -d '{"args":{}}' -w '\nHTTP %{http_code}\n'
```

Expect 200 with real times in `spoken`. If it returns the "cannot see the calendar"
sentence, the response path in the formatting node is wrong and every caller will hear
that forever while the workflow looks healthy.

## Related

- [BACKLOG.md](BACKLOG.md), the items themselves and why each matters
- [VOICE-BOOKING-RUNBOOK.md](VOICE-BOOKING-RUNBOOK.md), setting up a new voice client
- [N8N-REMINDERS.md](N8N-REMINDERS.md), the reminder bands
- [../deploy/production/README.md](../deploy/production/README.md), the backup cron line
