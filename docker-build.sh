#!/bin/bash

# Script para build e execução do Docker container

echo "🐳 Building Events Microservice Docker image..."
docker build -t events-microservice:latest .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 To run the container, use:"
    echo "docker run -p 3000:3000 events-microservice:latest"
    echo ""
    echo "📊 To run with volume for persistent SQLite database:"
    echo "docker run -p 3000:3000 -v \$(pwd)/data:/app/src/prisma events-microservice:latest"
else
    echo "❌ Build failed!"
    exit 1
fi