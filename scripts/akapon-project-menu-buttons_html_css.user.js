// ==UserScript==
// @name         アカポン（プロジェクト｜左上メニュー）※akapon-project-menu-buttons_html_css.user.js
// @namespace    akapon
// @version      20260221 2000
// @match        https://member.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-menu-buttons_html_css.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-menu-buttons_html_css.user.js
// ==/UserScript==

(() => {
'use strict';

/* =========================================================
【左上バーガーメニュー組み立て方式（プロジェクト共通ルール）】

■ 基本方針
・DOM依存しない（既存sidebarを毎回完全再構築）
・URLでページタイプ判定
・ベースメニューは1パターン
・差分は「先頭ボタンのみ」
・既存JSは一切変更しない
・将来他ドメインでも getPageType() 追加で拡張可能

■ ページ分類
base        ：共通メニュー
file-detail ：/akaire_feature/akaire_files/{id}
file-root   ：/akaire_feature/akaire_files（※現状維持）

========================================================= */

const STYLE_ID = 'left-menu-modal_css';
const ROOT_ID  = 'tm_project_left_menu_root';

/* =========================
   ページタイプ判定
========================= */
function getPageType() {
  const path = location.pathname;

// akaire_files 配下はすべて変更禁止
if (/^\/akaire_feature\/akaire_files(\/.*)?$/.test(path)) {
  return 'file-root';
}

// ファイルページ（akaire_file系）
if (/^\/akaire_file\/\d+\/(project_akaire_files|task_akaire_files)/.test(path)) {
  return 'akaire-file-page';
}

// タスクページ
if (/^\/projects\/\d+\/task/.test(path)) {
  return 'task';
}

  /*
  =========================================================
  ■ ベース固定ページ（projects と同じメニューにする）
  ---------------------------------------------------------
  https://member.createcloud.jp/projects/***
  https://member.createcloud.jp/company/info
  https://member.createcloud.jp/users/***
  https://member.createcloud.jp/company/contract
  https://member.createcloud.jp/company_ip_limits
  https://member.createcloud.jp/collaborators/***
  https://member.createcloud.jp/notification
  https://member.createcloud.jp/news
  https://member.createcloud.jp/contact_us
  https://member.createcloud.jp/company_apply_campaigns

  上記はすべて 'base' として扱う。
  将来分岐追加する場合も、projects基準を維持すること。
=========================================================
　タスクページ（/projects/{id}/task）の
　「最近利用した校正ページ」は

　ファイルページ（akaire-file-page）と
　同じ recentFiles データを使用すること。

　現在はDOM抽出方式。

　将来API連携する場合も、
　fileページと同一データソースを必ず共有すること。
  =========================================================
  */

  return 'base';
}

/* =========================
   CSS
========================= */
function injectCss() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `

#${ROOT_ID}{
  font-weight:700;
  color:#111;
  padding:0 10px;
  box-sizing:border-box;
}

.tm-menu-btn{
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:40px;
  padding:10px 12px;
  border-radius:12px;
  background:#111 !important;
  border:1px solid #111 !important;
  color:#fff !important;
  text-decoration:none !important;
  margin:10px 8px 12px;
  font-weight:800;
  line-height:1.2;
  box-shadow:0 10px 22px rgba(0,0,0,.20);
}

.tm-menu-link{
  display:flex;
  align-items:center;
  padding:8px 4px;
  text-decoration:none;
  color:#111;
}

.tm-menu-link:hover{ opacity:.7; }

.tm-menu-divider{
  border-top:1px solid #e5e5e5;
  margin:12px 0;
}

.tm-accordion-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  cursor:pointer;
  padding:6px 2px;
}

.tm-accordion-arrow{
  font-size:12px;
  transition:.2s;
}

.tm-accordion-body{
  display:none;
}

.tm-accordion-body a{
  display:block;
  margin:6px 0;
  text-decoration:none;
  color:#111;
  font-weight:600;
  font-size:13px;
}

#sidebar-recently{
  box-shadow:
    0 18px 40px rgba(0,0,0,.18),
    0 2px 10px rgba(0,0,0,.10) !important;
  border-top-right-radius:14px !important;
  background:#fff !important;
}

.tm-accordion-body a{
  display:block;
  margin:6px 0;
  text-decoration:none;
  color:#111;
  font-weight:600;
  font-size:13px;

  max-width:260px;          /* ★追加 */
  overflow:hidden;          /* ★追加 */
  white-space:nowrap;       /* ★追加 */
  text-overflow:ellipsis;   /* ★追加 */
}

/* =========================
   SPサイドバー幅制限
========================= */
@media (max-width: 768px){

  body #sidebar-recently{
    width: 47vw !important;
    min-width: 0 !important;
    max-width: none !important;
  }

/* =========================
   SP専用フォント調整
========================= */
  .tm-accordion-header{
    font-size:0.9em !important;
  }

  .tm-accordion-body a{
    font-size:0.9em !important;
    line-height:1.4 !important;
  }

/* =========================
   アコーディオン文字統一
========================= */
.tm-accordion-header{
  font-size:0.9em !important;
  font-weight:700 !important;
}

.tm-accordion-body a{
  font-size:0.9em !important;
  font-weight:700 !important;
}

/* =========================
   SP専用フォント調整（校正画面)
========================= */
/* 左余白を少し削る */
#sidebar-recently .side-bar-header{
  padding-left: 8px !important;
  padding-right: 8px !important;
}

#sidebar-recently .cursor-pointer,
#sidebar-recently a{
  font-size: 0.9em !important;
  font-weight: 700 !important;
}

/* サイドバー全体を少し左に寄せる */
#sidebar-recently .side-bar-header{
  padding-left: 0px !important;
  padding-right: 5px !important;
}

display:flex;
align-items:center;
justify-content:center;
min-height:40px;
padding:10px 12px;
border-radius:12px;
background:#E60C11;
...

/* 新しいファイル作成ボタンを tm-menu-btn 風にする */
#sidebar-recently a.create-new-animation-from-akaire-detail{
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  min-height:40px !important;
  padding:10px 12px !important;
  border-radius:12px !important;
  background:#E60C11 !important;
  border:1px solid #111 !important;
  color:#fff !important;
  text-decoration:none !important;
  margin:10px 0 12px 0 !important;
  font-weight:700 !important;
  box-shadow:0 10px 22px rgba(0,0,0,.20) !important;
}

/* span の余白を整える */
#sidebar-recently a.create-new-animation-from-akaire-detail span.mx-3.my-1{
  margin:0 !important;
}

/* =========================
   校正画面アイコン縮小
========================= */
#sidebar-recently img,
#sidebar-recently .icon{
  transform:scale(0.7) !important;
}

/* =========================
   校正画面 新規作成ボタン中央寄せ
========================= */
#sidebar-recently a.create-new-animation-from-akaire-detail{
  display:flex !important;
  justify-content:center !important;
  align-items:center !important;
  text-align:center !important;
}
}
`;
  document.head.appendChild(style);
}

/* =========================
   先頭ボタン生成
========================= */
function buildTopButtonHtml(type) {

  const path = location.pathname;

// akaire-file-page 用（最優先）
if (type === 'akaire-file-page') {

  const path = location.pathname;
  const projectId = path.split('/')[2];

  const isTask = /task_akaire_files/.test(path);

  let taskId = null;
  const matchTask = location.search.match(/task_id=(\d+)/);
  if (matchTask) taskId = matchTask[1];

  if (isTask && taskId) {
    return `
<a href="/akaire_feature/akaires?from_task_id=${taskId}"
   class="tm-menu-btn hidePopupSideBar">
   ✚新しいファイルを作成
</a>
`;
  }

  return `
<a href="/akaire_feature/akaires?from_project_id=${projectId}"
   class="tm-menu-btn hidePopupSideBar">
   ✚新しいファイルを作成
</a>
`;
}

// タスクページ
if (type === 'task') {
  return `
<a href="javascript:void(0)"
   class="tm-menu-btn hidePopupSideBar"
   onclick="SideBar.openModalCreateNew()">
   ✚新しいタスクを作成する
</a>
`;
}

// file-detail（今使っていないなら削除可）
if (type === 'file-detail') {

  const match = path.match(/akaire_files\/(\d+)/);
  const projectId = match ? match[1] : '';

  return `
<a class="btn py-0 rounded-md border bg-dark text-white mx-1 text-center font-weight-normal cursor-pointer hidePopupSideBar"
   style="height:30px;"
   href="/akaire_feature/akaires?from_project_id=${projectId}">
  <span class="mx-3 my-1">✚新しいファイルを作成</span>
</a>
`;
}

// ★ 追加（関数のデフォルト）
return `
<a href="#" class="tm-menu-btn hidePopupSideBar"
   onclick="Project.openCreateProjectModal('true', true)">
   ✚新しいプロジェクトを作成
</a>
`;
}

/* =========================
   最近利用抽出
========================= */
function extractLinks(sidebar, selector, limit = 10) {
  if (!sidebar) return [];

  const links = Array.from(sidebar.querySelectorAll(selector));

  const normalized = links
    .map(a => ({
      href: a.getAttribute('href'),
      text: (a.textContent || '').trim()
    }))
    .filter(x => x.href && x.text);

  const seen = new Set();
  const uniq = [];

  for (const item of normalized) {
    if (seen.has(item.href)) continue;
    seen.add(item.href);
    uniq.push(item);
    if (uniq.length >= limit) break;
  }

  return uniq;
}

/* =========================
   メニュー生成
========================= */
function createMenu() {

  const sidebar = document.querySelector('#sidebar-recently');
  if (!sidebar) return;
  if (document.getElementById(ROOT_ID)) return;

  const type = getPageType();

  // file-root は触らない
  if (type === 'file-root') return;

  const recentFiles = extractLinks(
    sidebar,
    'a[href^="/akaire_feature/akaire_files/"]',
    10
  );

  const recentTasks = extractLinks(
    sidebar,
    'a[href^="/projects/"][href*="/tasks"]',
    10
  );

  const wrapper = document.createElement('div');
  wrapper.id = ROOT_ID;

  const topButton = buildTopButtonHtml(type);

  wrapper.innerHTML = `
${topButton}

<a class="tm-menu-link"
   data-close-left
   target="_blank"
   href="/akaire_feature/akaires/list_temp_file">
  <img style="margin-right:18px"
       src="/assets/feather_download_cloud-6d51130c3509821732d4343085f8d4393935d5652207e75d88cc513a2ce8712e.svg"
       width="22"
       height="27">
  一時保管フォルダ
</a>

${ (type !== 'akaire-file-page' && type !== 'task') ? `
<a class="tm-menu-link"
   data-close-left
   href="https://member.createcloud.jp/users/new">
  <svg class="mr-3"
       width="24"
       height="24"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4"
            stroke="currentColor"
            stroke-width="2"></circle>
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"></path>
  </svg>
  チームメンバーを招待する
</a>

<a class="tm-menu-link"
   data-close-left
   href="https://member.createcloud.jp/collaborators/new">
  <img class="mr-3"
       src="/assets/nav/member-invitation-3c9b463db0515a4edb7d627bbf9643c924a4346444c93557fd764f2d97add378.png"
       width="24"
       height="14">
  外部メンバーを招待する
</a>
` : `` }

${ (type === 'akaire-file-page' || type === 'task') ? (() => {

  const pathParts = location.pathname.split('/');
  const projectId = pathParts[2];

  // -------------------------
  // fileページの場合
  // -------------------------
  if (type === 'akaire-file-page') {

    const isTask = /task_akaire_files/.test(location.pathname);

    let taskId = null;
    const matchTask = location.search.match(/task_id=(\d+)/);
    if (matchTask) taskId = matchTask[1];

    const memberHtml = isTask && taskId
      ? `
<div class="cursor-pointer my-2 d-flex align-items-center show-setting-pic"
     data-close-left
     onclick="Task.showHideSettingPic('${projectId}', '${taskId}')">
  <img class="mr-3"
       src="/assets/nav/member-invitation-3c9b463db0515a4edb7d627bbf9643c924a4346444c93557fd764f2d97add378.png"
       width="22" height="14">
  メンバー招待
</div>
`
      : `
<div class="cursor-pointer my-2 d-flex align-items-center show-setting-pic"
     data-close-left
     onclick="Project.showSettingPicProject('${projectId}')">
  <img class="mr-3"
       src="/assets/nav/member-invitation-3c9b463db0515a4edb7d627bbf9643c924a4346444c93557fd764f2d97add378.png"
       width="24" height="14">
  メンバー招待
</div>
`;

    const statusHtml = isTask && taskId
      ? `
<div class="cursor-pointer my-2 d-flex align-items-center"
     data-close-left
     data-toggle="modal"
     data-target="#modalSelectStatus-${taskId}">
  <img class="mr-3"
       src="/assets/project_menu/icon_status-de67fbdf7730bfd601b5b0d314e5059889d11e6271280da8e6e55460ff66ec8e.svg"
       width="22" height="24">
  Status
</div>
`
      : `
<div class="cursor-pointer my-2 d-flex align-items-center"
     data-close-left
     data-toggle="modal"
     data-target="#modalSelectStatus-${projectId}">
  <img style="margin-right:18px"
       src="/assets/project_menu/icon_status-de67fbdf7730bfd601b5b0d314e5059889d11e6271280da8e6e55460ff66ec8e.svg"
       width="22" height="24">
  Status
</div>
`;

    return `
<div class="tm-menu-divider"></div>

<div class="tm-accordion-header" data-target="project-info">
  <div>このプロジェクト関連情報</div>
  <span class="tm-accordion-arrow">▼</span>
</div>

<div class="tm-accordion-body" id="project-info">
  ${memberHtml}
  ${statusHtml}
  <a class="my-2 d-flex align-items-center"
     data-close-left
     href="/projects/${projectId}/authority">
    <img class="mr-3"
         src="/assets/nav/batch-pj-permission-af7bbd5c047ad473c021a3d2db45e543cfac907c270f06f7646972f567437273.png"
         width="22" height="27">
    権限一括設定
  </a>
</div>
`;
  }

  // -------------------------
  // taskページ専用
  // -------------------------
if (type === 'task') {

  return `
<div class="tm-menu-divider"></div>

<div class="tm-accordion-header" data-target="project-info">
  <div>このプロジェクト関連情報</div>
  <span class="tm-accordion-arrow">▼</span>
</div>

<div class="tm-accordion-body" id="project-info">

  <div class="cursor-pointer my-2 d-flex align-items-center show-setting-pic"
       data-close-left
       onclick="Project.showSettingPicProject('${projectId}')">
    <img class="mr-3"
         src="/assets/nav/member-invitation-3c9b463db0515a4edb7d627bbf9643c924a4346444c93557fd764f2d97add378.png"
         width="24"
         height="14">
    メンバー招待
  </div>

  <div class="cursor-pointer my-2 d-flex align-items-center"
       data-close-left
       data-toggle="modal"
       data-target="#modalSelectStatus-${projectId}">
    <img class="mr-3"
         src="/assets/project_menu/icon_status-de67fbdf7730bfd601b5b0d314e5059889d11e6271280da8e6e55460ff66ec8e.svg"
         width="22"
         height="24">
    Status
  </div>

  <a class="my-2 d-flex align-items-center"
     data-close-left
     href="/projects/${projectId}/authority">
    <img style="margin-right:18px"
         src="/assets/nav/batch-pj-permission-af7bbd5c047ad473c021a3d2db45e543cfac907c270f06f7646972f567437273.png"
         width="22"
         height="27">
    権限一括設定
  </a>

</div>
`;
}

})() : `` }

${ type !== 'akaire-file-page' ? `
<div class="tm-menu-divider"></div>

<div class="tm-accordion-header" data-target="recent-task">
  <div>最近利用したタスク</div>
  <span class="tm-accordion-arrow">▼</span>
</div>

<div class="tm-accordion-body" id="recent-task">
  ${
    recentTasks.length
      ? recentTasks.map(x =>
          `<a data-close-left href="${x.href}">・${x.text}</a>`
        ).join('')
      : `<div style="opacity:.6;">最近利用したタスクがありません</div>`
  }
</div>
` : `` }


<div class="tm-menu-divider"></div>

<div class="tm-accordion-header" data-target="recent-file">
<div>
${ type === 'base'
    ? '最近利用したファイル'
    : '最近利用した校正ページ'
}
</div>
  <span class="tm-accordion-arrow">▼</span>
</div>

<div class="tm-accordion-body" id="recent-file">
  ${
    recentFiles.length
      ? recentFiles.map(x =>
          `<a data-close-left target="_blank" href="${x.href}">・${x.text}</a>`
        ).join('')
      : `<div style="opacity:.6;">${
  location.pathname.startsWith('/projects')
    ? '最近利用したファイルがありません'
    : '最近利用した校正ページがありません'
}</div>`
  }
</div>
`;

  sidebar.innerHTML = '';
  sidebar.appendChild(wrapper);
}

/* =========================
   アコーディオン
========================= */
function bindAccordion() {

  document.addEventListener('click', function(e){
    const t = e.target;
    if (!t || typeof t.closest !== 'function') return;

    const header = t.closest('.tm-accordion-header');
    if(!header) return;

    const body = document.getElementById(
      header.getAttribute('data-target')
    );

    if(!body) return;

    const isOpen = body.style.display === 'block';
    body.style.display = isOpen ? 'none' : 'block';
  });
}

/* =========================
   左上モーダル自動クローズ
========================= */
function bindAutoCloseLeftModal(){

  document.addEventListener('click', function(e){

    const el = e.target.closest('[data-close-left]');
    if(!el) return;

    const sidebar = document.querySelector('#sidebar-recently');
    if(!sidebar) return;

    // 左上メニューだけ閉じる（DOM直接制御）
    sidebar.classList.add('d-none');

  });
}

/* =========================
   初期化
========================= */
let __tm_initialized = false;

function init(){

  if (__tm_initialized) return;

  const sidebar = document.querySelector('#sidebar-recently');
  if (!sidebar) return;

  // すでに生成済みなら停止
  if (document.getElementById(ROOT_ID)) {
    __tm_initialized = true;
    return;
  }

  __tm_initialized = true;

  injectCss();
  createMenu();
  bindAccordion();
  bindAutoCloseLeftModal();
}

/* =========================
   sidebar 出現監視（軽量）
========================= */
const __tm_observer = new MutationObserver(function(){

  const sidebar = document.querySelector('#sidebar-recently');
  if (!sidebar) return;

  init();
  __tm_observer.disconnect(); // 一度だけ実行

});

__tm_observer.observe(document.body, {
  childList: true,
  subtree: true
});

})();
