const fs = require('fs');
const path = require('path');

class AsciiPlayer {
  constructor(theme, containerEl) {
    this.theme = theme;
    this.containerEl = containerEl;
    this.frames = [];
    this.currentFrame = 0;
    this.isPlaying = false;
    this.reqId = null;
    this.lastTime = 0;
    this.fps = 24;
    this.frameInterval = 1000 / this.fps;

    this.loadFrames();
    this.applyTheme();
  }

  loadFrames() {
    let baseDir = '';

    // Determine the true local app root regardless of how the script is loaded
    // If __dirname ends in /src or \src, go up one level. Otherwise, we are likely already at root.
    const isSrcDir = __dirname.endsWith('src') || __dirname.endsWith(path.sep + 'src');
    const localRoot = isSrcDir ? path.join(__dirname, '..') : __dirname;

    // User requested method with fallback for Electron 32+ where remote is removed
    try {
      const electronRemote = require('electron').remote || require('@electron/remote');
      const app = electronRemote.app;
      baseDir = app.isPackaged
        ? path.join(process.resourcesPath, 'assets', 'frames', this.theme)
        : path.join(localRoot, 'assets', 'frames', this.theme);
    } catch (e) {
      // Fallback for missing remote module
      if (typeof process !== 'undefined') {
        const isPackaged = __dirname.includes('app.asar') || (process.mainModule && process.mainModule.filename.includes('app.asar'));
        baseDir = isPackaged
          ? path.join(process.resourcesPath || path.join(localRoot, '..'), 'assets', 'frames', this.theme)
          : path.join(localRoot, 'assets', 'frames', this.theme);
      } else {
        this.containerEl.innerHTML = '<span style="color:red">Node process missing. Is nodeIntegration enabled?</span>';
        return;
      }
    }

    try {
      if (!fs.existsSync(baseDir)) {
        throw new Error(`Directory does not exist: ${baseDir}`);
      }

      const files = fs.readdirSync(baseDir)
        .filter(f => f.endsWith('.txt'))
        .sort();

      if (files.length === 0) {
        throw new Error('No .txt files found in ' + baseDir);
      }

      this.frames = files.map(f => fs.readFileSync(path.join(baseDir, f), 'utf8'));
    } catch (err) {
      console.error('Error loading ASCII frames:', err);
      this.containerEl.innerHTML = `<span style="color:red; display:flex; justify-content:center; align-items:center; height:100%; text-align:center;">Fallback: Error loading frames for theme <br> ${this.theme}.<br>${err.message}</span>`;
      this.frames = [];
    }
  }

  applyTheme() {
    let overlay = document.getElementById('ascii-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ascii-overlay';
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.pointerEvents = 'none';
      overlay.style.mixBlendMode = 'color-dodge';
      overlay.style.zIndex = '5';
      document.body.appendChild(overlay);
    }

    if (this.theme === 'fire') {
      overlay.style.background = 'radial-gradient(circle at center, rgba(255,120,0,0.8) 0%, rgba(10,10,10,1) 85%)';
    } else if (this.theme === 'rain') {
      overlay.style.background = 'radial-gradient(circle at center, rgba(80,120,200,0.6) 0%, rgba(10,10,10,1) 85%)';
    } else if (this.theme === 'ocean') {
      overlay.style.background = 'radial-gradient(circle at center, rgba(0,180,180,0.6) 0%, rgba(10,10,10,1) 85%)';
    }
  }

  play() {
    if (this.frames.length === 0) return;
    this.isPlaying = true;
    this.lastTime = performance.now();
    this.reqId = requestAnimationFrame(this.loop.bind(this));
  }

  pause() {
    this.isPlaying = false;
    if (this.reqId) {
      cancelAnimationFrame(this.reqId);
      this.reqId = null;
    }
  }

  destroy() {
    this.pause();
    this.containerEl.innerHTML = '';
    const overlay = document.getElementById('ascii-overlay');
    if (overlay) overlay.remove();
  }

  loop(time) {
    if (!this.isPlaying) return;

    this.reqId = requestAnimationFrame(this.loop.bind(this));

    const deltaTime = time - this.lastTime;
    if (deltaTime >= this.frameInterval) {
      this.lastTime = time - (deltaTime % this.frameInterval);

      this.containerEl.innerHTML = '<pre>' + this.frames[this.currentFrame] + '</pre>';
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    }
  }
}

window.AsciiPlayer = AsciiPlayer;
