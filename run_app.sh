#!/bin/bash

echo "Building and running Fi MCP AI Chat..."

echo "Installing React dependencies..."
cd frontend
npm install

echo "Building React frontend..."
npm run build

echo "Starting Go server..."
cd ..
go run web_server.go
