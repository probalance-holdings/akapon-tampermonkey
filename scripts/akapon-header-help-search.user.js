// ==UserScript==
// @name         22｜アカポン（管理画面｜検索）※akapon-header-help-search.user.js
// @namespace    akapon
// @version      2.1
// @match        https://member.createcloud.jp/*
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-header-help-search.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-header-help-search.user.js
// ==/UserScript==

(() => {
  'use strict';

  // =========================================================
  // 設定（検索modal系のみ）
  // =========================================================
  const MIN_PC_WIDTH = 1024;

  // WEB側（既存構築済み）
  const SEARCH_EMBED_URL = 'https://kanritools.com/system/help_search_embed.php';

  // DOM id
  const STYLE_ID   = 'akapon-help-embed-style';
  const BTN_ID     = 'akapon-help-btn';
  const OVERLAY_ID = 'akapon-help-overlay';

  const RIGHT_ID   = 'akapon-help-right';   // 検索（右）
  const RIGHT_IFR  = 'akapon-help-right-iframe';

  const LEFT_ID    = 'akapon-help-left';    // ページ（左）
  const LEFT_IFR   = 'akapon-help-left-iframe';

  const CLOSE_R_ID = 'akapon-help-close-right';
  const CLOSE_L_ID = 'akapon-help-close-left';

  // =========================================================
  // PC判定
  // =========================================================
  function isPc() {
    return window.matchMedia(`(min-width: ${MIN_PC_WIDTH}px)`).matches;
  }

  // =========================================================
  // CSS（検索modal系のみ）
  // =========================================================
  function buildCss() {
    return `
/* =========================================================
   アカポン（管理画面｜検索）
   - 検索UIは WEB側(kanritools)で管理
   - 管理画面側は iframe を右寄せ表示するだけ
   - 検索結果クリックで左側iframeを開く（postMessage）
   ========================================================= */

#${BTN_ID}{
  appearance: none !important;
  border: none !important;
  outline: none !important;

  /* 変更：少し大きくして視認性UP */
  width: 33px !important;
  height: 33px !important;
  border-radius: 999px !important;

  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  /* 変更：背景が赤/黒でも沈まない “黒グラデ＋外リング” */
  background: linear-gradient(180deg, #2b2b2b, #0f0f0f) !important;
  color: #ffffff !important;

  /* 追加：外側リング（赤背景でも黒背景でも見える） */
  box-shadow:
    0 10px 22px rgba(0,0,0,.28),
    0 0 0 2px rgba(255,255,255,.45),
    inset 0 1px 0 rgba(255,255,255,.18) !important;

  cursor: pointer !important;

  margin-left: 10px !important;
  margin-right: 12px !important;

  user-select: none !important;
  -webkit-tap-highlight-color: transparent !important;

  /* 変更：? をもっとハッキリ */
  font-weight: 900 !important;
  font-size: 22px !important;
  line-height: 1 !important;
  letter-spacing: -0.02em !important;

  /* 追加：文字が小さく見える現象の対策 */
  text-shadow: 0 1px 2px rgba(0,0,0,.55) !important;
}

#${BTN_ID}:hover{
  transform: translateY(-1px) !important;
  box-shadow:
    0 14px 30px rgba(0,0,0,.32),
    0 0 0 2px rgba(255,255,255,.55),
    inset 0 1px 0 rgba(255,255,255,.22) !important;
}

#${BTN_ID}:active{
  transform: translateY(0) !important;
  box-shadow:
    0 10px 22px rgba(0,0,0,.28),
    0 0 0 2px rgba(255,255,255,.40),
    inset 0 1px 0 rgba(255,255,255,.14) !important;
}

/* overlay */
#${OVERLAY_ID}{
  position: fixed !important;
  inset: 0 !important;
  background: rgba(0,0,0,.35) !important;
  z-index: 2147483645 !important;
  display: none !important;
}
#${OVERLAY_ID}.is-open{ display:block !important; }

/* 右：検索モーダル（右寄せ） */
#${RIGHT_ID}{
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  height: 100vh !important;
  width: min(560px, 92vw) !important;

  background: #fff !important;
  z-index: 2147483646 !important;

  transform: translateX(110%) !important;
  transition: transform .22s ease !important;

  box-shadow: -18px 0 44px rgba(0,0,0,.28) !important;

  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}
#${RIGHT_ID}.is-open{ transform: translateX(0) !important; }

#${RIGHT_ID} .akapon-help-header{
  position: sticky !important;
  top: 0 !important;
  z-index: 2 !important;

  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;
  color: #fff !important;

  padding: 14px 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;

  box-shadow: 0 10px 28px rgba(0,0,0,.28) !important;
}
#${RIGHT_ID} .akapon-help-title{
  font-weight: 800 !important;
  font-size: 14px !important;
  letter-spacing: .02em !important;
  margin: 0 !important;

  /* 追加：タイトル文字を少し右へ */
  padding-left: 6px !important;
}

#${CLOSE_R_ID}{
  appearance: none !important;
  border: none !important;
  outline: none !important;

  width: 34px !important;
  height: 34px !important;
  border-radius: 10px !important;

  background: rgba(255,255,255,.14) !important;
  color: #fff !important;

  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  font-weight: 900 !important;
  font-size: 18px !important;
  line-height: 1 !important;
}
#${CLOSE_R_ID}:hover{ background: rgba(255,255,255,.22) !important; }

#${RIGHT_IFR}{
  border: 0 !important;
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  background: #fff !important;
}

/* 左：ヘルプページiframe（検索の左側） */
#${LEFT_ID}{
  position: fixed !important;
  top: 0 !important;
  right: min(560px, 92vw) !important; /* 右の幅と揃える */
  height: 100vh !important;
  width: calc(100vw - min(560px, 92vw)) !important;

  background: #fff !important;
  z-index: 2147483646 !important;

  transform: translateX(110%) !important;
  transition: transform .22s ease !important;

  box-shadow: -18px 0 44px rgba(0,0,0,.28) !important;

  display: none !important; /* 初期は非表示 */
  flex-direction: column !important;
  overflow: hidden !important;
}
#${LEFT_ID}.is-open{
  display: flex !important;
  transform: translateX(0) !important;
}

#${LEFT_ID} .akapon-help-header{
  position: sticky !important;
  top: 0 !important;
  z-index: 2 !important;

  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;
  color: #fff !important;

  padding: 14px 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;

  box-shadow: 0 10px 28px rgba(0,0,0,.28) !important;
}
#${CLOSE_L_ID}{
  appearance: none !important;
  border: none !important;
  outline: none !important;

  width: 34px !important;
  height: 34px !important;
  border-radius: 10px !important;

  background: rgba(255,255,255,.14) !important;
  color: #fff !important;

  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  font-weight: 900 !important;
  font-size: 18px !important;
  line-height: 1 !important;
}
#${CLOSE_L_ID}:hover{ background: rgba(255,255,255,.22) !important; }

#${LEFT_IFR}{
  border: 0 !important;
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  background: #fff !important;
}

/* PC以外は表示しない（保険） */
@media (max-width: ${MIN_PC_WIDTH - 1}px){
  #${BTN_ID}, #${OVERLAY_ID}, #${RIGHT_ID}, #${LEFT_ID}{
    display: none !important;
  }
}
`;
  }

  function injectStyleOnce() {
    if (document.getElementById(STYLE_ID)) return;
    const parent = document.head || document.documentElement;
    if (!parent) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(buildCss()));
    parent.appendChild(style);
  }

  // =========================================================
  // UI 生成
  // =========================================================
  function ensureOverlay() {
    if (document.getElementById(OVERLAY_ID)) return;
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    document.documentElement.appendChild(overlay);
  }

  function ensureRightPanel() {
    if (document.getElementById(RIGHT_ID)) return;

    const wrap = document.createElement('div');
    wrap.id = RIGHT_ID;
    wrap.innerHTML = `
      <div class="akapon-help-header">
        <div class="akapon-help-title">ヘルプ検索</div>
        <button type="button" id="${CLOSE_R_ID}" aria-label="close">×</button>
      </div>
      <iframe id="${RIGHT_IFR}" src="${SEARCH_EMBED_URL}" referrerpolicy="no-referrer"></iframe>
    `;
    document.documentElement.appendChild(wrap);
  }

  function ensureLeftPanel() {
    if (document.getElementById(LEFT_ID)) return;

    const wrap = document.createElement('div');
    wrap.id = LEFT_ID;
    wrap.innerHTML = `
      <div class="akapon-help-header">
        <div class="akapon-help-title">ヘルプ</div>
        <button type="button" id="${CLOSE_L_ID}" aria-label="close">×</button>
      </div>
      <iframe id="${LEFT_IFR}" src="about:blank" referrerpolicy="no-referrer"></iframe>
    `;
    document.documentElement.appendChild(wrap);
  }

  // =========================================================
  // ヘッダーへ「？」ボタン（右上アイコン群＝ベル周辺を最優先）
  // =========================================================
  function findInsertPoint() {
    // ヘッダー領域のみを探索（左グローバルメニュー側へ行かないように）
    const headerRoot =
      document.querySelector('#navbar-common') ||
      document.querySelector('nav.navbar') ||
      document.querySelector('.navbar_outer') ||
      null;

    if (!headerRoot) return null;

    // 1) ベル（通知）周辺が取れれば「その左」に挿入（最優先）
    const bell = headerRoot.querySelector(
      '.fa-bell, .feather-bell, [class*="bell"], a[href*="notification"], img[src*="bell"]'
    );
    if (bell) {
      const wrap = bell.closest('a, li, div, span');
      if (wrap && wrap.parentElement) return { parent: wrap.parentElement, before: wrap };
    }

    // 2) 右寄せ nav グループ
    const rightGroup =
      headerRoot.querySelector('.navbar-nav.ml-auto') ||
      headerRoot.querySelector('.navbar-nav.navbar-right') ||
      null;

    if (rightGroup) return { parent: rightGroup, before: null };

    // 3) 最後の保険：ヘッダー内の navbar-nav
    const anyNav = headerRoot.querySelector('.navbar-nav');
    if (anyNav) return { parent: anyNav, before: null };

    return null;
  }

  function ensureHelpButton() {
    if (!isPc()) return;
    if (document.getElementById(BTN_ID)) return;

    const point = findInsertPoint();
    if (!point || !point.parent) return;

    const btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.type = 'button';
    btn.setAttribute('aria-label', 'help search');
    btn.textContent = '?';

    // ベルが取れたら必ず「ベルの左」。取れない場合は右側グループ末尾。
    if (point.before) point.parent.insertBefore(btn, point.before);
    else point.parent.appendChild(btn);
  }

  // =========================================================
  // 開閉
  // =========================================================
  function openRight() {
    if (!isPc()) return;
    const ov = document.getElementById(OVERLAY_ID);
    const r  = document.getElementById(RIGHT_ID);
    if (!ov || !r) return;
    ov.classList.add('is-open');
    r.classList.add('is-open');
  }

  function closeAll() {
    const ov = document.getElementById(OVERLAY_ID);
    const r  = document.getElementById(RIGHT_ID);
    const l  = document.getElementById(LEFT_ID);
    if (ov) ov.classList.remove('is-open');
    if (r)  r.classList.remove('is-open');
    if (l)  l.classList.remove('is-open');
  }

  function closeLeftOnly() {
    const l = document.getElementById(LEFT_ID);
    if (l) l.classList.remove('is-open');
  }

  function openLeftWithUrl(url) {
    if (!isPc()) return;

    const l = document.getElementById(LEFT_ID);
    const ifr = document.getElementById(LEFT_IFR);
    if (!l || !ifr) return;

    ifr.src = url;
    l.classList.add('is-open');
  }

  function isRightOpen() {
    const r = document.getElementById(RIGHT_ID);
    return !!r && r.classList.contains('is-open');
  }

  // =========================================================
  // イベント
  // =========================================================
  function bindEventsOnce() {
    if (window.__akaponHelpEmbedBound) return;
    window.__akaponHelpEmbedBound = true;

    document.addEventListener('click', (e) => {
      const t = e.target;
      if (!t || typeof t.closest !== 'function') return;
      if (!isPc()) return;

      // open
      if (t.closest(`#${BTN_ID}`)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        openRight();
        return;
      }

      // close right（右×＝全閉じ）
      if (t.closest(`#${CLOSE_R_ID}`)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        closeAll();
        return;
      }

      // close left only（左×＝左だけ閉じる）
      if (t.closest(`#${CLOSE_L_ID}`)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        closeLeftOnly();
        return;
      }

      // overlay click（外側クリック＝全閉じ）
      const ov = t.closest(`#${OVERLAY_ID}`);
      if (ov && ov.id === OVERLAY_ID) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        closeAll();
        return;
      }
    }, true);

    // ESC（右が開いていれば全閉じ）
    document.addEventListener('keydown', (e) => {
      if (!isPc()) return;
      if (e.key === 'Escape' && isRightOpen()) {
        e.preventDefault();
        closeAll();
      }
    }, true);

    // postMessage（WEB側 consult_modal.js → 親へ通知）
    window.addEventListener('message', (ev) => {
      if (!ev || !ev.data) return;
      if (!isPc()) return;

      const data = ev.data;
      if (data.type !== 'AKAPON_HELP_OPEN') return;
      if (!data.url) return;

      openLeftWithUrl(String(data.url));
    });
  }

  // =========================================================
  // 起動
  // =========================================================
  function tickInit() {
    if (!isPc()) return;

    injectStyleOnce();
    ensureOverlay();
    ensureRightPanel();
    ensureLeftPanel();
    ensureHelpButton();
    bindEventsOnce();
  }

  const mo = new MutationObserver(() => tickInit());
  mo.observe(document.documentElement, { childList: true, subtree: true });

  tickInit();
})();
