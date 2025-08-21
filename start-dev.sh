#!/bin/bash

# Start all services in development mode with auto-reload
echo "🚀 Starting AI Career Assistant Development Environment..."

# Start infrastructure first
echo "🐳 Starting infrastructure services..."
pnpm docker:infra

# Wait for infrastructure to be ready
echo "⏳ Waiting for infrastructure to be ready..."
sleep 10

# Start all application services in parallel
echo "🔧 Starting application services..."

# Start API (NestJS with --watch)
echo "📡 Starting API server..."
pnpm --filter @ai-career/api start:dev &
API_PID=$!

# Start Workers (NestJS with --watch)
echo "⚙️  Starting Workers..."
pnpm --filter @ai-career/workers start:dev &
WORKERS_PID=$!

# Start Web (Next.js with auto-reload)
echo "🌐 Starting Web app..."
pnpm --filter @ai-career/web dev &
WEB_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down services..."
    kill $API_PID $WORKERS_PID $WEB_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

echo "✅ All services started successfully!"
echo "📱 Web: http://localhost:3000"
echo "🔌 API: http://localhost:4000"
echo "📊 API Docs: http://localhost:4000/api/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for all background processes
wait
