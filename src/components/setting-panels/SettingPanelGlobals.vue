<template>
  <md-list class="setting-panel setting-panel-globals">
    <md-list-item
      class="md-elevation-1 section-title"
      @click="$emit('toggle-menu')"
    >
    
      <md-icon>style</md-icon>
      <span class="md-list-item-text">Global Styles</span>
    </md-list-item> 
    
    <li class="expander-content">
    
      <md-list-item>
        <div class="slider-container">
          <!-- BACKGROUND COLORS -->
          <br/>
          <span class="md-title">Background</span>
          <br/>
          <br/>
          <span class="md-body">
            Color
          </span>
          <span class="label-value"> 
            {{settings.globals.backgroundColor}}
          </span>
          <input
          class=""
          type="color"
          v-model="settings.globals.backgroundColor"
          placeholder="Color"
          @change="updateSetting(controlTypes.GLOBALS_SET_BACKGROUND_COLOR, $event.target.value)"
          />
          <br/>
          <br/>

        </div>                
      </md-list-item>
      

        <md-list-item>
        <div class="slider-container">
          
        
          <span class="md-body">
            Hue
          </span>
          <span class="label-value"> 
            {{settings.globals.hue}}
          </span>
          <br/>
          <input type="range" min="0" max="360" :value="settings.globals.hue" class="slider"
            @input="updateSetting(controlTypes.GLOBALS_SET_HUE, parseFloat($event.target.value))">
          <br/>
          <span class="md-body">
            Contrast
          </span>
          <span class="label-value"> 
            {{settings.globals.contrast}}
          </span>
          <br/>
          <input type="range" min="90" max="200" :value="settings.globals.contrast" class="slider"
            @input="updateSetting(controlTypes.GLOBALS_SET_CONTRAST, parseFloat($event.target.value))">
          <br/>
          <span class="md-body">
            Grayscale
          </span>
          <span class="label-value"> 
            {{settings.globals.grayscale}}
          </span>
          <br/>
          <input type="range" min="0" max="100" :value="settings.globals.grayscale" class="slider"
            @input="updateSetting(controlTypes.GLOBALS_SET_GRAYSCALE, parseFloat($event.target.value))">
          <br/>
          <br/>
        </div>
      </md-list-item>

    </li>
  </md-list>   
</template>

<script>
import {mapGetters} from 'vuex'
import {tooltips} from './../../constants/tooltips'
import * as controlTypes from './../../constants/control-types'

export default {
  name: 'SettingPanelGlobals',
  data: () => ({
    controlTypes,
    tooltips
  }),
  methods: {
    updateSetting (name, value = null) {
      this.$store.dispatch('updateSetting', {name, value})
    }
  },
  computed: {
    ...mapGetters([
      'settings'
    ])
  }
}
</script>

<style lang="scss">
.setting-panel-globals {
  
}
</style>
