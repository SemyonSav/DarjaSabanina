#!/usr/bin/env bash
# Резервная копия сайта: база SQLite + загруженные картинки.
#
# Запуск из папки проекта на сервере:   ./deploy/backup.sh
# Ежедневно в 03:30 (crontab -e):
#   30 3 * * * cd /opt/site && ./deploy/backup.sh >> /var/log/site-backup.log 2>&1
#
# Переменные (необязательно):
#   DATA_DIR    — папка данных сайта (по умолчанию ./data)
#   BACKUP_DIR  — куда складывать архивы (по умолчанию ./backups)
#   KEEP        — сколько последних архивов хранить (по умолчанию 14)
#   REMOTE      — куда копировать архив вне сервера через rclone,
#                 например "yandex:site-backups" (rclone config — заранее)
#
# Нужен sqlite3: apt install sqlite3

set -euo pipefail

DATA_DIR="${DATA_DIR:-./data}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP="${KEEP:-14}"
REMOTE="${REMOTE:-}"

STAMP="$(date +%Y-%m-%d_%H-%M)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$BACKUP_DIR"

if [[ ! -f "$DATA_DIR/site.db" ]]; then
  echo "Не найдена база: $DATA_DIR/site.db" >&2
  exit 1
fi

# Не копируем файл напрямую: при работающем сайте (режим WAL) копия может
# оказаться несогласованной. .backup делает целостный снимок.
sqlite3 "$DATA_DIR/site.db" ".backup '$WORK/site.db'"
sqlite3 "$WORK/site.db" "PRAGMA integrity_check;" | grep -qx "ok" || {
  echo "Проверка целостности копии не прошла" >&2
  exit 1
}

ARCHIVE="$BACKUP_DIR/site-$STAMP.tar.gz"
tar -czf "$ARCHIVE" \
  -C "$WORK" site.db \
  -C "$(cd "$DATA_DIR" && pwd)" uploads
echo "$(date '+%F %T') Создан архив $ARCHIVE ($(du -h "$ARCHIVE" | cut -f1))"

# Хранится только KEEP последних архивов
ls -1t "$BACKUP_DIR"/site-*.tar.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm --

# Копия вне сервера — без неё бэкап не спасёт при потере VPS
if [[ -n "$REMOTE" ]]; then
  rclone copy "$ARCHIVE" "$REMOTE" && echo "Скопировано в $REMOTE"
fi
