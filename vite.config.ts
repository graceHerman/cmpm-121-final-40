import { defineConfig } from 'vite';

export default defineConfig({
    base: '/your-repository/', // Replace with the name of your GitHub repository
    build: {
        outDir: 'dist',
    },
});
