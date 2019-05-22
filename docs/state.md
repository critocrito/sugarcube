---
path: "/api/state"
title: "State API"
---
# State

## API

### `state`

Construct a persistent state object.

```hs
state :: (obj: object?): State
```

The `State` instance has two methods, `get` and `update`. See below for a
description of those methods.

### `State`

This type is created using the `state` constructor function. It is an object
that has two attributes:

- `get :: (path: string?): {}`

    Return the value of the current state.

    ```js
    const s = state({a: {b: 23}});
    s.get(); // {a: {b: 23}}
    s.get("a.b"); // 23
    s.get("c"); // {}
    ```

- `update :: (path: string?, f: a -> b): State`

    Update a value of the current state.

    ```js
    const s = state({a: {b: 23}});
    s.update(obj => merge(obj, {x: 34}));
    s.get(); // {a: {b: 23}, x: 34}
    s.get("x"); // 34
    s.update("y", obj => merge(obj, {z: 42}));
    s.get("y.z"); // 42
    ```

    A bug prevents currently the update function to overwrite existing paths.

Any updates to the `State` using `update` happen in place.
