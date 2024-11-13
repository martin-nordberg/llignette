import {defineConfig} from "vitest/config";
import {sveltekit} from '@sveltejs/kit/vite';

export default defineConfig({

    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
                quietDeps: true,
                silenceDeprecations: ['legacy-js-api'],
            }
        }
    },

    plugins: [sveltekit()],

    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    }
});
