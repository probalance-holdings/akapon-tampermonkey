// ==UserScript==
// @name         アカポン（swal2 modal 共通化ベース）※akapon-swal2-modal-common_base.user.js
// @namespace    akapon
// @version      20260221 1410
// @match        https://member.createcloud.jp/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-swal2-modal-common_base.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-swal2-modal-common_base.user.js
// ==/UserScript==

(() => {
  'use strict';

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
     ❸ popup 検知（1Observerのみ）
  ========================================================= */

  function processPopup(popup) {
    if (!popup || popup.dataset.tmSwalCommonApplied === '1') return;

    popup.dataset.tmSwalCommonApplied = '1';

    // プロジェクト削除
    if (popup.querySelector('.delete-project-modal')) {
      popup.classList.add('tm-swal-delete-project');
      return;
    }

    // ファイル削除
    if (popup.querySelector('.title-confirm-delete-akaire-file')) {
      convertFileDelete(popup);
      popup.classList.add('tm-swal-delete-project');
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
