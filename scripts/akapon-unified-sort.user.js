// ==UserScript==
// @name         アカポン（共通｜並び順）※akapon-unified-sort.user.js
// @namespace    akapon
// @version      2026.02.22.0001
// @match        https://member.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-unified-sort.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-unified-sort.user.js
// ==/UserScript==

(() => {
  'use strict';

/* =========================================================
   【エンジニア向けコメント置き場：並び順（ソート）統一UI】

   ■ 目的
   - 全ページの「並び順 UI」を /projects と同一デザイン・並びで統一する
   - ページごとの差は「どの項目を並び順として出すか」のみ（PAGE_CONFIG.sort にて制御）
   - SP DOM は使用せず、PC DOM を共通利用。SP はフォントサイズのみ調整して最適化

   ■ タスク / ファイルの特別ルール
   - 並び順内の「タスク名 / ファイル名」は常にステータスの直上に固定
   - 「期限」は「期限日（ダミー）」と名称統一（UI上の見た目だけ）
   - 実フィルタとしての期限日は検索・絞り込み側で実装（due_date）

   ■ ダミー項目について
   ※ 以下は検索・絞り込みと同様 UI ダミー：
     - 作成日（ダミー）
     - 期限日（ダミー）
     - 容量（ダミー）
   並び順では「表示順だけ提供し、機能はサーバー側で実装する前提」

   ■ ページ別：並び順項目
   ● チーム情報 /users
       ID / ステータス
   ● 外部情報 /collaborators
       ID / ステータス
   ● 会員一覧 /company_apply_campaigns
       ID / 登録日
   ● タスク /projects/:id/task
       タスク名（固定位置） / ステータス / 期限日（ダミー）
   ● ファイル /akaire_file/.../project_akaire_files / task_akaire_files
       ファイル名（固定位置） / ステータス / 期限日（ダミー）

   ■ 注意
   - onclick や URL 生成処理（/projects?sort_by[...]）は既存ロジックそのまま使用
   - DOM の移動は禁止（既存 SearchForm / Visiable.toggle の構造が壊れるため）
   - 並び順モーダル内のアイコン除去や「＋の右側縦線」統一はここで制御する

========================================================= */

/* =========================================================
【エンジニア向け対応依頼｜SP並び順の統一について】

■ 現状
・PC：#sortBox を使用（div.sort_box）
・SP：#modalSort（Bootstrap modal）を使用
・両者で DOM構造・制御ロジック が分岐している

そのため、
Userscript 側でPCとSPを完全統一することは
構造的に困難です。

---------------------------------------------------------

■ 要望（設計統一）

SPでも PCと同じ並び順構造を使用してください。

【統一仕様】

1. SPでも #sortBox を使用すること
   （#modalSort は廃止）

2. 並び順ボタンは以下構造に統一：

<div class="border-new sort d-flex justify-content-space-between align-items-center cursor-pointer mr-1"
     onclick="SearchForm.selectSortDisplay('toggle', event)">
  <span class="mr-1 text-ellipsis sort-text-display"
        style="max-width: 160px;">
    （現在の並び順）
  </span>
</div>

3. SearchForm 内で
   画面幅によるモーダル分岐を削除すること

   例：
   if (isSp) openModalSort();
   のような処理は削除

4. #sortBox を SPでも DOMに出力すること

---------------------------------------------------------

■ 理由

・SPとPCでDOM構造が異なるため
  JSでの完全統一が不可能
・保守性が低い
・UI挙動が不安定になる
・将来の改修時に再度崩れる

---------------------------------------------------------

■ 最終目標

PC/SPで並び順UI・DOM・ロジックを完全共通化すること。

========================================================= */

  // =========================================================
  // ページ別設定（sort項目だけ）
  // =========================================================
  const PAGE_CONFIG = {
    projects: { sort: ['id', 'created_at_dummy', 'updated_at_dummy', 'due_date_dummy', 'size_dummy', 'status'] },
    users: { sort: ['id', 'status'] },
    collaborators: { sort: ['id', 'status'] },
    company_apply_campaigns: { sort: ['id', 'registered_at'] },
    // task / file は projects と同じ
    tasks: { sort: ['id', 'created_at_dummy', 'updated_at_dummy', 'due_date_dummy', 'size_dummy', 'status'] },
    files: { sort: ['id', 'created_at_dummy', 'updated_at_dummy', 'due_date_dummy', 'size_dummy', 'status'] },
  };

  // =========================================================
  // ページ判定
  // =========================================================
  function getPageKey() {
    const p = location.pathname || '';

    // projects
    if (p === '/projects' || /^\/projects\/\d+\/task/.test(p)) return (p === '/projects') ? 'projects' : 'tasks';

    // files
    if (/^\/akaire_file\/\d+\/project_akaire_files/.test(p)) return 'files';
    if (/^\/akaire_file\/\d+\/task_akaire_files/.test(p)) return 'files';

    // users
    if (p === '/users' || p.startsWith('/users/')) return 'users';

    // collaborators
    if (p === '/collaborators' || p.startsWith('/collaborators/')) return 'collaborators';

    // company_apply_campaigns
    if (p === '/company_apply_campaigns' || p.startsWith('/company_apply_campaigns/')) return 'company_apply_campaigns';

    return null;
  }

  // =========================================================
  // CSS（projects見た目へ寄せる）
  // - 既存DOMのまま projects風に整える（#sortBox / #modalSort 両方）
  // =========================================================
  const STYLE_ID = 'akapon-unified-sort-style';
const CSS = `
/* =========================
   一覧ヘッダー行：+ / 並び順 / 検索・絞り込み / CSV のセルを共通レイアウトに
   （プロジェクト・タスク・ユーザー・ファイルなどで同じ位置に揃える）
========================= */
.search-pc table.search-list .td-sort-box,
.search-pc table.search-list .td-filter-box,
.search-pc table.search-list .td-csv-box{
  padding-left: 4px !important;
  padding-right: 4px !important;
  white-space: nowrap !important;
  width: auto !important;
}

/* =========================
   並び順ボタン（td内）: projects風
========================= */
td.td-sort-box .border-new.sort{
  background: #1f1f1f !important;
  color: #fff !important;
  border-radius: 12px !important;
  box-shadow: 0 6px 18px rgba(0,0,0,.22) !important;
  border: 1px solid #1f1f1f !important;
  padding: 8px 12px !important;
  justify-content: center !important;   /* ★中央寄せ */
  align-items: center !important;
  gap: 8px !important;                  /* ★アイコンと文字の間隔 */
}
td.td-sort-box .border-new.sort img{
  display: none !important;
}
td.td-sort-box .border-new.sort:hover{
  background: #3f3f3f !important;
  border-color: #3f3f3f !important;
  box-shadow: 0 8px 22px rgba(0,0,0,.26) !important;
}
td.td-sort-box .border-new.sort .sort-text-display{
  color: #fff !important;
  font-weight: 800 !important;
  display: block !important;
  width: 100% !important;
  text-align: center !important;
  margin: 0 !important;
  transform: translate(5px, 1px) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
td.td-sort-box .border-new.sort img,
td.td-sort-box .border-new.sort svg{
  display: none !important;
}
td.td-sort-box [onclick*="selectSortDisplay"] .sort-text-display{
  position: relative !important;
  top: -1px !important;
}

/* overflow切れ対策 */
td.td-sort-box,
table.search-list,
table.search-list *{
  overflow: visible !important;
}

/* =========================
   sortBox（PC想定）：中央モーダル化
========================= */
#sortBox.sort_box,
.sort_box#sortBox{
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  width: 86% !important;
  max-width: 420px !important;
  background: #fff !important;
  border-radius: 14px !important;
  overflow: hidden !important;
  box-shadow: 0 16px 38px rgba(0,0,0,.28) !important;
  z-index: 999999 !important;
  margin: 0 !important;
  border: none !important;
  bottom: auto !important;
  right: auto !important;
}
#sortBox.sort_box:not(.d-none){
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}
#sortBox.sort_box .sort_box_title{
  padding: 12px 14px !important;
  background: linear-gradient(90deg, #1e3c72, #555) !important;
  color: #fff !important;
  font-weight: 800 !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  border: none !important;
}
#sortBox.sort_box .sort_box_title *{ color:#fff !important; }
#sortBox.sort_box .sort_box_text{
  padding: 10px 12px 10px !important;
  background: #fff !important;
  max-height: 70vh !important;
  overflow: auto !important;
}

/* list reset */
#sortBox.sort_box ul,
#sortBox.sort_box li{
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* ✅ ❸ 「＋ / −」を出している ::before を潰す（PC/SP両対応） */
#sortBox.sort_box .sort_item::before,
#modalSort .sort_item::before,
.search-pc .sort_box_text .sort_list .sort_item::before{
  content: "" !important;
  display: none !important;
}

#sortBox.sort_box li::marker,
#sortBox.sort_box li::before{
  content: none !important;
}

/* 行デザイン（projects） */
#sortBox.sort_box .li-sort-item{
  border-bottom: 1px solid #eee !important;
  padding: 10px 14px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 10px !important;
}
#sortBox.sort_box .li-sort-item:last-child{
  border-bottom: none !important;
}
#sortBox.sort_box .sort_item{
  font-weight: 800 !important;
  color: #222 !important;
  white-space: nowrap !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  text-indent: 0 !important;
  padding-left: 0 !important;
  font-size: 0.95em !important;
}

/* 右側ボタン群 */
#sortBox.sort_box .li-sort-item > ul{
  display: inline-flex !important;
  align-items: center !important;
  gap: 10px !important;
  margin: 0 !important;
  padding: 0 !important;
}
#sortBox.sort_box .li-sort-item > ul > li.sort-option{
  display: inline-flex !important;
  position: relative !important;
}
#sortBox.sort_box .li-sort-item > ul > li.sort-option a{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 6px 12px !important;
  line-height: 1.2 !important;
  font-size: 13px !important;
  border-radius: 10px !important;
  border: 1px solid #ddd !important;
  background: #f7f7f7 !important;
  color: #222 !important;
  font-weight: 800 !important;
  text-decoration: none !important;
  white-space: nowrap !important;
  transition: background-color .15s ease, border-color .15s ease, color .15s ease !important;
}
#sortBox.sort_box .li-sort-item > ul > li.sort-option a:hover{
  background: #e9eefc !important;
  border-color: #1e3c72 !important;
  color: #1e3c72 !important;
}
#sortBox.sort_box .li-sort-item > ul > li.sort-option.slted a,
#sortBox.sort_box .li-sort-item > ul > li.sort-option.pcs-slted a{
  background: #eef3ff !important;
  border-color: #1e3c72 !important;
  color: #1e3c72 !important;
  box-shadow: 0 0 0 2px rgba(30, 60, 114, .15) !important;
}
#sortBox.sort_box .li-sort-item > ul > li.sort-option.slted::after,
#sortBox.sort_box .li-sort-item > ul > li.sort-option.pcs-slted::after{
  content: "✓" !important;
  position: absolute !important;
  right: -8px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 18px !important;
  height: 18px !important;
  border-radius: 999px !important;
  background: #1e3c72 !important;
  color: #fff !important;
  font-weight: 900 !important;
  font-size: 12px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* ダミー行 */
#sortBox .tm-dummy-sort-item{
  opacity: .6 !important;
  pointer-events: none !important;
}

/* ✅ ダミー行はアニメ/transitionを完全停止（視覚的に動かない） */
#sortBox .tm-dummy-sort-item,
#sortBox .tm-dummy-sort-item *{
  transition: none !important;
}

/* 一覧ヘッダーの＋ボタンの縦位置を統一（projects / task / users 等） */
.search-pc .btn.btn-create.plus.plus-icon{
  margin-top: 1px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* =========================
   SP：#modalSort を projects見た目に寄せつつ文字だけ小さく
========================= */
#modalSort .modal-content{
  border-radius: 14px !important;
  overflow: hidden !important;
  border: none !important;
  box-shadow: 0 16px 38px rgba(0,0,0,.28) !important;
}
#modalSort .modal-header{
  padding: 12px 14px !important;
  background: linear-gradient(90deg, #1e3c72, #555) !important;
  color: #fff !important;
  font-weight: 800 !important;
  border: none !important;
}
#modalSort .modal-header *{ color:#fff !important; }
#modalSort .modal-body.search{
  padding: 10px 12px 10px !important;
  background: #fff !important;
  max-height: 70vh !important;
  overflow: auto !important;
}
@media (max-width: 991px){
  #modalSort .modal-header,
  #modalSort .modal-header *{
    font-size: 14px !important;
    line-height: 1.2 !important;
  }
  #modalSort .sort_item{
    font-size: 13px !important;
    line-height: 1.2 !important;
  }
  #modalSort .li-sort-item > ul > li.sort-option a{
    font-size: 12px !important;
    padding: 5px 10px !important;
  }
  #modalSort .li-sort-item > ul > li.sort-option.slted::after,
  #modalSort .li-sort-item > ul > li.sort-option.pcs-slted::after{
    width: 16px !important;
    height: 16px !important;
    font-size: 11px !important;
    right: -6px !important;
  }
}


`.trim();

  function injectCssOnce() {
    let s = document.getElementById(STYLE_ID);
    if (!s) {
      s = document.createElement('style');
      s.id = STYLE_ID;
      document.head.appendChild(s);
    }
    if (s.textContent !== CSS) s.textContent = CSS;
  }

  // =========================================================
  // 既存sort項目を特定して「キー」に正規化
  // ※ページごとにDOM/hrefが違うので、label/href両方で雑に寄せる
  // =========================================================
  function normalizeText(t) {
    return (t || '').replace(/\s+/g, ' ').trim();
  }

  function detectSortKey(li) {
    const labelEl = li.querySelector('.sort_item');
    const label = normalizeText(labelEl ? labelEl.textContent : '');

    // label優先
    if (/^ID$/i.test(label) || label === 'ID') return 'id';
    if (label.includes('作成')) return 'created_at';
    if (label.includes('更新')) return 'updated_at';
    if (label.includes('期限') || label.includes('締切') || label.includes('予定')) return 'due_date';
    if (label.includes('容量') || label.includes('サイズ')) return 'size';
    if (label.includes('ステータス') || /^status$/i.test(label) || label === 'Status') return 'status';
    if (label.includes('登録') || label.includes('登録日')) return 'registered_at';
    if (label.includes('アカウント') || label.includes('アカウント名')) return 'account_name';

    // href補助
    const a = li.querySelector('a[href]');
    const href = a ? (a.getAttribute('href') || '') : '';
    if (/sort_by%5Bid%5D=/.test(href)) return 'id';
    if (/sort_by%5Bstatus%5D=/.test(href)) return 'status';
    if (/sort_by%5Bupdated_at%5D=/.test(href)) return 'updated_at';
    if (/sort_by%5Bcreated_at%5D=/.test(href)) return 'created_at';

    return null;
  }

function findSortRootPreferPc() {

  // PC側のみ使用（SPでも強制使用）
  const pc = document.querySelector('#sortBox.sort_box, .sort_box#sortBox, td.td-sort-box #sortBox');
  if (pc) return pc;

  // ★ SPの #modalSort は使わない
  return null;
}

  function getSortList(root) {
    if (!root) return null;

    // sortBox
    const ul1 = root.querySelector('.sort_list');
    if (ul1) return ul1;

    // #modalSort 側（内部に sort_list がいる想定）
    const ul2 = root.querySelector('.sort_list');
    if (ul2) return ul2;

    return null;
  }

  // =========================================================
  // ダミー行（存在しない場合だけ追加）
  // =========================================================
  function ensureDummyRow(ul, label, key, buttonTexts) {
    // 既にダミーがあればそれを返す
    const exist = Array.from(ul.querySelectorAll(':scope > li.li-sort-item')).find(li => li.dataset.tmSortKey === key);
    if (exist) return exist;

    const li = document.createElement('li');
    li.className = 'li-sort-item tm-dummy-sort-item';
    li.dataset.tmSortKey = key;

    const left = document.createElement('div');
    left.className = 'sort_item';
    left.textContent = `${label}（ダミー）`;

    const right = document.createElement('ul');
    (buttonTexts || []).forEach(t => {
      const opt = document.createElement('li');
      opt.className = 'sort-option';
      const a = document.createElement('a');
      a.className = 'customize-sort-name-default';
      a.href = 'javascript:void(0)';
      a.textContent = t;
      opt.appendChild(a);
      right.appendChild(opt);
    });

    li.appendChild(left);
    li.appendChild(right);

    ul.appendChild(li);
    return li;
  }

  // =========================================================
  // 表示制御：PAGE_CONFIGに合わせて「表示するliだけ残す（他は非表示）」
  // + 指定順に並べ直す（存在するものだけ）
  // =========================================================
function applySortByConfig(pageKey) {
  const cfg = PAGE_CONFIG[pageKey];
  if (!cfg || !Array.isArray(cfg.sort)) return;

  const root = findSortRootPreferPc();
  const ul = getSortList(root);
  if (!ul) return;

  // ✅ ❷ 同じ構成を既に適用済みなら、並べ替えをやらない（チラつき/動き防止）
  const sig = `${pageKey}::${cfg.sort.join(',')}`;
  if (ul.dataset.tmSortAppliedSig === sig) {
    return;
  }

  // 既存行をキー付け
  const items = Array.from(ul.querySelectorAll(':scope > li.li-sort-item'));
  items.forEach(li => {
      if (!li.dataset.tmSortKey) {
        const key = detectSortKey(li);
        if (key) li.dataset.tmSortKey = key;

        // Status表記ゆれは見た目だけ統一
        const labelEl = li.querySelector('.sort_item');
        if (labelEl) {
          const txt = normalizeText(labelEl.textContent);
          if (txt === 'Status' || /^status$/i.test(txt)) labelEl.textContent = 'ステータス';
        }
      }
    });

    // ダミー（必要なページだけ）
    if (cfg.sort.includes('created_at_dummy')) {
      ensureDummyRow(ul, '作成日', 'created_at_dummy', ['新しい順', '古い順']);
    }
    if (cfg.sort.includes('due_date_dummy')) {
      ensureDummyRow(ul, '期限日', 'due_date_dummy', ['新しい順', '古い順']);
    }
    if (cfg.sort.includes('size_dummy')) {
      ensureDummyRow(ul, '容量', 'size_dummy', ['多い順', '少ない順']);
    }
    if (cfg.sort.includes('updated_at_dummy')) {
      ensureDummyRow(ul, '更新日', 'updated_at_dummy', ['新しい順', '古い順']);
  // ✅ ❷ 適用済みマーク
  ul.dataset.tmSortAppliedSig = sig;
}

// いったん全行を「許可されたキー以外は非表示」
// ただし、プロジェクト名 / カスタイマイズ /（ダミー優先時の）更新 は DOM から削除
const allowed = new Set(cfg.sort);
Array.from(ul.querySelectorAll(':scope > li.li-sort-item')).forEach(li => {
  const key = li.dataset.tmSortKey || detectSortKey(li);
  if (key) li.dataset.tmSortKey = key;

  // ✅ ❶ 削除（存在していたらDOMから削除）
  // - プロジェクト名
  // - カスタイマイズ（表記揺れ含む）
  const labelEl = li.querySelector('.sort_item');
  const label = normalizeText(labelEl ? labelEl.textContent : '');
  const isProjectName = (label === 'プロジェクト名');
  const isCustomize = /カスタ/i.test(label) && /マイズ/.test(label);

  // customize UI がぶら下がってるケースも削除
  const hasCustomizeUi = !!li.querySelector('.create-customize-sort, .customize-sort-name, [id^="customize-sort-"]');

  if (isProjectName || isCustomize || hasCustomizeUi) {
    li.remove();
    return;
  }

  // ✅ ❶ 削除：projects設定で updated_at_dummy を使う時は「実物 updated_at」をDOMから削除
  if (allowed.has('updated_at_dummy') && key === 'updated_at') {
    li.remove();
    return;
  }

  li.style.display = (key && allowed.has(key)) ? '' : 'none';
});
  // ✅ ❹ ID の option を「新しい順 / 古い順」に統一＆順序も固定（desc→asc）
  const idLi = Array.from(ul.querySelectorAll(':scope > li.li-sort-item'))
    .find(li => (li.dataset.tmSortKey === 'id'));
  if (idLi) normalizeIdOptions(idLi);

  // 指定順に並べ替え（存在するものだけ）
  const map = new Map();
  Array.from(ul.querySelectorAll(':scope > li.li-sort-item')).forEach(li => {
    if (li.style.display === 'none') return;
    const key = li.dataset.tmSortKey;
    if (key) map.set(key, li);
  });

  const frag = document.createDocumentFragment();
  cfg.sort.forEach(k => {
    const li = map.get(k);
    if (li) frag.appendChild(li);
  });

  ul.appendChild(frag);

    ul.dataset.tmSortAppliedSig = `${pageKey}::${cfg.sort.join(',')}`;

    // ★表示テキスト補正
    normalizeSortDisplayLabel();
}

// ✅ ❹ 追加：ID option の文言と順序を統一
function normalizeIdOptions(idLi) {
  const opts = Array.from(idLi.querySelectorAll('li.sort-option'));
  if (opts.length < 2) return;

  const asc = opts.find(li => /sort_by%5Bid%5D=asc/.test(li.querySelector('a[href]')?.getAttribute('href') || ''));
  const desc = opts.find(li => /sort_by%5Bid%5D=desc/.test(li.querySelector('a[href]')?.getAttribute('href') || ''));

  // 文言統一
  if (asc) {
    const a = asc.querySelector('a');
    if (a) a.textContent = '古い順';
  }
  if (desc) {
    const a = desc.querySelector('a');
    if (a) a.textContent = '新しい順';
  }

  // 順序（新しい順→古い順）
  const ul = idLi.querySelector(':scope > ul');
  if (!ul) return;

  const frag = document.createDocumentFragment();
  if (desc) frag.appendChild(desc);
  if (asc) frag.appendChild(asc);
  ul.appendChild(frag);
}

// =========================
// 並び順ボタンの表示文言を補正
// =========================
function normalizeSortDisplayLabel() {
  const display = document.querySelector('.sort-text-display');
  if (!display) return;

  let txt = display.textContent || '';

  // Status → ステータス
  txt = txt.replace(/^Status\b/i, 'ステータス');

  // 昇順/降順 → 古い順/新しい順
  txt = txt.replace('昇順', '古い順');
  txt = txt.replace('降順', '新しい順');

  // 半角カッコ → 全角カッコへ統一
  txt = txt.replace(/\(/g, '（');
  txt = txt.replace(/\)/g, '）');

  display.textContent = txt;
}

// =========================
// 並び順ボタン内の不要画像を削除
// =========================
function removeSortButtonIcon() {
  const btn = document.querySelector('td.td-sort-box .border-new.sort');
  if (!btn) return;

  // ① sortアイコン削除
  btn.querySelectorAll('img[src*="sort-"]').forEach(img => {
    img.remove();
  });

  // ② chevron削除（ラッパーdivごと）
  btn.querySelectorAll('img[src*="chevron"]').forEach(img => {
    const wrapper = img.closest('div');
    if (wrapper && wrapper !== btn) {
      wrapper.remove();
    } else {
      img.remove();
    }
  });
}
  // =========================================================
  // SP：可能なら PC側DOMを優先して開かせる（壊さない範囲）
  // =========================================================
function bindSpSortButtonToPcDom() {

  const btn = document.querySelector('[data-target="#modalSort"].border-new.sort');
  if (!btn) return;
  if (btn.dataset.pcStyled) return;

  btn.dataset.pcStyled = '1';

  // 見た目をPC化
  btn.innerHTML = '<span class="sort-text-display">並び順</span>';

  btn.removeAttribute('data-toggle');
  btn.removeAttribute('data-target');

  btn.addEventListener('click', function(e){
    e.preventDefault();
    e.stopPropagation();

    if (window.SearchForm &&
        typeof SearchForm.selectSortDisplay === 'function') {
      SearchForm.selectSortDisplay('toggle', '#sortBox', e);
    }
  });
}

/* =========================
   一覧ヘッダー：縦線 <td> を projects と同じ構造に揃える
   - .search-pc 内の table.search-list の一番上の <tr> を対象
   - すでに .border-line があれば（/projects 等）は何もしない
========================= */
function ensureHeaderBorderLine() {
  const tables = document.querySelectorAll('.search-pc table.search-list');
  if (!tables.length) return;

  tables.forEach(table => {
    const tr = table.querySelector('tbody > tr');
    if (!tr) return;

    // すでに縦線があるページ（/projects）はスキップ
    if (tr.querySelector('.border-line')) return;

    const firstTd = tr.querySelector('td');
    if (!firstTd) return;

    const td = document.createElement('td');
    td.className = 'td-sort-box hidden-for-sp';

    const div = document.createElement('div');
    div.className = 'border-line w-0 mx-2';

    td.appendChild(div);
    tr.insertBefore(td, firstTd);
  });
}

  // =========================================================
  // メイン
  // =========================================================
  const RECHECK_MS = 400;
  let lastHref = location.href;

function apply() {
  const pageKey = getPageKey();
  if (!pageKey) return;

  injectCssOnce();
  applySortByConfig(pageKey);
  bindSpSortButtonToPcDom();

  // 一覧ヘッダーの縦線 <td> を projects と同じ構造に揃える
  ensureHeaderBorderLine();

  // ★ 並び順ボタン内アイコン削除
  removeSortButtonIcon();
}

  // 初回
  apply();

  // SPA/遷移対策（軽め）
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      setTimeout(apply, 50);
    } else {
      // DOM差し替えに最低限追従
      apply();
    }
  }, RECHECK_MS);

})();
