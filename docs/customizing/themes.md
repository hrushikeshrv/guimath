---
layout: default
title: Themes
parent: Customizing
nav_order: 3
---

# Themes
{: .no_toc }

GUIMath supports a few themes out of the box that you can use to change the appearance of the editor widget. 
The available themes are - 

| Theme Name      | Theme Identifier |
|-----------------|------------------|
| Default (light) | `default`        |
| Default (dark)  | `dark`           |
| Grey            | `grey`           |
| Dark Blue       | `dark-blue`      |
| Light Blue      | `light-blue`     |
| Dark Pink       | `dark-pink`      |
| Light Pink      | `light-pink`     |

You can set the theme when initializing GUIMath by passing a `theme` option to the constructor:

```javascript
const guimath = new GUIMath({
    theme: 'dark-blue' // Set the theme to Dark Blue
});
```

You can see examples of all built-in themes on the [themes demo page](../examples/themes.html).

## Custom Themes
You can also create your own custom themes by defining a CSS class or ID with the desired styles and adding your class or ID to the GUIMath widget using the `class` and `id` options in the constructor:

```javascript
const guimath = new GUIMath({
    class: 'my-custom-theme',   // Add your custom theme class if needed
    id: 'my-custom-id'          // Add your custom id if needed
});
```

This custom class or ID will be added to the root element of the GUIMath widget, allowing you to target it with your own CSS styles. The GUIMath widget has the following CSS variables defined to help you customize its colors:

| CSS Variable           | Description                          |
|------------------------|--------------------------------------|
| `--background-color`   | Background color of the widget       |
| `--background-dark-1`  | Darker background color for buttons  |
| `--default-font-color` | Default font color                   |
| `--default-shadow`     | Default shadow for the widget        |
| `--success-green`      | Color for the success button         |
| `--error-red`          | Color for the delete equation button |
    