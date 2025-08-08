import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧠 brain icon generator');
console.log('=======================\n');

// Create a proper app icon with background
const appIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="102" fill="url(#gradient)"/>
  <g transform="translate(256, 256) scale(14, 14)">
    <g transform="translate(-12, -12)" fill="#ffffff">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    </g>
  </g>
</svg>`;

// Ensure icons directory exists
const iconsDir = path.join(__dirname, 'src-tauri', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log('✅ Created icons directory');
}

// Save the SVG icon
const svgIconPath = path.join(iconsDir, 'icon.svg');
fs.writeFileSync(svgIconPath, appIconSvg);
console.log('✅ Created icon.svg');

async function generateIcons() {
  try {
    // Check if sharp is installed
    let sharp;
    try {
      sharp = await import('sharp');
      sharp = sharp.default;
      console.log('✅ Sharp is already installed\n');
    } catch (e) {
      console.log('📦 Installing sharp for image conversion...');
      await execAsync('pnpm add -D sharp');
      console.log('✅ Sharp installed successfully\n');
      sharp = (await import('sharp')).default;
    }

    const sizes = [
      { name: '32x32.png', size: 32 },
      { name: '128x128.png', size: 128 },
      { name: '128x128@2x.png', size: 256 },
      { name: 'icon.png', size: 512 },
      // Windows specific
      { name: 'Square30x30Logo.png', size: 30 },
      { name: 'Square44x44Logo.png', size: 44 },
      { name: 'Square71x71Logo.png', size: 71 },
      { name: 'Square89x89Logo.png', size: 89 },
      { name: 'Square107x107Logo.png', size: 107 },
      { name: 'Square142x142Logo.png', size: 142 },
      { name: 'Square150x150Logo.png', size: 150 },
      { name: 'Square284x284Logo.png', size: 284 },
      { name: 'Square310x310Logo.png', size: 310 },
      { name: 'StoreLogo.png', size: 50 },
    ];

    console.log('🎨 Generating PNG icons...\n');

    await Promise.all(
      sizes.map(async ({ name, size }) => {
        await sharp(Buffer.from(appIconSvg))
          .resize(size, size)
          .png()
          .toFile(path.join(iconsDir, name));
        console.log(`✅ Generated ${name} (${size}x${size})`);
      })
    );

    // Generate proper ICO file for Windows
    console.log('\n🪟 generating proper windows .ico file...');
    
    // Create PNG at 256x256 for the ICO
    const pngBuffer = await sharp(Buffer.from(appIconSvg))
      .resize(256, 256)
      .png()
      .toBuffer();

    // Create proper ICO file format
    const ico = Buffer.alloc(22 + 16 + pngBuffer.length);
    let offset = 0;

    // ICONDIR structure
    ico.writeUInt16LE(0, offset); offset += 2;  // Reserved
    ico.writeUInt16LE(1, offset); offset += 2;  // Type (1 = ICO)
    ico.writeUInt16LE(1, offset); offset += 2;  // Count (1 image)

    // ICONDIRENTRY structure
    ico.writeUInt8(0, offset); offset += 1;     // Width (0 = 256)
    ico.writeUInt8(0, offset); offset += 1;     // Height (0 = 256)
    ico.writeUInt8(0, offset); offset += 1;     // Color palette
    ico.writeUInt8(0, offset); offset += 1;     // Reserved
    ico.writeUInt16LE(1, offset); offset += 2;  // Color planes
    ico.writeUInt16LE(32, offset); offset += 2; // Bits per pixel
    ico.writeUInt32LE(pngBuffer.length, offset); offset += 4; // Size
    ico.writeUInt32LE(22, offset); offset += 4; // Offset to image data

    // PNG data
    pngBuffer.copy(ico, 22);

    // Write the proper ICO file
    fs.writeFileSync(path.join(iconsDir, 'icon.ico'), ico);
    console.log('✅ generated proper icon.ico');
    
    console.log('\n✨ All icons generated successfully!');
    console.log('\n🚀 Now you can run: pnpm build-app');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateIcons();