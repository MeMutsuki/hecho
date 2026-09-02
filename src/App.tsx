import { useLiveQuery } from 'dexie-react-hooks';
import { db, toggleLog } from './db/db';
import { todayKey, shortLabel } from './lib/date';

/**
 * v1 の骨格。ここはまだ本番の UI ではなく、
 * React → Dexie → 表示 が一周つながっていることを確認するための仮画面。
 * タイムライン実装時にまるごと差し替える。
 */
export default function App() {
  const today = todayKey();
  const logCount = useLiveQuery(() => db.logs.count(), [], 0);
  const habitCount = useLiveQuery(() => db.habits.count(), [], 0);

  return (
    <main className="app">
      <header className="header">
        <h1>hecho!</h1>
        <p className="tagline">やったことだけを記録する</p>
      </header>

      <section className="panel">
        <p className="muted">疎通確認用の仮画面です。</p>
        <dl className="stats">
          <div>
            <dt>今日</dt>
            <dd>{shortLabel(today)}</dd>
          </div>
          <div>
            <dt>習慣</dt>
            <dd>{habitCount}</dd>
          </div>
          <div>
            <dt>記録</dt>
            <dd>{logCount}</dd>
          </div>
        </dl>
        <button className="btn" onClick={() => void toggleLog('__smoke__', today)}>
          今日のテスト記録をトグル
        </button>
      </section>
    </main>
  );
}
