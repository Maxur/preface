import { assertEquals, assertExists, DOMParser } from "../../deps.ts";
import jsx from "./jsx.ts";

const baseJsx = (
  <div>
    <div id="div-id" class="div-class">
      <span id="span-id" class="span-class">span-content</span>
      <p id="p-id" class="p-class">p-content</p>
    </div>
    <ul>
      <li>item 1</li>
      <li>item 2</li>
    </ul>
  </div>
);

const updateJsx = (
  <div>
    <div>
      <span class="span-new-class" style="color:blue"></span>
      <span class="new-class" style="color:red">new-content</span>
    </div>
    <ul>
      <li>item 1</li>
      <li>item 2</li>
      <li>item 3</li>
    </ul>
  </div>
);

Deno.test("render: build", () => {
  globalThis.document = (new DOMParser().parseFromString(
    "",
    "text/html",
  ) || new Document()) as Document;
  const vNode = baseJsx.build();
  const html = vNode.dom;
  assertExists(html);
  const div = html.children[0];
  const span = div.children[0];
  const p = div.children[1];
  const ul = html.children[1];
  assertEquals(div.tagName, "DIV");
  assertEquals(div.getAttribute("class"), "div-class");
  assertEquals(div.getAttribute("id"), "div-id");
  assertEquals(span.tagName, "SPAN");
  assertEquals(span.getAttribute("class"), "span-class");
  assertEquals(span.getAttribute("id"), "span-id");
  assertEquals(span.textContent, "span-content");
  assertEquals(p.tagName, "P");
  assertEquals(p.getAttribute("class"), "p-class");
  assertEquals(p.getAttribute("id"), "p-id");
  assertEquals(p.textContent, "p-content");
  assertEquals(ul.tagName, "UL");
  assertEquals(ul.children.length, 2);
});

Deno.test("render: update", () => {
  globalThis.document = (new DOMParser().parseFromString(
    "",
    "text/html",
  ) || new Document()) as Document;
  const vNode = baseJsx.build().update(updateJsx);
  const html = vNode.dom;
  assertExists(html);
  const div = html.children[0];
  const span = div.children[0];
  const newSpan = div.children[1];
  const ul = html.children[1];
  assertEquals(div.tagName, "DIV");
  assertEquals(div.getAttribute("class"), null);
  assertEquals(div.getAttribute("id"), null);
  assertEquals(span.tagName, "SPAN");
  assertEquals(span.getAttribute("class"), "span-new-class");
  assertEquals(span.getAttribute("id"), null);
  assertEquals(span.getAttribute("style"), "color:blue");
  assertEquals(span.textContent, "");
  assertEquals(newSpan.tagName, "SPAN");
  assertEquals(newSpan.getAttribute("class"), "new-class");
  assertEquals(newSpan.getAttribute("style"), "color:red");
  assertEquals(newSpan.textContent, "new-content");
  assertEquals(ul.tagName, "UL");
  assertEquals(ul.children.length, 3);
});
