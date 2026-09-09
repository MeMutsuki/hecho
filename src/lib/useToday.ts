import { useEffect, useState } from 'react';
import { addDays, parseDateKey, todayKey } from './date';

/**
 * 現在の「今日」の日付キーを返す React フック。
 *
 * todayKey() は呼んだ瞬間の値なので、アプリを開いたまま深夜0時をまたぐと
 * Timeline / HabitList が古い日付を握りっぱなしになる。これを防ぐために
 *   - 次の0時ちょうどに仕掛けた setTimeout
 *   - タブがバックグラウンドから戻ったときの visibilitychange
 * の両方で日付を見直し、変わっていれば新しいキーで再レンダリングさせる。
 *
 * setTimeout はバックグラウンドタブや端末スリープ中は間引かれて発火が遅れる。
 * visibilitychange 側が「戻ってきた瞬間」の取りこぼしを拾う保険で、
 * さらにタイマーの待ち時間も最大1時間で頭打ちにして、ずれても定期的に見直す。
 */
export function useToday(): string {
  const [today, setToday] = useState(todayKey);

  useEffect(() => {
    let timer: number | undefined;

    const sync = () => {
      setToday((prev) => {
        const now = todayKey();
        return now === prev ? prev : now;
      });
      schedule();
    };

    const schedule = () => {
      if (timer !== undefined) clearTimeout(timer);
      const nextMidnight = parseDateKey(addDays(todayKey(), 1)).getTime();
      // +1秒 は0時を確実に過ぎてから発火させるため。1時間で頭打ちにして保険をかける。
      const delay = Math.min(nextMidnight - Date.now() + 1000, 60 * 60 * 1000);
      timer = window.setTimeout(sync, Math.max(delay, 0));
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') sync();
    };

    schedule();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      if (timer !== undefined) clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return today;
}
