import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy';

export default defineConfig({
    input: 'src/index.js',
    output: [
        {
            file: 'dist/guimath.esm.js',
            format: 'es',
        },
        {
            file: 'dist/guimath.umd.js',
            format: 'umd',
            name: 'GuiMath',
            exports: 'default',
        },
        {
            file: 'dist/guimath.min.js',
            format: 'umd',
            name: 'GuiMath',
        },
    ],
    plugins: [
        copy({
            targets: [{ src: 'src/guimath.css', dest: 'dist' }],
        }),
    ],
});
