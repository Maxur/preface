# Preface

This project is a component based front-end typescript framework.

## Features

- Variable reactivity
  - [x] Reactive property
  - [x] Cached property (function that uses "reactive property")
  - [x] Watcher
- Component
  - [x] Import
  - [x] Slot
- Event handling
  - [x] Basic event (onclick, onchange, ...)

## Setup

```ts
// import { createApplication } from './mod.ts';
// import Main from './components/Main/index.tsx';

createApplication(Main).then((ci) => {
  ci.mount("#app");
});
```

## Example

### Button count

```tsx
// import { Component, reactive } from './mod.ts';

export default new Component({}, () => ({ count: reactive(0) }))
  .render((state) => (
    <button type="button" onclick={() => (state.count.value += 1)}>
      {state.count.value}
    </button>
  ))
  .end();
```

### Todo list

```tsx
// import { Component, reactive } from './mod.ts';

export default new Component({}, () => {
  const items = reactive(["Task 1", "Task 2"]);
  const insert = () => {
    items.value.push(`Task ${items.value.length + 1}`);
  };
  const remove = (index: number) => {
    items.value.splice(index, 1);
  };
  const change = (index: number) =>
    (e: any) => {
      if (e && e.target) {
        items.value[index] = e.target.value;
      }
    };
  return {
    items,
    insert,
    remove,
    change,
  };
}).render((state) => {
  return (
    <div>
      {state.items.value.map((item, index) => {
        return (
          <div>
            <input type="text" value={item} oninput={state.change(index)} />
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
