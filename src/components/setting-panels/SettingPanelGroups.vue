<template>
  <md-list class="setting-panel setting-panel-groups">
    <md-list-item
      class="md-elevation-1 section-title"
      @click="$emit('toggle-menu')"
    >
      <md-icon>highlight</md-icon>
      <span class="md-list-item-text">Groups</span>
    </md-list-item> 
    
    <li class="expander-content">
    
      <md-list-item
        v-for="(group, index) of groups"
        :key="group.id"
        :class="['group-color-block', {disabled: !group.visible}]"
      >

        <div class="text-input-with-trash md-list-item-text">
          <span class="label">
            <input
              class=""
              type="color"
              v-model="group.color"
              placeholder="Color"
              @change="updateGroupColorAt(index, $event.target.value)"
            />
            <span
              class="group-name"
              @click="editGroupById(group.id)"
            >
              {{group.name}}
            </span>
          </span>
          <span class="label-value"
            @click="editGroupById(group.id)"
          > 
            {{group.queryString}}
          </span>
          <span
            class="visibility-btn"
            @click="toggleGroupVisibilityAt(index)"
          >
            <md-icon>remove_red_eye</md-icon>
          </span>
          <span
            class="trash-btn"
            @click="deleteGroupById(group.id)"
          >
            <md-icon>delete</md-icon>
          </span>
        </div> 
      </md-list-item>
      

      <add-group-prompt
        ref="add-group-prompt"
      />

    
    </li>
  </md-list>   
</template>

<script>
import {mapGetters} from 'vuex'
import {tooltips} from './../../constants/tooltips'
import * as controlTypes from './../../constants/control-types'
import AddGroupPrompt from './../AddGroupPrompt.vue'

export default {
  name: 'SettingPanelGroups',
  components: {
    'add-group-prompt': AddGroupPrompt,
  },
  data: () => ({
    controlTypes,
    tooltips
  }),
  methods: {
    updateSetting (name, value = null) {
      this.$store.dispatch('updateSetting', {name, value})
    },
    editGroupById (id) {
      this.$refs['add-group-prompt'].openGroupById(id)
    },
    updateGroupColorAt (index, color) {
      this.$store.dispatch('updateGroupKeyAt', {
        index,
        keyName: 'color',
        value: color
      })
    },
    toggleGroupVisibilityAt (index) {
      this.$store.dispatch('updateGroupKeyAt', {
        index,
        keyName: 'visible',
        value: !this.groups[index].visible
      })
    },
    deleteGroupById (id) {
      this.$store.dispatch('deleteGroupById', id)
    },
  },
  computed: {
    ...mapGetters([
      'settings',
      'groups'
    ])
  }
}
</script>

<style lang="scss">
.setting-panel-groups {
  
}
</style>
