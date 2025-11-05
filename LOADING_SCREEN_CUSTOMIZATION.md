# Loading Screen Customization Guide

## Overview
The loading screen appears before the "Start New Adventure" screen and displays a progress bar while the app initializes.

## Current Implementation
- **Component**: `src/ui/LoadingScreen.tsx`
- **Styles**: `src/ui/styles.css` (lines 617-754)
- **Current Display**: Animated sword icon (⚔️) with glowing effect

## How to Replace with a Custom Image

### Option 1: Replace the Icon with an Image
Edit `src/ui/LoadingScreen.tsx` around line 54-58:

**Current code:**
```tsx
<div className="loading-image-placeholder">
  <div className="loading-icon">⚔️</div>
  <div className="loading-icon-glow"></div>
</div>
```

**Replace with:**
```tsx
<div className="loading-image-placeholder">
  <img 
    src="/src/images/your-loading-image.png" 
    alt="Loading" 
    className="loading-image"
  />
  <div className="loading-icon-glow"></div>
</div>
```

### Option 2: Use a Background Image
Edit `src/ui/styles.css` around line 641-648:

**Current code:**
```css
.loading-image-placeholder {
  position: relative;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(100, 100, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(100, 100, 255, 0.3);
}
```

**Replace with:**
```css
.loading-image-placeholder {
  position: relative;
  width: 400px;
  height: 300px;
  background-image: url('/src/images/your-loading-image.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Add Image Styling (if using Option 1)
Add this to `src/ui/styles.css`:

```css
.loading-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  animation: float 3s ease-in-out infinite;
}
```

## Customization Options

### Adjust Loading Speed
Edit `src/ui/LoadingScreen.tsx` line 27:
```tsx
currentProgress += Math.random() * 15 + 5 // Increase numbers for faster loading
```

### Change Loading Messages
Edit `src/ui/LoadingScreen.tsx` lines 11-18:
```tsx
const messages = [
  'Your custom message 1...',
  'Your custom message 2...',
  // Add more messages
]
```

### Adjust Progress Bar Colors
Edit `src/ui/styles.css` around line 726:
```css
.loading-progress-fill {
  background: linear-gradient(90deg, #your-color-1 0%, #your-color-2 50%, #your-color-1 100%);
}
```

## Recommended Image Specifications
- **Format**: PNG with transparency or JPG
- **Size**: 400x300px to 800x600px
- **Location**: Place in `src/images/` folder
- **File name**: Something descriptive like `loading-hero.png`

## Testing
After making changes, run:
```bash
npm run dev
```

The loading screen will appear for a few seconds before transitioning to the start screen.

