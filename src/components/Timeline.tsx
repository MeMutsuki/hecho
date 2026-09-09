import { useLayoutEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, logId, toggleLog } from '../db/db';
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
 * セルをタップすると toggleLog が走り、過去日にも遡って記録できる。
 * 今日より先の日付は表示範囲に含まれないが、念のためボタン自体も disabled にして
 * 「date に未来日を入れない」という制約をタイムライン側でも守る。
 *
 * 左端ラベルには「直近 DAYS 日で N 回」を出す。集計期間は表示している列と
 * そのまま一致するので、数字はその行に見えているお団子の数と読み替えられる。
 * 連続日数（ストリーク）は出さない。主役は累積の頻度。
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
  const doneKeys = useLiveQuery(async () => {
    const first = dates[0];
    const last = dates[dates.length - 1];
    const logs = await db.logs.where('date').between(first, last, true, true).toArray();
    return new Set(logs.map((l) => logId(l.habitId, l.date)));
  }, [dates[0], dates[dates.length - 1]]);

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
          <div key={d} className={'timeline__head' + (d === today ? ' is-today' : '')}>
            {shortLabel(d)}
          </div>
        ))}

        {/* 習慣ごとの行 */}
        {habits.map((h) => (
          <Row
            key={h.id}
            emoji={h.emoji}
            name={h.name}
            color={h.color}
            count={dates.reduce((n, d) => n + (doneKeys.has(logId(h.id, d)) ? 1 : 0), 0)}
          >
            {dates.map((d) => {
              const done = doneKeys.has(logId(h.id, d));
              const isFuture = d > today;
              return (
                <button
                  key={d}
                  type="button"
                  className={'timeline__cell' + (d === today ? ' is-today' : '')}
                  aria-pressed={done}
                  disabled={isFuture}
                  onClick={() => toggleLog(h.id, d)}
                >
                  {done && (
                    <span
                      className="timeline__mark"
                      style={{ background: h.color }}
                      aria-hidden="true"
                    />
                  )}
                </button>
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
  count,
  children,
}: {
  emoji: string;
  name: string;
  color: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="timeline__label">
        <span className="timeline__dot" style={{ background: color }} aria-hidden="true" />
        <span className="timeline__emoji">{emoji}</span>
        <span className="timeline__labeltext">
          <span className="timeline__name">{name}</span>
          <span className="timeline__freq">
            直近{DAYS}日で <strong>{count}</strong> 回
          </span>
        </span>
      </div>
      {children}
    </>
  );
}
