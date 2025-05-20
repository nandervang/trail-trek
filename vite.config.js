import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig as defineVitestConfig } from 'vitest/config';
// https://vitejs.dev/config/
export default defineVitestConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: true,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/setupTests.ts'],
    },
});
