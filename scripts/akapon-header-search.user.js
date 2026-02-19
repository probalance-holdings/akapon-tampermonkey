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

/* =========================================================
   【エンジニア向けコメント｜ヘッダー文字の縦位置ズレ（全ページ統一の注意）】

   現状、ページによってヘッダー内ナビ文字（例：CRM／オプション／現在のプラン 等）の
   縦位置（高さ位置）が微妙にズレることがある。

   原因の候補（混在しやすい）：
   - ページ固有CSSで margin-top / padding / line-height が上書きされている
   - transform: translateY(...) の個別適用が混ざっている
   - .navbar-nav / .custom-nav-link / .btn-plan 等の display/align-items の差
   - スクリプト側のページ別CSS注入（/projects や /akaire_file だけ等）による差

   ■ 対応ルール（必須）
   1) ヘッダー文字の縦位置は「共通CSS」で一元管理し、全ページで同一に統一すること。
   2) ページごとの場当たり調整（top / margin-top / translateY の個別追加）は禁止。
      ※例外が必要な場合も、最終的に共通CSSへ統合して差異を解消すること。
   3) 基本は「display:flex + align-items:center」で揃え、line-height を含めて設計すること。
   4) !important の乱用で局所修正しない（後で別ページだけズレが再発しやすい）。

   ■ ゴール
   どのURLでも、ヘッダー内の文字・アイコンの縦位置が完全に同一の見た目になること。
   ========================================================= */

  // =========================================================
  // 設定（ヘッダーCSSのみ）
  // =========================================================
  const MIN_PC_WIDTH = 1024;
  const STYLE_ID = 'akapon-header-style';
  const PLAN_STYLE_ID = 'akapon-plan-button-style';
  const PROJECTS_NOTIFY_STYLE_ID = 'akapon-projects-notify-style';

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
html body nav.navbar .navbar-nav .custom-nav-link{
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
html body nav.navbar .navbar-nav .custom-nav-link:hover{
  background: rgba(255,255,255,.14) !important;
}

/* focus の見た目（キーボード操作用） */
html body nav.navbar .navbar-nav .custom-nav-link:focus{
  box-shadow: 0 0 0 2px rgba(255,255,255,.25) !important;
}

/* =========================================================
   TM: ヘッダーメニュー（CRM / プロジェクト / オプション）
   目的：
   - ファイルページでは radius/shadow が消えるため、hover/active/open 時だけ復活させる
   - /projects で見えている見た目（radius 8px + shadow 0 4px 12px）に寄せる
   ========================================================= */

/* hover */
html body #navbar-common ul.navbar-nav .custom-nav-link:hover{
  border-radius: 8px !important;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 4px 12px 0px !important;
  padding: 6px 15px !important;
  margin: 0 4px !important; /* 白同士がくっつかないように少し離す */
}

/* active（現在開いているページ側：プロジェクト等で nav-border-white が付く） */
html body #navbar-common ul.navbar-nav .custom-nav-link.nav-border-white{
  border-radius: 8px !important;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 4px 12px 0px !important;
  padding: 6px 15px !important;
  margin: 0 4px !important;
}

/* dropdown open（CRM / オプション：開いた時） */
html body #navbar-common ul.navbar-nav li.show > .custom-nav-link,
html body #navbar-common ul.navbar-nav .custom-nav-link[aria-expanded="true"]{

  border-radius: 8px !important;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 4px 12px 0px !important;
  padding: 6px 15px !important;
  margin: 0 4px !important;
}

/* PC以外はこのスクリプト由来の効果を出さない（保険） */
@media (max-width: ${MIN_PC_WIDTH - 1}px){
  /* ヘッダーCSSはSPでも問題ない想定だが、元仕様に合わせてPC限定にする */
  html body nav.navbar .navbar-nav{
    gap: initial !important;
  }
}

@media (min-width: 1367px) {
  .show-change-name-akaire-file-header {
    max-width: 340px;   /* 110pxは狭すぎるので拡張 */
    width: 340px;       /* 確実に幅を確保 */
    min-width: 240px;   /* 画面によって潰れない保険 */
  }
}

.akaire_file_name {
  /* 既存は維持しつつ上書き */
  width: 100%;

  /* 省略「…」 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  /* 見た目（かっこよく＋読みやすく） */
  border-radius: 10px;
  padding: 8px 12px;

  color: #1f2937;                 /* 黒寄りで読みやすく */
  background: rgba(255, 255, 255, 0.92);  /* 白系で上品に */
  border: 1px solid rgba(0,0,0,0.10);

  box-shadow: 0 6px 16px rgba(0,0,0,0.18);

  font-weight: 600;
  line-height: 1.2;

  outline: none;
}

/* フォーカス時（編集してる感を出す） */
.akaire_file_name:focus {
  box-shadow: 0 8px 20px rgba(0,0,0,0.22);
  border-color: rgba(30, 60, 114, 0.45);
}

/* =========================================================
   TM: CRM / オプション：hover で dropdown を表示（クリック動作は残す）
   - 構造：<a#navbarDropdown> + <div.dropdown-menu akapon ...>
   - id が重複していても「隣接要素」で拾うため両方効く
   ========================================================= */

/* hover で開く（Bootstrapの .show 付与がなくても表示） */
/* =========================================================
   TM: CRM / オプション：hover で dropdown を表示（消えにくい方式）
   - a:hover ではなく「親li」をhover対象にする
   - メニュー側に乗っている間も表示維持
   - キーボード操作は :focus-within で維持
   ========================================================= */
html body #navbar-common ul.navbar-nav li.dropdown:hover > .dropdown-menu.akapon,
html body #navbar-common ul.navbar-nav li.dropdown:focus-within > .dropdown-menu.akapon{
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
  pointer-events: auto !important;
}

/* 念のため：メニュー自体に乗っている間も維持 */
html body #navbar-common ul.navbar-nav .dropdown-menu.akapon:hover{
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
  pointer-events: auto !important;
}

/* dropdown の共通：角丸＋シャドー（他と同系統） */
html body #navbar-common .dropdown-menu.akapon{
  border-radius: 8px !important;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 4px 12px 0px !important;
  overflow: hidden !important; /* 角丸をきれいに見せる */
}

/* dropdown内の項目：hover時の見た目（既存を壊さない範囲） */
html body #navbar-common .dropdown-menu.akapon .dropdown-item:hover{
  background: rgba(30, 60, 114, 0.08) !important;
}

/* =========================================================
   TM: 特定メニューだけ太字解除（「一時保管フォルダー」）
   - href が /akaire_feature/akaires/list_temp_file のものだけ対象
   ========================================================= */
html body a.custom-nav-link[href="/akaire_feature/akaires/list_temp_file"],
html body a.custom-nav-link[href="/akaire_feature/akaires/list_temp_file"] > span{
  font-weight: 400 !important; /* 太字解除 */
}

/* TM: 右側に余白 10px（このメニューだけ） */
html body a.custom-nav-link[href="/akaire_feature/akaires/list_temp_file"]{
  padding-right: 30px !important;
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
  // TM: 「現在のプラン」ボタンCSS（全ページ共通）
  // - SP/PCどちらでも適用
  // =========================================================
  function buildPlanCss() {
    return `
#plan-header-toggle-btn.btn-plan {
  border: 1px solid #000 !important;
  background-color: #e67e22;
  color: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
}

.btn:not(:disabled):not(.disabled) {
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}
`;
  }

  function injectPlanStyleOnce() {
    if (document.getElementById(PLAN_STYLE_ID)) return;

    const parent = document.head || document.documentElement;
    if (!parent) return;

    const style = document.createElement('style');
    style.id = PLAN_STYLE_ID;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(buildPlanCss()));
    parent.appendChild(style);
  }

  // =========================================================
  // TM: /projects の時だけ「通知ベル」を少し上へ
  // =========================================================
  function buildProjectsNotifyCss() {
    return `
html body a.drop_btn[data-name="notificationDropbox"]{
  transform: translateY(-2px) !important;
}
`;
  }

  function isProjectsPage() {
    const p = location.pathname || '';
    // https://member.createcloud.jp/projects （/projects 配下も含む）
    return /^\/projects(\/|$)/.test(p);
  }

  function syncProjectsNotifyStyle() {
    // 既存スタイルがあっても /projects 以外では消す（ページ遷移対策）
    const existing = document.getElementById(PROJECTS_NOTIFY_STYLE_ID);

    // ※このスクリプトのヘッダーCSS方針に合わせ、PC時のみ対象にする
    if (!isPc() || !isProjectsPage()) {
      if (existing) existing.remove();
      return;
    }

    if (existing) return;

    const parent = document.head || document.documentElement;
    if (!parent) return;

    const style = document.createElement('style');
    style.id = PROJECTS_NOTIFY_STYLE_ID;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(buildProjectsNotifyCss()));
    parent.appendChild(style);
  }

// =========================================================
// TM: dropdown hover 安定化（全ページ共通）
// - Bootstrapが .show を外しても hover中は維持
// =========================================================
function setupGlobalDropdownHover() {

  if (window.__tmDropdownHoverInit) return;
  window.__tmDropdownHoverInit = true;

  const nav = document.getElementById('navbar-common');
  if (!nav) return;

  nav.addEventListener('mouseenter', (e) => {
    const li = e.target.closest('li.dropdown');
    if (!li) return;

    const menu = li.querySelector('.dropdown-menu.akapon');
    if (!menu) return;

    li.classList.add('show');
    menu.classList.add('show');
  }, true);

  nav.addEventListener('mouseleave', (e) => {
    const li = e.target.closest('li.dropdown');
    if (!li) return;

    const menu = li.querySelector('.dropdown-menu.akapon');
    if (!menu) return;

    li.classList.remove('show');
    menu.classList.remove('show');
  }, true);
}

// =========================================================
// 起動
// =========================================================
function tickInit() {
  injectStyleOnce();
  injectPlanStyleOnce();
  syncProjectsNotifyStyle();
  setupGlobalDropdownHover();   // ←追加
}

  const mo = new MutationObserver(() => {
    tickInit();
  });

  mo.observe(document.documentElement, { childList: true, subtree: true });

  tickInit();
})();
