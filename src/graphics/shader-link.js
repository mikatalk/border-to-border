const vertexBar = `
  precision highp float;
  uniform float time;

  float scaleRange = 20.0;


  uniform vec2 cameraOffset;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  attribute vec2 uv;
  varying vec2 vUv;
  attribute vec3 position;

  attribute float particleIndex;
  varying float vParticleIndex;
  
  attribute vec4 orientation;
  attribute vec3 offset;
  attribute vec4 color;
  attribute vec2 scale;

  attribute float weight;
  uniform float minimumScale;
  uniform float weightedScale;
  uniform float minimumOpacity;
  uniform float weightedOpacity;
  varying float vOpacity;

  vec3 applyQuaternionToVector( vec4 q, vec3 v ){
    return v + 2.0 * cross( q.xyz, cross( q.xyz, v ) + q.w * v );
  }

  void main() {

    vOpacity = minimumOpacity + weight * weightedOpacity;
    vOpacity = clamp(vOpacity, 0.0, 1.0);
    
    // float scaleY = minimumScale * 100.0;
    // scaleY += weight * weightedScale * 500.0;// scaleRange;
    float scaleY = minimumScale * 50.0;
    scaleY += weight * weightedScale * 100.0;
    // vOpacity = minimumOpacity + weight * weightedOpacity;
    // vOpacity = clamp(vOpacity, 0.0, 1.0);
    
    
    // vec2 scale = vec2(100.0, 200.0);
    
    vec3 pos = position * vec3(scale.x, scaleY, 1.0);
    pos = applyQuaternionToVector(orientation, pos);
    pos = pos + offset;
    pos.xy += cameraOffset;
    
    vParticleIndex = particleIndex;
    vUv = vec2(uv.x, 1.0-uv.y);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0 );
  }
  `
  
  const fragmentBar = `
  precision highp float;
  uniform float opacity;
  uniform float time;
  uniform sampler2D map;
  uniform float isPicking;
  varying vec2 vUv;
  varying float vParticleIndex;
  uniform vec3 baseColor;

  varying float vOpacity;

  mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
  }

  void main() {
    
    if (isPicking == 1.0) {
      discard;
    }
    
    vec2 uv = vUv;
    
    uv = rotate2d(vParticleIndex) * uv;
    float ratio = 1.0; // (sin(vUv.y * 3.1415) + 1.0) / 2.0;
    float diff = mod(vParticleIndex, 100.0) / 600.0; // slight diff per link to increase contrasted
    vec4 color = vec4(
      baseColor * ratio,
      1.0);
    
    if (color.a == 0.0) {
      discard;
    }

    color.a = vOpacity;
    
    gl_FragColor = vec4(color);
      
  }
`

export {
  vertexBar,
  fragmentBar
}
