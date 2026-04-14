#!/usr/bin/env bash
# Build multi-platform images and push to registry
# Usage: ./scripts/push-images.sh [registry/username]
# Example: ./scripts/push-images.sh visom77

set -e

REGISTRY="${1:-CHANGE_ME}"

if [ "$REGISTRY" = "CHANGE_ME" ]; then
  echo "❌  Usage: ./scripts/push-images.sh <registry/username>"
  echo "    Docker Hub:  ./scripts/push-images.sh visom77"
  echo "    GHCR:        ./scripts/push-images.sh ghcr.io/visom77"
  exit 1
fi

BACKEND_IMAGE="$REGISTRY/padel-backend:latest"
FRONTEND_IMAGE="$REGISTRY/padel-frontend:latest"
PLATFORMS="linux/amd64,linux/arm64"

# Ensure buildx builder with multi-platform support exists
docker buildx inspect padel-builder > /dev/null 2>&1 || \
  docker buildx create --name padel-builder --use --bootstrap

docker buildx use padel-builder

echo "🔨 Building & pushing backend → $BACKEND_IMAGE ($PLATFORMS)"
docker buildx build \
  --platform "$PLATFORMS" \
  --tag "$BACKEND_IMAGE" \
  --push \
  ./backend

echo "🔨 Building & pushing frontend → $FRONTEND_IMAGE ($PLATFORMS)"
docker buildx build \
  --platform "$PLATFORMS" \
  --tag "$FRONTEND_IMAGE" \
  --push \
  ./frontend

echo ""
echo "✅ Multi-platform images pushed (amd64 + arm64)"
echo "   Deploy on mini PC with:"
echo "   REGISTRY=$REGISTRY docker compose -f docker-compose.prod.yml up -d"
