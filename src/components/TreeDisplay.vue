<template>
  <div class="tree">
    <h1>Tree</h1>
    <!-- <code>{{ tree }}</code>
    <hr />
    <code>{{ traverse }}</code>
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
        {{relativeOffset(child.id)}}
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
        result.push(node);
        this.tree.links
          .filter((e) => e.parentNode === id)
          .forEach((e) => recursiveTraverse(e.childNode));
      };
      recursiveTraverse(this.tree.root);
      return result;
    },
    root() {
      return this.tree.nodes.find((e) => e.id === this.tree.root);
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
    rootOffset() {
      let current = this.tree.root
      let result = 0;
      while(current) {
        current = this.getLeftChild(current);
        if (!current) {
          break
        }
        result ++
      }
      return result;
    },
    relativeOffset(id) {
      const self = this.tree.links.find((e) => e.childNode === id);
      if (!self) {
        return 0; // Root
      }
      const parentOffset = this.relativeOffset(self.parentNode)
      if (self.left) {
        return parentOffset - 1
      }
      return parentOffset + 1
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
</style>
