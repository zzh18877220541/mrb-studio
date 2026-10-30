(() => {
  'use strict';
  const player = document.getElementById('player');
  const camera = document.getElementById('camera');
  const quality = document.getElementById('quality');
  const status = document.getElementById('stream-status');
  const retry = document.getElementById('retry-video');
  let version = 0;
  let pending = null;
  let waiting = false;

  function bufferedAhead() {
    for (let i = 0; i < player.buffered.length; i++) {
      if (player.buffered.start(i) <= player.currentTime + .1 &&
          player.buffered.end(i) > player.currentTime) {
        return player.buffered.end(i) - player.currentTime;
      }
    }
    return 0;
  }

  function updateStatus() {
    if (player.error) {
      status.textContent = '视频加载失败，请重试。';
      retry.hidden = false;
      return;
    }
    retry.hidden = true;
    const ahead = bufferedAhead();
    const mode = quality.value === 'smooth' ? '流畅' : '原画';
    status.textContent = waiting && ahead < 1
      ? '正在缓冲…'
      : `${mode} · 已缓冲 ${Math.max(0, ahead).toFixed(1)} 秒`;
  }

  function changeSource() {
    const state = pending || {
      time: Number.isFinite(player.currentTime) ? player.currentTime : 0,
      playing: !player.paused && !player.ended,
    };
    pending = state;
    const token = ++version;
    player.pause();
    waiting = true;
    const name = camera.value.split('/').pop();
    const prefix = quality.value === 'smooth' ? 'smooth-' : 'play-';
    player.addEventListener('loadedmetadata', () => {
      if (token !== version) return;
      player.currentTime = Math.min(state.time, Math.max(0, player.duration - .05));
    }, { once: true });
    player.addEventListener('canplay', () => {
      if (token !== version) return;
      pending = null;
      waiting = false;
      updateStatus();
      if (state.playing) player.play().catch(() => {
        status.textContent = '已就绪，点击播放。';
      });
    }, { once: true });
    player.src = `video/${prefix}${name}`;
    player.load();
    updateStatus();
  }

  camera.addEventListener('change', changeSource);
  quality.addEventListener('change', changeSource);
  retry.addEventListener('click', changeSource);
  player.addEventListener('waiting', () => { waiting = true; updateStatus(); });
  player.addEventListener('playing', () => { waiting = false; updateStatus(); });
  for (const event of ['progress', 'timeupdate', 'loadeddata', 'canplay', 'error']) {
    player.addEventListener(event, updateStatus);
  }
})();
