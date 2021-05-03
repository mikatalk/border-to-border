import * as THREE from 'three'
import {vertex, fragment} from './shader-node'
import {vertexBar, fragmentBar} from './shader-link'
// import Stats from './Stats'
// import {lerp} from './../utils/lerp'
import SimulationWorker from 'worker-loader!./simulation-worker.js'
import LayerLabels from './LayerLabels'
import * as controlTypes from './../constants/control-types'
import Group from './../vo/Group'
const mockData = require('./../../data/merged-dataset.json')
const RADIUS = 60
const SAFE_WIDTH = 10000
const SAFE_HEIGHT = 10000

const resolvePart = (value, comparator, sampleValue) => {
  value = parseFloat(value)
  sampleValue = parseFloat(sampleValue)
  if (comparator) {
    if (comparator == '>') {
      return value > sampleValue
    } else if (comparator == '>=') {
      return value >= sampleValue
    } else if (comparator == '<') {
      return value < sampleValue
    } else if (comparator == '<=') {
      return value <= sampleValue
    } else if (comparator == '==') {
      return value == sampleValue
    } else {
      return false
    }
  } else {
    return false
  }
}

// import store from 
export default class Graphics {

  static SAFE_WIDTH = SAFE_WIDTH
  static SAFE_HEIGHT = SAFE_HEIGHT
  
  constructor (container, canvas, settings, nodesData, linksData, linksColumns, linksNormalizedColumns) {

    this.container = container
    this.canvas = canvas
    this.settings = settings
    // clock manager
    this.clock = new THREE.Clock(true)
    // loop callback reference
    this.animationCallback = null
    // time counter
    this.time = 0

    // // this.stats = new Stats()
    // this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    // // this.stats.dom.className = 'stats-dom'
    // document.querySelector('.app').appendChild(this.stats.dom)

    const {width, height} = this.container.getBoundingClientRect()
    this.width = width
    this.height = height
    // resize canvas to fill container space
    this.canvas.width = width
    this.canvas.height = height

    // Three elements
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      context: canvas.getContext('webgl2'), // request WebGL2
      antialias: true,
      alpha: true
    })
    // this.renderer.encoding = THREE.sRGBEncoding;
    this.renderer.setPixelRatio(window.devicePixelRatio )
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(this.settings.globals.backgroundColor , 1)
    
    this.scene = new THREE.Scene()
    
    this.camera = new THREE.OrthographicCamera(
      -1, 
      1,
      1, 
      -1, 
      -1000,
      10000)
    this.camera.position.z = 100
    this.camera.zoom = 0.8
    this.scene.add(this.camera)
    this.camera.previousZoom = this.camera.zoom
    this.cameraOffset = {
      x: 0,
      y: -600
    }

    this.mouse = {
      target: -1,
      isDown: false,
      position: {
        current: {
          ratioX: 0.5,
          ratioY: 0.5,
          projectedX: this.canvas.width / 2,
          projectedY: this.canvas.height / 2,
        },
        previous: {
          ratioX: 0.5,
          ratioY: 0.5,
          projectedX: this.canvas.width / 2,
          projectedY: this.canvas.height / 2,
        }
      }
    }

    // we use this texture to map mouse/touch events positions to mesh instance 
    this.pickingRenderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
    this.pixelBuffer = new Uint8Array(4)


    this.linksColumns = linksColumns
    this.linksNormalizedColumns = linksNormalizedColumns

    // NODES

    this.nodes = {
      data: nodesData,
      count: nodesData.length,
      indexes: [],
      types: [],
      offsets: [],
      groups: [],
      mouseTags: [],
      weights: [],
      geometry: null,
      material: null,
      mesh: null,
      uniforms: {
        time: { value: 1.0 },
        useTwoColors: { value: 0.0 },
        isPicking: { value: 0.0 },
        minimumOpacity: { value: this.settings.nodes.minimumOpacity },
        weightedOpacity: { value: this.settings.nodes.weightedOpacity },
        minimumScale: { value: this.settings.nodes.minimumScale },
        weightedScale: { value: this.settings.nodes.weightedScale },
        baseColor1: new THREE.Uniform(new THREE.Color(this.settings.nodes.color1)),
        baseColor2: new THREE.Uniform(new THREE.Color(this.settings.nodes.color2)),
        groupColor1: new THREE.Uniform(new THREE.Color(0x000000)),
        groupColor2: new THREE.Uniform(new THREE.Color(0x000000)),
        groupColor3: new THREE.Uniform(new THREE.Color(0x000000)),
        groupColor4: new THREE.Uniform(new THREE.Color(0x000000)),
        cameraOffset: new THREE.Uniform(new THREE.Vector2(this.cameraOffset.x, this.cameraOffset.y))
      },
      targetPositions: {
        x: new Float32Array(nodesData.length),
        y: new Float32Array(nodesData.length)
      }
    }

    
    for (let i = 0; i < this.nodes.count; i++) {
      this.nodes.offsets.push(0, 0, 1)
      this.nodes.indexes.push(i)
      this.nodes.mouseTags.push(
        ( (i+1) >> 16 & 255 ) / 255,
        ( (i+1) >> 8 & 255 ) / 255,
        ( (i+1) >> 0 & 255 ) / 255,
        1
      )
      this.nodes.groups.push(
        0,0,0,0
      )
      /*
      const NODE_TYPE_A = 1
      const NODE_TYPE_B = 2
      const NODE_TYPE_MIX = 3
      */
      this.nodes.types.push(this.nodes.data[i].type)
      this.nodes.weights.push(1)
    }
      
    this.nodes.geometry = new THREE.InstancedBufferGeometry()
    this.nodes.geometry.copy(new THREE.PlaneBufferGeometry(1, 1, 1, 1))
  
    this.nodes.geometry.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(this.nodes.offsets), 3))
    this.nodes.geometry.addAttribute('type', new THREE.InstancedBufferAttribute(new Float32Array(this.nodes.types), 1))
    this.nodes.geometry.addAttribute('particleIndex', new THREE.InstancedBufferAttribute(new Float32Array(this.nodes.indexes), 1))
    this.nodes.geometry.addAttribute('groups', new THREE.InstancedBufferAttribute(new Float32Array(this.nodes.groups), 4))
    this.nodes.geometry.addAttribute('mouseTag', new THREE.InstancedBufferAttribute(new Float32Array(this.nodes.mouseTags), 4))
    this.nodes.geometry.addAttribute('weight', new THREE.InstancedBufferAttribute(new Float32Array(this.nodes.weights), 1))

    this.nodes.material = new THREE.RawShaderMaterial( {
      uniforms: this.nodes.uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      side: THREE.FrontSide,
      transparent: true,
      alphaTest: 0.1,
      // depthWrite: true,
      blending: THREE.NormalBlending
      // blending: THREE.MultiplyBlending
      // blending: THREE.AdditiveBlending
    })
    
    this.nodes.mesh = new THREE.Mesh(this.nodes.geometry, this.nodes.material)
    this.scene.add(this.nodes.mesh)
    // this.nodes.mesh.position.z = -1

    // LINKS

    this.links = {
      data: linksData,
      count: linksData.length,
      indexes: [],
      scales: [],
      offsets: [],
      weights: [],
      orientations: [],
      geometry: null,
      material: null,
      mesh: null,
      uniforms: {
        time: { value: 1.0 },
        opacity: { value: this.settings.links.minimumOpacity + this.settings.links.weightedOpacity},
        isPicking: { value: 0.0 },
        minimumOpacity: { value: this.settings.links.minimumOpacity },
        weightedOpacity: { value: this.settings.links.weightedOpacity },
        minimumScale: { value: this.settings.links.minimumScale },
        weightedScale: { value: this.settings.links.weightedScale },
        baseColor: new THREE.Uniform(new THREE.Color(this.settings.links.color)),
        cameraOffset: new THREE.Uniform(new THREE.Vector2(this.cameraOffset.x, this.cameraOffset.y))
      },
      targetPositions: {
        x: new Float32Array(linksData.length),
        y: new Float32Array(linksData.length)
      },
      // targetAngle: new Float32Array(numLinks),
      quaternion: new THREE.Quaternion()
    }

    for (let i = 0; i < this.links.count; i++) {
      this.links.offsets.push(0, 0, 0)
      this.links.scales.push(1, RADIUS / 3)
      this.links.indexes.push(i)
      this.links.orientations.push(0,0,0,0)
      this.links.weights.push(1)
    }
      
    this.links.geometry = new THREE.InstancedBufferGeometry()
    this.links.geometry.copy(new THREE.PlaneBufferGeometry(
      1,
      1,
      1, 1
    ))

    this.links.geometry.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(this.links.offsets), 3))
    this.links.geometry.addAttribute('scale', new THREE.InstancedBufferAttribute(new Float32Array(this.links.scales), 2))
    this.links.geometry.addAttribute('particleIndex', new THREE.InstancedBufferAttribute(new Float32Array(this.links.indexes), 1))
    this.links.geometry.addAttribute('weight', new THREE.InstancedBufferAttribute(new Float32Array(this.links.weights), 1))

    const orientationAttribute = new THREE.InstancedBufferAttribute(new Float32Array(this.links.orientations), 4)
    this.links.geometry.addAttribute('orientation', orientationAttribute)
    
    this.links.material = new THREE.RawShaderMaterial( {
      uniforms: this.links.uniforms,
      vertexShader: vertexBar,
      fragmentShader: fragmentBar,
      side: THREE.FrontSide,
      transparent: true,
      alphaTest: 0.01,
      // depthWrite: false,
      blending: THREE.NormalBlending
      // blending: THREE.AdditiveBlending
    })

    this.links.mesh = new THREE.Mesh(this.links.geometry, this.links.material)
    this.scene.add(this.links.mesh)
    // this.links.mesh.position.z = -2


    // LABELS
    this.labels = new LayerLabels(this, this.nodes.data, this.settings.labels)
    this.scene.add(this.labels.mesh)


    // SIMULATION WORKER
    this.worker = new SimulationWorker()
    this.worker.postMessage({
      command: 'initialize', 
      nodes: nodesData,
      links: linksData,
      settings: this.settings.simulation,
      countries: mockData.countries
    })

    this.worker.onmessage = message => {
      const {command} = message.data
      switch (command) {
        case 'update-simulation-results' :
          for (let i = 0, l = this.nodes.count; i < l; i += 1) {
            this.setNodeTargetPositionAtIndex(i, message.data.valuesX[i], message.data.valuesY[i])
          }
          if (message.data.skipTransition) {
            const nodePositions = this.nodes.geometry.attributes.offset.array
            for (let i = 0, l = this.nodes.count; i < l; i += 1) {
              const i3 = i * 3
              nodePositions[i3 + 0] = this.nodes.targetPositions.x[i]
              nodePositions[i3 + 1] = this.nodes.targetPositions.y[i]
            }
            this.nodes.geometry.attributes.offset.needsUpdate = true
          }

        break

        case 'simulation-is-idle' :
         
        break
      }
    }

    // eslint-disable-next-line
    console.log('[Graphics]', this.nodes)

    this.addListeners()
    this.handleResize()
    this.simulationIsRunning = true
    this.updateNodesWeightedScales()
    this.updateLinksWeightedScales()
    this.loop()
  }

  refreshGroups (groups) {
    
    // update the 4 colors uniform
    groups.forEach((group, index) => {
      this.nodes.material.uniforms['groupColor' + (index + 1)].value = new THREE.Color(group.color)
    })
    
    // math any node with query selector
    const groupsAttribute = this.nodes.geometry.attributes.groups.array

    this.nodes.data.forEach((node, nodeIndex) => {
      // const i4 = nodeIndex * 4
      const i4 = nodeIndex * 4
      for (let i = 0; i < 4; i += 1) {
        if (i < groups.length && groups[i].queryString.trim() != '') {
          const group = groups[i]
          if (group.visible) {
            if (group.queryType == Group.QUERY_TYPE_REGEX) {
              const q = group.caseSensitive ? group.queryString : group.queryString.toLowerCase()
              const s = group.caseSensitive ? node.name : node.name.toLowerCase()
              groupsAttribute[i4 + i] = RegExp(q).test(s) ? 1 : 0
            } else if (group.queryType == Group.QUERY_TYPE_NUMERIC) {
              // const allowedComparators = ['<', '<=', '==', '>=', '>']
              // const allowedOperators = ['and', 'or']
              // const allowedColumnsLetters = 'abcdefghijklmnopqrstuvwxyz'.split()
              const [
                columnLetter1, comparator1, sampleValue1,
                operator,
                columnLetter2, comparator2, sampleValue2
              ] = group.queryString.split(' ').map(e => e.trim().toLowerCase())
              
              let isMatch = false

              if (operator == 'and') {
                // handle multipart
                isMatch = resolvePart(this.linksColumns[columnLetter1][nodeIndex], comparator1, sampleValue1) && resolvePart(this.linksColumns[columnLetter2][nodeIndex], comparator2, sampleValue2)
              } else if (operator == 'or') {
                // handle multipart
                isMatch = resolvePart(this.linksColumns[columnLetter1][nodeIndex], comparator1, sampleValue1) || resolvePart(this.linksColumns[columnLetter2][nodeIndex], comparator2, sampleValue2)
              } else {
                // handle singlepart
                isMatch = resolvePart(this.linksColumns[columnLetter1][nodeIndex], comparator1, sampleValue1)
              }
              groupsAttribute[i4 + i] = isMatch ? 1 : 0
            } else {
              groupsAttribute[i4 + i] = 0
            }
          } else {
            groupsAttribute[i4 + i] = 0
          }
        } else {
          groupsAttribute[i4 + i] = 0
        }
      }
    })
    this.nodes.geometry.attributes.groups.needsUpdate = true

  }

  restart () {
    this.simulationIsRunning = true
    this.worker.postMessage({command: 'update-simulation-setting', name: controlTypes.SIMULATION_RESTART})
    
  }

  updateSettingByName (name, value) {
    switch (name) {
      // case controlTypes.SIMULATION_IS_RUNNING :
      //   this.simulationIsRunning = value
      //   this.worker.postMessage({command: 'update-simulation-setting', name, value})
      //   break

      // case controlTypes.SIMULATION_HAS_RESTARTED :
      // case controlTypes.SIMULATION_RESTART :
      //   this.simulationIsRunning = true
      //   this.worker.postMessage({command: 'update-simulation-setting', name})
      //   break

      case controlTypes.SIMULATION_ALPHA_DECAY :
        this.settings.simulation.alphaDecay = value
        this.worker.postMessage({command: 'update-simulation-setting', name, value})
        break

      case controlTypes.SIMULATION_LINKS_STRENGTH :
        this.settings.simulation.links.strength = value
        this.worker.postMessage({command: 'update-simulation-setting', name, value})
        break
        
      case controlTypes.SIMULATION_LINKS_DISTANCE :
        this.settings.simulation.links.distance = value
        this.worker.postMessage({command: 'update-simulation-setting', name, value})
        break

      case controlTypes.SIMULATION_CHARGE_STRENGTH :
        this.settings.simulation.charge.strength = value
        this.worker.postMessage({command: 'update-simulation-setting', name, value})
        break

      case controlTypes.SIMULATION_CHARGE_DISTANCE_MIN :
        this.settings.simulation.charge.distanceMin = value
        this.worker.postMessage({command: 'update-simulation-setting', name, value})
        break

      case controlTypes.SIMULATION_CHARGE_DISTANCE_MAX :
        this.settings.simulation.charge.distanceMax = value
        this.worker.postMessage({command: 'update-simulation-setting', name, value})
        break

      case controlTypes.SIMULATION_COLLISION_STRENGTH :
        this.settings.simulation.collision.strength = value
        this.worker.postMessage({command: 'update-simulation-setting', name, value})
        break

      case controlTypes.SIMULATION_COLLISION_RADIUS :
        this.settings.simulation.collision.radius = value
        this.worker.postMessage({command: 'update-simulation-setting', name, value})
        break

      case controlTypes.SIMULATION_FORCE_X_STRENGTH :
        this.settings.simulation.forceX.strength = value
        this.worker.postMessage({command: 'update-simulation-setting', name, value})
        break

      case controlTypes.SIMULATION_FORCE_Y_STRENGTH :
        this.settings.simulation.forceY.strength = value
        this.worker.postMessage({command: 'update-simulation-setting', name, value})
        break
      
      // GLOBALS
      
      case controlTypes.GLOBALS_SET_BACKGROUND_COLOR :
        this.settings.globals.backgroundColor = value
        this.renderer.setClearColor(this.settings.globals.backgroundColor , 1)
        break
      
      // NODES

      case controlTypes.NODES_USE_TWO_COLORS :
        this.settings.nodes.useTwoColors = value
        this.nodes.mesh.material.uniforms.useTwoColors.value = value ? 1.0 : 0.0
        break

      // TODO: Look into implementing mergeColumns
      // case controlTypes.NODES_MERGE_COLUMNS :
      //   console.warn('TODO: implement nodes column un-merge')
      //   this.settings.nodes.mergeColumns = value
      //   break
      
      case controlTypes.NODES_SET_COLOR_1 :
        this.settings.nodes.color1 = value
        this.nodes.mesh.material.uniforms.baseColor1.value = new THREE.Color(value)
        break
      
      case controlTypes.NODES_SET_COLOR_2 :
        this.settings.nodes.color2 = value
        this.nodes.mesh.material.uniforms.baseColor2.value = new THREE.Color(value)
        break

      case controlTypes.NODES_SET_FACTOR_CONTROLLER :
        this.settings.nodes.factorController = (value || '').trim().toLowerCase()
        this.updateNodesWeightedScales()
        console.log('$$$$$$$$$$$$$$$$$$$$$$$$$')
        if (Object.keys(this.linksColumns).indexOf(this.settings.renderer.nodes.letterController) > -1
          && 
          this.settings.renderer.nodes.scaleIsWeighted
        ) {
          console.log('?????!!!!!!!!!!!!!!!!!!!!!!!!!?')
          this.worker.postMessage({command: 'update-nodes-weights', weights: this.linksColumns[this.settings.renderer.nodes.letterController]})
        } else {
          console.log('???????????????????????????????')
          this.worker.postMessage({command: 'update-nodes-weights'})
        }
        break

      case controlTypes.NODES_SET_MINIMUM_OPACITY :
        this.settings.nodes.minimumOpacity = value
        this.nodes.mesh.material.uniforms.minimumOpacity.value = this.settings.nodes.minimumOpacity
        break
      
      case controlTypes.NODES_SET_WEIGHTED_OPACITY :
        this.settings.nodes.weightedOpacity = value
        this.nodes.mesh.material.uniforms.weightedOpacity.value = this.settings.nodes.weightedOpacity
        break
   
      case controlTypes.NODES_SET_MINIMUM_SCALE :
        this.settings.nodes.minimumScale = value
        this.nodes.mesh.material.uniforms.minimumScale.value = value
        break

      case controlTypes.NODES_SET_WEIGHTED_SCALE :
        this.settings.nodes.weightedScale = value
        this.nodes.mesh.material.uniforms.weightedScale.value = value
        break

      // LINKS

      case controlTypes.LINKS_SET_COLOR :
        this.settings.links.color = value
        this.links.mesh.material.uniforms.baseColor.value = new THREE.Color(value)
        break

      case controlTypes.LINKS_SET_FACTOR_CONTROLLER :
        this.settings.links.factorController = (value || '').trim().toLowerCase()
        this.updateLinksWeightedScales()
        if (Object.keys(this.linksNormalizedColumns).indexOf(this.settings.links.factorController) > -1) {
          this.worker.postMessage({
            command: 'update-links-weights', 
            weights: this.linksNormalizedColumns[this.settings.links.factorController]
          })
        } else {
          this.worker.postMessage({command: 'update-links-weights'})
        }
        break
      
        case controlTypes.LINKS_SET_MINIMUM_OPACITY :
          this.settings.links.minimumOpacity = value
          this.links.mesh.material.uniforms.minimumOpacity.value = this.settings.links.minimumOpacity
          break
        
        case controlTypes.LINKS_SET_WEIGHTED_OPACITY :
          this.settings.links.weightedOpacity = value
          this.links.mesh.material.uniforms.weightedOpacity.value = this.settings.links.weightedOpacity
          break
      
        case controlTypes.LINKS_SET_MINIMUM_SCALE :
          this.settings.links.minimumScale = value
          this.links.mesh.material.uniforms.minimumScale.value = value
          break
  
        case controlTypes.LINKS_SET_WEIGHTED_SCALE :
          this.settings.links.weightedScale = value
          this.links.mesh.material.uniforms.weightedScale.value = value
          break

      
      // LABELS
      case controlTypes.LABELS_SET_ACTIVE :
        this.settings.labels.isEnabled = value
        if (value) {
          this.labels.setBehavior(LayerLabels.BEHAVIOR_AUTO_TOGGLE)
        } else {
          this.labels.setBehavior(LayerLabels.BEHAVIOR_CLICK_TO_TOGGLE)
        }
        break

      case controlTypes.LABELS_SET_FONT_SCALE :
        this.settings.labels.fontScale = value
        this.labels.settings.fontScale = value
        break

      case controlTypes.LABELS_SET_VISIBILITY_THRESHOLD :
        this.settings.labels.visibilityThreshold = value
        this.labels.settings.visibilityThreshold = value
        break

      case controlTypes.LABELS_SET_TEXT_COLOR :
        this.settings.labels.textColor = value
        this.labels.settings.textColor = value
        this.labels.redrawLabels()
        break
      
      case controlTypes.LABELS_SET_TEXT_OPACITY :
        this.settings.labels.textOpacity = value
        this.labels.settings.textOpacity = value
        this.labels.redrawLabels()
        break

      case controlTypes.LABELS_SET_BACKGROUND_COLOR :
        this.settings.labels.backgroundColor = value
        this.labels.settings.backgroundColor = value
        this.labels.redrawLabels()
        break
      
      case controlTypes.LABELS_SET_BACKGROUND_OPACITY :
        this.settings.labels.backgroundOpacity = value
        this.labels.settings.backgroundOpacity = value
        this.labels.redrawLabels()
        break
    }
  }
  
  updateNodesWeightedScales () {
    const {array} = this.nodes.geometry.attributes.weight
    // if (this.settings.nodes.factorController == 'number-of-links') {
    //   console.log('??')
      for (let i = 0, l = this.nodes.count; i < l; i += 1) {
        array[i] = this.nodes.data[i].linksCount
      }
    // } else { // 'none'
    //   for (let i = 0, l = this.nodes.count; i < l; i += 1) {
    //     array[i] = 1 // reset opacity to factor 1
    //   }
    // }
    // console.log('updated weights:', array)
    this.nodes.geometry.attributes.weight.needsUpdate = true
  }

  updateLinksWeightedScales () {
    const value = (this.settings.links.factorController || '').trim().toLowerCase()
    let weights = null
    const columnIndex = Object.keys(this.linksNormalizedColumns).indexOf(value)
    const {array} = this.links.geometry.attributes.weight
    if (columnIndex > -1) {
      weights = this.linksNormalizedColumns[value]
      for (let i = 0, l = this.links.count; i < l; i += 1) {
        array[i] = weights[i]
      }
    } else {
      for (let i = 0, l = this.links.count; i < l; i += 1) {
        array[i] = 0 // reset to 0 added scale
      }
    }
    this.links.geometry.attributes.weight.needsUpdate = true
  }
  
  setNodeTargetPositionAtIndex(i, x, y) {
    this.nodes.targetPositions.x[i] = x
    this.nodes.targetPositions.y[i] = y
  }

  loop = () => {

    // this.stats.begin()
     
    const delta = this.clock.getDelta()
    this.time += delta

    this.labels.update(this.clock.elapsedTime, delta, this.camera.zoom)
    
    this.links.material.uniforms.time.value = this.time
    this.nodes.material.uniforms.time.value = this.time
    
    this.nodes.material.uniforms.cameraOffset.value.x = this.cameraOffset.x
    this.nodes.material.uniforms.cameraOffset.value.y = this.cameraOffset.y
    
    this.links.material.uniforms.cameraOffset.value.x = this.cameraOffset.x
    this.links.material.uniforms.cameraOffset.value.y = this.cameraOffset.y
    
    this.labels.material.uniforms.cameraOffset.value.x = this.cameraOffset.x
    this.labels.material.uniforms.cameraOffset.value.y = this.cameraOffset.y
    
    const nodePositions = this.nodes.geometry.attributes.offset.array
    for (let i = 0, l = this.nodes.count; i < l; i += 1) {
      const i3 = i * 3
      let x = this.nodes.targetPositions.x[i]
      let y = this.nodes.targetPositions.y[i]
      nodePositions[i3 + 0] = x
      nodePositions[i3 + 1] = y
      const labelIndex = this.labels.nodeIndexToLabelIndex[i]
      if (labelIndex > -1) {
        this.labels.setNodePositionAtLabelIndex(labelIndex, x, y)
      }
    }

    this.nodes.geometry.attributes.offset.needsUpdate = true


    const rotationAxis = new THREE.Vector3(0, 0, 1).normalize()

    const linkPositions = this.links.geometry.attributes.offset.array
    const linkScales = this.links.geometry.attributes.scale.array
    const linkRotations = this.links.geometry.attributes.orientation.array
    for (let i = 0, l = this.links.count; i < l; i += 1) {
      const i2 = i * 2
      const i3 = i * 3
      const i4 = i * 4
      // here calculate position and angle of bar, based on nodes new positions
      const nodeId1 = this.links.data[i].source
      const nodeId2 = this.links.data[i].target
      const body1X = nodePositions[nodeId1 * 3 + 0]
      const body1Y = nodePositions[nodeId1 * 3 + 1]
      const body2X = nodePositions[nodeId2 * 3 + 0]
      const body2Y = nodePositions[nodeId2 * 3 + 1]
      
      linkScales[i2 + 0] = Math.hypot(body2X-body1X, body2Y-body1Y)
      // linkScales[i2 + 1] = (this.mouse.target == nodeId1 || this.mouse.target == nodeId2 ? 100 : 20) * this.settings.renderer.links.scale

      linkPositions[i3 + 0] = (body1X + body2X) / 2
      linkPositions[i3 + 1] = (body1Y + body2Y) / 2
      const deltaX = body1X - body2X
      const deltaY = body1Y - body2Y
      const angle = Math.atan2(deltaY, deltaX) //% Math.PI
      this.links.quaternion.setFromAxisAngle(rotationAxis, angle)
      linkRotations[i4 + 0] = this.links.quaternion.x
      linkRotations[i4 + 1] = this.links.quaternion.y
      linkRotations[i4 + 2] = this.links.quaternion.z
      linkRotations[i4 + 3] = this.links.quaternion.w
    }
    
    this.links.geometry.attributes.offset.needsUpdate = true
    this.links.geometry.attributes.scale.needsUpdate = true
    this.links.geometry.attributes.orientation.needsUpdate = true

    this.draw()
    
    this.animationCallback = window.requestAnimationFrame(this.loop)
    // this.stats.end()
  }
  
  draw () {
    this.renderer.render(this.scene, this.camera)
  }
  
  findTargetFromMouseMap (x, y) {
    this.nodes.material.blending = THREE.NormalBlending
    this.nodes.material.uniforms.isPicking.value = 1
    this.nodes.material.uniforms.isPicking.needsUpdate = true
    this.links.material.uniforms.isPicking.value = 1
    this.links.material.uniforms.isPicking.needsUpdate = true
    this.labels.material.uniforms.isPicking.value = 1
    this.labels.material.uniforms.isPicking.needsUpdate = true
    
    this.renderer.setClearColor(this.settings.globals.backgroundColor , 0)
    
    this.renderer.setRenderTarget(this.pickingRenderTarget)
    this.renderer.clear()
    this.renderer.render(this.scene, this.camera)
    this.renderer.setRenderTarget(null)
    
    this.renderer.setClearColor(this.settings.globals.backgroundColor , 1)

    this.nodes.material.uniforms.isPicking.value = 0
    this.nodes.material.uniforms.isPicking.needsUpdate = true
    this.links.material.uniforms.isPicking.value = 0
    this.links.material.uniforms.isPicking.needsUpdate = true
    this.labels.material.uniforms.isPicking.value = 0
    this.labels.material.uniforms.isPicking.needsUpdate = true

    this.renderer.readRenderTargetPixels(
      this.pickingRenderTarget,
      x * this.pickingRenderTarget.width,
      y * this.pickingRenderTarget.height,
      1,
      1,
      this.pixelBuffer
    )

    // interpret the pixel as an ID
    let id =
      (this.pixelBuffer[ 0 ] << 16) |
      (this.pixelBuffer[ 1 ] << 8) |
      (this.pixelBuffer[ 2 ])
    id -= 1

    if (id >= 0) {
      return id
    } else {
      return -1
    }
  }
  
  handleResize = () => {
    const {width, height} = this.container.getBoundingClientRect();
    console.log('resized:', width, height)
    this.width = width
    this.height = height

    this.canvas.width = width
    this.canvas.height = height

    const scale = Math.min(this.width / SAFE_WIDTH, this.height / SAFE_HEIGHT)

    const projectedWidth = (this.width / 2) / scale 
    const projectedHeight = (this.height / 2) / scale 

    this.camera.left = -projectedWidth
    this.camera.right = projectedWidth
    this.camera.top = projectedHeight
    this.camera.bottom = -projectedHeight

    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.width, this.height)

    this.pickingRenderTarget.setSize(width, height)
  }


  handleMouseLeave = () => {
    this.handleMouseUp()
  }
  
  handleMouseUp = () => {
    this.mouse.isDown = false
    this.mouse.target = -1
    this.worker.postMessage({
      command: 'update-fixed-x-y-at',
      mouseTargetIndex: -1
    })
  }

  handleDrag (diffX, diffY) {
    // After various approaches we need to pass the global camera offset to the shader and let the shader manage the offset
    // this is because of the instanced nature of the particles, 
    // if the mesh position is outside the viewport, the other particles would not get rendered.
    this.cameraOffset.x += diffX
    this.cameraOffset.y += diffY
  }

  zoomByIncrement (zoomDirection) {
    if (zoomDirection == 'in') {
      this.zoom(5);
    } else {
      this.zoom(-5);
    }
  }

  zoom (delta) {
    this.camera.previousZoom = this.camera.zoom
    const ZOOM_MIN = 0.005
    const ZOOM_MAX = 40
    const ZOOM_VEL = 0.02
    this.camera.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, this.camera.zoom + delta * ZOOM_VEL))
    this.camera.updateProjectionMatrix()
  }

  handleScroll = event => {
    // this.camera.previousZoom = this.camera.zoom
    var delta = event.wheelDelta ? event.wheelDelta/40 : event.detail ? -event.detail : 0;
    if (delta) {
      this.zoom(delta)
    }
    return event.preventDefault() && false;
  }
  
  handleMouseMove = event => {
    let x = (event.offsetX || (event.pageX - this.canvas.offsetLeft)) / this.canvas.width * window.devicePixelRatio
    let y = 1 - (event.offsetY || (event.pageY - this.canvas.offsetTop)) / this.canvas.height * window.devicePixelRatio
    let projectedX = (this.camera.right - this.camera.left) * x + this.camera.left
    let projectedY = (this.camera.top - this.camera.bottom) * y + this.camera.bottom
    projectedX /= this.camera.zoom
    projectedY /= this.camera.zoom
    // this.mouse.position.x
    if (this.mouse.target > -1) {
      this.worker.postMessage({
        command: 'update-fixed-x-y-at',
        // ratioX: x,
        // ratioY: y,
        x: projectedX - this.cameraOffset.x,
        y: projectedY - this.cameraOffset.y,
        mouseTargetIndex: this.mouse.target
      })
    } else  if (this.mouse.isDown) {
      
      // find the diff between previous and current,
      // then set previous with the values of current
      this.mouse.position.current.ratioX = x
      this.mouse.position.current.ratioY = y
      this.mouse.position.current.projectedX = projectedX
      this.mouse.position.current.projectedY = projectedY
      
      const diffX = this.mouse.position.current.projectedX - this.mouse.position.previous.projectedX
      const diffY = this.mouse.position.current.projectedY - this.mouse.position.previous.projectedY
      
      this.mouse.position.previous.ratioX = this.mouse.position.current.ratioX
      this.mouse.position.previous.ratioY = this.mouse.position.current.ratioY
      this.mouse.position.previous.projectedX = this.mouse.position.current.projectedX
      this.mouse.position.previous.projectedY = this.mouse.position.current.projectedY
      
      this.handleDrag(diffX, diffY)
    }
  }
  
  handleMouseDown = event => {
    console.log
    // this.handleMouseTouchON(event.pageX, event.pageY, event.offsetX, event.offsetY);
    this.handleMouseTouchON(event);
  }
  
  handleMouseTouchON = (event) => {
    // handleMouseTouchON = (pageX, pageY, offsetX, offsetY) => {
      this.mouse.isDown = true
      let x = (event.offsetX || (event.pageX - this.canvas.offsetLeft)) / this.canvas.width * window.devicePixelRatio
      let y = 1 - (event.offsetY || (event.pageY - this.canvas.offsetTop)) / this.canvas.height * window.devicePixelRatio
      // render the mouse map to define the mouse target
      this.mouse.target = this.findTargetFromMouseMap(x, y)
      
      let projectedX = (this.camera.right - this.camera.left) * x + this.camera.left
      let projectedY = (this.camera.top - this.camera.bottom) * y + this.camera.bottom
      projectedX /= this.camera.zoom
      projectedY /= this.camera.zoom
      
      this.mouse.position.current.ratioX = x
      this.mouse.position.current.ratioY = y
      this.mouse.position.current.projectedX = projectedX
      this.mouse.position.current.projectedY = projectedY
      // reset previsou position to match current
      this.mouse.position.previous.ratioX = x
      this.mouse.position.previous.ratioY = y
      this.mouse.position.previous.projectedX = projectedX
      this.mouse.position.previous.projectedY = projectedY
      
      if (this.mouse.target > -1) {
        this.labels.toggleEnabledLabelAtNodeIndex(this.mouse.target)
      }
      this.worker.postMessage({
        command: 'update-fixed-x-y-at',
        x: projectedX - this.cameraOffset.x,
        y: projectedY - this.cameraOffset.y,
        mouseTargetIndex: this.mouse.target
      })
    }
    
    addListeners () {
      window.addEventListener('resize', this.handleResize, false)
      
      this.canvas.addEventListener('DOMMouseScroll', this.handleScroll, false)
      this.canvas.addEventListener('mousewheel', this.handleScroll, false)
      
      this.canvas.addEventListener('mousemove', this.handleMouseMove, false)
      this.canvas.addEventListener('mouseout', this.handleMouseLeave, false)
      
      this.canvas.addEventListener('mousedown', this.handleMouseDown, false)
      this.canvas.addEventListener('mouseup', this.handleMouseUp, false)
      
      this.canvas.addEventListener('touchstart', this.handleTouchStart, false);
      this.canvas.addEventListener('touchmove', this.handleTouchMove, false);
      this.canvas.addEventListener('touchcancel', this.handleMouseLeave, false);
      this.canvas.addEventListener('touchend', this.handleMouseLeave, false);
    }
    
    removeListeners () {
      window.removeEventListener('resize', this.handleResize)
      
      this.canvas.removeEventListener('DOMMouseScroll', this.handleScroll)
      this.canvas.removeEventListener('mousewheel', this.handleScroll)
      
      this.canvas.removeEventListener('mousemove', this.handleMouseMove)
      this.canvas.removeEventListener('mouseout', this.handleMouseLeave)
      
      this.canvas.removeEventListener('mousedown', this.handleMouseDown)
      this.canvas.removeEventListener('mouseup', this.handleMouseUp)
      
      
      this.canvas.removeEventListener('touchstart', this.handleTouchStart);
      this.canvas.removeEventListener('touchmove', this.handleTouchMove);
      this.canvas.removeEventListener('touchcancel', this.handleMouseLeave);
      this.canvas.removeEventListener('touchend', this.handleMouseLeave);
    }
    
    handleTouchStart = event => {
      if (event.changedTouches && event.changedTouches.length) {
        // let x = (event.offsetX || (event.changedTouches[0].pageX - this.renderer.canvas.offsetLeft)) / this.canvas.width * window.devicePixelRatio
        // let y = 1 - (event.offsetY || (event.changedTouches[0].pageY - this.renderer.canvas.offsetTop)) / this.canvas.height * window.devicePixelRatio
        // this.handleMouseTouchON(x, y)
        // alert (event.changedTouches[0].offsetX)
        // this.handleMouseTouchON(event.changedTouches[0].pageX, event.changedTouches[0].pageY, 0, 0);
        this.handleMouseTouchON({
          pageX: event.changedTouches[0].pageX, 
          pageY: event.changedTouches[0].pageY
        });
      }          
    }
    
    handleTouchMove = event => {
      if (this.mouse.isDown && event.changedTouches && event.changedTouches.length) {
        this.handleMouseMove({
          pageX: event.changedTouches[0].pageX, 
          pageY: event.changedTouches[0].pageY
        });
        // let x = (event.changedTouches[0].offsetX || (event.changedTouches[0].pageX - this.renderer.canvas.offsetLeft)) / this.canvas.width * window.devicePixelRatio
        // let y = 1 - (event.changedTouches[0].offsetY || (event.changedTouches[0].pageY - this.renderer.canvas.offsetTop)) / this.canvas.height * window.devicePixelRatio
        // this.handleMouseTouchON(event.changedTouches[0].pageX, event.changedTouches[0].pageY, 0, 0);
        // this.handleMouseTouchON(event.changedTouches[0].pageX,  event.changedTouches[0].pageY)
      }
      event.stopImmediatePropagation();
      return event.preventDefault() && false;
  }

  dispose () {
    // stop listening to events
    this.removeListeners()
    // clear canvas
    this.canvas.width = 0
    this.canvas.height = 0
    this.canvas = null
    // cancel loop callback
    window.cancelAnimationFrame(this.animationCallback)

    this._graphics.onScreenIdle = null
  }
}
