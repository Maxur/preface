import { assertEquals, DOMParser } from '../deps.ts';
import index from './index.ts';
import {
  ReactivityPool,
  createApplication,
  Component,
  JSX,
  Reactive,
  Cached,
} from '../mod.ts';

Deno.test('reactivity w/ primitive', () => {
  let nUpdate = 0;
  const v1 = new Reactive(0);
  const v2 = new Cached(() => v1.value + 1);
  new ReactivityPool([v1, v2]).onUpdate(() => nUpdate++);
  assertEquals(nUpdate, 0);
  assertEquals(v1.value, 0);
  assertEquals(v2.value, 1);
  v1.value++;
  assertEquals(nUpdate, 1);
  assertEquals(v1.value, 1);
  assertEquals(v2.value, 2);
});

Deno.test('reactivity w/ object', () => {
  let nUpdate = 0;
  const v1 = new Reactive({ a: 0, b: {x:1, y:2} });
  const v2 = new Cached(() => v1.value.a * (v1.value.b.x + v1.value.b.y));
  new ReactivityPool([v1, v2]).onUpdate(() => nUpdate++);
  assertEquals(nUpdate, 0);
  assertEquals(v1.value.a, 0);
  assertEquals(v1.value.b.x, 1);
  assertEquals(v1.value.b.y, 2);
  assertEquals(v2.value, 0);
  v1.value.a++;
  assertEquals(nUpdate, 1);
  v1.value.b.x++;
  assertEquals(nUpdate, 2);
  v1.value.b.y++;
  assertEquals(nUpdate, 3);
  assertEquals(v1.value.a, 1);
  assertEquals(v1.value.b.x, 2);
  assertEquals(v1.value.b.y, 3);
  assertEquals(v2.value, 5);
});

Deno.test('reactivity component', async () => {
  globalThis.document = (new DOMParser().parseFromString(index, 'text/html') ||
    new Document()) as Document;
  const c = await createApplication(
    new Component({}, () => {
      const v1 = new Reactive(42);
      const v2 = new Cached(() => v1.value + 1);
      const v3 = new Reactive(0);
      v1.onUpdate(() => {
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
