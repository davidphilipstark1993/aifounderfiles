// Fills every <section data-ad-slot> on the page. One request covers all slots on the page; an advert
// already shown in an earlier slot is skipped. An impression is counted only once an advert has been at
// least half on screen for a full second while the tab is visible.
import { slotConfig, type PublicAd } from '../../lib/ads/shared';
import { renderAd } from './ad-render';

interface Response {
  ads: Record<string, PublicAd>;
  slots: Record<string, string[]>;
}

const VIEW_RATIO = 0.5;
const VIEW_MS = 1000;

function track(adId: string, slot: string) {
  const body = JSON.stringify({ a: adId, p: slot });
  try {
    if (navigator.sendBeacon?.('/api/ad-event/', new Blob([body], { type: 'text/plain' }))) return;
  } catch {
    /* fall through to fetch */
  }
  fetch('/api/ad-event/', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
}

function watchImpression(card: HTMLElement, adId: string, slot: string) {
  let timer: number | undefined;
  let visible = false;
  const arm = () => {
    window.clearTimeout(timer);
    if (!visible || document.visibilityState !== 'visible') return;
    timer = window.setTimeout(() => {
      io.disconnect();
      document.removeEventListener('visibilitychange', arm);
      track(adId, slot);
    }, VIEW_MS);
  };
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting && e.intersectionRatio >= VIEW_RATIO);
      arm();
    },
    { threshold: [0, VIEW_RATIO] },
  );
  io.observe(card);
  document.addEventListener('visibilitychange', arm);
}

async function run() {
  const slots = [...document.querySelectorAll<HTMLElement>('[data-ad-slot]')];
  if (!slots.length) return;
  const keys = [...new Set(slots.map((s) => s.dataset.adSlot as string))];
  let data: Response;
  try {
    const res = await fetch(`/api/ads/?slots=${encodeURIComponent(keys.join(','))}`, { credentials: 'omit' });
    if (!res.ok) return;
    data = (await res.json()) as Response;
  } catch {
    return;
  }

  const shown = new Set<string>();
  for (const slot of slots) {
    const key = slot.dataset.adSlot as string;
    const cfg = slotConfig(key);
    if (!cfg) continue;
    const max = Math.min(Number(slot.dataset.adMax) || cfg.max, cfg.max);
    const ids = (data.slots[key] ?? []).filter((id) => !shown.has(id) && data.ads[id]).slice(0, max);
    if (!ids.length) continue;

    const list = slot.querySelector<HTMLElement>('[data-ad-list]');
    if (!list) continue;
    list.dataset.count = String(ids.length);
    for (const id of ids) {
      shown.add(id);
      const card = renderAd(data.ads[id], {
        layout: cfg.layout,
        href: `/api/ad-click/?a=${encodeURIComponent(id)}&p=${encodeURIComponent(key)}`,
      });
      list.append(card);
      watchImpression(card, id, key);
    }
    slot.hidden = false;
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
else run();
