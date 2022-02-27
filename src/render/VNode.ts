import Props from "../types/Props.ts";

export default abstract class VNode {
  protected _dom?: Node;

  private key?: string;

  constructor(attrs: Props, protected children: VNode[] = []) {
    if (attrs && attrs["$key"] !== undefined) {
      this.key = `${attrs["$key"]}`;
    }
  }

  get dom() {
    return this._dom;
  }

  get firstNode() {
    return this._dom;
  }

  build() {
    this.buildNode();
    if (this.children) {
      this.children.forEach((c) => {
        c.build().setDomParent(this._dom);
      });
    }
    return this;
  }

  abstract buildNode(): void;

  setDomParent(parent?: Node, before?: VNode) {
    if (parent && this._dom) {
      if (before && before.firstNode) {
        parent.insertBefore(this._dom, before.firstNode);
      } else {
        parent.appendChild(this._dom);
      }
    }
  }

  update(newVNode: VNode) {
    this.updateNode(newVNode);
    // Delete / Update children
    let index = 0;
    while (index < this.children.length) {
      const child = this.children[index];
      const newChild = child.key !== undefined
        ? newVNode.children.find((nc) => nc.key === child.key)
        : newVNode.children[index];
      if (
        newChild && child.constructor === newChild.constructor &&
        child.updateableWith(newChild)
      ) {
        child.update(newChild);
        ++index;
      } else {
        child.delete();
        this.children.splice(index, 1);
      }
    }
    // Add / Move children
    newVNode.children.forEach((newChild, newIndex) => {
      const index = newChild.key !== undefined
        ? this.children.findIndex((c) => c.key === newChild.key)
        : this.children[newIndex]
        ? newIndex
        : -1;
      if (index === -1) {
        newChild.build().setDomParent(this._dom, this.children[newIndex]);
        this.children.splice(newIndex, 0, newChild);
      } else if (index !== newIndex) {
        this.children[index].setDomParent(this._dom, this.children[newIndex]);
        this.children.splice(newIndex, 0, this.children.splice(index, 1)[0]);
      }
    });
    return this;
  }

  abstract updateNode(newVNode: VNode): void;

  updateableWith(_newVNode: VNode) {
    return true;
  }

  delete() {
    this.children.forEach((child) => {
      child.delete();
    });
    this.deleteNode();
  }

  abstract deleteNode(): void;
}
