import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Convert month label like "3月" or "2026年3月" → date string "2026-03-01"
 * Assumes current year if only month number is given.
 */
export function getMonthDate(
  monthStr: string,
  currentYear?: number
): string {
  const y = currentYear ?? new Date().getFullYear();

  // Already "YYYY-MM-DD"
  const isoMatch = monthStr.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (isoMatch) return monthStr;

  // "2026年3月" or "2026年03月"
  const fullMatch = monthStr.match(/(\d{4})\s*年\s*(\d{1,2})\s*月/);
  if (fullMatch) {
    const m = fullMatch[2].padStart(2, "0");
    return `${fullMatch[1]}-${m}-01`;
  }

  // "3月" or "03月"
  const monthMatch = monthStr.match(/(\d{1,2})\s*月/);
  if (monthMatch) {
    const m = monthMatch[1].padStart(2, "0");
    return `${y}-${m}-01`;
  }

  throw new Error(`Cannot parse month: ${monthStr}`);
}

/**
 * Format date to "2026年3月"
 */
export function formatMonth(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

/**
 * Format minutes to "2小时30分"
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}小时`;
  return `${h}小时${m}分`;
}

/**
 * Parse duration input (e.g. "2小时30分" or "2.5" or "150") → minutes
 */
export function parseDuration(str: string): number {
  const trimmed = str.trim();

  // bare number = hours
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return Math.round(parseFloat(trimmed) * 60);
  }

  const hMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:小时|h)/);
  const mMatch = trimmed.match(/(\d+)\s*(?:分|m)/);

  const hours = hMatch ? parseFloat(hMatch[1]) : 0;
  const mins = mMatch ? parseInt(mMatch[1]) : 0;
  return Math.round(hours * 60 + mins);
}

/**
 * Format date as "2026-05-08"
 */
export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Get first day of month for a date string
 */
export function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7) + "-01";
}

/**
 * Get available months between skill creation and now
 */
export function getAvailableMonths(since: string): string[] {
  const start = new Date(getMonthKey(since) + "T00:00:00");
  const now = new Date();
  const months: string[] = [];

  const cursor = new Date(start);
  while (cursor <= now) {
    months.push(formatDate(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

/**
 * Today's date string
 */
export function today(): string {
  return formatDate(new Date());
}
