import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

/**
 * 登録済みの習慣を order 順に並べる。
 * アーカイブ済み（archivedAt あり）は一覧から外す。削除ではないのでログは残る。
 * ここでは表示だけ。記録やタイムラインはまだ作らない。
 */
export function HabitList() {
  const habits = useLiveQuery(
    () =>
      db.habits
        .orderBy('order')
        .filter((h) => !h.archivedAt)
        .toArray(),
    [],
  );

  if (habits === undefined) return null;

  if (habits.length === 0) {
    return <p className="muted">まだ習慣がありません。上のフォームから追加してください。</p>;
  }

  return (
    <ul className="habit-list">
      {habits.map((h) => (
        <li key={h.id} className="habit-list__item">
          <span className="habit-list__dot" style={{ background: h.color }} aria-hidden="true" />
          <span className="habit-list__emoji">{h.emoji}</span>
          <span className="habit-list__name">{h.name}</span>
        </li>
      ))}
    </ul>
  );
}
