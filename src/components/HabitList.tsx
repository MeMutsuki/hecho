import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { archiveHabit, db, toggleLog, updateHabit } from '../db/db';
import { useToday } from '../lib/useToday';
import type { Habit } from '../types';

/**
 * 登録済みの習慣を order 順に並べる。
 * アーカイブ済み（archivedAt あり）は一覧から外す。削除ではないのでログは残る。
 *
 * 各行がそのまま「今日やった」の記録ボタン。タップで toggleLog が走る。
 * 確認ダイアログは挟まない（押し間違えてももう一度押せば取り消せる）。
 *
 * 行末の「編集」から名前・絵文字の修正とアーカイブができる。
 * アーカイブは削除ではなく archivedAt を立てるだけなので、過去のログは残る。
 * アーカイブ済みを表示に戻す切り替えは v1 では作らない（FUTURE.md）。
 */
export function HabitList() {
  // 深夜0時をまたいでも新しい日付を見るように、フック経由で「今日」を取る
  const today = useToday();
  // 編集フォームを開いている習慣の id。同時に開くのは 1 件だけ。
  const [editingId, setEditingId] = useState<string | null>(null);

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
        if (editingId === h.id) {
          return (
            <li key={h.id} className="habit-list__item">
              <HabitEditRow habit={h} onClose={() => setEditingId(null)} />
            </li>
          );
        }
        const done = doneToday.has(h.id);
        return (
          <li key={h.id} className="habit-list__item">
            <div className="habit-list__row">
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
              <button
                type="button"
                className="habit-list__edit"
                onClick={() => setEditingId(h.id)}
                aria-label={`${h.name}を編集`}
              >
                編集
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * 名前・絵文字の編集とアーカイブ。色と並び順はここでは触らない。
 * アーカイブは戻す導線がまだ無いので、今日の記録と違って一度だけ確認する。
 */
function HabitEditRow({ habit, onClose }: { habit: Habit; onClose: () => void }) {
  const [name, setName] = useState(habit.name);
  const [emoji, setEmoji] = useState(habit.emoji);

  const trimmedName = name.trim();
  const trimmedEmoji = emoji.trim();
  const canSave = trimmedName !== '' && trimmedEmoji !== '';

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    await updateHabit(habit.id, { name: trimmedName, emoji: trimmedEmoji });
    onClose();
  }

  async function handleArchive() {
    if (!window.confirm(`「${habit.name}」をアーカイブしますか？ 記録は残ります。`)) return;
    await archiveHabit(habit.id);
    onClose();
  }

  return (
    <form className="habit-edit" onSubmit={handleSave}>
      <div className="habit-edit__row">
        <input
          className="habit-edit__emoji"
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="🧺"
          aria-label="絵文字"
        />
        <input
          className="habit-edit__name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="習慣の名前"
          aria-label="名前"
        />
      </div>
      <div className="habit-edit__actions">
        <button className="btn" type="submit" disabled={!canSave}>
          保存
        </button>
        <button className="btn" type="button" onClick={onClose}>
          キャンセル
        </button>
        <button className="habit-edit__archive" type="button" onClick={handleArchive}>
          アーカイブ
        </button>
      </div>
    </form>
  );
}
