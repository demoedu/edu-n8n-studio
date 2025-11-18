#!/bin/bash

# n8n Workflow Backup Script
# 워크플로우를 백업하고 Git에 커밋합니다.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "🚀 Starting n8n workflow backup..."
echo "📁 Project directory: $PROJECT_DIR"
echo ""

# .env 파일 로드 (N8N_API_KEY가 있다면)
if [ -f "$PROJECT_DIR/.env" ]; then
  export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
  echo "✅ Environment variables loaded"
fi

# Bun으로 백업 스크립트 실행
bun run "$SCRIPT_DIR/backup-workflows.ts"

echo ""
echo "✨ Backup completed!"
