// ==UserScript==
// @name         共通｜並び順※common-unified-sort.user.js
// @namespace    akapon
// @version      20260225 1300
// @match        https://member.createcloud.jp/*
// @match        https://membernew.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/common-unified-sort.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/common-unified-sort.user.js
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
     - 容量（ダミー）
   並び順では「表示順だけ提供し、機能はサーバー側で実装」

   ■ ページ別：並び順項目
   ● チーム情報 /users
       ID / 権限　/　登録日　/　ステータス
   ● 外部情報 /collaborators
       ID / 登録日　/　ステータス
   ● 会員一覧 /company_apply_campaigns
       ID / 登録日
   ● プロジェクト　/　タスク /　ファイル
   プロジェクト名　/　タスク名　/　ファイル名　/　カスタマイズ　は削除（bugがある為）

   ■ bug
   下記ページのステータスがbugってます。直してください。
   https://member.createcloud.jp/collaborators
   https://member.createcloud.jp/users

   ■ 注意
   - SP版は動いていないので、PCと同じDOMを使用し、文字サイズのみCSSで調整してください。
   - onclick や URL 生成処理（/projects?sort_by[...]）は既存ロジックそのまま使用
   - DOM の移動は禁止（既存 SearchForm / Visiable.toggle の構造が壊れるため）
   - 並び順モーダル内のアイコン除去や「＋の右側縦線」統一はここで制御する

   ■ 修正点
//
// ❶ リリース時の既存データ問題（履歴の欠損）
//  - 現状、過去に「完成」になった履歴データ（既存の完成済みファイル）に
//    「完成者」「完成日」が保存されていない / 返ってきていない可能性があります。
//  - そのため UI 側で「完成者」「完成日」を表示・並び順に利用できず、
//    Tampermonkey側では補完ができません。
//  - 対応方針：
//    ・DB/履歴テーブルに完成者ID・完成日時が保持されているか確認
//    ・API/一覧取得のレスポンスに completed_by / completed_at（相当フィールド）が含まれるか確認
//    ・未保存の場合は、リリース時の移行（バックフィル）で既存完了分に値を埋める
//
// ❷ 完成日ソートの挙動不正（未完了が上に来る）
//  - 要件：
//    ・「古い順」：完成日の古い順（completed_at ASC）から上に表示される
//    ・「新しい順」：完成日の新しい順（completed_at DESC）から上に表示される
//  - 現状：
//    ・「新しい順」で、完成していない（completed_at が NULL の）ファイルが上に来る挙動が発生。
//  - 想定原因：
//    ・NULL の並び順が DESC で先頭扱いになっている
//    ・またはソートキーが completed_at ではなく別キー（更新日等）に寄っている
//  - 対応方針（例）：
//    ・completed_at が NULL の行は常に末尾に送る（NULLS LAST 相当）
//      例）ORDER BY (completed_at IS NULL) ASC, completed_at DESC/ASC
//    ・完了状態のみを対象にする/または未完了は completed_at を参照しない等、仕様を確定
//
// ※Tampermonkey側は「表示文言」「並び替えUI」しか調整できないため、
//   completed_by / completed_at の保存・取得・ソートの正はシステム側での対応が必要です。
// ========================================================

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
    users: { sort: ['id', 'role', 'registered_at', 'status'] },
    collaborators: { sort: ['id', 'registered_at', 'status'] },
    company_apply_campaigns: { sort: ['id', 'registered_at'] },
    // task / file は projects と同じ（タスク/ファイルは期限を実項目 due_date で使用）
    tasks: { sort: ['id', 'created_at_dummy', 'updated_at_dummy', 'due_date', 'size_dummy', 'status'] },
    files: { sort: ['id', 'created_at_dummy', 'updated_at_dummy', 'due_date', 'size_dummy', 'status'] },

    // ✅ /all_akaire_files 専用（正しい順）
    // 作成日 → 更新日 → 完成日 → 作成者 → 完成者 → ステータス
    // ※更新日は「ダミー」ではなく実 updated_at を使う
      all_files: { sort: ['created_at', 'updated_at', 'completed_at', 'created_by', 'complete_updater', 'status'] },
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

    // ✅ 全ファイル一覧
    if (p === '/all_akaire_files' || p.startsWith('/all_akaire_files/')) return 'all_files';

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
   ＋ボタンを並び順と同じホバー挙動に統一
   ＋縦中央完全固定
========================= */

.search-pc .btn.btn-create.plus.plus-icon{
  background: #1f1f1f !important;
  color: #fff !important;
  border-radius: 12px !important;
  border: 1px solid #1f1f1f !important;
  box-shadow: 0 6px 18px rgba(0,0,0,.22) !important;

  /* ★追加ここから */
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  line-height: 1 !important;
  padding: 0 !important;
  height: 40px !important;
  width: 40px !important;
  /* ★追加ここまで */

  font-weight: 900 !important;
  font-size: 24px !important;  /* ← 33は大きすぎ */
}

.search-pc .btn.btn-create.plus.plus-icon:hover{
  background: #3f3f3f !important;
  border-color: #3f3f3f !important;
  color: #fff !important;
  box-shadow: 0 8px 22px rgba(0,0,0,.26) !important;
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

    // ✅ /all_akaire_files 用：先に判定（「作成」が衝突するため）
    if (label.includes('作成者')) return 'created_by';
    if (label.includes('完成者')) return 'complete_updater';
    if (label.includes('完成日')) return 'completed_at';

    // 日付系
    if (label.includes('作成')) return 'created_at';
    if (label.includes('更新')) return 'updated_at';

    if (label.includes('期限') || label.includes('締切') || label.includes('予定')) return 'due_date';
    if (label.includes('容量') || label.includes('サイズ')) return 'size';
    if (label.includes('ステータス') || /^status$/i.test(label) || label === 'Status') return 'status';
    if (label.includes('権限')) return 'role';
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

  // ✅ 同じ構成を既に適用済みなら、並べ替えをやらない（チラつき/動き防止）
  const sig = `${pageKey}::${cfg.sort.join(',')}`;
  if (ul.dataset.tmSortAppliedSig === sig) {
    return;
  }

  // 既存行をキー付け＆ラベル補正
  const items = Array.from(ul.querySelectorAll(':scope > li.li-sort-item'));
  items.forEach(li => {
    if (!li.dataset.tmSortKey) {
      const key = detectSortKey(li);
      if (key) li.dataset.tmSortKey = key;
    }

    const labelEl = li.querySelector('.sort_item');
    if (!labelEl) return;

    const txt = normalizeText(labelEl.textContent);

    // Status 表記ゆれは見た目だけ統一
    if (txt === 'Status' || /^status$/i.test(txt)) {
      labelEl.textContent = 'ステータス';
    }

    // タスク/ファイルページ：期限 → 期限日（中身は due_date のまま）
    if ((pageKey === 'tasks' || pageKey === 'files') &&
        (li.dataset.tmSortKey === 'due_date' || txt === '期限')) {
      labelEl.textContent = '期限日';
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
  }

  // いったん全行を「許可されたキー以外は非表示」
  // ただし、プロジェクト名 / タスク名 / ファイル名 /
  // カスタマイズ /（ダミー優先時の）更新 / 期限日ダミー は DOM から削除
  const allowed = new Set(cfg.sort);
  Array.from(ul.querySelectorAll(':scope > li.li-sort-item')).forEach(li => {
    const key = li.dataset.tmSortKey || detectSortKey(li);
    if (key) li.dataset.tmSortKey = key;

    const labelEl = li.querySelector('.sort_item');
    const label = normalizeText(labelEl ? labelEl.textContent : '');

    const isProjectName = (label === 'プロジェクト名');
    const isTaskName = (pageKey === 'tasks' && label === 'タスク名');
    const isFileName = (pageKey === 'files' && label === 'ファイル名');
    const isCustomize = /カスタ/i.test(label) && /マイズ/.test(label);
    const isDummyDueDate = ((pageKey === 'tasks' || pageKey === 'files') && li.dataset.tmSortKey === 'due_date_dummy');

    // customize UI がぶら下がってるケースも削除
    const hasCustomizeUi = !!li.querySelector('.create-customize-sort, .customize-sort-name, [id^="customize-sort-"]');

    if (isProjectName || isTaskName || isFileName || isCustomize || hasCustomizeUi || isDummyDueDate) {
      li.remove();
      return;
    }

    // projects設定で updated_at_dummy を使う時は「実物 updated_at」をDOMから削除
    if (allowed.has('updated_at_dummy') && key === 'updated_at') {
      li.remove();
      return;
    }

    li.style.display = (key && allowed.has(key)) ? '' : 'none';
  });

  // ID / 登録日 / 期限日 の option 文言を統一
  const allLis = Array.from(ul.querySelectorAll(':scope > li.li-sort-item'));

  const idLi = allLis.find(li => li.dataset.tmSortKey === 'id');
  if (idLi) normalizeIdOptions(idLi);

  const regLi = allLis.find(li => li.dataset.tmSortKey === 'registered_at');
  if (regLi) normalizeDateSortOptions(regLi, 'registered_at');

  const dueLi = allLis.find(li => li.dataset.tmSortKey === 'due_date');
  if (dueLi) normalizeDateSortOptions(dueLi, 'due_date');

  // ★ 3ページ専用：ID / 登録日 を「新しい順 / 古い順」に揃える
  //   - /company_apply_campaigns
  //   - /users
  //   - /collaborators
  if (pageKey === 'users' || pageKey === 'collaborators' || pageKey === 'company_apply_campaigns') {
    normalizeUserLikePageSortOptions(ul);
  }

  // ✅ /all_akaire_files 専用：日付系（q[s]=... asc/desc）の表示を「新しい順→古い順」に統一
  // かつ「更新日」の .sort_item を指定HTMLに合わせる（ダミー表記を使わない）
  if (pageKey === 'all_files') {
    normalizeAllFilesSortOptions(ul);
  }

  // 指定順に並べ替え（存在するものだけ）
  const map = new Map();
  allLis.forEach(li => {
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

  // 適用済みマーク & ボタン文言補正
  ul.dataset.tmSortAppliedSig = sig;
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
// 日付/ID系（登録日・期限日など）の option 文言を統一
// =========================
function normalizeDateSortOptions(li, key) {
  const opts = Array.from(li.querySelectorAll('li.sort-option'));
  if (opts.length < 2) return;

  const getHref = (node) => {
    const a = node.querySelector('a[href]');
    return a ? a.getAttribute('href') || '' : '';
  };

  const asc = opts.find(o => new RegExp(`sort_by%5B${key}%5D=asc`).test(getHref(o)));
  const desc = opts.find(o => new RegExp(`sort_by%5B${key}%5D=desc`).test(getHref(o)));

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
  const ul = li.querySelector(':scope > ul');
  if (!ul) return;

  const frag = document.createDocumentFragment();
  if (desc) frag.appendChild(desc);
  if (asc) frag.appendChild(asc);
  ul.appendChild(frag);
}

// =========================
// 3ページ専用（users / collaborators / company_apply_campaigns）
// ID / 登録日の option を「新しい順 / 古い順」に統一
// ※ 権限・ステータスは触らない（昇順 / 降順のまま）
// =========================
function normalizeUserLikePageSortOptions(ul) {
  const rows = Array.from(ul.querySelectorAll(':scope > li.li-sort-item'));

  rows.forEach(li => {
    const key = li.dataset.tmSortKey || detectSortKey(li);
    const labelEl = li.querySelector('.sort_item');
    const label = normalizeText(labelEl ? labelEl.textContent : '');

    const isId = (key === 'id' || label === 'ID');
    const isRegistered = (key === 'registered_at' || label.includes('登録日'));
    if (!isId && !isRegistered) return;

    const opts = Array.from(li.querySelectorAll('li.sort-option'));
    if (opts.length < 1) return;

    let newerOpt = null; // 新しい順
    let olderOpt = null; // 古い順

    opts.forEach(opt => {
      const a = opt.querySelector('a');
      if (!a) return;
      const txt = normalizeText(a.textContent);

      if (txt.includes('降順') || txt.includes('新しい')) {
        if (!newerOpt) newerOpt = opt;
      } else if (txt.includes('昇順') || txt.includes('古い')) {
        if (!olderOpt) olderOpt = opt;
      }
    });

    if (!newerOpt && opts[0]) newerOpt = opts[0];
    if (!olderOpt && opts[1]) olderOpt = opts[1];

    if (!newerOpt || !olderOpt || newerOpt === olderOpt) return;

    const newerA = newerOpt.querySelector('a');
    const olderA = olderOpt.querySelector('a');
    if (newerA) newerA.textContent = '新しい順';
    if (olderA) olderA.textContent = '古い順';

    const innerUl = li.querySelector(':scope > ul');
    if (!innerUl) return;

    const frag = document.createDocumentFragment();
    frag.appendChild(newerOpt);
    frag.appendChild(olderOpt);

    opts.forEach(o => {
      if (o !== newerOpt && o !== olderOpt) frag.appendChild(o);
    });

    innerUl.appendChild(frag);
  });
}

// =========================
// /all_akaire_files 専用
// - 作成日/更新日：q[s]=field asc/desc を「新しい順→古い順」に統一（クリック時もテレコ防止）
// - 更新日の sort_item を指定HTMLに合わせる（ダミー表記なし）
// =========================
function normalizeAllFilesSortOptions(ul) {
  const rows = Array.from(ul.querySelectorAll(':scope > li.li-sort-item'));

  const byKey = (k) => rows.find(li => (li.dataset.tmSortKey || detectSortKey(li)) === k);

  const createdLi  = byKey('created_at');
  const updatedLi  = byKey('updated_at');
  const completeLi = byKey('completed_at');

  // 作成日：新しい順 → 古い順（desc → asc）
  if (createdLi) normalizeAllFilesDateOptionsByQ(createdLi, 'created_at');

  // 更新日：ラベルHTMLを指定形に＋新しい順 → 古い順
  if (updatedLi) {
    const labelEl = updatedLi.querySelector('.sort_item');
    if (labelEl) {
      labelEl.innerHTML = [
        '更新日',
        '<div class="float-right" onclick="SearchForm.selectFilterDisplay(\'toggle\', \'.updated-at-filter\', event)"></div>'
      ].join('');
    }
    normalizeAllFilesDateOptionsByQ(updatedLi, 'updated_at');
  }

  // 完成日：新しい順 → 古い順（desc → asc）
  if (completeLi) normalizeAllFilesDateOptionsByQ(completeLi, 'completed_at');
}

function normalizeAllFilesDateOptionsByQ(li, field) {
  const opts = Array.from(li.querySelectorAll('li.sort-option'));
  if (opts.length < 2) return;

  const getA = (node) => node.querySelector('a[href]');
  const getHref = (node) => {
    const a = getA(node);
    return a ? (a.getAttribute('href') || '') : '';
  };
  const getText = (node) => {
    const a = getA(node);
    return normalizeText(a ? (a.textContent || '') : '');
  };

  // ✅ href から asc/desc を広めに判定（q[s] / q%5Bs%5D / sort_by / 完全一致以外も吸収）
  const isAscHref = (href) => {
    const h = href || '';
    // q[s]=field+asc / q%5Bs%5D=field+asc / + が %20 の場合
    if (new RegExp(`(?:q%5Bs%5D=|q\\[s\\]=)${field}(?:\\+|%20)asc`).test(h)) return true;
    // sort_by[field]=asc / sort_by%5Bfield%5D=asc
    if (new RegExp(`sort_by(?:%5B|\\[)${field}(?:%5D|\\])=asc`).test(h)) return true;
    // 末尾が asc
    if (/\basc\b/i.test(h) && new RegExp(`\\b${field}\\b`).test(h)) return true;
    return false;
  };

  const isDescHref = (href) => {
    const h = href || '';
    if (new RegExp(`(?:q%5Bs%5D=|q\\[s\\]=)${field}(?:\\+|%20)desc`).test(h)) return true;
    if (new RegExp(`sort_by(?:%5B|\\[)${field}(?:%5D|\\])=desc`).test(h)) return true;
    if (/\bdesc\b/i.test(h) && new RegExp(`\\b${field}\\b`).test(h)) return true;
    return false;
  };

  // ✅ text からも補助判定（「新しい」「古い」「降順」「昇順」など）
  const isNewerText = (t) => (t.includes('新しい') || t.includes('降順'));
  const isOlderText = (t) => (t.includes('古い') || t.includes('昇順'));

  // 1) href判定を優先
  let desc = opts.find(o => isDescHref(getHref(o))) || null;
  let asc  = opts.find(o => isAscHref(getHref(o)))  || null;

  // 2) hrefで取れない場合は text で補完
  if (!desc) desc = opts.find(o => isNewerText(getText(o))) || null;
  if (!asc)  asc  = opts.find(o => isOlderText(getText(o))) || null;

  // 3) それでも取れない場合、元の並びに依存しないよう「押しやすい保険」はしない（誤判定防止）
  if (!desc || !asc || desc === asc) return;

  // ✅ 表示文言を統一（「古い」「新しい」も「古い順」「新しい順」に）
  {
    const a = desc.querySelector('a');
    if (a) a.textContent = '新しい順';
  }
  {
    const a = asc.querySelector('a');
    if (a) a.textContent = '古い順';
  }

  // ✅ 順序：新しい順（desc）→ 古い順（asc）
  const ulOpt = li.querySelector(':scope > ul');
  if (!ulOpt) return;

  const frag = document.createDocumentFragment();
  frag.appendChild(desc);
  frag.appendChild(asc);

  // それ以外があれば後ろへ
  opts.forEach(o => {
    if (o !== desc && o !== asc) frag.appendChild(o);
  });

  ulOpt.appendChild(frag);
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

  // 対象ページ判定
  //  - /company_apply_campaigns
  //  - /users
  //  - /collaborators
  const path = location.pathname || '';
  const isTargetPage = /^\/(company_apply_campaigns|users|collaborators)\b/.test(path);

  if (isTargetPage) {
    // ❶ 上記3ページだけ：
    //    昇順＝「古い順」、降順＝「新しい順」に正しく対応させる
    txt = txt
      // ID
      .replace(/ID[ 　]*[（(]昇順[)）]/, 'ID（古い順）')
      .replace(/ID[ 　]*[（(]降順[)）]/, 'ID（新しい順）')
      // 登録日
      .replace(/登録日[ 　]*[（(]昇順[)）]/, '登録日（古い順）')
      .replace(/登録日[ 　]*[（(]降順[)）]/, '登録日（新しい順）');
    // 権限／ステータスはそのまま「昇順／降順」を維持
  } else {
    // ❷ その他のページは今まで通り
    //    「昇順／降順 → 古い順／新しい順」に一括変換
    txt = txt.replace('昇順', '古い順');
    txt = txt.replace('降順', '新しい順');
  }

  // 半角カッコ → 全角カッコへ統一
  txt = txt.replace(/\(/g, '（');
  txt = txt.replace(/\)/g, '）');

  display.textContent = txt;
}

// =========================
// デフォルト並び順：ID 新しい順
// （URL に sort_by[…] が無く、かつ「ダイレクトアクセス」のときだけ実行）
// =========================
function ensureDefaultSort() {
  const search = location.search || '';

  // すでに並び順が指定されている場合は何もしない
  if (/[?&]sort_by%5B/.test(search)) return;

  // --- ここから「ダイレクトアクセスかどうか」を判定 ---

  // クエリ無し → /projects や /akaire_file/... をそのまま開いたケース
  const isNoQuery = search === '';

  // ?page=2 など「ページングだけ」のケース（これも一覧として扱う）
  const isOnlyPage = /^\?page=\d+$/.test(search);

  // 上記以外（= 絞り込みや、特定IDを開くためのクエリが付いているURL）は
  // バックエンドの結果をそのまま使う（デフォルト並び順を強制しない）
  if (!isNoQuery && !isOnlyPage) {
    return;
  }

  // --- ここから従来どおり「ID 新しい順」をデフォルト適用 ---

  // ID 新しい順のリンクを探す
  const descLink = document.querySelector('a[href*="sort_by%5Bid%5D=desc"]');
  if (!descLink) return;

  // location.href で遷移（?sort_by[…] 付きURLになるので二重適用は発生しない）
  location.href = descLink.href;
}

// =========================
// 並び順リンククリック時に、現在の絞り込みクエリを保持する
// =========================
function bindSortOptionClickKeepFilters() {
  const root = findSortRootPreferPc();
  const ul = getSortList(root);
  if (!ul) return;

  const links = ul.querySelectorAll('li.sort-option a[href]');
  links.forEach(function(a) {
    // 二重バインド防止
    if (a.dataset.tmKeepFilterBound === '1') return;

    const href = a.getAttribute('href') || '';
    if (!href) return;

    // sort_by 系リンクのみ対象
    if (!/sort_by%5B|sort_by\[/.test(href)) return;

    a.dataset.tmKeepFilterBound = '1';

    a.addEventListener('click', function(e) {
      try {
        e.preventDefault();
        e.stopPropagation();

        // 現在URLを基準にクエリを操作
        const currentUrl = new URL(location.href);
        const currentParams = currentUrl.searchParams;

        // 既存の sort_by[...] を一旦全削除（絞り込み q[...] は残す）
        const deleteKeys = [];
        currentParams.forEach(function(value, key) {
          if (key.indexOf('sort_by[') === 0) {
            deleteKeys.push(key);
          }
        });
        deleteKeys.forEach(function(key) {
          currentParams.delete(key);
        });

        // クリックしたリンクの sort_by[...] だけを追加
        const targetUrl = new URL(a.href, location.origin);
        targetUrl.searchParams.forEach(function(value, key) {
          if (key.indexOf('sort_by[') === 0) {
            currentParams.set(key, value);
          }
        });

        // 絞り込み q[...] などはそのまま、sort_by だけ差し替えたURLへ遷移
        location.href = currentUrl.toString();
      } catch (err) {
        console.error('tm sort keep filters error', err);
        // 何かあれば従来どおりにフォールバック
        location.href = a.href;
      }
    });
  });
}

// =========================
// 並び順ボタン内の不要画像を削除
// =========================
function removeSortButtonIcon() {
  const btn = document.querySelector('td.td-sort-box .border-new.sort');
  if (!btn) return;

  // ① sortアイコン削除
  btn.querySelectorAll('img[src*="sort-"]').forEach(function(img) {
    img.remove();
  });

  // ② chevron削除（ラッパーdivごと）
  btn.querySelectorAll('img[src*="chevron"]').forEach(function(img) {
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
function apply() {
  const pageKey = getPageKey();
  if (!pageKey) return;

  injectCssOnce();
  applySortByConfig(pageKey);

  // デフォルト並び順：ID 新しい順
  ensureDefaultSort();

  // 並び順リンククリック時に、絞り込みクエリを維持
  bindSortOptionClickKeepFilters();

  bindSpSortButtonToPcDom();

  // 一覧ヘッダーの縦線 <td> を projects と同じ構造に揃える
  ensureHeaderBorderLine();

  // ★ 並び順ボタン内アイコン削除
  removeSortButtonIcon();
}

  // 初回
  apply();

  // SPA/遷移対策：URL変更時だけ再適用
  const RECHECK_MS = 400;
  let lastHref = location.href;

  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      setTimeout(apply, 50);
    }
  }, RECHECK_MS);

})();
