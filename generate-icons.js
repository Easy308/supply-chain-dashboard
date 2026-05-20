import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.35}" fill="white" opacity="0.2"/>
  <text x="${size * 0.5}" y="${size * 0.65}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.4}" fill="white">¥</text>
</svg>
`;

sizes.forEach(size => {
  const svg = svgIcon(size);
  const filename = `icon-${size}x${size}.png`;
  
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svg);
  console.log(`Created ${filename}.svg`);
});

const faviconSvg = svgIcon(192);
fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), faviconSvg);
console.log('Created favicon.svg');

console.log('Icons created! Note: For best compatibility, convert SVG to PNG using: npx svgo or online converters');
