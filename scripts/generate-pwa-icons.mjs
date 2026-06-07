import { writeFileSync } from 'fs';

function svgIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFE082"/>
      <stop offset="100%" style="stop-color:#E5A93C"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0B0B0F"/>
  <circle cx="${size * 0.5}" cy="${size * 0.38}" r="${size * 0.14}" fill="url(#g)"/>
  <polygon points="${size * 0.5},${size * 0.38} ${size * 0.584},${size * 0.68} ${size * 0.416},${size * 0.68}" fill="url(#g)" opacity="0.8"/>
</svg>`;
}

writeFileSync('public/pwa-192x192.png', svgIcon(192));
writeFileSync('public/pwa-512x512.png', svgIcon(512));
console.log('PWA icons generated');
