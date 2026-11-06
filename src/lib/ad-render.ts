// Builds one advert card. Used by the live ad slots and by the admin preview, so what you preview is
// exactly what visitors see. Built with DOM methods (no innerHTML), and every image has fixed
// width/height so the card never shifts while the picture loads.
import { publicLabel, type AdLayout, type PublicAd } from '../../lib/ads/shared';

const h = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};

export function renderAd(ad: PublicAd, opts: { layout: AdLayout; href: string; preview?: boolean }): HTMLElement {
  const card = h('article', `ad ad--${opts.layout}`);
  card.dataset.adId = ad.id;
  if (ad.type === 'sponsored') card.dataset.sponsored = '';

  const media = h('div', 'ad__media');
  const img = h('img', 'ad__img');
  img.src = ad.image;
  img.srcset = `${ad.imageSm} 640w, ${ad.image} 1280w`;
  img.sizes = opts.layout === 'compact' ? '(min-width: 720px) 220px, 40vw' : opts.layout === 'grid' ? '(min-width: 900px) 380px, 100vw' : '(min-width: 900px) 520px, 100vw';
  img.width = 1280;
  img.height = 720;
  img.alt = ad.alt;
  img.loading = opts.preview ? 'eager' : 'lazy';
  img.decoding = 'async';
  media.append(img);

  const body = h('div', 'ad__body');
  const label = h('p', 'ad__label', publicLabel(ad.type));
  const title = h('h3', 'ad__title display', ad.title);
  body.append(label, title);
  if (ad.description) body.append(h('p', 'ad__text', ad.description));

  // The call-to-action link is stretched over the whole card (see ads.css), so the card has one link.
  const cta = h('a', 'ad__cta btn');
  cta.href = opts.href;
  cta.target = '_blank';
  cta.rel = ad.type === 'sponsored' ? 'sponsored noopener' : 'noopener';
  cta.append(ad.cta);
  const hidden = h('span', 'visually-hidden', ` ${ad.title} (opens in a new tab)`);
  cta.append(hidden);
  if (opts.preview) {
    cta.addEventListener('click', (e) => e.preventDefault());
    cta.tabIndex = -1;
  }
  body.append(cta);

  card.append(media, body);
  return card;
}
