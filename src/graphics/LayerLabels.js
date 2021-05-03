import * as THREE from 'three'
import {vertexLabel, fragmentLabel} from './shader-label'
import {wrapText} from './../utils/wrapText'

CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, width, height, radius) {
  this.moveTo(x + radius, y);
  this.lineTo(x + width - radius, y);
  this.quadraticCurveTo(x + width, y, x + width, y + radius);
  this.lineTo(x + width, y + height - radius);
  this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  this.lineTo(x + radius, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius);
  this.lineTo(x, y + radius);
  this.quadraticCurveTo(x, y, x + radius, y);  
}

export default class LayerLabels {

  static BEHAVIOR_AUTO_TOGGLE = 'BEHAVIOR_AUTO_TOGGLE'
  static BEHAVIOR_CLICK_TO_TOGGLE = 'BEHAVIOR_CLICK_TO_TOGGLE'
  
  constructor (parentScope, nodesData, externalSettings) {
    this.parentScope = parentScope

    this.nodesData = nodesData
    this.nodeIndexToLabelIndex = new Int32Array(nodesData.length).fill(-1)

    this.settings = {}
    this.settings.sizePOT = 2048
    this.settings.numCols = 10
    this.settings.numRows = 30
    // this.settings.sizePOT = 1024
    // this.settings.numCols = 5
    // this.settings.numRows = 14
    // this.settings.sizePOT = 512
    // this.settings.numCols = 3
    // this.settings.numRows = 7
    this.settings.tilesCount = this.settings.numCols * this.settings.numRows
    this.settings.tileWidth = this.settings.sizePOT / this.settings.numCols
    this.settings.tileHeight = this.settings.sizePOT / this.settings.numRows
    this.settings.tileWidthHalf = this.settings.tileWidth / 2
    this.settings.tileHeightHalf = this.settings.tileHeight / 2
    
    // external settings
    this.settings.fontScale = externalSettings.fontScale
    this.settings.visibilityThreshold = externalSettings.visibilityThreshold
    this.settings.textColor = externalSettings.textColor
    this.settings.textOpacity = externalSettings.textOpacity
    this.settings.backgroundColor = externalSettings.backgroundColor
    this.settings.backgroundOpacity = externalSettings.backgroundOpacity
    
    this.settings.fontSize = 20
    this.settings.lineHeight = 16
    this.settings.safePadding = 16
    this.settings.lineHeightSizeDiff = (this.settings.fontSize - this.settings.lineHeight) / 2

    // this.settings.needsLabelRotation = this.settings.tilesCount < this.nodesData.length
    
    this.nodeIndexPointer = 0
    this.labelIndexPointer = 0

    // eslint-disable-next-line
    console.log(`[LayerLabels] ${this.settings.tilesCount} labels supported`, {settings: this.settings})

    // set initial behavior based on options
    this.behavior = externalSettings.isEnabled ? LayerLabels.BEHAVIOR_AUTO_TOGGLE : LayerLabels.BEHAVIOR_CLICK_TO_TOGGLE

    // create a canvas that will 
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.settings.sizePOT
    this.canvas.height = this.settings.sizePOT
    this.context2D = this.canvas.getContext('2d')
    
    // this array will carry the labels to be displayed when running in 'click to toggle' behavior
    this.enabledLabels = []

    // create a smaller buffer to draw a masked label
    this.maskCanvas = document.createElement('canvas')
    this.maskCanvas.width = this.settings.tileWidth
    this.maskCanvas.height = this.settings.tileHeight
    this.maskContext2D = this.maskCanvas.getContext('2d')
    this.maskContext2D.font = `${this.settings.fontSize}px Verdana, Arial, sans-serif`
    this.maskContext2D.textAlign = 'center'
    this.maskContext2D.textBaseline = 'middle'
    if (window.debugMode) {
      document.body.appendChild(this.canvas)
      this.canvas.style.position = 'fixed'
      this.canvas.style.top = 0
      this.canvas.style.background = 'hotpink'
      this.canvas.style.transform = 'scale(0.6)'
      this.canvas.style.transformOrigin = '0 0'
    }

    this.uniformsData = {
      time: { value: 1.0 },
      scale: { value: 400.0 },
      isPicking: { value: 0.0 },
      map: { value: null },
      gridNums: new THREE.Uniform(new THREE.Vector2(this.settings.numCols, this.settings.numRows)),
      cameraOffset: new THREE.Uniform(new THREE.Vector2(0, 0))
    },

    this.attributesData = {
      offsets: [],
      indexes: []
    }

    this.texture = new THREE.CanvasTexture(this.canvas)
    // this.texture.wrapS = THREE.RepeatWrapping
    // this.texture.wrapT = THREE.RepeatWrapping
    this.uniformsData.map.value = this.texture

    for (let i = 0, l = this.settings.tilesCount; i < l; i++) {
      this.attributesData.offsets.push(
        0, 0, 2 // z-index
      )
      this.attributesData.indexes.push(i)
    }
      
    this.geometry = new THREE.InstancedBufferGeometry()
    this.geometry.copy(new THREE.PlaneBufferGeometry(1, this.settings.numCols / this.settings.numRows, 1, 1))
    this.geometry.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(this.attributesData.offsets), 3))
    this.geometry.addAttribute('particleIndex', new THREE.InstancedBufferAttribute(new Float32Array(this.attributesData.indexes), 1))

    this.material = new THREE.RawShaderMaterial( {
      uniforms: this.uniformsData,
      vertexShader: vertexLabel,
      fragmentShader: fragmentLabel,
      side: THREE.FrontSide,
      transparent: true,
      alphaTest: 0.1,
      blending: THREE.NormalBlending
    })

    this.mesh = new THREE.Mesh(this.geometry, this.material)

    this.isOccupied = Array(this.settings.tilesCount)
    this.isOccupied.fill(false)

    this.redrawLabels()
  }

  redrawLabels () {
    if (this.behavior == LayerLabels.BEHAVIOR_AUTO_TOGGLE) {
      this.redrawAutoLabels()
    } else if (this.behavior == LayerLabels.BEHAVIOR_CLICK_TO_TOGGLE) {
      this.drawEnabledLabels()
    }
  }

  toggleEnabledLabelAtNodeIndex (nodeIndex) {
    if (this.behavior != LayerLabels.BEHAVIOR_CLICK_TO_TOGGLE) {
      return
    }
    const arrayIndex = this.enabledLabels.indexOf(nodeIndex)
    if (arrayIndex == -1) {
      this.enabledLabels.push(nodeIndex)
    } else {
      this.enabledLabels.splice(arrayIndex, 1)
    }
    this.drawEnabledLabels()
  }

  setBehavior (behavior) {
    this.behavior = behavior
    // empty the enabled layers references
    this.enabledLabels.length = 0
    if (this.behavior == LayerLabels.BEHAVIOR_CLICK_TO_TOGGLE) {
      this.drawEnabledLabels()
    } else {
      this.redrawAutoLabels()
    }
  }

  drawEnabledLabels () {
    // Draw initial labels
    this.context2D.clearRect(0, 0, this.settings.sizePOT, this.settings.sizePOT)
    // clear first
    this.context2D.clearRect(0, 0, this.settings.sizePOT, this.settings.sizePOT)
    // then draw the enabled labels
    for (let i = 0, l = Math.min(this.enabledLabels.length, this.settings.tilesCount); i < l; i++) {
      this.stampTextAt(this.enabledLabels[i], i)
    }
    this.texture.needsUpdate = true
  }

  redrawAutoLabels () {
    this.nodeIndexPointer = 0
    this.labelIndexPointer = 0
    // clear first
    this.context2D.clearRect(0, 0, this.settings.sizePOT, this.settings.sizePOT)
    // then draw the initial labels
    for (let i = 0, l = this.nodeIndexToLabelIndex.length; i < l; i += 1) {
      this.nodeIndexToLabelIndex[i] = -1
    }
    this.texture.needsUpdate = true
  }

  setNodePositionAtLabelIndex (labelIndex, x, y) {
    const labels = this.geometry.attributes.offset.array
    const i3 = labelIndex * 3
    labels[i3 + 0] = x
    labels[i3 + 1] = y //- 50
    this.geometry.attributes.offset.needsUpdate = true
  }

  rotateLabels () {

    let runs = 0

    while (runs <  200) {
      
      this.nodeIndexPointer = (this.nodeIndexPointer + 1) % this.nodesData.length
      let x = this.parentScope.nodes.targetPositions.x[this.nodeIndexPointer]
      let y = this.parentScope.nodes.targetPositions.y[this.nodeIndexPointer]
      x += this.parentScope.cameraOffset.x
      y += this.parentScope.cameraOffset.y
      
      
      const {left, right, top, bottom, zoom} = this.parentScope.camera
      if (
        x > left / zoom 
        &&
        x < right / zoom
        &&
        y > bottom / zoom
        &&
        y < top / zoom
        &&
        this.nodeIndexToLabelIndex[this.nodeIndexPointer] == -1
      ) {
        // the node is inside viewport and has no label yet
        let innerRuns = 0
        while (innerRuns < 200) {
          this.labelIndexPointer = (this.labelIndexPointer + 1) % Math.min(this.nodesData.length, this.settings.tilesCount)
          if (!this.isOccupied[this.labelIndexPointer]) {
            this.stampTextAt(this.nodeIndexPointer, this.labelIndexPointer)
            this.texture.needsUpdate = true
            this.isOccupied[this.labelIndexPointer] = true
            break
          } else {
            this.isOccupied[this.labelIndexPointer] = false
          }
        }
        innerRuns += 1
      }
      runs += 1
    }

  }

  stampTextAt (nodeIndex, labelIndex) {
    // need to deselect the previous reference
    for (let i = 0, l = this.nodeIndexToLabelIndex.length; i < l; i += 1) {
      if (this.nodeIndexToLabelIndex[i] == labelIndex) {
        this.nodeIndexToLabelIndex[i] = -1
        break
      }
    }
    // then set the new reference
    this.nodeIndexToLabelIndex[nodeIndex] = labelIndex

    // project index to 2d texture map
    const x = labelIndex % this.settings.numCols * this.settings.tileWidth
    const y = Math.floor(labelIndex / this.settings.numCols) * this.settings.tileHeight
   
    // Get the text and split it to lines
    const text = this.nodesData[nodeIndex].name

    const lines = wrapText(this.maskContext2D, text, this.settings.tileWidth - this.settings.safePadding)

    // support max of 4 lines
    if (lines.length > 4) {
      lines.length = 4
      lines[3] += '...'
    }

    // clear previous stamps
    this.maskContext2D.clearRect(0, 0, this.settings.tileWidth, this.settings.tileHeight)
    this.context2D.clearRect(x, y, this.settings.tileWidth, this.settings.tileHeight)

    // draw the background of label
    this.maskContext2D.fillStyle = this.settings.backgroundColor
    this.maskContext2D.globalAlpha = this.settings.backgroundOpacity
    lines.forEach((line, index) => {
      const localX = this.settings.tileWidthHalf
      const localY = this.settings.tileHeightHalf + this.settings.lineHeight * index - (this.settings.lineHeight * lines.length)/2 + this.settings.fontSize/2
      const width = this.maskContext2D.measureText(line).width
      
      this.maskContext2D.beginPath()
      this.maskContext2D.roundRect(localX - width/2 - 2, localY - this.settings.fontSize/2 - 4, width + 4, this.settings.fontSize + 8, 5)
      this.maskContext2D.closePath()
      this.maskContext2D.fill()

      this.context2D.drawImage(this.maskCanvas, x, y)
    })

    // draw the text
    this.maskContext2D.fillStyle = this.settings.textColor
    this.maskContext2D.globalAlpha = this.settings.textOpacity
    lines.forEach((line, index) => {
      const localX = this.settings.tileWidthHalf
      const localY = this.settings.tileHeightHalf + this.settings.lineHeight * index - (this.settings.lineHeight * lines.length)/2 + this.settings.fontSize/2 + this.settings.lineHeightSizeDiff
      
      this.maskContext2D.fillText(line, localX, localY - 1)
    
    })
    this.maskContext2D.globalAlpha = 1
    // remove 1 pixel above and below to get rid of artifacts caused by antialiasing/mipmaps
    this.maskContext2D.clearRect(x, y, this.settings.tileWidth, 1)
    this.maskContext2D.clearRect(x, y + this.settings.tileHeight - 1, this.settings.tileWidth, 1)
    this.context2D.drawImage(this.maskCanvas, x, y)
  }

  update (elapsedTime, delta, cameraZoom) {
    if (this.behavior == LayerLabels.BEHAVIOR_CLICK_TO_TOGGLE) {
      // nothing to do
      this.material.uniforms.scale.value = 1500 / cameraZoom * this.settings.fontScale
    } else if (this.behavior == LayerLabels.BEHAVIOR_AUTO_TOGGLE) {
      if (cameraZoom < this.settings.visibilityThreshold) {
        this.material.uniforms.scale.value = 0
      } else {
        this.material.uniforms.scale.value = 1500 / cameraZoom * this.settings.fontScale
        this.rotateLabels()
      }
    }
  }
}
