# The .pen Format

Pencil documents are stored in .pen files. This documentation is for developers who would like to read or write .pen files.

**The following sections provide a birds-eye view of the .pen format. For the authoritative, exhaustive reference of all the supported features, please consult the [TypeScript schema](#typescript-schema) at the end of this page.**

This is a live documentation, and we reserve the right to introduce breaking changes in the .pen format.

## Overview

- .pen files contain a JSON structure, that describes an *object tree*, not unlike HTML or SVG.
- Each object in the document is a graphical entity on Pencil's infinite two-dimensional canvas.
- The objects must have an `id` property that uniquely identifies them within the document, and a `type` field from one of the possible object types (like `rectangle`, `frame`, `text`, etc. – consult the [TypeScript schema](#typescript-schema) for the exhaustive list of supported types).

## Layout

- The top-level objects in a document are placed on an infinite two-dimensional canvas. They must have `x` and `y` properties that describe the location of their top-left corner.
- Objects nested under other objects are positioned relative to their parents' top-left corner.
- A parent object can take over the sizing and positioning of its children using a flexbox-style layout system via properties like `layout`, `justifyContent` and `alignItems`.
- Child objects can choose to fill their parent, or use a fixed `width` and/or `height`.
- Parent objects can choose to fit the size of their children, or use a fixed `width` and/or `height`.

## Graphics

- The graphical appearance of objects is controlled by the `fill`, `stroke` and `effect` properties.
- A fill can be a solid `color`, a `gradient` (linear, radial or angular), an `image` or a `mesh_gradient`.
- An object can have multiple fills, which are painted on top of each other the same order they appear in the document.
- An object can have a single stroke, but the stroke can have multiple fills.
- An object can have multiple effects, which are applied in the same order they appear in the document.

## Components and Instances

A key difference between Pencil documents and HTML or SVG is that Pencil documents allow reusing existing chunks of the object tree at different places. This enables the building of reusable components, that can be used as concise building blocks for more complicated structures.

### Components

When an object is marked with the property `reusable: true`, it becomes a *reusable component*: 

```json
{
  "id": "foo",
  "type": "rectangle",
  "reusable": true, // <- this object is now a reusable component
  "x": 0, "y": 0, "width": 100, "height": 100,
  "fill": "#FF0000"
}
```

### Instances

The object type `ref` is used to create an *instance* of such components:

```json
{
  "id": "bar",
  "type": "ref",
  "ref": "foo", // <- this object is an instance of the component "foo"
  "x": 120, "y": 0
}
```

Here `foo` is a 100x100 red (`#FF0000`) square, and a reusable component. `bar` is an instance of `foo`, so it is also a 100x100 red square.

### Overrides

Instances can override properties from their component definition:

```json
{
  "id": "baz",
  "type": "ref",
  "ref": "foo",
  "x": 240, "y": 0,
  "fill": "#0000FF"
}
```

Even though `baz` is an instance of `foo`, it overrides the inherited `fill` property with a different one. So it's going to be a 100x100 *blue* (`#0000FF`) square!

### Nesting

An instance replicates everything under the component root:

```json
{
  "id": "round-button",
  "type": "frame",
  "reusable": true,
  "cornerRadius": 9999,
  "children": [
    {
      "id": "label",
      "type": "text",
      "content": "Submit",
      "fill": "#000000"
      ...
    }
  ]
}

{
  "id": "red-round-button",
  "type": "ref",
  "ref": "round-button",
  "fill": "#FF0000"
}
```

Here `red-round-button` will have an identical `"Submit"` label as `round-button`. But this label, too, can be customized using the `descendants` property:

```json
{
  "id": "red-round-button",
  "type": "ref",
  "ref": "round-button",
  "fill": "#FF0000",
  "descendants": {
    "label": { // <- "label" is the `id` of the object under "red-round-button" that we want to customize
      "text": "Cancel",
      "fill": "#FFFFFF"
    }
  }
}
```

Now the red button's label will be white, and say `"Cancel"`.

Components can be built from instances of other components:

```json
{
  "id": "alert",
  "type": "frame",
  "reusable": true,
  "children": [
    {
      "id": "message",
      "type": "text",
      "content": "This is an alert!",
      "fill": "#000000"
      ...
    },
    {
      "id": "ok-button",
      "type": "ref",
      "ref": "round-button",
      "descendants": {
        "label": {
          "text": "OK"
        }
      }
    },
    {
      "id": "cancel-button",
      "type": "ref",
      "ref": "round-button",
      "descendants": {
        "label": {
          "text": "Cancel"
        }
      }
    }
  ]
}
```

And children of nested instances can be customized by prefixing their IDs with the containing instance's ID and a slash in the `descendants` map:

```json
{
  "id": "save-alert",
  "type": "ref",
  "ref": "alert",
  "descendants": {
    "message": {
      "content": "You have unsaved changes. Do you want to save them?"
    },
    "ok-button/label": { // <- we're customizing the "label" under "ok-button"
      "content": "Save"
    },
    "cancel-button/label": { // <- we're customizing the "label" under "cancel-button"
      "content": "Discard Changes",
      "fill": "#FF0000"
    }
  }
}
```

In addition to customization, an object inside an instance can be completely replaced with new object:

```json
{
  "id": "icon-button",
  "type": "ref",
  "ref": "round-button",
  "descendants": {
    "label": {
      "id": "icon",
      "type": "icon_font", // <- the presence of the `type` property indicates that this is an object replacement
      "iconFontFamily": "lucide",
      "icon": "check"
    }
  }
}
```

Alternatively to 1:1 replacement, an object can be kept as is, and we can replace only its `children` with new objects:

```json
{
  "id": "sidebar"
  "type": "frame",
  "reusable": true,
  "children": [
    {
      "id": "header",
      "type": "frame",
      "fill": "#FF0000"
    },
    {
      "id": "content",
      "type": "frame",
      "fill": "#00FF00"
    },
    {
      "id": "footer",
      "type": "frame",
      "fill": "#0000FF"
    }
  ]
}

{
  "id": "menu-sidebar"
  "type": "ref",
  "ref": "sidebar",
  "descendants": {
    "content": {
      "children": [ // <- the children of "content" are replaced with some "round-button" instances
        {
          "id": "home-button",
          "type": "ref",
          "ref": "round-button",
          "descendants": {
            "label": {
              "text": "Home"
            }
          }
        },
        {
          "id": "settings-button",
          "type": "ref",
          "ref": "round-button",
          "descendants": {
            "label": {
              "text": "Settings"
            }
          }
        },
        {
          "id": "help-button",
          "type": "ref",
          "ref": "round-button",
          "descendants": {
            "label": {
              "text": "Help"
            }
          }
        }
      ]
    }
  }
}
```

This children replacement mechanism is ideal for container-style components, like panels, cards, windows, sidebars, etc.

### Slots

When a frame inside a component is intended to have its children replaced (e.g. the content holder frame inside a panel), it can be marked with the `slot` property:

```json
{
  "id": "sidebar"
  "type": "frame",
  "reusable": true,
  "children": [
    {
      "id": "header",
      "type": "frame",
      "fill": "#FF0000"
    },
    {
      "id": "content",
      "type": "frame",
      "fill": "#00FF00",
      "slot": [ // <- "content" is marked as a slot, which is intended to be populated with "round-button" or "icon-button" instances
        "round-button",
        "icon-button"
      ]
    },
    {
      "id": "footer",
      "type": "frame",
      "fill": "#0000FF"
    }
  ]
}
```

Pencil displays such slots with a special effect, and lets users insert instances of the suggested components (i.e. `round-button` or `icon-button` above) with a single click.

## Variables and Themes

Pencil supports extracting commonly used colors and numeric values (padding, corner radius, opacity, etc.) into document-wide variables:

```json
{
  "variables": {
    "color.background": {
      "type": "color",
      "value": "#FFFFFF"
    },
    "color.text": {
      "type": "color",
      "value": "#333333"
    },
    "text.title": {
      "type": "number",
      "value": 72
    }
  },
  "children": [
    {
      "id": "landing-page",
      "type": "frame",
      "fill": "$color.background",
      "children": [
        {
          "id": "welcome-label",
          "type": "text",
          "fill": "$color.text",
          "fontSize": "$text.title",
          "content": "Welcome!"
        }
      ]
    }
  ]
}
```

Pencil also implements a powerful theming system, whereby variables can dynamically change their values depending on the theme configuration of each object:

```json
{
  "variables": {
    "color.background": {
      "type": "color",
      "value": [ // <- when a variable has multiple values, the value that wins during evaluation is the _last_ one whose theme is satisfied
        { "value": "#FFFFFF", "theme": { "mode": "light" } },
        { "value": "#000000", "theme": { "mode": "dark" } }
      ]
    },
    "color.text": {
      "type": "color",
      "value": [
        { "value": "#333333", "theme": { "mode": "light" } },
        { "value": "#AAAAAA", "theme": { "mode": "dark" } }
      ]
    },
    "text.title": {
      "type": "number",
      "value": [
        { "value": 72, "theme": { "spacing": "regular" } },
        { "value": 36, "theme": { "spacing": "condensed" } }
      ]
    }
  },
  "themes": { // <- the default value of each theme axis is the first value, so the default theme is { "mode": "light", "spacing": "regular" }
    "mode": ["light", "dark"],
    "spacing": ["regular", "condensed"]
  },
  "children": [
    {
      "id": "landing-page-light",
      "type": "frame",
      "fill": "$color.background", // #FFFFFF
      "children": [
        {
          "id": "welcome-label",
          "type": "text",
          "fill": "$color.text", // #333333
          "fontSize": "$text.title", // 72
          "content": "Welcome!"
        }
      ]
    },
    {
      "id": "landing-page-dark",
      "type": "frame",
      "theme": { "mode": "dark" }, // <- everything under this frame is using "mode": "dark"
      "fill": "$color.background", // #000000
      "children": [
        {
          "id": "welcome-label",
          "type": "text",
          "fill": "$color.text", // #AAAAAA
          "fontSize": "$text.title", // 72
          "content": "Welcome!"
        }
      ]
    },
    {
      "id": "landing-page-dark-condensed",
      "type": "frame",
      "fill": "$color.background", // #000000
      "theme": { "mode": "dark", "spacing": "condensed" }, // <- everything under this frame is using { "mode": "dark", "spacing": "condensed" }
      "children": [
        {
          "id": "welcome-label",
          "type": "text",
          "fill": "$color.text", // #AAAAAA
          "fontSize": "$text.title", // 36
          "content": "Welcome!"
        }
      ]
    },
  ]
}
```

## TypeScript Schema

```ts file=<rootDir>/lib/schema/src/generated-types-public.ts
```