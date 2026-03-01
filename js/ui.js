export class UI {
  constructor() {
    this.menuOverlay = document.getElementById('menuOverlay');
    this.pauseOverlay = document.getElementById('pauseOverlay');
    this.winOverlay = document.getElementById('winOverlay');
    this.hud = document.getElementById('hud');

    this.playBtn = document.getElementById('playBtn');
    this.resetSaveBtn = document.getElementById('resetSaveBtn');
    this.resumeBtn = document.getElementById('resumeBtn');
    this.restartBtn = document.getElementById('restartBtn');
    this.backMenuBtn = document.getElementById('backMenuBtn');
    this.winMenuBtn = document.getElementById('winMenuBtn');

    this.hudStage = document.getElementById('hudStage');
    this.hudDeaths = document.getElementById('hudDeaths');
    this.hudTimer = document.getElementById('hudTimer');

    this.winTime = document.getElementById('winTime');
    this.winDeaths = document.getElementById('winDeaths');

    this.avatarButtons = [...document.querySelectorAll('.avatar-card')];
    this.selectedAvatar = 'boy';

    this.avatarButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedAvatar = btn.dataset.avatar;
        this.avatarButtons.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  }

  setAvatar(avatar) {
    this.selectedAvatar = avatar;
    this.avatarButtons.forEach((btn) => {
      btn.classList.toggle('selected', btn.dataset.avatar === avatar);
    });
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  updateHUD(stage, deaths, time) {
    this.hudStage.textContent = `${stage}`;
    this.hudDeaths.textContent = `${deaths}`;
    this.hudTimer.textContent = this.formatTime(time);
  }

  showMenu() {
    this.menuOverlay.classList.remove('hidden');
    this.hud.classList.add('hidden');
    this.pauseOverlay.classList.add('hidden');
    this.winOverlay.classList.add('hidden');
  }

  showGame() {
    this.menuOverlay.classList.add('hidden');
    this.hud.classList.remove('hidden');
    this.pauseOverlay.classList.add('hidden');
    this.winOverlay.classList.add('hidden');
  }

  showPause() { this.pauseOverlay.classList.remove('hidden'); }
  hidePause() { this.pauseOverlay.classList.add('hidden'); }

  showWin(time, deaths) {
    this.winTime.textContent = this.formatTime(time);
    this.winDeaths.textContent = `${deaths}`;
    this.winOverlay.classList.remove('hidden');
  }
}
