<template>
  <md-list class="setting-panel setting-panel-nodes">
    <md-list-item
      class="md-elevation-1 section-title"
      @click="$emit('toggle-menu')"
    >
    
      <md-icon>toll</md-icon>
      <span class="md-list-item-text">Nodes</span>
    </md-list-item> 
    
    <li class="expander-content">
    
      <md-list-item>
        <div class="slider-container">
          <!-- Use Two Colors -->
          <md-switch
            class="md-primary switch-with-label"
              v-model="settings.nodes.useTwoColors"
              @change="updateSetting(controlTypes.NODES_USE_TWO_COLORS, $event)"
          >
          <span class="md-body">
            Use two colors
          </span>
            <span class="label-value"> 
                {{settings.nodes.useTwoColors ? 'On' : 'Off'}}
            </span>
          </md-switch>
        </div>                
      </md-list-item>

    
      <!-- Merge Two Columns -->
      <!-- 
      <md-list-item>
        <div class="slider-container">
          <md-switch
            class="md-primary switch-with-label"
              v-model="settings.nodes.mergeColumns"
              @change="updateSetting(controlTypes.NODES_MERGE_COLUMNS, $event)"
          >
          <span class="md-body">
            Merge Columns
          </span>
            <span class="label-value"> 
                {{settings.nodes.mergeColumns ? 'On' : 'Off'}}
            </span>
          </md-switch>
        </div>                
      </md-list-item>
      -->

            
      <md-list-item>
        <div class="slider-container">
          <span class="md-body">
            Color A
          </span>
          <input
          class=""
          type="color"
          v-model="settings.nodes.color1"
          placeholder="Color"
          @change="updateSetting(controlTypes.NODES_SET_COLOR_1, $event.target.value)"
          />
          <span class="label-value"> 
            {{settings.nodes.color1}}
          </span>
          <span v-if="settings.nodes.useTwoColors">
          <br/>
          <br/>
            <span class="md-body">
              Color B
            </span>
            <input
            class=""
            type="color"
            v-model="settings.nodes.color2"
            placeholder="Color"
            @change="updateSetting(controlTypes.NODES_SET_COLOR_2, $event.target.value)"
            />
            <span class="label-value"> 
              {{settings.nodes.color2}}
            </span>
          </span>
          <br/>
          <br/>
        </div>                
      </md-list-item>
 
      <md-list-item class="drop-down-list-item">
        <md-field>
          <label for="nodes-controller-column-selector">Factor Controller ({{settings.nodes.factorController}})</label>
          <md-select
            v-model="settings.nodes.factorController"
            name="nodes-controller-column-selector" 
            id="nodes-controller-column-selector"
            @input="updateSetting(controlTypes.NODES_SET_FACTOR_CONTROLLER, $event ||'none')"
            md-dense
          >
            <md-option value="none">None</md-option>
            <md-option value="number-of-links">Number of Links</md-option>
          </md-select>
        </md-field>
      </md-list-item> 

      <!-- <md-list-item v-show="settings.nodes.factorController != 'none'">
        <div class="slider-container">
          <md-switch
            class="md-primary switch-with-label"
              v-model="settings.nodes.opacityIsWeighted"
              @change="updateSetting(controlTypes.NODES_OPACITY_IS_WEIGHTED, $event)"
          >
          <span class="md-body">
            Weighted Opacity
          </span>
            <span class="label-value"> 
                {{settings.renderer.nodes.opacityIsWeighted ? 'On' : 'Off'}}
            </span>
          </md-switch>
        </div>
      </md-list-item> -->

<!-- 
      <md-list-item v-show="settings.renderer.nodes.letterController != 'none'">
        <div class="slider-container">
          <md-switch
            class="md-primary switch-with-label"
              v-model="settings.renderer.nodes.scaleIsWeighted"
              @change="updateSetting(controlTypes.NODES_SCALE_IS_WEIGHTED, $event)"
          >
          <span class="md-body">
            Weighted Scale
          </span>
            <span class="label-value"> 
                {{settings.renderer.nodes.scaleIsWeighted ? 'On' : 'Off'}}
            </span>
          </md-switch>
        </div>                
      </md-list-item>

               -->
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
            {{settings.nodes.minimumOpacity}}
          </span>
          <br/>
          <input type="range" min="0" max="100" :value="settings.nodes.minimumOpacity * 100" class="slider"
            @input="updateSetting(controlTypes.NODES_SET_MINIMUM_OPACITY, parseFloat($event.target.value / 100))">
          <br/>
          <span v-if="settings.nodes.factorController != 'none'">
            <span class="md-body">
              Weighted
            </span>
            <span class="label-value"> 
              {{settings.nodes.weightedOpacity}}
            </span>
            <br/>
            <input type="range" min="0" max="100" :value="settings.nodes.weightedOpacity * 100" class="slider"
              @input="updateSetting(controlTypes.NODES_SET_WEIGHTED_OPACITY, parseFloat($event.target.value / 100))">
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
            {{settings.nodes.minimumScale}}
          </span>
          <br/>
          <input type="range" min="0" max="400" :value="settings.nodes.minimumScale * 100" class="slider"
            @input="updateSetting(controlTypes.NODES_SET_MINIMUM_SCALE, parseFloat($event.target.value / 100))">
          <br/>
          <span v-if="settings.nodes.factorController != 'none'">
            <span class="md-body">
              Weighted
            </span>
            <span class="label-value"> 
              {{settings.nodes.weightedScale}}
            </span>
            <br/>
            <input type="range" min="0" max="800" :value="settings.nodes.weightedScale * 100" class="slider"
              @input="updateSetting(controlTypes.NODES_SET_WEIGHTED_SCALE, parseFloat($event.target.value / 100))">
            <br/>
          </span>
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
  name: 'SettingPanelNodes',
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
.setting-panel-nodes {
  
}
</style>
