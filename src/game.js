/* Heroes Protect — independent Babylon.js superhero vertical slice.
   No third-party game assets. The layout is fixed by design for prototype 01. */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const canvas = $("renderCanvas");
  const startBtn = $("startBtn");
  if (!window.BABYLON) {
    startBtn.textContent = "BABYLON.JS FAILED TO LOAD — RELOAD ONLINE";
    startBtn.disabled = true;
    return;
  }

  const B = BABYLON;
  const mobile = matchMedia("(pointer:coarse)").matches;
  const engine = new B.Engine(canvas, true, {
    preserveDrawingBuffer: false, stencil: true, powerPreference: "high-performance"
  });
  if (mobile) engine.setHardwareScalingLevel(Math.max(1.4, window.devicePixelRatio / 1.5));

  const scene = new B.Scene(engine);
  scene.clearColor = new B.Color4(0.62, 0.79, 0.92, 1);
  scene.fogMode = B.Scene.FOGMODE_EXP2;
  scene.fogColor = new B.Color3(0.57, 0.72, 0.82);
  scene.fogDensity = 0.0019;
  scene.ambientColor = new B.Color3(0.35, 0.41, 0.46);
  const skyLight = new B.HemisphericLight("ambient daylight", new B.Vector3(0, 1, 0), scene);
  skyLight.intensity = 0.82;
  skyLight.groundColor = new B.Color3(0.16, 0.22, 0.28);
  const sun = new B.DirectionalLight("afternoon sun", new B.Vector3(-0.4, -1, 0.28), scene);
  sun.intensity = 1.08;
  sun.position = new B.Vector3(110, 190, -120);

  function mat(name, hex, glow = 0, alpha = 1) {
    const m = new B.StandardMaterial(name, scene);
    m.diffuseColor = B.Color3.FromHexString(hex);
    m.specularColor = new B.Color3(0.07, 0.09, 0.12);
    m.emissiveColor = m.diffuseColor.scale(glow);
    m.alpha = alpha;
    if (alpha < 1) m.backFaceCulling = false;
    return m;
  }
  const asphalt = mat("asphalt", "#283746");
  const sidewalk = mat("sidewalk", "#81929a");
  const roadLine = mat("road markings", "#ebd6a2", 0.15);
  const grass = mat("park grass", "#527b67");
  const leaf = mat("tree leaves", "#2e735a");
  const trunk = mat("tree trunks", "#795b47");
  const roofMat = mat("rooftop details", "#344b5c");
  const heroSuit = mat("guardian suit", "#123b56");
  const heroHighlight = mat("guardian accent", "#8feae1", 0.25);
  const capeMat = mat("guardian mantle", "#e7a05c");
  const visorMat = mat("guardian visor", "#ffdd98", 0.8);
  const glowGold = mat("incident gold", "#ffcb78", 0.65);
  const glowBlue = mat("incident blue", "#66d9e6", 0.65);
  const fireMat = mat("fire orange", "#ff863f", 0.95);
  const glassMat = mat("glass", "#335e77", 0.35);
  const carMat = mat("car red", "#c8585a");

  function box(name, w, h, d, x, y, z, material, parent) {
    const mesh = B.MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    mesh.position.set(x, y, z);
    mesh.material = material;
    mesh.isPickable = false;
    if (parent) mesh.parent = parent;
    return mesh;
  }
  function sphere(name, diameter, x, y, z, material, parent) {
    const mesh = B.MeshBuilder.CreateSphere(name, { diameter, segments: 8 }, scene);
    mesh.position.set(x, y, z);
    mesh.material = material;
    mesh.isPickable = false;
    if (parent) mesh.parent = parent;
    return mesh;
  }
  function cylinder(name, height, diameter, x, y, z, material, parent) {
    const mesh = B.MeshBuilder.CreateCylinder(name, { height, diameter, tessellation: 8 }, scene);
    mesh.position.set(x, y, z);
    mesh.material = material;
    mesh.isPickable = false;
    if (parent) mesh.parent = parent;
    return mesh;
  }
  function key(i, j) { return String(i) + ":" + String(j); }
  function pseudo(i, j) {
    const v = Math.sin(i * 127.1 + j * 311.7 + 12.65) * 43758.5453123;
    return v - Math.floor(v);
  }

  // Fixed seven-by-seven district, laid out in blocks with roads between them.
  const SPACING = 55, HALF = 3, WORLD = 475;
  const buildings = [], rooftops = new Map(), parks = new Set(["-2:-2", "2:1", "-3:2", "1:3", "3:-1"]);
  box("city ground", WORLD, 1, WORLD, 0, -0.61, 0, sidewalk);
  for (let street = -4; street <= 3; street++) {
    const at = (street + 0.5) * SPACING;
    box("north-south road", 15, 0.12, WORLD, at, 0.0, 0, asphalt);
    box("east-west road", WORLD, 0.12, 15, 0, 0.015, at, asphalt);
    for (let mark = -215; mark < 220; mark += 18) {
      box("road divider NS", 0.27, 0.013, 8, at, 0.085, mark, roadLine);
      box("road divider EW", 8, 0.013, 0.27, mark, 0.086, at, roadLine);
    }
  }

  function facadeMaterial(index) {
    const texture = new B.DynamicTexture("window pattern " + index, { width: 128, height: 256 }, scene, false);
    const ctx = texture.getContext();
    const bases = ["#465e70", "#627789", "#3c5868", "#687e88", "#44556a"];
    ctx.fillStyle = bases[index];
    ctx.fillRect(0, 0, 128, 256);
    const lit = ["#b8d9d7", "#e9cd96", "#80b4be"];
    for (let row = 0; row < 14; row++) {
      for (let col = 0; col < 5; col++) {
        ctx.fillStyle = (row * 17 + col * 13 + index * 11) % 7 < 5 ? lit[(row + col + index) % 3] : "#233d4a";
        ctx.fillRect(9 + col * 24, 8 + row * 18, 12, 9);
      }
    }
    texture.update();
    const m = mat("office facade " + index, "#ffffff");
    m.diffuseTexture = texture;
    m.emissiveColor = new B.Color3(0.08, 0.12, 0.14);
    return m;
  }
  const facades = Array.from({ length: 5 }, (_, i) => facadeMaterial(i));
  function tree(x, z, size) {
    cylinder("trunk", 4 * size, 0.55 * size, x, 2 * size, z, trunk);
    sphere("canopy", 5.4 * size, x, 5.5 * size, z, leaf);
  }
  function buildingAt(i, j) { return rooftops.get(key(i, j)); }
  for (let i = -HALF; i <= HALF; i++) {
    for (let j = -HALF; j <= HALF; j++) {
      const x = i * SPACING, z = j * SPACING;
      box("parcel curb", 39, 0.24, 39, x, 0.06, z, sidewalk);
      if (parks.has(key(i, j))) {
        box("city park", 36, 0.11, 36, x, 0.22, z, grass);
        for (let t = 0; t < 6; t++) {
          const tx = x + (pseudo(i + t, j + 17) - 0.5) * 29;
          const tz = z + (pseudo(i + 13, j + t) - 0.5) * 29;
          tree(tx, tz, 0.65 + pseudo(i + t * 2, j) * 0.4);
        }
        continue;
      }
      const special = (i === 0 && j === 0);
      const width = special ? 31 : 22 + pseudo(i + 1, j) * 13;
      const depth = special ? 31 : 22 + pseudo(i, j + 5) * 13;
      const height = special ? 70 : Math.round(17 + pseudo(i * 2, j * 3) * 44);
      const b = box(special ? "NORTHBRIDGE TOWER" : "office building", width, height, depth, x, height / 2 + 0.2, z, facades[Math.floor(pseudo(i, j) * 5)]);
      box("parapet roof", width + 1.6, 0.85, depth + 1.6, x, height + 0.35, z, roofMat);
      if (special) {
        box("roof landing marker 1", 5.7, 0.1, 0.5, x, height + 0.85, z, heroHighlight);
        box("roof landing marker 2", 0.5, 0.1, 5.7, x, height + 0.85, z, heroHighlight);
        cylinder("antenna mast", 8, 0.48, x + 12, height + 4.5, z - 12, roofMat);
        sphere("tower warning lamp", 1.25, x + 12, height + 8.5, z - 12, glowGold);
      } else {
        box("rooftop vent", 3, 1.9, 3, x + width * 0.25, height + 1.65, z - depth * 0.2, roofMat);
      }
      const entry = { x, z, h: height + 0.8, rawHeight: height, halfW: (width + 1.6) / 2, halfD: (depth + 1.6) / 2, mesh: b };
      buildings.push(entry);
      rooftops.set(key(i, j), entry);
    }
  }
  // Small pedestrian-scale details help the city read from rooftop and street views.
  for (let n = -3; n <= 3; n++) {
    for (const s of [-1, 1]) {
      const x = n * SPACING + s * 18.7;
      tree(x, -3.5 * SPACING + 6, 0.62);
      tree(x, 3.5 * SPACING - 6, 0.62);
    }
  }

  // Original guardian placeholder — no licensed superhero costumes or insignia.
  const player = new B.TransformNode("GUARDIAN", scene);
  const heroBody = box("guardian torso", 1.2, 1.45, 0.75, 0, 1.34, 0, heroSuit, player);
  box("guardian mantle", 1.55, 1.65, 0.11, 0, 1.16, -0.43, capeMat, player).rotation.x = -0.16;
  sphere("head", 0.88, 0, 2.48, 0, heroSuit, player);
  box("visor", 0.66, 0.22, 0.16, 0, 2.52, 0.40, visorMat, player);
  for (const side of [-1, 1]) {
    box("arm", 0.35, 1.2, 0.38, side * 0.77, 1.33, 0, heroSuit, player);
    box("gauntlet", 0.4, 0.36, 0.45, side * 0.77, 0.85, 0.03, heroHighlight, player);
    box("leg", 0.44, 0.85, 0.45, side * 0.32, 0.43, 0.03, heroSuit, player);
  }
  player.position.set(0, 71, 0);

  const camera = new B.FreeCamera("third person camera", new B.Vector3(0, 80, -15), scene);
  camera.minZ = 0.15;
  camera.maxZ = 1100;
  camera.fov = 0.8;
  scene.activeCamera = camera;
  let yaw = 0.65, pitch = 0.2, flying = false, verticalSpeed = 0, speed = 0;
  let moveVelocity = B.Vector3.Zero();
  let active = false, menuOpen = false, time = 0, hudTick = 0, toastTime = 0;
  const keyboard = Object.create(null);
  const held = new Set();
  const map = $("miniMap"), mapCtx = map.getContext("2d");
  const toast = $("toast");
  const transient = [];
  const baseCitizens = [];

  function citizen(name, x, y, z, shirt, scale = 1) {
    const p = new B.TransformNode(name, scene);
    p.position.set(x, y, z);
    p.scaling.scaleInPlace(scale);
    const skin = mat(name + " skin", "#ddb699");
    cylinder(name + " body", 1.45, 0.55, 0, 1.27, 0, shirt, p);
    sphere(name + " head", 0.62, 0, 2.24, 0, skin, p);
    for (const side of [-1, 1]) {
      box(name + " leg", 0.23, 0.83, 0.25, side * 0.19, 0.41, 0, heroSuit, p);
    }
    return p;
  }
  for (let i = 0; i < 13; i++) {
    const street = (i % 7 - 3) * SPACING + 18;
    const parallel = (Math.floor(i * 5 / 7) - 3) * SPACING;
    const p = citizen("pedestrian", street, 0.2, parallel, i % 2 ? roofMat : capeMat, 0.75);
    baseCitizens.push({ node: p, x: street, z: parallel, phase: i });
  }

  const incidents = [];
  function makeMarker(incident, color) {
    const markerMaterial = color === "gold" ? glowGold : glowBlue;
    const beamMaterial = mat("beam " + incident.id, color === "gold" ? "#ffcc88" : "#6adce8", 0.8, 0.17);
    const beam = B.MeshBuilder.CreateCylinder("signal " + incident.id, { height: 31, diameterTop: 0.22, diameterBottom: 1.5, tessellation: 12 }, scene);
    beam.position.set(incident.x, incident.y + 18, incident.z);
    beam.material = beamMaterial;
    beam.isPickable = false;
    const ring = B.MeshBuilder.CreateTorus("beacon ring " + incident.id, { diameter: 8, thickness: 0.25, tessellation: 30 }, scene);
    ring.position.set(incident.x, incident.y + 3.3, incident.z);
    ring.material = markerMaterial;
    ring.isPickable = false;
    incident.beam = beam;
    incident.ring = ring;
    incident.visuals.push(beam, ring);
  }
  function addIncident(spec, marker = "gold") {
    const m = { ...spec, done: false, visuals: [], marker };
    incidents.push(m);
    makeMarker(m, marker);
    return m;
  }
  // Fires respond to a cooling blast; other events respond to physical help.
  const fireRoof = buildingAt(-2, 1);
  const fire = addIncident({
    id: "fire", name: "Rooftop fire", desc: "A rooftop has caught fire. Get close and use COOL (Q) to extinguish it.",
    x: fireRoof.x, y: fireRoof.h + 0.5, z: fireRoof.z, action: "cool"
  }, "gold");
  for (let i = 0; i < 4; i++) {
    const flame = B.MeshBuilder.CreateCylinder("rooftop flame", {
      height: 3.4 + i * 0.45, diameterTop: 0, diameterBottom: 1.8, tessellation: 6
    }, scene);
    flame.position.set(fire.x + (i - 1.5) * 2.1, fire.y + 1.1, fire.z + (i % 2) * 2 - 1);
    flame.material = fireMat;
    fire.visuals.push(flame);
    transient.push({ mesh: flame, mode: "flame", phase: i * 2 });
  }

  const rescueRoof = buildingAt(2, -2);
  const rescue = addIncident({
    id: "rescue", name: "Stranded on the roof", desc: "A civilian cannot get down. Fly to the rooftop and press HELP (E).",
    x: rescueRoof.x, y: rescueRoof.h + 1, z: rescueRoof.z, action: "interact"
  }, "blue");
  rescue.visuals.push(citizen("stranded citizen", rescue.x, rescueRoof.h, rescue.z, capeMat, 0.9));

  const traffic = addIncident({
    id: "traffic", name: "Runaway vehicle", desc: "Stop a runaway car before it reaches the intersection. Approach and press HELP (E).",
    x: 27.5, y: 1.2, z: -92, action: "interact"
  }, "gold");
  const car = new B.TransformNode("runaway car", scene);
  car.position.set(traffic.x, 0.7, traffic.z);
  box("runaway car body", 3.2, 1.1, 6, 0, 0.65, 0, carMat, car);
  box("runaway windshield", 2.9, 0.85, 2.6, 0, 1.55, -0.3, glassMat, car);
  for (const side of [-1, 1]) for (const end of [-1, 1]) {
    const wheel = cylinder("wheel", 0.32, 1.08, side * 1.66, 0.35, end * 1.9, roofMat, car);
    wheel.rotation.z = Math.PI / 2;
  }
  traffic.visuals.push(car);

  const debris = addIncident({
    id: "debris", name: "Collapsed structure", desc: "Heavy debris is blocking a street. Use HELP (E) to lift and clear it.",
    x: -27.5, y: 1, z: 112, action: "interact"
  }, "blue");
  for (let i = 0; i < 5; i++) {
    const rubble = box("concrete rubble", 3.6 + i * 0.3, 1.4, 2.6, debris.x + (i - 2) * 1.2, 0.85 + i * 0.09, debris.z + (i % 2) * 2.0, roofMat);
    rubble.rotation.y = i * 0.63;
    rubble.rotation.z = (i - 2) * 0.11;
    debris.visuals.push(rubble);
  }

  function distanceTo(m) {
    const dx = player.position.x - m.x;
    const dy = (player.position.y + 1) - m.y;
    const dz = player.position.z - m.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  function nearest() {
    return incidents.filter(m => !m.done).sort((a, b) => distanceTo(a) - distanceTo(b))[0] || null;
  }
  function setToast(message, seconds = 3) {
    toast.textContent = message;
    toast.classList.add("visible");
    toastTime = seconds;
  }
  function complete(m) {
    if (!m || m.done) return;
    m.done = true;
    for (const item of m.visuals) item.setEnabled(false);
    const done = incidents.filter(m => m.done).length;
    $("progress").textContent = String(done) + " / " + String(incidents.length);
    $("progressFill").style.width = String(done / incidents.length * 100) + "%";
    if (done === incidents.length) {
      setToast("DISTRICT SECURED • All four emergencies resolved. You're the difference.", 9);
    } else {
      setToast("CIVILIANS PROTECTED • " + m.name + " resolved.", 4);
    }
    updateHUD();
  }

  function burst(color, isCool = false) {
    const ringMat = mat("temporary burst", color, 0.8, 0.9);
    const ring = B.MeshBuilder.CreateTorus("ability pulse", {
      diameter: isCool ? 2.3 : 3, thickness: 0.22, tessellation: 32
    }, scene);
    ring.position.copyFrom(player.position);
    ring.position.y += isCool ? 1.7 : 0.75;
    ring.material = ringMat;
    ring.isPickable = false;
    transient.push({ mesh: ring, material: ringMat, age: 0, life: 0.55, mode: "burst", isCool });
  }
  function act(which) {
    if (!active || menuOpen) return;
    if (which === "flight") {
      flying = !flying;
      verticalSpeed = 0;
      moveVelocity.scaleInPlace(0.3);
      setToast(flying ? "FLIGHT ENGAGED • Space to rise, Ctrl to descend." : "FLIGHT DISENGAGED • Returning to the rooftops.");
    } else if (which === "interact") {
      const candidate = incidents.filter(m => !m.done && m.action === "interact").sort((a, b) => distanceTo(a) - distanceTo(b))[0];
      if (candidate && distanceTo(candidate) < 11) complete(candidate);
      else setToast("Move within 11 meters of a rescue, vehicle, or debris marker.");
    } else if (which === "cool") {
      burst("#76e9fb", true);
      if (!fire.done && distanceTo(fire) < 17) complete(fire);
      else setToast("Cooling blast deployed. Get closer to the rooftop fire to stop it.", 2);
    } else if (which === "pulse") {
      burst("#f1ce8f", false);
      if (!debris.done && distanceTo(debris) < 11) complete(debris);
      else setToast("Nonlethal strength pulse deployed.", 1.8);
    } else if (which === "reset") {
      for (const m of incidents) {
        m.done = false;
        m.visuals.forEach(v => v.setEnabled(true));
      }
      player.position.set(0, 71, 0);
      verticalSpeed = 0;
      flying = false;
      moveVelocity.set(0, 0, 0);
      $("progress").textContent = "0 / 4";
      $("progressFill").style.width = "0%";
      setToast("DISTRICT RESET • Four emergency signals are active.");
      updateHUD();
    }
  }

  function supportAt(x, z, footY) {
    let level = 0.2;
    for (const b of buildings) {
      if (Math.abs(x - b.x) < b.halfW && Math.abs(z - b.z) < b.halfD &&
          footY >= b.h - 1.4) level = Math.max(level, b.h);
    }
    return level;
  }
  function collidesWithBuilding(x, z, y) {
    return buildings.some(b => Math.abs(x - b.x) < b.halfW + 0.6 &&
      Math.abs(z - b.z) < b.halfD + 0.6 && y < b.h - 0.55);
  }
  const isDown = (name) => held.has(name) || {
    forward: keyboard.KeyW || keyboard.ArrowUp, backward: keyboard.KeyS || keyboard.ArrowDown,
    left: keyboard.KeyA, right: keyboard.KeyD, ascend: keyboard.Space,
    descend: keyboard.ControlLeft || keyboard.ControlRight || keyboard.KeyC,
    boost: keyboard.ShiftLeft || keyboard.ShiftRight
  }[name];

  function updatePlayer(dt) {
    // Arrow keys can rotate the view as an alternative to mouse-look.
    if (keyboard.ArrowLeft) yaw -= dt * 1.65;
    if (keyboard.ArrowRight) yaw += dt * 1.65;
    const forward = new B.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const right = new B.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    let walk = B.Vector3.Zero();
    if (isDown("forward")) walk.addInPlace(forward);
    if (isDown("backward")) walk.subtractInPlace(forward);
    if (isDown("right")) walk.addInPlace(right);
    if (isDown("left")) walk.subtractInPlace(right);
    if (walk.lengthSquared() > 0) walk.normalize();

    const boost = !!isDown("boost");
    const maxSpeed = flying ? (boost ? 67 : 29) : (boost ? 22 : 12);
    const desired = walk.scale(maxSpeed);
    moveVelocity = B.Vector3.Lerp(moveVelocity, desired, Math.min(1, dt * (flying ? 4.3 : 11)));
    const nx = B.Scalar.Clamp(player.position.x + moveVelocity.x * dt, -WORLD / 2 + 3, WORLD / 2 - 3);
    const nz = B.Scalar.Clamp(player.position.z + moveVelocity.z * dt, -WORLD / 2 + 3, WORLD / 2 - 3);
    // Prevent clipping through building volumes while permitting rooftop traversal.
    if (!collidesWithBuilding(nx, player.position.z, player.position.y)) player.position.x = nx;
    if (!collidesWithBuilding(player.position.x, nz, player.position.y)) player.position.z = nz;

    const floor = supportAt(player.position.x, player.position.z, player.position.y);
    if (flying) {
      const rise = (isDown("ascend") ? 1 : 0) - (isDown("descend") ? 1 : 0);
      const changeY = rise * (boost ? 44 : 22) * dt;
      const nextY = B.Scalar.Clamp(player.position.y + changeY, 0.2, 195);
      if (changeY > 0 || !collidesWithBuilding(player.position.x, player.position.z, nextY)) {
        player.position.y = Math.max(nextY, floor);
      }
      verticalSpeed = 0;
    } else {
      verticalSpeed -= 27 * dt;
      player.position.y += verticalSpeed * dt;
      if (player.position.y <= floor && verticalSpeed <= 0) {
        player.position.y = floor;
        verticalSpeed = 0;
      }
    }
    speed = Math.round(Math.sqrt(moveVelocity.lengthSquared()) * 3.6);
    player.rotation.y = yaw;
    // Slight hover and speed tilt make movement legible without requiring a rig.
    heroBody.rotation.z = flying ? B.Scalar.Clamp(-moveVelocity.x / 170, -0.2, 0.2) : 0;
    heroBody.rotation.x = flying ? Math.min(moveVelocity.length() / 140, 0.25) : 0;
    const target = player.position.add(new B.Vector3(0, 1.7, 0));
    const d = flying ? 14.3 : 10.7;
    const targetCamera = target.subtract(forward.scale(d)).add(new B.Vector3(0, 3.8 + pitch * 14, 0));
    camera.position = B.Vector3.Lerp(camera.position, targetCamera, Math.min(1, dt * 7.8));
    camera.setTarget(target.add(new B.Vector3(0, pitch * 3.8, 0)));
  }

  function updateVisuals(dt) {
    for (const t of transient) {
      if (t.mode === "flame") {
        if (t.mesh.isEnabled()) {
          const flicker = 1 + 0.14 * Math.sin(time * 8 + t.phase);
          t.mesh.scaling.y = flicker;
          t.mesh.rotation.y = time * 0.7 + t.phase;
        }
      } else if (t.mode === "burst") {
        t.age += dt;
        const fraction = Math.min(1, t.age / t.life);
        t.mesh.scaling.setAll(1 + 6 * fraction);
        t.material.alpha = 0.88 * (1 - fraction);
        if (fraction >= 1) { t.mesh.dispose(); t.material.dispose(); t.mode = "expired"; }
      }
    }
    for (let i = transient.length - 1; i >= 0; i--) if (transient[i].mode === "expired") transient.splice(i, 1);
    for (const m of incidents) {
      if (m.done) continue;
      m.ring.rotation.y += dt * 0.45;
      m.ring.position.y = m.y + 3.3 + Math.sin(time * 2.2) * 0.35;
    }
    if (!traffic.done) {
      const z = -92 + Math.sin(time * 0.7) * 21;
      car.position.z = z;
      traffic.z = z;
      traffic.beam.position.z = z;
      traffic.ring.position.z = z;
    }
    baseCitizens.forEach(p => {
      const t = time * 0.48 + p.phase;
      p.node.position.x = p.x + Math.sin(t) * 2.3;
      p.node.position.z = p.z + Math.cos(t) * 1.7;
    });
    if (toastTime > 0) {
      toastTime -= dt;
      if (toastTime <= 0) toast.classList.remove("visible");
    }
  }

  function updateHUD() {
    const m = nearest();
    $("flightState").textContent = flying ? "AIRBORNE" : "GROUNDED";
    $("speedValue").textContent = String(speed) + " km/h";
    if (m) {
      $("missionName").textContent = m.name;
      $("missionDesc").textContent = m.desc;
      $("missionDistance").textContent = "DISTANCE " + Math.round(distanceTo(m)) + " m";
      $("missionHint").textContent = m.action === "cool" ?
        "Get within 17 m. Use Q / COOL to extinguish." :
        "Get within 11 m. Use E / HELP to intervene.";
    } else {
      $("missionName").textContent = "Northbridge is secure";
      $("missionDesc").textContent = "All four incidents resolved. Keep exploring, or press R to restart patrol.";
      $("missionDistance").textContent = "DISTRICT STATUS: SAFE";
      $("missionHint").textContent = "New incident types and city generation are on the roadmap.";
    }
    drawMap();
  }

  function drawMap() {
    const ctx = mapCtx, W = map.width, H = map.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0b2636";
    ctx.fillRect(0, 0, W, H);
    const xmap = (v) => W / 2 + v * W / 450;
    const zmap = (v) => H / 2 - v * H / 450;
    ctx.strokeStyle = "rgba(121,173,188,.22)";
    ctx.lineWidth = 6;
    for (let j = -4; j <= 3; j++) {
      const offset = (j + 0.5) * SPACING;
      ctx.beginPath(); ctx.moveTo(xmap(offset), 0); ctx.lineTo(xmap(offset), H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, zmap(offset)); ctx.lineTo(W, zmap(offset)); ctx.stroke();
    }
    for (const b of buildings) {
      ctx.fillStyle = b.rawHeight > 52 ? "#496c82" : "#345567";
      ctx.fillRect(xmap(b.x) - b.halfW * W / 450, zmap(b.z) - b.halfD * H / 450,
        b.halfW * 2 * W / 450, b.halfD * 2 * H / 450);
    }
    for (const m of incidents) {
      if (m.done) continue;
      ctx.fillStyle = m.marker === "gold" ? "#ffcc83" : "#7de7ee";
      ctx.beginPath(); ctx.arc(xmap(m.x), zmap(m.z), 4.3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.42)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(xmap(m.x), zmap(m.z), 7, 0, Math.PI * 2); ctx.stroke();
    }
    const x = xmap(player.position.x), y = zmap(player.position.z);
    ctx.save(); ctx.translate(x, y); ctx.rotate(-yaw);
    ctx.fillStyle = "#a3fff0";
    ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(-6, 6); ctx.lineTo(0, 3); ctx.lineTo(6, 6);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  function showHelp() {
    menuOpen = true;
    $("helpModal").classList.remove("hidden");
    if (document.pointerLockElement === canvas) document.exitPointerLock();
  }
  function closeHelp() {
    menuOpen = false;
    $("helpModal").classList.add("hidden");
  }
  $("menuBtn").addEventListener("click", showHelp);
  $("closeHelp").addEventListener("click", closeHelp);
  $("resumeBtn").addEventListener("click", closeHelp);
  $("restartBtn").addEventListener("click", () => { act("reset"); closeHelp(); });

  startBtn.addEventListener("click", () => {
    active = true;
    $("intro").classList.add("hidden");
    setToast("PATROL STARTED • Locate the emergency signal pillars.", 5);
    if (!mobile && canvas.requestPointerLock) canvas.requestPointerLock();
    updateHUD();
  });
  window.addEventListener("keydown", (e) => {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
    keyboard[e.code] = true;
    if (e.repeat || !active || menuOpen) return;
    const actions = { KeyF: "flight", KeyE: "interact", KeyQ: "cool", KeyJ: "pulse", KeyR: "reset" };
    if (actions[e.code]) act(actions[e.code]);
    if (e.code === "Space" && !flying && Math.abs(verticalSpeed) < 0.2 &&
        player.position.y <= supportAt(player.position.x, player.position.z, player.position.y) + 0.4) {
      verticalSpeed = 14;
    }
  });
  window.addEventListener("keyup", (e) => { keyboard[e.code] = false; });
  window.addEventListener("blur", () => { for (const k of Object.keys(keyboard)) keyboard[k] = false; held.clear(); });
  document.addEventListener("mousemove", (e) => {
    if (!active || menuOpen || document.pointerLockElement !== canvas) return;
    yaw += e.movementX * 0.0029;
    pitch = B.Scalar.Clamp(pitch - e.movementY * 0.0021, -0.26, 0.65);
  });
  canvas.addEventListener("click", (e) => {
    if (!active || menuOpen || mobile) return;
    if (document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    } else {
      act("pulse");
    }
  });
  let drag = null;
  canvas.addEventListener("pointerdown", (e) => {
    if (!mobile || !active || menuOpen) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    yaw += (e.clientX - drag.x) * 0.008;
    pitch = B.Scalar.Clamp(pitch - (e.clientY - drag.y) * 0.006, -0.26, 0.65);
    drag.x = e.clientX; drag.y = e.clientY;
  });
  function endDrag(e) { if (drag && drag.id === e.pointerId) drag = null; }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  document.querySelectorAll("[data-hold]").forEach(btn => {
    const name = btn.dataset.hold;
    const stop = (e) => { held.delete(name); btn.classList.remove("pressed"); if (e) e.preventDefault(); };
    btn.addEventListener("pointerdown", e => {
      e.preventDefault();
      held.add(name); btn.classList.add("pressed");
      btn.setPointerCapture(e.pointerId);
      if (name === "ascend" && !flying && Math.abs(verticalSpeed) < 0.2) {
        verticalSpeed = 14;
      }
    });
    btn.addEventListener("pointerup", stop);
    btn.addEventListener("pointercancel", stop);
    btn.addEventListener("lostpointercapture", stop);
  });
  document.querySelectorAll("[data-action]").forEach(btn =>
    btn.addEventListener("click", () => act(btn.dataset.action))
  );

  // Render immediately behind the splash; only simulation awaits BEGIN PATROL.
  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(engine.getDeltaTime() / 1000, 0.04);
    time += dt;
    if (active && !menuOpen) {
      updatePlayer(dt);
      updateVisuals(dt);
      hudTick += dt;
      if (hudTick > 0.18) { hudTick = 0; updateHUD(); }
    } else {
      const look = player.position.add(new B.Vector3(0, 2.2, 0));
      camera.setTarget(look);
    }
  });
  updateHUD();
  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
})();