const vertexLabel = `
  precision highp float;
  uniform float time;
  uniform vec2 cameraOffset;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  attribute vec2 uv;
  varying vec2 vUv;
  attribute vec3 position;
  attribute float particleIndex;
  varying float vParticleIndex;
  attribute vec3 offset;
  uniform float scale;

  void main() {
    vec3 pos = position * vec3(scale, scale, 1.0);
    // vec3 pos = position;
   
    pos = pos + offset;
    pos.xy += cameraOffset;
  
    vParticleIndex = particleIndex;

    vUv = vec2(uv.x, 1.0-uv.y);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0 );
  }
  `
  
const fragmentLabel = `
  precision highp float;
  uniform float time;
  uniform sampler2D map;
  uniform float isPicking;
  uniform vec2 gridNums;
  varying vec2 vUv;
  varying float vRatio;
  varying float vParticleIndex;

  void main() {
    
    if (isPicking == 1.0) {
      discard;
    }
    
    // vec2 uv = vec2(vUv.x, vUv.y);
      
    vec2 unit = vec2(
      1.0 / gridNums.x,
      1.0 / gridNums.y
    );

    vec2 factorIndex = vec2(
      mod(vParticleIndex, gridNums.x),
      floor(vParticleIndex / gridNums.x)
    );

    vec4 color = texture2D(map, vec2(0.0, 1.0) + vec2(1.0, -1.0) * (vUv + factorIndex) * unit);
    
    if (color.a == 0.0) {
      discard;
    }
    
    gl_FragColor = vec4(color);
      
  }
`

export {
  vertexLabel,
  fragmentLabel
}
