<template>
  <div 
    @click="isActive = !isActive; $emit('change', isActive)"
    class="toggle-btn"
    :class="{active: isActive}"
    >
    <span class="btn"
      :style="{
        border: `2px solid ${color}`,
        background: isActive ? color : 'transparent'
      }">
    </span>
    <!-- <span class="label" :style="`color:${color}; border-bottom: 2px solid ${isActive? color : 'transparent'}`"> -->
    <span class="label" :style="`color:#182025; border-bottom: 2px solid ${isActive? color : 'transparent'}`">
      {{label}}
    </span>
  </div>
</template>

<script>
export default {
  name: 'ToggleBtn',
  props: {
    active: {
      type: Boolean,
      required: true
    },
    color: {
      type: String,
      default: '0xfa0808'
    },
    label: {
      type: String,
      required: true
    }
  },
  data: () => ({
    isActive: false
  }),
  mounted () {
    this.isActive = this.active
  },
  methods: {
    setActive (state) {
      this.isActive = state;
    }
  }
}
</script>

<style lang="scss">
.toggle-btn {
  cursor: pointer;

  span.label {
    pointer-events: none;
    transition: all ease-in-out 250ms;
  }

  .btn {

    display: inline-block;
    vertical-align: middle;
    border: 1px solid inherit;
    box-sizing: border-box;
    color:#333;
    width: 16px;
    height: 16px;
    border-radius: 15px;
    position: relative;
    cursor: pointer;
    
    &:before {
    // &:after {
      content: " ";
      border-radius: 50%;
      display: block;
      position: absolute;
      width: 12px;
      height: 12px;
      top: 1px;
      left: 1px;
      // background: rgba(#f1f2f3,0.2);
      background: transparent;
      // background: transparent;
      transition: all ease-in-out 250ms;
      opacity: 1;
      // border: 6px solid inherit;
      transform: scale(0);
    }
    // &:before {
    //   // background: rgba(#f1f2f3, 0.4);
    // background: transparent;
    // // border: 2px solid inherit;
    //   // border: none;
    //   transform: scale(1);
    // }
  }
  &.active {
    .btn{
      // &:before {
      //   background: transparent;
      //   border: 2px solid inherit;
      //   transform: scale(0);
      //   opacity: 1;
      // }
      // &:after {
      //   background: transparent;
      //   border: 2px solid inherit;
      // // background: rgba(#f1f2f3,0.2);
      //   // border-color: #333;
      //   transform: scale(1);
      //   opacity: 0.5;
      // }
    }
  }
}
</style>
