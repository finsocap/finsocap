import { parseFlexibleDate } from "./dateRangeHelper";

/**
 * Universal safe sort helper to ensure newest items always appear first (DESCENDING by Date or ID).
 * Never mutates original array.
 */
export function sortByNewest<T>(items: T[], dateExtractors?: ((item: T) => any)[]): T[] {
  if (!Array.isArray(items) || items.length <= 1) return Array.isArray(items) ? [...items] : [];

  return [...items].sort((a: any, b: any) => {
    // 1. Try provided custom date extractors
    if (dateExtractors && dateExtractors.length > 0) {
      for (const fn of dateExtractors) {
        try {
          const rawA = fn(a);
          const rawB = fn(b);
          const timeA = getTimeValue(rawA);
          const timeB = getTimeValue(rawB);
          if (timeA !== null && timeB !== null && timeA !== timeB) {
            return timeB - timeA;
          }
        } catch {}
      }
    }

    // 2. Default date fields lookup
    const dateFields = [
      "createdAt",
      "createdDate",
      "publishedAt",
      "taskDate",
      "date",
      "issueDate",
      "issue",
      "registeredAt",
      "paidAt",
      "updatedAt",
    ];

    for (const f of dateFields) {
      const timeA = getTimeValue(a?.[f]);
      const timeB = getTimeValue(b?.[f]);
      if (timeA !== null && timeB !== null && timeA !== timeB) {
        return timeB - timeA;
      }
    }

    // 3. Fallback to numeric / numeric ID (higher ID = newer)
    const numIdA = extractNumericId(a);
    const numIdB = extractNumericId(b);
    if (numIdA !== null && numIdB !== null && numIdA !== numIdB) {
      return numIdB - numIdA;
    }

    return 0;
  });
}

function getTimeValue(val: any): number | null {
  if (!val) return null;
  if (val instanceof Date) {
    const t = val.getTime();
    return isNaN(t) ? null : t;
  }
  if (typeof val === "number") {
    // If timestamp in seconds (10 digits) or ms (13 digits)
    if (val > 1000000000000) return val;
    if (val > 1000000000) return val * 1000;
  }
  if (typeof val === "string") {
    const d = parseFlexibleDate(val);
    if (d) return d.getTime();
  }
  return null;
}

function extractNumericId(item: any): number | null {
  if (!item) return null;
  if (typeof item.numericId === "number") return item.numericId;
  if (typeof item.id === "number") return item.id;
  if (typeof item.id === "string") {
    const digits = item.id.replace(/\D/g, "");
    if (digits.length > 0 && digits.length <= 15) {
      const n = Number(digits);
      if (!isNaN(n)) return n;
    }
  }
  return null;
}

