/**
 * Smoke tests for report date presets (run: npm run test:reports-range).
 */
import { resolveReportRange, previousRange, pctDelta } from "../src/lib/reports/date-range";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const r30 = resolveReportRange({ preset: "last30", tz: "Europe/Tirane" });
assert(new Date(r30.from) < new Date(r30.to), "last30 from < to");

const prev = previousRange(r30);
assert(new Date(prev.to) < new Date(r30.from), "previous ends before current");

const custom = resolveReportRange({
  preset: "custom",
  from: "2026-01-01",
  to: "2026-01-31",
  tz: "Europe/Tirane",
});
assert(custom.preset === "custom", "custom preset");

assert(pctDelta(110, 100) === 10, "pct delta");

console.log("test:reports-range OK");
