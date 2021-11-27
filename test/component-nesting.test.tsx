import { assertEquals, DOMParser } from '../deps.ts';
import index from './index.ts';
import { createApplication, Component, JSX, reactive } from '../mod.ts';


const Sub = new Component({ v: "" }, () => ({}))
  .render((state, slot) => (
    <div>
      <span id="v2">{state.v.value}</span>
      <div id="v3">{slot}</div>
    </div>
  ))
  .end();

Deno.test('component nesting', async () => {
  globalThis.document = (new DOMParser().parseFromString(index, 'text/html') ||
    new Document()) as Document;
  const c = await createApplication(
    new Component({}, () => {
      return {
      v1: reactive(42),
    }})
      .render((state) => (
        <div>
          <span id="v1">abc</span>
          <Sub v="abcd">{state.v1.value}</Sub>
        </div>
      ))
      .end()
  );
  c.mount('#app');
  const v1 = document.getElementById('v1');
  const v2 = document.getElementById('v2');
  const v3 = document.getElementById('v3');
  if (v1 && v2 && v3) {
    assertEquals(v1.childNodes[0].textContent, 'abc');
    assertEquals(v2.childNodes[0].textContent, 'abcd');
    assertEquals(v3.childNodes[0].textContent, '42');
  } else {
    throw new Error('Component not mounted');
  }
});
