// ==UserScript==
// @name         校正画面｜ヘッダー｜一時保管※screen-header-storage.user.js
// @namespace    akapon
// @version      20260227_1800
// @match        https://member.createcloud.jp/*
// @run-at       document-end
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/screen-header-storage.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/screen-header-storage.user.js
// ==/UserScript==

(() => {
  'use strict';

  const STYLE_ID = 'tm-screen-header-storage-style';

  // 一時保管ページかどうか（中央タイトルで判定）
  function isTempStorageHeaderPage() {
    const nav = document.getElementById('navbar-common');
    if (!nav) return false;

    // PCヘッダー中央のタイトル想定
    const titleEl = nav.querySelector('.title-page-list-temp-file');
    if (!titleEl) return false;

    const text = (titleEl.textContent || '').replace(/\s+/g, '');
    if (!text) return false;

    return (
      text.indexOf('一時保管フォルダー') !== -1 ||
      text.indexOf('一時保管フォルダ') !== -1
    );
  }

  // 見た目用CSS（既存HTMLの装飾だけ）
  function buildCss() {
    return `
/* =========================================================
   一時保管ページ専用ヘッダー装飾（PC）
   - ホーム／ファイル／中央タイトルの高さを揃える
   - 中央タイトルをバッジ風にして見やすく
   - 既存HTMLは変更しない
   ========================================================= */

html body[data-tm-storage-header="1"] #navbar-common .navbar-nav .nav-item > .custom-nav-link{
  display:inline-flex !important;
  align-items:center !important;
  height:32px !important;
}

/* 中央の「一時保管フォルダ」ラベル */
html body[data-tm-storage-header="1"] #navbar-common .title-page-list-temp-file{
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  height:32px !important;
  padding:0 24px !important;
  border-radius:18px !important;
  background:rgba(255,255,255,.14) !important;
  border:1px solid rgba(255,255,255,.85) !important;
  font-weight:700 !important;
  font-size:14px !important;
  letter-spacing:.08em !important;
  line-height:1.2 !important;
  color:#ffffff !important;
  white-space:nowrap !important;
}

/* 余計な位置ズレ防止（中央タイトルはその場で装飾のみ） */
html body[data-tm-storage-header="1"] #navbar-common .title-page-list-temp-file *{
  line-height:inherit !important;
}

/* =========================================================
   一時保管ページ：ファイルなしメッセージ
   - 少し下に下げる
   - SP / PC でフォントサイズ切り替え
   ========================================================= */

html body[data-tm-storage-header="1"] .container-file-box-no-data{
  margin-top: 60px !important;
  text-align: center !important;
}

/* SP（〜1024px） */
@media (max-width: 1024px){
  html body[data-tm-storage-header="1"] .container-file-box-no-data{
    font-size: 0.9em !important;
  }
}

/* PC（1025px〜） */
@media (min-width: 1025px){
  html body[data-tm-storage-header="1"] .container-file-box-no-data{
    font-size: 1.5em !important;
  }
}

/* =========================================================
   一時保管ページ：ナビ縦線（校正画面と同じスタイル）
   - tm-proof-sep-right が付いた li にだけ白点線を表示
   ========================================================= */
html body[data-tm-storage-header="1"] #navbar-common .tm-proof-sep-right{
  border-right: 1px dotted rgba(255, 255, 255, .55) !important;
  padding-right: 7px !important;
  margin-right: 7px !important;
}

/* =========================================================
   一時保管ページ：SP時の「現在のプラン」ボタン高さ調整
   ========================================================= */
@media (max-width: 1024px){
  html body[data-tm-storage-header="1"] #navbar-common .sp_navbar_header #plan-header-toggle-btn.btn-plan-sp{
    padding-top: 2px !important;
    padding-bottom: 2px !important;
    height: 30px !important;
    line-height: 1.2 !important;
  }
}
`.trim();
  }

  /* =========================================================
     一時保管ページ：ナビの縦線付与
     - ホーム / ファイル / 一時保管 に tm-proof-sep-right を付ける
     ========================================================= */
  function syncStorageHeaderSeparators() {
    if (!document.body || document.body.dataset.tmStorageHeader !== '1') return;

    const nav = document.getElementById('navbar-common');
    if (!nav) return;

    const ul = nav.querySelector('ul.navbar-nav');
    if (!ul) return;

    const homeLi =
      ul.querySelector('li.nav-item a.custom-nav-link[href="/projects"]')
        ?.closest('li.nav-item');

    const fileLi =
      ul.querySelector('#caseFile')
        ?.closest('li.nav-item');

    const tempLi =
      ul.querySelector('a.custom-nav-link[href*="akaires/list_temp_file"]')
        ?.closest('li.nav-item');

    [homeLi, fileLi, tempLi].forEach(li => {
      if (!li) return;
      if (!li.classList.contains('tm-proof-sep-right')) {
        li.classList.add('tm-proof-sep-right');
      }
    });
  }

  function applyOnce() {
    if (!isTempStorageHeaderPage()) return;
    if (!document.body) return;

    // 二重適用防止
    if (document.body.dataset.tmStorageHeader === '1') return;
    document.body.dataset.tmStorageHeader = '1';

    const nav = document.getElementById('navbar-common');
    if (!nav) return;

    // 中央タイトルのテキストだけ置換：「一時保管フォルダー」→「一時保管フォルダ」
    const titleEl = nav.querySelector('.title-page-list-temp-file');
    if (titleEl && titleEl.dataset.tmStorageTitleFixed !== '1') {
      const raw = (titleEl.textContent || '').trim();
      let fixed = raw.replace('一時保管フォルダー', '一時保管フォルダ');
      if (!fixed) fixed = '一時保管フォルダ';
      titleEl.textContent = fixed;
      titleEl.dataset.tmStorageTitleFixed = '1';
    }

    // CSSを1回だけ注入（HTMLは追加しない）
    if (!document.getElementById(STYLE_ID)) {
      const parent = document.head || document.documentElement;
      if (!parent) return;
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.type = 'text/css';
      style.appendChild(document.createTextNode(buildCss()));
      parent.appendChild(style);
    }

    // ナビの縦線（ホーム / ファイル / 一時保管）
    syncStorageHeaderSeparators();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyOnce);
  } else {
    applyOnce();
  }

})();
