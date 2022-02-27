# Preface

This project is a component based front-end typescript framework. It works using
[Deno](https://deno.land/).

## Features

- JSX Render
  - Common tag (div, span, ...)
  - Component
  - Fragment
  - Text
- Variable reactivity
  - Reactive property
  - Cached property (function that GET some "Reactive property")
- Component
  - Use reactive variable
  - Render function w/ JSX
  - Props w/ default values
  - Slot

## Getting started

Use [Preface-cli](https://github.com/Maxur/preface-cli), it will create the
project with all the configuration needed.

## Example

### Button count

```tsx
// import { Component, Reactive } from './mod.ts';

export default new Component({}, () => ({ count: new Reactive(0) }))
  .render(({ state }) => (
    <button type="button" onclick={() => (state.count.value += 1)}>
      {state.count.value}
    </button>
  ))
  .end();
```

### Todo list

```tsx
// import { Component, Reactive } from './mod.ts';

export default new Component({}, () => {
  const items = new Reactive([{ id: 1, text: "Task 1" }]);
  const insert = () => {
    items.value.push({
      id: items.value.length + 1,
      text: `Task ${items.value.length + 1}`,
    });
  };
  const remove = (index: number) => {
    items.value.splice(index, 1);
  };
  const change = (index: number) =>
    (e: Event) => {
      if (e && e.target) {
        items.value[index].text = (e.target as HTMLInputElement).value;
      }
    };
  return {
    items,
    insert,
    remove,
    change,
  };
}).render(({ state }) => {
  return (
    <div>
      {state.items.value.map((item, index) => {
        return (
          <div $key={item.id}>
            <input
              type="text"
              value={item.text}
              oninput={state.change(index)}
            />
            <button type="button" onclick={() => state.remove(index)}>
              Remove
            </button>
          </div>
        );
      })}
      <button type="button" onclick={state.insert}>
        Insert
      </button>
    </div>
  );
}).end();
```
