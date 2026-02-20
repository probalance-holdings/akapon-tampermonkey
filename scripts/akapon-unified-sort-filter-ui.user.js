// ==UserScript==
// @name         アカポン（共通部分のみ｜並び順＋検索・絞り込みUI統合）※akapon-unified-sort-filter-ui.user.js
// @namespace    akapon
// @version      2026.02.20.1200
// @match        https://member.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-unified-sort-filter-ui.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-unified-sort-filter-ui.user.js
// ==/UserScript==

(() => {
  'use strict';

  /* =========================================================
     【エンジニア向けコメント置き場】

     目的：
     - 既存の「並び順」「検索・絞り込み」が存在するページだけ、ボタン＋モーダルの見た目を共通化
     - HTML注入（innerHTML置換）は行わず、既存DOMを活かす
     - 並び順モーダル：存在する項目だけ優先順で並べ替え（項目が無いページは触らない）
     - 検索・絞り込み：必ず最後に「件数」（.select-filter-eachpage）が来るように移動（存在する場合のみ）
     - qs-datepicker（カレンダー）の曜日/日付ズレは CSS で 7列grid固定して補正（見た目のみ）

     注意：
     - SearchForm.selectSortDisplay / selectFilterDisplay 等の既存onclick/機能は変更しない
     - DOM構造が想定と違うページは、できる範囲だけ適用し、壊さない

     追加（共通＋分岐の橋渡し）：
     - window.AKAPON_UI を共通側で作成し、ページ別scriptが handler 登録できるようにする
     - 共通側は applyBase()（共通適用）→ applyAll()（共通＋ページ別handler）で実行
     ========================================================= */

  const STYLE_ID = 'tm-unified-sort-filter-style-v1';
  const APPLIED_ATTR = 'data-tm-unified-sort-filter-applied';

  // ✅ 旧HTML方式：td.td-filter-box へ 1回だけ注入した印
  const FILTER_HTML_FLAG_ATTR = 'data-tm-filter-html-applied';

  // SPA/遷移対策（軽量）：URL変化時 + 描画後に再適用
  const RECHECK_MS = 400;

  // ---------------------------------------------
  // 共通CSS（既存CSS版を統合）
  // - sort: アカポン（プロジェクト｜並び順）CSS版をベース
  // - filter: アカポン（プロジェクト｜検索・絞り込み）CSS版をベース
  // - qs-datepicker: 7列grid固定 + 見た目調整
  // ---------------------------------------------
  const CSS = `
/* =========================
   共通：ボタン見た目（並び順）
========================= */
td.td-sort-box .border-new.sort{
  background: #1f1f1f !important;
  color: #fff !important;
  border-radius: 12px !important;

  /* ✅ shadow：並び順の効きすぎを抑えて検索・絞り込みと同じに */
  box-shadow: 0 6px 18px rgba(0,0,0,.22) !important;

  border: 1px solid #1f1f1f !important;
  padding: 8px 12px !important;
  justify-content: space-between !important;
  align-items: center !important;
}

/* ✅ hover時も統一（必要なら） */
td.td-sort-box .border-new.sort:hover{
  box-shadow: 0 8px 22px rgba(0,0,0,.26) !important;
}

td.td-sort-box .border-new.sort:hover{
  background: #3f3f3f !important;
  border-color: #3f3f3f !important;
}
td.td-sort-box .border-new.sort .sort-text-display{
  color: #fff !important;
  font-weight: 800 !important;
  display: block !important;
  width: 100% !important;
  text-align: center !important;
  margin: 0 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
td.td-sort-box .border-new.sort > div img{
  display: none !important; /* 右chevronは隠す（デザイン統一） */
}

/* ✅ 追加：並び順ボタン内のアイコン類（左アイコン等）も非表示（旧の見た目へ） */
td.td-sort-box .border-new.sort img,
td.td-sort-box .border-new.sort svg{
  display: none !important;
}

/* ✅ 追加：検索・絞り込みボタン内のアイコン（スライダーSVG等）を非表示（旧の見た目へ） */
td.td-filter-box [onclick*="SearchForm.selectFilterDisplay"] svg,
td.td-filter-box [onclick*="SearchForm.selectFilterDisplay"] img{
  display: none !important;
}

/* =========================
   共通：ボタン見た目（検索・絞り込み）
   - ページによって .bg-gray or .filter-btn など差があるため、td直下のonclick持ちを狙う
========================= */
td.td-filter-box [onclick*="SearchForm.selectFilterDisplay"]{
  background: #1f1f1f !important;
  color: #fff !important;
  border-radius: 12px !important;
  box-shadow: 0 6px 18px rgba(0,0,0,25) !important;
  border: 1px solid #1f1f1f !important;
}
td.td-filter-box [onclick*="SearchForm.selectFilterDisplay"] *{
  color: #fff !important;
}
td.td-filter-box [onclick*="SearchForm.selectFilterDisplay"]:hover{
  background: #3f3f3f !important;
  border-color: #3f3f3f !important;
}
td.td-filter-box [onclick*="SearchForm.selectFilterDisplay"] .number{
  background: rgba(255,255,255,12) !important;
  border-radius: 999px !important;
  padding: 2px 8px !important;
  font-weight: 800 !important;

  /* ✅ 0が一瞬見える対策：JSで確定するまで隠す */
  visibility: hidden !important;
}

/* ✅ JSが確定（data-tm-ready="1"）したら表示制御 */
td.td-filter-box [onclick*="SearchForm.selectFilterDisplay"] .number[data-tm-ready="1"][data-tm-zero="0"]{
  visibility: visible !important;
  display: inline-flex !important;
}
td.td-filter-box [onclick*="SearchForm.selectFilterDisplay"] .number[data-tm-ready="1"][data-tm-zero="1"]{
  display: none !important;
}

/* ✅ 念のため：空は常に非表示 */
td.td-filter-box [onclick*="SearchForm.selectFilterDisplay"] .number:empty{
  display: none !important;
}

/* ✅ ボタン内のアイコン（SVG/img）を非表示：旧の“文字＋件数”に寄せる */
td.td-filter-box [onclick*="SearchForm.selectFilterDisplay"] svg,
td.td-filter-box [onclick*="SearchForm.selectFilterDisplay"] img{
  display: none !important;
}

/* ✅ ついでに：並び順ボタン側の左アイコンも混在するページ対策 */
td.td-sort-box .border-new.sort svg,
td.td-sort-box .border-new.sort img{
  display: none !important;
}

/* =========================
   ✅ 旧script互換：margin / overflow / filter-btn のレイアウト
========================= */

/* ❶ 右余白を消す（旧scriptと同じ） */
html body table.search-list > tbody > tr > td.td-sort-box > .border-new.mr-1,
html body table.search-list > tbody > tr > td.td-filter-box > .border-new.mr-1{
  margin-right: 0 !important;
}

/* ❷ overflow: visible（バッジ切れ防止） */
td.td-filter-box,
table.search-list,
table.search-list *{
  overflow: visible !important;
}

/* ❸ 旧の filter-btn レイアウト（class付与した場合に効く） */
td.td-filter-box .border-new.filter-btn{
  background: #1f1f1f !important;
  color: #fff !important;
  border-radius: 12px !important;

  /* ✅ shadow：検索・絞り込みも付ける（強すぎない統一影） */
  box-shadow: 0 6px 18px rgba(0,0,0,.22) !important;

  border: 1px solid #1f1f1f !important;

  padding: 8px 12px !important;
  display: inline-flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 8px !important;
}

/* ✅ hover時も統一（必要なら） */
td.td-filter-box .border-new.filter-btn:hover{
  box-shadow: 0 8px 22px rgba(0,0,0,.26) !important;
}

/* =========================
   sortBox：中央モーダル化（#sortBox / .sort_box）
   + SP modal：#modalSort を PC版と同じ見た目へ（文字サイズだけSP調整）
========================= */

/* --- PC版：#sortBox（既存） --- */
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
  box-shadow: 0 16px 38px rgba(0, 0, 0, .28) !important;
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

/* ・消す */
#sortBox.sort_box ul,
#sortBox.sort_box li{
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
#sortBox.sort_box li::marker,
#sortBox.sort_box li::before{
  content: none !important;
}

/* ✅ ❶：＋は .sort_item:before で出ているので個別に潰す */
.search-pc .sort_box_text .sort_list .sort_item::before{
  content: "" !important;
  display: none !important;
}

/* ✅ ❶「＋」を消す：.sort_item:before で出しているケース（projects等） */
.search-pc .sort_box_text .sort_list .sort_item::before{
  content: "" !important;
  display: none !important;
}

/* 行の区切り */
#sortBox.sort_box .li-sort-item{
  border-bottom: 1px solid #eee !important;
  padding: 10px 14px !important;   /* ✅ 旧：左右余白広め */
}
#sortBox.sort_box .li-sort-item:last-child{
  border-bottom: none !important;
}

/* ✅ 旧寄せ：左＝親ラベル、右＝オプション（レイアウトを安定させる） */
#sortBox.sort_box .li-sort-item{
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 10px !important;
}

/* 親ラベル（ID等） */
#sortBox.sort_box .sort_item{
  font-weight: 800 !important;
  color: #222 !important;
  white-space: nowrap !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;

  /* ✅ ❻ 旧寄せ：変なインデントを廃止 */
  text-indent: 0 !important;
  padding-left: 0 !important;

  font-size: 0.95em !important;
}

/* ✅ ❷ 親行に付く “グレー背景” を潰す（IDなどが灰色になる件） */
#sortBox.sort_box .sort_item.slted,
#sortBox.sort_box .sort_item.pcs-slted{
  background: transparent !important;
  box-shadow: none !important;
  outline: none !important;
  border: none !important;
}

/* 子（昇順/降順） */
#sortBox.sort_box .li-sort-item > ul{
  display: inline-flex !important;
  align-items: center !important;
  gap: 10px !important;
  margin: 0 !important;            /* ✅ 右寄せなので余計なmargin不要 */
  padding: 0 !important;
}
#sortBox.sort_box .li-sort-item > ul > li.sort-option{
  display: inline-flex !important;
  position: relative !important;   /* ✅ ✓ の基点 */
}

/* 子ボタン */
#sortBox.sort_box .li-sort-item > ul > li.sort-option a{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 6px 12px !important;
  line-height: 1.2 !important;
  font-size: 14px !important;
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

/* ✅ 選択状態 */
#sortBox.sort_box .li-sort-item > ul > li.sort-option.slted a,
#sortBox.sort_box .li-sort-item > ul > li.sort-option.pcs-slted a{
  background: #eef3ff !important;
  border-color: #1e3c72 !important;
  color: #1e3c72 !important;
  box-shadow: 0 0 0 2px rgba(30, 60, 114, .15) !important;
}

/* ✅ ❶❸：選択時に ✓ を必ず表示（再オープン時も class が残れば出る） */
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

/* --- SP版：#modalSort（追加） --- */
/* modal枠・影・角丸を #sortBox 相当に寄せる */
#modalSort .modal-dialog.modal-style{
  width: 86% !important;
  max-width: 420px !important;
  margin: 0 auto !important;
}

#modalSort .modal-content{
  border-radius: 14px !important;
  overflow: hidden !important;
  border: none !important;
  box-shadow: 0 16px 38px rgba(0, 0, 0, .28) !important;
}
#modalSort .container-new.search{
  padding: 0 !important;
}

/* ヘッダーを PC版のタイトルバーに寄せる */
#modalSort .modal-header{
  padding: 12px 14px !important;
  background: linear-gradient(90deg, #1e3c72, #555) !important;
  color: #fff !important;
  font-weight: 800 !important;
  border: none !important;
}
#modalSort .modal-header *{
  color: #fff !important;
}

/* =========================================================
   ✅ ❷ SPモーダル内の文字が大きい件：#modalSort だけ縮小
========================================================= */
@media (max-width: 991px){
  /* タイトル（並び順） */
  #modalSort .modal-header{
    padding: 10px 12px !important;
  }
  #modalSort .modal-header,
  #modalSort .modal-header *{
    font-size: 14px !important;
    line-height: 1.2 !important;
  }

  /* 左の項目名（ID / 作成日 / 更新日 / ...） */
  #modalSort .sort_item{
    font-size: 13px !important;
    line-height: 1.2 !important;
  }

  /* 右の選択ボタン（古い順/新しい順 等） */
  #modalSort .li-sort-item > ul > li.sort-option a{
    font-size: 12px !important;
    padding: 5px 10px !important;
  }

  /* ✓ バッジも少し縮小 */
  #modalSort .li-sort-item > ul > li.sort-option.slted::after,
  #modalSort .li-sort-item > ul > li.sort-option.pcs-slted::after{
    width: 16px !important;
    height: 16px !important;
    font-size: 11px !important;
    right: -6px !important;
  }

  /* ① 行間：li 本体が別CSSで潰されても効くように margin も追加 */
  #modalSort .sort_box_text .sort_list > li.li-sort-item{
    padding-top: 7px !important;
    padding-bottom: 7px !important;
    margin-top: 0px !important;
    margin-bottom: 0px !important;
  }

  /* ② 右側ボタン群：gap が無視される/上書きされる場合に備えて li にも余白 */
  #modalSort .sort_box_text .sort_list > li.li-sort-item > ul{
    gap: 14px !important;
  }
  #modalSort .sort_box_text .sort_list > li.li-sort-item > ul > li.sort-option{
    margin-left: 6px !important;
  }
  #modalSort .sort_box_text .sort_list > li.li-sort-item > ul > li.sort-option:first-child{
    margin-left: 0 !important;
  }
}

/* body余白を #sortBox 相当に */
#modalSort .modal-body.search{
  padding: 10px 12px 10px !important;
  background: #fff !important;
  max-height: 70vh !important;
  overflow: auto !important;
}

/* list reset（#sortBox と同等） */
#modalSort .sort_list,
#modalSort .sort_list ul,
#modalSort .sort_list li{
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
#modalSort .sort_list li::marker,
#modalSort .sort_list li::before{
  content: none !important;
}

/* ✅ Vol.6互換：sort_list 自体の余白を潰す（ulのデフォpadding対策）
   - modal（#modalSort）だけに限定 */
#modalSort .sort_list{
  padding-left: 0 !important;
  margin: 4px 0 0 !important;
  padding-inline-start: 0 !important;
}

/* ✅ 「＋」表示を消す（SPでも出るケースがあるため） */
#modalSort .sort_box_text .sort_list .sort_item::before,
.search-pc #modalSort .sort_box_text .sort_list .sort_item::before{
  content: "" !important;
  display: none !important;
}

/* 行の区切り＋左右配置（PC版同等） */
#modalSort .li-sort-item{
  border-bottom: 1px solid #eee !important;
  padding: 10px 14px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 10px !important;
}
#modalSort .li-sort-item:last-child{
  border-bottom: none !important;
}

/* 親ラベル */
#modalSort .sort_item{
  font-weight: 800 !important;
  color: #222 !important;
  white-space: nowrap !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  text-indent: 0 !important;
  padding-left: 0 !important;
  font-size: 0.95em !important; /* ←基準はPCと同じ */
}

/* ✅ ❷ グレー背景を潰す（SPでも slted が付く） */
#modalSort .sort_item.slted,
#modalSort .sort_item.pcs-slted{
  background: transparent !important;
  box-shadow: none !important;
  outline: none !important;
  border: none !important;
}

/* 子（昇順/降順） */
#modalSort .li-sort-item > ul{
  display: inline-flex !important;
  align-items: center !important;
  gap: 10px !important;
  margin: 0 !important;
  padding: 0 !important;
}
#modalSort .li-sort-item > ul > li.sort-option{
  display: inline-flex !important;
  position: relative !important; /* ✓ の基点 */
}

/* 子ボタン */
#modalSort .li-sort-item > ul > li.sort-option a{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  padding: 6px 12px !important;
  line-height: 1.2 !important;

  /* ✅ PC基準（少し小さめに統一） */
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
#modalSort .li-sort-item > ul > li.sort-option a:hover{
  background: #e9eefc !important;
  border-color: #1e3c72 !important;
  color: #1e3c72 !important;
}

/* ✅ 選択状態 */
#modalSort .li-sort-item > ul > li.sort-option.slted a,
#modalSort .li-sort-item > ul > li.sort-option.pcs-slted a{
  background: #eef3ff !important;
  border-color: #1e3c72 !important;
  color: #1e3c72 !important;
  box-shadow: 0 0 0 2px rgba(30, 60, 114, .15) !important;
}

/* ✅ ✓ 表示（SPでも） */
#modalSort .li-sort-item > ul > li.sort-option.slted::after,
#modalSort .li-sort-item > ul > li.sort-option.pcs-slted::after{
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

/* ✅ SPだけ文字サイズを落とす（見た目はPC同等で、文字だけ調整） */
@media (max-width: 991px){
  #modalSort .sort_item{
    font-size: 13px !important;
    line-height: 1.2 !important;
  }

  /* ✅ SPはさらに小さく（既存の 13px に負けないよう同一セレクタで後勝ち） */
  #modalSort .li-sort-item > ul > li.sort-option a{
    font-size: 12px !important;
    padding: 5px 10px !important;
  }

  /* ✓ も少し縮小（文字が大きく見える対策） */
  #modalSort .li-sort-item > ul > li.sort-option.slted::after,
  #modalSort .li-sort-item > ul > li.sort-option.pcs-slted::after{
    width: 16px !important;
    height: 16px !important;
    font-size: 11px !important;
    right: -6px !important;
  }
}

/* =========================================================
   ✅ ❶ SP並び順ボタン（data-target="#modalSort"）をPCと同じ見た目へ
   - 黒枠・白文字・シャドー無し問題を解消
   - 文字がボタン内に収まるようにする
========================================================= */
/* =========================================================
   ✅ SP並び順ボタン（data-target="#modalSort"）を強制：黒背景＋白文字
   - 既存の background:#fff / color:#222 に負けないよう同一セレクタで上書き
========================================================= */
[data-toggle="modal"][data-target="#modalSort"].border-new.sort{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  height: 25px !important;
  min-width: 70px !important;
  padding: 0 12px !important;

  border-radius: 10px !important;

  /* ✅ 黒枠＋黒背景 */
  border: 1px solid #222 !important;
  background: #222 !important;

  /* ✅ 影は無し（添付の要望） */
  box-shadow: none !important;
}

/* 「並び順」ボタンの文字だけを、枠の中で少し上に上げる */
[data-toggle="modal"][data-target="#modalSort"].border-new.sort .sort-text-display{
  position: relative !important;
  top: -1px !important;   /* ←必要なら -2px まで */
}

/* 文字は必ず白 */
[data-toggle="modal"][data-target="#modalSort"].border-new.sort .sort-text-display{
  display: inline-block !important;
  max-width: 160px !important;

  font-size: 13px !important;
  font-weight: 800 !important;
  line-height: 1 !important;

  color: #fff !important; /* ✅ 白 */
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* 既存 img は消す（アイコン枠化防止） */
[data-toggle="modal"][data-target="#modalSort"].border-new.sort img{
  display: none !important;
}
/* SPボタンに元から入っている img は表示しない（アイコン枠化を防ぐ） */
[data-toggle="modal"][data-target="#modalSort"].border-new.sort img{
  display: none !important;
}

/* =========================
   filter modal：中央モーダル化（親 + 子）
========================= */
html body .filter-common-all.dropdown-new-stype{
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  width: 86% !important;
  max-width: 420px !important;
  background: #fff !important;
  border-radius: 14px !important;
  overflow: hidden !important;
  box-shadow: 0 16px 38px rgba(0, 0, 0, .28) !important;
  z-index: 999999 !important;
  margin: 0 !important;
  border: none !important;
}
html body .filter-common-all.dropdown-new-stype .dropdown-header{
  border-top-left-radius: 14px !important;
  border-top-right-radius: 14px !important;
}
html body .filter-common-all.dropdown-new-stype .dropdown-body{
  border-bottom-left-radius: 14px !important;
  border-bottom-right-radius: 14px !important;
}
.filter-common-all.dropdown-new-stype .dropdown-header{
  padding: 12px 14px !important;
  background: linear-gradient(90deg, #1e3c72, #555) !important;
  color: #fff !important;
  font-weight: 800 !important;
  border: none !important;
  align-items: center !important;
}
.filter-common-all.dropdown-new-stype .dropdown-header *{
  color: #fff !important;
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

td.td-filter-box [onclick*="SearchForm.selectFilterDisplay"] .number{
  /* ✅ 常時表示をやめる（0表示/チラつき対策CSSを潰さない） */
  display: none !important;

  align-items: center !important;
  justify-content: center !important;
  min-width: 20px !important;
  height: 20px !important;
  padding: 0 6px !important;
  border-radius: 999px !important;
  background: #e53935 !important;
  color: #fff !important;
  font-weight: 800 !important;
  font-size: 12px !important;
  margin-left: 6px !important;
}

/* ✅ dataで表示（既存の “visibility + data-tm-ready” ルールと整合） */
td.td-filter-box [onclick*="SearchForm.selectFilterDisplay"] .number[data-tm-ready="1"][data-tm-zero="0"]{
  display: inline-flex !important;
}

/* PC側：並び順ボタン（#sortBox を開く側）の文字だけを枠内で少し上に上げる */
td.td-sort-box [onclick*="selectSortDisplay"] .sort-text-display{
  position: relative !important;
  top: -1px !important;   /* ←必要なら -2px まで */
}

/* ✅ ❶：並び順 と 検索・絞り込み の間の空白を広げる（PC/SP共通） */
td.td-sort-box{
  padding-right: 0px !important;
}
td.td-filter-box{
  padding-left: 10px !important;
}

/* 検索・絞り込みボタン：文字だけ少し上に／枠の横幅を狭く */
.bg-gray.d-flex.cursor-pointer.mr-1.position-relative.border-new.filter-btn{
  /* ✅ ❷：枠の横幅を狭く（左右paddingをさらに減らす） */
  padding-left: 6px !important;
  padding-right: 6px !important;

  /* 余計に広がる場合の保険（必要なら） */
  min-width: unset !important;
}

/* ボタン内テキストだけ少し上に */
.bg-gray.d-flex.cursor-pointer.mr-1.position-relative.border-new.filter-btn .filter-btn-label{
  position: relative !important;
  top: -1px !important; /* ←必要なら -2px */
  line-height: 1 !important;
  display: inline-block !important;
}

/* ✅ ❸：SP版の「並び順」文字を小さく＆枠（高さ/横幅）を少し狭く */
@media (max-width: 991px){

  /* SP：並び順ボタン本体（貼付HTMLの class に合わせる） */
  .border-new.sort.icon-sort{
    padding: 6px 8px !important;     /* 高さ/横幅を少し小さく */
    border-radius: 10px !important;
  }

  /* SP：並び順テキスト（保険） */
  .border-new.sort.icon-sort .sort-text-display{
    font-size: 12px !important;
    line-height: 1.1 !important;
  }

  /* 念のため：td配下で描画されるケースも残す（既存互換） */
  td.td-sort-box .border-new.sort .sort-text-display{
    font-size: 12px !important;
    line-height: 1.1 !important;
  }
}

/* ✅ ここから追記：SP(<=768px)で親の font-size を確実に上書きする */
@media (max-width: 768px){

  /*
    既存の強CSS：
    .font-size-temple .border-new { font-size: var(--sp-font-size-text); ... }
    に勝つため、同じ前提（.font-size-temple）＋より具体的（.border-new.sort.icon-sort）＋ !important
  */
  .font-size-temple .border-new.sort.icon-sort{
    font-size: 12px !important;
    line-height: 1.1 !important;
  }

  /* ✅ 「並び順」テキスト：余計な右余白を消して中央寄せ */
  .font-size-temple .border-new.sort.icon-sort .sort-text-display{
    font-size: 12px !important;
    line-height: 1.1 !important;

    /* mr-1 を無効化して左右の偏りを消す */
    margin-right: 0 !important;

    /* max-width/ellipsis が中央寄せを崩すケースがあるのでSPは解除 */
    max-width: none !important;

    /* span自体も中央に */
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    width: 100% !important;
  }

  /* ✅ ボタン内の配置を確実に中央に寄せる（既存CSSに勝つため重要） */
  .font-size-temple .border-new.sort.icon-sort{
    justify-content: center !important;
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

  // ---------------------------------------------
  // ✅ 旧方式：検索・絞り込みHTML（td.td-filter-box）を 1回だけ注入
  // - ページ別scriptが template を登録した時だけ動く
  // - 他ページを壊さない（templateが無いなら何もしない）
  // ---------------------------------------------
  function applyFilterHtmlOnce() {
    const td = document.querySelector('td.td-filter-box');
    if (!td) return;

    if (td.getAttribute(FILTER_HTML_FLAG_ATTR) === '1') return;

    const path = location.pathname || '';
    const pageKey = (path === '/projects') ? 'projects' : '';

    const html = (window.AKAPON_UI && window.AKAPON_UI.filterHtmlByPage)
      ? window.AKAPON_UI.filterHtmlByPage[pageKey]
      : null;

    if (typeof html !== 'string' || !html.trim()) return;

    td.innerHTML = html;
    td.setAttribute(FILTER_HTML_FLAG_ATTR, '1');
  }

  // ---------------------------------------------
  // 並び順：項目並べ替え（存在するものだけ）
  // ※ /projects 固有は分岐scriptへ移動（ここでは触らない）
  // ---------------------------------------------
  function reorderSortItems(sortBox) {
    const ul = sortBox.querySelector('.sort_list');
    if (!ul) return;

    let items = Array.from(ul.querySelectorAll(':scope > li.li-sort-item'));
    if (items.length < 1) return;

    // カスタマイズ系は非表示（既存）
    items.forEach(li => {
      const labelEl = li.querySelector('.sort_item');
      const label = labelEl ? labelEl.textContent.replace(/\s+/g, ' ').trim() : '';

      const hasCustomizeUi = !!li.querySelector('.create-customize-sort, .customize-sort-name, [id^="customize-sort-"]');
      const isCustomizeLabel = /カスタ/i.test(label) && /マイズ/.test(label);

      if (hasCustomizeUi || isCustomizeLabel || /ファイル名/.test(label)) {
        li.style.display = 'none';
      }
    });

    items = items.filter(li => li.style.display !== 'none');
    if (items.length < 1) return;

    const score = (label) => {
      const t = (label || '').trim();
      if (/^ID$/i.test(t) || /ID/i.test(t)) return 10;
      if (/作成/.test(t)) return 20;
      if (/更新/.test(t)) return 30;
      if (/期限|予定|締切/.test(t)) return 40;
      if (/容量|サイズ|Size/i.test(t)) return 50;
      if (/ステータス|Status/i.test(t)) return 60;
      return 999;
    };

    const withMeta = items.map((li, idx) => {
      const labelEl = li.querySelector('.sort_item');
      const label = labelEl ? labelEl.textContent.replace(/\s+/g, ' ').trim() : '';
      return { li, idx, label, s: score(label) };
    });

    withMeta.sort((a, b) => (a.s - b.s) || (a.idx - b.idx));

    const frag = document.createDocumentFragment();
    withMeta.forEach(x => frag.appendChild(x.li));
    ul.appendChild(frag);
  }

  // ---------------------------------------------
  // 検索・絞り込み：件数を末尾へ
  // ---------------------------------------------
  function moveCountToLast(filterModal) {
    // 親モーダル内の一覧（select-filter群）を対象
    const body = filterModal.querySelector('.dropdown-body');
    if (!body) return;

    const countRows = Array.from(body.querySelectorAll('.select-filter-eachpage'));
    if (countRows.length === 0) return;

    // 末尾へ移動（複数あっても最後に寄せる）
    countRows.forEach(row => body.appendChild(row));
  }

  // ---------------------------------------------
  // ボタン表示テキスト統一（見た目のみ）
  // ---------------------------------------------
  function normalizeButtonTexts() {
    // --------------------------
    // 並び順ボタン（PC / SP）
    // - PC：td.td-sort-box [onclick*="selectSortDisplay"]
    // - SP：data-target="#modalSort"（bootstrap modal）
    // --------------------------
    const sortBtnPc = document.querySelector('td.td-sort-box [onclick*="selectSortDisplay"]');
    if (sortBtnPc) {
      if (!sortBtnPc.dataset.tmOrigHtml) sortBtnPc.dataset.tmOrigHtml = sortBtnPc.innerHTML;

      sortBtnPc.innerHTML = `
  <span class="mr-1 text-ellipsis sort-text-display" style="max-width: 160px;">並び順</span>
`.trim();
    }

    // ✅ SP/iPad：#modalSort を開くボタンもPCと同じ“文字だけ”にする
    const sortBtnSp = document.querySelector('[data-toggle="modal"][data-target="#modalSort"]');
    if (sortBtnSp) {
      if (!sortBtnSp.dataset.tmOrigHtml) sortBtnSp.dataset.tmOrigHtml = sortBtnSp.innerHTML;

      // 見た目はPC側の .sort-text-display に寄せる（機能は data-toggle のまま）
      sortBtnSp.innerHTML = `
  <span class="mr-1 text-ellipsis sort-text-display" style="max-width: 160px;">並び順</span>
`.trim();

      // SPボタンにもPC同等のclassを付与（CSS側で統一しやすくする）
      sortBtnSp.classList.add('border-new', 'sort');
    }
    // --------------------------
    // 検索・絞り込みボタン（td.td-filter-box内）
    // - 既存onclickは触らない
    // - ✅ innerHTML 全置換をやめる（ページ側DOMを活かす）
    // - ✅ 旧CSSが効くように class を付与（border-new filter-btn）
    // - ✅ ラベルが無いページは span を追加
    // - ✅ 0件は非表示（data-tm-zero でCSS連動）
    // --------------------------
    const filterBtn = document.querySelector('td.td-filter-box [onclick*="selectFilterDisplay"]');
    if (filterBtn) {
      if (!filterBtn.dataset.tmOrigHtml) filterBtn.dataset.tmOrigHtml = filterBtn.innerHTML;

      // 旧CSS前提のclassを付与（既存classは消さない）
      filterBtn.classList.add('border-new', 'filter-btn', 'mr-1');

      // number（既存）を取得
      const numberEl = filterBtn.querySelector('.number');

      // ラベル確保（無ければ追加）
      let labelEl = filterBtn.querySelector('.filter-btn-label');
      if (!labelEl) {
        labelEl = document.createElement('span');
        labelEl.className = 'filter-btn-label';
        labelEl.textContent = '検索・絞り込み';

        // 既存構造を崩さない：numberの直前に差し込む（無ければ先頭）
        if (numberEl && numberEl.parentNode) {
          numberEl.parentNode.insertBefore(labelEl, numberEl);
        } else {
          filterBtn.insertAdjacentElement('afterbegin', labelEl);
        }
      } else {
        labelEl.textContent = '検索・絞り込み';
      }

      // 件数制御（0非表示＋チラつき防止）
      if (numberEl) {
        const raw = (numberEl.textContent || '').trim();
        const n = parseInt(raw, 10);
        const isZero = raw === '' || Number.isNaN(n) || n <= 0;

        numberEl.setAttribute('data-tm-ready', '1');
        numberEl.setAttribute('data-tm-zero', isZero ? '1' : '0');

        if (!isZero) numberEl.textContent = String(n);
      }
    }

    // --------------------------
    // 親モーダルのヘッダー左テキスト（「全てのフィルター」→「検索・絞り込み」）
    // --------------------------
    const filterModal = document.querySelector('.filter-common-all');
    if (filterModal) {
      const headerLeft = filterModal.querySelector('.dropdown-header > div:first-child');
      if (headerLeft) {
        const txt = headerLeft.textContent.replace(/\s+/g, ' ').trim();
        if (txt && txt !== '検索・絞り込み') {
          headerLeft.setAttribute('data-tm-title', '検索・絞り込み');
          if (headerLeft.children.length === 0) headerLeft.textContent = '検索・絞り込み';
        }
      }
    }
  }

  // ---------------------------------------------
  // 共通適用（旧 applyOnce 相当）
  // ---------------------------------------------
  function applyOnce() {
    injectCssOnce();

    // ✅ 旧HTML方式：検索・絞り込みの骨組みを “1回だけ” 注入（template登録がある時のみ）
    applyFilterHtmlOnce();

    // 二重適用の軽いガード（ただしURL変化時は再適用）
    const root = document.documentElement;
    const mark = `${location.pathname}?${location.search}`;
    if (root.getAttribute(APPLIED_ATTR) === mark) {
      // 動的に変わる可能性があるので最低限だけ再実行
      normalizeButtonTexts();
      const filterModal = document.querySelector('.filter-common-all');
      if (filterModal) moveCountToLast(filterModal);
      return;
    }
    root.setAttribute(APPLIED_ATTR, mark);

    // ✅ ボタン見た目の統一（ラベル/アイコン差を吸収）
    normalizeButtonTexts();

    // 並び順モーダルが存在する場合だけ並べ替え
    const sortBox =
      document.querySelector('td.td-sort-box #sortBox') ||
      document.querySelector('#sortBox.sort_box') ||
      document.querySelector('td.td-sort-box .sort_box#sortBox');

    if (sortBox) reorderSortItems(sortBox);

    // ✅ SP/iPad：#modalSort（別DOM）にも同じ整形を適用
    const modalSort = document.querySelector('#modalSort');
    if (modalSort) reorderSortItems(modalSort);

    // 絞り込みモーダル（親）が存在する場合：件数を最後へ
    const filterModal =
      document.querySelector('td.td-filter-box .filter-common-all') ||
      document.querySelector('.filter-common-all');

    if (filterModal) moveCountToLast(filterModal);
  }

  // =========================================================
  // ✅ AKAPON_UI：共通 + ページ別scriptの橋渡し
  // =========================================================
  (function initAkaponUIBridge(){
    if (window.AKAPON_UI && window.AKAPON_UI.__inited) return;

    const AKAPON_UI = window.AKAPON_UI = window.AKAPON_UI || {};
    AKAPON_UI.__inited = true;

    // ページ別handler格納
    AKAPON_UI.pages = AKAPON_UI.pages || {};

    // ページ別登録
    AKAPON_UI.registerPage = function registerPage(pageKey, handler) {
      AKAPON_UI.pages[pageKey] = handler;
    };

    // 共通：ベース適用（既存の normalize / inject css / observer 等を呼ぶ入り口）
    AKAPON_UI.applyBase = function applyBase() {
      applyOnce();
    };

    // 実行：共通 → ページ別
    AKAPON_UI.applyAll = function applyAll() {
      AKAPON_UI.applyBase();

      const path = location.pathname || '';

      // ✅ /projects は分岐scriptへ（登録があれば呼ぶ）
      if (path === '/projects') {
        const fn = AKAPON_UI.pages.projects;
        if (typeof fn === 'function') fn();
      }
    };
  })();

  // 初回：共通 + ページ別
  if (window.AKAPON_UI && typeof window.AKAPON_UI.applyAll === 'function') {
    window.AKAPON_UI.applyAll();
  } else {
    applyOnce();
  }

  // URL変化監視（軽量）
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;

      const run = () => {
        if (window.AKAPON_UI && typeof window.AKAPON_UI.applyAll === 'function') {
          window.AKAPON_UI.applyAll();
        } else {
          applyOnce();
        }
      };

      setTimeout(run, 50);
    } else {
      // SPAでDOMが差し替わるケース用：最小の再適用
      // ここでボタン整形も軽く回す（querySelector 2回程度なので重くならない）
      normalizeButtonTexts();

      const filterModal = document.querySelector('.filter-common-all');
      if (filterModal) moveCountToLast(filterModal);

      // ✅ ページ別（/projects）も同周期で追随（登録がある場合のみ）
      if (window.AKAPON_UI && typeof window.AKAPON_UI.applyAll === 'function') {
        window.AKAPON_UI.applyAll();
      }
    }
  }, RECHECK_MS);
})();
