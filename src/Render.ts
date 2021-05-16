import ComponentInstance from './ComponentInstance.ts';
import Jsx from './types/Jsx.ts';

interface VirtualDom {
  tagName: Jsx['tagName'],
  attrs: Jsx['attrs'],
  children: (string | number | (() => unknown) | VirtualDom)[];
  instance?: ComponentInstance,
  html: HTMLElement;
}

const customAttributePrefix = '$';

function isSimpleVal(v: unknown) : v is (number | string | (() => unknown)) {
  return ['number', 'string', 'function'].indexOf(typeof v) !== -1;
}

function toText(v: unknown): string {
  if (typeof v === 'number' || typeof v === 'string') {
    return v.toString();
  } else if (typeof v === 'function') {
    return v().toString();
  }
  return '';
}

function buildHtml(jsx: Jsx) {
  const { tagName, attrs, children } = jsx;
  let virtualDom: VirtualDom;
  if (typeof tagName !== 'string') {
    const instance = new ComponentInstance(tagName, attrs, children);
    const html = instance.getRender().getRootElement();
    virtualDom = {
      tagName,
      attrs,
      children: [],
      instance,
      html
    }
  } else {
    const html = document.createElement(tagName);
    virtualDom = {
      tagName,
      attrs,
      children: [],
      html
    }
  }
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
        virtualDom.children.push(result);
      }
      else {
        const e = buildHtml(child);
        virtualDom.html.appendChild(e.html);
        virtualDom.children.push(e);
      }
    });
  }
  return virtualDom;
}

function htmlPatch(virtualDom: VirtualDom, jsx: Jsx) {
  const instance = virtualDom.instance;
  const oldAttrs = virtualDom.attrs;
  const oldChildren = virtualDom.children;
  const { attrs, children } = jsx;
  if (instance instanceof ComponentInstance) {
    instance.updateWith(attrs, children);
  }
  if (oldAttrs) {
    for (const k in oldAttrs) {
      if (attrs === null || attrs[k] === undefined) {
        if (k[0] !== customAttributePrefix) {
          virtualDom.html.removeAttribute(k);
          const exists = (virtualDom.attrs && virtualDom.attrs[k] ? virtualDom.attrs : false);
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
          const exists = (virtualDom.attrs && virtualDom.attrs[k] ? virtualDom.attrs : false);
          if (exists) {
            exists[k] = attrs[k];
          }
        }
      }
    }
  }
  oldChildren.forEach((oldC, i, obj) => {
    if (children[i] === undefined) {
      virtualDom.html.removeChild(virtualDom.html.childNodes[i]);
      obj.splice(i, 1);
    }
  });
  children.forEach((child, i) => {
    const oldC = oldChildren[i];
    if (isSimpleVal(oldC) && isSimpleVal(child) && oldC !== child) {
      const result = toText(child);
      virtualDom.html.childNodes[i].nodeValue = result;
      virtualDom.children[i] = result;
    }
    else if (!isSimpleVal(oldC) && !isSimpleVal(child)) {
      if (oldC === undefined) {
        const build = buildHtml(child);
        virtualDom.html.appendChild(build.html);
        virtualDom.children.push(build);
      }
      else if (oldC.tagName !== child.tagName) {
        const build = buildHtml(child);
        virtualDom.html.replaceChild(build.html, virtualDom.html.childNodes[i]);
        virtualDom.children.splice(i, 1, build);
      }
      else {
        htmlPatch(oldC, child);
      }
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
