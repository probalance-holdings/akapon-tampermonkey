// ==UserScript==
// @name         19｜アカポン（管理画面｜ヘッダー）※akapon-header-search.user.js
// @namespace    akapon
// @version      1.0
// @match        https://member.createcloud.jp/*
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-header-search.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-header-search.user.js
// ==/UserScript==

(() => {
  'use strict';

  // =========================================================
  // 設定（ヘッダーCSSのみ）
  // =========================================================
  const MIN_PC_WIDTH = 1024;
  const STYLE_ID = 'akapon-header-style';

  // =========================================================
  // PC判定
  // =========================================================
  function isPc() {
    return window.matchMedia(`(min-width: ${MIN_PC_WIDTH}px)`).matches;
  }

  // =========================================================
  // CSS 注入（検索modal系は一切含めない）
  // =========================================================
  function buildCss() {
    return `
/* =========================================================
   アカポン（管理画面｜ヘッダー）
   - 検索modal系は含めない
   - ヘッダー上部メニュー（CRM / プロジェクト / オプション）の見た目だけ維持
   ========================================================= */

/* =========================================================
   ヘッダー上部メニュー（CRM / プロジェクト / オプション）
   - 白枠を角丸に
   - メニュー間を少し広げる
   - 他CSSに負けないよう強セレクタ + !important
   ========================================================= */

/* 親（ul.navbar-nav）に gap を付与（対応環境用） */
html body nav.navbar .navbar-nav{
  gap: 10px !important;
}

/* gap が効かない/消される環境の保険（li間の余白） */
html body nav.navbar .navbar-nav > li{
  margin-right: 10px !important;
}
html body nav.navbar .navbar-nav > li:last-child{
  margin-right: 0 !important;
}

/* 実DOMで確認できた: a.custom-nav-link が対象（プロジェクトだけ nav-border-white 付きでも同時に当たる） */
html body nav.navbar .navbar-nav a.custom-nav-link{
  border: 1px solid rgba(255,255,255,.80) !important;
  border-radius: 10px !important;

  padding: 6px 10px !important;

  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  white-space: nowrap !important;
  background: transparent !important;

  box-shadow: none !important;
  outline: none !important;
}

/* hover の見た目（薄くハイライト） */
html body nav.navbar .navbar-nav a.custom-nav-link:hover{
  background: rgba(255,255,255,.14) !important;
}

/* focus の見た目（キーボード操作用） */
html body nav.navbar .navbar-nav a.custom-nav-link:focus{
  box-shadow: 0 0 0 2px rgba(255,255,255,.25) !important;
}

/* =========================================================
   TM: ヘッダーメニュー（CRM / プロジェクト / オプション）
   目的：
   - ファイルページでは radius/shadow が消えるため、hover/active/open 時だけ復活させる
   - /projects で見えている見た目（radius 8px + shadow 0 4px 12px）に寄せる
   ========================================================= */

/* hover */
html body #navbar-common ul.navbar-nav a.custom-nav-link:hover{
  border-radius: 8px !important;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 4px 12px 0px !important;
  padding: 6px 15px !important;
  margin: 0 4px !important; /* 白同士がくっつかないように少し離す */
}

/* active（現在開いているページ側：プロジェクト等で nav-border-white が付く） */
html body #navbar-common ul.navbar-nav a.custom-nav-link.nav-border-white{
  border-radius: 8px !important;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 4px 12px 0px !important;
  padding: 6px 15px !important;
  margin: 0 4px !important;
}

/* dropdown open（CRM / オプション：開いた時） */
html body #navbar-common ul.navbar-nav li.show > a.custom-nav-link,
html body #navbar-common ul.navbar-nav a.custom-nav-link[aria-expanded="true"]{
  border-radius: 8px !important;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 4px 12px 0px !important;
  padding: 6px 15px !important;
  margin: 0 4px !important;
}

/* =========================================================
   追加：通知ベル（data-name="notificationDropbox"）だけ少し上へ
   - HTMLは触れず、CSSだけで位置を微調整
   ========================================================= */
html body a.drop_btn[data-name="notificationDropbox"]{
  transform: translateY(-2px) !important;
}

/* PC以外はこのスクリプト由来の効果を出さない（保険） */
@media (max-width: ${MIN_PC_WIDTH - 1}px){
  /* ヘッダーCSSはSPでも問題ない想定だが、元仕様に合わせてPC限定にする */
  html body nav.navbar .navbar-nav{
    gap: initial !important;
  }
}

`;
  }

  function injectStyleOnce() {
    if (!isPc()) return;
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
  // 起動（ヘッダーCSSのみ）
  // =========================================================
  function tickInit() {
    injectStyleOnce();
  }

  const mo = new MutationObserver(() => {
    tickInit();
  });

  mo.observe(document.documentElement, { childList: true, subtree: true });

  tickInit();
})();
