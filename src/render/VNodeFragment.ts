import VNode from "./VNode.ts";
import Props from "../types/Props.ts";

export default class VNodeFragment extends VNode {
  constructor(attrs: Props, children: VNode[]) {
    super(attrs, children);
  }

  get firstNode() {
    const node = this.children.find((c) => c.firstNode);
    return node && node.firstNode;
  }

  buildNode() {
    this._dom = document.createDocumentFragment();
  }

  setDomParent(parent?: Node, before?: VNode) {
    this.children.forEach((c) => {
      c.setDomParent(parent, before);
    });
  }

  updateNode() {}

  deleteNode() {}
}
