#!/usr/bin/env node
/**
 * Vercel Firewall path rate limit 규칙을 프로젝트에 적용합니다.
 *
 * Hobby: WAF rate limit 규칙 1개만 가능 → `npm run firewall:apply:hobby`
 * Pro+:  path별 3개 규칙 → `npm run firewall:apply`
 *
 * 적용 후: vercel --cwd <root> firewall publish
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const configPath = join(root, 'firewall', 'rate-limit-rules.json');

const dryRun = process.argv.includes('--dry-run');
const proMode = process.argv.includes('--pro') || process.env.GINIT_FIREWALL_PLAN === 'pro';
const hobbyMode =
  !proMode &&
  (process.argv.includes('--hobby') ||
    process.env.GINIT_FIREWALL_PLAN === 'hobby' ||
    process.env.GINIT_FIREWALL_PLAN !== 'pro');

function runVercel(args) {
  const full = ['--cwd', root, 'firewall', 'rules', 'add', ...args];
  const printable = `vercel ${full.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ')}`;
  console.log(`\n> ${printable}\n`);
  if (dryRun) return;

  try {
    const out = execFileSync('vercel', full, { encoding: 'utf8' });
    if (out) process.stdout.write(out);
  } catch (err) {
    const combined = `${err.stdout ?? ''}${err.stderr ?? ''}`;
    if (/rate limiting is not available/i.test(combined) || /\(401\)/.test(combined)) {
      console.error(combined);
      console.error(`
Hobby 플랜은 WAF rate limit 규칙을 **1개만** 둘 수 있습니다 (이미 publish 했으면 추가 불가).
  • WAF 설정 완료 상태일 수 있음 → vercel --cwd ${root} firewall rules list
  • 규칙 교체: firewall discard → npm run firewall:apply → firewall publish
  • path별 40/60: Upstash env + 재배포 (middleware, docs/VERCEL_FIREWALL.md)
  • WAF path 3개: Pro+ 후 npm run firewall:apply:pro
`);
      process.exit(1);
    }
    if (err.stdout) process.stdout.write(err.stdout);
    if (err.stderr) process.stderr.write(err.stderr);
    throw err;
  }
}

function buildRuleArgs(rule) {
  const condition = JSON.stringify({
    type: 'path',
    op: rule.pathOp || 'pre',
    value: rule.path,
  });

  const args = [
    rule.name,
    '--condition',
    condition,
    '--action',
    'rate_limit',
    '--rate-limit-window',
    String(rule.windowSec),
    '--rate-limit-requests',
    String(rule.maxRequests),
    '--rate-limit-algo',
    rule.algo || 'fixed_window',
    '--rate-limit-action',
    rule.exceedAction || 'rate_limit',
    '--yes',
  ];

  for (const key of rule.keys || ['ip']) {
    args.push('--rate-limit-keys', key);
  }
  return args;
}

const config = JSON.parse(readFileSync(configPath, 'utf8'));
const allRules = config.rules ?? [];

let rulesToApply = allRules;
if (hobbyMode) {
  const hobbyName = config.hobbyRuleName ?? 'ginit-share-rl-api-fallback';
  rulesToApply = allRules.filter((r) => r.name === hobbyName);
  if (rulesToApply.length === 0) {
    console.error(`hobbyRuleName "${hobbyName}" not found in ${configPath}`);
    process.exit(1);
  }
}

console.log('Vercel Firewall rate limit rules');
console.log(`Config: ${configPath}`);
console.log(`Project root: ${root}`);
console.log(`Plan: ${hobbyMode ? 'hobby (max 1 WAF rule)' : 'pro (all rules)'}`);
if (dryRun) console.log('(dry-run — 명령만 출력)\n');

for (const rule of rulesToApply) {
  runVercel(buildRuleArgs(rule));
}

if (proMode && allRules.length > 1) {
  console.log('\n(Hobby 플랜이면 `npm run firewall:apply` 만 사용 — WAF 1개 제한)\n');
}

console.log('\n--- SDK / middleware (Hobby에서 path별 한도) ---');
for (const r of config.sdkRules || []) {
  console.log(
    `  ${r.rateLimitId} | ${r.maxRequests} req / ${r.windowSec}s (middleware + Upstash)`,
  );
}
console.log('\nUpstash env (권장, Hobby): UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN');
console.log('자세한 내용: docs/VERCEL_FIREWALL.md\n');

if (!dryRun) {
  console.log(`다음: vercel --cwd ${root} firewall publish`);
}
