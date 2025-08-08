# brain

minimal note-taking app with obsidian-like ux and notion-style editing

## features
- 🧠 clean, minimal interface  
- ⌨️ keyboard-first navigation
- 🎨 dark/light theme
- 📝 notion-style block editor
- 💾 auto-save with local persistence
- 🔍 instant search

## keyboard shortcuts
- `ctrl+k` - toggle shortcuts modal
- `ctrl+n` - new note
- `ctrl+/` - search notes
- `ctrl+enter` - focus editor
- `ctrl+delete` - delete current note
- `ctrl+b` - toggle theme
- `↑/↓` - navigate notes from search

## development
```bash
pnpm install
pnpm tauri dev
```

## build
```bash
# generate icons
pnpm generate-icons

# build for current platform
pnpm build-app
```

## automated builds
push a tag to trigger builds for all platforms:
```bash
git tag v0.1.0
git push origin v0.1.0
```

downloads will be available in github actions artifacts.

---
**brain** - think different 🧠