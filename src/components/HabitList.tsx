import { useLiveQuery } from 'dexie-react-hooks';
import { db, toggleLog } from '../db/db';
import { useToday } from '../lib/useToday';

/**
 * 登録済みの習慣を order 順に並べる。
 * アーカイブ済み（archivedAt あり）は一覧から外す。削除ではないのでログは残る。
 *
 * 各行がそのまま「今日やった」の記録ボタン。タップで toggleLog が走る。
 * 確認ダイアログは挟まない（押し間違えてももう一度押せば取り消せる）。
 * 遡り入力とタイムラインはまだ作らない。
 */
export function HabitList() {
  // 深夜0時をまたいでも新しい日付を見るように、フック経由で「今日」を取る
  const today = useToday();

  const habits = useLiveQuery(
    () =>
      db.habits
        .orderBy('order')
        .filter((h) => !h.archivedAt)
        .toArray(),
    [],
  );

  // 今日の分だけ購読して、どの行が記録済みかを判定する
  const doneToday = useLiveQuery(async () => {
    const logs = await db.logs.where('date').equals(today).toArray();
    return new Set(logs.map((l) => l.habitId));
  }, [today]);

  if (habits === undefined || doneToday === undefined) return null;

  if (habits.length === 0) {
    return <p className="muted">まだ習慣がありません。上のフォームから追加してください。</p>;
  }

  return (
    <ul className="habit-list">
      {habits.map((h) => {
        const done = doneToday.has(h.id);
        return (
          <li key={h.id} className="habit-list__item">
            <button
              type="button"
              className={'habit-row' + (done ? ' is-done' : '')}
              aria-pressed={done}
              onClick={() => toggleLog(h.id, today)}
            >
              <span
                className="habit-list__dot"
                style={{ background: h.color }}
                aria-hidden="true"
              />
              <span className="habit-list__emoji">{h.emoji}</span>
              <span className="habit-list__name">{h.name}</span>
              <span className="habit-row__mark" aria-hidden="true">
                {done ? '✓' : ''}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
