import Component from './Component.ts';
import ComponentInstance from './ComponentInstance.ts';
import Props from './types/Props.ts';

/**
 * Create an application.
 * @param componentFn The function that return the component.
 * @param css The css that will be added to the document.
 * @returns Component instance.
*/
export default function createApplication(componentFn: (props: Props) => Component<any>, css?: string) {
  return new Promise<ComponentInstance>((resolve) => {
    if (css !== undefined) {
      document.head.appendChild(document.createElement('style')).innerHTML = css
    }
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', () => {
        resolve(new ComponentInstance(componentFn, null, []));
      });
    } else {
      resolve(new ComponentInstance(componentFn, null, []));
    }
  })
}
