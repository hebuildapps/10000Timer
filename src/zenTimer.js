window.ZenTimer = {
  player: null,
  timerId: null,
  timeLeft: 0,
  isPlaying: false,

  startZen(theme, durationSeconds, autoPlay = true) {
    if (this.player) this.player.destroy();
    
    this.timeLeft = durationSeconds;
    this.isPlaying = autoPlay;

    const containerEl = document.getElementById('ascii-bg');
    this.player = new window.AsciiPlayer(theme, containerEl);
    
    if (this.isPlaying) {
      this.player.play();
    } else {
      if (this.player.frames.length > 0) {
        this.player.containerEl.innerHTML = '<pre>' + this.player.frames[0] + '</pre>';
      }
    }

    const themeSelection = document.getElementById('theme-selection');
    if (themeSelection) themeSelection.classList.add('hidden');
    
    const zenScreen = document.getElementById('zen-screen');
    if (zenScreen) zenScreen.classList.remove('hidden');

    this.updateDisplay();
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => this.tick(), 1000);
  },

  changeTheme(theme) {
    const wasPlaying = this.isPlaying;
    const currentLeft = this.timeLeft;
    this.startZen(theme, currentLeft, wasPlaying);
  },

  tick() {
    if (!this.isPlaying) return;
    
    if (this.timeLeft > 0) {
      this.timeLeft--;
      this.updateDisplay();
    } else {
      this.done();
    }
  },

  updateDisplay() {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const timerDisplay = document.getElementById('timer-display');
    
    if (this.isPlaying) {
      timerDisplay.innerHTML = display;
    } else {
      timerDisplay.innerHTML = `${display} <span style="font-size: 1.5rem; display:block; text-align:center; margin-top:-10px; color:#aaa; font-family: 'Inter', sans-serif; letter-spacing: normal; text-shadow: none;">(Paused)</span>`;
    }
  },

  togglePauseResume() {
    if (this.timeLeft <= 0) return;

    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.player.play();
    } else {
      this.player.pause();
    }
    this.updateDisplay();
  },

  done() {
    clearInterval(this.timerId);
    this.isPlaying = false;
    if (this.player) this.player.pause();
    document.getElementById('timer-display').innerText = "Done";
  },

  exitZen() {
    if (this.player) this.player.destroy();
    clearInterval(this.timerId);
    window.location.href = 'demo.html';
  }
};
