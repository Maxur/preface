import { assertEquals } from "../deps.ts";
import { JSX } from "../mod.ts";

Deno.test("JSX", () => {
  assertEquals(
    <div class="test" id="test-id">
      <span class="span-class">abc</span>
      <p>1234</p>
    </div>,
    {
      attrs: {
        class: "test",
        id: "test-id",
      },
      children: [
        {
          attrs: {
            class: "span-class",
          },
          children: ["abc"],
          tagName: "span",
        },
        {
          attrs: null,
          children: ["1234"],
          tagName: "p",
        },
      ],
      tagName: "div",
    },
  );
});
