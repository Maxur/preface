import createApplication from './src/application.ts';
import Component from './src/Component.ts';
import { cached } from './src/cached.ts';
import { reactive } from './src/reactive.ts';
import { watch } from './src/watch.ts';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: unknown
    }
  }
}

export {
  createApplication,
  cached,
  Component,
  reactive,
  watch,
}
