import Vue from 'vue'
import Vuex from 'vuex'
import {loadJS} from './utils/loadJS'
import * as controlTypes from './constants/control-types'

// VOs
import Group from './vo/Group'

const url = new URL(window.location.href);
const showIslands = url.searchParams.get('show-islands');

const themeColor = '#083868'
// const themeColor = '#8fc7e9'

const mockData = require('./../data/merged-dataset.json')
// const mockData = require('./../data/countries.json')
// const mockData = require('./../data/countries-fullnames.json')

Vue.use(Vuex);

/*
[PRESET APPLIED] {"simulation":{"needsRestart":false,"numVisibleNodes":0,"isRunning":true,"alphaDecay":0.00746,"links":{"strength":0.77,"distance":279},"charge":{"strength":242,"distanceMin":201,"distanceMax":258},"collision":{"strength":0.36,"radius":2.39},"forceX":{"strength":0},"forceY":{"strength":0}},"globals":{"backgroundColor":"#2e9dff","hue":0,"contrast":100,"grayscale":0},"links":{"color":"#ffffff","factorController":"none","minimumOpacity":0.5,"weightedOpacity":0,"minimumScale":3.51,"weightedScale":0},"nodes":{"useTwoColors":false,"mergeColumns":true,"color1":"#70ffe7","color2":"#448836","factorController":"number-of-links","minimumOpacity":1,"weightedOpacity":0,"minimumScale":4,"weightedScale":4.81},"labels":{"isEnabled":true,"fontScale":0.84,"visibilityThreshold":0,"textColor":"#02046a","textOpacity":1,"backgroundColor":"#70ffe7","backgroundOpacity":1},"caption":{"isEnabled":true,"textColor":"#ffffff","textSize":11,"backgroundColor":"#141a2b","backgroundOpacity":0.84,"borderColor":"#111111","borderOpacity":0,"borderSize":0}}
*/

// const CLIENT_ID = 'XXXXXXXXXXXXXXXXXXXXXXXX.googleusercontent.com'
// const API_KEY = 'XXXXXXXXXXXXXXXXXXXXXXXX-XXXX'
// // Array of API discovery doc URLs for APIs used by the quickstart
// const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4']
// // Authorization scopes required by the API; multiple scopes can be
// // included, separated by spaces.
// const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly profile'


const handleResponse = (response, commit) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'

  const linksColumns = Object.create(null)
  const linksNormalizedColumns = Object.create(null)

  const keys = Object.create(null)
  response.result.values.forEach((value, rowIndex) => {
    if (showIslands || (value[0] != '' && value[1] != '')) {
      // count column A and B all together
      keys[value[0]] = (keys[value[0]] || 0) + 1
      keys[value[1]] = (keys[value[1]] || 0) + 1
      // save columns data
      value.forEach((val, letterIndex) => {
        linksColumns[alphabet[letterIndex]] = linksColumns[alphabet[letterIndex]] || []
        linksColumns[alphabet[letterIndex]][rowIndex] = val
      })
    }
  })

  commit('setLinksColumnsData', {linksColumns})

  const min = Math.min(...Object.keys(keys).map(key => keys[key]))
  const max = Math.max(...Object.keys(keys).map(key => keys[key]))
  console.log({min, max})
  const keysToIndex = Object.create(null)
  const NODE_TYPE_A = 1
  const NODE_TYPE_B = 2
  const NODE_TYPE_MIX = 3
  const nodes = []
  let index = 0;
  Object.keys(keys).map((key) => {
    if (key != '') {
      const node = Object.create(null)
      node.id = index
      node.code = key
      node.name = key != '' ? mockData.countries[key].name : ''
      // node.name = mockData.countries[key].name
      // node.type = keysA[key] && keysB[key] ? NODE_TYPE_MIX : keysA[key] ? NODE_TYPE_A : NODE_TYPE_B
      node.type = 1//keysA[key] && keysB[key] ? NODE_TYPE_MIX : keysA[key] ? NODE_TYPE_A : NODE_TYPE_B
      // normalized radius [0-1] based on number of links
      // node.connectionScore = (keys[key] - min) / (max - min)
      // console.log('??', response.result.countries[key].linksCount)
      node.linksCount = key != '' ? response.result.countries[key].linksCount : 1;
      node.radius = (keys[key] - min) / (max - min)
      nodes.push(node)
      keysToIndex[key] = index;
      index += 1;
    }
  })
  
  // add links
  let links = []
  // const emptyNodeIndex = nodes.filter(node => node.name=='')[0].id
  response.result.values.forEach(value => {
    if (value[0] != '' && value[1] != '') {
      const link = Object.create(null)
      link.source = keysToIndex[value[0]]
      link.target = keysToIndex[value[1]]
      // console.log('#', link)
      // if (link.source != emptyNodeIndex && link.target != emptyNodeIndex) {
        links.push(link)
      // }
    // } else {
    //   console.log('Failed one', value )
    }
  })
  console.log('Finished with', links.length, 'links.' )
  commit('setNodesAndLinks', {nodes, links})
}
export default new Vuex.Store({
  state: {
    google: {
      isLoaded: false, // when API libraries are loaded
      isSignedIn: false, // when user is authenticated
      isReadyForUI: false, // when google sheet data is loaded
      user: {
        firstName: null,
        lastName: null,
        fullName: null,
        image: null,
        userId: null
      },
      document: {
        id: null,
        sheet: null,
        firstRow: 1,
        lastRow: null
      }
    },
    data: {
      nodes: null,
      links: null,
      linksColumns: null,
      linksNormalizedColumns: null
    },
    groups: [],
    settings: {
      globals: {
        backgroundColor: '#fafafa',
        hue: 0,
        contrast: 100,
        grayscale: 0
      },
      nodes: {
        useTwoColors: false,
        mergeColumns: true,
        // color1: '#8fc7e9',
        color1: themeColor,
        color2: '#333333',
        factorController: 'number-of-links',
        minimumOpacity: 1,
        weightedOpacity: 0,
        minimumScale: 2,
        weightedScale: 0.9
      },
      links: {
        // color: '#8fc7e9',
        color: themeColor,
        factorController: 'none',
        minimumOpacity: 1,
        weightedOpacity: 0,
        minimumScale: 1,
        weightedScale: 0
      },
      simulation: {
        needsRestart: false,
        numVisibleNodes: 0,
        isRunning: true,
        alphaDecay: 0.,
        links: {
          strength: 0.9,
          distance: 10,
        },
        charge: {
          strength: 0.6,
          distanceMin: 1,
          distanceMax: 10
        },
        collision: {
          strength: 0.3,
          radius: 5
        },
        forceX: {
          strength: 0.2,
        },
        forceY: {
          strength: 0.2,
        },
      },
      labels: {
        isEnabled: true,
        fontScale: 1.6,
        visibilityThreshold: 0.5,
        textColor: '#fafafa',
        textOpacity: 1,
        // backgroundColor: '#8fc7e9',
        backgroundColor: themeColor,
        backgroundOpacity: 1,
      },
      caption: {
        isEnabled: true,
        textColor: '#111111',
        textSize: 14,
        backgroundColor: '#fafafa',
        backgroundOpacity: 0.5,
        borderColor: '#111111',
        borderOpacity: 1,
        borderSize: 1
      }
    }
  },
  getters: {
    isLoaded: state => state.google.isLoaded,
    isSignedIn: state => state.google.isSignedIn,
    isReadyForUI: state => state.google.isReadyForUI,
    links: state => state.data.links,
    nodes: state => state.data.nodes,
    document: state => state.google.document,
    user: state => state.google.user.userId ? state.google.user : null,
    linksColumns: state => state.data.linksColumns,
    linksNormalizedColumns: state => state.data.linksNormalizedColumns,
    groups: state => state.groups,
    settings: state => state.settings,
    captionSettings: state => state.settings.caption,
  },
  mutations: {
    applyPreset (state, preset) {
      // eslint-disable-next-line
      console.log('[PRESET APPLIED]', JSON.stringify(preset))
      Vue.set(state.settings, 'nodes', preset.nodes)
      Vue.set(state.settings, 'links', preset.links)
      Vue.set(state.settings, 'globals', preset.globals)
      Vue.set(state.settings, 'simulation', preset.simulation)
      Vue.set(state.settings, 'labels', preset.labels)
      Vue.set(state.settings, 'caption', preset.caption)
    },
    updateSetting (state, {name, value}) {

      switch (name) {
        
        // Simulation
        
        case controlTypes.SIMULATION_RESTART :
          state.settings.simulation.needsRestart = true
          break
        
        case controlTypes.SIMULATION_HAS_RESTARTED :
          state.settings.simulation.needsRestart = false
          break
        
        case controlTypes.SIMULATION_ALPHA_DECAY :
          state.settings.simulation.alphaDecay = value
          break

        // Links        
        case controlTypes.SIMULATION_LINKS_STRENGTH :
          state.settings.simulation.links.strength = value
          break
        case controlTypes.SIMULATION_LINKS_DISTANCE :
          state.settings.simulation.links.distance = value
          break
        // Charge 
        case controlTypes.SIMULATION_CHARGE_STRENGTH :
          state.settings.simulation.charge.strength = value
          break
        case controlTypes.SIMULATION_CHARGE_DISTANCE_MIN :
          state.settings.simulation.charge.distanceMin = value
          break
        case controlTypes.SIMULATION_CHARGE_DISTANCE_MAX :
          state.settings.simulation.charge.distanceMax = value
          break
        // Collision        
        case controlTypes.SIMULATION_COLLISION_STRENGTH :
          state.settings.simulation.collision.strength = value
          break
        case controlTypes.SIMULATION_COLLISION_RADIUS :
          state.settings.simulation.collision.radius = value
          break
        // Force X
        case controlTypes.SIMULATION_FORCE_X_STRENGTH :
          state.settings.simulation.forceX.strength = value
          break
        // Force Y
        case controlTypes.SIMULATION_FORCE_Y_STRENGTH :
          state.settings.simulation.forceY.strength = value
          break
        
        // RENDERER / CSS

        case controlTypes.GLOBALS_SET_HUE :
          state.settings.globals.hue = value
          break

        case controlTypes.GLOBALS_SET_CONTRAST :
          state.settings.globals.contrast = value
          break
  
        case controlTypes.GLOBALS_SET_GRAYSCALE :
          state.settings.globals.grayscale = value
          break
  
        case controlTypes.GLOBALS_SET_BACKGROUND_COLOR :
          state.settings.globals.backgroundColor = value
          break



        case controlTypes.NODES_USE_TWO_COLORS :
          state.settings.nodes.useTwoColors = value
          break

        // case controlTypes.NODES_MERGE_COLUMNS :
        //   // eslint-disable-next-line
        //   console.warn('Expeted to true by default, needs to be implemented')
        //   state.settings.nodes.mergeColumns = value
        //   break

        case controlTypes.NODES_SET_COLOR_1 :
          state.settings.nodes.color1 = value
          break

        case controlTypes.NODES_SET_COLOR_2 :
          state.settings.nodes.color2 = value
          break

        case controlTypes.NODES_SET_FACTOR_CONTROLLER :
          state.settings.nodes.factorController = value
          if (value.toLowerCase() == 'none' || value.trim() == '') {
            state.settings.nodes.weightedScale = 0
            state.settings.nodes.weightedOpacity = 0
          }
          break


        case controlTypes.NODES_SET_MINIMUM_OPACITY :
          state.settings.nodes.minimumOpacity = value
          break
        case controlTypes.NODES_SET_WEIGHTED_OPACITY :
          state.settings.nodes.weightedOpacity = value
          break

        case controlTypes.NODES_SET_MINIMUM_SCALE :
          state.settings.nodes.minimumScale = value
          break
        case controlTypes.NODES_SET_WEIGHTED_SCALE :
          state.settings.nodes.weightedScale = value
          break

        case controlTypes.LINKS_SET_COLOR :
          state.settings.links.color = value
          break

        case controlTypes.LINKS_SET_FACTOR_CONTROLLER :
          state.settings.links.factorController = value
          if (value.toLowerCase() == 'none' || value.trim() == '') {
            state.settings.links.weightedScale = 0
            state.settings.links.weightedOpacity = 0
          }
          break

        case controlTypes.LINKS_SET_MINIMUM_OPACITY :
          state.settings.links.minimumOpacity = value
          break

        case controlTypes.LINKS_SET_WEIGHTED_OPACITY :
          state.settings.links.weightedOpacity = value
          break


        case controlTypes.LINKS_SET_MINIMUM_SCALE :
          state.settings.links.minimumScale = value
          break

        case controlTypes.LINKS_SET_WEIGHTED_SCALE :
          state.settings.links.weightedScale = value
          break

        // LABELS

        case controlTypes.LABELS_SET_ACTIVE :
          state.settings.labels.isEnabled = value
          break

        case controlTypes.LABELS_SET_FONT_SCALE :
          state.settings.labels.fontScale = value
          break

        case controlTypes.LABELS_SET_VISIBILITY_THRESHOLD :
          state.settings.labels.visibilityThreshold = value
          break
        
        case controlTypes.LABELS_SET_TEXT_COLOR :
          state.settings.labels.textColor = value
          break
        
        case controlTypes.LABELS_SET_TEXT_OPACITY :
          state.settings.labels.textOpacity = value
          break

        case controlTypes.LABELS_SET_BACKGROUND_COLOR :
          state.settings.labels.backgroundColor = value
          break
        
        case controlTypes.LABELS_SET_BACKGROUND_OPACITY :
          state.settings.labels.backgroundOpacity = value
          break
        
        // CAPTION

        case controlTypes.CAPTION_IS_ENABLED :
          state.settings.caption.isEnabled = value
          break

        case controlTypes.CAPTION_TEXT_COLOR :
          state.settings.caption.textColor = value
          break

        case controlTypes.CAPTION_TEXT_SIZE :
          state.settings.caption.textSize = value
          break

        case controlTypes.CAPTION_BACKGROUND_COLOR :
          state.settings.caption.backgroundColor = value
          break

        case controlTypes.CAPTION_BACKGROUND_OPACITY :
          state.settings.caption.backgroundOpacity = value
          break

        case controlTypes.CAPTION_BORDER_COLOR :
          state.settings.caption.borderColor = value
          break

        case controlTypes.CAPTION_BORDER_SIZE :
          state.settings.caption.borderSize = value
          break

        case controlTypes.CAPTION_BORDER_OPACITY :
          state.settings.caption.borderOpacity = value
          break

      }
    },

    setLinksColumnsData (state, {linksColumns, linksNormalizedColumns}) {
      state.data.linksColumns = Object.assign(Object.create(null), linksColumns)
      state.data.linksNormalizedColumns = Object.assign(Object.create(null), linksNormalizedColumns)
    },
   
    updateLoadedStatus (state, isLoaded) {
      state.google.isLoaded = isLoaded
    },
   
    updateSigninStatus (state, isSignedIn) {
      state.google.isSignedIn = isSignedIn
      if (mockData) {
        state.google.user.firstName = 'mock',
        state.google.user.lastName = 'data',
        state.google.user.fullName = 'mock data',
        state.google.user.image = 'no-image',
        state.google.user.userId = 'mock-id'        
      } else if (isSignedIn) {        
        const profile = window['gapi'].auth2.getAuthInstance().currentUser.get().getBasicProfile()
        state.google.user.firstName = profile.getGivenName()
        state.google.user.lastName = profile.getFamilyName()
        state.google.user.fullName = profile.getName()
        state.google.user.image = profile.getImageUrl()
        state.google.user.userId = profile.getId()
      } else {
        state.google.user.firstName = null,
        state.google.user.lastName = null,
        state.google.user.fullName = null,
        state.google.user.image = null,
        state.google.user.userId = null
      }
    },
    updateReadyForUIStatus (state, isReadyForUI) {
      state.google.isReadyForUI = isReadyForUI
    },
    updateDocumentMeta (state, {id, sheet, firstRow, lastRow}) {
      state.google.document.id = id || state.google.document.id
      state.google.document.sheet = sheet || state.google.document.sheet
      state.google.document.firstRow = firstRow || state.google.document.firstRow
      state.google.document.lastRow = lastRow || state.google.document.lastRow

    },
    setNodesAndLinks (state, {nodes, links}) {
      state.data.nodes = nodes
      state.data.links = links
    },

    // Groups

    addNewGroup (state) {
      if (state.groups.length < 4) {
        state.groups.push(new Group())
      }
    },
    updateGroup (state, group) {
      const {id, visible, name, color, caseSensitive, queryType, queryString} = group
      // find group Id, then update values
      const index = state.groups.map(g => g.id).indexOf(id)
      if (index > -1) {
        Vue.set(state.groups[index], 'id', id)
        Vue.set(state.groups[index], 'visible', visible)
        Vue.set(state.groups[index], 'name', name)
        Vue.set(state.groups[index], 'color', color)
        Vue.set(state.groups[index], 'caseSensitive', caseSensitive)
        Vue.set(state.groups[index], 'queryType', queryType)
        Vue.set(state.groups[index], 'queryString', queryString)    
      } else {
        throw(new Error('group mismatch error'))
      }
    },
    updateGroupKeyAt (state, {index, keyName, value}) {
      state.groups[index][keyName] = value
    },
    deleteGroupById (state, id) {
      const index = state.groups.map(g => g.id).indexOf(id)
      if (index > -1) {
        state.groups.splice (index, 1)
      } else {
        throw(new Error('group mismatch error'))
      }
    },
  },
  actions: {
    applyPreset ({commit}, preset) {
      commit('applyPreset', preset)
    },
    updateSetting ({commit}, setting) {
      commit('updateSetting', setting)
    },
    addGroup ({state, commit}) {
      return new Promise((resolve, reject) => {
        if (state.groups.length < 4) {
          commit('addNewGroup')
          resolve(state.groups[state.groups.length - 1].id)
        } else {
          const message = 'Sorry, groups are currently limited to 4 items.'
          reject(message)
          alert(message)
        }
      })
    },
    updateGroup ({commit}, group) {
      commit('updateGroup', group)
    },
    updateGroupKeyAt ({commit}, {index, keyName, value}) {
      commit('updateGroupKeyAt', {index, keyName, value})
    },
    deleteGroupById ({commit}, id) {
      commit('deleteGroupById', id)
    },
    updateDocumentMeta ({commit}, {id, sheet, firstRow, lastRow}) {
      commit('updateDocumentMeta', {id, sheet, firstRow, lastRow})
    },
    validateThenLoadSheet ({state, commit}) {
      // if (state.google) {
      //   window['gapi'].client.sheets.spreadsheets.values.get({
      //     spreadsheetId: state.google.document.id,
      //     range: `${state.google.document.sheet}!A${state.google.document.firstRow}:Z${state.google.document.lastRow}`,
      //   }).then(response => {
      //     // eslint-disable-next-line
      //     console.log('[GOOGLE-API RESPONSE]:', response.result.values)
      //     handleResponse(response, commit)
      //   }, function(response) {
      //     // eslint-disable-next-line
      //     console.error('Error: ' + response.result.error.message)
      //   })
      // }
    },
    // signIn ({state, commit, dispatch}) {
    //   if (state.google.isLoaded) {
    //     window['gapi'].auth2
    //       .getAuthInstance()
    //       .signIn()
    //       .then(() => {
    //         commit('updateSigninStatus', true)
    //         dispatch('validateThenLoadSheet')
    //       })
    //   }
    // },
    // signOut ({state, commit}) {
    //   if (state.google.isLoaded) {
    //     window['gapi'].auth2
    //       .getAuthInstance()
    //       .signOut()
    //       .then(() => commit('updateSigninStatus', false))
    //   }
    // },
    initialize ({state, commit, dispatch}) {
      commit('updateLoadedStatus', true)
      commit('updateSigninStatus', true)
      commit('updateReadyForUIStatus', true)
      setTimeout(() => {
        // eslint-disable-next-line
        console.log('Mock:', mockData)
        // handleResponse({result: mockData}, commit)
        handleResponse({result: {
          range:'fake-sheet',
          majorDimension: 'ROWS',
          countries: mockData.countries,
          values: mockData.borders
        }}, commit);

      }, 0);
    }
  }
})

