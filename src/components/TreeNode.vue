<template>
  <div class="node" :style="nodeStyle">
    {{ node.value }}
  </div>
  <template v-if="bothChildren">
    <SideConnector
      :fromX="leftConnectionPoint.x"
      :fromY="leftConnectionPoint.y"
      :toX="leftChildConnection.x"
      :toY="leftChildConnection.y"
      stroke="4"
      radius="24"
    />
    <SideConnector
      :fromX="rightConnectionPoint.x"
      :fromY="rightConnectionPoint.y"
      :toX="rightChildConnection.x"
      :toY="rightChildConnection.y"
      stroke="4"
      radius="24"
    />
  </template>
  <template v-else-if="singleChild">
    <LineConnector
      :fromX="centralConnectionPoint.x"
      :fromY="centralConnectionPoint.y"
      :toX="singleChildConnection.x"
      :toY="singleChildConnection.y"
      stroke="4"
    />
  </template>
</template>
<script>
import LineConnector from "./LineConnector.vue";
import SideConnector from "./SideConnector.vue";
export default {
  components: {
    LineConnector,
    SideConnector
  },
  props: ["node", "width", "height", "dx", "dy", "left", "right"],
  computed: {
    isLeaf() {
      return !this.left && !this.right
    },
    hasLayout() {
      return ('x' in this.node)
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
        display: this.hasLayout ? 'flex' : 'none'
      };
    },
    centralConnectionPoint() {
      return {
        x: this.node.x * this.dx + this.width,
        y: this.node.y * this.dy + this.height,
      };
    },
    leftConnectionPoint() {
      return {
        x: this.node.x * this.dx + this.width / 2,
        y: this.node.y * this.dy + this.height / 2
      };
    },
    rightConnectionPoint() {
      return {
        x: this.node.x * this.dx + this.width * 3 / 2,
        y: this.node.y * this.dy + this.height / 2
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
