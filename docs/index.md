---
layout: default
title: Home
nav_order: 1
---

# What is GuiMath?
GuiMath allows your users to create mathematical equations on webpages using a GUI.

{: .note}
> This project was previously developed as MJXGUI and distributed as a standalone script. With this release, the library has been renamed and repackaged for npm as GuiMath, starting from a new release cycle at v0.1.0.
> 
> GuiMath v0.1.0 is equivalent to MJXGUI v2.1.0

GuiMath is a widget style application meant to give users a graphical interface for creating equations to use on the web. It uses MathJax as a core dependency and as an external renderer to show users a preview of their equation as they write it. Once users have created their equation, it generates corresponding LaTeX for you to handle however you would like, the most common use case being to store it as plain text, so you can use it later with MathJax.

The motivation is to have a widget that will help users build an expression graphically just as they do in Google Docs or Microsoft Word.

![GuiMath Editor Window](media/guimath-editor.png)

# Features
- Build mathematical, physical, and chemical equations using a GUI, similar to inserting equations in editors like Microsoft Word and Google Docs
- Convert a simple HTML form input into an interactive "equation" input.
- Support for Greek letters, mathematical operators, and common mathematical functions
- Write your own math functions, operators, and characters to add support for those not available by default.
- Convert created equations into LaTeX for storage and rendering in the browser.
