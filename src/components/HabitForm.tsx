import { useState } from 'react';
import { addHabit } from '../db/db';

/**
 * お団子の色の候補。自由入力にしないのは、
 * 隣り合う行で見分けがつく彩度・明度に揃えておきたいため。
 */
const COLORS = [
  '#f5c242',
  '#e8654f',
  '#6ec177',
  '#4f9de8',
  '#a97be0',
  '#e07bb0',
  '#5bc8c2',
  '#c0c0cc',
];

export function HabitForm() {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const trimmedName = name.trim();
  const trimmedEmoji = emoji.trim();
  const canSubmit = trimmedName !== '' && trimmedEmoji !== '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await addHabit({ name: trimmedName, emoji: trimmedEmoji, color });
    // 連続で登録できるように、色だけ残して入力をリセットする
    setName('');
    setEmoji('');
  }

  return (
    <form className="habit-form" onSubmit={handleSubmit}>
      <div className="habit-form__row">
        <input
          className="habit-form__emoji"
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="🧺"
          aria-label="絵文字"
        />
        <input
          className="habit-form__name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="習慣の名前（例: 洗濯）"
          aria-label="名前"
        />
      </div>

      <div className="habit-form__colors" role="radiogroup" aria-label="色">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={'habit-form__swatch' + (c === color ? ' is-selected' : '')}
            style={{ background: c }}
            onClick={() => setColor(c)}
            role="radio"
            aria-checked={c === color}
            aria-label={c}
          />
        ))}
      </div>

      <button className="btn" type="submit" disabled={!canSubmit}>
        追加する
      </button>
    </form>
  );
}
