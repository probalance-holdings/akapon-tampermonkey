// ==UserScript==
// @name         済｜校正画面｜ヘッダー｜アップロードページ※done-screen-header-upload.user.js
// @namespace    akapon
// @version      20260227_1930
// @match        https://member.createcloud.jp/*
// @match        https://membernew.createcloud.jp/*
// @run-at       document-end
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/done-screen-header-upload.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/done-screen-header-upload.user.js
// ==/UserScript==

(() => {
  'use strict';

/* =========================================================

現在、Tampermonkey 側で
「ファイル」クリック後に表示される dropdown
(.dropdown-menu.drop-down-akaire-file)
の見た目および文言を制御しようとしていますが、

・DOM生成タイミングが遅延している
・クリック時に動的生成される
・一部再描画が発生する
・既存CSSの優先度が高い

等の理由により、クライアント側後付け制御では
安定して反映させることが困難な状態です。

そのため、下記はシステム側（サーバー側テンプレート）での
直接実装をお願いいたします。

------------------------------------------------------------
■ 対象箇所
ヘッダー「ファイル」クリック時に表示される dropdown
<div class="dropdown-menu drop-down-akaire-file">

------------------------------------------------------------
■ 実装内容　⇒　校正画面｜ヘッダー※screen-header.user.js　に追記済み

① 「最近更新したファイル」文言を
   【最近更新したファイル】 に変更

② そのテキストに下記CSSを適用
   font-size: 1.0em;
   font-weight: 700;
   text-align: left;

③ dropdown に下記スタイルを追加
   box-shadow: 0 10px 24px rgba(0,0,0,0.45);
   border-radius: 12px;
   border: none;

④ dropdown 先頭に下記ボタンを追加

<a class="btn py-0 border bg-akapon text-white text-center font-weight-bold cursor-pointer border-btn-create-new-file"
   style="width: 100%; padding: 7px 10px; margin-top: 5px;"
   href="/akaire_file/6782/project_akaire_files">
  <span class="mx-3 my-1">ファイル一覧へ</span>
</a>

⑤ 各アイコンサイズ統一

upload_image        → 30px × 20px
upload_youtube      → 30px × 22px
video_akaire        → /packs/media/images/upload_video-07d617bd.png
                      30px × 28px
icon-www            → 30px × 21px

⑥ サムネイル画像サイズ固定
.case-file .description-file .img-file img.description_icon {
  width: 80px;
  height: 50px;
}

------------------------------------------------------------

※ ファイル情報（最大10件）は動的に変動します。
  個別ID依存ではなく class ベースで実装してください。

※ 本修正は校正画面ヘッダー配下のみ対象としてください。
  他ページへ影響が出ないようスコープ制御をお願いします。

------------------------------------------------------------

Tampermonkey側では今後この領域は制御しません。
システム側での恒久対応をお願いいたします。
========================================================= */

  const STYLE_ID = 'tm-screen-header-upload-style';

  // 校正アップロード（新規ファイル作成）ページ判定（DOMで判定）
  function isUploadHeaderPage() {
    const nav = document.getElementById('navbar-common');
    if (!nav) return false;

    // 一時保管ページ等の別ページを誤爆しないための除外
    if (nav.querySelector('.title-page-list-temp-file')) return false;

    // SPヘッダー中央タイトル
    const spTitle = nav.querySelector('.content-header-sp .text-white');
    const spText = (spTitle?.textContent || '').replace(/\s+/g, '');
    if (spText.indexOf('新規ファイル作成') !== -1) return true;

    return false;
  }

  function buildCss() {
    return `
/* =========================================================
   校正アップロード（新規ファイル作成）ページ専用ヘッダー装飾
   - 既存HTMLは変更しない（DOMは最小限の差し替えのみ）
   ========================================================= */

html body[data-tm-proof-upload-header="1"] #navbar-common .navbar-nav .nav-item > .custom-nav-link{
  display:inline-flex !important;
  align-items:center !important;
  height:32px !important;
}

/* ナビ縦線（白点線）：tm-proof-sep-right が付いた li だけ */
html body[data-tm-proof-upload-header="1"] #navbar-common .tm-proof-sep-right{
  border-right: 1px dotted rgba(255, 255, 255, .55) !important;
  padding-right: 7px !important;
  margin-right: 7px !important;
}

/* SP時の「現在のプラン」ボタン高さ調整 */
@media (max-width: 1024px){
  html body[data-tm-proof-upload-header="1"] #navbar-common .sp_navbar_header #plan-header-toggle-btn.btn-plan-sp{
    padding-top: 2px !important;
    padding-bottom: 2px !important;
    height: 30px !important;
    line-height: 1.2 !important;
  }
}
`.trim();
  }

  // ナビ縦線（ホーム / ファイル / 一時保管）に tm-proof-sep-right を付与
  function syncHeaderSeparators() {
    if (!document.body || document.body.dataset.tmProofUploadHeader !== '1') return;

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
      ul.querySelector('li.nav-item a.custom-nav-link[href="/akaire_feature/akaires/list_temp_file"]')
        ?.closest('li.nav-item');

    [homeLi, fileLi, tempLi].forEach(li => {
      if (!li) return;
      if (!li.classList.contains('tm-proof-sep-right')) {
        li.classList.add('tm-proof-sep-right');
      }
    });
  }

  // ❷ 余計な文字「新規ファイル作成」を削除（SPヘッダー内）
  function removeSpTitleText(nav) {
    const el = nav.querySelector('.content-header-sp .text-white.d-xx-none');
    if (!el) return;

    const t = (el.textContent || '').replace(/\s+/g, '');
    if (t.indexOf('新規ファイル作成') === -1) return;

    el.remove();
  }

// ❶ バーガーを追加（SPヘッダー）
// - 一時保管ページと同じDOM構造（onclick付きwrapper）で入れる
// - 二重追加はしない
function insertBurgerIcon(nav) {
  const spHeader = nav.querySelector('.sp_navbar_header');
  if (!spHeader) return;

  // 既にあるなら二重追加しない（wrapper or imgどちらでも検知）
  if (spHeader.querySelector('.list-temp-file-akaire') || spHeader.querySelector('img.btn-side-bar.pd-menu-akapon')) {
    return;
  }

  // 一時保管ページと同じwrapper
  const wrap = document.createElement('div');
  wrap.className = 'rounded-sm dropdown-toggle cursor-pointer list-temp-file-akaire';
  wrap.setAttribute('onclick', 'SideBar.showSideBar(event)');

  const img = document.createElement('img');
  img.alt = 'icon';
  img.className = 'icon mail btn-side-bar pd-menu-akapon';
  img.src = '/assets/menu_task_akapon_sp-80131c9dcfb738623bbac7a2fe4f5e00e7912af43637fae3a4e07e9ca6babfb1.png';
  img.width = 45;
  img.height = 40;

  wrap.appendChild(img);

  // SPの「ホーム」ブロックの手前に入れる（見た目が一時保管に近い位置）
  const homeBlock = spHeader.querySelector('.d-xx-none.d-block');
  if (homeBlock) {
    spHeader.insertBefore(wrap, homeBlock);
  } else {
    spHeader.insertBefore(wrap, spHeader.firstChild);
  }
}

  function applyOnce() {
    if (!isUploadHeaderPage()) return;
    if (!document.body) return;

    // 二重適用防止
    if (document.body.dataset.tmProofUploadHeader === '1') return;
    document.body.dataset.tmProofUploadHeader = '1';

    const nav = document.getElementById('navbar-common');
    if (!nav) return;

    // ❷ 余計な文字を削除
    removeSpTitleText(nav);

    // ❶ バーガーを追加
    insertBurgerIcon(nav);

    // CSSを1回だけ注入
    if (!document.getElementById(STYLE_ID)) {
      const parent = document.head || document.documentElement;
      if (!parent) return;
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.type = 'text/css';
      style.appendChild(document.createTextNode(buildCss()));
      parent.appendChild(style);
    }

    // ナビ縦線
    syncHeaderSeparators();

    // ファイルdropdown内に「ファイル一覧へ」ボタンを追加（1回だけ）
    setupFileDropdownObserver();
  }

  // =========================================================
  // ファイルdropdown（#caseFile）内に「ファイル一覧へ」ボタンを追加
  // - HTMLは1回だけ追加（重くならない）
  // - クリック挙動はシステム側の a href に任せる
  // =========================================================
  function ensureFileListButtonInDropdown() {
    const nav = document.getElementById('navbar-common');
    if (!nav) return;

    // 「ファイル」dropdown
    const menu = nav.querySelector('.dropdown-menu.drop-down-akaire-file');
    if (!menu) return;

    const caseBox = menu.querySelector('.case-file.col-12');
    if (!caseBox) return;

    // 既に入っているなら何もしない
    if (caseBox.querySelector('a.border-btn-create-new-file')) return;

    const a = document.createElement('a');
    a.className = 'btn py-0 border bg-akapon text-white text-center font-weight-bold cursor-pointer border-btn-create-new-file';
    a.href = '/akaire_file/6782/project_akaire_files';
    a.setAttribute('data-tm-renamed', '1');
    a.style.width = '100%';
    a.style.padding = '7px 10px';
    a.style.marginTop = '5px';

    const span = document.createElement('span');
    span.className = 'mx-3 my-1';
    span.textContent = 'ファイル一覧へ';

    a.appendChild(span);

    // 先頭に入れる
    caseBox.insertBefore(a, caseBox.firstChild);
  }

  function setupFileDropdownObserver() {
    if (!document.body) return;
    if (document.body.dataset.tmUploadFileDropdownObs === '1') return;
    document.body.dataset.tmUploadFileDropdownObs = '1';

    const nav = document.getElementById('navbar-common');
    if (!nav) return;

    // 初回（既に開いている/DOMがある）でも入るように
    ensureFileListButtonInDropdown();

    const obs = new MutationObserver(() => {
      ensureFileListButtonInDropdown();
    });

    obs.observe(nav, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyOnce);
  } else {
    applyOnce();
  }

})();
