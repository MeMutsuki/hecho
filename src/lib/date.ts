/**
 * 日付キーはすべてローカルタイムゾーンの 'YYYY-MM-DD'。
 * toISOString() は UTC に変換されて日付がずれるので使わないこと。
 */

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}

/** 古い順の日付キー配列を返す。最後の要素が今日。 */
export function recentDateKeys(days: number): string[] {
  const today = todayKey();
  return Array.from({ length: days }, (_, i) => addDays(today, i - days + 1));
}

/** タイムラインのヘッダ用。'9/2' の形。 */
export function shortLabel(key: string): string {
  const d = parseDateKey(key);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
