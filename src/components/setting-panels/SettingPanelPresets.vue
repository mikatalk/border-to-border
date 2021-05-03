<template>
  <md-list class="setting-panel setting-panel-presets">
    
    <md-list-item
      class="md-elevation-1 section-title"
      @click="$emit('toggle-menu')"
    >
      <md-icon>settings</md-icon>
      <span class="md-list-item-text">Presets</span>
    </md-list-item> 
    
    <li class="expander-content">
      
      <md-list-item
        v-if="userCustomPreset"
        class="preset-btn"
        @click="applyPreset(userCustomPreset)"
      > 

        <svg  class="preset-preview" width="50px" height="35px" viewBox="0 0 117 77" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <rect :fill="userCustomPreset.globals.backgroundColor" x="0" y="0" width="117" height="77" rx="8"></rect>
            <polygon :fill="userCustomPreset.links.color" transform="translate(100.487806, 50.347990) rotate(-75.000000) translate(-100.487806, -50.347990) " points="72.8643361 48.2348276 128.111275 47.7756634 128.111275 52.7756634 74.119809 52.9203161"></polygon>
            <rect :fill="userCustomPreset.links.color" transform="translate(67.961634, 35.811270) rotate(-18.000000) translate(-67.961634, -35.811270) " x="30.9616336" y="33.3112701" width="74" height="5"></rect>
            <circle :fill="userCustomPreset.nodes.color1" cx="31.5" cy="46.5" r="19.5"></circle>
            <path :fill="userCustomPreset.nodes.color2" d="M109.5,42 C111.971142,42 115.336027,41.5302733 116.510512,40.7018575 C116.510512,40.7018575 116.510512,29.646437 116.510512,7.53559588 C116.510512,6.14649441 116.08746,5.01223492 115.241357,4.13281742 C113.972202,2.81369116 111.533012,3 109.5,3 C98.7304474,3 90,11.7304474 90,22.5 C90,33.2695526 98.7304474,42 109.5,42 Z"></path>
          </g>
        </svg>

        <span>Custom Preset</span>

      </md-list-item>
              
      <md-list-item
        @click="saveCustomPreset"
      >
        <md-button
          class="left-aligned-btn md-dense md-raised md-primary"
        >
          <span class="btn-text"> 
            Save Current
          </span>
          <md-icon>save</md-icon>
        </md-button> 

      </md-list-item>

      <md-list-item
        class="preset-btn"
        v-for="(preset, presetName, index) of presets"
        :key="presetName + '-' + index"
        @click="applyPreset(preset)"
      > 

        <svg  class="preset-preview" width="50px" height="35px" viewBox="0 0 117 77" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <rect :fill="preset.globals.backgroundColor" x="0" y="0" width="117" height="77" rx="8"></rect>
            <polygon :fill="preset.links.color" transform="translate(100.487806, 50.347990) rotate(-75.000000) translate(-100.487806, -50.347990) " points="72.8643361 48.2348276 128.111275 47.7756634 128.111275 52.7756634 74.119809 52.9203161"></polygon>
            <rect :fill="preset.links.color" transform="translate(67.961634, 35.811270) rotate(-18.000000) translate(-67.961634, -35.811270) " x="30.9616336" y="33.3112701" width="74" height="5"></rect>
            <circle :fill="preset.nodes.color1" cx="31.5" cy="46.5" r="19.5"></circle>
            <path :fill="preset.nodes.color2" d="M109.5,42 C111.971142,42 115.336027,41.5302733 116.510512,40.7018575 C116.510512,40.7018575 116.510512,29.646437 116.510512,7.53559588 C116.510512,6.14649441 116.08746,5.01223492 115.241357,4.13281742 C113.972202,2.81369116 111.533012,3 109.5,3 C98.7304474,3 90,11.7304474 90,22.5 C90,33.2695526 98.7304474,42 109.5,42 Z"></path>
          </g>
        </svg>
      
        <span> {{presetName}}</span>

      </md-list-item>
    </li>
  </md-list>

</template>

<script>
import {mapGetters} from 'vuex'
import {presets} from './../../constants/presets'
import {cloneDeep} from 'lodash-es'

export default {
  name: 'SettingPanelPresets',
  data: () => ({
    userCustomPreset: null,
    presets
  }),
  methods: {
    initializeUserPreset (preset) {
      // this.userCustomPreset = preset
      this.userCustomPreset = cloneDeep(preset)
      this.applyPreset(preset)
    },
    applyPreset (preset) {
      this.$store.dispatch('applyPreset', cloneDeep(preset))
    },
    saveCustomPreset () {
      const userCustomPreset = {
        simulation: this.settings.simulation,
        globals: this.settings.globals,
        links: this.settings.links,
        nodes: this.settings.nodes,
        renderer: this.settings.renderer,
        labels: this.settings.labels,
        caption: this.settings.caption
      }
      this.userCustomPreset = cloneDeep(userCustomPreset)
      // eslint-disable-next-line
      console.log('[PRESET]', JSON.stringify(userCustomPreset))
      localStorage.setItem('user-custom-preset', JSON.stringify(userCustomPreset))
    },
  },
  computed: {
    ...mapGetters([
      'settings'
    ])
  }
}
</script>

<style lang="scss">
.setting-panel-presets {
  
}
</style>
