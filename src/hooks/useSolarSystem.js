import { useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { yuvaData } from '../data';

/**
 * Manages the Three.js solar system scene.
 * onPlanetClick + onVoidClick are stored in refs so they're always the latest callbacks.
 */
export function useSolarSystem({ onPlanetClick, onVoidClick }) {
  const onPlanetClickRef = useRef(onPlanetClick);
  onPlanetClickRef.current = onPlanetClick;

  const onVoidClickRef = useRef(onVoidClick);
  onVoidClickRef.current = onVoidClick;

  const planetObjectsRef = useRef([]);
  const animFrameRef = useRef(null);
  const timeScaleRef = useRef(1.0);
  const selectedPivotRef = useRef(null);
  const highlightRef = useRef(null);
  const cameraRef = useRef(null);

  const init = () => {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1200);
    camera.position.set(0, 80, 160);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 450;

    // ── Lights ──────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x404060, 3));
    const sunLight = new THREE.PointLight(0xffffcc, 4, 700);
    scene.add(sunLight);
    const fillLight = new THREE.DirectionalLight(0x8899cc, 0.8);
    fillLight.position.set(-100, 50, -100);
    scene.add(fillLight);

    // ── Sun ─────────────────────────────────────────────────
    const sunGeo = new THREE.SphereGeometry(12, 64, 64);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    [{ r: 14, c: 0xffaa00, o: 0.18 }, { r: 17, c: 0xff6600, o: 0.07 }].forEach(({ r, c, o }) => {
      const g = new THREE.SphereGeometry(r, 32, 32);
      const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, side: THREE.BackSide });
      scene.add(new THREE.Mesh(g, m));
    });

    // ── Background Stars ─────────────────────────────────────
    const starsArr = [];
    for (let i = 0; i < 3000; i++) {
      starsArr.push(
        THREE.MathUtils.randFloatSpread(1000),
        THREE.MathUtils.randFloatSpread(1000),
        THREE.MathUtils.randFloatSpread(1000)
      );
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starsArr, 3));
    scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.45 })));

    // ── Highlight ring ───────────────────────────────────────
    const hlGeo = new THREE.RingGeometry(0, 0, 64);
    const hlMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.7,
    });
    const hlMesh = new THREE.Mesh(hlGeo, hlMat);
    hlMesh.rotation.x = Math.PI / 2;
    hlMesh.visible = false;
    scene.add(hlMesh);
    highlightRef.current = hlMesh;

    const labelsContainer = document.getElementById('labels-container');

    // ── Build Planets ────────────────────────────────────────
    const planetObjects = [];

    yuvaData.forEach((data) => {
      // Visible planet mesh
      const geo = new THREE.SphereGeometry(data.size, 48, 48);
      const mat = new THREE.MeshStandardMaterial({
        color: data.color,
        emissive: data.color,
        emissiveIntensity: 0.45,
        roughness: 0.55,
        metalness: 0.05,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = data;

      // Saturn ring
      if (data.hasRing) {
        const rGeo = new THREE.RingGeometry(data.size + 1.2, data.size + 4.5, 64);
        const rMat = new THREE.MeshBasicMaterial({
          color: 0xddccaa, side: THREE.DoubleSide, transparent: true, opacity: 0.7,
        });
        const ring = new THREE.Mesh(rGeo, rMat);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
      }

      // Invisible hitbox sphere (3× size) for easier planet clicking
      const hitboxGeo = new THREE.SphereGeometry(Math.max(data.size * 3, 5), 16, 16);
      const hitboxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
      hitbox.userData = data;
      mesh.add(hitbox);

      const pivot = new THREE.Object3D();
      pivot.rotation.y = Math.random() * Math.PI * 2;
      pivot.add(mesh);
      scene.add(pivot);
      mesh.position.x = data.distance;

      // ── Orbit rings ──────────────────────────────────────
      // Visual ring — thin, subtle
      const oVisGeo = new THREE.RingGeometry(data.distance - 0.25, data.distance + 0.25, 128);
      const oVisMat = new THREE.MeshBasicMaterial({
        color: 0x334466, side: THREE.DoubleSide, transparent: true, opacity: 0.35,
      });
      const orbitMesh = new THREE.Mesh(oVisGeo, oVisMat);
      orbitMesh.rotation.x = Math.PI / 2;
      orbitMesh.userData = data; // for raycasting
      scene.add(orbitMesh);

      // Invisible wide hitbox ring — same orbit, much wider, opacity 0
      const oHitGeo = new THREE.RingGeometry(data.distance - 4, data.distance + 4, 64);
      const oHitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
      const orbitHitbox = new THREE.Mesh(oHitGeo, oHitMat);
      orbitHitbox.rotation.x = Math.PI / 2;
      orbitHitbox.userData = data;
      scene.add(orbitHitbox);

      // 2D Label
      const label = document.createElement('div');
      label.className = 'planet-label';
      label.textContent = data.name;
      labelsContainer?.appendChild(label);

      planetObjects.push({ pivot, mesh, hitbox, orbitMesh, orbitHitbox, speed: data.speed, size: data.size, labelElem: label, data });
    });

    planetObjectsRef.current = planetObjects;

    // ── Raycasting / Click ───────────────────────────────────
    const raycaster = new THREE.Raycaster();
    raycaster.params.Line = { threshold: 2 };
    const mouse = new THREE.Vector2();
    let ptrDownX = 0, ptrDownY = 0;

    // All clickable objects: planet sphere + hitbox + visual orbit + orbit hitbox
    const clickTargets = planetObjects.flatMap(p => [p.mesh, p.hitbox, p.orbitMesh, p.orbitHitbox]);

    const onPointerDown = (e) => {
      ptrDownX = e.clientX;
      ptrDownY = e.clientY;
    };

    const onPointerUp = (e) => {
      // Ignore drags
      if (Math.hypot(e.clientX - ptrDownX, e.clientY - ptrDownY) > 8) return;

      // Ignore clicks on UI elements (sidebar, panel, buttons)
      if (e.target !== canvas) return;

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const hits = raycaster.intersectObjects(clickTargets, false);

      if (hits.length > 0) {
        // Hit a planet or orbit — find valid data
        const hitData = hits[0].object.userData;
        if (hitData && typeof hitData.id === 'number') {
          _selectPlanetInternal(hitData.id, planetObjects);
          onPlanetClickRef.current(hitData.id);
        }
      } else {
        // Hit nothing (void) — close the card and resume orbits
        onVoidClickRef.current?.();
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    // ── Resize ───────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Animation Loop ───────────────────────────────────────
    let sunRot = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const ts = timeScaleRef.current;

      planetObjects.forEach(p => {
        p.pivot.rotation.y += p.speed * ts;
        p.mesh.rotation.y += 0.015 * ts;

        const tempV = new THREE.Vector3();
        p.mesh.getWorldPosition(tempV);
        tempV.project(camera);
        if (tempV.z < 1) {
          p.labelElem.style.display = 'block';
          p.labelElem.style.left = `${(tempV.x * 0.5 + 0.5) * window.innerWidth}px`;
          p.labelElem.style.top = `${(tempV.y * -0.5 + 0.5) * window.innerHeight - 22}px`;
        } else {
          p.labelElem.style.display = 'none';
        }
      });

      if (selectedPivotRef.current && hlMesh.visible) {
        const pos = new THREE.Vector3();
        selectedPivotRef.current.mesh.getWorldPosition(pos);
        hlMesh.position.copy(pos);
        hlMesh.lookAt(camera.position);
      }

      sunRot += 0.004 * ts;
      sun.rotation.y = sunRot;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      planetObjects.forEach(p => p.labelElem?.remove());
    };
  };

  const _selectPlanetInternal = (id, planetObjects) => {
    const pObj = planetObjects[id];
    const data = yuvaData[id];
    if (!pObj) return;

    timeScaleRef.current = 0;
    selectedPivotRef.current = pObj;

    const hl = highlightRef.current;
    if (hl) {
      hl.geometry.dispose();
      hl.geometry = new THREE.RingGeometry(data.size + 2, data.size + 2.8, 64);
      hl.visible = true;
    }
  };

  const selectPlanet = (id) => {
    _selectPlanetInternal(id, planetObjectsRef.current);
  };

  const deselectPlanet = () => {
    timeScaleRef.current = 1.0;
    selectedPivotRef.current = null;
    if (highlightRef.current) highlightRef.current.visible = false;
  };

  return { init, selectPlanet, deselectPlanet };
}
