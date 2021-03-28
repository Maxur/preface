import { assertEquals } from '../deps.ts';
import jsx from './jsx.tsx';

Deno.test('JSX', () => {
  assertEquals(
    jsx,
    {
      attrs: {
        class: "test",
        id: "test-id",
      },
      children: [{
          attrs: {
            class: "span-class",
          },
          children: [
            "abc",
          ],
          tagName: "span",
        },
        {
          attrs: null,
          children: [
            "1234",
          ],
          tagName: "p",
        },
      ],
      tagName: "div",
    }
  );
});
