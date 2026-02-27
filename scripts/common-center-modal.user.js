// ==UserScript==
// @name         共通｜削除や確認系の画面中央modal※common-center-modal.user.js
// @namespace    akapon
// @version      20260227 1500
// @match        https://member.createcloud.jp/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-swal2-modal-common_base.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-swal2-modal-common_base.user.js
// ==/UserScript==

(() => {
  'use strict';

/* =========================================================

   ■ 未修正箇所
   - タスクページの　「タスクを削除する」modalのみ下記CSSが　padding: 15 0 16px !important;　にならない。
body .swal2-container.swal2-center .swal2-popup.new_alert_popup .swal2-actions {
    margin: 0 !important;
    padding: 0 0 16px !important;
}

   ■ 確認
   プロジェクト削除、タスク削除、ファイル削除、二段認証以外に、同類のmodalは無いか？

　 ■　改善点
　－　通知設定モーダル（*****の通知設定がOFFになりました。）は3秒で自動close
　－　プロジェクト　/　タスク　/　ファイル削除後のモーダル　「削除されました。」のみとしOKボタンは削除。3秒で自動close
　－　ステータス変更後のmodalボタンが「確認する」になっているので「変更する」に変更
========================================================= */

  if (window.__tmSwalCommonV3Booted) return;
  window.__tmSwalCommonV3Booted = true;

  const STYLE_ID = 'tm-swal2-common-style-v3';

  /* =========================================================
     ❶ CSS（土台＋削除専用）
     - プロジェクト削除 / ファイル削除 共通
     - tm-swal-delete-project が付いた popup のみ対象
  ========================================================= */

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);

    style.textContent = `

/* =========================================================
   TM: SweetAlert2（new_alert_popup）中央統一
   - 通知（文字だけ）：中央で3秒表示（JSで閉じる）
   - 確認（OKあり）：中央で固定（JSで閉じない）
   ========================================================= */
.swal2-container{
  align-items: center !important;
  justify-content: center !important;
}
.swal2-popup.new_alert_popup{
  position: relative !important;
  top: auto !important;
  left: auto !important;
  right: auto !important;
  bottom: auto !important;

  margin: 0 !important;

  border-radius: 14px !important;
  overflow: hidden !important;

  box-shadow: 0 10px 28px rgba(0,0,0,28) !important;
}
.swal2-popup.new_alert_popup .swal2-title{
  margin: 0 !important;
  padding: 12px 14px !important;
  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;
  color: #fff !important;
  font-weight: 900 !important;
  font-size: 14px !important;
}
.swal2-popup.new_alert_popup .swal2-html-container{
  margin: 0 !important;
  padding: 14px !important;
}
.swal2-popup.new_alert_popup .swal2-actions{
  margin: 0 !important;
  padding: 0 14px 14px 14px !important;
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
  min-height: 69px !important;
  padding: 0 !important;

  border: 1px solid #fff !important;
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
  padding: 5px 0 16px !important;
}
body .swal2-container.swal2-center .swal2-popup.new_alert_popup .swal2-confirm{
  display: inline-flex !important;
  align-items: center !important;      /* 縦中央寄せ */
  justify-content: center !important;  /* 横中央寄せ */
  padding: 6px 24px !important;        /* 横幅を少し広く＆上下に余白 */
  min-height: 36px !important;
  border-radius: 10px !important;
  box-shadow: 0 8px 18px rgba(0,0,0,.28) !important;
  padding-top: 9px !important;   /* 上に余白を増やして文字を少し下へ */
  padding-bottom: 5px !important;/* 下の余白は少なめに */
}

/* =========================================================
   TM: プラン制限モーダル（プランを変更する）専用
   - delete系の完成形には影響しない
   ========================================================= */
body .swal2-popup.tm-swal-plan-restrict .swal2-actions{
  gap: 10px !important;
}

body .swal2-popup.tm-swal-plan-restrict .swal2-confirm{
  font-size: clamp(12px,1.8vw,14px) !important;
  font-weight: 800 !important;
  min-width: 180px !important;
  height: 40px !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 24px rgba(0,0,0,.18) !important;
}

@media (max-width:480px){
  body .swal2-popup.tm-swal-plan-restrict .swal2-confirm{
    min-width: 160px !important;
    height: 38px !important;
  }
}

/* ここから削除モーダル専用（tm-swal-delete-project） */
body .swal2-popup.tm-swal-delete-project .swal2-title{
  margin: 0 0 -18px 0 !important;
}

body .swal2-popup.tm-swal-delete-project .delete-project-modal .modal-title{
  margin-top: 10px !important;
  margin-bottom: 0 !important;
}

body .swal2-popup.tm-swal-delete-project .delete-project-modal .modal-body{
  text-align: left !important;
}

body .swal2-popup.tm-swal-delete-project .delete-project-modal .modal-body p{
  margin-bottom: 0 !important;
  line-height: 1.5 !important;
  font-size: 0.8em !important;
  color: #fff !important;
}

@media (max-width:991px){
  body .swal2-popup.tm-swal-delete-project .delete-project-modal .modal-body p{
    font-size: 0.9em !important;
  }
}

body .swal2-popup.tm-swal-delete-project .swal2-actions{
  gap: 10px !important;
}

body .swal2-popup.tm-swal-delete-project .swal2-confirm,
body .swal2-popup.tm-swal-delete-project .swal2-cancel{
  font-size: clamp(12px,1.8vw,14px) !important;
  font-weight: 800 !important;
  min-width: 140px !important;
  height: 40px !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 24px rgba(0,0,0,.18) !important;
}

@media (max-width:480px){
  body .swal2-popup.tm-swal-delete-project .swal2-confirm,
  body .swal2-popup.tm-swal-delete-project .swal2-cancel{
    min-width:120px !important;
    height:38px !important;
  }
}

body .swal2-popup.tm-swal-delete-project .swal2-confirm{
  background:#fff !important;
  color:#e53935 !important;
  border:2px solid #e53935 !important;
}

body .swal2-popup.tm-swal-delete-project .swal2-confirm:hover{
  background:#e53935 !important;
  color:#fff !important;
}

body .swal2-popup.tm-swal-delete-project .swal2-cancel{
  background:#fff !important;
  color:#2b2b2b !important;
  border:2px solid rgba(43,43,43,.35) !important;
}

body .swal2-popup.tm-swal-delete-project .swal2-cancel:hover{
  background:#2b2b2b !important;
  color:#fff !important;
}

/* =========================================================
   TM: 二段階認証設定 modal 専用
   - tm-swal-setting-token が付いた popup のみ対象
   - 既存完成形には一切影響しない
========================================================= */

/* ================================
   PCのみ 700px 固定
================================ */
@media (min-width: 992px){

  body .swal2-container.swal2-center
  .swal2-popup.swal2-modal.new_alert_popup.tm-swal-delete-project,
  body .swal2-container.swal2-center
  .swal2-popup.swal2-modal.new_alert_popup.tm-swal-setting-token{
    width: 700px !important;
    max-width: 700px !important;
  }

}

body .swal2-popup.tm-swal-setting-token .swal2-title{
  margin: 0 0 10px 0 !important;
}

body .swal2-popup.tm-swal-setting-token .title{
  font-weight: 700 !important;
  font-size: 18px !important;
}

body .swal2-popup.tm-swal-setting-token .content{
  font-size: 14px !important;
  line-height: 1.6 !important;
  color: #fff !important;
}

body .swal2-popup.tm-swal-setting-token .swal2-confirm{
  min-width: 140px !important;
  height: 40px !important;
  border-radius: 12px !important;
}

/* =========================================================
   TM: 二段階認証設定 modal 調整（最強CSS）
   - popup-seting-token のみ対象
========================================================= */

/* ❶ swal2-html-container を最強で上書き */
body .swal2-container.swal2-center
.swal2-popup.new_alert_popup.popup-seting-token
.swal2-html-container{
  display: block !important;
  margin: 0 !important;
  padding: 7px 14px !important;
  color: #000 !important;
  text-align: center !important;
}

/* ❷ グリーン枠内（.content）の文字を小さく＆太字解除 */
body .swal2-container.swal2-center
.swal2-popup.new_alert_popup.popup-seting-token
.content{
  font-size: 14px !important;
  font-weight: 400 !important;
}

/* ❸ SP時さらに少し小さく */
@media (max-width:480px){
  body .swal2-container.swal2-center
  .swal2-popup.new_alert_popup.popup-seting-token
  .content{
    font-size: 13px !important;
  }
}

/* ❹ 設定ボタン文字を少し大きく */
body .swal2-container.swal2-center
.swal2-popup.new_alert_popup.popup-seting-token
.swal2-confirm{
  font-size: 16px !important;
}

/* =====================================
   SPのみ html-container padding 上書き（最強）
===================================== */
@media (max-width: 991px){

  body .swal2-container.swal2-center
  .swal2-popup.swal2-modal.new_alert_popup
  .swal2-html-container{
    padding: 7px 14px !important;
  }

  body .swal2-container.swal2-center
  .swal2-popup.tm-swal-delete-project
  .modal-body > p{
    font-size: 0.8em !important;
    font-weight: 400 !important; /* ノーマル */
  }

  body .swal2-container.swal2-center
  .swal2-popup.swal2-modal.new_alert_popup.tm-swal-setting-token
  .content{
    font-size: 0.8em !important;
  }

  body .swal2-container.swal2-center
  .swal2-popup.swal2-modal.new_alert_popup.tm-swal-setting-token
  .swal2-confirm{
    width: 37% !important;        /* 横幅いっぱい */
    height: 44px !important;       /* 高さ */
    font-size: 0.9em !important;   /* 文字サイズ */
  }

  body .swal2-container.swal2-center
  .swal2-popup.swal2-modal.new_alert_popup.tm-swal-delete-project
  .swal2-confirm,
  body .swal2-container.swal2-center
  .swal2-popup.swal2-modal.new_alert_popup.tm-swal-delete-project
  .swal2-cancel{
    height: 37px !important;      /* 枠高さ */
    font-size: 0.8em !important; /* 文字サイズ */
    min-width: unset !important;  /* 既存の140px解除 */
  }
}

/* 削除系モーダル（プロジェクト削除／ファイル削除）だけ 7px 14px にする */
body .swal2-container.swal2-center
  .swal2-popup.new_alert_popup.tm-swal-delete-project
  .swal2-html-container {
    padding: 7px 14px !important;
}

/* タスクページの削除モーダルだけ：ボタン上に 15px の余白を追加 */
html.tm-akapon-page-tasks
  body .swal2-container.swal2-center
  .swal2-popup.new_alert_popup.tm-swal-delete-project[data-tm-html-delete-converted="1"]
  .swal2-actions {
    margin: 0 !important;
    padding: 15px 0 16px !important;
}

body .swal2-container.swal2-center .swal2-popup.new_alert_popup .swal2-html-container {
    padding: 7px 14px !important;
}

body .swal2-container.swal2-center .swal2-popup.new_alert_popup .swal2-title {
    font-weight: 400 !important;
}

body .swal2-container.swal2-center .swal2-popup.new_alert_popup {
    width: min(650px, calc(100vw - 40px)) !important;
    max-width: min(650px, calc(100vw - 40px)) !important;
}

/* ==========================================
   パスワードOFF確認モーダル専用調整
   （new_alert_popup.tm-akapon-swal-confirm）
   - 文字とボタンをPC/SPともに少し小さく
========================================== */

/* タイトル文字を少し小さく＆行間も調整（PCベース） */
body .swal2-container.swal2-center
.swal2-popup.new_alert_popup.tm-akapon-swal-confirm
.swal2-title{
    font-size: 0.95em !important;
    line-height: 1.5 !important;
}

/* スマホ時はさらに小さく 0.8em に */
@media (max-width: 1023px){
  body .swal2-container.swal2-center
  .swal2-popup.new_alert_popup.tm-akapon-swal-confirm
  .swal2-title{
      font-size: 0.8em !important;
  }
}

/* OK/キャンセルボタンのサイズ・文字を一回り小さく */
body .swal2-container.swal2-center
.swal2-popup.new_alert_popup.tm-akapon-swal-confirm
.swal2-actions{
    padding: 6px 0 12px !important;
    gap: 6px !important;
}

body .swal2-container.swal2-center
.swal2-popup.new_alert_popup.tm-akapon-swal-confirm
.swal2-confirm,
body .swal2-container.swal2-center
.swal2-popup.new_alert_popup.tm-akapon-swal-confirm
.swal2-cancel{
    padding: 4px 18px !important;
    min-height: 30px !important;
    font-size: 0.85em !important;
    border-radius: 10px !important;
    box-shadow: 0 6px 14px rgba(0,0,0,.22) !important;
}

`;
  }
  /* =========================================================
     ❷ ファイル削除 → プロジェクト削除DOMへ変換
  ========================================================= */

  function convertFileDelete(popup) {
    if (popup.dataset.tmFileDeleteConverted === '1') return;

    const titleEl = popup.querySelector('.swal2-title');
    const spanTitle = popup.querySelector('.title-confirm-delete-akaire-file');
    if (!titleEl || !spanTitle) return;

    const rawHTML = titleEl.innerHTML;
    const titleText = spanTitle.textContent.trim();

    const bodyParts = rawHTML
      .replace(spanTitle.outerHTML, '')
      .split(/<br\s*\/?>/i)
      .map(t => t.replace(/<\/?[^>]+>/g, '').trim())
      .filter(Boolean);

    if (!bodyParts.length) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'delete-project-modal';

    const modalTitle = document.createElement('div');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = titleText;

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';

    bodyParts.forEach(text => {
      const p = document.createElement('p');
      p.textContent = text;
      modalBody.appendChild(p);
    });

    wrapper.appendChild(modalTitle);
    wrapper.appendChild(modalBody);

    titleEl.innerHTML = '';
    titleEl.appendChild(wrapper);

    popup.dataset.tmFileDeleteConverted = '1';
  }

  /* =========================================================
     ❷-2 swal2-html-container 型（titleが空）削除モーダル → 同一構造へ変換
     - 既存の完成形（delete-project-modal が元々ある）には触れない
     - ファイル削除（title-confirm-delete-akaire-file）がある場合も触れない
  ========================================================= */

  function convertHtmlContainerDelete(popup) {
    if (popup.dataset.tmHtmlDeleteConverted === '1') return;

    const titleEl = popup.querySelector('.swal2-title');
    const htmlEl  = popup.querySelector('.swal2-html-container');

    if (!titleEl || !htmlEl) return;

    // 既存の完成形 or ファイル削除は対象外（ここでは触らない）
    if (popup.querySelector('.delete-project-modal')) return;
    if (popup.querySelector('.title-confirm-delete-akaire-file')) return;

    // html-container の内容を「行」に分解（<br> / 改行どちらでも）
    const raw = (htmlEl.innerHTML || '').trim();
    if (!raw) return;

    const lines = raw
      .split(/<br\s*\/?>|\n|\r\n|\r/i)
      .map(s => s.replace(/<\/?[^>]+>/g, '').trim())
      .filter(Boolean);

    if (lines.length < 2) return;

    // 削除確認っぽい文言がないものは対象外（誤爆防止）
    const joined = lines.join(' ');
    const looksLikeDelete =
      joined.includes('を削除') ||
      joined.includes('削除してよろしい') ||
      joined.includes('復元') ||
      joined.includes('削除すると');

    if (!looksLikeDelete) return;

    const titleText = lines[0];

    // 本文候補（1行にまとめる部分）と「削除してよろしいですか？」を分離
    let bodyLines = lines.slice(1);
    let confirmLine = '';

    const idxConfirm = bodyLines.findIndex(t => t.includes('削除してよろしいですか？'));
    if (idxConfirm !== -1) {
      confirmLine = bodyLines[idxConfirm];
      bodyLines.splice(idxConfirm, 1);
    }

    // 本文は 1 行に結合（左寄せ）
    const bodyText = bodyLines.join('');

    const wrapper = document.createElement('div');
    wrapper.className = 'delete-project-modal';

    const modalTitle = document.createElement('div');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = titleText;

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';

    if (bodyText) {
      const pBody = document.createElement('p');
      pBody.textContent = bodyText;
      modalBody.appendChild(pBody);
    }

    if (confirmLine) {
      const pConfirm = document.createElement('p');
      pConfirm.textContent = confirmLine;
      pConfirm.style.textAlign = 'center';
      modalBody.appendChild(pConfirm);
    }

    wrapper.appendChild(modalTitle);
    wrapper.appendChild(modalBody);

    // title に移し、表示する
    titleEl.innerHTML = '';
    titleEl.appendChild(wrapper);
    titleEl.style.display = 'block';

    // html-container は不要なので DOM から削除
    if (htmlEl && htmlEl.parentNode) {
      htmlEl.parentNode.removeChild(htmlEl);
    }

    // ボタン文言・表示をプロジェクト削除と同じ形にそろえる
    const okBtn = popup.querySelector('.swal2-confirm');
    const cancelBtn = popup.querySelector('.swal2-cancel');

    if (okBtn) {
      okBtn.textContent = '削除する';
      okBtn.classList.remove('btn-primary');
      if (!okBtn.classList.contains('btn-danger')) {
        okBtn.classList.add('btn-danger');
      }
    }

    if (cancelBtn) {
      cancelBtn.textContent = 'キャンセル';
      cancelBtn.style.display = 'inline-block';
      if (!cancelBtn.classList.contains('btn-secondary')) {
        cancelBtn.classList.add('btn-secondary');
      }
    }

    popup.dataset.tmHtmlDeleteConverted = '1';
  }


  /* =========================================================
     ❸ popup 検知（1Observerのみ）
  ========================================================= */

  // 通知専用（文字だけ new_alert_popup）かどうか判定
  function isNotificationPopup(popup) {
    if (!popup || !popup.classList.contains('new_alert_popup')) return false;

    const actions = popup.querySelector('.swal2-actions');
    if (!actions) return true;

    // actions自体が非表示なら通知扱い
    const actionsStyle = window.getComputedStyle(actions);
    if (actionsStyle.display === 'none' || actionsStyle.visibility === 'hidden') {
      return true;
    }

    // actions 内に「表示されているボタン」が一つでもあれば通知ではない
    const hasVisibleButton = Array.from(actions.querySelectorAll('button')).some(btn => {
      const s = window.getComputedStyle(btn);
      return s.display !== 'none' && s.visibility !== 'hidden';
    });

    return !hasVisibleButton;
  }

// =========================================================
// 通知OFFモーダル専用：最強CSS上書き
// 他モーダルに影響しない
// =========================================================
(function(){

  const STYLE_ID = 'tm-notify-off-modal-override';

  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  document.head.appendChild(style);

  style.textContent = `

/* =====================================================
   ❶ OKボタン強制上書き（bg-primary完全撃破）
===================================================== */
body .modal-content.list-task-modal.tm-modal-theme-white
.tm-diff-project-notify-header
~ .modal-body .btn.bg-primary{

  background: linear-gradient(90deg,#1e3c72,#2b2b2b) !important;
  color: #fff !important;
  border: none !important;
  border-radius: 14px !important;
  padding: 8px 30px !important;
  box-shadow: 0 10px 24px rgba(0,0,0,.28) !important;
}


/* =====================================================
   ❷ 本文文字サイズを少し小さく
   （var(--pc-font-size-title) を上書き）
===================================================== */
body .modal-content.list-task-modal.tm-modal-theme-white
.warming-content{

  font-size: 0.9em !important;
  line-height: 1.3 !important;
  margin-top: -15px;
}


/* =====================================================
   ❸ 戻るボタン完全非表示（超最強）
===================================================== */
html body
.modal-content.list-task-modal.tm-modal-theme-white
.tm-file-modal-header.tm-diff-project-notify-header
a.tm-file-header-back-btn{

  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}


/* =====================================================
   ❹ modal枠シャドー強化
===================================================== */
body .modal-content.list-task-modal.tm-modal-theme-white{

  border-radius: 16px !important;
  box-shadow: 0 25px 60px rgba(0,0,0,.45) !important;
}

  `;

})();

  function processPopup(popup) {
    if (!popup || popup.dataset.tmSwalCommonApplied === '1') return;

    popup.dataset.tmSwalCommonApplied = '1';

    // ▼ 通知だけの new_alert_popup は 3秒後に自動クローズ
    if (isNotificationPopup(popup)) {
      setTimeout(() => {
        // まだDOM上にあり、かつ通知モーダルのままなら閉じる
        if (!document.body.contains(popup)) return;
        if (!isNotificationPopup(popup)) return;

        try {
          if (window.Swal && typeof window.Swal.close === 'function') {
            window.Swal.close();
          } else if (window.swal && typeof window.swal.close === 'function') {
            window.swal.close();
          } else {
            const container = popup.closest('.swal2-container');
            if (container && container.parentNode) {
              container.parentNode.removeChild(container);
            } else if (popup.parentNode) {
              popup.parentNode.removeChild(popup);
            }
          }
        } catch (e) {
          // 失敗してもアプリ側には影響させない
        }
      }, 3000);
    }

    // ▼ プロジェクトStatus変更モーダル専用：「確認する」→「変更する」
    const statusHtml = popup.querySelector('.swal2-html-container');
    if (statusHtml) {
      const text = (statusHtml.innerText || statusHtml.textContent || '').replace(/\s+/g, '');
      if (text.includes('プロジェクトのStatusを変更します。よろしいですか？')) {
        const confirmBtn = popup.querySelector('.swal2-confirm');
        if (confirmBtn) {
          confirmBtn.textContent = '変更する';
        }
      }
    }

    // プロジェクト削除（既に完成形）
    if (popup.querySelector('.delete-project-modal')) {
      popup.classList.add('tm-swal-delete-project');
      return;
    }

    // ファイル削除（title内に入っているタイプ）
    if (popup.querySelector('.title-confirm-delete-akaire-file')) {
      convertFileDelete(popup);
      popup.classList.add('tm-swal-delete-project');
      return;
    }

    // swal2-html-container に本文が入っている削除（titleが空のタイプ）
    convertHtmlContainerDelete(popup);
    if (popup.dataset.tmHtmlDeleteConverted === '1') {
      popup.classList.add('tm-swal-delete-project');
      return;
    }

    // 二段階認証設定
    if (popup.classList.contains('popup-seting-token')) {
      popup.classList.add('tm-swal-setting-token');
      return;
    }
  }

  function scan() {
    document.querySelectorAll('.swal2-popup').forEach(processPopup);
  }

  function boot() {
    ensureStyle();
    scan();

    const mo = new MutationObserver(scan);
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  boot();

})();
