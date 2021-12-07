<template>
  <div class="tree">
    <h1>Tree</h1>
    <div v-for="(row, level) in box" class="row" :key="level">
      <div
        v-for="node in row"
        class="node"
        :key="node.id"
        :style="nodeStyle(node, 150)"
      >
        {{ node.value }}
      </div>
    </div>
    <hr>
    flatten
    <div class="canvas">
      <div
        v-for="node in flatten"
        class="node"
        :key="node.id"
        :style="nodeXYStyle(node, 150, 150)"
      >
        {{ node.value }}
      </div>
    </div>
    <hr>
    Knuh
    <div class="canvas">
      <div
        v-for="node in knuth"
        class="node"
        :key="node.id"
        :style="nodeXYStyle(node, 50, 150)"
      >
        {{ node.value }}
      </div>
    </div>
    <!-- <code>{{ tree }}</code>
    <hr />
    <hr /> -->
    <code>
      {{knuth}}
      <!-- <div>{{rootOffset()}}</div>
      <div>{{ depth(tree.root) }}</div>
      <div>{{ depth(102) }}</div>
      <div>{{ depth(104) }}</div> -->
      <!-- <div>{{ root }}</div> -->
      <!-- <div v-for="child in traverse" :key="child.id">
        {{ child }}
      </div> -->
    </code>
  </div>
</template>
<script>
import tree from "../tree.json";
export default {
  name: "TreeDisplay",
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
    binaryTree() {
      const elements =  this.tree.nodes.map(node => {
        const links = this.tree.links.find((e) => e.childNode === node.id);
        return {...node, links}
      })
      const parents = this.tree.links.reduce((parents, item) => {
        const childNode = parents[item.parentNode] || {}
        return {...parents, [item.parentNode]: {...childNode, [item.left]: item.childNode}}
      }, {})

      return elements.map(item => {
        const {links = {}, ...node} = item
        const parent = links.parentNode
        const childrens = parents[node.id] || {}
        const left = childrens[true]
        const right = childrens[false]
        return {
          ...node, 
          parent, 
          left, 
          right,
        }
      })
    },
    flatten() {
      const maxDepth = this.traverse.reduce((max, node) => {
        if(node.depth > max) {
          return node.depth
        }
        return max
      }, 0)
      let nexts = [...new Array(maxDepth + 1)].map(() => 0)
      const map = this.binaryTree.reduce((map, item) => {
        return {...map, [item.id]: {...item}}
      }, {})
      const root = map[this.tree.root]
      const minimum_ws = (node, depth = 0) => {
        node.x = nexts[depth]
        node.y = depth
        nexts[depth]++
        if (node.left) {
          minimum_ws(map[node.left], depth + 1)
        }
        if (node.right) {
          minimum_ws(map[node.right], depth + 1)
        }
      }
      minimum_ws(root)
      return map
    },
    knuth() {
      const map = this.binaryTree.reduce((map, item) => {
        return {...map, [item.id]: {...item}}
      }, {})
      let i = 0;
      const root = map[this.tree.root]
      const knuth_layout = (node, depth) => {
        if (node.left) {
          knuth_layout(map[node.left], depth + 1)
        }
        node.x = i;
        node.y = depth;
        i++;
        if (node.right) {
          knuth_layout(map[node.right], depth + 1)
        }
      }
      knuth_layout(root, 0);
      return map
    },
    box() {
      const sorted = [...this.traverse].sort((a, b) => {
        if (a.depth === b.depth) {
          return a.relativeOffset - b.relativeOffset;
        }
        return a.depth - b.depth;
      });
      const box = sorted.reduce((box, node) => {
        if (!box[node.depth]) {
          box[node.depth] = [];
        }
        box[node.depth].push(node);
        return box;
      }, []);
      box.forEach((row, index) => {
        const offsets = {};
        
        if (index === 2) {
          console.log(index)
        }
        row.forEach((node) => {
          if (offsets[node.relativeOffset]) {
            const parent = node.parentNode;
            const recursiveTraverse = (id) => {
              const node = sorted.find((e) => e.id === id);
              node.additionalOffset = node.additionalOffset || 0 + 1;
              this.tree.links
                .filter((e) => e.parentNode === id)
                .forEach((e) => recursiveTraverse(e.childNode));
            };
            recursiveTraverse(parent);
            const { parentNode } = this.tree.links.find(e => e.childNode === parent)
            const recursiveRaise = (id, offset) => {
              const parentNode = sorted.find((e) => e.id === id);  
              if (!parentNode) {
                return
              }
              parentNode.additionalOffset =
                (parentNode.additionalOffset || 0) + offset;
                
              recursiveRaise(parentNode.parentNode, offset / 2)
            }
            recursiveRaise(parentNode, 0.5)
          }
          offsets[node.relativeOffset] = true;
        });
      });
      return box;
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
}

.canvas {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>
