import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy';
import fs from 'fs';
import { string } from 'rollup-plugin-string';
import { minify } from 'html-minifier-terser';

function minifyHTMLPlugin() {
    const files = ['src/html/editor.html', 'src/html/form-input.html'];

    return {
        name: 'minify-html',
        async buildStart() {
            for (const file of files) {
                const input = fs.readFileSync(file, 'utf8');

                const output = await minify(input, {
                    collapseWhitespace: true,
                    removeComments: true,
                    removeRedundantAttributes: true,
                    removeEmptyAttributes: true,
                    minifyCSS: true,
                    minifyJS: true,
                });

                const outFile = file.replace('.html', '.min.html');
                fs.writeFileSync(outFile, output);
            }
        },
    };
}

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
            name: 'GUIMath',
            exports: 'default',
        },
        {
            file: 'dist/guimath.min.js',
            format: 'umd',
            name: 'GUIMath',
        },
    ],
    plugins: [
        minifyHTMLPlugin(),
        copy({
            targets: [{ src: 'src/guimath.css', dest: 'dist' }],
        }),
        string({
            include: '**/*.html',
        }),
    ],
});
