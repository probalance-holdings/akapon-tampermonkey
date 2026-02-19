// ==UserScript==
// @name         16｜アカポン（ファイル｜並び替え・検索＆絞り込み）※akapon-file-hide-Sort-buttons_html_css.user.js
// @namespace    akapon
// @version      0.0.1
// @description  file page sort area custom base script (HTML/CSS control placeholder)
// @author       akapon
// @match        https://member.createcloud.jp/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-file-hide-Sort-buttons_html_css.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-file-hide-Sort-buttons_html_css.user.js
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';
  /* =========================================================
     NOTE（重要）: ファイルページの「並び順」(#sortBox) を Tampermonkey 側で上書きするスクリプト

     ✅ 期限日（ソートキー確定）
       - sort_by[due_date] の asc/desc がHTML内に存在するため
         #sortBox に「期限日（古い順/新しい順）」を追加可能

     ❌ 容量（ソートキー未確定）
       - 列ヘッダは <th class="th_size ...">「容量」だが
         sort_by[file_size] / sort_by[size] 等の asc/desc がHTML内に存在せず
         現在URLにも sort_by が付与されないため、Tampermonkey側ではキー確定できない
       - 対応方針：
         1) サーバ側 or 既存JS側で「容量ソート」のパラメータ（sort_by[XXXXX]）を実装/露出させる
         2) そのキー名（XXXXX）が分かり次第、#sortBox に
            「容量（多い順/少ない順）」= desc/asc のリンクを追加する

     ❌ 作成日（ソートキー未確定：1回調査して無し）
       - sort_by[created_at]=asc/desc がHTML内に存在しない（sort_byキー一覧にも出ない）
       - さらに、この一覧ページDOMには作成日そのものの値が無い
         （consoleで「日付候補」「created系data属性」を検索しても0件）
       - そのため Tampermonkey / console だけで「作成日」を特定・ソートするのは不可
       - 現状の「作成日（ダミー）」は updated_at を流用している状態
         （モーダル内リンクも updated_at と同一）
       - 対応方針：
         サーバ側 or 既存JS側で sort_by[created_at]（または正式キー名）を実装/露出させる
         → キーが確定したら #sortBox の「作成日」リンクを差し替える

     ■ 追加要望（検索・絞り込みUI）
     検索・絞り込み実行後、下記の2点を満たす必要がある。

     1) 「検索・絞り込み」ボタン右側に、選択中件数（1以上）を表示すること
        - 0 の場合は非表示（0が一瞬表示される問題は別途対策済み/要対策）

     2) 「検索・絞り込み」親モーダル内の各項目右側に、各フィルターの選択数を表示すること
        - 例：ID / メンバー / ステータス / 作成日 / 更新日 など
        - 0 の場合は非表示、1以上の場合のみ表示

     🔎 調査メモ
       - 容量ヘッダ: th.th_size
       - 容量セルは span に "0.0B" 等が表示されるが、現状ソート用hrefが存在しない

     =========================================================
     【期限日／更新日フィルター｜エンジニア対応メモ（ファイルページ）】

     ■ 現象
     期限日（due_date）および 更新日（updated_at）の input に
     class="js-datepicker-pc date" は付与されているが、
     カレンダー（qs-datepicker）が開かないケースがある。

     ■ 状況
     プロジェクトページ側で発生している更新日と同様の挙動。
     class指定は正しく付与されているが、クリックしても datepicker が表示されない。

     ■ 原因候補（最有力）
     既存の datepicker 初期化処理が「id 指定」で行われている可能性が高い。
     （例：#q_created_at_gteq / #q_created_at_lteq など）

     → updated_at / due_date 側に id が無い場合、
       初期化対象から漏れてカレンダーが開かない可能性。

     ■ 対応方針（HTML側の最小修正案）

       ▼ 更新日（updated_at）
         - name="q[updated_at_gteq]" → id="q_updated_at_gteq"
         - name="q[updated_at_lteq]" → id="q_updated_at_lteq"

       ▼ 期限日（due_date）
         - name="q[due_date_gteq]" → id="q_due_date_gteq"
         - name="q[due_date_lteq]" → id="q_due_date_lteq"

     ■ 追記例（期限日）
     <input class="js-datepicker-pc date" ... name="q[due_date_gteq]" id="q_due_date_gteq">
     <input class="js-datepicker-pc date" ... name="q[due_date_lteq]" id="q_due_date_lteq">

     ※このTampermonkeyスクリプト側では「見た目」や「既存JS」には触らず、
       上記 id 付与のみで datepicker 初期化ルートに乗せる想定。
     ========================================================= */

  function shouldApply() {
    const path = location.pathname || '';
    if (path.startsWith('/akaire_file/')) return true;
    if (path.startsWith('/akaire_feature/akaire_files/')) return true;
    return false;
  }

function injectCss() {
  const styleId = 'tm-akapon-file-sort-style';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.type = 'text/css';

  style.textContent = `
/* =========================================================
   TM: 並び替え｜選択状態グレー背景を無効化（共通）
   - 既存CSSの .slted / .pcs-slted の background:#ececec が
     「ID」などのグレー枠に見える原因のため、透明に上書き
   ========================================================= */
.search-pc .sort_box_text .sort_list .slted,
.search-pc .sort_box_text .sort_list .pcs-slted,
.search-pc .slted {
  background: transparent !important;
  box-shadow: none !important;
  outline: none !important;
  border-color: transparent !important;
}

/* =========================================================
   期限日フィルター：更新日と同じデザインを適用（ファイル側のみ）
   - 期限日のHTMLはこのファイルscript内でのみ生成されるため、ここでCSSを当てる
   ========================================================= */
.filter-content.dropdown-new-stype input[name="q[due_date_gteq]"],
.filter-content.dropdown-new-stype input[name="q[due_date_lteq]"]{
  width: 220px !important;
  max-width: 220px !important;

  height: 42px !important;
  padding: 10px 12px !important;
  border-radius: 12px !important;

  background: #fff !important;
  color: #111 !important;

  border: 1px solid rgba(0,0,0,.12) !important;
  box-shadow: 0 8px 20px rgba(0,0,0,.22) !important;

  font-weight: 700 !important;
  letter-spacing: .02em !important;

  outline: none !important;
}

.filter-content.dropdown-new-stype input[name="q[due_date_gteq]"][readonly],
.filter-content.dropdown-new-stype input[name="q[due_date_lteq]"][readonly]{
  cursor: pointer !important;
}

/* =========================================================
   body直下に生成される qs-datepicker 用（期限日対策）
   ※作成日など既存挙動は壊さない（グローバルに見た目だけ揃える）
   ========================================================= */
body > .qs-datepicker-container{
  z-index: 1000000 !important;
}

body > .qs-datepicker-container .qs-datepicker{
  border: none !important;
  border-radius: 14px !important;
  overflow: hidden !important;
  box-shadow: 0 16px 38px rgba(0,0,0,.28) !important;
  background: #fff !important;
}

`.trim();

  (document.head || document.documentElement).appendChild(style);
}

  /* =========================================================
     TM: 検索・絞り込み（ファイルのみ）
     - project側が生成したモーダルを「上書き」しない
     - 既存の ID / メンバー / ステータス / 件数 を維持したまま
       「更新日（ダミー）」の後に「期限日」を“追加”する
     ========================================================= */
  function bindFilterAppendDeadlineForFilePage() {
    const FLAG_ATTR = 'data-tm-file-deadline-added';

    function appendIfReady() {
      const common = document.querySelector('.filter-content.filter-common-all');
      if (!common) return;

      if (common.getAttribute(FLAG_ATTR) === '1') return;

      // すでに期限日が存在するなら終了
      const already = [...common.querySelectorAll('.select-filter')].some(el =>
        (el.textContent || '').includes('期限日')
      );
      if (already) {
        common.setAttribute(FLAG_ATTR, '1');
        return;
      }

      // 「更新日（ダミー）」行を探す（テキストマッチ）
      const updateRow = [...common.querySelectorAll('.select-filter')]
        .find(el => (el.textContent || '').includes('更新日'));

      if (!updateRow) return;

      // 期限日 行を作る（既存行と同じ右側UI構造を踏襲）
      const deadlineRow = document.createElement('div');
      deadlineRow.className = 'd-flex justify-content-between cursor-pointer select-filter';
      deadlineRow.setAttribute(
        'onclick',
        "SearchForm.selectFilterDisplay('toggle', '.due-date-filter', event)"
      );

      deadlineRow.innerHTML = `
  <div class="d-flex align-items-center">
    <div style="width: 26px">
      <img height="26" src="/assets/created_at_filter-0cc9bb5b39bc6ff1e9969f0ba51071484f6bca7f3ddcba577c434b95ce92e7e1.png">
    </div>
    <span class="ml-3">期限日</span>
  </div>
  <div class="select-filter-right">
    <span class="number count-filter position-static d-none">0</span>
    <img class="chev-right" src="/assets/chevron-right-0ae2a8cc58a24b9ea3286c80105ef9a4fabba557bf4f12d0133f323ae153aa43.svg" width="26" height="26">
  </div>
`.trim();

      updateRow.after(deadlineRow);

      // 期限日モーダル本体が無ければ追加
      if (!document.querySelector('.filter-content.due-date-filter')) {
        const modal = document.createElement('div');
        modal.className = 'filter-content dropdown-new-stype due-date-filter d-none';

        modal.innerHTML = `
<div class="dropdown-header d-flex justify-content-between">
  <div class="d-flex align-items-center cursor-pointer"
       onclick="SearchForm.selectFilterDisplay('toggle', '.filter-common-all', event)">
    期限日
  </div>
  <div class="d-flex">
    <button type="button" class="reset-data" onclick="SearchForm.resetDataSearch(this)">クリア</button>&nbsp;&nbsp;&nbsp;
    <button type="submit" class="quick-submit">完了</button>
  </div>
</div>

<div class="dropdown-body search text-center">
  <div class="group-input d-flex" style="position: relative;">
    <label class="m-auto">期限日（以降）</label>
    <input class="js-datepicker-pc date" autocomplete="off"
           onchange="SearchForm.filterCount('input', this)"
           type="text" name="q[due_date_gteq]">
  </div>

  <div class="group-input d-flex mt-2" style="position: relative;">
    <label class="m-auto">期限日（以前）</label>
    <input class="js-datepicker-pc date" autocomplete="off"
           onchange="SearchForm.filterCount('input', this)"
           type="text" name="q[due_date_lteq]">
  </div>
</div>
`.trim();

        // filter-common-all の直後に差し込む（既存構造を崩さない）
        common.after(modal);
      }

      common.setAttribute(FLAG_ATTR, '1');
    }

    // document-start 対策（遅延描画を待つ）
    setInterval(appendIfReady, 500);
  }

  function bindSortBoxOverrideForFilePage() {
    // ファイルページだけで「並び順」UI（#sortBox）を上書きする
    // ※プロジェクト側script/HTMLには一切触れない

    const getBasePath = () => {
      const p = location.pathname || '';
      if (p.startsWith('/akaire_feature/akaire_files/')) return '/akaire_feature/akaire_files/';
      return '/akaire_file/'; // デフォルト
    };

    const buildSortBoxHtml = () => {
      const base = getBasePath();

      return `
<div class="sort_box" id="sortBox" data-show-notify="false">
  <div class="sort_box_title d-flex justify-content-between align-items-center cursor-pointer font-weight-bold">
    <div>並び順</div>
  </div>

  <div class="sort_box_text">
    <ul class="sort_list">

      <li class="li-sort-item" onclick="$(this).toggleClass('active')">
        <div class="sort_item">ID</div>
        <ul>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option">
            <a class="customize-sort-name-default" href="${base}?sort_by%5Bid%5D=asc">新しい順</a>
          </li>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option">
            <a class="customize-sort-name-default" href="${base}?sort_by%5Bid%5D=desc">古い順</a>
          </li>
        </ul>
      </li>

      <li class="li-sort-item" onclick="$(this).toggleClass('active')">
        <div class="sort_item">作成日（ダミー）</div>
        <ul>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option">
            <a class="customize-sort-name-default" href="${base}?sort_by%5Bupdated_at%5D=asc">古い順</a>
          </li>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option">
            <a class="customize-sort-name-default" href="${base}?sort_by%5Bupdated_at%5D=desc">新しい順</a>
          </li>
        </ul>
      </li>

      <li class="li-sort-item" onclick="$(this).toggleClass('active')">
        <div class="sort_item">更新日</div>
        <ul>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option">
            <a class="customize-sort-name-default" href="${base}?sort_by%5Bupdated_at%5D=asc">古い順</a>
          </li>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option">
            <a class="customize-sort-name-default" href="${base}?sort_by%5Bupdated_at%5D=desc">新しい順</a>
          </li>
        </ul>
      </li>

      <li class="li-sort-item" onclick="$(this).toggleClass('active')">
        <div class="sort_item">期限日</div>
        <ul>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option">
            <a class="customize-sort-name-default" href="${base}?sort_by%5Bdue_date%5D=asc">古い順</a>
          </li>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option">
            <a class="customize-sort-name-default" href="${base}?sort_by%5Bdue_date%5D=desc">新しい順</a>
          </li>
        </ul>
      </li>

      <li class="li-sort-item" onclick="$(this).toggleClass('active')">
        <div class="sort_item">容量</div>
        <ul>
          <li onclick="return false;" class="sort-option tm-sort-disabled">
            <a class="customize-sort-name-default" href="javascript:void(0)">多い順</a>
          </li>
          <li onclick="return false;" class="sort-option tm-sort-disabled">
            <a class="customize-sort-name-default" href="javascript:void(0)">少ない順</a>
          </li>
        </ul>
      </li>

      <li class="li-sort-item" onclick="$(this).toggleClass('active')">
        <div class="sort_item">ステータス</div>
        <ul>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option">
            <a class="customize-sort-name-default" href="${base}?sort_by%5Bstatus%5D=asc">昇順</a>
          </li>
          <li onclick="Visiable.toggle('#sortBox')" class="sort-option">
            <a class="customize-sort-name-default" href="${base}?sort_by%5Bstatus%5D=desc">降順</a>
          </li>
        </ul>
      </li>

    </ul>
  </div>
</div>
`.trim();
    };

    const overrideIfNeeded = () => {
      const box = document.querySelector('#sortBox');
      if (!box) return;

      // ファイルページなのに /projects が混ざっている状態を「差し替え対象」とみなす
      const hasProjectsHref = !!box.querySelector('a[href^="/projects"]');
      if (!hasProjectsHref) return;

      const isHidden = box.classList.contains('d-none');

      const wrapper = document.createElement('div');
      wrapper.innerHTML = buildSortBoxHtml();
      const newBox = wrapper.firstElementChild;

      if (isHidden) newBox.classList.add('d-none');

      box.replaceWith(newBox);
    };

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.border-new.sort[onclick*="SearchForm.selectSortDisplay"]');
      if (!btn) return;
      setTimeout(overrideIfNeeded, 0);
    }, true);

    setTimeout(overrideIfNeeded, 0);
  }

  function init() {
    if (!shouldApply()) return;
    injectCss();
    bindSortBoxOverrideForFilePage();
    bindFilterAppendDeadlineForFilePage();
  }

  init();

})();
