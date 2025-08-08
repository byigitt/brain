<div align="center">
  <br />
  <img src="https://raw.githubusercontent.com/byigitt/brain/main/src-tauri/icons/icon.svg" alt="brain logo" width="200" height="200" />
  <br />
  <h1>brain</h1>
  <p><strong>minimal note-taking with obsidian-like ux and notion-style editing</strong></p>
  <p>
    <a href="#features">features</a> •
    <a href="#installation">installation</a> •
    <a href="#keyboard-shortcuts">shortcuts</a> •
    <a href="#development">development</a> •
    <a href="#building">building</a>
  </p>
  <br />
</div>

## ✨ features

<table>
<tr>
<td>

### 🎯 core
- **minimal design** - clean, distraction-free interface
- **keyboard-first** - navigate without touching your mouse
- **local storage** - your notes stay on your device
- **instant search** - find any note in milliseconds
- **auto-save** - never lose your work

</td>
<td>

### 🎨 editor
- **notion-style blocks** - rich text editing experience
- **dark/light themes** - easy on your eyes
- **focus mode** - distraction-free writing
- **font zoom** - ctrl+scroll to adjust size
- **resizable sidebar** - customize your workspace

</td>
</tr>
</table>

## 📦 installation

### download pre-built binaries

> **note**: binaries are automatically built via github actions for all platforms

<table>
<tr>
<th>platform</th>
<th>download</th>
<th>format</th>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Windows-0078D6?logo=windows&logoColor=white" /></td>
<td><a href="https://github.com/byigitt/brain/releases">latest release</a></td>
<td><code>.exe</code> / <code>.msi</code></td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/macOS-000000?logo=apple&logoColor=white" /></td>
<td><a href="https://github.com/byigitt/brain/releases">latest release</a></td>
<td><code>.dmg</code> / <code>.app</code></td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Linux-FCC624?logo=linux&logoColor=black" /></td>
<td><a href="https://github.com/byigitt/brain/releases">latest release</a></td>
<td><code>.deb</code> / <code>.AppImage</code></td>
</tr>
</table>

## ⌨️ keyboard shortcuts

<table>
<tr>
<th>action</th>
<th>shortcut</th>
<th>description</th>
</tr>
<tr>
<td><strong>new note</strong></td>
<td><kbd>ctrl</kbd> + <kbd>n</kbd></td>
<td>create a fresh note</td>
</tr>
<tr>
<td><strong>search</strong></td>
<td><kbd>ctrl</kbd> + <kbd>/</kbd></td>
<td>find notes instantly</td>
</tr>
<tr>
<td><strong>focus editor</strong></td>
<td><kbd>ctrl</kbd> + <kbd>enter</kbd></td>
<td>jump to editor</td>
</tr>
<tr>
<td><strong>delete note</strong></td>
<td><kbd>ctrl</kbd> + <kbd>delete</kbd></td>
<td>remove current note</td>
</tr>
<tr>
<td><strong>toggle theme</strong></td>
<td><kbd>ctrl</kbd> + <kbd>b</kbd></td>
<td>switch dark/light</td>
</tr>
<tr>
<td><strong>shortcuts help</strong></td>
<td><kbd>ctrl</kbd> + <kbd>k</kbd></td>
<td>show all shortcuts</td>
</tr>
<tr>
<td><strong>navigate</strong></td>
<td><kbd>↑</kbd> / <kbd>↓</kbd></td>
<td>move through notes</td>
</tr>
<tr>
<td><strong>zoom</strong></td>
<td><kbd>ctrl</kbd> + <kbd>scroll</kbd></td>
<td>adjust font size</td>
</tr>
</table>

## 🚀 development

### prerequisites
- **node.js** 20+ with pnpm
- **rust** (latest stable)
- **platform dependencies**:
  - windows: webview2 (pre-installed on win11)
  - linux: webkit2gtk, libgtk
  - macos: xcode command line tools

### setup

```bash
# clone the repository
git clone https://github.com/byigitt/brain.git
cd brain

# install dependencies
pnpm install

# run in development mode
pnpm tauri dev
```

## 🔨 building

### build for your platform

```bash
# generate app icons
pnpm generate-icons

# build the application
pnpm build-app
```

### automated ci/cd builds

the project uses github actions for automated cross-platform builds:

```bash
# tag a release
git tag v0.1.0
git push origin v0.1.0

# builds will be available in:
# github.com/byigitt/brain/actions
```

## 🏗️ tech stack

<table>
<tr>
<td align="center">
<img src="https://img.shields.io/badge/Tauri-24C8DB?logo=tauri&logoColor=white" /><br />
<strong>tauri</strong><br />
native desktop
</td>
<td align="center">
<img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" /><br />
<strong>react</strong><br />
ui framework
</td>
<td align="center">
<img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" /><br />
<strong>typescript</strong><br />
type safety
</td>
<td align="center">
<img src="https://img.shields.io/badge/BlockNote-000000?logoColor=white" /><br />
<strong>blocknote</strong><br />
notion-style editor
</td>
</tr>
</table>

## 📄 license

mit © 2025 byigitt

---

<div align="center">
  <strong>brain</strong> - think different 🧠
  <br />
  <sub>built with ❤️ using tauri + react</sub>
</div>