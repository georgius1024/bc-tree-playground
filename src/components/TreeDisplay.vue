<template>
  <div class="tree">
    <h1>Knuth</h1>
    <div class="canvas" :style="{ height: `${150 * (maxDepth + 1)}px` }">
      <KnuthTreeNode
        v-for="node in knuth"
        :key="node.id"
        :node="node"
        :width="80"
        :height="80"
        :dx="50"
        :dy="120"
        :left="knutChild(node.left)"
        :right="knutChild(node.right)"
      />
    </div>
    <hr />
    <h1>Wetherell Shannon Mod</h1>
    <div class="canvas" :style="{ height: `${150 * (maxDepth + 1)}px` }">
      <TreeNode
        v-for="node in wetherellShannonMod"
        :key="node.id"
        :node="node"
        :width="80"
        :height="80"
        :dx="120"
        :dy="120"
        :left="wetherellChild(node.left)"
        :right="wetherellChild(node.right)"
      />
<!-- 
      <div
        v-for="node in wetherellShannonMod"
        class="node"
        :key="node.id"
        :style="nodeXYStyle(node, 150, 150)"
      >
        {{ node.value }}
      </div> -->
    </div>
  </div>
</template>
<script>
import tree from "../tree.json";
import KnuthTreeNode from './KnuthTreeNode.vue'
import TreeNode from './TreeNode.vue'
export default {
  name: "TreeDisplay",
  components: {
    KnuthTreeNode,
    TreeNode
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
        const left = childrens[true];
        const right = childrens[false];
        return {
          ...node,
          parent,
          left,
          right,
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
      return this.knuth[id]
    },
    wetherellChild(id) {
      return this.wetherellShannonMod[id]
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
