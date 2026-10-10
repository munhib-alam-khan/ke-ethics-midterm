// Renderer, post-processing chain and camera rig.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { reg } from './kit.js';

const FinalShader = {
  uniforms: {
    tDiffuse: { value: null }, uTime: { value: 0 }, uFade: { value: 0 }, uFadeCol: { value: new THREE.Color(0, 0, 0) },
    uVig: { value: 0.9 }, uGrain: { value: 0.05 }, uTilt: { value: 0 }, uTiltY: { value: 0.5 }, uRes: { value: new THREE.Vector2(1920, 1080) },
    uWarm: { value: 0 }, uSat: { value: 1 }, uWhip: { value: 0 }, uWhipDir: { value: new THREE.Vector2(1, 0) }, uLift: { value: 0 }
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime, uFade, uVig, uGrain, uTilt, uTiltY, uWarm, uSat, uWhip, uLift;
    uniform vec3 uFadeCol; uniform vec2 uRes, uWhipDir; varying vec2 vUv;
    float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
    void main(){
      vec2 uv = vUv;
      vec3 c;
      float blur = uTilt * smoothstep(0.08, 0.42, abs(uv.y - uTiltY));
      if (uWhip > 0.001) {
        c = vec3(0.0);
        for (int i = -6; i <= 6; i++) c += texture2D(tDiffuse, uv + uWhipDir * float(i) * uWhip * 0.012).rgb;
        c /= 13.0;
      } else if (blur > 0.001) {
        c = vec3(0.0); float tot = 0.0;
        for (int i = -4; i <= 4; i++) for (int j = -4; j <= 4; j += 2) {
          float w = 1.0 - length(vec2(i, j)) / 7.0;
          c += texture2D(tDiffuse, uv + vec2(float(j), float(i)) * blur * 2.2 / uRes).rgb * w; tot += w;
        }
        c /= tot;
      } else c = texture2D(tDiffuse, uv).rgb;
      // grade
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, uSat);
      c += vec3(0.05, 0.02, -0.03) * uWarm;
      c = c * (1.0 - uLift) + uLift * vec3(0.06, 0.07, 0.1);
      // vignette
      vec2 d = uv - 0.5; d.x *= uRes.x / uRes.y;
      c *= mix(1.0, smoothstep(1.05, 0.25, length(d)), uVig);
      // grain
      c += (hash(uv * uRes + fract(uTime) * 100.0) - 0.5) * uGrain;
      c = mix(c, uFadeCol, uFade);
      gl_FragColor = vec4(c, 1.0);
    }`
};

export function createRenderer(canvas, quality) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality > 0, powerPreference: 'high-performance', alpha: false });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x05060a, 1);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0c1020, 0.012);
  const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.03, 1500);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(960, 540), 0.75, 0.55, 0.82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const final = new ShaderPass(FinalShader);
  composer.addPass(final);

  const U = final.uniforms;
  reg('fade', 0, v => { U.uFade.value = v; });
  reg('tilt', 0, v => { U.uTilt.value = v; });
  reg('tiltY', 0.5, v => { U.uTiltY.value = v; });
  reg('warm', 0, v => { U.uWarm.value = v; });
  reg('sat', 1, v => { U.uSat.value = v; });
  reg('whip', 0, v => { U.uWhip.value = v; });
  reg('bloom', 0.75, v => { bloom.strength = v; });
  reg('exposure', 1, v => { renderer.toneMappingExposure = v; });
  reg('fog', 0.012, v => { scene.fog.density = v; });
  reg('vig', 0.9, v => { U.uVig.value = v; });

  let W = 0, H = 0, pr = 1;
  function resize(w, h, ratio) {
    W = w; H = h; pr = ratio;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(pr);
    composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    U.uRes.value.set(w * pr, h * pr);
  }
  return { renderer, scene, camera, composer, bloom, final, resize, U, get size() { return [W, H, pr]; } };
}

// camera rig: position + look target + fov + roll, all tweenable params
export function cameraRig(camera) {
  const rig = { px: 0, py: 5, pz: 10, tx: 0, ty: 4, tz: 0, fov: 45, roll: 0 };
  const up = new THREE.Vector3(0, 1, 0);
  const tmp = new THREE.Vector3();
  rig.apply = (sway = 0, t = 0) => {
    camera.position.set(rig.px, rig.py, rig.pz);
    tmp.set(rig.tx, rig.ty, rig.tz);
    // breathing hand-held drift
    if (sway) { camera.position.x += Math.sin(t * 0.37) * 0.02 * sway; camera.position.y += Math.sin(t * 0.53 + 1) * 0.015 * sway; tmp.x += Math.sin(t * 0.21) * 0.03 * sway; }
    camera.up.copy(up);
    camera.lookAt(tmp);
    if (rig.roll) camera.rotateZ(rig.roll * Math.PI / 180);
    if (camera.fov !== rig.fov) { camera.fov = rig.fov; camera.updateProjectionMatrix(); }
  };
  return rig;
}
