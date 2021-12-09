<template>
  <div class="node" :style="nodeStyle">
    {{ node.value }}
  </div>

  <Connector
    v-if="left"
    :fromX="leftConnectionPoint.x"
    :fromY="leftConnectionPoint.y"
    :toX="leftChildConnection.x"
    :toY="leftChildConnection.y"
    stroke="4"
  />
  <Connector
    v-if="right"
    :fromX="rightConnectionPoint.x"
    :fromY="rightConnectionPoint.y"
    :toX="rightChildConnection.x"
    :toY="rightChildConnection.y"
    stroke="4"
  />
</template>
<script>
import TreeNode from "./TreeNode.vue";
export default {
  extends: TreeNode,
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
