---
name: optimizeImages
description: Resize and compress images to match project standards (max 512px)
argument-hint: Image names or paths (e.g., "girl-1.png, boy-1.png")
---
Optimize the specified image(s) by resizing them to max 512px (maintaining aspect ratio) to match other project images.

## Instructions

1. For each image name or path provided:
   - If just a filename, look in `src/assets/images/`
   - If a relative path, resolve from project root
   - If absolute path, use as-is

2. For each image:
   - Check current file size and dimensions using `sips -g pixelWidth -g pixelHeight`
   - Resize to max 512px using `sips -Z 512`
   - Report before/after sizes and reduction percentage

## Usage

Provide image names or paths as input:
- `girl-empty-box.png` (looks in src/assets/images/)
- `src/assets/images/boy-1.png` (relative path)
- Multiple images: `girl-1.png, boy-1.png, camera-girl.png`