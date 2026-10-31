import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requiredSources = [
  'src/generated/InsightLexer.ts',
  'src/generated/InsightParser.ts',
  'src/generated/AiqLexer.ts',
  'src/generated/AiqParser.ts',
  'src/generated/core-source.ts',
  'src/generated/builtin-view-catalog.ts'
];

if (process.env.ARCHINSIGHT_LANGUAGE_SOURCES_READY === 'true') {
  const missing = requiredSources.filter((path) => !existsSync(resolve(packageDirectory, path)));
  if (missing.length > 0) {
    throw new Error(`Gradle marked language sources as ready, but these files are missing: ${missing.join(', ')}`);
  }
  process.exit(0);
}

// Node refuses to spawn npm.cmd without a shell on Windows (CVE-2024-27980),
// so run npm's JavaScript entry point directly when npm launched this script.
const npmCli = process.env.npm_execpath;
const [command, args, shell] = npmCli?.endsWith('.js')
  ? [process.execPath, [npmCli, 'run', 'generate:grammar'], false]
  : ['npm', ['run', 'generate:grammar'], process.platform === 'win32'];
const generated = spawnSync(command, args, {
  cwd: packageDirectory,
  env: process.env,
  stdio: 'inherit',
  shell
});

if (generated.error) {
  throw generated.error;
}
process.exit(generated.status ?? 1);
