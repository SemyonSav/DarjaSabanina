/**
 * Генерирует значение ADMIN_PASSWORD_HASH:
 *
 *   npm run admin:hash-password -- "ваш-пароль"
 *
 * bcrypt-хеш кодируется в base64, чтобы знаки `$` не требовали
 * экранирования в .env и docker-compose.
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error("Укажите пароль не короче 10 символов:");
  console.error('  npm run admin:hash-password -- "ваш-пароль"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log(`ADMIN_PASSWORD_HASH=${Buffer.from(hash).toString("base64")}`);
