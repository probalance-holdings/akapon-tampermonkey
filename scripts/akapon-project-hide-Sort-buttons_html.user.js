// ==UserScript==
// @name         5｜アカポン（プロジェクト｜並び替え-HTML）※akapon-project-hide-Sort-buttons_html.user.js
// @namespace    akapon
// @version      1.2
// @match        https://member.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-Sort-buttons_html.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-Sort-buttons_html.user.js
// ==/UserScript==

(() => {

  /* =========================================================
     NOTE（作成日について）
     - この一覧ページDOMには作成日そのものの値が無い
       （consoleで日付候補・created系属性を検索しても0件）
     - sort_by[created_at] もHTML内に存在しないため、
       Tampermonkey / console だけで「作成日」を特定・ソートするのは不可
     - 現状の「作成日（ダミー）」は updated_at を流用している
     ========================================================= */

  const FLAG_ATTR = 'data-tm-sort-html-applied';
  const RECHECK_MS = 500;

  // あなたが貼った HTML（td.td-sort-box の中身として入れる）
  const SORT_HTML = `
<div class="border-new sort d-flex justify-content-space-between align-items-center cursor-pointer mr-1" onclick="SearchForm.selectSortDisplay('toggle', event)">
  <span class="mr-1 text-ellipsis sort-text-display" style="max-width: 160px;">並び順
  </span>
  <div><img src="/assets/chevron-down-3b0bd07afea15aac3af76385d0cab366b6f327773c6cd0ebeb08ae8cb53494ae.svg"></div>
</div>

<div class="sort_box d-none" id="sortBox" data-show-notify="false">
  <div class="sort_box_title d-flex justify-content-between align-items-center cursor-pointer font-weight-bold">
    <div>並び順</div>
  </div>

  <div class="sort_box_text">
    <ul class="sort_list">
      <li class="li-sort-item" onclick="$(this).toggleClass('active')">
        <div class="sort_item slted">ID
        </div>
        <ul>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option ">
            <a class="customize-sort-name-default" href="/projects?items_each_page=&amp;q%5Bcreated_at_gteq%5D=&amp;q%5Bcreated_at_lteq%5D=&amp;q%5Bkind_id%5D=&amp;q%5Bname_or_creator_name_or_company_name_cont%5D=&amp;search_kind=id_cont&amp;sort_by%5Bid%5D=asc">新しい順</a>
          </li>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option slted">
            <a class="customize-sort-name-default" href="/projects?items_each_page=&amp;q%5Bcreated_at_gteq%5D=&amp;q%5Bcreated_at_lteq%5D=&amp;q%5Bkind_id%5D=&amp;q%5Bname_or_creator_name_or_company_name_cont%5D=&amp;search_kind=id_cont&amp;sort_by%5Bid%5D=desc">古い順</a>
          </li>
        </ul>
      </li>

      <li class="li-sort-item" onclick="$(this).toggleClass('active')">
        <div class="sort_item ">作成日（ダミー）
        </div>
        <ul>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option ">
            <a class="customize-sort-name-default" href="/projects?items_each_page=&amp;q%5Bcreated_at_gteq%5D=&amp;q%5Bcreated_at_lteq%5D=&amp;q%5Bkind_id%5D=&amp;q%5Bname_or_creator_name_or_company_name_cont%5D=&amp;search_kind=id_cont&amp;sort_by%5Bupdated_at%5D=asc">古い順</a>
          </li>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option ">
            <a class="customize-sort-name-default" href="/projects?items_each_page=&amp;q%5Bcreated_at_gteq%5D=&amp;q%5Bcreated_at_lteq%5D=&amp;q%5Bkind_id%5D=&amp;q%5Bname_or_creator_name_or_company_name_cont%5D=&amp;search_kind=id_cont&amp;sort_by%5Bupdated_at%5D=desc">新しい順</a>
          </li>
        </ul>
      </li>

      <li class="li-sort-item" onclick="$(this).toggleClass('active')">
        <div class="sort_item ">更新日
        </div>
        <ul>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option ">
            <a class="customize-sort-name-default" href="/projects?items_each_page=&amp;q%5Bcreated_at_gteq%5D=&amp;q%5Bcreated_at_lteq%5D=&amp;q%5Bkind_id%5D=&amp;q%5Bname_or_creator_name_or_company_name_cont%5D=&amp;search_kind=id_cont&amp;sort_by%5Bupdated_at%5D=asc">古い順</a>
          </li>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option ">
            <a class="customize-sort-name-default" href="/projects?items_each_page=&amp;q%5Bcreated_at_gteq%5D=&amp;q%5Bcreated_at_lteq%5D=&amp;q%5Bkind_id%5D=&amp;q%5Bname_or_creator_name_or_company_name_cont%5D=&amp;search_kind=id_cont&amp;sort_by%5Bupdated_at%5D=desc">新しい順</a>
          </li>
        </ul>
      </li>

      <li class="li-sort-item" onclick="$(this).toggleClass('active')">
        <div class="sort_item ">ステータス
        </div>
        <ul>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option ">
            <a class="customize-sort-name-default" href="/projects?items_each_page=&amp;q%5Bcreated_at_gteq%5D=&amp;q%5Bcreated_at_lteq%5D=&amp;q%5Bkind_id%5D=&amp;q%5Bname_or_creator_name_or_company_name_cont%5D=&amp;search_kind=id_cont&amp;sort_by%5Bstatus%5D=asc">昇順</a>
          </li>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option ">
            <a class="customize-sort-name-default" href="/projects?items_each_page=&amp;q%5Bcreated_at_gteq%5D=&amp;q%5Bcreated_at_lteq%5D=&amp;q%5Bkind_id%5D=&amp;q%5Bname_or_creator_name_or_company_name_cont%5D=&amp;search_kind=id_cont&amp;sort_by%5Bstatus%5D=desc">降順</a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</div>
`.trim();

  function findTargetTd() {
    const tds = Array.from(document.querySelectorAll('td.td-sort-box'));
    if (tds.length === 0) return null;

    // 元々 sortBox を内包している td を最優先（狙いの箇所の可能性が高い）
    const tdHasSortBox = tds.find(td => td.querySelector('#sortBox'));
    if (tdHasSortBox) return tdHasSortBox;

    // 次点：SearchForm.selectSortDisplay を持つボタンがある td
    const tdHasSortBtn = tds.find(td => td.querySelector('[onclick*="SearchForm.selectSortDisplay"]'));
    if (tdHasSortBtn) return tdHasSortBtn;

    // 最後：先頭
    return tds[0];
  }

  function applySortHtmlOnce() {
    const td = findTargetTd();
    if (!td) return false;

    if (td.getAttribute(FLAG_ATTR) === '1') return false;

    td.innerHTML = SORT_HTML;
    td.setAttribute(FLAG_ATTR, '1');
    return true;
  }

  applySortHtmlOnce();

  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      setTimeout(() => {
        applySortHtmlOnce();
      }, 50);
    }
  }, RECHECK_MS);

  console.log('[TM] sort html injected:', location.href);
})();
