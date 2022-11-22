## Components

Components have props, which have the dual purpose of holding data and presenting that data to the editor.

In the `editor` section of a component descriptor, you can add the following generic attributes:

- `input`: the type of input to present to the user in the editor. This will override the default input that the editor picks for each type.

  Input types:

  - "Color": a color picker

  - "Entity": an entity selector--i.e. to allow the user to set a reference/target to another object

  - "Select": a drop-down select. Use the `options` attribute as a sibling to `input` to populate the select box. For example:

    ```js
      pattern: {
        type: StringType,
        default: "STILL",
        editor: {
          label: "Pattern Motion",
          input: "Select",
          options: [
            { label: "Still", value: "STILL" },
            { label: "Explode", value: "EXPLODE" },
            ...
          ],
        },
      },
    ```

    Note: The `options` can be a function that returns `label`, `value` pairs also.

  - "Text": a textarea for string input. Larger than "String" input type, e.g. for editing scripts.

- `label`: the name of the property that will be shown to the user

- `options`: see `input`

- `requires`: an array of requirements based on other properties in the component. For example, you can hide irrelevant properties this way.

### BooleanType

Unique Attributes:

- `skipModify`: tells the editor to skip the `.modify()` call to the component when switched on/off

For example:

```js
enabled: {
  type: BooleanType,
  default: true,
  editor: {
    label: "Enabled?",
    skipModify: true,
  },
},
```

### NumberType

Unique Attributes:

- `increment`: in the editor, when the user drags the number, how much should the number be incremented by

For example:

```js
convexity: {
  type: NumberType,
  default: 0.0,
  editor: {
    label: "Convexity",
    increment: 0.01,
  },
},
```

### Vector3Type

Unique Attributes:

`requires[].labels`: in the editor, labels can be added to the `requires` objects to give the Vector3 values labels other than x, y, z

```js
size: {
  type: Vector3Type,
  default: new Vector3(1, 1, 1),
  editor: {
    label: "Size",
    requires: [
      { prop: "kind", value: "BOX" /* default "x", "y", "z" */ },
      { prop: "kind", value: "SPHERE", labels: ["dia"] },
      { prop: "kind", value: "CYLINDER", labels: ["dia", "h"] },
      { prop: "kind", value: "CAPSULE", labels: ["dia", "h"] },
    ],
  },
},
```

### Special Component Types

`FaceMapColors`: intelligently rummage through an associated Model2 component for facemap colors and present them as a drop-down select
