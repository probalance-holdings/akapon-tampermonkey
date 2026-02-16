// ==UserScript==
// @name         アカポン（プロジェクト｜左上メニュー※akapon-project-menu-buttons_html_css.user.js
// @namespace    akapon
// @version      1.0
// @match        https://member.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-menu-buttons_html_css.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-menu-buttons_html_css.user.js
// ==/UserScript==

(() => {
'use strict';

const STYLE_ID = 'left-menu-modal_css';
const ROOT_ID  = 'tm_project_left_menu_root';

/* =========================
   CSS
========================= */
function injectCss() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `

/* ===== 左メニュー全体 ===== */
#${ROOT_ID}{
  font-weight: 700;
  color:#111;

  /* 追加：モーダル内の左右余白（中央寄せ見え） */
  padding: 0 10px;
  box-sizing: border-box;
}

/* ボタン */
.tm-menu-btn{
  display:flex;
  align-items:center;
  justify-content:center;

  min-height:44px;
  padding:10px 12px;

  border-radius:12px;

  background:#111 !important;
  border:1px solid #111 !important;

  color:#fff !important;                 /* ← 既存の .text-dark a を確実に上書き */
  text-decoration:none !important;

  margin:10px 8px 12px;
  font-weight:800;
  line-height:1.2;

  box-shadow:0 10px 22px rgba(0,0,0,.20);
}

/* 通常リンク */
.tm-menu-link{
  display:flex;
  align-items:center;
  padding:8px 4px;
  text-decoration:none;
  color:#111;
}

.tm-menu-link:hover{
  opacity:.7;
}

/* 区切り線 */
.tm-menu-divider{
  border-top:1px solid #e5e5e5;
  margin:12px 0;
}

/* アコーディオンヘッダー */
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

.tm-accordion-arrow.open{
  color:#bbb;
}

/* アコーディオン中身 */
/* アコーディオン中身 */
.tm-accordion-body{
  display:none;
  margin-left:0;
}

.tm-accordion-body a{
  display:block;
  margin:6px 0;
  text-decoration:none;
  color:#111;
  font-weight:600;
  font-size:13px;
}

/* ===== AKP Sidebar: top button fix ===== */
#sidebar-recently a.hidePopupSideBar{
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  height: auto !important;              /* 30px固定を解除 */
  min-height: 44px !important;          /* タップしやすく */
  padding: 10px 12px !important;

  width: calc(100% - 16px) !important;  /* 端の余白 */
  margin: 10px 8px 12px !important;

  border-radius: 12px !important;
  box-shadow: 0 10px 22px rgba(0,0,0,.20) !important;
  text-decoration: none !important;
}

#sidebar-recently a.hidePopupSideBar > span{
  margin: 0 !important;                 /* mx-3/my-1 を潰す */
  line-height: 1.2 !important;
  font-weight: 800 !important;
}

/* ===== AKP Sidebar: menu row (icon + text) ===== */
#sidebar-recently .akp-side-row{
  display: flex !important;
  align-items: center !important;
  padding: 12px 14px !important;
  text-decoration: none !important;
  color: #111 !important;
}

#sidebar-recently .akp-side-row img,
#sidebar-recently .tm-menu-link img,
#sidebar-recently .tm-accordion-header img{
  display:inline-block !important;
  opacity:1 !important;
  visibility:visible !important;
  width:24px !important;
  /* height:auto !important; */  /* ← 14px指定を潰すので削除 */
  margin-right:12px !important;
  flex:0 0 auto !important;
}

/* 見出し行（アコーディオンの行） */
#sidebar-recently .akp-acc-head{
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 12px 14px !important;
  color: #111 !important;
  font-weight: 800 !important;
  cursor: pointer !important;
  user-select: none !important;
}

/* 仕切り線 */
#sidebar-recently .akp-side-sep{
  height: 1px !important;
  background: rgba(0,0,0,.12) !important;
  margin: 6px 10px !important;
}

  `;
  document.head.appendChild(style);
}

/* =========================
   最近利用（ファイル）抽出
========================= */
function extractRecentFileLinksFromSidebar(sidebarEl, limit = 10) {
  if (!sidebarEl) return [];

  const links = Array.from(
    sidebarEl.querySelectorAll('a[href^="/akaire_feature/akaire_files/"]')
  );

  // text/href が取れないものを除外
  const normalized = links
    .map(a => ({
      href: a.getAttribute('href'),
      text: (a.textContent || '').trim()
    }))
    .filter(x => x.href && x.text);

  // 重複href除去（上から順で残す）
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
   最近利用（タスク）抽出
========================= */
function extractRecentTaskLinksFromSidebar(sidebarEl, limit = 10) {
  if (!sidebarEl) return [];

  // 例：/projects/6663/tasks?... を拾う（会員ごとの最近利用）
  const links = Array.from(
    sidebarEl.querySelectorAll('a[href^="/projects/"][href*="/tasks"]')
  );

  const normalized = links
    .map(a => ({
      href: a.getAttribute('href'),
      text: (a.textContent || '').trim()
    }))
    .filter(x => x.href && x.text);

  const seen = new Set();
  const uniq = [];
  for (const item of normalized) {
    const key = item.href;
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(item);
    if (uniq.length >= limit) break;
  }

  return uniq;
}

/* =========================
   HTML生成
========================= */
function createMenu() {

  const sidebar = document.querySelector('#sidebar-recently');
  if (!sidebar) return;

  if (document.getElementById(ROOT_ID)) return;

  // 追加：sidebarを消す前に「最近利用したファイル」を抽出（会員ごとに変わる）
const recentFiles = extractRecentFileLinksFromSidebar(sidebar, 10);
const recentTasks = extractRecentTaskLinksFromSidebar(sidebar, 10);

  const wrapper = document.createElement('div');
  wrapper.id = ROOT_ID;

  wrapper.innerHTML = `

<!-- 新しいプロジェクト -->
<a href="#" class="tm-menu-btn hidePopupSideBar"
   onclick="Project.openCreateProjectModal('true', true)">
   ✚新しいプロジェクトを作成
</a>

<!-- チームメンバー -->
<a class="tm-menu-link"
   href="https://member.createcloud.jp/users/new">
   <img class="mr-3" src="/assets/nav/member-invitation-3c9b463db0515a4edb7d627bbf9643c924a4346444c93557fd764f2d97add378.png" width="24" height="14">
   チームメンバーを招待する
</a>

<!-- 外部メンバー -->
<a class="tm-menu-link"
   href="https://member.createcloud.jp/users/new">
   <img class="mr-3" src="/assets/nav/member-invitation-3c9b463db0515a4edb7d627bbf9643c924a4346444c93557fd764f2d97add378.png" width="24" height="14">
   外部メンバーを招待する
</a>

<div class="tm-menu-divider"></div>

<!-- 作業一覧 -->
<div class="tm-accordion-header" data-target="work-list">
  <div>
    <img class="mr-3" src="/assets/project-3bb6cf83c266728e4f54d69406161de36aed4a62c7e947ca1060c44f6627262f.png" width="25" height="23">
    作業一覧
  </div>
  <span class="tm-accordion-arrow">▼</span>
</div>

<div class="tm-accordion-body" id="work-list">
  <a href="/tasks">・全タスク</a>
  <a href="/akaire_feature/akaire_files">・全ファイル</a>
</div>

<div class="tm-menu-divider"></div>

<!-- 最近利用したタスク -->
<div class="tm-accordion-header" data-target="recent-task">
  <div>最近利用したタスク</div>
  <span class="tm-accordion-arrow">▼</span>
</div>

<div class="tm-accordion-body" id="recent-task">
  <div class="mt-3">
    <div class="font-weight-bold ml-2">
      ${recentTasks.length
        ? recentTasks.map(x =>
            `<a class="d-block my-2 cursor-pointer max-width-215px text-ellipsis" href="${x.href}">・${x.text}</a>`
          ).join('')
        : `<div class="ml-2" style="font-weight:600;font-size:13px;opacity:.7;">最近利用したタスクがありません</div>`
      }
    </div>
  </div>
</div>

<div class="tm-menu-divider"></div>

<!-- 最近利用したファイル -->
<div class="tm-accordion-header" data-target="recent-file">
  <div>最近利用したファイル</div>
  <span class="tm-accordion-arrow">▼</span>
</div>

<div class="tm-accordion-body" id="recent-file">
  <div class="mt-3">
    <div class="font-weight-bold ml-2">
      ${recentFiles.length
        ? recentFiles.map(x =>
            `<a class="d-block my-2 cursor-pointer max-width-215px text-ellipsis" target="_blank" href="${x.href}">・${x.text}</a>`
          ).join('')
        : `<div class="ml-2" style="font-weight:600;font-size:13px;opacity:.7;">最近利用したファイルがありません</div>`
      }
    </div>
  </div>
</div>

  `;

  sidebar.innerHTML = '';
  sidebar.appendChild(wrapper);
}

/* =========================
   アコーディオン動作
========================= */
function bindAccordion() {

  document.addEventListener('click', function(e){

    // 追加：Textノード等だと closest が無いのでガード
    const t = e.target;
    if (!t || typeof t.closest !== 'function') return;

    const header = t.closest('.tm-accordion-header');
    if(!header) return;

    const targetId = header.getAttribute('data-target');
    const body = document.getElementById(targetId);
    const arrow = header.querySelector('.tm-accordion-arrow');

    if(!body) return;

    const isOpen = body.style.display === 'block';

    body.style.display = isOpen ? 'none' : 'block';
    arrow.textContent = isOpen ? '▼' : '▲';
    arrow.classList.toggle('open', !isOpen);

  });

}

/* =========================
   初期化
========================= */
function init(){
  injectCss();
  createMenu();
  bindAccordion();
}

setTimeout(init, 500);

})();
