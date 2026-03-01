import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';
import { Player } from './player.js';
import { World } from './world.js';
import { UI } from './ui.js';
import { loadSave, saveProgress, resetSave } from './saveSystem.js';
import { checkPlayerCollision, resolveGround } from './physics.js';

const canvas = document.getElementById('gameCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2500);

const ui = new UI();
let save = loadSave();
ui.setAvatar(save.selectedAvatar);

const world = new World(scene);
let player = new Player(scene, save.selectedAvatar);

const input = { forward: false, backward: false, left: false, right: false, jump: false, sprint: false };
const mouse = { down: false, dx: 0, dy: 0 };

let running = false;
let paused = false;
let timer = 0;
let currentStage = save.lastCheckpoint || 1;
let deaths = save.totalDeaths || 0;
let checkpointStage = save.lastCheckpoint || 1;
let checkpointPos = new THREE.Vector3(0, checkpointStage * 8 + 4, 0);
let camYaw = Math.PI;
let camPitch = 0.35;
let sensitivity = 0.003;

function spawnAtCheckpoint() {
  checkpointPos.set(0, checkpointStage * 8 + 4, 0);
  player.setSpawn(checkpointPos);
}
spawnAtCheckpoint();

function rebuildPlayer(avatar) {
  scene.remove(player.group);
  player = new Player(scene, avatar);
  spawnAtCheckpoint();
}

function killPlayer() {
  deaths += 1;
  save = saveProgress({ totalDeaths: deaths });
  spawnAtCheckpoint();
}

function setStageFromHeight() {
  const derived = Math.max(1, Math.floor((player.position.y + 4) / 8));
  currentStage = Math.min(111, derived);
  if (currentStage > save.highestStage) {
    save = saveProgress({ highestStage: currentStage });
  }
}

function handleCollisions() {
  player.isGrounded = false;

  for (const c of world.colliders) {
    if (c.disabled || !c.mesh.visible) continue;
    if (checkPlayerCollision(player, c) && resolveGround(player, c, player.velocity.y)) {
      player.isGrounded = true;
      player.velocity.y = 0;

      if (c.kind === 'jumpPad') {
        player.velocity.y = player.jumpPower * 1.45;
      }

      if (c.kind === 'checkpoint' && c.stage > checkpointStage) {
        checkpointStage = c.stage;
        checkpointPos.copy(c.position).add(new THREE.Vector3(0, 3, 0));
        save = saveProgress({
          highestStage: Math.max(save.highestStage, checkpointStage),
          lastCheckpoint: checkpointStage,
        });
      }

      if (c.kind === 'goal') {
        running = false;
        const bestTime = save.bestTime === null ? timer : Math.min(save.bestTime, timer);
        saveProgress({ bestTime });
        ui.showWin(timer, deaths);
      }
    }
  }

  for (const h of world.hazards) {
    if (h.disabled) continue;
    if (checkPlayerCollision(player, h)) {
      killPlayer();
      break;
    }
  }

  if (player.position.y < -50) {
    killPlayer();
  }
}

function updateCamera(dt) {
  camYaw -= mouse.dx * sensitivity;
  camPitch = Math.max(0.1, Math.min(1.2, camPitch - mouse.dy * sensitivity));
  mouse.dx = 0;
  mouse.dy = 0;

  const radius = 13;
  const target = player.position.clone().add(new THREE.Vector3(0, 2.3, 0));
  const desired = new THREE.Vector3(
    target.x + Math.sin(camYaw) * Math.cos(camPitch) * radius,
    target.y + Math.sin(camPitch) * radius,
    target.z + Math.cos(camYaw) * Math.cos(camPitch) * radius
  );

  camera.position.lerp(desired, Math.min(1, dt * 7));
  camera.lookAt(target);
}

function bindEvents() {
  const keyMap = {
    KeyW: 'forward', KeyS: 'backward', KeyA: 'left', KeyD: 'right',
    Space: 'jump', ShiftLeft: 'sprint', ShiftRight: 'sprint',
  };

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && running) {
      paused = !paused;
      if (paused) ui.showPause();
      else ui.hidePause();
    }
    const key = keyMap[e.code];
    if (key) input[key] = true;
  });

  window.addEventListener('keyup', (e) => {
    const key = keyMap[e.code];
    if (key) input[key] = false;
  });

  canvas.addEventListener('mousedown', () => { mouse.down = true; });
  window.addEventListener('mouseup', () => { mouse.down = false; });
  window.addEventListener('mousemove', (e) => {
    if (!mouse.down) return;
    mouse.dx += e.movementX;
    mouse.dy += e.movementY;
  });

  window.addEventListener('wheel', (e) => {
    sensitivity = Math.max(0.0015, Math.min(0.008, sensitivity + e.deltaY * -0.000002));
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  ui.playBtn.addEventListener('click', () => {
    save = saveProgress({ selectedAvatar: ui.selectedAvatar });
    rebuildPlayer(ui.selectedAvatar);
    checkpointStage = save.lastCheckpoint || 1;
    deaths = save.totalDeaths || 0;
    timer = 0;
    spawnAtCheckpoint();
    running = true;
    paused = false;
    ui.showGame();
  });

  ui.resetSaveBtn.addEventListener('click', () => {
    save = resetSave();
    checkpointStage = 1;
    deaths = 0;
    timer = 0;
    ui.setAvatar('boy');
    rebuildPlayer('boy');
  });

  ui.resumeBtn.addEventListener('click', () => { paused = false; ui.hidePause(); });
  ui.restartBtn.addEventListener('click', () => { spawnAtCheckpoint(); timer = 0; });
  ui.backMenuBtn.addEventListener('click', () => { running = false; paused = false; ui.showMenu(); });
  ui.winMenuBtn.addEventListener('click', () => { ui.showMenu(); });
}

bindEvents();
ui.showMenu();

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(0.033, clock.getDelta());
  const elapsed = clock.elapsedTime;

  world.update(elapsed);

  if (running && !paused) {
    timer += dt;
    player.update(dt, input, camYaw);
    handleCollisions();
    setStageFromHeight();
    ui.updateHUD(currentStage, deaths, timer);
  }

  updateCamera(dt);
  renderer.render(scene, camera);
}
animate();
