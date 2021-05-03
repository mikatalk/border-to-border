<template>
  <div :class="['app page-container', {'menu-visible': menuVisible}]">
    <canvas-view
      ref="canvas-view"
      :style="`filter: hue-rotate(${settings.globals.hue}deg) grayscale(${settings.globals.grayscale}%) contrast(${settings.globals.contrast}%)`"
      v-if="isReadyForUI"
      :settings="settings"
      :nodes="nodes"
      :links="links"
      />

      <div class="groups-caption">
        <toggle-btn 
          ref="show-islands-toggle"
          :active="true" :label="showIslandsBtnLabel" color="#083868"
          @change="toggleIslands" /> 
      </div>

      <div class="zoom-controls">
        <span class="btn-zoom" @click="zoom('out')">-</span>
        <span class="btn-zoom" @click="zoom('in')">+</span>
      </div>

      <header class="header">
        <h1>Border to Border,</h1>
        <h2>A different perspective.</h2>
        <span class="btn" @click="showMoreInfo=!showMoreInfo">({{showMoreInfo ? 'Close' : 'More Info'}})</span>
        <transition name="fade">
          <div v-if="showMoreInfo">
            <p><em>Author: </em><a class="btn" href="https://www.michael-iriarte.com/" rel="no-follow">Michael 'Mika' Iriarte</a></p>
            <p><em>Tools: </em><a class="btn" href="https://d3js.org/" rel="no-follow">D3.js</a>
             and <a class="btn" href="https://threejs.org/examples/" rel="no-follow">Three.js</a></p>
            <p><em>Data: </em><a class="btn" href="https://github.com/geodatasource/country-borders" rel="no-follow">Borders</a> and
            <a class="btn" href="https://developers.google.com/public-data/docs/canonical/countries_csv" rel="no-follow">Centroids</a>
            <p><em>Note:</em> Overseas territories are represented as separate entities (e.g. Gibraltar, French Guiana)</p>
          </div>
        </transition>
      </header>

  </div>

</template>

<script>
import CanvasView from './components/CanvasView.vue'
import {mapGetters} from 'vuex'
import * as controlTypes from './constants/control-types'
import {tooltips} from './constants/tooltips'
import ToggleBtn from './components/ToggleBtn.vue'

export default {
  name: 'app',
  components: {
    'toggle-btn': ToggleBtn,
    'canvas-view': CanvasView,
  },
  data: () => ({
    controlTypes,
    tooltips,
    columnOptions: '',
    panelsOpened: {
      googleSheet: false,
      presets: false,
      simulation: false,
      globals: false,
      nodes: false,
      links: false,
      labels: false,
      groups: false,
      caption: false,
    },
    menuVisible: true,
    showIslands: true,
    showMoreInfo: false
  }),
  watch: {
    nodes () {
      this.$nextTick(this.initialize)
    },
  },
  computed: {
    ...mapGetters([
      'isLoaded', 'isSignedIn', 'isReadyForUI',
      'user',
      'nodes',
      'links',
      'linksColumns',
      'groups',
      'settings',
      'captionSettings'
    ]),
    showIslandsBtnLabel () {
      return this.showIslands ? 'Hide Islands' : 'Display Islands'
    }
  },
  methods: {
    toggleIslands (toggle) {
      if (toggle) {
        window.location.href = `${window.location.href}?show-islands=${toggle}`;
      } else {
        const [base] = window.location.href.split('?');
        window.location.href = base;
      }
    },
    zoom (zoomDirection) {
      this.$refs['canvas-view'].zoom(zoomDirection)
    },
    initialize () {
      // const userCustomPresetData = localStorage.getItem('user-custom-preset')
      // if (userCustomPresetData) {
      //   const userCustomPreset = JSON.parse(userCustomPresetData)
      //   this.$refs['setting-panel-presets'].initializeUserPreset(userCustomPreset)
      // }
    },
    setOpenMenu (menu) {
      for (let key in this.panelsOpened) {
        this.panelsOpened[key] = menu == key
      }
    },
    toggleGroupVisibilityAt (index) {
      this.$store.dispatch('updateGroupKeyAt', {
        index,
        keyName: 'visible',
        value: !this.groups[index].visible
      })
    },
    updateSetting (name, value = null) {
      this.$store.dispatch('updateSetting', {name, value})
    }
  },
  mounted () {

    const url = new URL(window.location.href);
    const showIslands = url.searchParams.get('show-islands');
    this.$refs['show-islands-toggle'].setActive(showIslands);
    this.showIslands = showIslands;

  }
}
</script>

<style lang="scss">
@import "./scss/base";
@import "./scss/variables";

html,
body,
.app.page-container {
  margin: 0;
  padding: 0;
  border: none;
  width: 100vw;
  height: 100vh;
  background: #272727;
  user-select: none;
  overflow: hidden;
  header.header {
    position: fixed;
    z-index: 1;
    top: 5px;
    left: 5px;
    border-radius: 5px;
    padding: 10px;
    min-width: 60px;
    list-style: none;
    margin: 10px 5px;
    color: #111111;
    max-width: 300px;
    background: rgba(255, 255, 255, 0.8);
    h1 {
      margin: 0;
      line-height: 1.2;
      font-size: 20px;
    }
    h2 {
      line-height: 1.2;
      margin: 0;
      font-size: 18px;
    }
    p {
      margin: 0;
      font-size: 12px;
    }
    em {
      font-weight: 600;
    }
    .btn {
      margin: 0;
      display: inline;
      color: #2e4552;
      font-weight: 300;
      font-size: 12px;
      text-decoration: underline;
      font-variant: all-petite-caps;
      cursor: pointer;
    }
  }
  .zoom-controls {
    position: fixed;
    z-index: 1;
    bottom: 5px;
    right: 5px;
    border-radius: 5px;
    padding: 10px;
    min-width: 60px;
    list-style: none;
    margin: 10px 5px;
    background: transparent;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .btn-zoom {
      margin: 0 0 0 10px;
      color: #2e4552;
      background: rgba(white, 0.8);
      font-weight: 100;
      font-size: 18px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 30px;
      height: 30px;
      position: relative;
      border: 1px solid #083868;
      border-radius: 4px;
      cursor: pointer;
    }
  }
  .groups-caption {
    position: fixed;
    z-index: 1;
    bottom: 5px;
    left: 5px;
    border-radius: 5px;
    padding: 10px;
    min-width: 60px;
    list-style: none;
    margin: 10px 5px;
    background: transparent;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .border-layer,
    .background-layer {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      border-radius: 5px;
      z-index: -1;
    }
    .group-color-block {
      height: auto;
      line-height: 1;
      padding: 4px 0;
    }
  }
}


</style>

