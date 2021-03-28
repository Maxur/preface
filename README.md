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
  - [ ] Custom event from component
- [ ] Cli

## Setup
```ts
// import { createApplication } from './mod.ts';
// import Main from './components/Main/index.tsx';

createApplication(Main).then((ci) => {
  ci.mount('#app');
});
```

## Example
### Button count
```tsx
// import { Component, reactive } from './mod.ts';

export default () => new Component(() => ({
  count: reactive(0)
})).render((state) => (
  <button type="button" $click={() => state.count += 1}>{state.count}</button>
));
```
