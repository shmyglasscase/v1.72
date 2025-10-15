#!/bin/bash
# Script to fix dependency conflicts

echo "Step 1: Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo "Step 2: Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

echo "Done! Dependencies fixed."
