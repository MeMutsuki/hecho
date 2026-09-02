import { useLayoutEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, logId } from '../db/db';
import { recentDateKeys, shortLabel, todayKey } from '../lib/date';

/** タイムラインに映す日数。直近この日数ぶんを右端＝今日で並べる。 */
const DAYS = 30;

/**
 * 行 = 習慣 / 列 = 日付 の横スクロールタイムライン。
 *
 * レイアウトは単一の CSS Grid。左端の習慣ラベル列とヘッダ行は position: sticky で
 * スクロールに追従させる。行ラッパを挟まずセルをすべて Grid 直下に置くのは、
 * display: contents を経由すると Safari で sticky が崩れることがあるため。
 *
 * やっていない日は空セルのまま。× も薄いプレースホルダも置かない
 * （「やっていない」を強調しないのがこのアプリの方針）。
 * セルのタップによる遡り入力はまだ作らない。
 */
export function Timeline() {
  const dates = recentDateKeys(DAYS);
  const today = todayKey();

  const habits = useLiveQuery(
    () =>
      db.habits
        .orderBy('order')
        .filter((h) => !h.archivedAt)
        .toArray(),
    [],
  );

  // 表示範囲の記録だけ購読する。キーは logId と同じ `${habitId}:${date}`。
  const doneKeys = useLiveQuery(
    async () => {
      const first = dates[0];
      const last = dates[dates.length - 1];
      const logs = await db.logs.where('date').between(first, last, true, true).toArray();
      return new Set(logs.map((l) => logId(l.habitId, l.date)));
    },
    [dates[0], dates[dates.length - 1]],
  );

  // 初期表示は右端（＝今日）に寄せる。描画直後に一度だけ。
  const scrollerRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [habits?.length]);

  if (habits === undefined || doneKeys === undefined) return null;

  if (habits.length === 0) {
    return <p className="muted">習慣を追加するとここにタイムラインが出ます。</p>;
  }

  return (
    <div className="timeline" ref={scrollerRef}>
      <div
        className="timeline__grid"
        style={{ gridTemplateColumns: `var(--tl-label-w) repeat(${DAYS}, var(--tl-cell-w))` }}
      >
        {/* ヘッダ行 */}
        <div className="timeline__corner" />
        {dates.map((d) => (
          <div
            key={d}
            className={'timeline__head' + (d === today ? ' is-today' : '')}
          >
            {shortLabel(d)}
          </div>
        ))}

        {/* 習慣ごとの行 */}
        {habits.map((h) => (
          <Row key={h.id} emoji={h.emoji} name={h.name} color={h.color}>
            {dates.map((d) => {
              const done = doneKeys.has(logId(h.id, d));
              return (
                <div
                  key={d}
                  className={'timeline__cell' + (d === today ? ' is-today' : '')}
                >
                  {done && (
                    <span
                      className="timeline__mark"
                      style={{ background: h.color }}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </Row>
        ))}
      </div>
    </div>
  );
}

function Row({
  emoji,
  name,
  color,
  children,
}: {
  emoji: string;
  name: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="timeline__label">
        <span className="timeline__dot" style={{ background: color }} aria-hidden="true" />
        <span className="timeline__emoji">{emoji}</span>
        <span className="timeline__name">{name}</span>
      </div>
      {children}
    </>
  );
}
