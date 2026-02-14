// ==UserScript==
// @name         アカポン（プロジェクト｜表示件数-HTML）※akapon-project-hide-number-buttons_html.user.js
// @namespace    akapon
// @version      1.1
// @match        https://member.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-filter-buttons_close.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-number-buttons_html.user.js
// ==/UserScript==

(() => {
  const FLAG_ATTR = 'data-tm-eachpage-html-applied';
  const RECHECK_MS = 500;

  function readCurrentEachPageFromDom() {
    // 既存UI（差し替え前）に表示されている件数を最優先で拾う
    const el = document.querySelector('.td-filter-box .select-items-each-page');
    const text = (el?.textContent || '').trim();
    const n = parseInt(text, 10);
    return Number.isFinite(n) ? String(n) : null;
  }

  function readCurrentEachPageFromUrl() {
    const params = new URLSearchParams(location.search);
    const keys = ['per_page', 'each_page', 'page_size', 'limit'];
    for (const k of keys) {
      const v = params.get(k);
      const n = parseInt(v || '', 10);
      if (Number.isFinite(n)) return String(n);
    }
    return null;
  }

  function getCurrentEachPage() {
    return readCurrentEachPageFromDom() || readCurrentEachPageFromUrl() || '10';
  }

  function buildEachPageHtml(current) {
    const is10 = current === '10';
    const is30 = current === '30';
    const is50 = current === '50';
    const is100 = current === '100';

    return `
<div class="content-number-record border-new d-flex justify-content-space-between align-items-center cursor-pointer mr-1"
     onclick="SearchForm.selectFilterDisplay('toggle', '.filter-content-number-record', event)">
  <span class="mr-2">表示件数</span>
  <div class="select-items-each-page">${current}</div>
</div>

<div class="filter-content filter-content-number-record drop-right dropdown-new-stype check-right d-none">
  <div class="dropdown-header d-flex justify-content-between">
    <div class="d-flex align-items-center cursor-pointer"
         onclick="SearchForm.selectFilterDisplay('toggle', '.filter-common-all', event)">
      <img src="/assets/chevron-left-d7745965927c383c6f574a59b3c97c418bb47745020aeaa73d727a6a95871fcf.svg" width="16" height="16">
      件数
    </div>
    <div class="d-flex">
      <button type="submit" class="quick-submit">完了</button>
    </div>
  </div>

  <div class="dropdown-body search text-center">
    <div class="option cursor-pointer${is10 ? ' slted' : ''}" onclick="ItemEachPage.changeEachPage('10')">10</div>
    <div class="option cursor-pointer${is30 ? ' slted' : ''}" onclick="ItemEachPage.changeEachPage('30')">30</div>
    <div class="option cursor-pointer${is50 ? ' slted' : ''}" onclick="ItemEachPage.changeEachPage('50')">50</div>
    <div class="option cursor-pointer${is100 ? ' slted' : ''}" onclick="ItemEachPage.changeEachPage('100')">100</div>
  </div>
</div>
`.trim();
  }

  function applyEachPageHtmlOnce() {
    // 「表示件数」ブロックの親（.td-filter-box）を狙う
    const wrapper = document.querySelector('.td-filter-box .content-number-record')?.closest('.td-filter-box');
    if (!wrapper) return false;

    // すでに適用済みなら何もしない（重くしない）
    if (wrapper.getAttribute(FLAG_ATTR) === '1') return false;

    const current = getCurrentEachPage();
    const html = buildEachPageHtml(current);

    wrapper.innerHTML = html;
    wrapper.setAttribute(FLAG_ATTR, '1');
    return true;
  }

  // 初回
  applyEachPageHtmlOnce();

  // URL変化時のみ再適用（必要なときだけ）
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      setTimeout(() => {
        applyEachPageHtmlOnce();
      }, 50);
    }
  }, RECHECK_MS);

  console.log('[TM] eachpage html injected:', location.href);
})();
