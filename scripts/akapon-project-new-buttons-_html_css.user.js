// ==UserScript==
// @name         アカポン（プロジェクト｜最初のプロジェクト作成※akapon-project-new-buttons-_html_css.user.js
// @namespace    akapon
// @version      1.0
// @match        https://member.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const STYLE_ID = 'tm_project_first_create_btn_css';

  // 監視（軽量）：必要な時だけポーリングして、完了したら止める
  const RECHECK_MS = 500;
  const MAX_TRY = 120; // 500ms * 120 = 60秒で自動停止（無限に回さない）

  // 1回適用のフラグ
  const FLAG_BTN_DONE = 'data-tm-first-proj-btn-done';
  const FLAG_MODAL_DONE = 'data-tm-create-method-modal-done';
  const FLAG_NAME_MODAL_DONE = 'data-tm-create-name-modal-done';

  function injectCreateMethodModalCss() {
    return `
/* ===== TM: Create project method modal ===== */
.modal-content.bg-black{
  border-radius: 18px !important;
  box-shadow: 0 18px 50px rgba(0,0,0,.55) !important;
}

.modal-content.bg-black .modal-body{
  padding: 26px 18px 30px !important;
}

/* 見出し */
.modal-content.bg-black .header-modal{
  font-size: 16px !important;
  letter-spacing: .02em !important;
  margin: 0 0 16px !important;
}

/* リンク2つをボタン化 */
.modal-content.bg-black .align-center-div{
  text-align: center !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-top: 30px !important;
}

/* 先頭の「・」が残っても見えないように（念のため） */
.modal-content.bg-black .align-center-div{
  list-style: none !important;
}

.modal-content.bg-black .align-center-div a{
  display: block !important;
  width: min(340px, calc(100% - 32px)) !important;
  margin: 14px auto 0 !important;

  /* 白枠＋白背景、文字は黒 */
  background: #fff !important;
  border: 2px solid #fff !important;
  color: #000 !important;

  /* 文字を大きく、分かりやすく */
  font-size: 16px !important;
  font-weight: 900 !important;
  line-height: 1.15 !important;

  padding: 14px 16px !important;
  border-radius: 999px !important;

  text-decoration: none !important;
  box-shadow: 0 10px 26px rgba(0,0,0,.35) !important;

  transition: border-color .12s ease, transform .12s ease, box-shadow .12s ease !important;
}

/* サブ文言 */
.modal-content.bg-black .align-center-div a .tm-sub{
  display: block !important;
  margin-top: 6px !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  opacity: .9 !important;
}

/* ホバー：薄いグレー枠（文字は消えない） */
.modal-content.bg-black .align-center-div a:hover{
  border-color: #d9d9d9 !important;
  color: #000 !important;
}

/* 押下時も見やすく */
.modal-content.bg-black .align-center-div a:active{
  transform: translateY(1px) !important;
  box-shadow: 0 8px 20px rgba(0,0,0,.32) !important;
  color: #000 !important;
}

/* ===== TM: PCで既存 padding-left を確実に潰す（強制） ===== */
@media (min-width: 1024px) {
  html body #CreateProjectOptionsModal .align-center-div{
    padding-left: 0 !important;
    padding-inline-start: 0 !important;
  }
}

/* ===== TM: Create project name modal (input + back button) ===== */

/* 入力：文字を少し右に寄せる + 角丸18px */
html body .modal-content.bg-black input#projectName{
  padding-left: 14px !important;
  border-radius: 18px !important;
}

/* ヘッダー行：右上に戻るボタンを置くための基準 */
html body .modal-content.bg-black .modal-body{
  position: relative !important;
}

/* 既存フッターは使わない（邪魔なら隠す） */
html body .modal-content.bg-black .modal-footer{
  display: none !important;
}

/* 右上「戻る」ボタン（白枠・黒文字） */
html body .modal-content.bg-black a.tm-back-top{
  position: absolute !important;
  top: 18px !important;
  right: 18px !important;

  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  padding: 6px 12px !important;
  border-radius: 10px !important;

  border: 2px solid #ffffff !important;           /* 白枠を固定 */
  background: rgba(255,255,255,0.92) !important;  /* 薄白で“枠が見える”状態に */
  color: #000000 !important;                      /* 文字は黒 */
  text-decoration: none !important;

  font-weight: 900 !important;
  font-size: 14px !important;

  box-shadow: 0 8px 22px rgba(0,0,0,.35) !important;
  z-index: 2147483647 !important;

  transition: border-color .12s ease, transform .12s ease, background .12s ease !important;
}

/* 見やすさのため：hoverで枠を薄グレー＋背景も少し薄く */
html body .modal-content.bg-black a.tm-back-top:hover{
  border-color: #d9d9d9 !important;
  background: rgba(255,255,255,0.86) !important;
  transform: translateY(-1px) !important;
}

/* 画面が狭い時は少し詰める */
@media (max-width: 480px){
  html body .modal-content.bg-black a.tm-back-top{
    top: 14px !important;
    right: 14px !important;
    padding: 6px 10px !important;
    font-size: 13px !important;
  }
}

/* ===== メンバーmodal内のtitle文字の下の線を削除 ===== */
html body h5.invite-member-header{
  border: 0 !important;
  border-bottom: 0 !important;
  box-shadow: none !important;
  background-image: none !important;
}

/* 擬似要素が線を描いている場合 */
html body h5.invite-member-header::before,
html body h5.invite-member-header::after{
  content: none !important;
  display: none !important;
  border: 0 !important;
  box-shadow: none !important;
  background: none !important;
}

/* 「直後の要素」が線を持っている場合（よくある） */
html body h5.invite-member-header + *{
  border-top: 0 !important;
  border-bottom: 0 !important;
  box-shadow: none !important;
  background-image: none !important;
}
html body h5.invite-member-header + *::before,
html body h5.invite-member-header + *::after{
  content: none !important;
  display: none !important;
  border: 0 !important;
  box-shadow: none !important;
}

/* 親要素に線が付いているケースは、CSSだけでは特定が難しいため、JS側で確実に潰す */

/* ===== TM: invite member modal shadow override ===== */
html body .popup-invite-member{
  box-shadow: 0 -14px 28px rgba(0, 0, 0, 0.35),
              0 0 0 1px rgba(255, 255, 255, 0.06) !important;
}

/* ===== TM: project menu modal h5 border remove ===== */
html body .modal-content.text-center h5.modal-title.title-menu-project{
  border-bottom: none !important;
  border-bottom-width: 0 !important;
  border-bottom-style: none !important;
}

/* ===== メニューの表示 ===== */
html body .modal-content.text-center .modal-body.outer_status_newstyle > .dropdown-item{
  /* 横幅が広すぎる対策：最大幅を決めて中央寄せ */
  width: min(760px, calc(100% - 72px)) !important;
  max-width: 760px !important;
  margin: 14px auto !important;           /* 左右autoで中央寄せ */

  padding: 14px 16px !important;

  border-radius: 16px !important;
  border: 1px solid #ffffff !important;

  background: rgba(255,255,255,0.04) !important;

  box-shadow:
    0 10px 24px rgba(0,0,0,0.45),
    0 0 0 1px rgba(255,255,255,0.06) !important;

  transition: transform .12s ease, box-shadow .12s ease !important;
}

/* ===== TM: project menu modal / non-clickable row no shadow ===== */
html body .modal-content.text-center .modal-body.outer_status_newstyle > div.dropdown-item{
  box-shadow: none !important;
}

`;
}

  function injectCssOnce() {
    const css = `
/* ===== TM: First project create button ===== */
.show-when-no-projects button[onclick*="Project.openCreateProjectModal"]{
  /* もっと大きく（左右） */
  min-width: 360px !important;
  padding: 14px 34px !important;

  /* 文字は少しだけ大きく */
  font-size: 16px !important;
  line-height: 1.2 !important;

  /* もう少し下に移動 */
  margin-top: 22px !important;

  /* 枠をシャドー・角丸にする */
  border-radius: 25px !important;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28) !important;

  /* ホバー等で文字が消えないように文字色を固定 */
  color: #fff !important;

  cursor: pointer !important;

  transition: background-color .12s ease, filter .12s ease, box-shadow .12s ease !important;
}

/* ホバーしたら薄いグレーに */
.show-when-no-projects button[onclick*="Project.openCreateProjectModal"]:hover{
  color: #fff !important;
  background-color: #3a3a3a !important;
}

/* フォーカス/アクティブでも文字色が飛ばない保険 */
.show-when-no-projects button[onclick*="Project.openCreateProjectModal"]:focus,
.show-when-no-projects button[onclick*="Project.openCreateProjectModal"]:active{
  color: #fff !important;
}

/* スマホで横幅が溢れないように保険 */
@media (max-width: 480px){
  .show-when-no-projects button[onclick*="Project.openCreateProjectModal"]{
    min-width: 0 !important;
    width: calc(100% - 24px) !important;
    max-width: 420px !important;
    padding: 14px 18px !important;
  }
}
` + injectCreateMethodModalCss();

    let s = document.getElementById(STYLE_ID);
    if (!s) {
      s = document.createElement('style');
      s.id = STYLE_ID;
      document.head.appendChild(s);
    }
    if (s.textContent !== css) s.textContent = css;
  }

  function updateButtonTextOnce() {
    const btn = document.querySelector('.show-when-no-projects button[onclick*="Project.openCreateProjectModal"]');
    if (!btn) return false;
    if (btn.getAttribute(FLAG_BTN_DONE) === '1') return true;

    const newText = '最初のプロジェクトを作成する';
    if (btn.textContent.trim() !== newText) {
      btn.textContent = newText;
    }

    btn.setAttribute(FLAG_BTN_DONE, '1');
    return true;
  }

  function upgradeCreateMethodModalTextOnce() {
    const modal = document.querySelector('#CreateProjectOptionsModal .modal-content.bg-black');
    if (!modal) return false;
    if (modal.getAttribute(FLAG_MODAL_DONE) === '1') return true;

    // 見出し文言（添付に合わせる）
    const header = modal.querySelector('p.header-modal');
    if (header) header.textContent = 'プロジェクトの作成方法を選択してください';

    // 対象リンク
    const a1 = modal.querySelector('.align-center-div a[href="/akaire_feature/akaires"]');
    const a2 = modal.querySelector('.align-center-div a[onclick*="Project.createProjectWithoutFile"]');

    if (a1) {
      a1.innerHTML = `校正データをアップロードして作成<span class="tm-sub">（アップロード後にプロジェクトを自動で生成）</span>`;
    }
    if (a2) {
      a2.innerHTML = `プロジェクトのみ作成<span class="tm-sub">（データ作成は後にする）</span>`;
    }

    // 先頭の「・」を消す（テキストノードだけ削除）
    const box = modal.querySelector('.align-center-div');
    if (box) {
      [...box.childNodes].forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE && n.textContent.includes('・')) {
          n.textContent = n.textContent.replace(/・/g, '');
          if (!n.textContent.trim()) n.remove();
        }
      });
    }

    // 既存CSS（または inline）に負ける場合があるので、ここで確定上書き
    const pcBox = modal.querySelector('.align-center-div');
    if (pcBox) {
      pcBox.style.setProperty('padding-left', '0px', 'important');
      pcBox.style.setProperty('padding-inline-start', '0px', 'important');
    }

    modal.setAttribute(FLAG_MODAL_DONE, '1');
    return true;
  }

  // プロジェクト名入力モーダル：input + 戻るボタン
  function upgradeCreateNameModalOnce() {
    const modal = document.querySelector('#createProjectModal .modal-content.bg-black');
    if (!modal) return false;
    if (modal.getAttribute(FLAG_NAME_MODAL_DONE) === '1') return true;

    // inputの調整（CSSでやるが、念のため inlineでも確定）
    const input = modal.querySelector('input#projectName');
    if (input) {
      input.style.setProperty('padding-left', '14px', 'important'); // ❶ 少し右寄せ
      input.style.setProperty('border-radius', '18px', 'important'); // ❷ 角丸
    }

    // フッターの戻るを上部右側へ「戻る」ボタンとして追加
    // 既存 span は触らず、クリック時に同じ関数を呼ぶ新ボタンを追加
    if (!modal.querySelector('a.tm-back-top')) {
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'tm-back-top';
      a.textContent = '戻る';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          if (typeof Project !== 'undefined' && typeof Project.backToModalCreateProject === 'function') {
            Project.backToModalCreateProject();
          }
        } catch (_) {}
      });

      const body = modal.querySelector('.modal-body');
      if (body) body.appendChild(a);
    }

    modal.setAttribute(FLAG_NAME_MODAL_DONE, '1');
    return true;
  }

function tryApply() {
  // CSSは1回だけ
  if (!window.__tmFirstProjCssInjected) {
    injectCssOnce();
    window.__tmFirstProjCssInjected = true;
  }

  const doneBtn = updateButtonTextOnce();
  const doneMethodModal = upgradeCreateMethodModalTextOnce();
  const doneNameModal = upgradeCreateNameModalOnce();

// ===== invite-member-header の下線を “確実に” 消す（1回だけ / 影は消さない） =====
if (!window.__tmInviteHeaderBorderKilled) {
  const h = document.querySelector('h5.invite-member-header');
  if (h) {
    // h5本体：線だけ消す（box-shadowは触らない）
    h.style.setProperty('border-bottom', '0', 'important');
    h.style.setProperty('border-bottom-width', '0', 'important');
    h.style.setProperty('border-bottom-style', 'none', 'important');

    // 直後要素：線だけ消す（box-shadowは触らない）
    const next = h.nextElementSibling;
    if (next) {
      next.style.setProperty('border-top', '0', 'important');
      next.style.setProperty('border-top-width', '0', 'important');
      next.style.setProperty('border-top-style', 'none', 'important');
      next.style.setProperty('border-bottom', '0', 'important');
      next.style.setProperty('border-bottom-width', '0', 'important');
      next.style.setProperty('border-bottom-style', 'none', 'important');
    }

    // 親：border系だけ消す。modal-content まで来たら止める（シャドー保護）
    let p = h.parentElement;
    while (p) {
      if (p.classList && p.classList.contains('modal-content')) break;

      p.style.setProperty('border-bottom', '0', 'important');
      p.style.setProperty('border-bottom-width', '0', 'important');
      p.style.setProperty('border-bottom-style', 'none', 'important');
      p.style.setProperty('border-top', '0', 'important');
      p.style.setProperty('border-top-width', '0', 'important');
      p.style.setProperty('border-top-style', 'none', 'important');

      p = p.parentElement;
    }

    window.__tmInviteHeaderBorderKilled = true;
  }
}

  // すべて完了なら停止できる
  return { doneBtn, doneMethodModal, doneNameModal };
}

// ===== TM: 三本線アイコン hover で「メニュー」ツールチップ表示（モーダルは開かない） =====
if (!window.__tmMenuHoverTipBound) {
  window.__tmMenuHoverTipBound = true;

  const TIP_ID = 'tm-menu-hover-tip';
  const STYLE_ID_TIP = 'tm-menu-hover-tip-css';
  const HIDE_MS = 0; // ホバー中は表示し続け、離れたら消す

  // CSSは1回だけ
  if (!document.getElementById(STYLE_ID_TIP)) {
    const st = document.createElement('style');
    st.id = STYLE_ID_TIP;
    st.textContent = `
#${TIP_ID}{
  position: fixed;
  z-index: 2147483647;
  display: none;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(0,0,0,0.92);
  color: #fff;
  font-size: 13px;
  font-weight: 900;
  line-height: 1;
  box-shadow: 0 10px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08);
  pointer-events: none;
  white-space: nowrap;
}
`;
    document.head.appendChild(st);
  }

  function ensureTip() {
    let tip = document.getElementById(TIP_ID);
    if (!tip) {
      tip = document.createElement('div');
      tip.id = TIP_ID;
      document.body.appendChild(tip);
    }
    return tip;
  }

function showTipUnder(el, text) {
  const tip = ensureTip();
  tip.textContent = text;

  const rect = el.getBoundingClientRect();

  const top = rect.bottom + 8;
let left = rect.left + rect.width / 2;

/* 通知ベル（accept-notify）のツールチップだけ、少し右へ寄せる */
if (el && el.classList && el.classList.contains('accept-notify')) {
  left += 28; // ← 右へ移動量（必要なら 18/36 などに調整）
}

tip.style.top = `${Math.round(top)}px`;
tip.style.left = `${Math.round(left)}px`;
tip.style.transform = 'translateX(-50%)';
  tip.style.display = 'block';

  if (HIDE_MS > 0) {
    clearTimeout(window.__tmMenuTipHideTimer);
    window.__tmMenuTipHideTimer = setTimeout(() => {
      tip.style.display = 'none';
    }, HIDE_MS);
  }
}

  function hideTip() {
    const tip = document.getElementById(TIP_ID);
    if (!tip) return;
    tip.style.display = 'none';
    clearTimeout(window.__tmMenuTipHideTimer);
    window.__tmMenuTipHideTimer = null;
  }

  // 対象：あなたが貼った div（data-target="#modalMenu-6742"）の中のアイコン
document.addEventListener('mouseover', (e) => {
  const t = e.target;
  if (!t || typeof t.closest !== 'function') return;

  // ① メニュー（三本線）
  const menuWrap = t.closest('div.cursor-pointer[data-toggle="modal"][data-target^="#modalMenu-"]');
  if (menuWrap) {
    const img = menuWrap.querySelector('img.filter-black-icon.three-dot') || menuWrap.querySelector('img');
    showTipUnder(img || menuWrap, 'メニュー');
    return;
  }

  // ② プロジェクト名を変更（鉛筆アイコン）※全件対応・hover表示のみ
  const editNameImg = t.closest('img.edit-project-name-img');
  if (editNameImg) {
    showTipUnder(editNameImg, 'プロジェクト名を変更');
    return;
  }

  // ③ 通知ON｜OFF（ベルアイコン）
  const notifyImg = t.closest('img.accept-notify');
  if (notifyImg) {
    showTipUnder(notifyImg, '通知ON｜OFF');
    return;
  }

  // ④ ステータス変更（●）
  const statusDot = t.closest('span.project_status_point[data-toggle="modal"][data-target^="#modalSelectStatus-"]');
  if (statusDot) {
    showTipUnder(statusDot, 'ステータス変更');
    return;
  }

  // ⑤ チャット
  const chatBtn = t.closest('a.open-popup-chat.btn-chat');
  if (chatBtn) {
    showTipUnder(chatBtn, 'チャット');
    return;
  }

}, true);

/* 追加：対象から外れたら即消す */
document.addEventListener('mouseout', (e) => {
  const t = e.target;
  if (!t || typeof t.closest !== 'function') return;

  // “showTipUnder対象” に当たっていた場合だけ判定する
  const fromMenuWrap = t.closest('div.cursor-pointer[data-toggle="modal"][data-target^="#modalMenu-"]');
  const fromEditName = t.closest('img.edit-project-name-img');
  const fromNotify   = t.closest('img.accept-notify');
  const fromStatus   = t.closest('span.project_status_point[data-toggle="modal"][data-target^="#modalSelectStatus-"]');
  const fromChat     = t.closest('a.open-popup-chat.btn-chat');

  const fromAny = fromMenuWrap || fromEditName || fromNotify || fromStatus || fromChat;
  if (!fromAny) return;

  // どこへ移動したか（relatedTarget）が同じ対象の内側なら消さない
  const to = e.relatedTarget;
  if (to && typeof to.closest === 'function') {
    if (fromMenuWrap && to.closest('div.cursor-pointer[data-toggle="modal"][data-target^="#modalMenu-"]') === fromMenuWrap) return;
    if (fromEditName && to.closest('img.edit-project-name-img') === fromEditName) return;
    if (fromNotify   && to.closest('img.accept-notify') === fromNotify) return;
    if (fromStatus   && to.closest('span.project_status_point[data-toggle="modal"][data-target^="#modalSelectStatus-"]') === fromStatus) return;
    if (fromChat     && to.closest('a.open-popup-chat.btn-chat') === fromChat) return;
  }

  hideTip();
}, true);

document.addEventListener('mouseleave', (e) => {
  const t = e.target;
  if (!t || typeof t.closest !== 'function') return;

  if (
    t.closest('div.cursor-pointer[data-toggle="modal"][data-target^="#modalMenu-"]') ||
    t.closest('img.edit-project-name-img#edit-project-name-6742') ||
    t.closest('img.accept-notify') ||
    t.closest('span.project_status_point[data-toggle="modal"][data-target^="#modalSelectStatus-"]') ||
    t.closest('a.open-popup-chat.btn-chat')
  ) {
    hideTip();
  }
}, true);
}

  // 初回
  const r0 = tryApply();

  // どれか未完なら、一定間隔で軽くチェックして完了したら止める
  if (!(r0.doneBtn && r0.doneMethodModal && r0.doneNameModal)) {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;

      const r = tryApply();
      if (r.doneBtn && r.doneMethodModal && r.doneNameModal) {
        clearInterval(timer);
      } else if (tries >= MAX_TRY) {
        clearInterval(timer);
      }
    }, RECHECK_MS);
  }

  // ログは1回だけ
  if (!window.__tmFirstProjLogged) {
    window.__tmFirstProjLogged = true;
    console.log('[TM] First project create (light) loaded:', location.href);
  }
})();
