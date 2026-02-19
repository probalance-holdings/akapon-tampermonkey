// ==UserScript==
// @name         17｜アカポン（赤入れ共有URL　modal）※akapon-akaire-url-modal_css.user.js
// @namespace    akapon
// @version      0.0.2
// @description  share url modal customize (CSS/JS only)
// @author       akapon
// @match        https://member.createcloud.jp/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-akaire-url-modal_css.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-akaire-url-modal_css.user.js
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  // =========================================================
  // 対象URL
  // =========================================================
  function shouldApply() {
    const path = location.pathname || '';
    if (path.startsWith('/akaire_file/')) return true;
    if (path.startsWith('/akaire_feature/akaire_files/')) return true;
    return false;
  }

  // =========================================================
  // CSS（赤入れ共有URL modal 専用）
  // - 必ず .tm-share-url-modal（= modal-content につくクラス）配下に限定
  // =========================================================
function buildCssText() {
  return `
/* =========================================================
   TM: 赤入れ共有URL modal（PCベース / 全サイズ共通）
   - 影響範囲は tm-share-url-modal のみ
   ========================================================= */

.modal.show .modal-content.text-center.tm-share-url-modal{
  padding: 0 !important;
  margin: 0 auto !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 28px rgba(0,0,0,.28) !important;
  background: #fff !important;
  color: #000 !important;
}

/* ヘッダー（ネイビー帯：検索ボタンとトーン統一） */
.modal.show .modal-content.text-center.tm-share-url-modal .modal-header,
.modal.show .modal-content.text-center.tm-share-url-modal > .modal-header{
  display: block !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 10px 14px !important;
  font-weight: 900 !important;
  color: #fff !important;

  /* 検索ボタンと同系統：右側は暗めグレーで止める */
  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;

  border-radius: 12px 12px 0 0 !important;
}

/* 既存DOMが h5.modal-title の場合も左右いっぱい */
.modal.show .modal-content.text-center.tm-share-url-modal h5.modal-title{
  display: block !important;
  width: 100% !important;
  margin: 0 !important;
}

/* body */
.modal.show .modal-content.text-center.tm-share-url-modal .modal-body,
.modal.show .modal-content.text-center.tm-share-url-modal > .modal-body{
  padding: 14px !important;
  background: #fff !important;
  color: #000 !important;
}

/* 説明文（左寄せ） */
.modal.show .modal-content.text-center.tm-share-url-modal .text-left{
  text-align: left !important;
  font-size: 0.9em !important; /* PC/基本 */
  margin-top: 0px !important;
  margin-bottom: -5px;
}

/* （重要）グローバルspan禁止：このモーダル配下だけに限定 */
.modal.show .modal-content.text-center.tm-share-url-modal span{
  font-size: 0.9em; /* 基本（必要なら下のmediaで上書き） */
}

/* URL行（input + copy） */
.modal.show .modal-content.text-center.tm-share-url-modal .modal-body .d-flex.mt-3{
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  width: 100% !important;
  margin-top: 12px !important;
  flex-wrap: wrap !important;
}

/* input（URL/パスワード共通） */
.modal.show .modal-content.text-center.tm-share-url-modal input.form-control.input-share-video{
  /* ▼必要なら切替用（コメントアウトが効く状態） */
  /* flex: 1 1 270px !important; */
  /* flex: 1 1 200px !important; */

  flex: 1 1 270px !important; /* 現在の採用値 */
  width: auto !important;
  min-width: 0 !important;
  height: 40px !important;
  line-height: 40px !important;
  border-radius: 12px !important;
  border: 1px solid rgba(0,0,0,.10) !important;
  box-shadow: 0 6px 18px rgba(0,0,0,.18) !important;
  padding-left: 14px !important;
}

/* コピーbutton */
.modal.show .modal-content.text-center.tm-share-url-modal .btn-copy-link-akaire-file{
  flex: 0 0 auto !important;
  height: 40px !important;
  min-height: 40px !important;
  border-radius: 12px !important;
  border: 1px solid rgba(0,0,0,.12) !important;
  box-shadow: 0 6px 18px rgba(0,0,0,.18) !important;
}

/* パスワードブロック */
.modal.show .modal-content.text-center.tm-share-url-modal .mt-2.show-text-of-modal-share-akaire-file{
  width: min(760px, 100%) !important;
  margin: 12px auto 0 auto !important;
  padding: 0 !important;
  text-align: center !important;
}

/* パスワード行：ラベル左 / 右ブロック右寄せ（margin寄せ禁止） */
.modal.show .modal-content.text-center.tm-share-url-modal
.mt-2.show-text-of-modal-share-akaire-file
.show-content-on-off-share-password{
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  width: 100% !important;
}

.modal.show .modal-content.text-center.tm-share-url-modal
.show-content-on-off-share-password > span.mr-auto{
  margin-right: auto !important;
}

.modal.show .modal-content.text-center.tm-share-url-modal
.show-content-on-off-share-password > .d-flex.justify-content-end{
  margin: 0 !important;
  flex: 0 0 auto !important;
  width: auto !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 8px !important;
}

/* mr-2 / mx-2 の“詰まり”だけ整える（このmodalだけ） */
.modal.show .modal-content.text-center.tm-share-url-modal
.show-content-on-off-share-password .mr-2,
.modal.show .modal-content.text-center.tm-share-url-modal
.show-content-on-off-share-password .mx-2{
  margin-right: 4px !important;
}

/* custom-control-label のズレ補正（このモーダルだけ） */
.modal.show .modal-content.text-center.tm-share-url-modal .custom-control-label{
  margin-left: -12px !important;
}

/* ON時の入力＋保存（右に並べる／入らなければ折り返す） */
.modal.show .modal-content.text-center.tm-share-url-modal
.show-change-pass-share-akaire .d-flex{
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  width: 100% !important;
  flex-wrap: wrap !important;
}

.modal.show .modal-content.text-center.tm-share-url-modal
.show-change-pass-share-akaire .d-flex input.form-control.input-share-video{
  flex: 1 1 260px !important;
}

.modal.show .modal-content.text-center.tm-share-url-modal
.show-change-pass-share-akaire .btn-save-password-share{
  flex: 0 0 auto !important;
  white-space: nowrap !important;
}

/* 注意文（左寄せ・margin寄せ禁止） */
.modal.show .modal-content.text-center.tm-share-url-modal
.show-change-pass-share-akaire{
  text-align: left !important;
}

.modal.show .modal-content.text-center.tm-share-url-modal
.show-change-pass-share-akaire .font-size-10px{
  display: block !important;
  width: 100% !important;
  margin-top: 6px !important;
  margin-left: 0 !important;
}

/* ボタン共通（PCベース） */
.modal.show .modal-content.text-center.tm-share-url-modal .btn{
  font-weight: bold !important;
  box-shadow: 0 2px 8px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.08) !important;
  border-radius: 8px !important;
}

/* 閉じるボタンwrap */
.modal.show .modal-content.text-center.tm-share-url-modal .text-center.mt-3{
  margin-top: 10px !important;
}

/* =========================================================
   参考：既存SP帯の変数指定（コメントアウトが効く状態）
   ※このmodalに限定。必要になったら解除して使う。
   ========================================================= */
@media (max-width: 1024px) {
  .modal-show-share-link-akaire .modal-style .modal-content .modal-body .show-all-input-pass-share span {
    /* font-size: var(--sp-popup-font-size-text); */
  }
}
@media (max-width: 1024px) {
  .modal-show-share-link-akaire .modal-style .modal-content .modal-body .btn {
    /* background-color: var(--second-color) !important; */
    /* color: var(--primary-color) !important; */
  }
}

/* =========================================================
   iPad（SP以外・縦長含む）：文字を 1em に寄せる（769〜1024）
   ========================================================= */
@media (min-width: 769px) and (max-width: 1024px){
  .modal.show .modal-content.text-center.tm-share-url-modal .text-left{
    font-size: 1.0em !important;
  }
  .modal.show .modal-content.text-center.tm-share-url-modal span{
    font-size: 1.0em;
  }
  .modal.show .modal-content.text-center.tm-share-url-modal .font-size-10px{
    font-size: 1.0em;
  }
  .modal.show .modal-content.text-center.tm-share-url-modal
  .show-change-pass-share-akaire .font-size-10px{
    width: 115% !important;
  }
}

/* =========================================================
   SP：span は 0.8em（モーダル配下だけ）
   ========================================================= */
@media (max-width: 768px){
  .modal.show .modal-content.text-center.tm-share-url-modal span{
    font-size: 0.8em;
  }

  .modal.show .modal-content.text-center.tm-share-url-modal input.form-control.input-share-video{
    height: 36px !important;
    line-height: 36px !important;
  }
  .modal.show .modal-content.text-center.tm-share-url-modal .btn-copy-link-akaire-file{
    height: 36px !important;
    min-height: 36px !important;
  }
}

/* =========================================================
   PCのみ：input幅を 600px に固定（コメントアウトが効く状態）
   ========================================================= */
@media (min-width: 1025px){
  .modal.show .modal-content.text-center.tm-share-url-modal input.form-control.input-share-video{
    /* PCでは flex 指定を無効化（＝コメントアウト相当） */
    flex: 0 0 auto !important;
    width: 600px !important;
    max-width: 600px !important;
  }
}

/* =========================================================
   既存の “1024以下で黒背景/btn潰し” をこのmodalだけ無効化
   ========================================================= */
@media (max-width: 1024px){
  .modal.show .modal-content.text-center.tm-share-url-modal,
  .modal.show .modal-content.text-center.tm-share-url-modal .modal-body{
    background: #fff !important;
    color: #000 !important;
  }
  .modal.show .modal-content.text-center.tm-share-url-modal .modal-header{
    background: #1e3c72 !important;
    color: #fff !important;
  }
  .modal.show .modal-content.text-center.tm-share-url-modal .btn{
    height: auto !important;
    min-height: 32px !important;
    line-height: 32px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
}

/* =========================================================
   SP〜iPad縦長（1024以下）：btn-primary をPCと同じに固定
   他CSSに負けないよう、このmodal限定 + !important
   ========================================================= */
@media (max-width: 1024px){
  .modal.show .modal-content.text-center.tm-share-url-modal .btn-primary{
    color: var(--second-color) !important;
    background-color: var(--primary-color) !important;
  }

  .modal.show .modal-content.text-center.tm-share-url-modal
  .btn-primary.disabled,
  .modal.show .modal-content.text-center.tm-share-url-modal
  .btn-primary:disabled{
    border-color: #2567b7 !important;
  }
}

/* =========================================================
   1024×768付近（iPad横）でwrapが崩れる対策
   このmodalだけ nowrap に固定
   ========================================================= */
@media (min-width: 769px) and (max-width: 1024px){
  .modal.show .modal-content.text-center.tm-share-url-modal
  .show-change-pass-share-akaire .d-flex{
    flex-wrap: nowrap !important;
  }
}

/* =========================================================
   1024以下：既存SP帯の .modal-show-share-link-akaire ... .btn の
   色強制が残っている場合に、tm側で“無効化”してPC基準に戻す
   （このmodal限定）
   ========================================================= */
@media (max-width: 1024px){
  .modal-show-share-link-akaire .modal-style
  .modal.show .modal-content.text-center.tm-share-url-modal .btn{
    background-color: inherit !important;
    color: inherit !important;
  }
}

/* =========================================================
   全帯域：ON時の入力ブロックは wrap させない（PC基準）
   - iPad横(1024×768) / 1366×1024 でも崩れないよう採用
   ========================================================= */
.modal.show .modal-content.text-center.tm-share-url-modal
.show-change-pass-share-akaire .d-flex{
  flex-wrap: nowrap !important;
  margin-top: 7px;
}

/* =========================================================
   1024以下：既存の
   .modal-show-share-link-akaire .modal-style ... .btn { second/primary }
   を、このモーダル内だけ“必ず上書き”して無効化
   ========================================================= */
@media (max-width: 1024px){
  .modal-show-share-link-akaire .modal-style
  .modal.show .modal-content.text-center.tm-share-url-modal .modal-body .btn{
    /* PC基準（あなたのtm側デザイン）に固定 */
    background-color: transparent !important;
    color: inherit !important;

    /* あなたのtm側で付けてる見た目を維持（念のため） */
    box-shadow: 0 2px 8px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.08) !important;
    border-radius: 8px !important;
    font-weight: bold !important;
  }

  /* 保存ボタンなど btn-primary はPCと同じ配色に戻す */
  .modal-show-share-link-akaire .modal-style
  .modal.show .modal-content.text-center.tm-share-url-modal .modal-body .btn-primary{
    background-color: var(--primary-color) !important;
    color: var(--second-color) !important;
  }
}

/* =========================================================
   全サイズ：.btn-black を最強で primary/second に固定
   ※このモーダル内だけに限定（他画面へ影響させない）
   ========================================================= */
.modal.show .modal-content.text-center.tm-share-url-modal .btn-black,
.modal.show .modal-content.text-center.tm-share-url-modal button.btn-black,
.modal.show .modal-content.text-center.tm-share-url-modal a.btn-black{
  background-color: var(--primary-color) !important;
  color: var(--second-color) !important;
  }
}

@media (min-width: 768px) and (max-width: 820px){

  /* 親側で確実に落とす（inherit系にも勝つ） */
  .modal.show .modal-content.text-center.tm-share-url-modal{
    font-size: 0.9em !important;
  }

  /* 念のため：span も直叩き（既存の強セレクタ対策） */
  .modal.show .modal-content.text-center.tm-share-url-modal span,
  .modal.show .modal-content.text-center.tm-share-url-modal .modal-body span,
  .modal.show .modal-content.text-center.tm-share-url-modal .show-all-input-pass-share span,
  .modal.show .modal-content.text-center.tm-share-url-modal .show-change-pass-share-akaire span{
    font-size: 0.9em !important;
  }
}
/* =========================================================
   1024以下：既存の
   .modal-show-share-link-akaire .modal-style .modal-content .modal-body .show-all-input-pass-share span
   に“確実に勝つ”上書き（同鎖 + tmクラス追加 + !important）
   ========================================================= */
@media (max-width: 1024px){
  .modal-show-share-link-akaire .modal-style
  .modal-content.text-center.tm-share-url-modal
  .modal-body .show-all-input-pass-share span{
    font-size: inherit !important;
  }

  /* 念のため：modal-content が text-center じゃないパターンも拾う */
  .modal-show-share-link-akaire .modal-style
  .modal-content.tm-share-url-modal
  .modal-body .show-all-input-pass-share span{
    font-size: inherit !important;
  }
}

/* =========================================================
   TM: Copy通知（自前：中央ミニモーダル / 1秒 / backdropなし）
   - 既存の赤入れ共有URLモーダルは閉じない
   - 共通ルール：ヘッダー色＆シャドー
   ========================================================= */
.tm-copy-toast{
  position: fixed !important;
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) !important;
  z-index: 2147483647 !important;

  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 28px rgba(0,0,0,.28) !important;

  background: #fff !important;
  color: #000 !important;

  min-width: 280px !important;
  max-width: min(560px, calc(100vw - 24px)) !important;

  padding: 14px 18px !important;
  text-align: center !important;

  opacity: 0 !important;
  transition: opacity .12s ease !important;

  pointer-events: none !important; /* 下のモーダル操作を邪魔しない */
}

.tm-copy-toast.tm-show{
  opacity: 1 !important;
}

/* 上バー（共通ヘッダー色） */
.tm-copy-toast::before{
  content: "" !important;
  display: block !important;
  height: 6px !important;
  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;
  margin: -14px -18px 10px -18px !important;
}

.tm-copy-toast .tm-copy-toast-text{
  font-weight: 900 !important;
  font-size: 14px !important;
  letter-spacing: .02em !important;
  line-height: 1.4 !important;
}

/* =========================================================
   TM: 保存後（type=password + readonly）の入力だけ
   “600px固定”を無効化して、保存前と同じ伸び方に戻す
   対象DOM:
   .div-show-input-pass-share.demo-pass-share-akaire-file > input
   ========================================================= */

/* 全サイズ共通：まずは固定幅を殺して“伸びる”に戻す */
.modal.show .modal-content.text-center.tm-share-url-modal
.div-show-input-pass-share.demo-pass-share-akaire-file
> input.form-control.input-share-video[type="password"][readonly]{
  flex: 1 1 260px !important;
  width: auto !important;
  max-width: none !important;
  min-width: 0 !important;
}

/* PC帯(>=1025)で当たる “input 600px固定” を、この保存後inputだけ上書き */
@media (min-width: 1025px){
  .modal.show .modal-content.text-center.tm-share-url-modal
  .div-show-input-pass-share.demo-pass-share-akaire-file
  > input.form-control.input-share-video[type="password"][readonly]{
    flex: 1 1 260px !important;
    width: auto !important;
    max-width: none !important; /* ←600固定に絶対負けない */
  }
}


`.trim();
}

  // =========================================================
  // CSS注入（常に末尾へ移動して優先度確保）
  // =========================================================
function injectCssOnceAndKeepLast() {
  const STYLE_ID = 'tm-akapon-share-url-modal-css';
  let style = document.getElementById(STYLE_ID);

  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    (document.head || document.documentElement).appendChild(style);
  }

  const css = buildCssText();
  if (style.textContent !== css) style.textContent = css;

  // 常に末尾へ（ここはシンプルに“常時後勝ち”でOK）
  const parent = style.parentNode || (document.head || document.documentElement);
  if (parent && parent.lastChild !== style) parent.appendChild(style);
}

  // =========================================================
  // 赤入れ共有URLモーダル判定＆タグ付け
  // =========================================================
  function getOpenModalContentEl() {
    return document.querySelector('.modal.show .modal-content.text-center');
  }

  function isShareUrlModal(modalContentEl) {
    if (!modalContentEl) return false;

    // このモーダルだけが持つ要素で判定
    const hasUrlRow = !!modalContentEl.querySelector('.btn-copy-link-akaire-file');
    const hasPassword = !!modalContentEl.querySelector('.show-text-of-modal-share-akaire-file');
    return (hasUrlRow && hasPassword);
  }

  function tagShareUrlModal() {
    const modalContent = getOpenModalContentEl();
    if (!modalContent) return;

    if (!isShareUrlModal(modalContent)) return;

    if (!modalContent.classList.contains('tm-share-url-modal')) {
      modalContent.classList.add('tm-share-url-modal');
    }
  }

  // =========================================================
  // パスワードON時：入力ブロック＆閉じるボタン調整（最小）
  // =========================================================
function applyShareUrlAdjustments() {
  const modalContent = getOpenModalContentEl();
  if (!modalContent) return;
  if (!modalContent.classList.contains('tm-share-url-modal')) return;

  const isSp = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;

  // パスワードON/OFFで残る「持ち上げ」系があれば消す（全サイズ共通）
  const targets = modalContent.querySelectorAll(
    '.mt-2.show-text-of-modal-share-akaire-file .show-all-input-pass-share .show-change-pass-share-akaire'
  );

  targets.forEach((target) => {
    target.style.removeProperty('position');
    target.style.removeProperty('top');
    target.style.removeProperty('transform');
    target.style.removeProperty('will-change');
  });

  // SPのみ：指定説明文に <br> を追加（1回だけ）
  if (isSp) {
    const spans = modalContent.querySelectorAll('.modal-body span');
    for (let i = 0; i < spans.length; i++) {
      const el = spans[i];
      if (el.dataset.tmSpBr === '1') continue;

      const raw = (el.textContent || '').trim();
      if (!raw) continue;

      // 対象文言の一部一致で限定（誤爆防止）
      if (raw.indexOf('※下記URLを付与すると、会員以外でも') !== -1) {
        el.innerHTML = raw.replace('※下記URLを付与すると、', '※下記URLを付与すると、<br>');
        el.dataset.tmSpBr = '1';
        break;
      }
    }
  }

  // 「閉じる」ボタン：位置固定 + クリックが吸われる場合の保険だけ
  const closeWrap = modalContent.querySelector('.modal-body .text-center.mt-3');
  const closeBtn = closeWrap ? closeWrap.querySelector('button.btn.btn-black') : null;

  if (closeWrap) {
    closeWrap.style.setProperty('margin-top', '10px', 'important');
  }

  if (closeBtn && closeBtn.dataset.tmCloseBound !== '1') {
    closeBtn.dataset.tmCloseBound = '1';

    closeBtn.addEventListener('click', function (e) {
      try {
        if (typeof closeBtn.onclick === 'function') {
          closeBtn.onclick.call(closeBtn, e);
          return;
        }
      } catch (_) {}

      const modalEl = closeBtn.closest('.modal');
      if (modalEl && typeof window.$ === 'function') {
        try { window.$(modalEl).modal('hide'); return; } catch (_) {}
      }

      if (modalEl) {
        modalEl.classList.remove('show');
        modalEl.style.display = 'none';
      }
    }, true); // capture
  }
}

// =========================================================
// TM: Shared.copyText の「クリップボードにコピーしました。」だけ差し替え
// - popup.js を踏まない（= .modal-backdrop が出ない）
// - 中央ミニモーダルを1秒表示（backdropなし）
// - 赤入れ共有URLモーダルは閉じない
// =========================================================
// =========================================================
// TM: Shared.copyText / 保存系の通知を “中央ミニモーダル(1秒)” に統一
// - popup.js / swal2 を踏まない（= backdropが出にくい）
// - 下の赤入れ共有URLモーダルは閉じない
// =========================================================
function setupCopyToastOverride() {
  if (window.__tmCopyToastOverrideDone) return;
  window.__tmCopyToastOverrideDone = true;

  const MSG_COPY = 'クリップボードにコピーしました。';
  const MSG_SAVE = 'パスワードを保存しました。';
  const MSG_INVALID = '利用できないパスワードです';
  const MSG_RESET = 'パスワードがリセットされました';

  const OFF_CONFIRM_KEY = 'OFFにしてよろしいですか？';
  const OFF_CONFIRM_PREFIX = 'パスワード設定をOFFにすると';

  // OFF確認 → OK押下後の「誤：保存しました」を抑止するための窓
  let suppressSaveToastUntil = 0;

  // ---------------------------------------------------------
  // toast（1秒）
  // ---------------------------------------------------------
  const showToast = (text) => {
    try {
      const old = document.getElementById('tm-copy-toast');
      if (old) old.remove();

      const el = document.createElement('div');
      el.id = 'tm-copy-toast';
      el.className = 'tm-copy-toast';
      el.innerHTML = `<div class="tm-copy-toast-text">${text}</div>`;
      document.body.appendChild(el);

      requestAnimationFrame(() => el.classList.add('tm-show'));

      setTimeout(() => {
        el.classList.remove('tm-show');
        setTimeout(() => { try { el.remove(); } catch (_) {} }, 140);
      }, 1000);
    } catch (_) {}
  };

  // ---------------------------------------------------------
  // swal2 用の見た目（確認モーダルだけ）
  // ---------------------------------------------------------
  const ensureSwalStyle = () => {
    const STYLE_ID = 'tm-akapon-swal-style';
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
style.textContent = `
/* =========================================================
   TM: swal2（確認モーダル）共通デザイン（OFF確認だけ）
   - 画面中央固定（貼り付き防止）
   - ヘッダー：linear-gradient(90deg, #1e3c72, #2b2b2b)
   - 影：0 10px 28px rgba(0,0,0,.28)
   ========================================================= */

.swal2-container.tm-akapon-swal-confirm{
  position: fixed !important;
  inset: 0 !important;               /* top/right/bottom/left を0に */
  display: flex !important;          /* 中央寄せのため */
  align-items: center !important;
  justify-content: center !important;

  padding: 0 !important;
  margin: 0 !important;

  z-index: 20000 !important;
  overflow: hidden !important;       /* “上に貼り付く”系の挙動を潰す */
}

/* 既存の backdrop-show があっても暗幕は維持 */
.swal2-container.tm-akapon-swal-confirm.swal2-backdrop-show{
  background: rgba(0,0,0,.55) !important;
}

.swal2-container.tm-akapon-swal-confirm .swal2-popup.tm-akapon-swal-confirm{
  width: min(520px, calc(100vw - 16px)) !important;
  max-width: calc(100vw - 16px) !important;

  padding: 0 !important;
  border-radius: 12px !important;
  overflow: hidden !important;

  box-shadow: 0 10px 28px rgba(0,0,0,.28) !important;

  display: block !important;
  margin: 0 !important;
}

/* タイトル帯（ヘッダー扱い） */
.swal2-container.tm-akapon-swal-confirm .swal2-title{
  margin: 0 !important;
  padding: 12px 16px !important;

  color: #fff !important;
  font-weight: 900 !important;
  text-align: left !important;

  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;

  line-height: 1.5 !important;
  font-size: 15px !important;
}

/* ボタンエリア */
.swal2-container.tm-akapon-swal-confirm .swal2-actions{
  margin: 0 !important;
  padding: 12px 16px 14px 16px !important;

  background: #fff !important;

  justify-content: center !important;
  gap: 10px !important;
}

/* OK/キャンセル */
.swal2-container.tm-akapon-swal-confirm .swal2-confirm,
.swal2-container.tm-akapon-swal-confirm .swal2-cancel{
  border-radius: 8px !important;
  min-height: 34px !important;
  line-height: 34px !important;
  padding: 0 16px !important;

  box-shadow: 0 2px 8px rgba(0,0,0,.18) !important;
  font-weight: 900 !important;
}

.swal2-container.tm-akapon-swal-confirm .swal2-confirm{
  background: linear-gradient(90deg, #1e3c72, #555) !important;
  color: #fff !important;
  border: 1px solid rgba(0,0,0,.12) !important;
}

.swal2-container.tm-akapon-swal-confirm .swal2-cancel{
  background: #eee !important;
  color: #111 !important;
  border: 1px solid rgba(0,0,0,.10) !important;
}

@media (max-width: 820px){
  .swal2-container.tm-akapon-swal-confirm .swal2-title{
    font-size: 14px !important;
  }
}

/* =========================================================
   TM: new_alert_popup を “中央モーダル” に強制（最強）
   - 既存の bottom固定（SP用）に勝つ
   - まずはこれで「変わらない」を潰す
   ========================================================= */
body .swal2-container.swal2-center .swal2-popup.new_alert_popup{
  position: fixed !important;                 /* ← ここは fixed で確定 */
  left: 50% !important;
  top: 50% !important;
  right: auto !important;
  bottom: auto !important;
  transform: translate(-50%, -50%) !important;

  width: min(560px, calc(100vw - 40px)) !important;
  max-width: min(560px, calc(100vw - 40px)) !important;

  height: auto !important;                    /* 12vh固定はやめる（文言で崩れる） */
  min-height: 120px !important;               /* “それっぽい高さ”だけ担保 */
  padding: 0 !important;

  border-radius: 12px !important;
  overflow: hidden !important;
  background: #fff !important;
  box-shadow: 0 10px 28px rgba(0,0,0,.28) !important;

  z-index: 2147483647 !important;
}

/* ヘッダー風（titleが出ているタイプ用） */
body .swal2-container.swal2-center .swal2-popup.new_alert_popup .swal2-title{
  display: block !important;
  margin: 0 !important;
  padding: 12px 14px !important;
  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;
  color: #fff !important;
  font-weight: 900 !important;
  text-align: left !important;
  line-height: 1.35 !important;
}

/* 本文（html-container が出るタイプ用） */
body .swal2-container.swal2-center .swal2-popup.new_alert_popup .swal2-html-container{
  display: block !important;
  margin: 0 !important;
  padding: 16px 14px !important;
  color: #000 !important;
  text-align: center !important;
}

/* OKボタン（出るタイプだけ） */
body .swal2-container.swal2-center .swal2-popup.new_alert_popup .swal2-actions{
  margin: 0 !important;
  padding: 0 0 16px !important;
}
body .swal2-container.swal2-center .swal2-popup.new_alert_popup .swal2-confirm{
  min-height: 36px !important;
  border-radius: 10px !important;
  box-shadow: 0 8px 18px rgba(0,0,0,.28) !important;
}

`.trim();

    (document.head || document.documentElement).appendChild(style);
  };

  // ---------------------------------------------------------
  // swal2 を“消す”系（toast化する時のみ使う）
  // ---------------------------------------------------------
  const killSwalContainers = () => {
    try { document.querySelectorAll('.swal2-container').forEach((c) => c.remove()); } catch (_) {}
  };
  const killModalBackdrops = () => {
    try { document.querySelectorAll('.modal-backdrop').forEach((bd) => bd.remove()); } catch (_) {}
  };

  // ---------------------------------------------------------
  // copy（既存の Shared.copyText だけ置換）
  // ---------------------------------------------------------
  const copyText = async (text) => {
    if (!text) return false;

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return !!ok;
  };

  const copyFromArg = async (jqOrEl) => {
    if (jqOrEl && typeof jqOrEl.val === 'function') {
      const v = jqOrEl.val();
      if (typeof v === 'string') return await copyText(v);
    }

    const el = jqOrEl && (jqOrEl.jquery ? jqOrEl[0] : jqOrEl);
    if (el) {
      if (typeof el.value === 'string') return await copyText(el.value);
      const t = (el.textContent || '').trim();
      if (t) return await copyText(t);
    }
    return false;
  };

  const waitShared = () => {
    if (!window.Shared || typeof window.Shared.copyText !== 'function') {
      requestAnimationFrame(waitShared);
      return;
    }

    const original = window.Shared.copyText.bind(window.Shared);

    window.Shared.copyText = function (jqOrEl, message) {
      if (message === MSG_COPY) {
        copyFromArg(jqOrEl).catch(() => {});
        killSwalContainers();
        killModalBackdrops();
        showToast(MSG_COPY);
        return;
      }
      return original(jqOrEl, message);
    };
  };
  waitShared();

  // ---------------------------------------------------------
  // swal2 DOM 監視
  // ---------------------------------------------------------
  const root = document.body || document.documentElement;
  if (!root) return;

  ensureSwalStyle();

  const isOffConfirmTitle = (title) => {
    if (!title) return false;
    return (title.indexOf(OFF_CONFIRM_KEY) !== -1) || (title.indexOf(OFF_CONFIRM_PREFIX) !== -1);
  };

  const mo = new MutationObserver(() => {
    const container = document.querySelector('.swal2-container');
    if (!container) return;

    const popup = container.querySelector('.swal2-popup');
    if (!popup) return;

    const titleEl = popup.querySelector('#swal2-title');
    const htmlEl = popup.querySelector('#swal2-html-container');

    const title = (titleEl?.textContent || '').trim();
    const html = (htmlEl?.textContent || '').trim();

    // 1) OFF確認：見た目だけ付与（秒数なし / OKで既存reset）
    if (isOffConfirmTitle(title)) {
      container.classList.add('tm-akapon-swal-confirm');
      popup.classList.add('tm-akapon-swal-confirm');

      // OK押下 → 「保存しました」を拾わない時間窓を作り、代わりに「リセット」をtoast
      const okBtn = popup.querySelector('.swal2-confirm');
      if (okBtn && okBtn.dataset.tmBoundOffOk !== '1') {
        okBtn.dataset.tmBoundOffOk = '1';

        okBtn.addEventListener('click', () => {
          // 既存処理が走るタイミングを跨ぐため、2.5秒だけ抑止
          suppressSaveToastUntil = Date.now() + 2500;

          // 既存swalが閉じた後にtoast（被り防止で少し遅らせる）
          setTimeout(() => {
            showToast(MSG_RESET);
          }, 80);
        }, true);
      }

      return;
    }

    // 2) 「保存しました。」→ OFF直後の誤爆は抑止する
    if (html === MSG_SAVE) {
      if (Date.now() < suppressSaveToastUntil) {
        // このswalは“誤爆扱い”なので消すだけ
        killSwalContainers();
        killModalBackdrops();
        return;
      }

      killSwalContainers();
      killModalBackdrops();
      showToast(MSG_SAVE);
      return;
    }

    // 3) 「利用できない…」→ toast（1秒）
    if ((html && html.indexOf(MSG_INVALID) !== -1) || (title && title.indexOf(MSG_INVALID) !== -1)) {
      killSwalContainers();
      killModalBackdrops();
      showToast(MSG_INVALID);
      return;
    }
  });

  mo.observe(root, { childList: true, subtree: true });
}

  // =========================================================
  // 監視（開閉・ON/OFF切替で再適用）
  // =========================================================
  function setupObservers() {
    if (window.__tmShareUrlModalOnlyOnce) return;
    window.__tmShareUrlModalOnlyOnce = true;

    const run = () => {
      tagShareUrlModal();
      injectCssOnceAndKeepLast();
      applyShareUrlAdjustments();
    };

    run();

    const root = document.body || document.documentElement;
    const mo = new MutationObserver(run);
    mo.observe(root, { childList: true, subtree: true });
  }

function init() {
  setupCopyToastOverride();   // ← 追加（コピー通知）
  setupObservers();
}

  // document-start 対策：DOMが触れるまで待つ
  const tick = () => {
    if (!document.documentElement) return requestAnimationFrame(tick);
    init();
  };
  requestAnimationFrame(tick);

})();

