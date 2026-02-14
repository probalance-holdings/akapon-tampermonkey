// ==UserScript==
// @name         アカポン（プロジェクト｜検索・絞り込み-HTML）※akapon-project-hide-filter-search_html.user.js
// @namespace    akapon
// @version      1.1
// @match        https://member.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-filter-search_html.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-filter-search_html.user.js
// ==/UserScript==

(() => {
  const FLAG_ATTR = 'data-tm-filter-html-applied';
  const RECHECK_MS = 500;

  // あなたが貼った HTML（td.td-filter-box の中身として入れる）
  const FILTER_HTML = `
<!-- フィルターボタン（既存JSそのまま） -->
<div class="border-new filter-btn d-flex cursor-pointer mr-1 position-relative"
     onclick="SearchForm.selectFilterDisplay('toggle', '.filter-common-all', event)">
  <span class="filter-btn-label">絞り込み</span>
  <span class="number">0</span>
</div>

<!-- フィルターモーダル本体（中央モーダル化する箱） -->
<div class="filter-content dropdown-new-stype filter-common-all d-none">
  <div class="dropdown-header d-flex justify-content-between">
    <div class="d-flex align-items-center cursor-pointer"
         onclick="SearchForm.selectFilterDisplay('toggle', '.filter-common-all', event)">
      検索・絞り込み
    </div>
    <div class="d-flex">
      <button type="button" class="reset-data-all" onclick="SearchForm.resetDataSearchAll(this)">クリア</button>&nbsp;&nbsp;&nbsp;
      <button type="submit" class="quick-submit">完了</button>
    </div>
  </div>

  <div class="dropdown-body search text-center">
    <!-- 1) 文字検索 -->
    <div class="d-flex search-input">
      <input class="form-control" placeholder="検索するテキストを入力"
             onchange="SearchForm.filterCount('input', this)"
             type="text" name="q[name_or_creator_name_or_company_name_cont]"
             id="q_name_or_creator_name_or_company_name_cont">
      <button type="submit" class="btn btn-submit-search search-form">
        <img class="filter-black-icon" src="/assets/icon_search-dc4b4bb110950626b9fbef83df922bf22352c79180c14d501b361a4d3596c77e.png" width="16" height="16">
      </button>
    </div>

    <!-- 2) ID -->
    <div class="d-flex justify-content-between cursor-pointer select-filter"
         onclick="SearchForm.selectFilterDisplay('toggle', '.kind-filter', event)">
      <div class="d-flex align-items-center">
        <div style="width: 26px">
          <img height="26" src="/assets/filter_id_icon-3c1ad1eec97bd24fe241390d3a3c11503c738c365eb3f14f8a252d76aae8f40c.png">
        </div>
        <span class="ml-3">ID</span>
      </div>
      <div class="select-filter-right">
        <span class="number count-filter position-static d-none">0</span>
        <img class="chev-right" src="/assets/chevron-right-0ae2a8cc58a24b9ea3286c80105ef9a4fabba557bf4f12d0133f323ae153aa43.svg" width="26" height="26">
      </div>
    </div>

    <!-- 3) 作成日 -->
    <div class="d-flex justify-content-between cursor-pointer select-filter"
         onclick="SearchForm.selectFilterDisplay('toggle', '.created-at-filter', event)">
      <div class="d-flex align-items-center">
        <div style="width: 26px">
          <img height="26" src="/assets/created_at_filter-0cc9bb5b39bc6ff1e9969f0ba51071484f6bca7f3ddcba577c434b95ce92e7e1.png">
        </div>
        <span class="ml-3">作成日</span>
      </div>
      <div class="select-filter-right">
        <span class="number count-filter position-static d-none">0</span>
        <img class="chev-right" src="/assets/chevron-right-0ae2a8cc58a24b9ea3286c80105ef9a4fabba557bf4f12d0133f323ae153aa43.svg" width="26" height="26">
      </div>
    </div>

    <!-- 3) 更新日 -->
    <div class="d-flex justify-content-between cursor-pointer select-filter"
         onclick="SearchForm.selectFilterDisplay('toggle', '.created-at-filter', event)">
      <div class="d-flex align-items-center">
        <div style="width: 26px">
          <img height="26" src="/assets/created_at_filter-0cc9bb5b39bc6ff1e9969f0ba51071484f6bca7f3ddcba577c434b95ce92e7e1.png">
        </div>
        <span class="ml-3">更新日（ダミー）</span>
      </div>
      <div class="select-filter-right">
        <span class="number count-filter position-static d-none">0</span>
        <img class="chev-right" src="/assets/chevron-right-0ae2a8cc58a24b9ea3286c80105ef9a4fabba557bf4f12d0133f323ae153aa43.svg" width="26" height="26">
      </div>
    </div>

    <!-- 4) メンバー -->
    <div class="d-flex justify-content-between cursor-pointer select-filter"
         onclick="SearchForm.selectFilterDisplay('toggle', '.created-by-filter', event)">
      <div class="d-flex align-items-center">
        <div style="width: 26px">
          <img height="26" src="/assets/filter_created_by_icon-019cb15154edce2144d3713909787e07d7684f25b1899012e3a40447535239f5.png">
        </div>
        <span class="ml-3">メンバー</span>
      </div>
      <div class="select-filter-right">
        <span class="number count-filter position-static d-none">0</span>
        <img class="chev-right" src="/assets/chevron-right-0ae2a8cc58a24b9ea3286c80105ef9a4fabba557bf4f12d0133f323ae153aa43.svg" width="26" height="26">
      </div>
    </div>

    <!-- 5) ステータス -->
    <div class="d-flex justify-content-between cursor-pointer select-filter"
         onclick="SearchForm.selectFilterDisplay('toggle', '.status-filter', event)">
      <div class="d-flex align-items-center">
        <div style="width: 26px">
          <img height="26" src="/assets/project_menu/icon_status-de67fbdf7730bfd601b5b0d314e5059889d11e6271280da8e6e55460ff66ec8e.svg">
        </div>
        <span class="ml-3">ステータス</span>
      </div>
      <div class="select-filter-right">
        <span class="number count-filter position-static d-none">0</span>
        <img class="chev-right" src="/assets/chevron-right-0ae2a8cc58a24b9ea3286c80105ef9a4fabba557bf4f12d0133f323ae153aa43.svg" width="26" height="26">
      </div>
    </div>

    <!-- 6) 件数（同モーダル内に統合：他と同じ行デザイン） -->
    <div class="d-flex justify-content-between cursor-pointer select-filter select-filter-eachpage"
         onclick="SearchForm.selectFilterDisplay('toggle', '.filter-content-number-record', event)">

      <div class="d-flex align-items-center">
        <div style="width: 26px"></div>
        <span class="ml-3 filter-eachpage-title">件数</span>
      </div>

      <div class="select-filter-right"></div>
    </div>

  </div>
</div>
`.trim();

  function applyFilterHtmlOnce() {
    const td = document.querySelector('td.td-filter-box');
    if (!td) return false;

    // すでに適用済みなら何もしない（重くしない）
    if (td.getAttribute(FLAG_ATTR) === '1') return false;

    td.innerHTML = FILTER_HTML;
    td.setAttribute(FLAG_ATTR, '1');
    return true;
  }

  // 初回
  applyFilterHtmlOnce();

  // URL変化時のみ再適用（必要なときだけ）
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      setTimeout(() => {
        applyFilterHtmlOnce();
      }, 50);
    }
  }, RECHECK_MS);

  console.log('[TM] filter html injected:', location.href);
})();
