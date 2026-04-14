#!/usr/bin/env bash
# Build and push Docker images to registry
# Usage: ./scripts/push-images.sh [registry/username]
# Example: ./scripts/push-images.sh myuser
#          ./scripts/push-images.sh ghcr.io/myuser

set -e

REGISTRY="${1:-CHANGE_ME}"

if [ "$REGISTRY" = "CHANGE_ME" ]; then
  echo "❌  Usage: ./scripts/push-images.sh <registry/username>"
  echo "    Docker Hub:  ./scripts/push-images.sh myuser"
  echo "    GHCR:        ./scripts/push-images.sh ghcr.io/myuser"
  exit 1
fi

BACKEND_IMAGE="$REGISTRY/padel-backend:latest"
FRONTEND_IMAGE="$REGISTRY/padel-frontend:latest"

echo "🔨 Building backend → $BACKEND_IMAGE"
docker build -t "$BACKEND_IMAGE" ./backend

echo "🔨 Building frontend → $FRONTEND_IMAGE"
docker build -t "$FRONTEND_IMAGE" ./frontend

echo "📤 Pushing images..."
docker push "$BACKEND_IMAGE"
docker push "$FRONTEND_IMAGE"

echo ""
echo "✅ Done! Update docker-compose.prod.yml with:"
echo "   REGISTRY=$REGISTRY"
echo ""
echo "   Then on the mini PC:"
echo "   REGISTRY=$REGISTRY docker compose -f docker-compose.prod.yml up -d"
