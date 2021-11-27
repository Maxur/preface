import { assertEquals, DOMParser } from '../deps.ts';
import index from './index.ts';
import {
  createApplication,
  Component,
  JSX,
  reactive,
  Reactive,
  cached,
  watch,
} from '../mod.ts';

Deno.test('reactivity', async () => {
  globalThis.document = (new DOMParser().parseFromString(index, 'text/html') ||
    new Document()) as Document;
  const c = await createApplication(
    new Component({}, () => {
      const v1 = reactive(42);
      const v2 = cached(() => v1.value + 1);
      const v3 = reactive(0);
      watch(v1, () => {
        v3.value += 1;
      });
      return {
        v1,
        v2,
        v3,
      };
    })
      .render((state) => (
        <div>
          <span id="v1">{state.v1.value}</span>
          <span id="v2">{state.v2.value}</span>
          <span id="v3">{state.v3.value}</span>
        </div>
      ))
      .end()
  );
  c.mount('#app');
  const v1 = document.getElementById('v1');
  const v2 = document.getElementById('v2');
  const v3 = document.getElementById('v3');
  if (v1 && v2 && v3) {
    assertEquals(v1.childNodes[0].textContent, '42');
    assertEquals(v2.childNodes[0].textContent, '43');
    assertEquals(v3.childNodes[0].textContent, '0');
    ((c.getRenderArgs().v1 as Reactive<number>).value) += 10;
    await c.nextRender();
    assertEquals(v1.childNodes[0].textContent, '52');
    assertEquals(v2.childNodes[0].textContent, '53');
    assertEquals(v3.childNodes[0].textContent, '1');
  } else {
    throw new Error('Component not mounted');
  }
});
