
import * as d3 from 'd3-force'
import * as controlTypes from '../constants/control-types'

class Simulation {

  constructor () {}
  
  initialize (nodes, links, settings) {
    this.nodes = nodes
    this.links = links
    this.settings = settings

//     // for (let i = 0, l = this.nodes.length; i < l; i += 1) {
//     //   this.nodes[i].x = -2000 + Math.random() * 4000
//     //   this.nodes[i].y = -2000 + Math.random() * 4000
//     // }

//     // this.simulation = d3.forceSimulation(nodes)
//     // .force("link", d3.forceLink(links).id(d => d.id).distance(0).strength(1))
//     // // .force("charge", d3.forceManyBody())
//     // .force("charge", d3.forceManyBody().strength(-50))
//     // // .force("cluster", forceCluster())
//     // // .force("collide", forceCollide())
//     // // .force("center", d3.forceCenter(0, 0));
//     // // .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));


// //   const forceLink = d3.forceLink(links)
// //   .id(d => d.id)
// //   .distance(100)
// //   .strength(d => d.normalizedValue)

// // const forceCharge = d3.forceManyBody()
// //   .strength(-250)

// // const forceCollide = d3.forceCollide()
// //   .radius(45)

// // this.simulation = d3.forceSimulation(nodes)
// //     .force('link', forceLink)
// //     .force('charge', forceCharge)
// //     .force('collide', forceCollide)
// //     .force('x', d3.forceX())
// //     .force('y', d3.forceY())
// //     .force('center', d3.forceCenter())

// // console.log('[SIMULATION] initialized...')
//     this.forceLink = d3.forceLink(this.links)
//       .id(d => d.id)
//       .distance(this.settings.links.distance)
//       .strength(this.settings.links.strength)
//       // .distance(() => 0)
//       // .strength(() => 2)

//       this.forceCharge = d3.forceManyBody()
//       .strength(2)
//       // .strength(this.settings.charge.strength)

//       this.simulation = d3.forceSimulation(this.nodes)
//     // this.simulation.alphaDecay(0.01)
    
    
//     this.forceCollide = d3.forceCollide()
//     this.forceCollide.radius(d => d.radius * 750 + 250)
    
//     // this.simulation.force('collision', d3.forceCollide().radius(d => Math.random() * 100))
    
//     this.forceX = d3.forceX()
    
//     this.forceY = d3.forceY()
//     // this.simulation.force('radial', d3.forceRadial(1000))
//     // this.simulation.force('center', d3.forceCenter())
    
//     this.simulation.force('link', this.forceLink)
//     this.simulation.force('charge', this.forceCharge)
//     this.simulation.force('collide', this.forceCollide)
//     this.simulation.force('x', this.forceX)
//     this.simulation.force('y', this.forceY)
//     // this.simulation.force('center', d3.forceCenter(0.5, 0.5))
    
// this.simulation = d3.forceSimulation()
//   .force('charge', d3.forceManyBody())
//   .force('link', d3.forceLink().id(d => d.id))
//   .force('x', d3.forceX())
//   .force('y', d3.forceY())
  
    this.simulation.on('tick', this.handleTick)
    this.simulation.on('end', this.handleEnd)

    this.valuesX = new Float32Array(this.nodes.length)
    this.valuesY = new Float32Array(this.nodes.length)


    // this.simulation.alpha(0.001)
    // this.simulation.restart()
// console.log(this.settings)


    // // apply settings
    // this.forceLink.strength(this.settings.links.strength)
    // this.forceLink.distance(this.settings.links.distance)
    // this.forceCharge.strength(this.settings.charge.strength)
    // this.forceCharge.distanceMin(this.settings.charge.distanceMin)
    // this.forceCharge.distanceMin(this.settings.charge.distanceMax)
    // this.forceCollide.strength(this.settings.collision.strength)
    // this.forceCollide.radius(d => (d.radius * 750 + 250) * this.settings.collision.radius)
    // this.forceX.strength(this.settings.forceX.strength)
    // this.forceY.strength(this.settings.forceY.strength)
    // this.simulation.alphaDecay(this.settings.alphaDecay)

//     console.log('worker:', this.simulation.nodes)
  }
  
  updateLinksWeights (weights) {
    this.weights = weights
    if (weights) {
      this.forceLink.strength((a, index) => {
        return 0.1 + this.weights[index] * 5 
      })
    } else {
      this.forceLink.strength((a, index) => {
        let sourceNode = this.nodes[this.links[index].source.id]
        let targetNode = this.nodes[this.links[index].target.id]
        // sum the source of radius between target and source of the link
        return 0.1 + 2.5 * (sourceNode.radius + targetNode.radius)
        // return 1
      })
    }

  }

  updateSettingByName (name, value) {
    // eslint-disable-next-lin
    // console.log('[WORKER] Update Setting by name', name, value)
    switch (name) {
      
      // // case 'simulation.isRunning' :
      // case controlTypes.SIMULATION_IS_RUNNING :
      //   if (value) {
      //     this.simulation.restart()
      //   } else {
      //     this.simulation.stop()
      //   }
      //   break

      case controlTypes.SIMULATION_RESTART :
        for (let i = 0, l = this.nodes.length; i < l; i += 1) {
          this.valuesX[i] = 0
          this.valuesY[i] = 0
        }
        for (let i = 0, l = simulation.nodes.length; i < l; i++) {
          delete simulation.nodes[i].x
          delete simulation.nodes[i].y
          delete simulation.nodes[i].vx
          delete simulation.nodes[i].vy
          delete simulation.nodes[i].fx
          delete simulation.nodes[i].fy
          this.valuesX[i] = 0
          this.valuesY[i] = 0
        }
        this.simulation.nodes(this.nodes)
        this.simulation.force('link').links(this.links)
        this.simulation.restart()
        this.simulation.alpha(1)

        self.postMessage({
          command: 'update-simulation-results',
          valuesX: this.valuesX, 
          valuesY: this.valuesY,
          skipTransition: true
        })
        break

      // case controlTypes.SIMULATION_SET_NUM_VISIBLE_NODES :
      //   this.settings.simulation.numVisibleNodes
      //   // this.settings.alphaDecay = value
      //   // this.simulation.alphaDecay(this.settings.alphaDecay)
      //   // this.simulation.alpha(0.1)
      //   // this.simulation.restart()
      //   break
        

      case controlTypes.SIMULATION_ALPHA_DECAY :
        this.settings.alphaDecay = value
        this.simulation.alphaDecay(this.settings.alphaDecay)
        this.simulation.alpha(0.1)
        this.simulation.restart()
        break

      // LINKS
      case controlTypes.SIMULATION_LINKS_DISTANCE :
        this.settings.links.distance = value
        this.forceLink.distance(value)
        this.simulation.alpha(0.1)
        this.simulation.restart()
        break
      case controlTypes.SIMULATION_LINKS_STRENGTH :
        this.settings.links.strength = value
        this.forceLink.strength(value)
        this.simulation.alpha(0.1)
        this.simulation.restart()
        break
        

      // CHARGE
      case controlTypes.SIMULATION_CHARGE_STRENGTH :
        this.settings.charge.strength = value
        this.forceCharge.strength(value)
        this.simulation.alpha(0.1)
        this.simulation.restart()
        break
      case controlTypes.SIMULATION_CHARGE_DISTANCE_MIN :
        this.settings.charge.distanceMin = value
        this.forceCharge.distanceMin(value)
        this.simulation.alpha(0.1)
        this.simulation.restart()
        break
      case controlTypes.SIMULATION_CHARGE_DISTANCE_MAX :
        this.settings.charge.distanceMax = value
        this.forceCharge.distanceMin(value)
        this.simulation.alpha(0.1)
        this.simulation.restart()
        break

      // COLLISION
      case controlTypes.SIMULATION_COLLISION_STRENGTH :
        this.settings.collision.strength = value
        this.forceCollide.strength(value)
        this.simulation.alpha(0.1)
        this.simulation.restart()
        break
      case controlTypes.SIMULATION_COLLISION_RADIUS:
        this.settings.collision.radius = value
        this.forceCollide.radius(d => (d.radius * 750 + 250) * value)
        this.simulation.alpha(0.1)
        this.simulation.restart()
        break

      // FORCE X
      case controlTypes.SIMULATION_FORCE_X_STRENGTH :
        this.settings.forceX.strength = value
        this.forceX.strength(value)
        this.simulation.alpha(0.1)
        this.simulation.restart()
        break

      // FORCE Y
      case controlTypes.SIMULATION_FORCE_Y_STRENGTH :
        this.settings.forceY.strength = value
        this.forceY.strength(value)
        this.simulation.alpha(0.1)
        this.simulation.restart()
        break


    }
  }

  handleTick = () => {
    // console.log('[WORKER SIMULATION] tick', this.nodes[10].x, this.nodes[10].y, this.valuesX[10], this.valuesY[10])

    for (let i = 0, l = this.nodes.length; i < l; i += 1) {
      this.valuesX[i] = this.nodes[i].x
      this.valuesY[i] = this.nodes[i].y
    }

    self.postMessage({
      command: 'update-simulation-results',
      valuesX: this.valuesX, 
      valuesY: this.valuesY,
    })
  }

  handleEnd = () => {
    self.postMessage({
      command: 'simulation-is-idle'
    })
  }
}


const simulation = new Simulation()

self.addEventListener('message', handleMessage);

function handleMessage(message) {
  // eslint-disable-next-line
  // console.log('[WORKER][incoming message]:', message)

  const {command} = message.data
  switch (command) {

    case 'initialize' :
      // eslint-disable-next-line
      const {nodes, links, settings} = message.data
      simulation.initialize(nodes, links, settings)
      break
    
    case 'update-fixed-x-y-at' :
      // for (let i = 0, l = simulation.nodes.length; i < l; i++) {
      //   delete simulation.nodes[i].fx
      //   delete simulation.nodes[i].fy
      // }
      if (message.data.mouseTargetIndex > -1) {
        const {x, y, mouseTargetIndex} = message.data
        // simulation.nodes[mouseTargetIndex].x = x
        // simulation.nodes[mouseTargetIndex].y = y
        // simulation.nodes[mouseTargetIndex].vx = 0
        // simulation.nodes[mouseTargetIndex].vy = 0
        simulation.nodes[mouseTargetIndex].fx = x
        simulation.nodes[mouseTargetIndex].fy = y
        simulation.simulation.restart()
        simulation.simulation.alpha(0)
        // simulation.simulation.alphaTarget(0);
        // simulation.alpha(1).restart().tick();
        // simulation.alphaTarget(0.3).restart();
      }
      break

    case 'update-links-weights' :
      // simulation.updateLinksWeights(message.data.weights)
      break

    case 'update-simulation-setting' :
      // simulation.updateSettingByName(message.data.name, message.data.value)
      break
  }
}