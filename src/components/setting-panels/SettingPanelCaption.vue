<template>
  <md-list class="setting-panel setting-panel-caption">
    <md-list-item
      class="md-elevation-1 section-title"
      @click="$emit('toggle-menu')"
    >
    
      <md-icon>closed_caption</md-icon>
      <span class="md-list-item-text">Caption</span>
    </md-list-item> 
    
    <li class="expander-content">
    
      <md-list-item>
        <div class="slider-container">
          <br/>
          <md-switch
            class="md-primary switch-with-label"
              v-model="settings.caption.isEnabled"
              @change="updateSetting(controlTypes.CAPTION_IS_ENABLED, $event)"
          >
          <span class="md-body">
            Visible
          </span>
            <span class="label-value"> 
                {{settings.caption.isEnabled ? 'On' : 'Off'}}
            </span>
          </md-switch>
          <br/>
        </div>                
      </md-list-item>
      
      <md-list-item>
        <div class="slider-container">
          <span class="md-title">
            Text
          </span>
        </div>
      </md-list-item>
    
      <md-list-item>
        <div class="slider-container">
          <span class="md-body">
            Color
          </span>
          <input
          class=""
          type="color"
          v-model="settings.caption.textColor"
          placeholder="Color"
          @change="updateSetting(controlTypes.CAPTION_TEXT_COLOR, $event.target.value)"
          />
          <span class="label-value"> 
            {{settings.caption.textColor}}
          </span>
        </div>                
      </md-list-item>
 
      <md-list-item>
        <div class="slider-container">     
          <span class="md-body">
            Size
          </span>
          <span class="label-value"> 
            {{settings.caption.textSize}}
          </span>
          <br/>
          <input type="range" min="0" max="40" :value="settings.caption.textSize" class="slider"
            @input="updateSetting(controlTypes.CAPTION_TEXT_SIZE, parseFloat($event.target.value))">
        </div>                
      </md-list-item>

    <!-- BACKGROUND -->
    
      <md-list-item>
        <div class="slider-container">
          <span class="md-title">
            Background
          </span>
        </div>
      </md-list-item>
    
      <md-list-item>
        <div class="slider-container">
          <span class="md-body">
            Color
          </span>
          <input
          class=""
          type="color"
          v-model="settings.caption.backgroundColor"
          placeholder="Color"
          @change="updateSetting(controlTypes.CAPTION_BACKGROUND_COLOR, $event.target.value)"
          />
          <span class="label-value"> 
            {{settings.caption.backgroundColor}}
          </span>
        </div>                
      </md-list-item>
 
      <md-list-item>
        <div class="slider-container">     
          <span class="md-body">
            Opacity
          </span>
          <span class="label-value"> 
            {{settings.caption.backgroundOpacity}}
          </span>
          <br/>
          <input type="range" min="0" max="100" :value="settings.caption.backgroundOpacity * 100" class="slider"
            @input="updateSetting(controlTypes.CAPTION_BACKGROUND_OPACITY, parseFloat($event.target.value / 100))">
        </div>                
      </md-list-item>



<!-- BORDER -->

      <md-list-item>
        <div class="slider-container">
          
          <span class="md-title">
            Border
          </span>
        </div>
      </md-list-item>

      <md-list-item>
        <div class="slider-container">
          <span class="md-body">
            Color
          </span>
          <input
          class=""
          type="color"
          v-model="settings.caption.borderColor"
          placeholder="Color"
          @change="updateSetting(controlTypes.CAPTION_BORDER_COLOR, $event.target.value)"
          />
          <span class="label-value"> 
            {{settings.caption.borderColor}}
          </span>
        </div>                
      </md-list-item>
 
      <md-list-item>
        <div class="slider-container">     
          <span class="md-body">
            Opacity
          </span>
          <span class="label-value"> 
            {{settings.caption.borderOpacity}}
          </span>
          <br/>
          <input type="range" min="0" max="100" :value="settings.caption.borderOpacity * 100" class="slider"
            @input="updateSetting(controlTypes.CAPTION_BORDER_OPACITY, parseFloat($event.target.value / 100))">
          <br/>
          <span class="md-body">
            Size
          </span>
          <span class="label-value"> 
            {{settings.caption.borderSize}}
          </span>
          <br/>
          <input type="range" min="0" max="10" :value="settings.caption.borderSize" class="slider"
            @input="updateSetting(controlTypes.CAPTION_BORDER_SIZE, parseFloat($event.target.value))">
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
  name: 'SettingPanelCaption',
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
.setting-panel-caption {
  
}
</style>
