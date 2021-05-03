<template>
  <md-list class="setting-panel setting-panel-links">
    <md-list-item
      class="md-elevation-1 section-title"
      @click="$emit('toggle-menu')"
    >
    
      <md-icon>settings_ethernet</md-icon>
      <!-- <md-icon>link</md-icon> -->
      <span class="md-list-item-text">Links</span>
    </md-list-item> 
    
    <li class="expander-content">




      <md-list-item>
        <div class="slider-container">

          <span class="md-body">
            Color
          </span>
          <input
          class=""
          type="color"
          v-model="settings.links.color"
          placeholder="Color"
          @change="updateSetting(controlTypes.LINKS_SET_COLOR, $event.target.value)"
          />
          <span class="label-value"> 
            {{settings.links.color}}
          </span>
          <br/>
          <br/>
        </div>
      </md-list-item> 



      <md-list-item class="drop-down-list-item">
        <md-field>
          <label for="links-controller-column-selector">Column Controller ({{settings.links.factorController}})</label>
          <md-select
            v-model="settings.links.factorController"
            name="links-controller-column-selector" 
            id="links-controller-column-selector"
            @input="updateSetting(controlTypes.LINKS_SET_FACTOR_CONTROLLER, $event ||'none')"
            md-dense
          >
            <md-option value="none">None</md-option>
            <md-option
              v-for="column in columnsWithoutNodes"
              :key="column"
              :value="column"
            >{{column}}</md-option>
          </md-select>
        </md-field>
      </md-list-item>


      <md-list-item>
        <div class="slider-container">     
          <br/>
          <span class="md-title">Opacity</span>
          <br/>
          <br/>
          <span class="md-body">
            Minimum
          </span>
          <span class="label-value"> 
            {{settings.links.minimumOpacity}}
          </span>
          <br/>
          <input type="range" min="0" max="100" :value="settings.links.minimumOpacity * 100" class="slider"
            @input="updateSetting(controlTypes.LINKS_SET_MINIMUM_OPACITY, parseFloat($event.target.value / 100))">
          <br/>
          <span v-if="settings.links.factorController != 'none'">
            <span class="md-body">
              Weighted
            </span>
            <span class="label-value"> 
              {{settings.links.weightedOpacity}}
            </span>
            <br/>
            <input type="range" min="0" max="100" :value="settings.links.weightedOpacity * 100" class="slider"
              @input="updateSetting(controlTypes.LINKS_SET_WEIGHTED_OPACITY, parseFloat($event.target.value / 100))">
            <br/>
          </span>
          <br/>
        </div>                
      </md-list-item>



      <md-list-item>
        <div class="slider-container">     
          <span class="md-title">Scale</span>
          <br/>
          <br/>
          <span class="md-body">
            Minimum
          </span>
          <span class="label-value"> 
            {{settings.links.minimumScale}}
          </span>
          <br/>
          <input type="range" min="0" max="400" :value="settings.links.minimumScale * 100" class="slider"
            @input="updateSetting(controlTypes.LINKS_SET_MINIMUM_SCALE, parseFloat($event.target.value / 100))">
          <br/>
          <span v-if="settings.links.factorController != 'none'">
            <span class="md-body">
              Weighted
            </span>
            <span class="label-value"> 
              {{settings.links.weightedScale}}
            </span>
            <br/>
            <input type="range" min="0" max="800" :value="settings.links.weightedScale * 100" class="slider"
              @input="updateSetting(controlTypes.LINKS_SET_WEIGHTED_SCALE, parseFloat($event.target.value / 100))">
            <br/>
          </span>
          <br/>
        </div>                
      </md-list-item>


<!-- 
      <md-list-item>
        <div class="slider-container">

          <span class="md-body">
            Color
          </span>
          <input
          class=""
          type="color"
          v-model="settings.renderer.links.color"
          placeholder="Color"
          @change="updateSetting(controlTypes.LINKS_COLOR, $event.target.value)"
          />
          <span class="label-value"> 
            {{settings.renderer.links.color}}
          </span>
          <br/>
          <br/>
          <span class="md-body">
            Opacity
          </span>
          <span class="label-value"> 
            {{settings.renderer.links.opacity}}
          </span>
          <br/>
          <input type="range" min="0" max="100" :value="settings.renderer.links.opacity * 100" class="slider"
            @input="updateSetting(controlTypes.LINKS_OPACITY, parseFloat($event.target.value / 100))">
          <br/>
          <span class="md-body">
            Scale
          </span>
          <span class="label-value"> 
            {{settings.renderer.links.scale}}
          </span>
          <br/>
          <input type="range" min="0" max="1000" :value="settings.renderer.links.scale * 100" class="slider"
            @input="updateSetting(controlTypes.LINKS_SCALE, parseFloat($event.target.value / 100))">
          <br/>
          <br/>

        </div>
      </md-list-item>  -->


    </li>
  </md-list>   
</template>

<script>
import {mapGetters} from 'vuex'
import {tooltips} from './../../constants/tooltips'
import * as controlTypes from './../../constants/control-types'

export default {
  name: 'SettingPanelLinks',
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
      'settings',
      'linksColumns'
    ]),
    columnsWithoutNodes () {
      if (!this.linksColumns) {
        return []
      } else {
        return Object.keys(this.linksColumns).slice(2).map(key => key.toUpperCase())
      }
    },
  }
}
</script>

<style lang="scss">
.setting-panel-links {
  
}
</style>
