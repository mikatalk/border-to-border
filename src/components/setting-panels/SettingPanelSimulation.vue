<template>
  <md-list class="setting-panel setting-panel-simulation">
    <md-list-item
      class="md-elevation-1 section-title"
      @click="$emit('toggle-menu')"
    >
    
      <md-icon>bubble_chart</md-icon>
      <span class="md-list-item-text">Simulation</span>
    </md-list-item> 
    
    <li class="expander-content">
    
      
      <md-list-item @click="updateSetting(controlTypes.SIMULATION_RESTART)">
        <md-button class="md-icon-button md-dense md-raised md-primary">
          <md-icon>cached</md-icon>
        </md-button> 
        <p style="margin-left: 15px;"> 
          Restart
        </p>  
      </md-list-item>
      
    
      <md-list-item>
        <div class="slider-container">
              
          <span class="md-body">
            Alpha Decay
            <md-tooltip
              md-direction="top"
              md-delay="500"
              v-html="this.tooltips.simulation.alphaDecay"
            />
          </span>
          <span class="label-value"> 
            {{settings.simulation.alphaDecay.toLocaleString()}}
          </span>
          <br/>
          <input type="range" min="0" max="100000" :value="settings.simulation.alphaDecay * 100000" class="slider"
            @input="updateSetting(controlTypes.SIMULATION_ALPHA_DECAY, parseFloat($event.target.value / 100000))">
          
          <br/>
          
          <span class="md-title">Links</span>
          <br/>
          <br/>
          
          <span class="md-body">
            Distance
            <md-tooltip
              md-direction="top"
              md-delay="500"
              v-html="this.tooltips.simulation.links.distance"
            />
          </span>
          <span class="label-value"> 
            {{settings.simulation.links.distance.toLocaleString()}}
          </span>
          <br/>
          <input type="range" min="0" max="1000" :value="settings.simulation.links.distance" class="slider"
            @input="updateSetting(controlTypes.SIMULATION_LINKS_DISTANCE, parseFloat($event.target.value))">
          
          <br/>
          
          <span class="md-body">
            Strength
            <md-tooltip
              md-direction="top"
              md-delay="500"
              v-html="this.tooltips.simulation.links.strength"
            />
          </span>
          <span class="label-value"> 
            {{(settings.simulation.links.strength).toLocaleString()}}</span>
          <br/>
          <input type="range" min="0" max="200" :value="settings.simulation.links.strength * 100" class="slider"
            @input="updateSetting(controlTypes.SIMULATION_LINKS_STRENGTH, parseFloat($event.target.value) / 100)">
          
          <br/>
          
          <span class="md-title">Charge</span>
          <br/>
          <br/>
          <span class="md-body">
            Strength
            <md-tooltip
              md-direction="top"
              md-delay="500"
              v-html="this.tooltips.simulation.charge.strength"
            />
          </span>
          <span class="label-value"> 
            {{settings.simulation.charge.strength.toLocaleString()}}</span>
          <br/>
          <input type="range" min="-500" max="500" :value="settings.simulation.charge.strength" class="slider"
            @input="updateSetting(controlTypes.SIMULATION_CHARGE_STRENGTH, parseFloat($event.target.value))">
          <br/>
          <span class="md-body">
            Distance Min
            <md-tooltip
              md-direction="top"
              md-delay="500"
              v-html="this.tooltips.simulation.links.distanceMin"
            />
          </span>
          <span class="label-value"> 
            {{settings.simulation.charge.distanceMin.toLocaleString()}}</span>
          <br/>
          <input type="range" min="1" max="500" :value="settings.simulation.charge.distanceMin" class="slider"
            @input="updateSetting(controlTypes.SIMULATION_CHARGE_DISTANCE_MIN, parseFloat($event.target.value))">
          <br/>
          <span class="md-body">
            Distance Max
            <md-tooltip
              md-direction="top"
              md-delay="500"
              v-html="this.tooltips.simulation.links.distanceMin"
            />
          </span>
          <span class="label-value"> 
            {{settings.simulation.charge.distanceMax.toLocaleString()}}
          </span>
          <br/>
          <input type="range" min="1" max="500" :value="settings.simulation.charge.distanceMax" class="slider"
            @input="updateSetting(controlTypes.SIMULATION_CHARGE_DISTANCE_MAX, parseFloat($event.target.value))">
          
          <br/>

          <span class="md-title">Collision</span>
          <br/>
          <br/>
          <span class="md-body">
            Strength
          </span>
          <span class="label-value"> 
            {{settings.simulation.collision.strength.toLocaleString()}}</span>
          <br/>
          <input type="range" min="0" max="100" :value="settings.simulation.collision.strength * 100" class="slider"
            @input="updateSetting(controlTypes.SIMULATION_COLLISION_STRENGTH, parseFloat($event.target.value / 100))">
          <br/>
          <span class="md-body">
            Radius
          </span>
          <span class="label-value"> 
            {{settings.simulation.collision.radius.toLocaleString()}}</span>
          <br/>
          <input type="range" min="0" max="1000" :value="settings.simulation.collision.radius * 100" class="slider"
            @input="updateSetting(controlTypes.SIMULATION_COLLISION_RADIUS, parseFloat($event.target.value / 100))">
        
          <br/>

          <span class="md-title">Force X</span>
          <br/>
          <br/>
          <span class="md-body">
            Strength
          </span>
          <span class="label-value"> 
            {{settings.simulation.forceX.strength.toLocaleString()}}</span>
          <br/>
          <input type="range" min="0" max="100" :value="settings.simulation.forceX.strength * 100" class="slider"
            @input="updateSetting(controlTypes.SIMULATION_FORCE_X_STRENGTH, parseFloat($event.target.value / 100))">
          <br/>

          <span class="md-title">Force Y</span>
          <br/>
          <br/>
          <span class="md-body">
            Strength
          </span>
          <span class="label-value"> 
            {{settings.simulation.forceY.strength.toLocaleString()}}</span>
          <br/>
          <input type="range" min="0" max="100" :value="settings.simulation.forceY.strength * 100" class="slider"
            @input="updateSetting(controlTypes.SIMULATION_FORCE_Y_STRENGTH, parseFloat($event.target.value / 100))">
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
  name: 'SettingPanelSimulation',
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
.setting-panel-simulation {
  
}
</style>
