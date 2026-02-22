// ==UserScript==
// @name         アカポン（共通｜検索・絞り込み）※akapon-unified-filter.user.js
// @namespace    akapon
// @version      2026.02.22.0001
// @match        https://member.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-unified-filter.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-unified-filter.user.js
// ==/UserScript==

(() => {
  'use strict';

/* =========================================================
   【エンジニア向けコメント置き場：検索・絞り込み共通UI】

   ■ 目的
   - 全ページの「検索・絞り込み UI」を /projects と同じ見た目・並び順へ統一する
   - ページごとの差は「表示する項目 (filter) だけ」に限定し、PAGE_CONFIG にて制御
   - メンバー検索（created-by-filter）は「検索欄＋10件/ページ＋右下ページネーション」を共通適用
   - PC DOM（.filter-common-all）を SP でも使用し、SP 版 DOM は廃止
     → SP は PC DOM をそのまま使い、文字サイズだけ SP 向けに縮小して調整する

   ■ タスク・ファイルで削除する項目
   - （検索・絞り込み）優先度 / 数量 / 保管場所
     → onclick 内のクラス名（.priority-color-filter / .works-unit-eq）でも確実に検出し非表示

   ■ ダミー項目について
   以下はバックエンド未対応のため UI のみ存在する項目：
     - 作成日（ダミー）
     - 期限日（ダミー）
     - 容量（ダミー）
   → UI統一のため表示はするが、実機能はサーバー側実装が必要

   ■ ページ別：検索・絞り込み項目  ※ PAGE_CONFIG と揃える
   ● チーム情報 /users
       ID / 登録日 / メンバー / ステータス / 件数
   ● 外部情報 /collaborators
       ID / アカウント名 / ステータス / 件数
   ● 会員一覧 /company_apply_campaigns
       ID / アカウント名 / 件数

   ■ 注意
   - SearchForm.selectFilterDisplay / resetDataSearch / quick-submit など既存 onclick は変更しない
   - HTML差し替えは禁止（name違いで壊れるため）
   - ここは「UI統一・項目表示制御・件数末尾移動・メンバー検索強化」のみ担当
   - datepicker が開かない場合は、元HTML側で id の付与など修正が必要

========================================================= */

  // =========================================================
  // ページ別設定（filter項目だけ）
  // =========================================================
const PAGE_CONFIG = {

  /* =========================
     プロジェクト / タスク / ファイル
     ========================= */
  projects: {
    filter: [
      'id',
      'created_at',
      'updated_at',
      'due_date_dummy',
      'member',
      'status',
      'per_page'
    ]
  },

  // タスク一覧もプロジェクトと同じ項目構成に統一
  tasks: {
    filter: [
      'id',
      'created_at',
      'updated_at',
      'due_date',
      'member',
      'status',
      'per_page'
    ]
  },

  // ファイル一覧（プロジェクト／タスク配下）も同じ構成に統一
  files: {
    filter: [
      'id',
      'created_at',
      'updated_at',
      'due_date_dummy',
      'member',
      'status',
      'per_page'
    ]
  },

  /* =========================
     チーム情報
     ========================= */
  users: {
    filter: [
      'id',
      'registered_at',
      'member',
      'status',
      'per_page'
    ]
  },

  /* =========================
     外部メンバー
     ========================= */
  collaborators: {
    filter: [
      'id',
      'account_name',
      'status',
      'per_page'
    ]
  },

  /* =========================
     会員一覧
     ========================= */
  company_apply_campaigns: {
    filter: [
      'id',
      'account_name',
      'per_page'
    ]
  }
};

  // =========================================================
  // ページ判定
  // =========================================================
  function getPageKey() {
    const p = location.pathname || '';

    if (p === '/projects' || /^\/projects\/\d+\/task/.test(p)) return (p === '/projects') ? 'projects' : 'tasks';
    if (/^\/akaire_file\/\d+\/project_akaire_files/.test(p)) return 'files';
    if (/^\/akaire_file\/\d+\/task_akaire_files/.test(p)) return 'files';

    if (p === '/users' || p.startsWith('/users/')) return 'users';
    if (p === '/collaborators' || p.startsWith('/collaborators/')) return 'collaborators';
    if (p === '/company_apply_campaigns' || p.startsWith('/company_apply_campaigns/')) return 'company_apply_campaigns';

    return null;
  }

  // =========================================================
  // CSS（projects見た目へ寄せる）
  // - filterボタン + 親子モーダル + qs-datepicker補正 + member pager
  // =========================================================
  const STYLE_ID = 'akapon-unified-filter-style';

  const CSS = `
/* =========================
   フィルターボタン（td内）: projects風（文字＋件数）
   ※ td 直下のボタンだけを対象にする
========================= */
td.td-filter-box > [onclick*="SearchForm.selectFilterDisplay"]{
  background: #1f1f1f !important;
  color: #fff !important;
  border-radius: 12px !important;
  box-shadow: 0 6px 18px rgba(0,0,0,.22) !important;
  border: 1px solid #1f1f1f !important;
  padding: 5.5px 12px !important; /* 高さを少し低く調整 */
  display: inline-flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 8px !important;
}
td.td-filter-box > [onclick*="SearchForm.selectFilterDisplay"]:hover{
  background: #3f3f3f !important;
  border-color: #3f3f3f !important;
  box-shadow: 0 8px 22px rgba(0,0,0,.26) !important;
}
td.td-filter-box > [onclick*="SearchForm.selectFilterDisplay"] svg,
td.td-filter-box > [onclick*="SearchForm.selectFilterDisplay"] img{
  display: none !important;
}
td.td-filter-box > [onclick*="SearchForm.selectFilterDisplay"] .filter-btn-label{
  position: relative !important;
  top: 1px !important;  /* 少しだけ下方向へ */
  line-height: 1 !important;
  display: inline-block !important;
  color: #fff !important;
  font-weight: 800 !important;
}

/* 件数バッジ（0件のときは JS 側で非表示 / 1件以上で表示） */
td.td-filter-box > [onclick*="SearchForm.selectFilterDisplay"] .number{
  display: none !important; /* JS確定後に出す */
  align-items: center !important;
  justify-content: center !important;
  min-width: 20px !important;
  height: 20px !important;
  padding: 0 6px !important;
  border-radius: 999px !important;
  background: #E60C11 0% 0% no-repeat padding-box !important;
  color: #fff !important;
  font-weight: 800 !important;
  font-size: 12px !important;
  margin-left: 6px !important;
  margin-top: -14px !important; /* ボタン枠内にちょうど収まるように上に寄せる */
}
td.td-filter-box > [onclick*="SearchForm.selectFilterDisplay"] .number[data-tm-ready="1"][data-tm-zero="0"]{
  display: inline-flex !important;
}

/* overflow切れ対策 */
td.td-filter-box,
table.search-list,
table.search-list *{
  overflow: visible !important;
}

/* akaire_file プロジェクトファイル一覧などに残っている
   table 外側の border-line は非表示にする（td 内の縦線は残す） */
.search-pc > .border-line.w-0.mx-2{
  display: none !important;
}

/* =========================
   親モーダル（.filter-common-all）: projects風に中央化
========================= */
html body .filter-common-all.dropdown-new-stype,
html body .filter-content.dropdown-new-stype{
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
}
.filter-common-all.dropdown-new-stype .dropdown-header,
.filter-content.dropdown-new-stype .dropdown-header{
  padding: 12px 14px !important;
  background: linear-gradient(90deg, #1e3c72, #555) !important;
  color: #fff !important;
  font-weight: 800 !important;
  border: none !important;
  align-items: center !important;
}
.filter-common-all.dropdown-new-stype .dropdown-header *,
.filter-content.dropdown-new-stype .dropdown-header *{
  color: #fff !important;
}
.filter-common-all.dropdown-new-stype .dropdown-body,
.filter-content.dropdown-new-stype .dropdown-body{
  padding: 10px 12px 10px !important;
  background: #fff !important;
  max-height: 70vh !important;
  overflow: auto !important;
}

/* 親モーダル上部の検索アイコン（虫眼鏡ボタン）を非表示 */
.filter-common-all.dropdown-new-stype .search-input .btn-submit-search{
  display: none !important;
}

/* 一覧ヘッダーの検索枠（タスク名・ファイル名など）を角丸＋シャドーに */
.search-pc .search-input input.form-control{
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

/* IDフィルター：検索対象セレクトを非表示にし、ID入力枠を100%幅＋角丸シャドーに */
.search-pc .td-filter-box .search-kind #type_id{
  display: none !important;
}

.search-pc .td-filter-box .search-kind #q_kind_id{
  width: 100% !important;
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

/* =========================
   qs-datepicker：曜日/日付ズレ対策（7列固定）
========================= */
.qs-datepicker-container,
  border: 1px solid #ddd !important;
}

/* =========================
   qs-datepicker：曜日/日付ズレ対策（7列固定）
========================= */
.qs-datepicker-container,
.qs-datepicker-container *{
  box-sizing: border-box !important;
}
.qs-datepicker-container .qs-squares{
  display: grid !important;
  grid-template-columns: repeat(7, 32px) !important;
  grid-auto-rows: 32px !important;
  justify-content: center !important;
  align-content: start !important;
}
.qs-datepicker-container .qs-square{
  width: 32px !important;
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
  padding: 0 !important;
  margin: 0 !important;
  float: none !important;
}
.qs-datepicker-container .qs-square.qs-day{
  width: 32px !important;
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.qs-datepicker-container .qs-square.qs-num,
.qs-datepicker-container .qs-square.qs-day{
  white-space: nowrap !important;
}

/* =========================================================
   作成日フィルター：2行（各行：ラベル＋枠）＋枠を狭く
   ＋ カレンダーがモーダル内で切れるのを回避
   ========================================================= */

/* 各行：ラベル＋input を横並び（= 2行構成） */
.filter-content.dropdown-new-stype .dropdown-body.search .group-input{
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 10px !important;
}

/* ラベル：左側に固定幅 */
.filter-content.dropdown-new-stype .dropdown-body.search .group-input > label{
  margin: 0 !important;
  width: 140px !important;
  text-align: left !important;
  font-weight: 800 !important;
  color: #111 !important;
  white-space: nowrap !important;
}

/* input：横幅を狭く（フル幅にしない）＋角丸シャドー */
.filter-content.dropdown-new-stype #q_created_at_gteq,
.filter-content.dropdown-new-stype #q_created_at_lteq{
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

/* readonlyでも押せる感じに */
.filter-content.dropdown-new-stype #q_created_at_gteq[readonly],
.filter-content.dropdown-new-stype #q_created_at_lteq[readonly]{
  cursor: pointer !important;
}

/* 期限日フィルター（タスクの予定期限）の入力枠も角丸＋シャドーに */
.filter-content.dropdown-new-stype.due-date-filter .js-datepicker-pc.date{
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

/* --- カレンダーがモーダル内で切れる対策（overflowの切り落とし回避） --- */
.filter-content.dropdown-new-stype{
  overflow: visible !important;
}
.filter-content.dropdown-new-stype .dropdown-body{
  overflow: visible !important;
}
.filter-content.dropdown-new-stype .qs-datepicker-container{
  z-index: 1000000 !important;
}

/* --- カレンダー（qs-datepicker）のサイズを小さくする --- */
.filter-content.dropdown-new-stype .qs-datepicker-container{
  transform: scale(0.86) !important;
  transform-origin: top left !important;
}

/* 文字・余白が大きい場合の追加圧縮（必要最低限） */
.filter-content.dropdown-new-stype .qs-datepicker-container .qs-datepicker{
  font-size: 12px !important;
}

/* カレンダー本体の枠 */
.qs-datepicker{
  border: none !important;
  border-radius: 14px !important;
  overflow: hidden !important;
  box-shadow: 0 16px 38px rgba(0,0,0,.28) !important;
  background: #fff !important;
}

/* 上部コントロール（年月＋矢印） */
.qs-datepicker .qs-controls{
  background: linear-gradient(90deg,#1e3c72,#555) !important;
  color: #fff !important;
  padding: 10px 12px !important;
  border: none !important;
}
.qs-datepicker .qs-controls *{
  color: #fff !important;
  font-weight: 800 !important;
}

/* 矢印を少し大きく・押しやすく */
.qs-datepicker .qs-arrow{
  width: 34px !important;
  height: 34px !important;
  border-radius: 10px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  opacity: .95 !important;
}
.qs-datepicker .qs-arrow:hover{
  background: rgba(255,255,255,.14) !important;
}

/* 曜日行 */
.qs-datepicker .qs-squares .qs-day{
  font-weight: 800 !important;
  color: rgba(0,0,0,.55) !important;
  padding: 8px 0 !important;
}

/* 日付セル */
.qs-datepicker .qs-squares .qs-num{
  border-radius: 10px !important;
  margin: 2px !important;
  padding: 10px 0 !important;
  font-weight: 800 !important;
  color: #222 !important;
}

/* hover */
.qs-datepicker .qs-squares .qs-num:hover{
  background: rgba(30,60,114,.10) !important;
  color: #1e3c72 !important;
}

/* 選択中（qs-active / qs-current どちらにも対応） */
.qs-datepicker .qs-squares .qs-num.qs-active,
.qs-datepicker .qs-squares .qs-num.qs-current{
  background: #1e3c72 !important;
  color: #fff !important;
}

/* 無効日 */
.qs-datepicker .qs-squares .qs-num.qs-disabled{
  opacity: .35 !important;
}

/* カレンダーを前面に（body直下生成でもOK） */
.qs-datepicker-container{
  z-index: 1000000 !important;
}

/* カレンダー切れ対策（保険） */
html body .filter-content.dropdown-new-stype{
  overflow: visible !important;
}
html body .filter-content.dropdown-new-stype .dropdown-body{
  overflow: visible !important;
}
html body .filter-content.dropdown-new-stype .filter-content-scroll{
  overflow: visible !important;
}
html body .filter-content.dropdown-new-stype .qs-datepicker-container{
  z-index: 1000000 !important;
}

/* =========================================================
   メンバー（created-by-filter）：検索 + 10件/ページ + ページャ（右下）
========================================================= */
/* メンバーmodal：検索窓だけにして、リアルタイム絞り込み用に見た目を調整 */
.filter-content.dropdown-new-stype.created-by-filter .search-input{
  margin-bottom: 10px !important;
  gap: 0 !important;
}

/* 入力枠：枠線なし＋シャドー、横幅いっぱい */
.filter-content.dropdown-new-stype.created-by-filter .search-input .form-control{
  width: 100% !important;
  height: 40px !important;
  border-radius: 20px !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(0,0,0,.15) !important;
  padding: 8px 12px !important;
}

/* 検索ボタンは非表示（機能としては不要のため） */
.filter-content.dropdown-new-stype.created-by-filter .btn-submit-search{
  display: none !important;
}
.filter-content.dropdown-new-stype.created-by-filter .btn-submit-search img{
  display: none !important;
}
.filter-content.dropdown-new-stype.created-by-filter .dropdown-body{
  position: relative !important;
  padding-bottom: 15px !important;
}
.filter-content.dropdown-new-stype.created-by-filter .tm-member-pagination{
  position: sticky !important;
  bottom: 10px !important;
  display: flex !important;
  justify-content: flex-end !important;
  gap: 8px !important;
  margin-top: 10px !important;
  z-index: 2 !important;
}
.filter-content.dropdown-new-stype.created-by-filter .tm-member-pagination .tm-page-btn{
  width: 34px !important;
  height: 34px !important;
  border-radius: 8px !important;
  border: 2px solid #1e3c72 !important;
  background: #fff !important;
  color: #1e3c72 !important;
  font-weight: 800 !important;
  line-height: 1 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: none !important;
}
.filter-content.dropdown-new-stype.created-by-filter .tm-member-pagination .tm-page-btn.is-active{
  background: #1e3c72 !important;
  color: #fff !important;
}
.filter-content.dropdown-new-stype.created-by-filter .dropdown-body .option{
  padding: 8px 14px !important;
  margin: 0 !important;
}
.filter-content.dropdown-new-stype.created-by-filter .dropdown-body .option:not(.option-all) + .option:not(.option-all){
  border-top: 1px dashed rgba(0,0,0,.18) !important;
}
.filter-content.dropdown-new-stype.created-by-filter .dropdown-body .option.option-all{
  border-bottom: 1px dashed rgba(0,0,0,.18) !important;
}
.filter-content.dropdown-new-stype.created-by-filter{
  overflow: hidden !important;
}
.filter-content.dropdown-new-stype.created-by-filter .filter-content-scroll{
  max-height: 70vh !important;
  overflow: auto !important;
}
.filter-content.dropdown-new-stype.created-by-filter .dropdown-body .option.slted{
  position: relative !important;
  padding-right: 44px !important;
}
.filter-content.dropdown-new-stype.created-by-filter .dropdown-body .option.slted::after{
  content: "✓" !important;
  position: absolute !important;
  right: 14px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 22px !important;
  height: 22px !important;
  border-radius: 999px !important;
  background: #1e3c72 !important;
  color: #fff !important;
  font-weight: 900 !important;
  font-size: 14px !important;
  line-height: 1 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* SP文字だけ小さく */
@media (max-width: 991px){
  .filter-common-all.dropdown-new-stype .dropdown-header,
  .filter-common-all.dropdown-new-stype .dropdown-header *{
    font-size: 14px !important;
    line-height: 1.2 !important;
  }
}

/* =========================================================
   ▼▼ 旧プロジェクト版から不足分を統合（完全版補強CSS） ▼▼
   ========================================================= */

/* =========================
   親モーダル：下角丸補完
========================= */
.filter-common-all.dropdown-new-stype .dropdown-body{
  border-bottom-left-radius: 14px !important;
  border-bottom-right-radius: 14px !important;
}

/* =========================
   親モーダル：ヘッダー右ボタン白化
========================= */
.filter-common-all.dropdown-new-stype .dropdown-header .reset-data-all,
.filter-common-all.dropdown-new-stype .dropdown-header .quick-submit{
  background: transparent !important;
  color: #fff !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* =========================
   select-filter 行デザイン強化
========================= */
.filter-common-all.dropdown-new-stype .select-filter{
  position: relative !important; /* 件数バッジを共通位置に置くため */
  border-bottom: 1px solid #eee !important;
  padding: 10px 21px !important;
  padding-left: 6px !important;
  margin-left: 0 !important;
}

.filter-common-all.dropdown-new-stype .select-filter:last-child{
  border-bottom: none !important;
}

.filter-common-all.dropdown-new-stype .select-filter:hover{
  background: #f6f8ff !important;
}

/* 項目名だけを濃い文字に（件数バッジ .number は除外） */
.filter-common-all.dropdown-new-stype .select-filter span:not(.number){
  font-weight: 700 !important;
  color: #222 !important;
  font-size: 0.95em !important;
}

/* 件数バッジ：項目名の左側、同じ位置に固定 */
.filter-common-all.dropdown-new-stype .select-filter .number.count-filter{
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

/* 左側アイコン削除 */
.filter-common-all.dropdown-new-stype .select-filter img{
  display: none !important;
}

/* =========================
   右側 ＞ を疑似要素で統一
========================= */
.filter-common-all.dropdown-new-stype .select-filter-right{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  min-width: 26px !important;
}

.filter-common-all.dropdown-new-stype .select-filter-right::after{
  content: "＞";
  font-weight: 700;
  color: #999;
  margin-left: 6px;
}

/* =========================
   子フィルターモーダル：完全中央固定
========================= */
.filter-content.dropdown-new-stype{
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;

  width: 86% !important;
  max-width: 420px !important;

  background: #fff !important;
  border-radius: 14px !important;
  overflow: visible !important;

  border: none !important;
  outline: none !important;
  box-shadow: 0 16px 38px rgba(0,0,0,.28) !important;

  z-index: 999999 !important;
}

/* =========================
   子モーダル：ヘッダーデザイン統一
========================= */
.filter-content.dropdown-new-stype .dropdown-header{
  padding: 12px 14px !important;
  background: linear-gradient(90deg,#1e3c72,#555) !important;
  color: #fff !important;
  font-weight: 700 !important;
}

.filter-content.dropdown-new-stype .dropdown-header *{
  color: #fff !important;
}

/* 子モーダル：右ボタン白化 */
.filter-content.dropdown-new-stype .dropdown-header .reset-data,
.filter-content.dropdown-new-stype .dropdown-header .quick-submit{
  background: transparent !important;
  color: #fff !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* =========================
   戻る「＜」を白太字で表示（子モーダルのみ）
========================= */

/* 親には出さない */
.filter-content.dropdown-new-stype.filter-common-all .dropdown-header .cursor-pointer::before{
  content: none !important;
}

/* 子モーダルのみ */
.filter-content.dropdown-new-stype:not(.filter-common-all) .dropdown-header .cursor-pointer img{
  display: none !important;
}

.filter-content.dropdown-new-stype:not(.filter-common-all) .dropdown-header .cursor-pointer::before{
  content: "＜" !important;
  color: #fff !important;
  font-weight: 900 !important;
  font-size: 18px !important;
  line-height: 1 !important;
  margin-right: 10px !important;
}

/* =========================
   件数行：下線を消す
========================= */
.filter-common-all.dropdown-new-stype .select-filter.select-filter-eachpage{
  border-bottom: none !important;
}

/* =========================================================
   ▲▲ 旧プロジェクト版補強ここまで ▲▲
   ========================================================= */
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
  // 項目キー判定（親モーダルの行／子モーダル）
  // =========================================================
  function normalizeText(t) {
    return (t || '').replace(/\s+/g, ' ').trim();
  }

function detectFilterKeyFromRow(row) {
  const text = normalizeText(row.textContent || '');
  const label = normalizeText(row.querySelector('span.ml-3')?.textContent || text);

  if (!label) return '';

  if (label.includes('ID')) return 'id';
  if (label.includes('作成日')) return 'created_at';
  if (label.includes('期限日') || label.includes('予定期限')) return 'due_date';
  if (label.includes('更新日')) return 'updated_at';

  if (label.includes('ステータス') || label.includes('Status')) return 'status';
  if (label.includes('メンバー')) return 'member';
  if (label.includes('件数')) return 'per_page';

  if (label.includes('登録日')) return 'created_at';
  if (label.includes('アカウント名')) return 'member';

  return '';
}

  function findFilterRootPreferPc() {
    const pc = document.querySelector('.filter-common-all.dropdown-new-stype, td.td-filter-box .filter-common-all');
    if (pc) return pc;

    const sp = document.querySelector('#modalFilterCommonAll');
    if (sp) return sp;

    return null;
  }

  // 件数を末尾へ
  function movePerPageToLast(filterRoot) {
    const body = filterRoot.querySelector('.dropdown-body');
    if (!body) return;

    const rows = Array.from(body.querySelectorAll('.select-filter-eachpage'));
    if (rows.length === 0) return;

    rows.forEach(r => body.appendChild(r));
  }

  // ボタンのラベル確保 + 件数0非表示
  function normalizeFilterButton() {
    const btn = document.querySelector('td.td-filter-box [onclick*="selectFilterDisplay"]');
    if (!btn) return;

    // label
    let labelEl = btn.querySelector('.filter-btn-label');
    if (!labelEl) {
      labelEl = document.createElement('span');
      labelEl.className = 'filter-btn-label';
      labelEl.textContent = '検索・絞り込み';

      const numberEl0 = btn.querySelector('.number');
      if (numberEl0 && numberEl0.parentNode) numberEl0.parentNode.insertBefore(labelEl, numberEl0);
      else btn.insertAdjacentElement('afterbegin', labelEl);
    } else {
      labelEl.textContent = '検索・絞り込み';
    }

    // number
    const numberEl = btn.querySelector('.number');
    if (numberEl) {
      const raw = (numberEl.textContent || '').trim();
      const n = parseInt(raw, 10);
      const isZero = raw === '' || Number.isNaN(n) || n <= 0;

      numberEl.setAttribute('data-tm-ready', '1');
      numberEl.setAttribute('data-tm-zero', isZero ? '1' : '0');
      if (!isZero) numberEl.textContent = String(n);
    }
  }

// 親モーダル行の表示制御
function applyFilterByConfig(pageKey) {
  const cfg = PAGE_CONFIG[pageKey];
  if (!cfg || !Array.isArray(cfg.filter)) return;

  const root = findFilterRootPreferPc();
  if (!root) return;

// 同じページでは1回だけ適用（検証ツールでDOMがぐるぐる動くのを防止）
  if (root.dataset.tmFilterApplied === pageKey) return;
  root.dataset.tmFilterApplied = pageKey;

// ※ DOM移動は禁止（SearchForm構造が壊れるため）
// body.appendChild で .filter-common-all を移動しないこと

  const allowed = new Set(cfg.filter);

  const body = root.querySelector('.dropdown-body');
  if (!body) return;

    // projects風：ヘッダー左文言を統一
    const headerLeft = root.querySelector('.dropdown-header > div:first-child');
    if (headerLeft && headerLeft.children.length === 0) {
      headerLeft.textContent = '検索・絞り込み';
    }

// 先頭の検索input（行ではない）を残しつつ、項目行だけ制御
const rows = Array.from(body.querySelectorAll('.select-filter, .select-filter-eachpage'));

rows.forEach(row => {

  // 「優先度」「数量」「保管場所」は共通で非表示
  const labelText = normalizeText(row.textContent || '');
  if (labelText.includes('優先度') || labelText.includes('数量') || labelText.includes('保管場所')) {
    row.style.display = 'none';
    row.dataset.tmFilterKey = '';
    return;
  }

  if (!row.dataset.tmFilterKey) {
    const key = detectFilterKeyFromRow(row);
    if (key) row.dataset.tmFilterKey = key;
  }

  const key = row.dataset.tmFilterKey;

  // 表示制御
  row.style.display = (key && allowed.has(key)) ? '' : 'none';

  // ===== ステータス日本語化 =====
  if (key === 'status') {
    const span = row.querySelector('span.ml-3');
    if (span) span.textContent = 'ステータス';
  }

  // ===== 更新日ダミー =====
  if (key === 'updated_at') {
    const span = row.querySelector('span.ml-3');
    if (span) span.textContent = '更新日（ダミー）';

    row.style.pointerEvents = 'none';
    row.style.opacity = '0.6';
  }

  // ===== 期限日ダミー =====
  if (key === 'due_date_dummy') {
    const span = row.querySelector('span.ml-3');
    if (span) span.textContent = '期限日（ダミー）';

    row.style.pointerEvents = 'none';
    row.style.opacity = '0.6';
  }

  // ===== 期限日（タスク：予定期限 を本番項目として使用） =====
  if (key === 'due_date') {
    const span = row.querySelector('span.ml-3');
    if (span) span.textContent = '期限日';
  }

  // ===== 右側「＞」を強制追加 =====
  if (key && !row.querySelector('.select-filter-right')) {
    const right = document.createElement('div');
    right.className = 'select-filter-right';
    row.appendChild(right);
  }
});

// ===== 右側「＞」を強制追加（既存行にも適用）=====
Array.from(body.querySelectorAll('.select-filter')).forEach(row => {

  if (!row.dataset.tmFilterKey) return;
  if (row.querySelector('.select-filter-right')) return;

  const right = document.createElement('div');
  right.className = 'select-filter-right';

  row.appendChild(right);
});

// ===== 並び順を仕様通り固定 =====
const ORDER = [
  'id',
  'created_at',
  'updated_at',
  'due_date_dummy',
  'due_date',
  'member',
  'status',
  'per_page'
];

ORDER.forEach(key => {
  const row = rows.find(r => r.dataset.tmFilterKey === key);
  if (row && row.style.display !== 'none') {
    body.appendChild(row);
  }
});

/* =========================
   ▼ ダミー項目を必要に応じて生成
========================= */

function ensureDummy(label, key, options = {}){
  if (!allowed.has(key)) return;

  const exist = Array.from(body.querySelectorAll('.select-filter, .select-filter-eachpage'))
    .find(el => el.dataset.tmFilterKey === key);

  if (exist) return;

  const isPerPage = key === 'per_page';

  const row = document.createElement('div');
  row.className = 'd-flex justify-content-between cursor-pointer select-filter' + (isPerPage ? ' select-filter-eachpage' : '');
  row.dataset.tmFilterKey = key;

  if (options.onclick) {
    row.setAttribute('onclick', options.onclick);
  }

  row.innerHTML = `
    <div class="d-flex align-items-center">
      <div style="width:26px"></div>
      <span class="ml-3">${label}</span>
    </div>
    <div class="select-filter-right"></div>
  `.trim();

  body.appendChild(row);
}

// projects系
ensureDummy('ID', 'id', {
  onclick: "SearchForm.selectFilterDisplay('toggle', '.kind-filter', event)"
});
ensureDummy('更新日（ダミー）', 'updated_at');
ensureDummy('期限日（ダミー）', 'due_date_dummy');
ensureDummy('件数', 'per_page', {
  onclick: "SearchForm.selectFilterDisplay('toggle', '.filter-content-number-record', event)"
});

// 件数は最後
movePerPageToLast(root);

/* =========================
   ▼ 表示順をprojects仕様で固定（再宣言しない）
========================= */

const currentRows = Array.from(body.querySelectorAll('.select-filter, .select-filter-eachpage'));

ORDER.forEach(key => {
  const row = currentRows.find(r => r.dataset.tmFilterKey === key);
  if (row && row.style.display !== 'none') {
    body.appendChild(row);
  }
});

    // 子モーダル（ID/作成日/更新日/メンバー/ステータス/件数など）も、不要なら隠す
    const childModals = Array.from(document.querySelectorAll('.filter-content.dropdown-new-stype'));
    childModals.forEach(m => {
      // 子モーダルはクラス名から推測（壊さない範囲で）
      const cls = m.className || '';
      let key = null;
      if (cls.includes('kind-filter') || cls.includes('id-filter')) key = 'id';
      if (cls.includes('created-at-filter')) key = 'created_at';
      if (cls.includes('updated-at-filter')) key = 'updated_at';
      if (cls.includes('created-by-filter')) key = 'member';
      if (cls.includes('status-filter')) key = 'status';
      if (cls.includes('filter-content-number-record') || cls.includes('eachpage-filter')) key = 'per_page';
      if (!key) return;

      m.style.display = allowed.has(key) ? '' : 'none';
    });
  }

  // =========================================================
  // メンバー：検索+10件ページング（created-by-filter）
  // =========================================================
  const MEMBER_MODAL_SEL = '.filter-content.dropdown-new-stype.created-by-filter';
  const SEARCH_WRAP_CLASS = 'tm-member-search-wrap';
  const PAGINATION_CLASS = 'tm-member-pagination';
  const INPUT_ID = 'tm_member_search_input';
  const PER_PAGE = 10;

  function getBody(modal) {
    return modal ? modal.querySelector('.dropdown-body') : null;
  }

  function getMemberOptions(body) {
    return Array.from(body.querySelectorAll('.option'))
      .filter(el => !el.classList.contains('option-all'));
  }

  function ensureMemberSearchBar(modal) {
    if (!modal) return;
    const body = getBody(modal);
    if (!body) return;

    if (!modal.querySelector(`.${SEARCH_WRAP_CLASS}`)) {
      const allOption = body.querySelector('.option.option-all') || body.firstElementChild;

      const wrap = document.createElement('div');
      wrap.className = `${SEARCH_WRAP_CLASS} d-flex search-input`;
      wrap.style.marginBottom = '8px';

      wrap.innerHTML = `
        <input class="form-control" id="${INPUT_ID}" type="text" placeholder="メンバーを検索">
        <button type="button" class="btn btn-submit-search">
          <img class="filter-black-icon" src="/assets/icon_search-dc4b4bb110950626b9fbef83df922bf22352c79180c14d501b361a4d3596c77e.png" width="16" height="16">
        </button>
      `.trim();

      if (allOption) body.insertBefore(wrap, allOption);
      else body.prepend(wrap);
    }
  }

  function ensurePagination(modal) {
    const body = getBody(modal);
    if (!body) return null;

    let pager = body.querySelector(`.${PAGINATION_CLASS}`);
    if (!pager) {
      pager = document.createElement('div');
      pager.className = PAGINATION_CLASS;
      body.appendChild(pager);
    }
    return pager;
  }

  function renderMemberPage(modal, page, queryText) {
    const body = getBody(modal);
    if (!body) return;

    const q = (queryText || '').trim().toLowerCase();
    const allOption = body.querySelector('.option.option-all');

    if (allOption) allOption.style.display = '';

    const allMembers = getMemberOptions(body);
    const matched = allMembers.filter(opt => {
      const text = (opt.textContent || '').trim().toLowerCase();
      return (!q || text.includes(q));
    });

    const totalPages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
    const current = Math.min(Math.max(1, page), totalPages);
    const start = (current - 1) * PER_PAGE;
    const end = start + PER_PAGE;

    const visibleSet = new Set(matched.slice(start, end));
    allMembers.forEach(opt => { opt.style.display = visibleSet.has(opt) ? '' : 'none'; });

    const pager = ensurePagination(modal);
    if (!pager) return;

    pager.innerHTML = '';
    pager.dataset.page = String(current);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tm-page-btn' + (i === current ? ' is-active' : '');
      btn.textContent = String(i);

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const input = modal.querySelector(`#${INPUT_ID}`);
        renderMemberPage(modal, i, (input?.value || ''));
      });

      pager.appendChild(btn);
    }
  }

  function setupMemberModal(modal) {
    if (!modal) return;
    const body = getBody(modal);
    if (!body) return;

    ensureMemberSearchBar(modal);
    ensurePagination(modal);

    const input = modal.querySelector(`#${INPUT_ID}`);
    const btn = modal.querySelector(`.${SEARCH_WRAP_CLASS} button`);

    const apply = () => renderMemberPage(modal, 1, (input?.value || ''));

    if (input && !input.dataset.tmBound) {
      input.dataset.tmBound = '1';
      input.addEventListener('input', apply);
    }
    if (btn && !btn.dataset.tmBound) {
      btn.dataset.tmBound = '1';
      btn.addEventListener('click', apply);
    }

    renderMemberPage(modal, 1, (input?.value || ''));
  }

  function isModalOpen(modal) {
    return !!(modal && !modal.classList.contains('d-none'));
  }

  function hasOptions(modal) {
    const body = getBody(modal);
    if (!body) return false;
    return getMemberOptions(body).length > 0;
  }

  function setupMemberWhenReady(modal) {
    if (!modal) return;

    const body = getBody(modal);
    if (body && !body.dataset.tmObserverBound) {
      body.dataset.tmObserverBound = '1';
      const obs = new MutationObserver(() => {
        if (isModalOpen(modal) && hasOptions(modal)) {
          setupMemberModal(modal);
          obs.disconnect();
          delete body.dataset.tmObserverBound;
        }
      });
      obs.observe(body, { childList: true, subtree: true });
    }

    let tries = 0;
    const maxTries = 20;
    const tick = () => {
      tries++;
      if (isModalOpen(modal) && hasOptions(modal)) {
        setupMemberModal(modal);
        return;
      }
      if (tries >= maxTries) return;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // クリック時だけ軽く初期化（ページング/検索バー内クリックは除外）
  document.addEventListener('click', (e) => {
    const modal = document.querySelector(MEMBER_MODAL_SEL);
    if (!modal) return;

    if (e.target.closest(`.${PAGINATION_CLASS}`)) return;
    if (e.target.closest(`.${SEARCH_WRAP_CLASS}`)) return;
    if (e.target.closest(`${MEMBER_MODAL_SEL} .dropdown-body .option`)) return;

    setupMemberWhenReady(modal);
  }, true);

  // =========================================================
  // SP：可能なら PC側DOMを優先して開かせる（壊さない範囲）
  // =========================================================
  function bindSpFilterButtonToPcDom() {
    const spBtn = document.querySelector('.div-sort-sp[data-target="#modalFilterCommonAll"]');
    const pcRoot = document.querySelector('.filter-common-all.dropdown-new-stype, td.td-filter-box .filter-common-all');
    if (!spBtn || !pcRoot) return;

    if (spBtn.dataset.tmBoundToPc) return;
    spBtn.dataset.tmBoundToPc = '1';

    spBtn.addEventListener('click', (e) => {
      try {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();

        const pcBtn = document.querySelector('td.td-filter-box [onclick*="selectFilterDisplay"]');
        if (pcBtn) {
          pcBtn.click();
          return;
        }
      } catch (_) {}
    }, true);
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
    normalizeFilterButton();
    applyFilterByConfig(pageKey);
    bindSpFilterButtonToPcDom();
  }

  // 初回
  apply();

  // SPA/遷移対策：URLが変わった時だけ再適用する
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      setTimeout(apply, 50);
    }
  }, RECHECK_MS);

})();
