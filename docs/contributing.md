---
layout: default
title: Contributing
nav_order: 6
---

# Contributing to GUIMath
{: .no_toc }

Thanks for volunteering your time and effort toward the development of GUIMath! To make the contribution process as smooth as possible, follow the steps below to set up your development environment.

1. TOC
{:toc}

## Local Installation
To get started, clone the code repository for GUIMath -

```bash
git clone https://github.com/hrushikeshrv/guimath.git
```

Next, create a new issue or claim an existing issue on the repository's [issues page](https://github.com/hrushikeshrv/guimath/issues).

## Creating A Development Environment
Before you start working on your patch, it is convenient to create an environment that will allow you to quickly test your changes. For this, you can create a simple webpage that integrates the GUIMath editor and link the relevant files.

Create a new directory named `_test/` (since that name has already been included in the `.gitignore`), and inside create an `index.html` file with the following contents -

```html
<!doctype html>
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
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script>
        MathJax = {
            tex: {
                inlineMath: [
                    ['$', '$'],
                    ['\\(', '\\)'],
                ],
                displayMath: [['$$', '$$']],
            },
            svg: {
                fontCache: 'global',
            },
            options: {
                menuOptions: {
                    settings: {
                        zoom: 'NoZoom',
                        zscale: '250%',
                    },
                },
            },
        };
    </script>
    <link rel="stylesheet" href="../src/guimath.css" />
    <script
        id="MathJax-script"
        async
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
    ></script>
    <script src="../dist/guimath.umd.js"></script>
    <title>GUIMath Demo</title>
</head>
<body>
<button
    id="guimath-button"
    style="margin: 30px;padding: 10px;font-family: monospace;font-size: 2rem;">
    Add Equation
</button>
<div style="padding: 40px; font-size: 2rem">
    <h3 style="font-family: monospace">Inserted Equations:</h3>
    <table style="width: 100%;border: 1px solid black;font-family: monospace;">
        <thead>
        <tr>
            <th>Equation</th>
            <th>LaTeX</th>
        </tr>
        </thead>
        <tbody id="equation-output"></tbody>
    </table>
</div>
<script>
    const eqnOutput = document.querySelector('#equation-output');
    const guimath = new GUIMath('#guimath-button', function () {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="width: 50%; text-align: center;">$$ ${guimath.getLatex()} $$</td>
            <td style="width: 50%; text-align: center; user-select: all;">${guimath.getLatex()}</td>
        `;
        MathJax.typesetClear([tr]);
        eqnOutput.appendChild(tr);
        MathJax.typesetPromise([tr]).then(() => {});
    });
</script>
</body>
</html>
```

This HTML file simply gives you a button that you can use to open and test the GUIMath editor. Inside the `_test/` directory, you can create as many new files for testing as you want, and they will not be included in your git commits.

## Starting The Development Server
Finally, you will need to start a server at the root directory of this project in order for the above HTML file to work correctly.

Run the following command from the repository root -
```bash
npm run dev
````

This will start a server with rollup in watch mode, so that any changes you make to the source files will be automatically reflected in the build files, and you will be able to test the changes you make.

Then open the `_test/index.html` file and your development environment should be set up.

## Working With The Editor's HTML
If you are working on a patch that requires changing the HTML for the GUIMath editor, you will need to make changes to the `src/modules/editor.html` file. Once you have made your changes, you will need to restart your dev server to see the new changes. 

## Working With The Form Input's HTML
If you are working on a patch that requires changing the HTML for the GUIMath form input, you will need to make changes to the `src/modules/form-input.html` file. Once you have made your changes, you will need to restart your dev server to see the new changes.

## Submitting a Patch
Once you have finished working on your patch and verified that your issue has been fixed, push your changes and create a pull request!

The GUIMath bundle is created by combining the constituent source files - `cursor.js`, `expression-backend.js`, and `ui.js` into `guimath.js`. This process is automated using Grunt, and a Gruntfile has been configured in the repository root. 

However, you **do not** need to generate and push these files to your patch. Only modify and push changes to the relevant source files.

## Building GUIMath

{: .note}
> You do not need to do this step to submit a patch. This is only needed if you want to create your own production build of GUIMath for distribution.

To create a production build of GUIMath, make sure you have [Grunt installed](https://gruntjs.com/getting-started) and run the following command from the repository root -

```bash
npm run build
```

This will create the production build files in the `dist/` directory.
