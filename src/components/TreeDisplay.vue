<template>
  <div class="tree">
    <h1>Knuth</h1>
    <div class="canvas" :style="{ height: `${120 * (maxDepth + 1)}px` }">
      <KnuthTreeNode
        v-for="node in knuth"
        :key="node.id"
        :node="node"
        :width="80"
        :height="80"
        :dx="50"
        :dy="120"
        :left="knuth[node.left]"
        :right="knuth[node.right]"
      />
    </div>
    <hr />
    <h1>Wetherell Shannon Basic</h1>
    <div class="canvas" :style="{ height: `${120 * (maxDepth + 1)}px` }">
      <WetherellShannonTreeNode
        v-for="node in wetherellShannon"
        :key="node.id"
        :node="node"
        :width="80"
        :height="80"
        :dx="120"
        :dy="120"
        :left="wetherellShannon[node.left]"
        :right="wetherellShannon[node.right]"
      />
    </div>

    <hr />
    <h1>Wetherell Shannon Modified</h1>
    <div class="canvas" :style="{ height: `${120 * (maxDepth + 1)}px` }">
      <TreeNode
        v-for="node in wetherellShannonMod"
        :key="node.id"
        :node="node"
        :width="80"
        :height="80"
        :dx="120"
        :dy="120"
        :left="wetherellShannonMod[node.left]"
        :right="wetherellShannonMod[node.right]"
      />
    </div>
    <hr />
    <h1>Rheingold Tilford</h1>
    <div class="canvas" :style="{ height: `${120 * (maxDepth + 1)}px` }">
      <TreeNode
        v-for="node in reingoldTilford"
        :key="node.id"
        :node="node"
        :width="80"
        :height="80"
        :dx="120"
        :dy="120"
        :left="reingoldTilford[node.left]"
        :right="reingoldTilford[node.right]"
      />
    </div>
    <hr />
    <h1>Walker</h1>
    <div class="canvas" :style="{ height: `${150 * (maxDepth + 1)}px` }">
      <TreeNode
        v-for="node in walker"
        :key="node.id"
        :node="node"
        :width="80"
        :height="80"
        :dx="120"
        :dy="120"
        :left="walker[node.left]"
        :right="walker[node.right]"
      />
    </div>
  </div>
</template>
<script>
//import tree from "../tree.json";
//import tree from "../pq-tree.json";
import tree from "../pq-tree-m.json";
import KnuthTreeNode from "./KnuthTreeNode.vue";
import WetherellShannonTreeNode from "./WetherellShannonTreeNode.vue";
import TreeNode from "./TreeNode.vue";
import TreeMaker from "../libs/Tree";
export default {
  name: "TreeDisplay",
  components: {
    KnuthTreeNode,
    TreeNode,
    WetherellShannonTreeNode,
  },
  data() {
    return {
      tree,
    };
  },
  computed: {
    traverse() {
      const result = [];
      const recursiveTraverse = (id) => {
        const node = this.tree.nodes.find((e) => e.id === id);
        const nodeLinks = this.tree.links.find((e) => e.childNode === id);
        const depth = this.depth(id);
        const relativeOffset = this.relativeOffset(id);
        result.push({ ...node, depth, relativeOffset, ...nodeLinks });
        this.tree.links
          .filter((e) => e.parentNode === id)
          .forEach((e) => recursiveTraverse(e.childNode));
      };
      recursiveTraverse(this.tree.root);
      return result;
    },
    maxDepth() {
      return this.traverse.reduce((max, node) => {
        if (node.depth > max) {
          return node.depth;
        }
        return max;
      }, 0);
    },
    binaryTree() {
      const elements = this.tree.nodes.map((node) => {
        const links = this.tree.links.find((e) => e.childNode === node.id);
        return { ...node, links };
      });
      const parents = this.tree.links.reduce((parents, item) => {
        const childNode = parents[item.parentNode] || {};
        return {
          ...parents,
          [item.parentNode]: { ...childNode, [item.left]: item.childNode },
        };
      }, {});

      return elements.map((item) => {
        const { links = {}, ...node } = item;
        const parent = links.parentNode;
        const childrens = parents[node.id] || {};
        const isLeftChild = (parents[parent] || {})[true] === node.id;
        const left = childrens[true];
        const right = childrens[false];
        return {
          ...node,
          parent,
          left,
          right,
          isLeftChild,
        };
      });
    },
    knuth() {
      const map = this.binaryTree.reduce((map, item) => {
        return { ...map, [item.id]: { ...item } };
      }, {});
      let i = 0;
      const root = map[this.tree.root];
      const knuth_layout = (node, depth) => {
        if (node.left) {
          knuth_layout(map[node.left], depth + 1);
        }
        node.x = i;
        node.y = depth;
        i++;
        if (node.right) {
          knuth_layout(map[node.right], depth + 1);
        }
      };
      knuth_layout(root, 0);
      return map;
    },
    wetherellShannon() {
      const maxDepth = this.traverse.reduce((max, node) => {
        if (node.depth > max) {
          return node.depth;
        }
        return max;
      }, 0);
      let nexts = [...new Array(maxDepth + 1)].map(() => 0);
      const map = this.binaryTree.reduce((map, item) => {
        return { ...map, [item.id]: { ...item } };
      }, {});
      const root = map[this.tree.root];
      const minimum_ws = (node, depth = 0) => {
        node.x = nexts[depth];
        node.y = depth;
        nexts[depth]++;
        if (node.left) {
          minimum_ws(map[node.left], depth + 1);
        }
        if (node.right) {
          minimum_ws(map[node.right], depth + 1);
        }
      };
      minimum_ws(root);
      return map;
    },
    wetherellShannonMod() {
      const maxDepth = this.traverse.reduce((max, node) => {
        if (node.depth > max) {
          return node.depth;
        }
        return max;
      }, 0);
      const nexts = [...new Array(maxDepth + 1)].map(() => 0);
      const offsets = [...new Array(maxDepth + 1)].map(() => 0);
      const map = this.binaryTree.reduce((map, item) => {
        return { ...map, [item.id]: { ...item } };
      }, {});
      const root = map[this.tree.root];

      const setup = (node, depth = 0) => {
        if (node.left) {
          setup(map[node.left], depth + 1);
        }
        if (node.right) {
          setup(map[node.right], depth + 1);
        }
        node.y = depth;
        let place;
        if (node.left && node.right) {
          place = (map[node.left].x + map[node.right].x) / 2;
        } else if (node.left) {
          place = map[node.left].x;
        } else if (node.right) {
          place = map[node.right].x;
        } else {
          place = nexts[depth];
          node.x = place;
        }
        offsets[depth] = Math.max(offsets[depth], nexts[depth] - place);
        if (node.left || node.right) {
          node.x = place + offsets[depth];
        }
        nexts[depth] += 2;
        node.mod = offsets[depth];
      };
      const addMods = (node, modSum = 0) => {
        node.x += modSum;
        modSum += node.mod || 0;
        if (node.left) {
          addMods(map[node.left], modSum);
        }
        if (node.right) {
          addMods(map[node.right], modSum);
        }
      };
      setup(root);
      addMods(root);
      return map;
    },
    walker() {
      const treeMaker = new TreeMaker();
      treeMaker.config = {
        ...treeMaker.config,
        topYAdjustment: -3,
      };
      const map = this.binaryTree.reduce((map, item) => {
        return { ...map, [item.id]: { ...item } };
      }, {});
      const root = map[this.tree.root];
      const walk = (node) => {
        treeMaker.add(node.id, node.parent || null, node);
        if (node.left) {
          walk(map[node.left])
        }
        if (node.right) {
          walk(map[node.right])
        }
      }
      walk(root)
      return treeMaker
        .layoutTree()
        .map((item) => {
          return { ...item.data, ...item };
        })
        .reduce((map, item) => {
          return { ...map, [item.id]: { ...item } };
        }, {});
    },
    reingoldTilford() {
      const step = 2;
      const maxDepth = this.maxDepth;
      const map = this.binaryTree.reduce((map, item) => {
        return { ...map, [item.id]: { ...item } };
      }, {});
      const root = map[this.tree.root];
      const getNode = (id) => {
        return map[id];
      };
      const traverse = (node, callback) => {
        callback(node);
        if (node.left) {
          traverse(getNode(node.left), callback);
        }
        if (node.right) {
          traverse(getNode(node.right), callback);
        }
      };
      const prepareData = (node, level, prevSibling) => {
        node.y = level;
        node.x = 0;
        node.final = 0;
        node.modifier = 0;
        node.prevSibling = prevSibling;
        if (node.left) {
          prepareData(getNode(node.left), level + 1, null);
        }
        if (node.right) {
          prepareData(getNode(node.right), level + 1, node.left || null);
        }
      };

      const firstPass = (node) => {
        if (node.left) {
          firstPass(getNode(node.left));
        }
        if (node.right) {
          firstPass(getNode(node.right));
        }
        if (node.prevSibling) {
          node.x = node.x + getNode(node.prevSibling).x + step;
        } else {
          node.x = 0;
        }
        if (node.left && node.right) {
          node.modifier =
            node.x - (getNode(node.right).x + getNode(node.left).x) / 2;
        } else if (node.left || node.right) {
          node.modifier = node.x;
        }
      };
      const secondPass = (node, modSum) => {
        node.final = node.x + modSum;
        if (node.left) {
          secondPass(getNode(node.left), node.modifier + modSum);
        }
        if (node.right) {
          secondPass(getNode(node.right), node.modifier + modSum);
        }
      };
      const fixNodeConflicts = (node) => {
        if (node.left) {
          fixNodeConflicts(getNode(node.left));
        }
        if (node.right) {
          fixNodeConflicts(getNode(node.right));
        }

        let leftContour = -Infinity;
        if (node.left) {
          traverse(getNode(node.left), (node) => {
            leftContour = Math.max(leftContour, +node.final);
          });
        }

        let rightContour = +Infinity;
        if (node.right) {
          traverse(getNode(node.right), (node) => {
            rightContour = Math.min(rightContour, +node.final);
          });
        }
        if (leftContour >= rightContour) {
          traverse(
            getNode(node.right),
            (node) => (node.final += leftContour - rightContour + step)
          );
        }
      };
      const fixLeftBorder = (node) => {
        let leftCorrection = Infinity;
        traverse(
          node,
          (node) => (leftCorrection = Math.min(node.x, leftCorrection))
        );
        if (leftCorrection < 0) {
          traverse(node, (node) => (node.x -= leftCorrection));
        }
      };
      const placeX = (node) => {
        traverse(
          node,
          (node) => (node.x = node.final)
        );
      };
      const centerX = (node) => {
        traverse(
          node,
          (node) => {
            if (node.left && node.right) {
              const leftX = map[node.left].x
              const rightX = map[node.right].x
              node.x = (leftX + rightX) / 2
            }
            
          }
        );
      };

      prepareData(root, 0, null);
      firstPass(root);
      secondPass(root, 0);
      fixNodeConflicts(root);
      placeX(root);
      centerX(root);
      fixLeftBorder(root);
      return map;
    },
    root() {
      return this.tree.nodes.find((e) => e.id === this.tree.root);
    },
    rootOffset() {
      let current = this.tree.root;
      let result = 0;
      while (current) {
        current = this.getLeftChild(current);
        if (!current) {
          break;
        }
        result++;
      }
      return result;
    },
  },
  methods: {
    knutChild(id) {
      return this.knuth[id];
    },
    wetherellChild(id) {
      return this.wetherellShannonMod[id];
    },
    isLeaf(id) {
      return !this.tree.links.find((e) => e.parentNode === id);
    },
    getLeftChild(id) {
      const left = this.tree.links.find((e) => e.parentNode === id && e.left);
      if (left) {
        return left.childNode;
      }
    },
    getParent(id) {
      const self = this.tree.links.find((e) => e.childNode === id);
      if (self) {
        return self.parentNode;
      }
    },
    relativeOffset(id) {
      if (id === this.tree.root) {
        return 0;
      }
      const self = this.tree.links.find((e) => e.childNode === id);
      const parentOffset = this.relativeOffset(self.parentNode);
      if (self.left) {
        return parentOffset - 1;
      }
      return parentOffset + 1;
    },
    children(id) {
      return this.tree.links
        .filter((e) => e.parentNode === id)
        .map((e) => this.tree.nodes.find((n) => n.id === e.childNode));
    },
    depth(id) {
      const parent = this.getParent(id);
      if (parent) {
        return this.depth(parent) + 1;
      }
      return 0;
    },
    nodeStyle(node, dx = 50) {
      const offset =
        node.relativeOffset + (node.additionalOffset || 0) + this.rootOffset;
      return {
        left: `${offset * dx}px`,
        // top: `${(node.relativeOffset + this.rootOffset) * 50}px`,
      };
    },
    nodeXYStyle(node, dx = 50, dy = 50) {
      return {
        left: `${node.x * dx}px`,
        top: `${node.y * dy}px`,
      };
    },
  },
};
</script>
<style lang="scss" scoped>
.tree {
  text-align: left;
}
code {
  white-space: pre-wrap;
}
.row {
  height: 100px;
  position: relative;
}
.node {
  border: 1px solid #333;
  width: 80px;
  height: 80px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  text-align: center;
}

.canvas {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>
