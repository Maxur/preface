import ComponentInstance from './ComponentInstance.ts';
import Jsx from './types/Jsx.ts';

interface VirtualDom {
  jsx: {
    tagName: Jsx['tagName'],
    attrs: Jsx['attrs'],
    children: (VirtualDom | string | number | Function)[];
  },
  html: HTMLElement
}

const customAttributePrefix = '$';

function isSimpleVal(v: unknown) : v is (number | string | Function) {
  return ['number', 'string', 'function'].indexOf(typeof v) !== -1;
}

function toText(v: any): string {
  if (typeof v === 'number' || typeof v === 'string') {
    return v.toString();
  } else if (typeof v === 'function') {
    return v().toString();
  }
  return '';
}

function buildHtml(jsx: Jsx) {
  const { tagName, attrs, children } = jsx;
  let html: HTMLElement;
  if (typeof tagName !== 'string') {
    const c = new ComponentInstance(tagName, attrs, children);
    html = c.getRender().getRootElement();
  } else {
    html = document.createElement(tagName);
  }
  const virtualDom: VirtualDom = {
    jsx: {
      tagName,
      attrs,
      children: []
    },
    html,
  };
  if (typeof tagName === 'string') {
    if (attrs) {
      Object.entries(attrs).forEach(([name, value]) => {
        if (name[0] === customAttributePrefix) {
          virtualDom.html.addEventListener(name.slice(1), value as unknown as EventListener);
        } else {
          virtualDom.html.setAttribute(name, toText(value));
        }
      })
    }
    children.forEach((child) => {
      if (isSimpleVal(child)) {
        const result = toText(child);
        virtualDom.html.appendChild(document.createTextNode(result));
        virtualDom.jsx.children.push(result);
      }
      else {
        const e = buildHtml(child);
        virtualDom.html.appendChild(e.html);
        virtualDom.jsx.children.push(e);
      }
    })
  }
  return virtualDom;
}

function htmlPatch(virtualDom: VirtualDom, jsx: Jsx) {
  const oldAttrs = virtualDom.jsx.attrs;
  const oldChildren = virtualDom.jsx.children;
  const { attrs, children } = jsx;
  if (oldAttrs) {
    for (const k in oldAttrs) {
      if (attrs === null || attrs[k] === undefined) {
        if (k[0] !== customAttributePrefix) {
          virtualDom.html.removeAttribute(k);
          const exists = (virtualDom.jsx.attrs && virtualDom.jsx.attrs[k] ? virtualDom.jsx.attrs : false);
          if (exists) {
            delete exists[k];
          }
        }
      }
    }
  }
  if (attrs) {
    for (const k in attrs) {
      if (oldAttrs === null || oldAttrs[k] !== attrs[k]) {
        if (k[0] !== customAttributePrefix) {
          virtualDom.html.setAttribute(k, toText(attrs[k]));
          const exists = (virtualDom.jsx.attrs && virtualDom.jsx.attrs[k] ? virtualDom.jsx.attrs : false);
          if (exists) {
            exists[k] = attrs[k];
          }
        }
      }
    }
  }
  children.forEach((child, i) => {
    const oldC = oldChildren[i];
    if (isSimpleVal(oldC) && isSimpleVal(child) && oldC !== child) {
      const result = toText(child);
      virtualDom.html.childNodes[i].nodeValue = result;
      virtualDom.jsx.children[i] = result;
    }
    else if(!isSimpleVal(oldC) && !isSimpleVal(child)) {
      htmlPatch(oldC, child);
    }
  });
}

export default class Render {
  private _cache: VirtualDom;

  constructor(jsx: Jsx) {
    this._cache = buildHtml(jsx);
  }

  getRootElement() {
    return this._cache.html;
  }

  update(jsx: Jsx) {
    htmlPatch(
      this._cache,
      jsx,
    );
  }
}
