const fs = require('fs');
const path = require('path');

// Generate placeholder icons for different sizes
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

const createIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="256" cy="256" r="240" fill="url(#gradient)" />
    <rect x="150" y="120" width="212" height="272" rx="12" ry="12" fill="white" opacity="0.95"/>
    <line x1="170" y1="160" x2="342" y2="160" stroke="#E5E7EB" stroke-width="2"/>
    <line x1="170" y1="190" x2="342" y2="190" stroke="#E5E7EB" stroke-width="2"/>
    <line x1="170" y1="220" x2="320" y2="220" stroke="#E5E7EB" stroke-width="2"/>
    <line x1="170" y1="250" x2="340" y2="250" stroke="#E5E7EB" stroke-width="2"/>
    <line x1="170" y1="280" x2="310" y2="280" stroke="#E5E7EB" stroke-width="2"/>
    <circle cx="256" cy="330" r="30" fill="#3B82F6" opacity="0.1"/>
    <text x="256" y="340" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#3B82F6">AI</text>
    <circle cx="190" cy="180" r="3" fill="#F59E0B"/>
    <circle cx="310" cy="200" r="2" fill="#EF4444"/>
    <circle cx="200" cy="340" r="2" fill="#10B981"/>
    <circle cx="320" cy="320" r="3" fill="#8B5CF6"/>
  </svg>`;
};

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons for each size
sizes.forEach(size => {
  const iconContent = createIcon(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png`), iconContent);
  console.log(`Generated icon-${size}x${size}.png`);
});

// Copy the main icon
const mainIcon = createIcon(512);
fs.writeFileSync(path.join(__dirname, '../public/icons/icon-512x512.png'), mainIcon);

console.log('Icon generation completed!');
console.log('Note: These are SVG files with .png extension for development.');
console.log('For production, convert them to actual PNG files using an image processing tool.');