import { assertEquals, assertExists, DOMParser } from "../../deps.ts";
import VNodeText from "./VNodeText.ts";

Deno.test("VNodeText: build node", () => {
  globalThis.document = (new DOMParser().parseFromString(
    "",
    "text/html",
  ) || new Document()) as Document;
  const text = new VNodeText("abc");
  text.buildNode();
  assertExists(text.dom);
  globalThis.document.appendChild(text.dom);
  assertEquals(text.dom.parentNode, globalThis.document);
  assertEquals(text.dom.nodeValue, "abc");
});

Deno.test("VNodeText: update node", () => {
  globalThis.document = (new DOMParser().parseFromString(
    "",
    "text/html",
  ) || new Document()) as Document;
  const text = new VNodeText("abc");
  text.buildNode();
  assertExists(text.dom);
  globalThis.document.appendChild(text.dom);
  text.updateNode(new VNodeText("def"));
  assertEquals(text.dom.parentNode, globalThis.document);
  assertEquals(text.dom.nodeValue, "def");
});

Deno.test("VNodeText: delete node", () => {
  globalThis.document = (new DOMParser().parseFromString(
    "",
    "text/html",
  ) || new Document()) as Document;
  const text = new VNodeText("abc");
  text.buildNode();
  assertExists(text.dom);
  globalThis.document.appendChild(text.dom);
  text.deleteNode();
  assertEquals(text.dom.parentNode, null);
});
