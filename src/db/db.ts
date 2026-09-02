import Dexie, { type Table } from 'dexie';
import type { Habit, Log } from '../types';

/**
 * ローカルのみで完結する IndexedDB。v1 ではサーバーに送らない。
 * 端末間同期が欲しくなったら v2 で外付けする（FUTURE.md 参照）。
 */
export class HechoDB extends Dexie {
  habits!: Table<Habit, string>;
  logs!: Table<Log, string>;

  constructor() {
    super('hecho');
    this.version(1).stores({
      habits: 'id, order, archivedAt',
      logs: 'id, habitId, date, [habitId+date]',
    });
  }
}

export const db = new HechoDB();

export function logId(habitId: string, date: string): string {
  return `${habitId}:${date}`;
}

/**
 * 習慣を 1 件登録する。
 * order は「既存の最大 + 1」にして常に一覧の末尾に積む。
 * アーカイブ済みも含めた最大値を見るのは、番号の再利用で並びが乱れるのを避けるため。
 */
export async function addHabit(input: {
  name: string;
  emoji: string;
  color: string;
}): Promise<string> {
  const last = await db.habits.orderBy('order').last();
  const id = crypto.randomUUID();
  await db.habits.add({
    id,
    name: input.name,
    emoji: input.emoji,
    color: input.color,
    order: last ? last.order + 1 : 0,
    createdAt: new Date().toISOString(),
  });
  return id;
}

/** 記録をつける / 取り消す。同じ日に二重には入らない。 */
export async function toggleLog(habitId: string, date: string): Promise<void> {
  const id = logId(habitId, date);
  const existing = await db.logs.get(id);
  if (existing) {
    await db.logs.delete(id);
  } else {
    await db.logs.add({ id, habitId, date, loggedAt: new Date().toISOString() });
  }
}
