import { assertEquals, assertExists, DOMParser } from "../../deps.ts";
import VNodeCommonTag from "./VNodeCommonTag.ts";

Deno.test("VNodeCommonTag: build node", () => {
  globalThis.document = (new DOMParser().parseFromString(
    "",
    "text/html",
  ) || new Document()) as Document;
  const tag = new VNodeCommonTag("div", { class: "abc" }, []);
  tag.buildNode();
  assertExists(tag.dom);
  globalThis.document.appendChild(tag.dom);
  assertEquals(tag.dom.parentNode, globalThis.document);
  assertEquals((tag.dom as HTMLElement).tagName, "DIV");
  assertEquals((tag.dom as HTMLElement).getAttribute("class"), "abc");
});

Deno.test("VNodeCommonTag: update node", () => {
  globalThis.document = (new DOMParser().parseFromString(
    "",
    "text/html",
  ) || new Document()) as Document;
  const tag = new VNodeCommonTag("div", { class: "abc" }, []);
  tag.buildNode();
  assertExists(tag.dom);
  globalThis.document.appendChild(tag.dom);
  tag.updateNode(new VNodeCommonTag("div", { class: "def" }, []));
  assertEquals((tag.dom as HTMLElement).tagName, "DIV");
  assertEquals((tag.dom as HTMLElement).getAttribute("class"), "def");
});

Deno.test("VNodeCommonTag: delete node", () => {
  globalThis.document = (new DOMParser().parseFromString(
    "",
    "text/html",
  ) || new Document()) as Document;
  const tag = new VNodeCommonTag("div", { class: "abc" }, []);
  tag.buildNode();
  assertExists(tag.dom);
  globalThis.document.appendChild(tag.dom);
  tag.deleteNode();
  assertEquals(tag.dom.parentNode, null);
});
