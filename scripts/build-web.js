const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌐 Building web version...');

// Build the web app
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Web build completed successfully');
} catch (error) {
  console.error('❌ Web build failed:', error.message);
  process.exit(1);
}

// Copy additional files for web deployment
const distDir = path.join(__dirname, '../dist');

// Copy service worker
if (fs.existsSync(path.join(__dirname, '../public/sw.js'))) {
  fs.copyFileSync(
    path.join(__dirname, '../public/sw.js'),
    path.join(distDir, 'sw.js')
  );
  console.log('✅ Service worker copied');
}

// Copy manifest
if (fs.existsSync(path.join(__dirname, '../public/manifest.json'))) {
  fs.copyFileSync(
    path.join(__dirname, '../public/manifest.json'),
    path.join(distDir, 'manifest.json')
  );
  console.log('✅ Manifest copied');
}

// Copy icons directory
const iconsDir = path.join(__dirname, '../public/icons');
const distIconsDir = path.join(distDir, 'icons');

if (fs.existsSync(iconsDir)) {
  if (!fs.existsSync(distIconsDir)) {
    fs.mkdirSync(distIconsDir, { recursive: true });
  }
  
  const files = fs.readdirSync(iconsDir);
  files.forEach(file => {
    fs.copyFileSync(
      path.join(iconsDir, file),
      path.join(distIconsDir, file)
    );
  });
  console.log('✅ Icons copied');
}

console.log('🎉 Web build and deployment preparation completed!');
console.log('📁 Output directory: dist/');
console.log('🚀 Ready for deployment to web hosting service');