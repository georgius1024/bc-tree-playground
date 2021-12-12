class TreeNode {
  constructor(id, pid, data, width = 1, height = 1) {
    this.id = id;
    this.pid = pid;
    this.data = data;
    this.width = width;
    this.height = height;

    this.siblingIndex = 0;
    this.dbIndex = 0;

    this.XPosition = 0;
    this.YPosition = 0;
    this.prelim = 0;
    this.modifier = 0;
    this.leftNeighbor = null;
    this.rightNeighbor = null;
    this.nodeParent = null;
    this.nodeChildren = [];
  }

  getLevel() {
    if (this.nodeParent.id === null) {
      return 0;
    }
    return this.nodeParent.getLevel() + 1;
  }

  getChildrenCount() {
    return this.nodeChildren.length;
  }

  getLeftSibling() {
    if (this.leftNeighbor && this.leftNeighbor.nodeParent === this.nodeParent) {
      return this.leftNeighbor;
    }
    return null;
  }

  getRightSibling() {
    if (
      this.rightNeighbor &&
      this.rightNeighbor.nodeParent === this.nodeParent
    ) {
      return this.rightNeighbor;
    }
    return null;
  }

  getChildAt(i) {
    return this.nodeChildren[i];
  }

  getChildrenCenter(tree) {
    const leftmostChild = this.getFirstChild();
    const rightmostChild = this.getLastChild();
    return (
      leftmostChild.prelim +
      (rightmostChild.prelim -
        leftmostChild.prelim +
        tree.getNodeSize(rightmostChild)) /
        2
    );
  }

  getFirstChild() {
    return this.getChildAt(0);
  }

  getLastChild() {
    return this.getChildAt(this.getChildrenCount() - 1);
  }
}

export default TreeNode;
