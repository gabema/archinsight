import { fileURLToPath } from 'node:url';
import { resolveConfig } from 'vite';
import { describe, expect, it } from 'vitest';

const linkedWorkspacePackages = [
  '@archinsight/contracts',
  '@archinsight/editor-support',
  '@archinsight/graphviz',
  '@archinsight/workbench',
  '@insight/language'
];

describe('web Vite configuration', () => {
  it('keeps every linked workspace package inside the SSR transform pipeline', async () => {
    const config = await resolveConfig(
      { configFile: fileURLToPath(new URL('./vite.config.ts', import.meta.url)), mode: 'test' },
      'serve'
    );

    expect(config.ssr.noExternal).toEqual(expect.arrayContaining(linkedWorkspacePackages));
    for (const name of linkedWorkspacePackages) {
      expect(config.ssr.external ?? []).not.toContain(name);
    }
  }, 30_000);
});
