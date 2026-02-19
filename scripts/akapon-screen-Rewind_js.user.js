// ==UserScript==
// @name         8｜アカポン（校正画面｜動画を◀▶で5秒早送｜巻き戻す※akapon-screen-Rewind_js.user.js
// @namespace    akapon
// @version      1.0
// @match        https://member.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-screen-Rewind_js.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-screen-Rewind_js.user.js
// ==/UserScript==

(() => {
  'use strict';

  const STYLE_ID = 'tm_rewind_buttons_css';
  const WRAP_ATTR = 'data-tm-rewind-wrap';
  const STEP_SEC = 5;

  function isTypingTarget(el) {
    if (!el) return false;
    const tag = (el.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function findVideo() {
    // 校正画面のHTMLに合わせて優先順で探す
    return (
      document.querySelector('#animation-player video.video-react-video') ||
      document.querySelector('video.video-react-video') ||
      document.querySelector('#animation-player video') ||
      document.querySelector('video')
    );
  }

  function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
  }

  function seekBy(video, deltaSec) {
    if (!video) return;
    // duration が取れないケースもあるのでガード
    const dur = Number.isFinite(video.duration) ? video.duration : null;
    const cur = Number.isFinite(video.currentTime) ? video.currentTime : 0;

    let next = cur + deltaSec;
    if (dur !== null) next = clamp(next, 0, Math.max(0, dur - 0.01));
    else next = Math.max(0, next);

    video.currentTime = next;
  }

  function injectCssOnce() {
    const css = `
/* ===== TM Rewind buttons (校正画面) ===== */
.tm-rewind-wrap{
  position: fixed !important;
  right: 14px !important;
  bottom: 14px !important;
  display: flex !important;
  gap: 10px !important;
  z-index: 2147483647 !important;
}

.tm-rewind-btn{
  appearance: none !important;
  border: none !important;
  outline: none !important;

  height: 38px !important;
  padding: 0 6px !important;
  border-radius: 0 !important;

  background: transparent !important;
  box-shadow: none !important;
  color: #fff !important;

  font-weight: 800 !important;
  font-size: 13px !important;
  line-height: 1 !important;

  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  cursor: pointer !important;
}

/* 押下時も枠っぽく見せない */
.tm-rewind-btn:active{
  transform: none !important;
}

.tm-rewind-btn .tm-arrow{
  font-size: 16px !important;
  margin-right: 6px !important;
}
.tm-rewind-btn.tm-forward .tm-arrow{
  margin-right: 0 !important;
  margin-left: 6px !important;
}
`;

    let s = document.getElementById(STYLE_ID);
    if (!s) {
      s = document.createElement('style');
      s.id = STYLE_ID;
      document.head.appendChild(s);
    }
    if (s.textContent !== css) s.textContent = css;
  }

  function ensureButtons(video) {
    if (!video) return;

    // ボタンは video の親（video-react のラッパ）に付ける
    const playerRoot =
      video.closest('.video-react') ||
      video.closest('#animation-player') ||
      video.parentElement;

    if (!playerRoot) return;

    // absolute の基準
    const st = window.getComputedStyle(playerRoot);
    if (st.position === 'static') {
      playerRoot.style.position = 'relative';
    }

    if (playerRoot.querySelector(`.${WRAP_ATTR.replace(/[\[\]]/g, '')}`)) {
      // 旧実装互換は不要。念のため何もしない
    }

    if (playerRoot.querySelector(`.tm-rewind-wrap`)) return;

    const wrap = document.createElement('div');
    wrap.className = 'tm-rewind-wrap';
    wrap.setAttribute(WRAP_ATTR, '1');

    const btnBack = document.createElement('button');
    btnBack.type = 'button';
    btnBack.className = 'tm-rewind-btn tm-back';
    btnBack.innerHTML = `<span class="tm-arrow">◀</span>${STEP_SEC}秒`;

    const btnForward = document.createElement('button');
    btnForward.type = 'button';
    btnForward.className = 'tm-rewind-btn tm-forward';
    btnForward.innerHTML = `${STEP_SEC}秒<span class="tm-arrow">▶</span>`;

    // クリックでシーク（クリックが他に伝播して不具合にならないよう止める）
    btnBack.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      seekBy(video, -STEP_SEC);
    });

    btnForward.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      seekBy(video, STEP_SEC);
    });

    wrap.appendChild(btnBack);
    wrap.appendChild(btnForward);
    playerRoot.appendChild(wrap);
  }

  function bindKeysOnce() {
    if (window.__tmRewindKeyBound) return;
    window.__tmRewindKeyBound = true;

    document.addEventListener(
      'keydown',
      (e) => {
        // 入力中は邪魔しない
        if (isTypingTarget(document.activeElement)) return;

        // 左右矢印のみ（他に影響しないよう最小）
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

        const video = findVideo();
        if (!video) return;

        e.preventDefault();
        e.stopPropagation();

        if (e.key === 'ArrowLeft') seekBy(video, -STEP_SEC);
        if (e.key === 'ArrowRight') seekBy(video, STEP_SEC);
      },
      true
    );
  }

  function init() {
    injectCssOnce();
    bindKeysOnce();

    const video = findVideo();
    if (video) ensureButtons(video);
  }

  // 初回
  init();

  // SPA/描画差し替えに追従（軽量）
  const mo = new MutationObserver(() => {
    const video = findVideo();
    if (video) {
      injectCssOnce();
      ensureButtons(video);
    }
  });

  mo.observe(document.body, { childList: true, subtree: true });

  console.log('[TM] Rewind/Forward 5s loaded:', location.href);
})();
