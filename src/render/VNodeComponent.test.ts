import { assertExists, assertSpyCall, DOMParser, spy } from "../../deps.ts";
import VNodeComponent from "./VNodeComponent.ts";
import Component from "../Component.ts";

Deno.test("VNodeComponent: build node", () => {
  globalThis.document = (new DOMParser().parseFromString(
    "",
    "text/html",
  ) || new Document()) as Document;
  const component = new Component({}, () => ({})) as any;
  const onCreate = spy(component, "execStateFunction");
  const componentNode = new VNodeComponent(component, {}, []);
  componentNode.buildNode();
  assertSpyCall(onCreate, 0);
});

Deno.test("VNodeComponent: mount node", () => {
  globalThis.document = (new DOMParser().parseFromString(
    "",
    "text/html",
  ) || new Document()) as Document;
  const component = new Component({}, () => ({})) as any;
  const onMount = spy(component, "execMountFunction");
  const componentNode = new VNodeComponent(component, {}, []);
  componentNode.buildNode();
  componentNode.setDomParent(globalThis.document);
  assertSpyCall(onMount, 0);
});

Deno.test("VNodeComponent: delete node", () => {
  globalThis.document = (new DOMParser().parseFromString(
    "",
    "text/html",
  ) || new Document()) as Document;
  const component = new Component({}, () => ({})) as any;
  const onDestroy = spy(component, "execDestroyFunction");
  const componentNode = new VNodeComponent(component, {}, []);
  componentNode.buildNode();
  componentNode.setDomParent(globalThis.document);
  componentNode.deleteNode();
  assertSpyCall(onDestroy, 0);
});
