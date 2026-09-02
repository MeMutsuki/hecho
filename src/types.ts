/**
 * 習慣の定義。ユーザーが「記録したいこと」として登録するもの。
 * タイムライン上では 1 習慣 = 1 行 になる。
 */
export interface Habit {
  id: string;
  /** 表示名。例: 洗濯 */
  name: string;
  /** お団子の色 (hex)。行の識別に使う補助情報で、主たる識別子は emoji + name。 */
  color: string;
  /** 左端の固定ラベルに出すアイコン */
  emoji: string;
  /** 行の並び順。小さいほど上。 */
  order: number;
  /** ISO8601 */
  createdAt: string;
  /** 設定するとタイムラインから外れる。削除ではないので過去のログは残る。 */
  archivedAt?: string;
}

/**
 * 「やった」記録。1 習慣 × 1 日 につき最大 1 件。
 *
 * このアプリは未来のレコードを持たない。date に未来日を入れてはいけない。
 * 「積み残し」という状態がデータモデル上つくれないことが、このアプリの核。
 */
export interface Log {
  /** `${habitId}:${date}` — 同じ日に二重記録されないよう主キーで担保する */
  id: string;
  habitId: string;
  /** ローカルタイムゾーンでの 'YYYY-MM-DD' */
  date: string;
  /** 実際に記録ボタンを押した時刻 (ISO8601) */
  loggedAt: string;
}
