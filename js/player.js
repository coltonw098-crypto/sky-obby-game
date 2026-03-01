import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

export class Player {
  constructor(scene, avatarType = 'boy') {
    this.scene = scene;
    this.avatarType = avatarType;
    this.group = new THREE.Group();
    this.group.castShadow = true;

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.position = this.group.position;
    this.size = new THREE.Vector3(1.4, 4.2, 1.2);

    this.isGrounded = false;
    this.baseSpeed = 7;
    this.sprintSpeed = 11;
    this.jumpPower = 13;
    this.gravity = -30;
    this.walkTime = 0;

    this.buildAvatar();
    scene.add(this.group);
  }

  buildAvatar() {
    const skin = new THREE.MeshStandardMaterial({ color: 0xf3c7a1 });
    const shirt = new THREE.MeshStandardMaterial({ color: this.avatarType === 'boy' ? 0x2d6cff : 0xff54c8 });
    const pants = new THREE.MeshStandardMaterial({ color: this.avatarType === 'boy' ? 0x1c1c28 : 0x2e3156 });
    const hair = new THREE.MeshStandardMaterial({ color: this.avatarType === 'boy' ? 0x5f3a21 : 0x2c2131 });

    const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), skin);
    head.position.y = 3.35;

    const hairHeight = this.avatarType === 'boy' ? 0.55 : 0.95;
    const hairMesh = new THREE.Mesh(new THREE.BoxGeometry(1.25, hairHeight, 1.25), hair);
    hairMesh.position.y = 3.95;

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.7, 0.9), shirt);
    torso.position.y = 2.15;

    this.leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.6, 0.45), shirt);
    this.rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.6, 0.45), shirt);
    this.leftArm.position.set(-0.95, 2.15, 0);
    this.rightArm.position.set(0.95, 2.15, 0);

    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.8, 0.5), pants);
    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.8, 0.5), pants);
    leftLeg.position.set(-0.35, 0.7, 0);
    rightLeg.position.set(0.35, 0.7, 0);

    [head, hairMesh, torso, this.leftArm, this.rightArm, leftLeg, rightLeg].forEach((mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.group.add(mesh);
    });
  }

  setSpawn(position) {
    this.position.copy(position);
    this.velocity.set(0, 0, 0);
  }

  update(delta, input, cameraYaw) {
    const speed = input.sprint ? this.sprintSpeed : this.baseSpeed;
    this.direction.set(0, 0, 0);
    if (input.forward) this.direction.z -= 1;
    if (input.backward) this.direction.z += 1;
    if (input.left) this.direction.x -= 1;
    if (input.right) this.direction.x += 1;

    if (this.direction.lengthSq() > 0) {
      this.direction.normalize();
      const rot = new THREE.Matrix4().makeRotationY(cameraYaw);
      this.direction.applyMatrix4(rot);
      this.position.x += this.direction.x * speed * delta;
      this.position.z += this.direction.z * speed * delta;
      this.group.rotation.y = Math.atan2(this.direction.x, this.direction.z);

      this.walkTime += delta * (input.sprint ? 11 : 8);
      const swing = Math.sin(this.walkTime) * 0.5;
      this.leftArm.rotation.x = swing;
      this.rightArm.rotation.x = -swing;
    } else {
      this.leftArm.rotation.x *= 0.75;
      this.rightArm.rotation.x *= 0.75;
    }

    if (input.jump && this.isGrounded) {
      this.velocity.y = this.jumpPower;
      this.isGrounded = false;
      this.leftArm.rotation.x = -0.9;
      this.rightArm.rotation.x = -0.9;
    }

    this.velocity.y += this.gravity * delta;
    this.position.y += this.velocity.y * delta;
  }
}
