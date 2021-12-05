<template>
  <div class="tree">
    <h1>Tree</h1>
    <div v-for="(row, level) in box" class="row" :key="level">
      <div v-for="node in row" class="node" :key="node.id" :style="nodeStyle(node, 150)">
        {{node.value}}
      </div>
    </div> 
    <!-- <code>{{ tree }}</code>
    <hr />
    <hr /> -->
    <code>
      <!-- <div>{{rootOffset()}}</div>
      <div>{{ depth(tree.root) }}</div>
      <div>{{ depth(102) }}</div>
      <div>{{ depth(104) }}</div> -->
      <!-- <div>{{ root }}</div> -->
      <div v-for="child in traverse" :key="child.id">
        {{ child }}
        <!-- {{ depth(child.id)}} -->
        <!-- {{ relativeOffset(child.id) }} -->
      </div>
    </code>
  </div>
</template>
<script>
const links = [
  {
    parentNode: 100,
    childNode: 101,
    left: true,
  },
  {
    parentNode: 100,
    childNode: 102,
    left: false,
  },
  {
    parentNode: 101,
    childNode: 103,
    left: true,
  },
  {
    parentNode: 101,
    childNode: 104,
    left: false,
  },
];
const nodes = [
  {
    id: 100,
    value: "Root",
  },
  {
    id: 101,
    value: "Left Child",
  },
  {
    id: 102,
    value: "Right Child",
  },
  {
    id: 103,
    value: "Left A",
  },
  {
    id: 104,
    value: "Left B",
  },
];
const root = 100;
export default {
  name: "TreeDisplay",
  data() {
    return {
      tree: {
        nodes,
        links,
        root,
      },
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
    box() {
      const sorted = [...this.traverse].sort((a, b) => {
        if (a.depth === b.depth) {
          return a.relativeOffset - b.relativeOffset;
        }
        return a.depth - b.depth;
      });
      return sorted.reduce((box, node) => {
        if (!box[node.depth]) {
          box[node.depth] = [];
        }
        box[node.depth].push(node);
        return box;
      }, []);
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
      return {
        left: `${(node.relativeOffset + this.rootOffset) * dx}px`,
        // top: `${(node.relativeOffset + this.rootOffset) * 50}px`,
      }
    }
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
}
</style>
