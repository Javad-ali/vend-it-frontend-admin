# Code Formatter Setup

## ✅ Prettier Installed & Configured

### What Was Added

1. **Prettier** - Code formatter
2. **prettier-plugin-tailwindcss** - Auto-sort Tailwind classes
3. **Configuration files**:
   - `.prettierrc` - Prettier settings
   - `.prettierignore` - Files to skip
   - `.editorconfig` - Editor consistency
   - `.vscode/settings.json` - VS Code auto-format

### Scripts Available

```bash
# Format all files
npm run format

# Check formatting (no changes)
npm run format:check
```

### VS Code Setup

**Auto-format on save is enabled!**

Just save a file (`Cmd+S` / `Ctrl+S`) and it will auto-format.

### Configuration

**Line length:** 100 characters  
**Quotes:** Single quotes  
**Semicolons:** Yes  
**Trailing commas:** ES5  
**Tab width:** 2 spaces

### Manual Formatting

**In VS Code:**

- `Shift+Alt+F` (Windows)
- `Shift+Option+F` (Mac)

**Via Command Palette:**

1. `Cmd+Shift+P` / `Ctrl+Shift+P`
2. Type "Format Document"
3. Press Enter

### What Gets Formatted

✅ TypeScript/JavaScript files  
✅ TSX/JSX files  
✅ JSON files  
✅ CSS/SCSS files  
✅ Markdown files

### What Gets Skipped

❌ node_modules  
❌ .next build folder  
❌ Coverage reports  
❌ Lock files

---

**Your code will now be consistently formatted! 🎨**
