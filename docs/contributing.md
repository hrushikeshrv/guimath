---
layout: default
title: Contributing
nav_order: 6
---

# Contributing to GuiMath
{: .no_toc }

Thanks for volunteering your time and effort toward the development of GuiMath! To make the contribution process as smooth as possible, follow the steps below to set up your development environment.

1. TOC
{:toc}

## Local Installation
GuiMath is a pretty simple library, and it is not yet on npm, since it is mainly made for web environments and has no dependencies.

To get started, clone the code repository for GuiMath -

```bash
git clone https://github.com/hrushikeshrv/guimath.git
```

Next, create a new issue or claim an existing issue on the repository's [issues page](https://github.com/hrushikeshrv/guimath/issues).

## Creating A Development Environment
Before you start working on your patch, it is convenient to create an environment that will allow you to quickly test your changes. For this purpose, you can create a simple webpage that integrates the GuiMath editor and link the relevant files.

Create a new directory named `_test/` (since that name has already been included in the `.gitignore`), and inside create an `index.html` file with the following contents -

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <style>
        td {
            border: 1px solid black;
        }
        table {
            border-collapse: collapse;
        }
    </style>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
        MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$']]
            },
            svg: {
                fontCache: 'global'
            },
            options: {
                menuOptions: {
                    settings: {
                        zoom: 'NoZoom',
                        zscale: '250%',
                    }
                }
            },
        };
    </script>
    <link rel="stylesheet" href="../src/guimath.css">
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
    <script src="../src/modules/expression-backend.js"></script>
    <script src="../src/modules/cursor.js"></script>
    <script src="../src/modules/ui.js"></script>
    <title>GuiMath Demo</title>
</head>
<body>
<button id="guimath-button" style="margin: 30px; padding: 10px; font-family: monospace; font-size: 2rem;">Add Equation</button>
<div style="padding: 40px; font-size: 2rem;">
    <h3 style="font-family: monospace;">Inserted Equations:</h3>
    <table style="width: 100%; border: 1px solid black; font-family: monospace;">
        <thead>
        <tr>
            <th>Equation</th>
            <th>LaTeX</th>
        </tr>
        </thead>
        <tbody id="equation-output">

        </tbody>
    </table>
</div>
<script>
    const eqnOutput = document.querySelector('#equation-output');
    const guimath = new GuiMath('#guimath-button', '$$', function() {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="width: 50%; text-align: center;">$$ ${guimath.getLatex()} $$</td>
            <td style="width: 50%; text-align: center; user-select: all;">${guimath.getLatex()}</td>
        `;
        MathJax.typesetClear([tr]);
        eqnOutput.appendChild(tr);
        MathJax.typesetPromise([tr]).then(() => {});
    })
</script>
</body>
</html>
```

This HTML file simply links the source files for GuiMath individually, and gives you a button that you can use to open and test the GuiMath editor. Inside the `_test/` directory, you can create as many new files for testing as you want, and they will not be included in your git commits.

## Starting The Development Server
Finally, you will need to start a simple HTTP server at the root directory of this project in order for the above HTML file to work correctly.

If you're using a JetBrains IDE, a live server is automatically started when you open a directory as a project, and you will just need to open the `index.html` file from the previous step and click on one of the browser icons shown on the top right of the screen.

If you're using VS Code or any other IDE, you can download the Live Server extension for your respective IDE.

Then open the `_test/index.html` file and your development environment should be set up.

## Working With The Editor's HTML
If you are working on a patch that requires changing the HTML for the GuiMath editor, you will need to make changes to the `src/modules/editor.html` file. Once you have made your changes, you will need to inject this HTML into the GuiMath source for the new HTML to be used. You can do this by running `Grunt`. Make sure [Grunt is installed](https://gruntjs.com/getting-started) and follow these steps -

1. Open the `src/modules/ui.js` file.
2. Find the line where the editor's HTML is injected into the file, which will look something like this -
    `editorDiv.innerHTML = '< big HTML string >';`
3. Delete the big HTML string, and replace that line with this line -
    ```javascript
    editorDiv.innerHTML = '{{ editor_html }}';
    ```
4. Run the `inject-ui` task from this project's Gruntfile by running -
    ```bash
    grunt htmlmin
    grunt inject-ui
    ```

This will minify the `editor.html` file and inject the minified HTML in the right place in the `ui.js` file. You can then test these changes and complete your patch.

## Working With The Form Input's HTML
If you are working on a patch that requires changing the HTML for the GuiMath form input, you will need to make changes to the `src/modules/form-input.html` file. Once you have made your changes, you will need to inject this HTML into the GuiMath source for the new HTML to be used. You can do this by running `Grunt`. Make sure [Grunt is installed](https://gruntjs.com/getting-started) and follow these steps -


1. Open the `src/modules/ui.js` file.
2. Find the line where the form input's HTML is injected into the file, which will look something like this -
   `const formInputHTML = '< big HTML string >';`
3. Delete the big HTML string, and replace that line with this line -
    ```javascript
    const formInputHTML = '{{ form_input_html }}';
    ```
4. Run the `inject-ui` task from this project's Gruntfile by running -
    ```bash
    grunt htmlmin
    grunt inject-ui
    ```

This will minify the `form-input.html` file and inject the minified HTML in the right place in the `ui.js` file. You can then test these changes and complete your patch.

## Submitting a Patch
Once you have finished working on your patch and verified that your issue has been fixed, push your changes and create a pull request!

The GuiMath bundle is created by combining the constituent source files - `cursor.js`, `expression-backend.js`, and `ui.js` into `guimath.js`. This process is automated using Grunt, and a Gruntfile has been configured in the repository root. 

However, you **do not** need to generate and push these files to your patch. Only modify and push changes to the relevant source files.