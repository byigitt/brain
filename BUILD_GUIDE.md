# brain - build guide

## 🪟 Windows Build (already done!)
```bash
pnpm generate-icons  # generates all icons including proper .ico
pnpm build-app       # creates .exe and installers
```

Output:
- `src-tauri/target/release/brain.exe`
- `src-tauri/target/release/bundle/nsis/brain_0.1.0_x64-setup.exe`
- `src-tauri/target/release/bundle/msi/brain_0.1.0_x64_en-US.msi`

## 🐧 Linux Build

### Prerequisites
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Fedora/RHEL
sudo dnf install webkit2gtk3-devel \
    openssl-devel \
    curl \
    wget \
    libappindicator-gtk3-devel \
    librsvg2-devel

# Arch
sudo pacman -S webkit2gtk \
    base-devel \
    curl \
    wget \
    openssl \
    libappindicator-gtk3 \
    librsvg
```

### Build Commands
```bash
# Generate icons (if not done already)
pnpm generate-icons

# Build for Linux
pnpm build-app
```

Output:
- `src-tauri/target/release/brain` (executable)
- `src-tauri/target/release/bundle/deb/brain_0.1.0_amd64.deb` (Debian/Ubuntu)
- `src-tauri/target/release/bundle/appimage/brain_0.1.0_amd64.AppImage` (Universal)
- `src-tauri/target/release/bundle/rpm/brain-0.1.0-1.x86_64.rpm` (Fedora/RHEL)

## 🍎 macOS Build

### Prerequisites
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Rust if not already
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install pnpm if not already
npm install -g pnpm
```

### Build Commands
```bash
# Generate icons (if not done already)
pnpm generate-icons

# Build for macOS
pnpm build-app
```

Output:
- `src-tauri/target/release/brain` (executable)
- `src-tauri/target/release/bundle/macos/brain.app` (macOS App)
- `src-tauri/target/release/bundle/dmg/brain_0.1.0_x64.dmg` (Installer)

### Code Signing (Optional but Recommended for Distribution)
```bash
# Sign the app (replace "Developer ID" with your certificate)
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" \
    src-tauri/target/release/bundle/macos/brain.app

# Create notarized DMG for distribution
create-dmg \
    --volname "brain" \
    --window-pos 200 120 \
    --window-size 600 400 \
    --icon-size 100 \
    --icon "brain.app" 175 120 \
    --hide-extension "brain.app" \
    --app-drop-link 425 120 \
    "brain.dmg" \
    "src-tauri/target/release/bundle/macos/"
```

## 🐳 Docker Build (Cross-Platform)

Create `Dockerfile`:
```dockerfile
# Build stage
FROM rust:1.75 as builder

# Install Node.js and pnpm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm

# Install dependencies for Tauri
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source
COPY . .

# Build
RUN pnpm generate-icons && pnpm build-app

# Runtime stage
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.0-37 \
    libgtk-3-0 \
    libayatana-appindicator3-1 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/src-tauri/target/release/brain /usr/local/bin/brain

CMD ["brain"]
```

Build Docker image:
```bash
docker build -t brain-app .
docker run -it --rm brain-app
```

## 📦 Cross-Compilation (Build for All Platforms from One Machine)

### Using GitHub Actions (Recommended)

Create `.github/workflows/build.yml`:
```yaml
name: Build brain

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build:
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-20.04, windows-latest]
    
    runs-on: ${{ matrix.platform }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies (Ubuntu)
        if: matrix.platform == 'ubuntu-20.04'
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libayatana-appindicator3-dev librsvg2-dev
      
      - name: Install frontend dependencies
        run: pnpm install
      
      - name: Generate icons
        run: pnpm generate-icons
      
      - name: Build
        run: pnpm build-app
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: brain-${{ matrix.platform }}
          path: src-tauri/target/release/bundle/
```

Push a tag to trigger builds:
```bash
git tag v0.1.0
git push origin v0.1.0
```

## 🚀 Quick Commands Summary

```bash
# One-time setup
pnpm install
pnpm generate-icons

# Build for current platform
pnpm build-app

# Development
pnpm tauri dev

# Just frontend build
pnpm build

# Just Tauri build (after frontend is built)
pnpm tauri:build
```

## 📝 Notes

- Icons are automatically embedded in all platform builds
- The brain icon with gradient background will appear in:
  - Windows: Taskbar, Explorer, Start Menu
  - macOS: Dock, Finder, Launchpad
  - Linux: Application menu, dock (depends on DE)
- All builds are signed with a self-signed certificate by default
- For production distribution, proper code signing certificates are recommended

---
**brain** - think different 🧠