import ComponentInstance from "./ComponentInstance.ts";
import ComponentFunction from "./types/ComponentFunction.ts";

/**
 * Create an application.
 * @param componentFn The function that return the component.
 * @param css The css that will be added to the document.
 * @returns Promise with component instance.
 */
export default function createApplication(
  componentFn: ComponentFunction,
  css?: string,
): Promise<ComponentInstance> {
  return new Promise<ComponentInstance>((resolve) => {
    if (css !== undefined) {
      document.head.appendChild(document.createElement("style")).innerHTML =
        css;
    }
    if (document.readyState === "loading") {
      globalThis.addEventListener("DOMContentLoaded", () => {
        resolve(new ComponentInstance(componentFn, null, []));
      });
    } else {
      resolve(new ComponentInstance(componentFn, null, []));
    }
  });
}
