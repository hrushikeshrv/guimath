module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        htmlmin: {
            src: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                },
                files: {
                    'src/modules/editor.min.html': 'src/modules/editor.html',
                    'src/modules/form-input.min.html':
                        'src/modules/form-input.html',
                },
            },
        },
        injectHTML: {
            options: {
                editorHtml: 'src/modules/editor.min.html',
                formInputHtml: 'src/modules/form-input.min.html',
                src: 'src/modules/ui.js',
            },
        },
        concat: {
            buildExample: {
                src: [
                    'src/modules/expression-backend.js',
                    'src/modules/cursor.js',
                    'src/modules/ui.js',
                ],
                dest: 'docs/js/guimath.js',
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');

    grunt.registerTask('injectHTML', function () {
        const options = this.options();
        const editorTemplate = grunt.file.read(options.editorHtml);
        const formInputTemplate = grunt.file.read(options.formInputHtml);
        const src = grunt.file.read(options.src);

        let content = src.replace(/\{\{\seditor_html\s}}/, editorTemplate);
        content = content.replace(
            /\{\{\sform_input_html\s}}/,
            formInputTemplate,
        );
        grunt.file.write(options.src, content);
    });

    grunt.registerTask('default', ['htmlmin', 'injectHTML', 'concat']);
    grunt.registerTask('inject-ui', ['htmlmin', 'injectHTML']);
};
