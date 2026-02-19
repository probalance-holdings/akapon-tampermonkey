// ==UserScript==
// @name         6｜アカポン（プロジェクト｜検索・絞り込み-HTML）※akapon-project-hide-filter-search_html.user.js
// @namespace    akapon
// @version      1.0
// @match        https://member.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-filter-search_html.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-filter-search_html.user.js
// ==/UserScript==

(() => {
  const FLAG_ATTR = 'data-tm-filter-html-applied';
  const RECHECK_MS = 500;

  /* =========================================================
     【更新日フィルター｜エンジニア対応メモ】

     ■ 現象
     更新日（updated_at）の input は class="js-datepicker-pc date" が付いているのに
     カレンダー（qs-datepicker）が開かないケースがある。

     ■ 原因候補（最有力）
     既存の datepicker 初期化が「id 指定」で行われている可能性が高い。
     （例：#q_created_at_gteq / #q_created_at_lteq など）
     → updated_at 側に id が無いと初期化対象から漏れて、クリックしても開かない。

     ■ 対応方針（HTML側の最小修正）
     updated_at の2つの input に id を付与する。

       - name="q[updated_at_gteq]" には id="q_updated_at_gteq"
       - name="q[updated_at_lteq]" には id="q_updated_at_lteq"

     ■ 追記例（参考：FILTER_HTML 内の更新日モーダル）
     <input class="js-datepicker-pc date" ... name="q[updated_at_gteq]" id="q_updated_at_gteq">
     <input class="js-datepicker-pc date" ... name="q[updated_at_lteq]" id="q_updated_at_lteq">

     ※このHTMLスクリプト側では「見た目」や「既存JS」には触らず、
       上記 id 付与のみで datepicker 初期化ルートに乗せる想定。

     ■ 追加要望（検索・絞り込みUI）
     検索・絞り込み実行後、下記の2点を満たす必要がある。

     1) 「検索・絞り込み」ボタン右側に、選択中件数（1以上）を表示すること
        - 0 の場合は非表示（0が一瞬表示される問題は別途対策済み/要対策）

     2) 「検索・絞り込み」親モーダル内の各項目右側に、各フィルターの選択数を表示すること
        - 例：ID / メンバー / ステータス / 作成日 / 更新日 など
        - 0 の場合は非表示、1以上の場合のみ表示
   ========================================================= */

  const FILTER_HTML = `

<!-- フィルターボタン -->
<div class="border-new filter-btn d-flex cursor-pointer mr-1 position-relative"
     onclick="SearchForm.selectFilterDisplay('toggle', '.filter-common-all', event)">
  <span class="filter-btn-label">検索・絞り込み</span>
  <span class="number">0</span>
</div>

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

    <!-- 文字検索 -->
    <div class="d-flex search-input">
      <input class="form-control" placeholder="検索するテキストを入力"
             onchange="SearchForm.filterCount('input', this)"
             type="text" name="q[name_or_creator_name_or_company_name_cont]">
    </div>

    <!-- ID -->
    <div class="d-flex justify-content-between cursor-pointer select-filter"
         onclick="SearchForm.selectFilterDisplay('toggle', '.kind-filter', event)">
      <div class="d-flex align-items-center">
        <div style="width: 26px">
          <img height="26" src="/assets/filter_id_icon-3c1ad1eec97bd24fe241390d3a3c11503c738c365eb3f14f8a252d76aae8f40c.png">
        </div>
        <span class="ml-3">ID</span>
      </div>
      <div class="select-filter-right"></div>
    </div>

    <!-- 作成日 -->
    <div class="d-flex justify-content-between cursor-pointer select-filter"
         onclick="SearchForm.selectFilterDisplay('toggle', '.created-at-filter', event)">
      <div class="d-flex align-items-center">
        <div style="width: 26px">
          <img height="26" src="/assets/created_at_filter-0cc9bb5b39bc6ff1e9969f0ba51071484f6bca7f3ddcba577c434b95ce92e7e1.png">
        </div>
        <span class="ml-3">作成日</span>
      </div>
      <div class="select-filter-right"></div>
    </div>

    <!-- 更新日 -->
    <div class="d-flex justify-content-between cursor-pointer select-filter"
         onclick="SearchForm.selectFilterDisplay('toggle', '.updated-at-filter', event)">
      <div class="d-flex align-items-center">
        <div style="width: 26px">
          <img height="26" src="/assets/created_at_filter-0cc9bb5b39bc6ff1e9969f0ba51071484f6bca7f3ddcba577c434b95ce92e7e1.png">
        </div>
        <span class="ml-3">更新日</span>
      </div>
      <div class="select-filter-right"></div>
    </div>

    <!-- メンバー -->
    <div class="d-flex justify-content-between cursor-pointer select-filter"
         onclick="SearchForm.selectFilterDisplay('toggle', '.created-by-filter', event)">
      <div class="d-flex align-items-center">
        <div style="width: 26px">
          <img height="26" src="/assets/filter_created_by_icon-019cb15154edce2144d3713909787e07d7684f25b1899012e3a40447535239f5.png">
        </div>
        <span class="ml-3">メンバー</span>
      </div>
      <div class="select-filter-right"></div>
    </div>

    <!-- ステータス -->
    <div class="d-flex justify-content-between cursor-pointer select-filter"
         onclick="SearchForm.selectFilterDisplay('toggle', '.status-filter', event)">
      <div class="d-flex align-items-center">
        <div style="width: 26px">
          <img height="26" src="/assets/project_menu/icon_status-de67fbdf7730bfd601b5b0d314e5059889d11e6271280da8e6e55460ff66ec8e.svg">
        </div>
        <span class="ml-3">ステータス</span>
      </div>
      <div class="select-filter-right"></div>
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

<!-- 更新日モーダル本体 -->

<div class="filter-content dropdown-new-stype updated-at-filter d-none">
  <div class="dropdown-header d-flex justify-content-between">
    <div class="d-flex align-items-center cursor-pointer"
         onclick="SearchForm.selectFilterDisplay('toggle', '.filter-common-all', event)">
      <img src="/assets/chevron-left-d7745965927c383c6f574a59b3c97c418bb47745020aeaa73d727a6a95871fcf.svg" width="16" height="16">
      更新日
    </div>
    <div class="d-flex">
      <button type="button" class="reset-data" onclick="SearchForm.resetDataSearch(this)">クリア</button>&nbsp;&nbsp;&nbsp;
      <button type="submit" class="quick-submit">完了</button>
    </div>
  </div>

  <div class="dropdown-body search text-center">
    <div class="group-input d-flex" style="position: relative;">
      <label class="m-auto">更新日（以降）</label>
      <input class="js-datepicker-pc date" autocomplete="off"
             onchange="SearchForm.filterCount('input', this)"
             type="text" name="q[updated_at_gteq]" id="q_updated_at_gteq">
    </div>

    <div class="group-input d-flex mt-2" style="position: relative;">
      <label class="m-auto">更新日（以前）</label>
      <input class="js-datepicker-pc date" autocomplete="off"
             onchange="SearchForm.filterCount('input', this)"
             type="text" name="q[updated_at_lteq]" id="q_updated_at_gteq">
    </div>
  </div>
</div>
`.trim();

  function applyFilterHtmlOnce() {
    const td = document.querySelector('td.td-filter-box');
    if (!td) return false;
    if (td.getAttribute(FLAG_ATTR) === '1') return false;
    td.innerHTML = FILTER_HTML;
    td.setAttribute(FLAG_ATTR, '1');
    return true;
  }

  applyFilterHtmlOnce();

  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      setTimeout(() => {
        applyFilterHtmlOnce();
      }, 50);
    }
  }, RECHECK_MS);

})();
