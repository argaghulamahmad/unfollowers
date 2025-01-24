#!/bin/bash

# Create public directory if it doesn't exist
mkdir -p ../public

# Set GOARCH to wasm and GOOS to js
GOOS=js GOARCH=wasm go build -o ../public/main.wasm ./src/compare.go

# Copy the wasm_exec.js file from Go installation to public directory
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" ../public/

echo "WASM module built successfully!"