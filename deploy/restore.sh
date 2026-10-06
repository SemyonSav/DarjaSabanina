#!/usr/bin/env bash
# Восстановление из архива, созданного deploy/backup.sh.
#
#   ./deploy/restore.sh backups/site-2026-10-06_03-30.tar.gz
#
# Сайт на время восстановления останавливается. Текущие данные
# сохраняются рядом (data.before-restore-<дата>) — на случай ошибки.

set -euo pipefail

ARCHIVE="${1:-}"
DATA_DIR="${DATA_DIR:-./data}"
COMPOSE="docker compose -f docker-compose.prod.yml"

if [[ -z "$ARCHIVE" || ! -f "$ARCHIVE" ]]; then
  echo "Укажите архив: $0 backups/site-YYYY-MM-DD_HH-MM.tar.gz" >&2
  exit 1
fi

$COMPOSE stop app

if [[ -d "$DATA_DIR" ]]; then
  SAVED="${DATA_DIR%/}.before-restore-$(date +%Y-%m-%d_%H-%M)"
  mv "$DATA_DIR" "$SAVED"
  echo "Текущие данные перенесены в $SAVED"
fi

mkdir -p "$DATA_DIR"
tar -xzf "$ARCHIVE" -C "$DATA_DIR"
# Пользователь приложения в контейнере — uid 1001
chown -R 1001:1001 "$DATA_DIR" 2>/dev/null || sudo chown -R 1001:1001 "$DATA_DIR"

$COMPOSE start app
echo "Готово: данные восстановлены из $ARCHIVE"
