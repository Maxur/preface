import Component from "./Component.ts";
import ComponentInstance from "./ComponentInstance.ts";
import Props from "./types/Props.ts";
import State from "./types/State.ts";

/**
 * Create an application.
 * @param componentFn The function that return the component.
 * @param css The css that will be added to the document.
 * @returns Promise with component instance.
 */
export default function createApplication<
  TProps extends Props,
  TState extends State,
>(
  componentFn: ReturnType<Component<TProps, TState>["end"]>,
  css?: string,
) {
  return new Promise<ComponentInstance<TProps, TState>>(
    (resolve) => {
      if (css !== undefined) {
        document.head.appendChild(document.createElement("style")).innerHTML =
          css;
      }
      const component = componentFn({}, []);
      const componentInstance = new ComponentInstance(component, {}, []);
      if (document.readyState === "loading") {
        globalThis.addEventListener("DOMContentLoaded", () => {
          resolve(componentInstance);
        });
      } else {
        resolve(componentInstance);
      }
    },
  );
}
