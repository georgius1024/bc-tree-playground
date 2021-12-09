<template>
  <div class="node" :style="nodeStyle">
    {{ node.value }}
  </div>
  <template v-if="bothChildren">
    <Connector
      :fromX="leftConnectionPoint.x"
      :fromY="leftConnectionPoint.y"
      :toX="leftChildConnection.x"
      :toY="leftChildConnection.y"
      stroke="4"
    />
    <Connector
      :fromX="rightConnectionPoint.x"
      :fromY="rightConnectionPoint.y"
      :toX="rightChildConnection.x"
      :toY="rightChildConnection.y"
      stroke="4"
    />
  </template>
  <template v-else-if="singleChild">
    <Connector
      :fromX="centralConnectionPoint.x"
      :fromY="centralConnectionPoint.y"
      :toX="singleChildConnection.x"
      :toY="singleChildConnection.y"
      stroke="4"
    />
  </template>
</template>
<script>
import Connector from "./Connector.vue";
export default {
  components: {
    Connector,
  },
  props: ["node", "width", "height", "dx", "dy", "left", "right"],
  computed: {
    isLeaf() {
      return !this.left && !this.right
    },
    bothChildren() {
      return this.left && this.right
    },
    singleChild() {
      return this.left || this.right
    },
    nodeStyle() {
      return {
        left: `${this.node.x * this.dx + this.width / 2}px`,
        top: `${this.node.y * this.dy}px`,
        width: `${this.width}px`,
        height: `${this.height}px`,
      };
    },
    centralConnectionPoint() {
      return {
        x: this.node.x * this.dx + this.width,
        y: this.node.y * this.dy + this.height,
      };
    },
    leftConnectionPoint() {
      const {x, y} = this.centralConnectionPoint
      return {
        x: x - this.width / 8,
        y
      };
    },
    rightConnectionPoint() {
      const {x, y} = this.centralConnectionPoint
      return {
        x: x + this.width / 8,
        y
      };
    },
    leftChildConnection() {
      if (!this.left) {
        return false;
      }
      return {
        x: this.left.x * this.dx + this.width,
        y: this.left.y * this.dy,
      };
    },
    rightChildConnection() {
      if (!this.right) {
        return false;
      }
      return {
        x: this.right.x * this.dx + this.width,
        y: this.right.y * this.dy,
      };
    },
    singleChildConnection() {
      const child = this.singleChild
      if (!child) {
        return false;
      }
      return {
        x: child.x * this.dx + this.width,
        y: child.y * this.dy,
      };
    },

  },
};
</script>
<style lang="scss" scoped>
.node {
  box-sizing: border-box;
  border: 4px solid #777;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  text-align: center;
}
</style>
