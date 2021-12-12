import Component from "./Component.ts";
import ComponentInstance from "./ComponentInstance.ts";
import { CustomTag, DefaultTag, Jsx } from "./types/Jsx.ts";
import State from "./types/State.ts";

interface VirtualDomCommon {
  children: (string | number | VirtualDom)[];
  html: HTMLElement;
  key?: string;
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
  let key = undefined;
  let newAttrs = null;
  if (attrs) {
    newAttrs = { ...attrs };
    if (newAttrs["$key"]) {
      key = newAttrs["$key"];
      delete newAttrs["$key"];
    }
  }
  if (typeof tagName !== "string") {
    const instance = new ComponentInstance(tagName, newAttrs, children);
    const html = instance.getRender().getRootElement();
    return {
      tagName,
      attrs: newAttrs,
      children: [],
      instance,
      key,
      html,
    } as VirtualDomCustomTag;
  }
  const html = document.createElement(tagName);
  const newChildren: VirtualDom["children"] = [];
  if (newAttrs) {
    Object.entries(newAttrs).forEach(([name, value]) => {
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
    attrs: newAttrs,
    children: newChildren,
    key,
    html,
  } as VirtualDomDefaultTag;
}

function htmlPatch(virtualDom: VirtualDom, jsx: Jsx) {
  const oldAttrs = virtualDom.attrs;
  const { attrs, children } = jsx;
  if ("instance" in virtualDom) {
    virtualDom.instance.updateWith(attrs, children);
  }
  // Remove old attributes
  if (oldAttrs) {
    for (const k in oldAttrs) {
      if (attrs === null || attrs[k] === undefined) {
        virtualDom.html.removeAttribute(k);
        if (virtualDom.attrs !== null) {
          delete virtualDom.attrs[k];
        }
      }
    }
  }
  // Add / Change attributes
  if (attrs) {
    for (const k in attrs) {
      if (oldAttrs === null || oldAttrs[k] !== attrs[k]) {
        if (typeof attrs[k] === "function") {
          (virtualDom.html as unknown as Record<string, unknown>)[k] = attrs[k];
        } else {
          switch (k) {
            case "$value":
              (virtualDom.html as HTMLInputElement).value = `${attrs[k]}`;
              break;
            case "$key":
              break;
            default:
              virtualDom.html.setAttribute(k, `${attrs[k]}`);
              break;
          }
        }
        if (virtualDom.attrs === null) {
          virtualDom.attrs = {};
        }
        virtualDom.attrs[k] = attrs[k];
      }
    }
  }
  // Delete
  virtualDom.children = virtualDom.children.filter((oc, oi) => {
    if (!isSimpleVal(oc) && oc.key !== undefined) {
      const nc = children.find((c) => {
        if (!isSimpleVal(c) && c.attrs !== null) {
          return c.attrs["$key"] === oc.key;
        }
      });
      if (nc === undefined) {
        virtualDom.html.removeChild(virtualDom.html.childNodes[oi]);
        return false;
      }
    } else if (children[oi] === undefined) {
      virtualDom.html.removeChild(virtualDom.html.childNodes[oi]);
      return false;
    }
    return true;
  });
  // Move / Add
  children.forEach((child, i) => {
    let key: VirtualDomCommon["key"] = undefined;
    if (!isSimpleVal(child) && child.attrs && child.attrs["$key"]) {
      key = `${child.attrs["$key"]}`;
    }
    const oldC = virtualDom.children[i];
    if (isSimpleVal(oldC) && isSimpleVal(child) && oldC !== child) {
      const result = `${child}`;
      virtualDom.html.childNodes[i].nodeValue = result;
      virtualDom.children[i] = result;
    } else if (!isSimpleVal(oldC) && !isSimpleVal(child)) {
      let moved = false;
      if (key !== undefined) {
        moved = virtualDom.children.some((c, oldIndex) => {
          if (!isSimpleVal(c) && c.attrs !== null && c.attrs["$key"] === key) {
            const oldChild = virtualDom.children[i];
            virtualDom.children[i] = c;
            virtualDom.children[oldIndex] = oldChild;
            return true;
          }
        });
      }
      if (moved) {
        htmlPatch(virtualDom.children[i] as VirtualDom, child);
        return true;
      } else if (oldC === undefined) {
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
