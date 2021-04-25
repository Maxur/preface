import { assertEquals, DOMParser } from '../deps.ts';
import index from './index.ts';
import { createApplication, Component, reactive } from '../mod.ts';

Deno.test('application mount', async () => {
  globalThis.document = (new DOMParser().parseFromString(index, 'text/html') || new Document()) as Document;
  const c = await createApplication(
    new Component(() => ({
      test: reactive('abc')
    })).render((state) => (
      <span id="test">{state.test}</span>
    )).end()
  );
  c.mount('#app');
  const span = document.getElementById('test');
  if (span) {
    assertEquals(
      span.childNodes[0].textContent,
      'abc'
    );
  } else {
    throw new Error('Component not mounted');
  }
});
