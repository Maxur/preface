import { assertEquals } from "../../deps.ts";
import Reactive from "./Reactive.ts";

Deno.test("reactive watch", () => {
  let nUpdate = 0;
  const r = new Reactive(0).onUpdate(() => nUpdate++);
  assertEquals(nUpdate, 0);
  r.value++;
  assertEquals(nUpdate, 1);
});
