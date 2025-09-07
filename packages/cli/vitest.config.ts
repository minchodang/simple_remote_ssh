import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        testTimeout: 10000,
        typecheck: {
            enabled: true,
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['node_modules/', 'dist/', '**/*.d.ts', 'vitest.config.ts', 'tests/fixtures/**'],
        },
    },
    esbuild: {
        target: 'node18',
    },
    resolve: {
        alias: {
            '@': new URL('./src', import.meta.url).pathname,
        },
    },
});
