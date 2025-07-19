# 🎨 Nala Color Palette Guide

## Current Color Scheme
- **Background**: `#151E31` (Dark Navy Blue)
- **Card/Container**: `#222C41` (Lighter Navy Blue)

## How to Change Colors

### 1. Quick Color Changes
Edit `src/app/globals.css` lines 48-50:

```css
:root {
  --background: #151e31;  /* Main background color */
  --card: #222c41;        /* Card/container color */
  --foreground: oklch(0.985 0.001 106.423); /* Text color */
}
```

### 2. Complete Color Palette Variables

| Variable | Current Value | Description |
|----------|---------------|-------------|
| `--background` | `#151e31` | Main page background |
| `--foreground` | `oklch(0.985 0.001 106.423)` | Main text color |
| `--card` | `#222c41` | Card backgrounds |
| `--card-foreground` | `oklch(0.985 0.001 106.423)` | Card text color |
| `--primary` | `oklch(0.216 0.006 56.043)` | Primary buttons/links |
| `--primary-foreground` | `oklch(0.985 0.001 106.423)` | Primary button text |
| `--secondary` | `oklch(0.97 0.001 106.424)` | Secondary elements |
| `--muted` | `oklch(0.97 0.001 106.424)` | Muted backgrounds |
| `--accent` | `oklch(0.97 0.001 106.424)` | Accent elements |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Error/danger color |
| `--border` | `oklch(0.923 0.003 48.717)` | Border color |

## 🎨 Color Palette Suggestions

### Option 1: Modern Dark Blue (Current)
```css
--background: #151e31;
--card: #222c41;
```

### Option 2: Deep Purple
```css
--background: #1a1625;
--card: #2d2438;
```

### Option 3: Dark Green
```css
--background: #0f1419;
--card: #1e2328;
```

### Option 4: Charcoal
```css
--background: #1a1a1a;
--card: #2a2a2a;
```

### Option 5: Midnight Blue
```css
--background: #0c1426;
--card: #1a2332;
```

## 🛠 How to Test Colors

1. Visit: `http://localhost:3000/component-test`
2. See all components with current colors
3. Modify `globals.css`
4. Refresh page to see changes
5. Check color palette section at bottom

## 📝 Color Format Options

You can use any of these formats:
- **Hex**: `#151e31`
- **RGB**: `rgb(21, 30, 49)`
- **HSL**: `hsl(218, 40%, 14%)`
- **OKLCH**: `oklch(0.147 0.004 49.25)` (recommended for better color science)

## 🎯 Quick Commands

### Install All Components (Already Done)
```bash
npx shadcn@latest add alert avatar badge breadcrumb calendar card checkbox dropdown-menu form hover-card menubar navigation-menu popover progress radio-group scroll-area select separator sheet skeleton slider switch table tabs textarea sonner toggle tooltip
```

### Install Individual Components
```bash
npx shadcn@latest add [component-name]
```

## 🔧 Testing Workflow

1. **Open Component Test Page**: `http://localhost:3000/component-test`
2. **Edit Colors**: Modify `src/app/globals.css`
3. **See Changes**: Refresh browser
4. **Test All Components**: Scroll through the showcase
5. **Check Color Palette**: View color swatches at bottom

## 📱 Responsive Testing

The component test page is split 50/50:
- **Left**: Sign-in form (real use case)
- **Right**: All components showcase

Test on different screen sizes to ensure colors work well across devices.
