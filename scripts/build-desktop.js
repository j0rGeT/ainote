const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🖥️  Building desktop applications...');

// First build the web app
try {
  console.log('📦 Building web application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Web build completed successfully');
} catch (error) {
  console.error('❌ Web build failed:', error.message);
  process.exit(1);
}

// Check if electron dependencies are installed
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const hasElectron = packageJson.devDependencies?.electron;
const hasElectronBuilder = packageJson.devDependencies?.['electron-builder'];

if (!hasElectron || !hasElectronBuilder) {
  console.log('⚠️  Installing missing Electron dependencies...');
  try {
    execSync('npm install --save-dev electron electron-builder concurrently wait-on', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    console.log('Please run: npm install --save-dev electron electron-builder concurrently wait-on');
    process.exit(1);
  }
}

// Determine platform and build accordingly
const platform = os.platform();
const arch = os.arch();

console.log(`🔍 Detected platform: ${platform} (${arch})`);

const buildCommands = {
  darwin: ['--mac'],
  win32: ['--win'],
  linux: ['--linux']
};

const supportedArches = {
  darwin: ['x64', 'arm64'],
  win32: ['x64', 'ia32'],
  linux: ['x64']
};

function buildForPlatform(targetPlatform, flags = []) {
  const platformName = {
    darwin: '🍎 macOS',
    win32: '🪟 Windows', 
    linux: '🐧 Linux'
  }[targetPlatform];

  console.log(`\n${platformName} build starting...`);
  
  try {
    const command = `electron-builder ${flags.join(' ')}`;
    console.log(`Running: ${command}`);
    execSync(`npm run build && ${command}`, { stdio: 'inherit' });
    console.log(`✅ ${platformName} build completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${platformName} build failed:`, error.message);
    return false;
  }
}

// Build for current platform by default
const currentPlatformFlags = buildCommands[platform];
if (!currentPlatformFlags) {
  console.error(`❌ Unsupported platform: ${platform}`);
  process.exit(1);
}

// Check for command line arguments
const args = process.argv.slice(2);
const buildAll = args.includes('--all');
const specific = args.find(arg => ['--mac', '--win', '--linux'].includes(arg));

let results = [];

if (buildAll) {
  console.log('🚀 Building for all platforms...');
  
  // Build for all platforms (requires proper setup for cross-compilation)
  results.push({
    platform: 'macOS',
    success: buildForPlatform('darwin', ['--mac'])
  });
  
  results.push({
    platform: 'Windows', 
    success: buildForPlatform('win32', ['--win'])
  });
  
  results.push({
    platform: 'Linux',
    success: buildForPlatform('linux', ['--linux'])
  });
  
} else if (specific) {
  console.log(`🎯 Building for specific platform: ${specific}`);
  
  const platformMap = {
    '--mac': 'darwin',
    '--win': 'win32', 
    '--linux': 'linux'
  };
  
  const targetPlatform = platformMap[specific];
  results.push({
    platform: specific.replace('--', ''),
    success: buildForPlatform(targetPlatform, [specific])
  });
  
} else {
  console.log(`🎯 Building for current platform: ${platform}`);
  results.push({
    platform: platform,
    success: buildForPlatform(platform, currentPlatformFlags)
  });
}

// Summary
console.log('\n📋 Build Summary:');
console.log('==================');

results.forEach(({ platform, success }) => {
  const status = success ? '✅ SUCCESS' : '❌ FAILED';
  console.log(`${platform}: ${status}`);
});

const successful = results.filter(r => r.success).length;
const total = results.length;

console.log(`\n🎉 ${successful}/${total} builds completed successfully`);

if (successful > 0) {
  console.log('📁 Output directory: dist-electron/');
  console.log('\n📋 Installation files:');
  
  if (results.find(r => r.platform.includes('mac') || r.platform === 'darwin') && results.find(r => r.success)) {
    console.log('🍎 macOS: .dmg and .zip files');
  }
  if (results.find(r => r.platform.includes('win') || r.platform === 'win32') && results.find(r => r.success)) {
    console.log('🪟 Windows: .exe installer and portable .exe');
  }
  if (results.find(r => r.platform.includes('linux')) && results.find(r => r.success)) {
    console.log('🐧 Linux: .AppImage, .deb, and .rpm packages');
  }
}

process.exit(successful === total ? 0 : 1);