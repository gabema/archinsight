import { sveltekit } from '@sveltejs/kit/vite';
import { fileURLToPath } from 'node:url';
import { normalizePath } from 'vite';
import { defineConfig } from 'vitest/config';

// Coverage globs need forward slashes, including on Windows.
const webSources = normalizePath(fileURLToPath(new URL('./src', import.meta.url)));
const workbenchSources = normalizePath(
  fileURLToPath(new URL('../packages/archinsight-workbench/src', import.meta.url))
);
const linkedWorkspacePackages = [
  '@archinsight/contracts',
  '@archinsight/editor-support',
  '@archinsight/graphviz',
  '@archinsight/workbench',
  '@insight/language'
];
const sharedRuntimeDependencies = [
  'svelte',
  'monaco-editor',
  '@insight/language',
  '@archinsight/contracts',
  '@archinsight/editor-support'
];

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    conditions: ['browser'],
    // Resolve the linked workbench to its physical sources and keep browser singletons canonical.
    // Separate symlink and physical module ids can register Monaco extensions more than once.
    preserveSymlinks: false,
    dedupe: sharedRuntimeDependencies
  },
  ssr: {
    // Linked sources live outside server.fs.allow and must stay in Vite's SSR pipeline, as in the
    // production build. Svelte's dependency crawl otherwise externalizes the workbench's own
    // dependencies once that package has node_modules, and Vite then refuses to load them.
    noExternal: linkedWorkspacePackages
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      allowExternal: true,
      include: [`${webSources}/**/*.{ts,svelte}`, `${workbenchSources}/**/*.{ts,svelte}`],
      exclude: [
        `${webSources}/**/*.test.ts`,
        `${webSources}/**/*.test-support.ts`,
        `${webSources}/**/*.d.ts`,
        `${webSources}/lib/generated/**`,
        `${workbenchSources}/themes/**`,
        // Declarative DI wiring is smoke-tested; its one closure per port is not a unit-coverage scope.
        `${webSources}/lib/workspace/shell/workspace-runtime.ts`
      ]
    }
  },
  optimizeDeps: {
    exclude: ['@insight/language']
  },
  server: {
    port: 5173
  }
});
