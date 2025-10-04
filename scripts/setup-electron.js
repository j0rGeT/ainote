const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('⚙️  Setting up Electron for cross-platform desktop app...');

// Check if Electron is already installed
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const hasElectron = packageJson.devDependencies?.electron;
const hasElectronBuilder = packageJson.devDependencies?.['electron-builder'];
const hasConcurrently = packageJson.devDependencies?.concurrently;
const hasWaitOn = packageJson.devDependencies?.['wait-on'];

if (hasElectron && hasElectronBuilder && hasConcurrently && hasWaitOn) {
  console.log('✅ All Electron dependencies are already installed!');
} else {
  console.log('📦 Installing Electron dependencies...');
  console.log('This may take a few minutes depending on your internet connection...');
  
  try {
    // Install only missing packages
    const missingPackages = [];
    if (!hasElectron) missingPackages.push('electron');
    if (!hasElectronBuilder) missingPackages.push('electron-builder');
    if (!hasConcurrently) missingPackages.push('concurrently');
    if (!hasWaitOn) missingPackages.push('wait-on');
    
    if (missingPackages.length > 0) {
      const installCommand = `npm install --save-dev ${missingPackages.join(' ')}`;
      console.log(`Running: ${installCommand}`);
      execSync(installCommand, { stdio: 'inherit' });
      console.log('✅ Dependencies installed successfully!');
    }
  } catch (error) {
    console.error('❌ Failed to install Electron dependencies:', error.message);
    console.log('\n🔧 Manual installation:');
    console.log('Run: npm install --save-dev electron electron-builder concurrently wait-on');
    process.exit(1);
  }
}

console.log('\n🚀 Electron setup completed!');
console.log('\n📋 Available commands:');
console.log('• npm run electron-dev      - Start development with Electron');
console.log('• npm run electron-build    - Build for current platform');  
console.log('• npm run electron-build-mac - Build for macOS');
console.log('• npm run electron-build-win - Build for Windows');
console.log('• npm run electron-build-linux - Build for Linux');
console.log('• node scripts/build-desktop.js --all - Build for all platforms');

console.log('\n🎯 Quick start:');
console.log('1. npm run electron-dev     (for development)');
console.log('2. npm run electron-build   (for production build)');

// Check if running on macOS and suggest next steps
const os = require('os');
if (os.platform() === 'darwin') {
  console.log('\n🍎 macOS detected - you can build .dmg installers for distribution!');
} else if (os.platform() === 'win32') {
  console.log('\n🪟 Windows detected - you can build .exe installers!');
} else {
  console.log('\n🐧 Linux detected - you can build .AppImage, .deb, and .rpm packages!');
}