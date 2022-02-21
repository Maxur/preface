import VNode from "./VNode.ts";

export default class VNodeText extends VNode {
  constructor(private value: string | number) {
    super(null);
  }

  buildNode() {
    this._dom = document.createTextNode(`${this.value}`);
  }

  updateNode(newVNode: VNodeText) {
    if (this._dom) {
      this.value = newVNode.value;
      this._dom.nodeValue = `${this.value}`;
    }
  }

  deleteNode() {
    if (this._dom) {
      (this._dom as Text).remove();
    }
  }
}
