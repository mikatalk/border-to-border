<template>
  <md-list class="setting-panel setting-panel-google-sheets">
    <md-list-item
      class="md-elevation-1 section-title"
      @click="$emit('toggle-menu')">
      <md-icon>table_chart</md-icon>
      <span class="md-list-item-text">Google Sheet</span>
    </md-list-item>
    <li class="expander-content">
      <!-- Document Id -->
      <md-list-item>
        <md-field class="md-list-item-text">
          <label>Document Id</label>
          <md-input v-model="document.id"></md-input>
        </md-field>
      </md-list-item>
      <!-- Sheet Name -->
      <md-list-item>
        <md-field class="md-list-item-text">
          <label>Sheet Name</label>
          <md-input v-model="document.sheet"></md-input>
        </md-field>
      </md-list-item>
      <!-- Selection Range -->
      <md-list-item style="margin-bottom: -10px;">
        <span class="md-caption"> Selection Range</span>
      </md-list-item>
      <md-list-item>
        <md-field class="md-list-item-text md-size-50" style="margin-right: 10px">
          <label>First</label>
          <md-input type="number" v-model="document.firstRow"></md-input>
        </md-field>
        <md-field class="md-list-item-text md-size-50" style="margin-left: 10px">
          <label>Last</label>
          <md-input type="number" v-model="document.lastRow"></md-input>
        </md-field>
      </md-list-item>
      <!-- RELOAD -->
      <md-list-item class="centered" @click="reloadPageWithNewQuery">
        <md-button
          class="left-aligned-btn md-dense md-raised md-primary">
          <span class="btn-text"> 
            Reload
          </span>
          <md-icon>cached</md-icon>
        </md-button> 
      </md-list-item>
    </li>
  </md-list>

</template>

<script>
import {mapGetters} from 'vuex'

export default {
  name: 'SettingPanelGoogleSheets',
  methods: {
    reloadPageWithNewQuery () {
      const [base] = window.location.href.split('?')
      window.location.href = `${base}?doc=${this.document.id}&sheet=${this.document.sheet}&first=${this.document.firstRow}&last=${this.document.lastRow}`
    }
  },
  computed: {
    ...mapGetters([
      'document'
    ])
  }
}
</script>

<style lang="scss">
.setting-panel-google-sheets {
  
}
</style>
