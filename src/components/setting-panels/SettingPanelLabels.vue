<template>
  <md-list class="setting-panel setting-panel-labels">
    <md-list-item
      class="md-elevation-1 section-title"
      @click="$emit('toggle-menu')"
    >
    
      <md-icon>label</md-icon>
      <span class="md-list-item-text">Labels</span>
    </md-list-item> 
    
    <li class="expander-content">
    
      <md-list-item>
        <div class="slider-container">
          
          <!-- Visibility -->
          <span class="md-body">Automatic Label Rotation</span>
          <br/>
          <md-switch
            class="md-primary"
            v-model="settings.labels.isEnabled"
            @change="updateSetting(controlTypes.LABELS_SET_ACTIVE, $event)"
          >
            <span class="label-value"> 
              {{settings.labels.isEnabled ? 'On' : 'Off'}}
            </span>
          </md-switch>

        </div>                
      </md-list-item>
      
      <md-list-item>
        <div class="slider-container">

          <span class="md-body">
            Font Scale
          </span>
          <span class="label-value"> 
            {{settings.labels.fontScale.toLocaleString()}}
          </span>
          <br/>
          <input type="range" min="0" max="400" :value="settings.labels.fontScale * 100" class="slider"
            @input="updateSetting(controlTypes.LABELS_SET_FONT_SCALE, parseFloat($event.target.value) / 100)">
          <br/>

        </div>                
      </md-list-item>
      
      
      <md-list-item v-if="settings.labels.isEnabled">
        <div class="slider-container">

          <span class="md-body">
            Visibility Threshold
          </span>
          <span class="label-value"> 
            {{settings.labels.visibilityThreshold.toLocaleString()}}
          </span>
          <br/>
          <input type="range" min="0" max="400" :value="settings.labels.visibilityThreshold * 100" class="slider"
            @input="updateSetting(controlTypes.LABELS_SET_VISIBILITY_THRESHOLD, parseFloat($event.target.value) / 100)">
          <br/>

        </div>                
      </md-list-item>
              
      <md-list-item>
        <div class="slider-container">
          <!-- BACKGROUND COLORS -->
          <br/>
          <span class="md-title">Text</span>
          <br/>
          <br/>
          <span class="md-body">
            Color
          </span>
          <span class="label-value"> 
            {{settings.labels.textColor}}
          </span>
          <input
          class=""
          type="color"
          v-model="settings.labels.textColor"
          placeholder="Color"
          @change="updateSetting(controlTypes.LABELS_SET_TEXT_COLOR, $event.target.value)"
          />
          <br/>
          <br/>
          <span class="md-body">
            Opacity
          </span>
          <span class="label-value"> 
            {{settings.labels.textOpacity.toLocaleString()}}
          </span>
          <br/>
          <input type="range" min="0" max="100" :value="settings.labels.textOpacity * 100" class="slider"
            @input="updateSetting(controlTypes.LABELS_SET_TEXT_OPACITY, parseFloat($event.target.value) / 100)">
          <br/>
          <br/>
          <span class="md-title">Background</span>
          <br/>
          <br/>
          <span class="md-body">
            Color
          </span>
          <span class="label-value"> 
            {{settings.labels.backgroundColor}}
          </span>
          <input
          class=""
          type="color"
          v-model="settings.labels.backgroundColor"
          placeholder="Color"
          @change="updateSetting(controlTypes.LABELS_SET_BACKGROUND_COLOR, $event.target.value)"
          />
          <br/>
          <br/>
          <span class="md-body">
            Opacity
          </span>
          <span class="label-value"> 
            {{settings.labels.backgroundOpacity.toLocaleString()}}
          </span>
          <br/>
          <input type="range" min="0" max="100" :value="settings.labels.backgroundOpacity * 100" class="slider"
            @input="updateSetting(controlTypes.LABELS_SET_BACKGROUND_OPACITY, parseFloat($event.target.value) / 100)">
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
  name: 'SettingPanelLabels',
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
.setting-panel-labels {
  
}
</style>
