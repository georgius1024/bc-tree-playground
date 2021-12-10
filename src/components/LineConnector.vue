<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="connector"
    :width="width"
    :height="height"
    :viewBox="viewBox"
    :style="style"
  >
    <line
      :x1="x1"
      :y1="y1"
      :x2="x2"
      :y2="y2"
      :stroke="black"
      :stroke-width="stroke"
      marker-end="url(#triangle)"
    />
    <circle
      :cx="x1"
      :cy="y1"
      :r="stroke"
      :stroke="black"
      fill="white"
      stroke-width="2"
    />
    <marker
      id="triangle"
      viewBox="0 0 10 10"
      refX="10"
      refY="5"
      markerUnits="strokeWidth"
      markerHeight="4"
      orient="auto"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" :fill="black" />
    </marker>
    <circle
      :cx="x2"
      :cy="y2"
      :r="stroke"
      :stroke="black"
      fill="white"
      stroke-width="2"
    />
  </svg>
</template>
<script>
export default {
  props: ["fromX", "fromY", "toX", "toY", "stroke"],
  computed: {
    padding() {
      return this.stroke * 2;
    },
    left() {
      return (this.fromX < this.toX ? this.fromX : this.toX) - this.padding;
    },
    top() {
      return (this.fromY < this.toY ? this.fromY : this.toY) - this.padding;
    },
    width() {
      return Math.abs(this.fromX - this.toX) + this.padding * 2;
    },
    height() {
      return Math.abs(this.fromY - this.toY) + this.padding * 2;
    },
    viewBox() {
      return `0 0 ${this.width} ${this.height}`;
    },
    x1() {
      return this.fromX < this.toX ? this.padding : this.width - this.padding;
    },
    y1() {
      return this.fromY < this.toY ? this.padding : this.height - this.padding;
    },
    x2() {
      return this.fromX < this.toX ? this.width - this.padding : this.padding;
    },
    y2() {
      return this.fromY < this.toY ? this.height - this.padding : this.padding;
    },
    black() {
      return '#333'
    },
    style() {
      return {
        position: "absolute",
        left: `${this.left}px`,
        top: `${this.top}px`,
        zIndex: 10,
      };
    },
  },
};
</script>
