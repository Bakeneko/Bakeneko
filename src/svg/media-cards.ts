const W = 220;
const H = 180;
const COVER_H = 130;
const TEXT_H = H - COVER_H;
const PAD = 10;
const MAX_LEN = 36;

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

export async function fetchCoverBase64(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    const buffer = await res.arrayBuffer();
    return `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;
  } catch {
    return null;
  }
}

export function mediaCardSvg(
  title: string,
  subtitle: string,
  icon: string,
  coverBase64: string | null,
  coverRatio = 0.59, // H/W of the cover; < COVER_H/W = landscape fills width, > = portrait fits height
): string {
  const wantedH = Math.round(W * coverRatio);
  let dW: number, dH: number, dX: number, dY: number;

  if (wantedH <= COVER_H) {
    // Landscape: fill card width, pinned to top
    dW = W;  dH = wantedH;
    dX = 0;  dY = 0;
  } else {
    // Portrait: fit cover height, center horizontally, pinned to top
    dH = COVER_H;  dW = Math.round(COVER_H / coverRatio);
    dX = Math.round((W - dW) / 2);  dY = 0;
  }

  const coverEl = coverBase64
    ? `<image href="${coverBase64}" x="${dX}" y="${dY}" width="${dW}" height="${dH}" preserveAspectRatio="xMidYMid slice"/>`
    : `<defs>
      <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1c2128"/>
        <stop offset="100%" stop-color="#163b6e"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${COVER_H}" fill="url(#cg)"/>
    <text x="${W / 2}" y="${COVER_H / 2}" text-anchor="middle" dominant-baseline="middle" font-size="36">${icon}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" rx="6" fill="#161b22"/>
  <clipPath id="cc"><rect width="${W}" height="${COVER_H}" rx="6"/></clipPath>
  <g clip-path="url(#cc)">${coverEl}</g>
  <rect y="${COVER_H}" width="${W}" height="${TEXT_H}" fill="#161b22"/>
  <text x="${PAD}" y="${COVER_H + 18}" font-size="11" font-weight="bold" font-family="sans-serif" fill="#e6edf3">${truncate(title, MAX_LEN)}</text>
  <text x="${PAD}" y="${COVER_H + 34}" font-size="10" font-family="sans-serif" fill="#8b949e">${truncate(subtitle, MAX_LEN)}</text>
</svg>`;
}
