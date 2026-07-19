"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import classNames from "@calcom/ui/classNames";
import { Button } from "@calcom/ui/components/button";
import Link from "next/link";
import { useMemo, useState } from "react";

type BookingItem = RouterOutputs["viewer"]["bookings"]["get"]["bookings"][number];

const HOUR_HEIGHT = 48;
const TYPE_COLORS = [
  "bg-blue-600",
  "bg-emerald-700",
  "bg-rose-600",
  "bg-amber-600",
  "bg-violet-600",
  "bg-cyan-700",
];

function weekStartIndex(weekStart?: string) {
  if (weekStart === "Monday") return 1;
  if (weekStart === "Saturday") return 6;
  return 0;
}

export default function CalendarView() {
  const { t, i18n } = useLocale();
  const { data: me } = useMeQuery();
  const [offset, setOffset] = useState(0);
  const [mode, setMode] = useState<"week" | "day">("week");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const timeZone = me?.timeZone ?? dayjs.tz.guess();
  const dayCount = mode === "week" ? 7 : 1;

  const rangeStart = useMemo(() => {
    const base = dayjs().tz(timeZone).add(offset, mode);
    if (mode === "day") return base.startOf("day");
    const diff = (base.day() - weekStartIndex(me?.weekStart) + 7) % 7;
    return base.subtract(diff, "day").startOf("day");
  }, [timeZone, offset, mode, me?.weekStart]);
  const rangeEnd = useMemo(() => rangeStart.add(dayCount, "day"), [rangeStart, dayCount]);

  const query = trpc.viewer.bookings.get.useQuery(
    {
      limit: 100,
      offset: 0,
      filters: {
        afterStartDate: rangeStart.toISOString(),
        beforeEndDate: rangeEnd.toISOString(),
      },
    },
    { enabled: Boolean(me) }
  );

  const bookings = useMemo(
    () =>
      (query.data?.bookings ?? []).filter((booking) => String(booking.status).toLowerCase() !== "cancelled"),
    [query.data]
  );

  // Filter pills, derived from what actually has bookings in range
  const eventTypePills = useMemo(() => {
    const seen = new Map<string, string>();
    for (const booking of bookings) {
      const key = String(booking.eventType?.id ?? booking.title);
      if (!seen.has(key)) seen.set(key, booking.eventType?.title ?? booking.title);
    }
    return Array.from(seen.entries()).map(([key, label], index) => ({
      key,
      label,
      color: TYPE_COLORS[index % TYPE_COLORS.length],
    }));
  }, [bookings]);

  const colorByType = useMemo(
    () => new Map(eventTypePills.map((pill) => [pill.key, pill.color])),
    [eventTypePills]
  );

  const visibleBookings = useMemo(
    () =>
      typeFilter === "all"
        ? bookings
        : bookings.filter((booking) => String(booking.eventType?.id ?? booking.title) === typeFilter),
    [bookings, typeFilter]
  );

  // Hour range adapts to the data so late/early bookings never fall off the grid
  const [firstHour, lastHour] = useMemo(() => {
    let min = 8;
    let max = 18;
    for (const booking of visibleBookings) {
      min = Math.min(min, dayjs(booking.startTime).tz(timeZone).hour());
      max = Math.max(max, dayjs(booking.endTime).tz(timeZone).hour() + 1);
    }
    return [Math.max(0, min), Math.min(24, max)];
  }, [visibleBookings, timeZone]);

  const days = useMemo(
    () => Array.from({ length: dayCount }, (_, index) => rangeStart.add(index, "day")),
    [rangeStart, dayCount]
  );
  const hours = useMemo(
    () => Array.from({ length: lastHour - firstHour }, (_, index) => firstHour + index),
    [firstHour, lastHour]
  );

  const bookingsForDay = (day: dayjs.Dayjs) => {
    const dayBookings = visibleBookings
      .filter((booking) => dayjs(booking.startTime).tz(timeZone).isSame(day, "day"))
      .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf());

    // Greedy lane assignment so overlapping bookings sit side by side
    const laneEnds: number[] = [];
    return dayBookings.map((booking) => {
      const start = dayjs(booking.startTime).valueOf();
      let lane = laneEnds.findIndex((end) => end <= start);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(0);
      }
      laneEnds[lane] = dayjs(booking.endTime).valueOf();
      return { booking, lane, laneCount: () => laneEnds.length };
    });
  };

  const rangeLabel =
    mode === "week"
      ? `${rangeStart.format("D MMM")} – ${rangeEnd.subtract(1, "day").format("D MMM YYYY")}`
      : rangeStart.format("dddd, D MMM YYYY");

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button color="secondary" size="sm" onClick={() => setOffset((value) => value - 1)}>
            {t("previous")}
          </Button>
          <Button color="secondary" size="sm" onClick={() => setOffset(0)}>
            {t("today")}
          </Button>
          <Button color="secondary" size="sm" onClick={() => setOffset((value) => value + 1)}>
            {t("next")}
          </Button>
          <span className="text-emphasis ml-2 text-sm font-semibold">{rangeLabel}</span>
        </div>
        <div className="border-subtle flex rounded-lg border p-0.5">
          {(["week", "day"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value);
                setOffset(0);
              }}
              className={classNames(
                "rounded-md px-3 py-1 text-sm font-medium transition",
                mode === value ? "bg-emphasis text-emphasis" : "text-subtle hover:text-emphasis"
              )}>
              {t(value)}
            </button>
          ))}
        </div>
      </div>

      {/* Event-type filter */}
      {eventTypePills.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className={classNames(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              typeFilter === "all"
                ? "bg-inverted text-inverted border-transparent"
                : "border-subtle text-subtle hover:text-emphasis"
            )}>
            {t("all_event_types")}
          </button>
          {eventTypePills.map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setTypeFilter(typeFilter === pill.key ? "all" : pill.key)}
              className={classNames(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition",
                typeFilter === pill.key
                  ? "bg-inverted text-inverted border-transparent"
                  : "border-subtle text-subtle hover:text-emphasis"
              )}>
              <span className={classNames("h-2 w-2 rounded-full", pill.color)} />
              {pill.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="border-subtle bg-default overflow-x-auto rounded-xl border">
        <div
          className="grid min-w-[720px]"
          style={{ gridTemplateColumns: `56px repeat(${dayCount}, minmax(90px, 1fr))` }}>
          {/* Day headers */}
          <div className="border-subtle border-b" />
          {days.map((day) => {
            const isToday = day.isSame(dayjs().tz(timeZone), "day");
            return (
              <div
                key={day.toISOString()}
                className={classNames(
                  "border-subtle border-b border-l py-2 text-center text-xs font-semibold",
                  isToday ? "text-emphasis" : "text-subtle"
                )}>
                {day.locale(i18n.language).format("ddd")}{" "}
                <span
                  className={classNames(
                    "ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full tabular-nums",
                    isToday && "bg-inverted text-inverted"
                  )}>
                  {day.format("D")}
                </span>
              </div>
            );
          })}

          {/* Hour gutter + day columns */}
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="text-muted pr-2 text-right text-[10px] tabular-nums"
                style={{ height: HOUR_HEIGHT }}>
                <span className="relative -top-1.5">{String(hour).padStart(2, "0")}:00</span>
              </div>
            ))}
          </div>
          {days.map((day) => {
            const laid = bookingsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className="border-subtle relative border-l"
                style={{ height: hours.length * HOUR_HEIGHT }}>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-subtle/50 absolute inset-x-0 border-t"
                    style={{ top: (hour - firstHour) * HOUR_HEIGHT }}
                  />
                ))}
                {laid.map(({ booking, lane, laneCount }) => {
                  const start = dayjs(booking.startTime).tz(timeZone);
                  const end = dayjs(booking.endTime).tz(timeZone);
                  const top = ((start.hour() * 60 + start.minute()) / 60 - firstHour) * HOUR_HEIGHT;
                  const height = Math.max(22, (end.diff(start, "minute") / 60) * HOUR_HEIGHT - 2);
                  const lanes = laneCount();
                  const width = 100 / lanes;
                  const isPending = String(booking.status).toLowerCase() === "pending";
                  const color =
                    colorByType.get(String(booking.eventType?.id ?? booking.title)) ?? TYPE_COLORS[0];
                  return (
                    <Link
                      key={booking.id}
                      href={`/booking/${booking.uid}`}
                      title={`${booking.title} · ${start.format("HH:mm")}–${end.format("HH:mm")}`}
                      className={classNames(
                        "absolute overflow-hidden rounded-md px-1.5 py-0.5 text-[11px] leading-tight transition hover:z-10 hover:brightness-110",
                        isPending
                          ? "border-subtle text-emphasis border border-dashed bg-transparent"
                          : classNames(color, "text-white")
                      )}
                      style={{
                        top,
                        height,
                        left: `calc(${lane * width}% + 2px)`,
                        width: `calc(${width}% - 4px)`,
                      }}>
                      <span className="block truncate font-semibold">{booking.title}</span>
                      <span className={classNames("block truncate", !isPending && "opacity-80")}>
                        {start.format("HH:mm")}
                        {isPending && ` · ${t("unconfirmed")}`}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {query.isPending ? (
        <div className="bg-subtle h-6 w-56 animate-pulse rounded-md" />
      ) : (
        visibleBookings.length === 0 && <p className="text-subtle text-sm">{t("no_bookings_in_range")}</p>
      )}
    </div>
  );
}
