import Component from "./Component.ts";
import ComponentInstance from "./ComponentInstance.ts";
import { CustomTag, DefaultTag, Jsx } from "./types/Jsx.ts";
import State from "./types/State.ts";

interface VirtualDomCommon {
  children: (string | number | VirtualDom)[];
  html: HTMLElement;
}

interface VirtualDomCustomTag extends VirtualDomCommon {
  tagName: CustomTag["tagName"];
  attrs: CustomTag["attrs"];
  instance: ComponentInstance<
    Component<Record<string, unknown>, State>,
    Record<string, unknown>,
    State
  >;
}

interface VirtualDomDefaultTag extends VirtualDomCommon {
  tagName: DefaultTag["tagName"];
  attrs: DefaultTag["attrs"];
}

type VirtualDom = VirtualDomCustomTag | VirtualDomDefaultTag;

function isSimpleVal(v: unknown): v is number | string | (() => unknown) {
  return ["number", "string", "function"].indexOf(typeof v) !== -1;
}

function buildHtml(jsx: Jsx): VirtualDom {
  const { tagName, attrs, children } = jsx;
  if (typeof tagName !== "string") {
    const instance = new ComponentInstance(tagName, attrs, children);
    const html = instance.getRender().getRootElement();
    return {
      tagName,
      attrs,
      children: [],
      instance,
      html,
    } as VirtualDomCustomTag;
  }
  const html = document.createElement(tagName);
  const newChildren: VirtualDom["children"] = [];
  if (attrs) {
    Object.entries(attrs).forEach(([name, value]) => {
      if (typeof value === "function") {
        (html as unknown as Record<string, unknown>)[name] = value;
      } else {
        switch (name) {
          case "$value":
            (html as HTMLInputElement).value = `${value}`;
            break;
          default:
            html.setAttribute(name, `${value}`);
            break;
        }
      }
    });
  }
  children.forEach((child) => {
    if (isSimpleVal(child)) {
      const result = `${child}`;
      html.appendChild(document.createTextNode(result));
      newChildren.push(result);
    } else {
      const e = buildHtml(child);
      html.appendChild(e.html);
      newChildren.push(e);
    }
  });
  return {
    tagName,
    attrs,
    children: newChildren,
    html,
  } as VirtualDomDefaultTag;
}

function htmlPatch(virtualDom: VirtualDom, jsx: Jsx) {
  const oldAttrs = virtualDom.attrs;
  const oldChildren = virtualDom.children;
  const { attrs, children } = jsx;
  if ("instance" in virtualDom) {
    virtualDom.instance.updateWith(attrs, children);
  }
  if (oldAttrs) {
    for (const k in oldAttrs) {
      if (attrs === null || attrs[k] === undefined) {
        virtualDom.html.removeAttribute(k);
        const exists = virtualDom.attrs && virtualDom.attrs[k]
          ? virtualDom.attrs
          : false;
        if (exists) {
          delete exists[k];
        }
      }
    }
  }
  if (attrs) {
    for (const k in attrs) {
      if (oldAttrs === null || oldAttrs[k] !== attrs[k]) {
        switch (k) {
          case "$value":
            (virtualDom.html as HTMLInputElement).value = `${attrs[k]}`;
            break;
          default:
            virtualDom.html.setAttribute(k, `${attrs[k]}`);
            break;
        }
        const exists = virtualDom.attrs && virtualDom.attrs[k]
          ? virtualDom.attrs
          : false;
        if (exists) {
          exists[k] = attrs[k];
        }
      }
    }
  }
  oldChildren.forEach((_, i, obj) => {
    if (children[i] === undefined) {
      virtualDom.html.removeChild(virtualDom.html.childNodes[i]);
      obj.splice(i, 1);
    }
  });
  children.forEach((child, i) => {
    const oldC = oldChildren[i];
    if (isSimpleVal(oldC) && isSimpleVal(child) && oldC !== child) {
      const result = `${child}`;
      virtualDom.html.childNodes[i].nodeValue = result;
      virtualDom.children[i] = result;
    } else if (!isSimpleVal(oldC) && !isSimpleVal(child)) {
      if (oldC === undefined) {
        const build = buildHtml(child);
        virtualDom.html.appendChild(build.html);
        virtualDom.children.push(build);
      } else if (oldC.tagName !== child.tagName) {
        const build = buildHtml(child);
        virtualDom.html.replaceChild(build.html, virtualDom.html.childNodes[i]);
        virtualDom.children.splice(i, 1, build);
      } else {
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

  getRootElement(): HTMLElement {
    return this._cache.html;
  }

  update(jsx: Jsx): void {
    htmlPatch(this._cache, jsx);
  }
}
