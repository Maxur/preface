import { assertEquals, DOMParser } from '../deps.ts';
import index from './index.ts';
import Render from "../src/Render.ts";
import { JSX } from '../mod.ts';

const baseJsx = (<div class="div-class" id="div-id">
  <span class="span-class" id="span-id">span-content</span>
  <p class="p-class" id="p-id">p-content</p>
</div>);

const updatedJsx = (<div>
  <span class="span-new-class" style="color:blue"></span>
  <span class="new-class" style="color:red">new-content</span>
</div>);

function buildDocument() {
  globalThis.document = (new DOMParser().parseFromString(index, 'text/html') ||
    new Document()) as Document;
  const render = new Render(baseJsx);
  const element = document.querySelector("#app") as HTMLElement;
  element.appendChild(render.getRootElement());
  return { element: element.children[0], render };
}

Deno.test('render: build', () => {
  const { element } = buildDocument();
  const span = element.children[0];
  const p = element.children[1];
  assertEquals(element.tagName, "DIV");
  assertEquals(element.getAttribute("class"), "div-class");
  assertEquals(element.getAttribute("id"), "div-id");
  assertEquals(span.tagName, "SPAN");
  assertEquals(span.getAttribute("class"), "span-class");
  assertEquals(span.getAttribute("id"), "span-id");
  assertEquals(span.textContent, "span-content");
  assertEquals(p.tagName, "P");
  assertEquals(p.getAttribute("class"), "p-class");
  assertEquals(p.getAttribute("id"), "p-id");
  assertEquals(p.textContent, "p-content");
});

Deno.test('render: update', () => {
  const { element, render } = buildDocument();
  const span = element.children[0];
  const p = element.children[1];
  render.update(updatedJsx);
  const newSpan = element.children[1];
  assertEquals(element.tagName, "DIV");
  assertEquals(element.getAttribute("class"), null);
  assertEquals(element.getAttribute("id"), null);
  assertEquals(span.tagName, "SPAN");
  assertEquals(span.getAttribute("class"), "span-new-class");
  assertEquals(span.getAttribute("id"), null);
  assertEquals(span.getAttribute("style"), "color:blue");
  assertEquals(span.textContent, "");
  assertEquals(p.parentElement, null);
  assertEquals(newSpan.tagName, "SPAN");
  assertEquals(newSpan.getAttribute("class"), "new-class");
  assertEquals(newSpan.getAttribute("style"), "color:red");
  assertEquals(newSpan.textContent, "new-content");
});
