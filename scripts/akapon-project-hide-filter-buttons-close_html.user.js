// ==UserScript==
// @name         アカポン（プロジェクト｜ID～件数ボタンを非表示)※akapon-project-hide-filter-buttons-close_html.user.js
// @namespace    akapon
// @version      1.1
// @match        https://member.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-filter-buttons-close_html.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-filter-buttons-close_html.user.js
// ==/UserScript==

(() => {
  const STYLE_ID = 'tm_hide_filter_buttons_css';

  const css = `
/* =========================================================
   フィルターボタン非表示（メンバー / Status / 作成日 / ID / 表示件数 / File数）
   ※「全てのフィルタ（.filter-btn）」は残す
   ========================================================= */

/* created-by-filter（メンバー） */
td.td-filter-box .border-new[onclick*=".created-by-filter"]{
  display: none !important;
}

/* status-filter（Status） */
td.td-filter-box .border-new[onclick*=".status-filter"]{
  display: none !important;
}

/* created-at-filter（作成日） */
td.td-filter-box .border-new[onclick*=".created-at-filter"]{
  display: none !important;
}

/* kind-filter（ID） */
td.td-filter-box .border-new[onclick*=".kind-filter"]{
  display: none !important;
}

/* content-number-record（表示件数） */
td.td-filter-box .border-new[onclick*=".filter-content-number-record"]{
  display: none !important;
}

/* File数（例：File数：18） */
td.td-filter-box .border-new.d-flex.justify-content-space-between.align-items-center.mr-1{
  display: none !important;
}
`;

  function injectCssOnce() {
    let s = document.getElementById(STYLE_ID);
    if (!s) {
      s = document.createElement('style');
      s.id = STYLE_ID;
      document.head.appendChild(s);
    }
    if (s.textContent !== css) s.textContent = css;
  }

  // 初回
  injectCssOnce();

  // URL変化時だけ再注入（軽量）
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      injectCssOnce();
      console.log('[TM] hide filter buttons css reinjected:', lastHref);
    }
  }, 500);

  console.log('[TM] hide filter buttons loaded:', location.href);
})();
