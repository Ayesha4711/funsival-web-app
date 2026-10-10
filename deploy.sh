#!/bin/bash
set -euo pipefail

# ============================================================
# Configuration — adjust these to match your project
# ============================================================
IMAGE_NAME="funsival"
CONTAINER_NAME="funsival"
HOST_PORT=3000
CONTAINER_PORT=3000
TAG="latest"
ENV_FILE=".env"   # set to "" if you don't use an env file

# ============================================================
# Colors for output
# ============================================================
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date +'%H:%M:%S')]${NC} $1"; }
err() { echo -e "${RED}[$(date +'%H:%M:%S')]${NC} $1"; }

# ============================================================
# 1. Stop and remove old container (if it exists)
# ============================================================
if [ "$(docker ps -aq -f name=^${CONTAINER_NAME}$)" ]; then
    log "Stopping existing container: ${CONTAINER_NAME}"
    docker stop "${CONTAINER_NAME}" >/dev/null 2>&1 || true

    log "Removing existing container: ${CONTAINER_NAME}"
    docker rm "${CONTAINER_NAME}" >/dev/null 2>&1 || true
else
    warn "No existing container named ${CONTAINER_NAME} found — skipping stop/remove"
fi

# ============================================================
# 2. Remove old image (optional — forces fully fresh build)
# ============================================================
if [ "$(docker images -q ${IMAGE_NAME}:${TAG})" ]; then
    log "Removing old image: ${IMAGE_NAME}:${TAG}"
    docker rmi "${IMAGE_NAME}:${TAG}" >/dev/null 2>&1 || true
fi

# ============================================================
# 3. Build new image
# ============================================================
log "Building new image: ${IMAGE_NAME}:${TAG}"
docker build -t "${IMAGE_NAME}:${TAG}" .

# ============================================================
# 4. Run new container
# ============================================================
log "Starting new container: ${CONTAINER_NAME}"

RUN_ARGS=(
    -d
    --name "${CONTAINER_NAME}"
    --restart unless-stopped
    -p "${HOST_PORT}:${CONTAINER_PORT}"
)

# Add env file only if it exists and is configured
if [ -n "${ENV_FILE}" ] && [ -f "${ENV_FILE}" ]; then
    log "Using env file: ${ENV_FILE}"
    RUN_ARGS+=(--env-file "${ENV_FILE}")
fi

docker run "${RUN_ARGS[@]}" "${IMAGE_NAME}:${TAG}"

# ============================================================
# 5. Cleanup dangling images
# ============================================================
log "Pruning dangling images"
docker image prune -f >/dev/null

# ============================================================
# 6. Verify
# ============================================================
sleep 2
if [ "$(docker ps -q -f name=^${CONTAINER_NAME}$)" ]; then
    log "Deployment successful ✓"
    log "Container is running on port ${HOST_PORT}"
    docker ps -f name=^${CONTAINER_NAME}$ --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    err "Container failed to start. Showing logs:"
    docker logs "${CONTAINER_NAME}" 2>&1 | tail -50
    exit 1
fi
