import { Reactive } from './reactive.ts';

function watch(key: Reactive<unknown>, handler: () => void): void {
  key._functions.push(handler);
}

export { watch };
