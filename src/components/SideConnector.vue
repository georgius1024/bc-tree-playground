<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    :viewBox="viewBox"
    :style="style"
  >
    <line
      :x1="startingPoint.x"
      :y1="startingPoint.y"
      :x2="firstJunction.x"
      :y2="firstJunction.y"
      stroke="black"
      :stroke-width="stroke"
    />
    <path
      :d="`
      M ${firstJunction.x} ${firstJunction.y} 
      C ${firstJunction.x + (isRight ? +radius : -radius)} ${firstJunction.y}  
        ${secondJunction.x} ${secondJunction.y}  
        ${secondJunction.x} ${secondJunction.y}
      `"
      stroke="black"
      :stroke-width="stroke"
      fill="transparent"
      stroke-linecap="round"
    />
    <line
      :x1="secondJunction.x"
      :y1="secondJunction.y"
      :x2="endingPoint.x"
      :y2="endingPoint.y"
      stroke="black"
      :stroke-width="stroke"
      stroke-linecap="round"
      marker-end="url(#triangle)"
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
      <path d="M 0 0 L 10 5 L 0 10 z" />
    </marker>
    <circle
      :cx="x1"
      :cy="y1"
      :r="stroke"
      stroke="black"
      fill="white"
      stroke-width="2"
    />
    <circle
      :cx="x2"
      :cy="y2"
      :r="stroke"
      stroke="black"
      fill="white"
      stroke-width="2"
    />
  </svg>
</template>
<script>
export default {
  props: ["fromX", "fromY", "toX", "toY", "stroke", "radius"],
  computed: {
    isRight() {
      return this.toX > this.fromX;
    },
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
    startingPoint() {
      return {
        x: this.fromX < this.toX ? this.padding : this.width - this.padding,
        y: this.fromY < this.toY ? this.padding : this.height - this.padding,
      };
    },
    endingPoint() {
      return {
        x: this.fromX < this.toX ? this.width - this.padding : this.padding,
        y: this.fromY < this.toY ? this.height - this.padding : this.padding,
      };
    },
    firstJunction() {
      return {
        x: this.endingPoint.x + (this.isRight ? -this.radius : +this.radius),
        y: this.startingPoint.y,
      };
    },
    secondJunction() {
      return {
        x: this.endingPoint.x,
        y: this.startingPoint.y + +this.radius,
      };
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
