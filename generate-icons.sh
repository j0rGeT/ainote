#!/bin/bash

echo "Generating icon placeholders..."

# Create icons directory
mkdir -p public/icons

# Copy the SVG icon as PNG placeholders
cp public/icon.svg public/icons/icon-16x16.png
cp public/icon.svg public/icons/icon-32x32.png
cp public/icon.svg public/icons/icon-72x72.png
cp public/icon.svg public/icons/icon-96x96.png
cp public/icon.svg public/icons/icon-128x128.png
cp public/icon.svg public/icons/icon-144x144.png
cp public/icon.svg public/icons/icon-152x152.png
cp public/icon.svg public/icons/icon-192x192.png
cp public/icon.svg public/icons/icon-384x384.png
cp public/icon.svg public/icons/icon-512x512.png

echo "Icon placeholders generated!"
echo "Note: For production, convert the SVG to actual PNG files at the respective sizes."