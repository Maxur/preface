import { assertEquals } from "../../deps.ts";
import Reactive from "./Reactive.ts";
import Cached from "./Cached.ts";
import ReactivityPool from "./ReactivityPool.ts";

Deno.test("reactivity w/ primitive", () => {
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

Deno.test("reactivity w/ object", () => {
  let nUpdate = 0;
  const v1 = new Reactive({ a: 0, b: { x: 1, y: 2 } });
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
