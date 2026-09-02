/**
 * 本番ビルドでのみ Service Worker を登録する。
 * 開発中に登録すると古いバンドルがキャッシュされて混乱するため。
 */
export function registerSW(): void {
  if (!import.meta.env.PROD) return;
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('SW registration failed', err);
    });
  });
}
