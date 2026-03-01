import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

const playerBox = new THREE.Box3();
const obstacleBox = new THREE.Box3();

export function buildAABB(position, halfExtents) {
  return new THREE.Box3(
    new THREE.Vector3(position.x - halfExtents.x, position.y - halfExtents.y, position.z - halfExtents.z),
    new THREE.Vector3(position.x + halfExtents.x, position.y + halfExtents.y, position.z + halfExtents.z)
  );
}

export function checkPlayerCollision(player, obstacle) {
  playerBox.setFromCenterAndSize(
    player.position,
    new THREE.Vector3(player.size.x, player.size.y, player.size.z)
  );

  obstacleBox.setFromCenterAndSize(
    obstacle.position,
    new THREE.Vector3(obstacle.size.x, obstacle.size.y, obstacle.size.z)
  );

  return playerBox.intersectsBox(obstacleBox);
}

export function resolveGround(player, obstacle, velocityY) {
  const playerBottom = player.position.y - player.size.y * 0.5;
  const obstacleTop = obstacle.position.y + obstacle.size.y * 0.5;
  const withinX = Math.abs(player.position.x - obstacle.position.x) <= (player.size.x + obstacle.size.x) * 0.5;
  const withinZ = Math.abs(player.position.z - obstacle.position.z) <= (player.size.z + obstacle.size.z) * 0.5;

  if (withinX && withinZ && velocityY <= 0 && playerBottom >= obstacleTop - 1.2 && playerBottom <= obstacleTop + 0.6) {
    player.position.y = obstacleTop + player.size.y * 0.5;
    return true;
  }
  return false;
}
