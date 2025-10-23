# Public Assets

This folder contains static assets for the Universal FHEVM SDK project.

## Logo Files

- `logo.svg` - Main SDK logo (SVG format for scalability)
- `logo.png` - PNG version for compatibility
- `favicon.ico` - Browser favicon

## Demo Images

- `demo-screenshot.png` - Screenshot of the Next.js showcase
- `transit-analytics-demo.png` - Screenshot of Transit Analytics example
- `architecture-diagram.png` - Architecture diagram

## Usage

These assets are publicly accessible at runtime:

```tsx
// In Next.js components
<Image src="/logo.svg" alt="Universal FHEVM SDK" width={200} height={50} />

// In HTML
<img src="/logo.png" alt="Universal FHEVM SDK" />
```

## Asset Guidelines

- **Logo**: Use the SVG version whenever possible for crisp rendering at any size
- **Favicon**: 32x32 or 16x16 ICO format for browser tab icons
- **Screenshots**: PNG format, optimized for web (< 500KB)
- **Diagrams**: High-resolution PNG or SVG for documentation

## Creating Custom Assets

To replace these placeholder assets:

1. Create your logo in SVG format
2. Export to PNG (recommended: 512x512 for logo.png)
3. Generate favicon using a tool like [favicon.io](https://favicon.io/)
4. Take screenshots at 1920x1080 resolution
5. Optimize images using [TinyPNG](https://tinypng.com/) or similar

## License

All assets in this folder are part of the Universal FHEVM SDK project and are licensed under the MIT License.
