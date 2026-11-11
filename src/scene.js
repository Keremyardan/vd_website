import * as THREE from 'three';

export function createExperience(canvas) {
  document.documentElement.classList.remove('scene-ready');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  } catch {
    canvas.hidden = true;
    return null;
  }
  renderer.setClearColor(0x000000, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, .1, 180);
  const geometry = new THREE.PlaneGeometry(100, 140, 144, 160);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0, -35);
  const material = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vWorld;
      varying vec3 vNormal;
      float heightAt(vec2 p) {
        float broad = sin(p.x * .19 + sin(p.y * .075) * 1.9) * 1.8;
        float ridge = sin(p.y * .18 - p.x * .12) * 1.25;
        float fold = sin(p.x * .52 + sin(p.y * .16) * 2.) * .24;
        float valley = -1.4 * exp(-p.x * p.x * .035);
        return broad + ridge + fold + valley;
      }
      void main() {
        vec2 ground = position.xz;
        float epsilon = .08;
        float dx = (heightAt(ground + vec2(epsilon, 0.)) - heightAt(ground - vec2(epsilon, 0.))) / (2. * epsilon);
        float dz = (heightAt(ground + vec2(0., epsilon)) - heightAt(ground - vec2(0., epsilon))) / (2. * epsilon);
        vec3 point = vec3(ground.x, heightAt(ground), ground.y);
        vNormal = normalize(vec3(-dx, 1., -dz));
        vWorld = (modelMatrix * vec4(point, 1.)).xyz;
        gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.);
      }
    `,
    fragmentShader: `
      varying vec3 vWorld;
      varying vec3 vNormal;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 view = normalize(cameraPosition - vWorld);
        vec3 light = normalize(vec3(-.45, .9, .35));
        float diffuse = max(dot(normal, light), 0.);
        float highlight = pow(max(dot(reflect(-light, normal), view), 0.), 45.);
        float softHighlight = pow(max(dot(reflect(-light, normal), view), 0.), 8.);
        float edge = pow(1. - max(dot(normal, view), 0.), 3.);
        float gray = .009 + diffuse * .045 + highlight * .12 + softHighlight * .025 + edge * .01;
        float distanceToEye = length(cameraPosition - vWorld);
        float fog = 1. - exp(-distanceToEye * distanceToEye * .00052);
        gray = mix(gray, 0., fog);
        gl_FragColor = vec4(vec3(gray), 1.);
        #include <colorspace_fragment>
      }
    `
  });
  const terrain = new THREE.Mesh(geometry, material);
  terrain.frustumCulled = false;
  scene.add(terrain);

  const pointer = new THREE.Vector2();
  const smoothed = new THREE.Vector2();
  const lookAt = new THREE.Vector3();
  let frame = 0, previous = 0, frames = 0;
  let visible = true, paused = false, disposed = false;
  let width = 0, height = 0;
  let scrollTravel = readScrollTravel();

  function readScrollTravel() {
    const maximum = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    return THREE.MathUtils.clamp(scrollY / maximum, 0, 1) * 30;
  }

  function render(now) {
    frame = 0;
    if (disposed || document.hidden || !visible) return;
    const dt = previous ? Math.min((now - previous) / 1000, .1) : 1 / 60;
    previous = now;
    const scrollTarget = readScrollTravel();
    if (!paused) {
      const blend = 1 - Math.exp(-dt * 7);
      smoothed.lerp(pointer, blend);
      scrollTravel += (scrollTarget - scrollTravel) * blend;
    }
    camera.position.set(smoothed.x * 2.2, 4.8 + smoothed.y * .8, 10 + smoothed.y * 1.1 - scrollTravel);
    lookAt.set(smoothed.x * .65, -.5 + smoothed.y * .3, -15 - scrollTravel);
    camera.lookAt(lookAt);
    renderer.render(scene, camera);
    canvas.dataset.engine = `Three.js r${THREE.REVISION}`;
    canvas.dataset.objects = 'terrain';
    canvas.dataset.frames = String(++frames);
    canvas.dataset.camera = JSON.stringify(camera.position.toArray().map(value => Number(value.toFixed(4))));
    canvas.dataset.paused = String(paused);
    canvas.dataset.scrollTravel = scrollTravel.toFixed(4);
    if (!paused && (smoothed.distanceTo(pointer) > .0001 || Math.abs(scrollTarget - scrollTravel) > .0001)) frame = requestAnimationFrame(render);
  }
  function invalidate() {
    if (!frame && !disposed && visible && !document.hidden) frame = requestAnimationFrame(render);
  }
  function resize() {
    if (disposed) return;
    if (width !== innerWidth || height !== innerHeight) {
      width = innerWidth; height = innerHeight;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.25 : 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    invalidate();
  }
  function pointerMove(event) {
    if (paused || event.pointerType === 'touch') return;
    pointer.set(event.clientX / innerWidth * 2 - 1, 1 - event.clientY / innerHeight * 2);
    invalidate();
  }
  function pointerLeave(event) {
    if (event.relatedTarget !== null || paused) return;
    pointer.set(0, 0);
    invalidate();
  }
  function visibilityChange() {
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    if (!document.hidden) invalidate();
  }
  function contextLost(event) {
    event.preventDefault();
    cancelAnimationFrame(frame); frame = 0;
    canvas.hidden = true;
  }
  window.addEventListener('pointermove', pointerMove, { passive: true });
  window.addEventListener('scroll', invalidate, { passive: true });
  document.addEventListener('pointerout', pointerLeave, { passive: true });
  document.addEventListener('visibilitychange', visibilityChange);
  canvas.addEventListener('webglcontextlost', contextLost);
  resize();
  return {
    invalidate, resize,
    setVisible(value) {
      visible = value; canvas.hidden = !value;
      if (!value) { cancelAnimationFrame(frame); frame = 0; }
      else invalidate();
    },
    setPaused(value) { paused = value; invalidate(); },
    dispose() {
      disposed = true; cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', pointerMove);
      window.removeEventListener('scroll', invalidate);
      document.removeEventListener('pointerout', pointerLeave);
      document.removeEventListener('visibilitychange', visibilityChange);
      canvas.removeEventListener('webglcontextlost', contextLost);
      geometry.dispose(); material.dispose(); renderer.dispose();
    }
  };
}
