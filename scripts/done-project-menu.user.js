// ==UserScript==
// @name         済｜プロジェクト｜メニュー※done-project-menu.user.js
// @namespace    akapon
// @version      20260225 1800
// @match        https://member.createcloud.jp/*
// @match        https://membernew.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/done-project-menu.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/done-project-menu.user.js
// ==/UserScript==

(() => {
  'use strict';

  const STYLE_ID = 'tm_project_menu_css_v1';

  function buildCss() {
    return `
/* =========================================================
   TM: プロジェクトメニュー（3本線から開くモーダル）の見た目統一
   - outer_status_newstyle を持つメニュー行だけを対象
   ========================================================= */

/* タイトル行の下線を削除（プロジェクトメニューのみ） */
html body .modal-content.text-center h5.modal-title.title-menu-project{
  border-bottom: none !important;
  border-bottom-width: 0 !important;
  border-bottom-style: none !important;
}

/* メニュー行（クリック可能な .dropdown-item）をカード化 */
html body .modal-content.text-center .modal-body.outer_status_newstyle > .dropdown-item{
  width: min(760px, calc(100% - 72px)) !important;
  max-width: 760px !important;
  margin: 14px auto !important;

  padding: 14px 16px !important;

  border-radius: 16px !important;
  border: 1px solid #ffffff !important;

  background: rgba(255,255,255,0.04) !important;

  box-shadow:
    0 10px 24px rgba(0,0,0,0.45),
    0 0 0 1px rgba(255,255,255,0.06) !important;

  transition: transform .12s ease, box-shadow .12s ease !important;
}

/* 非クリック行（div.dropdown-item）は影を消す */
html body .modal-content.text-center .modal-body.outer_status_newstyle > div.dropdown-item{
  box-shadow: none !important;
}
`;
  }

  function injectCssOnce() {
    const css = buildCss();
    let s = document.getElementById(STYLE_ID);
    if (!s) {
      s = document.createElement('style');
      s.id = STYLE_ID;
      document.head.appendChild(s);
    }
    if (s.textContent !== css) s.textContent = css;
  }

  injectCssOnce();
})();
