/**
 * Utility to check if a date string falls within a human-readable or ISO date range.
 * Supports:
 * - "01 Sep 2026 - 30 Sep 2026"
 * - "01 Jun 2026 - 03 Jun 2026"
 * - "Today", "Yesterday", "Last 7 Days"
 * - Single dates, ISO strings (YYYY-MM-DD), Date objects
 */

const MONTHS_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function parseFlexibleDate(s?: string | Date | null): Date | null {
  if (!s) return null;
  if (s instanceof Date) {
    return isNaN(s.getTime()) ? null : new Date(s.getFullYear(), s.getMonth(), s.getDate());
  }

  const clean = String(s).trim();
  if (!clean || clean === "—" || clean === "-") return null;

  const lower = clean.toLowerCase();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (lower === "today") return today;
  if (lower === "yesterday") {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return y;
  }

  // DD Mon YYYY e.g. "01 Jun 2026", "2 Sep 2026"
  const dmMatch = clean.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (dmMatch) {
    const mIdx = MONTHS_MAP[dmMatch[2].toLowerCase().slice(0, 3)];
    if (mIdx !== undefined) {
      return new Date(parseInt(dmMatch[3], 10), mIdx, parseInt(dmMatch[1], 10));
    }
  }

  // YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const parts = clean.slice(0, 10).split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  // DD/MM/YYYY
  const slashMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (slashMatch) {
    return new Date(parseInt(slashMatch[3], 10), parseInt(slashMatch[2], 10) - 1, parseInt(slashMatch[1], 10));
  }

  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  return null;
}

export function parseRangeBounds(rangeStr?: string | null): { start: Date; end: Date } | null {
  if (!rangeStr) return null;
  const clean = String(rangeStr).trim();
  if (!clean) return null;

  const lower = clean.toLowerCase();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (lower === "today") {
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    return { start: today, end };
  }

  if (lower === "yesterday") {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    const end = new Date(y);
    end.setHours(23, 59, 59, 999);
    return { start: y, end };
  }

  if (lower.includes("last 7 days")) {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // Check for split by "-" or "to" or "→"
  const splitParts = clean.split(/[-–—\u2192]|\s+to\s+/i).map(s => s.trim()).filter(Boolean);
  if (splitParts.length >= 2) {
    const start = parseFlexibleDate(splitParts[0]);
    const end = parseFlexibleDate(splitParts[1]);
    if (start && end) {
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
  }

  if (splitParts.length === 1) {
    const single = parseFlexibleDate(splitParts[0]);
    if (single) {
      const end = new Date(single);
      end.setHours(23, 59, 59, 999);
      return { start: single, end };
    }
  }

  return null;
}

/**
 * Get the current month range label dynamically (e.g. "01 Nov 2026 - 30 Nov 2026")
 */
export function getCurrentMonthRangeLabel(): string {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const toLabel = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return `${toLabel(startOfMonth)} - ${toLabel(endOfMonth)}`;
}

/**
 * Calculate overdue days dynamically from dueDate and task status.
 * If status is Completed or Cancelled, it is not overdue (returns 0).
 * Otherwise compares dueDate to today's date (at midnight).
 */
export function calculateOverdueDays(dueDate?: string | Date | null, status?: string | null): number {
  if (!dueDate) return 0;
  const normalizedStatus = String(status || "").toUpperCase();
  if (normalizedStatus === "COMPLETED" || normalizedStatus === "CANCELLED") {
    return 0;
  }

  const parsedDue = parseFlexibleDate(dueDate);
  if (!parsedDue) return 0;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = today.getTime() - parsedDue.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

export function isDateWithinRange(
  targetDate?: string | Date | null,
  rangeStr?: string | null
): boolean {
  if (!rangeStr) return true;
  const bounds = parseRangeBounds(rangeStr);
  if (!bounds) return true; // if range can't be parsed, don't accidentally hide all data

  if (!targetDate) return false;
  const parsedTarget = parseFlexibleDate(targetDate);
  if (!parsedTarget) return false;

  return parsedTarget >= bounds.start && parsedTarget <= bounds.end;
}
