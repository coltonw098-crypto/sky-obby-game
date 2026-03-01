import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';
import { generateStages } from './stages.js';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.hazards = [];
    this.jumpPads = [];
    this.checkpoints = [];
    this.goal = null;
    this.movers = [];
    this.rotators = [];
    this.disappearing = [];
    this.spinners = [];

    this.group = new THREE.Group();
    scene.add(this.group);

    this.buildEnvironment();
    this.buildStages();
  }

  buildEnvironment() {
    this.scene.background = new THREE.Color(0x7fcbff);
    this.scene.fog = new THREE.Fog(0x8fd2ff, 100, 1000);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(50, 120, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 500;
    sun.shadow.camera.left = -150;
    sun.shadow.camera.right = 150;
    sun.shadow.camera.top = 150;
    sun.shadow.camera.bottom = -150;
    this.scene.add(sun);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.82 });
    for (let i = 0; i < 65; i++) {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(4 + Math.random() * 9, 10, 8), cloudMat);
      cloud.position.set((Math.random() - 0.5) * 420, 8 + Math.random() * 900, (Math.random() - 0.5) * 420);
      cloud.scale.y = 0.5;
      cloud.receiveShadow = false;
      cloud.castShadow = false;
      this.group.add(cloud);
    }
  }

  createBlock(size, color) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      new THREE.MeshStandardMaterial({ color })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  buildStages() {
    const defs = generateStages(110);
    for (const def of defs) {
      if (def.kind === 'spinner') {
        const pivot = new THREE.Group();
        pivot.position.set(...def.position);

        const center = this.createBlock([1.2, 1.2, 1.2], def.color);
        const arm = this.createBlock([def.armLength, 0.4, 0.8], 0xff9b9b);
        arm.position.z = 0;
        pivot.add(center, arm);
        this.group.add(pivot);

        const collider = {
          mesh: arm,
          pivot,
          speed: def.speed,
          basePos: pivot.position.clone(),
          position: pivot.position,
          size: new THREE.Vector3(def.armLength, 0.5, 0.9),
          stage: def.stage,
          hazard: true,
        };
        this.spinners.push(collider);
        this.hazards.push(collider);
        continue;
      }

      const mesh = this.createBlock(def.size, def.color);
      mesh.position.set(...def.position);
      this.group.add(mesh);

      const item = {
        mesh,
        position: mesh.position,
        size: new THREE.Vector3(def.size[0], def.size[1], def.size[2]),
        stage: def.stage,
        kind: def.kind,
        base: mesh.position.clone(),
        axis: def.axis,
        speed: def.speed,
        range: def.range,
        period: def.period,
        phase: def.phase,
      };

      if (def.type === 'hazard') this.hazards.push(item);
      if (def.kind === 'jumpPad') this.jumpPads.push(item);
      if (def.kind === 'checkpoint') this.checkpoints.push(item);
      if (def.kind === 'goal') this.goal = item;
      if (def.kind === 'moving') this.movers.push(item);
      if (def.kind === 'rotating') this.rotators.push(item);
      if (def.kind === 'disappearing') this.disappearing.push(item);

      if (def.type === 'platform' || def.type === 'checkpoint' || def.kind === 'goal') {
        this.colliders.push(item);
      }
    }
  }

  update(elapsed) {
    for (const mover of this.movers) {
      const offset = Math.sin(elapsed * mover.speed) * mover.range;
      mover.position[mover.axis] = mover.base[mover.axis] + offset;
    }

    for (const rotator of this.rotators) {
      rotator.mesh.rotation.y += 0.01 * rotator.speed;
    }

    for (const fading of this.disappearing) {
      const active = Math.sin((elapsed + fading.phase) * fading.period) > -0.2;
      fading.mesh.visible = active;
      fading.disabled = !active;
    }

    for (const spinner of this.spinners) {
      spinner.pivot.rotation.y += 0.02 * spinner.speed;
      const dir = new THREE.Vector3(1, 0, 0).applyQuaternion(spinner.pivot.quaternion);
      spinner.position = spinner.pivot.position.clone().add(dir.multiplyScalar(spinner.size.x * 0.25));
    }
  }
}
