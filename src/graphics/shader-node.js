const vertex = `
  precision highp float;
  uniform float time;

  float scaleRange = 50.0;
  
  attribute float weight;
  uniform float minimumScale;
  uniform float weightedScale;
  uniform float minimumOpacity;
  uniform float weightedOpacity;
  varying float vOpacity;

  
  uniform vec2 cameraOffset;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  attribute vec3 position;
  
  attribute vec4 mouseTag;
  varying vec4 vMouseTag;

  attribute vec2 uv;
  varying vec2 vUv;

  attribute vec4 groups;
  varying vec4 vGroups;

  attribute float particleIndex;
  varying float vParticleIndex;
  
  // attribute float scale;
  attribute vec3 offset;
  attribute vec4 color;
  
  varying float vType;
  attribute float type;

  void main(){

    // float scale = minimumScale * scaleRange / 4.0;
    // scale += weight * weightedScale * scaleRange;
    // scale += weightedScale * scaleRange;
    float scale = minimumScale * scaleRange + weight * weightedScale * scaleRange;
    // float scale = minimumScale * scaleRange / 4.0 + 1.0    * weightedScale * scaleRange;

    vOpacity = minimumOpacity + weight * weightedOpacity;
    vOpacity = clamp(vOpacity, 0.0, 1.0);
    
    vec3 pos = position * vec3(scale, scale , 1.0);
    pos = pos + offset;
    pos.xy += cameraOffset;
    
    vMouseTag = mouseTag;
    vType = type;
    vGroups = groups;
    
    vParticleIndex = particleIndex;
    vUv = vec2(uv.x, 1.0-uv.y);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0 );
  }
  `
  
  const fragment = `
  precision highp float;
  uniform float time;
  // uniform float minimumOpacity;
  // uniform float minimumScale;
  uniform float useTwoColors;
  uniform float isPicking;
  uniform vec3 baseColor1;
  uniform vec3 baseColor2;
  uniform vec3 groupColor1;
  uniform vec3 groupColor2;
  uniform vec3 groupColor3;
  uniform vec3 groupColor4;
  varying vec2 vUv;
  varying vec4 vMouseTag;
  varying float vType;
  varying float vRatio;
  varying float vScale;
  varying float vParticleIndex;
  varying vec4 vGroups;
  
  varying float vOpacity;

  #define PI2 6.28318530718

  mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle), sin(_angle),cos(_angle));
  }

  // used by the mouse target picker
  float circle(in vec2 st, in float radius){
    vec2 dist = st - vec2(0.5);
    return 1.0 - smoothstep(radius - (radius * 0.01),
      radius + (radius * 0.01),
      dot(dist, dist) * 4.0);
  }

  float drawBase (in vec2 uv, in float min, in float max) {
    float dist = sqrt(dot(uv, uv));
    if (dist >= max || dist <= min) {
      return 0.0;
    }
    float sm = smoothstep(max, max - 0.01, dist);
    float sm2 = smoothstep(min, min - 0.01, dist);
    float alpha = sm * sm2;
    return (1.0-alpha);
  }

  float drawArc (in vec2 uv, in float min, in float max, in float startAngle, in float sizeAngle) {
    
    uv = rotate2d(startAngle) * uv;
    
    float dist = sqrt(dot(uv, uv));
    if (dist >= max || dist <= min) {
      return 0.0;
    }
    float sm = smoothstep(max, max - 0.01, dist);
    float sm2 = smoothstep(min, min - 0.01, dist);
    float alpha = sm * sm2;
    
    float g = uv.x / dist;
    float ds = (1.0 - pow(g, 16.0)) * 0.005;
    float sector = 0.5 + g / 2.0;
    float s = smoothstep(sizeAngle, sizeAngle + ds, sector);
    return 1.0 - s;
  }

  void main() {

    vec4 color = vec4(0);
    if (isPicking == 1.0) {
    
      vec2 uv = vUv;
      color = vec4(vMouseTag.rgb, circle(uv, 1.0));
    
    } else {
      
      vec2 uv = vUv - vec2(0.5);
      
      float base = drawBase(uv, 0.0, 0.5);
      if (base == 0.0) {
        discard;
      }
      if (useTwoColors == 0.0) {
        color = vec4(baseColor1, base);
      } else if (vType == 1.0) {
        color = vec4(baseColor1, base);
      } else if (vType == 2.0) {
        color = vec4(baseColor2, base);
      } else {
        color = vec4(
          mod((uv.x + uv.y/2.0) * 3.0, 1.0) 
            > 0.5 ? baseColor1 : baseColor2,
        base);
      }

      float numSegments = 0.0;
      if (vGroups.r == 1.0) {
        numSegments = numSegments + 1.0;
      }
      if (vGroups.g == 1.0) {
        numSegments = numSegments + 1.0;
      }
      if (vGroups.b == 1.0) {
        numSegments = numSegments + 1.0;
      }
      if (vGroups.a == 1.0) {
        numSegments = numSegments + 1.0;
      }

      if (numSegments > 0.0) {
      
        // uv = rotate2d(2.0 * time + vParticleIndex) * uv;
        // uv = rotate2d(2.0 * time) * uv;
        float drawn = 0.0;
        for (float i = 0.0; i < 4.0; i += 1.0) {
          float arc = drawArc(uv, 0.25, 0.45, 1.0 / numSegments * drawn * PI2, 0.5 / (numSegments-1.0));
          if (i == 0.0 && vGroups.r == 1.0) {
            if (arc > 0.0) {
              color = vec4(groupColor1, arc);
            }
            drawn += 1.0;
          } else if (i == 1.0 && vGroups.g == 1.0) {
            if (arc > 0.0) {
              color = vec4(groupColor2, arc);
            }
            drawn += 1.0;
          } else if (i == 2.0 && vGroups.b == 1.0) {
            if (arc > 0.0) {
              color = vec4(groupColor3, arc);
            }
            drawn += 1.0;
          } else if (i == 3.0 && vGroups.a == 1.0) {
            if (arc > 0.0) {
              color = vec4(groupColor4, arc);
            }
            drawn += 1.0;
          }
        }
      }

      
      color.a = vOpacity;
    }


    gl_FragColor = color;    
  }
`

export {
  vertex,
  fragment
}
