#!/usr/bin/env node
/**
 * Vercel Firewall path rate limit 규칙을 프로젝트에 적용합니다.
 *
 * 사전 조건:
 *   npm i -g vercel@latest
 *   vercel link   (ginit-share 프로젝트)
 *   vercel firewall rules list  (CLI 동작 확인)
 *
 * 사용:
 *   node scripts/apply-vercel-firewall-rate-limits.mjs
 *   node scripts/apply-vercel-firewall-rate-limits.mjs --dry-run
 *
 * 적용 후 Vercel 대시보드 → Firewall → Review Changes → Publish
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const configPath = join(root, 'firewall', 'rate-limit-rules.json');

const dryRun = process.argv.includes('--dry-run');

function run(cmd) {
  console.log(`\n> ${cmd}\n`);
  if (dryRun) return;
  execSync(cmd, { stdio: 'inherit', cwd: root });
}

function shellQuote(s) {
  return `'${String(s).replace(/'/g, `'\"'\"'`)}'`;
}

const config = JSON.parse(readFileSync(configPath, 'utf8'));

console.log('Vercel Firewall rate limit rules');
console.log(`Config: ${configPath}`);
if (dryRun) console.log('(dry-run — 명령만 출력)\n');

for (const rule of config.rules) {
  const condition = JSON.stringify({
    type: 'path',
    op: rule.pathOp || 'pre',
    value: rule.path,
  });

  const cmd = [
    'vercel firewall rules add',
    shellQuote(rule.name),
    '--condition',
    shellQuote(condition),
    '--action rate_limit',
    '--rate-limit-window',
    String(rule.windowSec),
    '--rate-limit-requests',
    String(rule.maxRequests),
    '--rate-limit-keys',
    ...(rule.keys || ['ip']).flatMap((k) => ['--rate-limit-keys', k]),
    '--rate-limit-algo',
    rule.algo || 'fixed_window',
    '--rate-limit-action',
    rule.exceedAction || 'rate_limit',
    '--yes',
  ].join(' ');

  run(cmd);
}

console.log('\n--- SDK용 @vercel/firewall 규칙 (대시보드 수동) ---');
for (const r of config.sdkRules || []) {
  console.log(
    `  Rate limit ID: ${r.rateLimitId} | ${r.maxRequests} req / ${r.windowSec}s | If: @vercel/firewall`,
  );
}
console.log('\n대시보드에서 Publish 한 뒤, 선택적으로 Upstash env 설정:');
console.log('  UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN');
console.log('자세한 내용: docs/VERCEL_FIREWALL.md\n');

if (!dryRun) {
  console.log('다음: vercel firewall publish  (또는 대시보드 Review Changes → Publish)');
}
