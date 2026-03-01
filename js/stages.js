import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

const COLORS = [0x7bc8ff, 0xffcf7b, 0xb6ff7b, 0xff8ed6, 0xc6b3ff, 0x85f2df];

function createStage(i) {
  const y = i * 8;
  const difficulty = i / 110;
  const pattern = i % 8;
  const parts = [];

  parts.push({
    type: 'platform',
    kind: 'static',
    position: [0, y, 0],
    size: [8, 1, 8],
    color: COLORS[i % COLORS.length],
    stage: i,
  });

  if (pattern === 0) {
    parts.push({ type: 'platform', kind: 'moving', axis: 'x', range: 6 + difficulty * 4, speed: 1.2 + difficulty, position: [0, y + 2, -9], size: [4, 0.8, 4], color: 0xffffff, stage: i });
    parts.push({ type: 'platform', kind: 'static', position: [0, y + 4, -18], size: [7, 1, 7], color: 0xa8e2ff, stage: i + 1 });
  } else if (pattern === 1) {
    for (let n = 0; n < 4; n++) {
      parts.push({ type: 'platform', kind: 'beam', position: [-7 + n * 4.5, y + 2 + n * 1.3, -8 - n * 3], size: [1.2, 0.6, 6], color: 0xfff2a0, stage: i });
    }
    parts.push({ type: 'platform', kind: 'static', position: [7, y + 7.2, -20], size: [6, 1, 6], color: 0xafffd1, stage: i + 1 });
  } else if (pattern === 2) {
    parts.push({ type: 'platform', kind: 'rotating', speed: 0.8 + difficulty * 2.2, position: [0, y + 2.5, -10], size: [12, 0.7, 1.8], color: 0xd8d8ff, stage: i });
    parts.push({ type: 'platform', kind: 'jumpPad', position: [0, y + 2.2, -15], size: [3, 0.6, 3], color: 0x00ffbf, stage: i });
    parts.push({ type: 'platform', kind: 'static', position: [0, y + 8, -18], size: [6, 1, 6], color: 0x80ffe0, stage: i + 1 });
  } else if (pattern === 3) {
    for (let n = 0; n < 5; n++) {
      parts.push({ type: 'platform', kind: 'disappearing', period: 1.5 + n * 0.25, phase: n * 0.45, position: [-6 + n * 3, y + 2 + n * 1.1, -8 - n * 2.3], size: [2.2, 0.7, 2.2], color: 0xffc4ec, stage: i });
    }
    parts.push({ type: 'platform', kind: 'static', position: [8, y + 7.7, -20], size: [6, 1, 6], color: 0xb4f8ff, stage: i + 1 });
  } else if (pattern === 4) {
    parts.push({ type: 'hazard', kind: 'lava', position: [0, y + 1.2, -10], size: [14, 0.35, 14], color: 0xff3d35, stage: i });
    for (let n = 0; n < 3; n++) {
      parts.push({ type: 'platform', kind: 'moving', axis: n % 2 ? 'z' : 'x', range: 4 + n * 2, speed: 1.6 + difficulty, position: [-5 + n * 5, y + 2.8 + n * 1.4, -12 - n * 4], size: [3.2, 0.8, 3.2], color: 0xffffff, stage: i });
    }
    parts.push({ type: 'platform', kind: 'static', position: [0, y + 8, -24], size: [6, 1, 6], color: 0xffffaa, stage: i + 1 });
  } else if (pattern === 5) {
    parts.push({ type: 'obstacle', kind: 'spinner', speed: 1.2 + difficulty * 2, position: [0, y + 2.5, -10], size: [0.8, 0.8, 0.8], armLength: 6.5, color: 0xff7b7b, stage: i });
    parts.push({ type: 'platform', kind: 'beam', position: [0, y + 2.2, -10], size: [1.3, 0.5, 14], color: 0xe4e4ff, stage: i });
    parts.push({ type: 'platform', kind: 'static', position: [0, y + 6.2, -20], size: [7, 1, 7], color: 0xc5f7ff, stage: i + 1 });
  } else if (pattern === 6) {
    for (let n = 0; n < 6; n++) {
      parts.push({ type: 'platform', kind: 'beam', position: [Math.sin(n) * 6, y + 2 + n * 1.1, -8 - n * 2.8], size: [1, 0.6, 5.5], color: 0xfff0ad, stage: i });
    }
    parts.push({ type: 'platform', kind: 'jumpPad', position: [2, y + 8.5, -25], size: [2.4, 0.6, 2.4], color: 0x31ffc4, stage: i });
    parts.push({ type: 'platform', kind: 'static', position: [2, y + 12.5, -28], size: [6.5, 1, 6.5], color: 0xd4ffec, stage: i + 1 });
  } else {
    parts.push({ type: 'platform', kind: 'rotating', speed: 1.6 + difficulty * 2.2, position: [0, y + 2.8, -8], size: [8, 0.8, 1.4], color: 0xf6d0ff, stage: i });
    parts.push({ type: 'hazard', kind: 'lava', position: [0, y + 1.4, -16], size: [12, 0.4, 12], color: 0xff4a40, stage: i });
    parts.push({ type: 'platform', kind: 'disappearing', period: 1.4, phase: 0.3, position: [0, y + 3, -16], size: [2.2, 0.6, 2.2], color: 0xffffff, stage: i });
    parts.push({ type: 'platform', kind: 'disappearing', period: 1.8, phase: 0.8, position: [4, y + 4.4, -19], size: [2.2, 0.6, 2.2], color: 0xffffff, stage: i });
    parts.push({ type: 'platform', kind: 'disappearing', period: 2.1, phase: 1.2, position: [-4, y + 5.8, -22], size: [2.2, 0.6, 2.2], color: 0xffffff, stage: i });
    parts.push({ type: 'platform', kind: 'static', position: [0, y + 9, -26], size: [6, 1, 6], color: 0xbcfbff, stage: i + 1 });
  }

  if (i % 5 === 0) {
    parts.push({ type: 'checkpoint', kind: 'checkpoint', position: [0, y + 1.2, 2], size: [4, 0.4, 4], color: 0x00ff88, stage: i });
  }

  return parts;
}

export function generateStages(count = 110) {
  const all = [];
  for (let i = 1; i <= count; i++) {
    all.push(...createStage(i));
  }

  all.push({
    type: 'platform',
    kind: 'goal',
    position: [0, (count + 1) * 8 + 4, -26],
    size: [10, 1.2, 10],
    color: 0xfff67a,
    stage: count + 1,
  });

  return all;
}
