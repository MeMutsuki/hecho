import { HabitForm } from './components/HabitForm';
import { HabitList } from './components/HabitList';
import { Timeline } from './components/Timeline';

/**
 * v1: 習慣の登録・今日の記録・横スクロールタイムライン。
 * 遡り入力と頻度表示は後続セッションで足す。
 */
export default function App() {
  return (
    <main className="app">
      <header className="header">
        <h1>hecho!</h1>
        <p className="tagline">やったことだけを記録する</p>
      </header>

      <section className="panel">
        <h2 className="panel__title">習慣を追加</h2>
        <HabitForm />
      </section>

      <section className="panel">
        <h2 className="panel__title">登録済みの習慣</h2>
        <HabitList />
      </section>

      <section className="panel">
        <h2 className="panel__title">タイムライン</h2>
        <Timeline />
      </section>
    </main>
  );
}
