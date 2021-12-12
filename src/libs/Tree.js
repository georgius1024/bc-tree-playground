/**
 * This lib is based on ECOTree.js
 * https://github.com/mahasak/ECOTree
 * which is based on
 * Walker II, J. Q., "A Node-Positioning Algorithm for General Trees"
 */
import TreeNode from "./TreeNode";
class Tree {
  constructor(config = {}) {
    this.config = {
      iMaxDepth: 100,
      iLevelSeparation: 1,
      iSiblingSeparation: 1,
      iSubtreeSeparation: 1,
      defaultNodeWidth: 1,
      defaultNodeHeight: 0,
      iRootOrientation: Tree.RO_TOP,
      iNodeJustification: Tree.NJ_TOP,
      topXAdjustment: 0,
      topYAdjustment: 0,
      ...config,
    };
    this.maxLevelHeight = [];
    this.maxLevelWidth = [];
    this.previousLevelNode = [];

    this.rootYOffset = 0;
    this.rootXOffset = 0;

    this.nDatabaseNodes = [];
    this.mapIDs = {};

    this.root = new TreeNode(null, null, null, 2, 2);
  }

  //Layout algorithm
  firstWalk(tree, node, level) {
    let leftSibling = null;

    node.XPosition = 0;
    node.YPosition = 0;
    node.prelim = 0;
    node.modifier = 0;
    node.leftNeighbor = null;
    node.rightNeighbor = null;
    tree.setLevelHeight(node, level);
    tree.setLevelWidth(node, level);
    tree.setNeighbors(node, level);
    if (node.getChildrenCount() === 0 || level === tree.config.iMaxDepth) {
      leftSibling = node.getLeftSibling();
      if (leftSibling)
        node.prelim =
          leftSibling.prelim +
          tree.getNodeSize(leftSibling) +
          tree.config.iSiblingSeparation;
      else node.prelim = 0;
    } else {
      let n = node.getChildrenCount();
      for (let i = 0; i < n; i++) {
        let iChild = node.getChildAt(i);
        this.firstWalk(tree, iChild, level + 1);
      }

      let midPoint = node.getChildrenCenter(tree);
      midPoint -= tree.getNodeSize(node) / 2;
      leftSibling = node.getLeftSibling();
      if (leftSibling) {
        node.prelim =
          leftSibling.prelim +
          tree.getNodeSize(leftSibling) +
          tree.config.iSiblingSeparation;
        node.modifier = node.prelim - midPoint;
        this.apportion(tree, node, level);
      } else {
        node.prelim = midPoint;
      }
    }
  }

  apportion(tree, node, level) {
    let firstChild = node.getFirstChild();
    let firstChildLeftNeighbor = firstChild.leftNeighbor;
    let j = 1;
    for (
      let k = tree.config.iMaxDepth - level;
      firstChild && firstChildLeftNeighbor && j <= k;

    ) {
      let modifierSumRight = 0;
      let modifierSumLeft = 0;
      let rightAncestor = firstChild;
      let leftAncestor = firstChildLeftNeighbor;
      for (let l = 0; l < j; l++) {
        rightAncestor = rightAncestor.nodeParent;
        leftAncestor = leftAncestor.nodeParent;
        modifierSumRight += rightAncestor.modifier;
        modifierSumLeft += leftAncestor.modifier;
      }

      let totalGap =
        firstChildLeftNeighbor.prelim +
        modifierSumLeft +
        tree.getNodeSize(firstChildLeftNeighbor) +
        tree.config.iSubtreeSeparation -
        (firstChild.prelim + modifierSumRight);
      if (totalGap > 0) {
        let subtreeAux = node;
        let numSubtrees = 0;
        for (
          ;
          subtreeAux && subtreeAux !== leftAncestor;
          subtreeAux = subtreeAux.getLeftSibling()
        )
          numSubtrees++;

        if (subtreeAux) {
          let subtreeMoveAux = node;
          let singleGap = totalGap / numSubtrees;
          for (
            ;
            subtreeMoveAux !== leftAncestor;
            subtreeMoveAux = subtreeMoveAux.getLeftSibling()
          ) {
            subtreeMoveAux.prelim += totalGap;
            subtreeMoveAux.modifier += totalGap;
            totalGap -= singleGap;
          }
        }
      }
      j++;
      if (firstChild.getChildrenCount() === 0)
        firstChild = tree.getLeftmost(node, 0, j);
      else firstChild = firstChild.getFirstChild();
      if (firstChild) firstChildLeftNeighbor = firstChild.leftNeighbor;
    }
  }

  secondWalk(tree, node, level, X, Y) {
    if (level <= tree.config.iMaxDepth) {
      let xTmp = tree.rootXOffset + node.prelim + X;
      let yTmp = tree.rootYOffset + Y;
      let maxsizeTmp = 0;
      let nodesizeTmp = 0;
      let flag = false;

      switch (tree.config.iRootOrientation) {
        case Tree.RO_TOP:
        case Tree.RO_BOTTOM:
          maxsizeTmp = tree.maxLevelHeight[level];
          nodesizeTmp = node.height;
          break;

        case Tree.RO_RIGHT:
        case Tree.RO_LEFT:
          maxsizeTmp = tree.maxLevelWidth[level];
          flag = true;
          nodesizeTmp = node.width;
          break;
      }
      switch (tree.config.iNodeJustification) {
        case Tree.NJ_TOP:
          node.XPosition = xTmp;
          node.YPosition = yTmp;
          break;

        case Tree.NJ_CENTER:
          node.XPosition = xTmp;
          node.YPosition = yTmp + (maxsizeTmp - nodesizeTmp) / 2;
          break;

        case Tree.NJ_BOTTOM:
          node.XPosition = xTmp;
          node.YPosition = yTmp + maxsizeTmp - nodesizeTmp;
          break;
      }
      if (flag) {
        let swapTmp = node.XPosition;
        node.XPosition = node.YPosition;
        node.YPosition = swapTmp;
      }
      switch (tree.config.iRootOrientation) {
        case Tree.RO_BOTTOM:
          node.YPosition = -node.YPosition - nodesizeTmp;
          break;

        case Tree.RO_RIGHT:
          node.XPosition = -node.XPosition - nodesizeTmp;
          break;
      }
      if (node.getChildrenCount() !== 0)
        this.secondWalk(
          tree,
          node.getFirstChild(),
          level + 1,
          X + node.modifier,
          Y + maxsizeTmp + tree.config.iLevelSeparation
        );
      let rightSibling = node.getRightSibling();
      if (rightSibling) this.secondWalk(tree, rightSibling, level, X, Y);
    }
  }

  layoutTree() {
    this.maxLevelHeight = [];
    this.maxLevelWidth = [];
    this.previousLevelNode = [];
    this.firstWalk(this, this.root, 0);

    switch (this.config.iRootOrientation) {
      case Tree.RO_TOP:
      case Tree.RO_LEFT:
        this.rootXOffset = this.config.topXAdjustment + this.root.XPosition;
        this.rootYOffset = this.config.topYAdjustment + this.root.YPosition;
        break;

      case Tree.RO_BOTTOM:
      case Tree.RO_RIGHT:
        this.rootXOffset = this.config.topXAdjustment + this.root.XPosition;
        this.rootYOffset = this.config.topYAdjustment + this.root.YPosition;
    }

    this.secondWalk(this, this.root, 0, 0, 0);
    return this.nDatabaseNodes.map((node) => {
      const { id, pid, data, XPosition: x, YPosition: y } = node;
      return { id, pid, x, y, data };
    });
  }

  setLevelHeight(node, level) {
    if (!this.maxLevelHeight[level]) {
      this.maxLevelHeight[level] = 0;
    }
    if (this.maxLevelHeight[level] < node.height)
      this.maxLevelHeight[level] = node.height;
  }

  setLevelWidth(node, level) {
    if (!this.maxLevelWidth[level]) {
      this.maxLevelWidth[level] = 0;
    }
    if (this.maxLevelWidth[level] < node.width)
      this.maxLevelWidth[level] = node.width;
  }

  setNeighbors(node, level) {
    node.leftNeighbor = this.previousLevelNode[level];
    if (node.leftNeighbor) node.leftNeighbor.rightNeighbor = node;
    this.previousLevelNode[level] = node;
  }

  getNodeSize(node) {
    switch (this.config.iRootOrientation) {
      case Tree.RO_TOP:
      case Tree.RO_BOTTOM:
        return node.width;

      case Tree.RO_RIGHT:
      case Tree.RO_LEFT:
        return node.height;
    }
    return 0;
  }

  getLeftmost(node, level, maxlevel) {
    if (level >= maxlevel) return node;
    if (node.getChildrenCount() === 0) return null;

    let n = node.getChildrenCount();
    for (let i = 0; i < n; i++) {
      let iChild = node.getChildAt(i);
      let leftmostDescendant = this.getLeftmost(iChild, level + 1, maxlevel);
      if (leftmostDescendant) return leftmostDescendant;
    }

    return null;
  }

  add(id, pid, data, width, height) {
    const parentNode =
      this.nDatabaseNodes.find((e) => e.id === pid) || this.root;

    let node = new TreeNode(
      id,
      pid,
      data,
      width || this.config.defaultNodeWidth,
      height || this.config.defaultNodeHeight
    ); //New node creation...
    node.nodeParent = parentNode; //Set it's parent
    let i = this.nDatabaseNodes.length; //Save it in database
    node.dbIndex = this.mapIDs[id] = i;
    this.nDatabaseNodes[i] = node;
    let index = parentNode.nodeChildren.length; //Add it as child of it's parent
    node.siblingIndex = index;
    parentNode.nodeChildren[index] = node;
  }
}

//Constant values

//Tree orientation
Tree.RO_TOP = 0;
Tree.RO_BOTTOM = 1;
Tree.RO_RIGHT = 2;
Tree.RO_LEFT = 3;

//Level node alignment
Tree.NJ_TOP = 0;
Tree.NJ_CENTER = 1;
Tree.NJ_BOTTOM = 2;

export default Tree;
