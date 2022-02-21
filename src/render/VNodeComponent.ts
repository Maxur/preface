import VNode from "./VNode.ts";
import Component from "../Component.ts";
import ComponentInstance from "../ComponentInstance.ts";
import Props from "../types/Props.ts";
import State from "../types/State.ts";

export default class VNodeComponent extends VNode {
  private value?: ComponentInstance<Props, State>;

  constructor(
    private component: Component<Props, State>,
    private attrs: Props,
    private slots: VNode[],
  ) {
    super(attrs);
  }

  get firstNode() {
    return this.value && this.value.virtualDom.firstNode;
  }

  buildNode() {
    this.value = new ComponentInstance(
      this.component,
      this.attrs,
      this.slots,
    );
  }

  setDomParent(parent?: VNode, before?: VNode) {
    if (parent && parent.dom && this.value) {
      if (before && before.firstNode) {
        this.value.mount(parent.dom, before.firstNode);
      } else {
        this.value.mount(parent.dom);
      }
    }
  }

  updateNode(newVNode: VNodeComponent) {
    if (this.value) {
      this.value.update(newVNode.attrs, newVNode.slots);
    }
  }

  deleteNode() {
    if (this.value) {
      this.value.destroy();
    }
  }
}
