<template>
  <div class="canvas-view">
    <canvas ref="webgl-canvas" />
  </div>
</template>

<script>
import Graphics from './../graphics/Graphics'
import { mapGetters } from 'vuex'
import * as controlTypes from './../constants/control-types'

export default {
  name: 'CanvasView',
  computed: {
    ...mapGetters(['groups', 'linksColumns', 'linksNormalizedColumns', 'settings'])
  },
  props: {
    nodes: {
      typre: Array,
      default: () => []
    },
    links: {
      typre: Array,
      default: () => []
    },
  },
  watch: {
    nodes () {
      this.initialize()
    }, 
    // groups: {
    //   deep: true,
    //   handler () {
    //     this._graphics.refreshGroups([
    //       ...this.groups.map(g => Object.assign({}, g))
    //     ])
    //   }
    // },
    // 'settings.simulation.needsRestart' () {
    //   if (this.settings.simulation.needsRestart) {
    //     this._graphics.restart()
    //     this.$store.dispatch('updateSetting', {
    //       name: controlTypes.SIMULATION_HAS_RESTARTED,
    //       value: true
    //     })
    //   }
    // },
    // 'settings.simulation.alphaDecay' () {
    //   this._graphics.updateSettingByName(controlTypes.SIMULATION_ALPHA_DECAY, this.settings.simulation.alphaDecay)
    // }, 
    // // Links        
    // 'settings.simulation.links.strength' () {
    //   this._graphics.updateSettingByName(controlTypes.SIMULATION_LINKS_STRENGTH, this.settings.simulation.links.strength)
    // }, 
    // 'settings.simulation.links.distance' () {
    //   this._graphics.updateSettingByName(controlTypes.SIMULATION_LINKS_DISTANCE, this.settings.simulation.links.distance)
    // }, 
    // // Charge 
    // 'settings.simulation.charge.strength' () {
    //   this._graphics.updateSettingByName(controlTypes.SIMULATION_CHARGE_STRENGTH, this.settings.simulation.charge.strength)
    // }, 
    // 'settings.simulation.charge.distanceMin' () {
    //   this._graphics.updateSettingByName(controlTypes.SIMULATION_CHARGE_DISTANCE_MIN, this.settings.simulation.charge.distanceMin)
    // }, 
    // 'settings.simulation.charge.distanceMax' () {
    //   this._graphics.updateSettingByName(controlTypes.SIMULATION_CHARGE_DISTANCE_MAX, this.settings.simulation.charge.distanceMax)
    // }, 
    // // Collision        
    // 'settings.simulation.collision.strength' () {
    //   this._graphics.updateSettingByName(controlTypes.SIMULATION_COLLISION_STRENGTH, this.settings.simulation.collision.strength)
    // }, 
    // 'settings.simulation.collision.radius' () {
    //   this._graphics.updateSettingByName(controlTypes.SIMULATION_COLLISION_RADIUS, this.settings.simulation.collision.radius)
    // }, 
    // // Force X
    // 'settings.simulation.forceX.strength' () {
    //   this._graphics.updateSettingByName(controlTypes.SIMULATION_FORCE_X_STRENGTH, this.settings.simulation.forceX.strength)
    // }, 
    // // Force Y
    // 'settings.simulation.forceY.strength' () {
    //   this._graphics.updateSettingByName(controlTypes.SIMULATION_FORCE_Y_STRENGTH, this.settings.simulation.forceY.strength)
    // },

    // // GLOBALS

    // 'settings.globals.backgroundColor' () {
    //   this._graphics.updateSettingByName(controlTypes.GLOBALS_SET_BACKGROUND_COLOR, this.settings.globals.backgroundColor)
    // },
    // 'settings.globals.hue' () {
    //   this._graphics.updateSettingByName(controlTypes.GLOBALS_SET_HUE, this.settings.globals.hue)
    // },
    // 'settings.globals.contrast' () {
    //   this._graphics.updateSettingByName(controlTypes.GLOBALS_SET_CONTRAST, this.settings.globals.contrast)
    // },
    // 'settings.globals.grayscale' () {
    //   this._graphics.updateSettingByName(controlTypes.GLOBALS_SET_GRAYSCALE, this.settings.globals.grayscale)
    // },

    // // NODES

    // 'settings.nodes.useTwoColors' () {
    //   this._graphics.updateSettingByName(controlTypes.NODES_USE_TWO_COLORS, this.settings.nodes.useTwoColors)
    // },
    // // TODO: Look into implementing mergeColumns
    // // 'settings.nodes.mergeColumns' () {
    // //   this._graphics.updateSettingByName(controlTypes.NODES_MERGE_COLUMNS, this.settings.nodes.mergeColumns)
    // // },
    // 'settings.nodes.color1' () {
    //   this._graphics.updateSettingByName(controlTypes.NODES_SET_COLOR_1, this.settings.nodes.color1)
    // },
    // 'settings.nodes.color2' () {
    //   this._graphics.updateSettingByName(controlTypes.NODES_SET_COLOR_2, this.settings.nodes.color2)
    // },
    // 'settings.nodes.factorController' () {
    //   this._graphics.updateSettingByName(controlTypes.NODES_SET_FACTOR_CONTROLLER, this.settings.nodes.factorController)
    // },
    // 'settings.nodes.minimumOpacity' () {
    //   this._graphics.updateSettingByName(controlTypes.NODES_SET_MINIMUM_OPACITY, this.settings.nodes.minimumOpacity)
    // },
    // 'settings.nodes.weightedOpacity' () {
    //   this._graphics.updateSettingByName(controlTypes.NODES_SET_WEIGHTED_OPACITY, this.settings.nodes.weightedOpacity)
    // },
    // 'settings.nodes.minimumScale' () {
    //   this._graphics.updateSettingByName(controlTypes.NODES_SET_MINIMUM_SCALE, this.settings.nodes.minimumScale)
    // },
    // 'settings.nodes.weightedScale' () {
    //   this._graphics.updateSettingByName(controlTypes.NODES_SET_WEIGHTED_SCALE, this.settings.nodes.weightedScale)
    // },

    // // LINKS

    // 'settings.links.color' () {
    //   this._graphics.updateSettingByName(controlTypes.LINKS_SET_COLOR, this.settings.links.color)
    // },
    // 'settings.links.factorController' () {
    //   this._graphics.updateSettingByName(controlTypes.LINKS_SET_FACTOR_CONTROLLER, this.settings.links.factorController)
    // },
    // 'settings.links.minimumOpacity' () {
    //   this._graphics.updateSettingByName(controlTypes.LINKS_SET_MINIMUM_OPACITY, this.settings.links.minimumOpacity)
    // },
    // 'settings.links.weightedOpacity' () {
    //   this._graphics.updateSettingByName(controlTypes.LINKS_SET_WEIGHTED_OPACITY, this.settings.links.weightedOpacity)
    // },
    // 'settings.links.minimumScale' () {
    //   this._graphics.updateSettingByName(controlTypes.LINKS_SET_MINIMUM_SCALE, this.settings.links.minimumScale)
    // },
    // 'settings.links.weightedScale' () {
    //   this._graphics.updateSettingByName(controlTypes.LINKS_SET_WEIGHTED_SCALE, this.settings.links.weightedScale)
    // },

    // // LABELS

    // 'settings.labels.isEnabled' () {
    //   this._graphics.updateSettingByName(controlTypes.LABELS_SET_ACTIVE, this.settings.labels.isEnabled)
    // },
    // 'settings.labels.fontScale' () {
    //   this._graphics.updateSettingByName(controlTypes.LABELS_SET_FONT_SCALE, this.settings.labels.fontScale)
    // },
    // 'settings.labels.visibilityThreshold' () {
    //   this._graphics.updateSettingByName(controlTypes.LABELS_SET_VISIBILITY_THRESHOLD, this.settings.labels.visibilityThreshold)
    // },
    // 'settings.labels.textColor' () {
    //   this._graphics.updateSettingByName(controlTypes.LABELS_SET_TEXT_COLOR, this.settings.labels.textColor)
    // },
    // 'settings.labels.textOpacity' () {
    //   this._graphics.updateSettingByName(controlTypes.LABELS_SET_TEXT_OPACITY, this.settings.labels.textOpacity)
    // },
    // 'settings.labels.backgroundColor' () {
    //   this._graphics.updateSettingByName(controlTypes.LABELS_SET_BACKGROUND_COLOR, this.settings.labels.backgroundColor)
    // },
    // 'settings.labels.backgroundOpacity' () {
    //   this._graphics.updateSettingByName(controlTypes.LABELS_SET_BACKGROUND_OPACITY, this.settings.labels.backgroundOpacity)
    // },
  },
  methods: {
    updateSetting (name, value) {
      if(this._graphics) {
        this._graphics.updateSettingByName(name, value)
      }
    },
    initialize () {
      this._graphics = new Graphics(
        this.$el,
        this.$refs['webgl-canvas'],
        this.settings,
        this.nodes,
        this.links,
        this.linksColumns,
        this.linksNormalizedColumns
      )
      // this._graphics.onScreenIdle = this.handleScreenIdle

      this._graphics.refreshGroups([
        ...this.groups.map(g => Object.assign({}, g)
      )])
    },
    zoom (zoomDirection) {
      this._graphics.zoomByIncrement(zoomDirection);
    },
  },
  destroyed () {
    this._graphics.dispose()
  }
}
</script>

<style lang="scss">
.canvas-view {
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #272727;
  position: relative;
  svg,
  canvas {
    z-index: 4;
    position: absolute;
    // opacity: 0.5;
    width: 100vw;
    min-height: 100vh;
    height: 100vh;
    max-height: 100vh;
    background: transparent;
  }
  .labels-canvas {
    z-index: 5;
    pointer-events: none;
  }
}
</style>
