// ==UserScript==
// @name         2｜アカポン（プロジェクト｜検索・絞り込み）※akapon-project-hide-filter-search_css.user.js
// @namespace    akapon
// @version      1.0
// @match        https://member.createcloud.jp/*
// @match        https://akapon.jp/*
// @match        https://akapon.jp/ai/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-filter-search_css.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-filter-search_css.user.js
// ==/UserScript==

(() => {
  const STYLE_ID = 'filter_modal_center_css';

  const css = `
/* =========================================================
   Filter modal (parent + child) : center modal look (TEST)
   ========================================================= */

/* ====== Parent filter modal: center modal look ====== */
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

  /* clip-path は shadow が消える環境があるので使わない */
  /* clip-path: inset(0 round 14px) !important; */

  box-shadow: 0 16px 38px rgba(0, 0, 0, .28) !important;
  z-index: 999999 !important;
  margin: 0 !important;
  border: none !important;
}

/* ヘッダーが角を塗りつぶすケース対策 */
html body .filter-common-all.dropdown-new-stype .dropdown-header{
  border-top-left-radius: 14px !important;
  border-top-right-radius: 14px !important;
}

/* 下側（body）が角を塗りつぶすケース対策：ここがポイント */
html body .filter-common-all.dropdown-new-stype .dropdown-body{
  border-bottom-left-radius: 14px !important;
  border-bottom-right-radius: 14px !important;
}

/* Header */
.filter-common-all.dropdown-new-stype .dropdown-header{
  padding: 12px 14px !important;
  background: linear-gradient(90deg, #1e3c72, #555) !important;
  color: #fff !important;
  font-weight: 700 !important;
  border: none !important;
  align-items: center !important;
}
.filter-common-all.dropdown-new-stype .dropdown-header *{
  color: #fff !important;
  justify-content: space-between !important;
}

/* 「全てのフィルター」テキストを左に寄せる */
.filter-common-all.dropdown-new-stype .dropdown-header > div:first-child{
  margin-left: 0 !important;
  padding-left: 0 !important;
}

/* もし余白が残る場合の保険 */
.filter-common-all.dropdown-new-stype .dropdown-header .cursor-pointer{
  gap: 0 !important;
}

/* ✅ ❶ クリア / 完了 ボタン修正（白文字・白枠なし） */
.filter-common-all.dropdown-new-stype .dropdown-header .reset-data-all,
.filter-common-all.dropdown-new-stype .dropdown-header .quick-submit{
  background: transparent !important;
  color: #fff !important;
  border: none !important;
  box-shadow: none !important;
}

/* Body */
.filter-common-all.dropdown-new-stype .dropdown-body{
  padding: 10px 12px 12px !important;
  background: #fff !important;
  max-height: 70vh !important;
  overflow: auto !important;
}

/* Search */
.filter-common-all.dropdown-new-stype .search-input{
  gap: 8px !important;
  margin-bottom: 10px !important;
}
.filter-common-all.dropdown-new-stype .search-input .form-control{
  border-radius: 10px !important;
}
.filter-common-all.dropdown-new-stype .btn-submit-search{
  border-radius: 10px !important;

  /* 黒枠＋黒背景（アイコン白が見えるように） */
  border: 1px solid #000 !important;
  background: #000 !important;
  box-shadow: none !important;
}

/* 中の虫眼鏡アイコンを白に */
.filter-common-all.dropdown-new-stype .btn-submit-search img{
  filter: brightness(0) invert(1) !important;
  transform: translateY(-2px) !important; /* ← 数値で微調整可 */
}

/* Items */
.filter-common-all.dropdown-new-stype .select-filter{
  border-bottom: 1px solid #eee !important;
  padding: 10px 0 !important;
}
/* ✅ ❷ padding を効かせる（既存に勝つ） */
.filter-common-all.dropdown-new-stype .select-filter{
  padding: 10px 21px !important;

  /* ✅ margin で動かすと hover がズレるので使わない */
  margin-left: 0 !important;

  /* ✅ 左に寄せたい分だけ padding-left を減らす（数値は好みで調整） */
  padding-left: 6px !important;
}

.filter-common-all.dropdown-new-stype .select-filter:hover{
  background: #f6f8ff !important;
}
.filter-common-all.dropdown-new-stype .select-filter span{
  font-weight: 700 !important;
  color: #222 !important;
  font-size: 0.95em !important;
}
.filter-common-all.dropdown-new-stype .select-filter-right{
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
}
.filter-common-all.dropdown-new-stype .select-filter-right .chev-right{
  opacity: .7 !important;
}

/* ✅ 全項目アイコンを非表示（左アイコン全部消す） */
.filter-common-all.dropdown-new-stype .select-filter img{
  display: none !important;
}

/* ✅ 右側に「＞」を表示（疑似要素で統一） */
.filter-common-all.dropdown-new-stype .select-filter-right::after{
  content: "＞";
  font-weight: 700;
  color: #999;
  margin-left: 6px;
}

/* Each page block */
.filter-common-all.dropdown-new-stype .filter-eachpage-block{
  margin-top: 12px !important;
  padding-top: 12px !important;
  border-top: 1px solid #eee !important;
  text-align: left !important;
}
/* ✅ ❸ 余分な線を消す（border-top無効化） */
.filter-common-all.dropdown-new-stype .filter-eachpage-block{
  border-top: none !important;
}

/* ✅ ❹ 表示件数を「他と同じ行デザイン」に変更 */
.filter-common-all.dropdown-new-stype .filter-eachpage-title{
  font-weight: 700 !important;
  color: #222 !important;
  margin-bottom: 8px !important;
}
/* ● 表示件数タイトルを他と同じ左寄せ */
.filter-common-all.dropdown-new-stype .filter-eachpage-title{
  padding: 10px 0px !important;
  font-weight: 700 !important;
  color: #222 !important;
}

/* ● 件数オプションは非表示（＞で別画面表示前提） */
.filter-common-all.dropdown-new-stype .filter-eachpage-options{
  display: inline-flex !important;
  gap: 10px !important;
  flex-wrap: wrap !important;
}
/* override */
.filter-common-all.dropdown-new-stype .filter-eachpage-options{
  display: none !important;
}

.filter-common-all.dropdown-new-stype .filter-eachpage-options .option{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 6px 10px !important;
  border-radius: 10px !important;
  border: 1px solid #ddd !important;
  background: #f7f7f7 !important;
  color: #222 !important;
  font-weight: 700 !important;
  transition: background-color .15s ease, border-color .15s ease, color .15s ease !important;
}
.filter-common-all.dropdown-new-stype .filter-eachpage-options .option:hover{
  background: #e9eefc !important;
  border-color: #1e3c72 !important;
  color: #1e3c72 !important;
}
.filter-common-all.dropdown-new-stype .filter-eachpage-options .option.slted{
  background: #eef3ff !important;
  border-color: #1e3c72 !important;
  color: #1e3c72 !important;
  box-shadow: 0 0 0 2px rgba(30, 60, 114, .15) !important;
}

/* ====== Filter button ====== */
td.td-filter-box .border-new.filter-btn{
  background: #1f1f1f !important;
  color: #fff !important;
  border-radius: 12px !important;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .25) !important;
  border: 1px solid #1f1f1f !important;
  padding: 8px 12px !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 8px !important;
}

td.td-filter-box .border-new.filter-btn .filter-btn-label{
  color: #fff !important;
  font-weight: 700 !important;
  line-height: 1 !important;
}

td.td-filter-box .border-new.filter-btn .number{
  color: #fff !important;
  font-weight: 700 !important;
  line-height: 1 !important;
}

/* Table overflow (keep click area) */
td.td-filter-box,
table.search-list,
table.search-list *{
  overflow: visible !important;
}

/* =========================================================
   Child filter modals (sub filter)
   ========================================================= */

/* ① すべての子フィルターモーダルを中央固定 */
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

  /* ✅ 黒線を消してシャドーのみ */
  border: none !important;
  outline: none !important;
  box-shadow: 0 16px 38px rgba(0,0,0,.28) !important;

  z-index: 999999 !important;
}

/* 念のため：中の要素に枠が付くケースも潰す */
.filter-content.dropdown-new-stype,
.filter-content.dropdown-new-stype *{
  outline: none !important;
}

/* ② ヘッダーをサンプルと同じデザインに統一 */
.filter-content.dropdown-new-stype .dropdown-header{
  padding: 12px 14px !important;
  background: linear-gradient(90deg,#1e3c72,#555) !important;
  color: #fff !important;
  font-weight: 700 !important;
}
.filter-content.dropdown-new-stype .dropdown-header *{
  color: #fff !important;
}

/* ✅ 子モーダル：ヘッダー右の クリア/完了（白枠・背景・影を消して白文字固定） */
.filter-content.dropdown-new-stype .dropdown-header .reset-data,
.filter-content.dropdown-new-stype .dropdown-header .quick-submit{
  background: transparent !important;
  color: #fff !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* フォーカス時に枠が出るのも潰す */
.filter-content.dropdown-new-stype .dropdown-header .reset-data:focus,
.filter-content.dropdown-new-stype .dropdown-header .quick-submit:focus,
.filter-content.dropdown-new-stype .dropdown-header .reset-data:active,
.filter-content.dropdown-new-stype .dropdown-header .quick-submit:active{
  outline: none !important;
  box-shadow: none !important;
}

/* ===== 戻る（＜）の見た目を「白・太字」にして、IDとの間隔を広げる ===== */
.filter-content.dropdown-new-stype .dropdown-header .cursor-pointer{
  display: inline-flex !important;
  align-items: center !important;
  gap: 14px !important;   /* ← IDとの距離（好みで 10〜18 で調整） */
}

/* 既存の画像矢印は使わず、太字の「＜」を疑似要素で表示 */
.filter-content.dropdown-new-stype .dropdown-header .cursor-pointer img{
  display: none !important;
}
/* ✅ 親モーダル（全てのフィルター）には「＜」を出さない */
.filter-content.dropdown-new-stype.filter-common-all .dropdown-header .cursor-pointer::before{
  content: none !important;
}

/* ✅ 子モーダル（ID/作成日など）だけ「＜」を出す */
.filter-content.dropdown-new-stype:not(.filter-common-all) .dropdown-header .cursor-pointer::before{
  content: "＜" !important;
  color: #fff !important;
  font-weight: 900 !important;
  font-size: 18px !important;
  line-height: 1 !important;
}

/* ③ 本文共通 */
.filter-content.dropdown-new-stype .dropdown-body{
  padding: 12px !important;
  max-height: 70vh !important;
  overflow: auto !important;
}

/* =========================================================
   IDフィルター：select非表示 + inputをフル幅＆見た目改善
   ========================================================= */

/* ❶ select（プロジェクト/赤入れ）を非表示 */
.filter-content.dropdown-new-stype #type_id{
  display: none !important;
}

/* ❷ input（#q_kind_id）を横幅いっぱいに（既存 50% を潰す） */
.search-pc .td-filter-box .search-kind #q_kind_id{
  width: 100% !important;
  max-width: 100% !important;
  flex: 1 1 auto !important;
}

/* ❸ 子モーダル内の #q_kind_id を “かっこよく”（placeholderが必ず見える版） */
.filter-content.dropdown-new-stype #q_kind_id{
  height: 42px !important;
  padding: 10px 12px !important;
  border-radius: 12px !important;

  /* ✅ 白背景＋黒文字で見えるように */
  background: #fff !important;
  color: #111 !important;

  /* 枠は薄めグレー、シャドーは維持 */
  border: 1px solid rgba(0,0,0,.12) !important;
  box-shadow: 0 8px 20px rgba(0,0,0,.22) !important;

  /* 文字 */
  font-weight: 700 !important;
  letter-spacing: .02em !important;

  outline: none !important;
}

/* ✅ placeholder をグレーで表示 */
.filter-content.dropdown-new-stype #q_kind_id::placeholder{
  color: rgba(0,0,0,.45) !important;
  font-weight: 600 !important;
}

/* フォーカス時：少しだけ強調 */
.filter-content.dropdown-new-stype #q_kind_id:focus{
  border-color: rgba(0,0,0,.28) !important;
  box-shadow: 0 10px 26px rgba(0,0,0,.28) !important;
}

/* 余白：selectを消した分、input行が詰まりすぎる場合の保険 */
.filter-content.dropdown-new-stype .search-kind{
  gap: 10px !important;
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
  width: 140px !important;      /* ← ラベル幅（必要なら調整） */
  text-align: left !important;
  font-weight: 800 !important;
  color: #111 !important;
  white-space: nowrap !important;
}

/* input：横幅を狭く（フル幅にしない） */
.filter-content.dropdown-new-stype #q_created_at_gteq,
.filter-content.dropdown-new-stype #q_created_at_lteq{
  width: 220px !important;      /* ← 枠幅（必要なら 200〜260 で調整） */
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

/* =========================================================
   親モーダル：選択個数バッジ（0は非表示 / 1以上は中央・白文字）
   ========================================================= */

/* ✅ 0の時は d-none が付くので、必ず非表示にする（display上書きを防ぐ） */
.filter-common-all.dropdown-new-stype .count-filter.d-none{
  display: none !important;
}

/* ✅ 表示される時（= 1以上想定）は ●中央に白文字 */
.filter-common-all.dropdown-new-stype .count-filter{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  min-width: 24px !important;     /* ●少し大きく */
  height: 24px !important;
  padding: 0 !important;          /* ← 中央ズレ防止 */

  border-radius: 999px !important;
  font-size: 13px !important;
  font-weight: 800 !important;

  color: #fff !important;         /* 白文字 */
  line-height: 24px !important;   /* ← 縦中央を安定させる */
  text-align: center !important;
}

/* =========================================================
   qs-datepicker（カレンダー）を “かっこよく” 調整
   ※ body直下生成にも対応するため、モーダル限定セレクタを外す
   ========================================================= */

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

/* =========================================================
   fix: カレンダーが「何か」によって切れるのを防ぐ（保険）
   ※ body直下生成には overflow は関係ないが、既存を壊さない範囲で残す
   ========================================================= */
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
   親モーダル：件数行だけ線を消す
   ========================================================= */
.filter-common-all.dropdown-new-stype .select-filter.select-filter-eachpage{
  border-bottom: none !important;
}

/* =========================================================
   親モーダル：件数行だけ右側幅を確保して、行間を他と揃える
   ========================================================= */
.filter-common-all.dropdown-new-stype .select-filter.select-filter-eachpage .select-filter-right{
  min-width: 26px !important;     /* 他行の矢印画像幅に合わせる */
  width: 26px !important;
  height: 26px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
}

.filter-common-all.dropdown-new-stype .select-filter.select-filter-eachpage .filter-eachpage-title {
    padding: 0 !important;
    line-height: 1.5 !important;
}

/* =========================================================
   ステータス：5個（すべて＋4種）の縦間隔を広げる
   ========================================================= */

/* ステータスモーダル内の option をブロック化して余白を追加 */
.filter-content.dropdown-new-stype.status-filter .dropdown-body .option{
  align-items: center !important;
  padding: 1px 14px !important;     /* 行の高さ（上下）を増やす */
  margin-bottom: 10px !important;    /* 行と行の間隔 */
  border-radius: 12px !important;    /* 角丸も揃える（任意） */
}

/* 最後だけ余白なし */
.filter-content.dropdown-new-stype.status-filter .dropdown-body .option:last-child{
  margin-bottom: 0 !important;
}

/* ● とテキストの間隔も少し広げる */
.filter-content.dropdown-new-stype.status-filter .dropdown-body .option .text-status-filter{
  margin-left: 12px !important;
}

/* =========================================================
   fix: 選択中ステータスに ✓ を表示して分かりやすくする
   （選択時に付く .slted を利用）
   ========================================================= */
.filter-content.dropdown-new-stype.status-filter .dropdown-body .option.slted{
  position: relative !important;
  padding-right: 44px !important; /* ✓バッジ分 */
}

.filter-content.dropdown-new-stype.status-filter .dropdown-body .option.slted::after{
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

/* =========================================================
   絞り込みボタン：件数バッジ（0は非表示 / 中央寄せ / 少し大きく）
   ========================================================= */

/* ●（バッジ）のベース：丸＋中央寄せ */
/* =========================================================
   絞り込みボタン：件数バッジ（0は非表示 / 中央寄せ / 少し大きく）
   - 初期表示で "0" が一瞬見える問題対策：
     バッジはデフォルト非表示にして、非0確定時だけ表示する
   ========================================================= */

/* ●（バッジ）のベース：見た目は同じ（※displayはここで付けない） */
td.td-filter-box .border-new.filter-btn .number{
  /* ✅ 初期は必ず非表示（0フラッシュ根絶） */
  display: none !important;

  align-items: center !important;
  justify-content: center !important;

  width: 22px !important;
  height: 22px !important;
  border-radius: 999px !important;

  font-size: 13px !important;
  font-weight: 800 !important;

  background: #e53935 !important;
  color: #fff !important;

  line-height: 1 !important;
  padding: 0 !important;

  text-indent: 0 !important;
}

/* ❶ 空は非表示のまま */
td.td-filter-box .border-new.filter-btn .number:empty{
  display: none !important;
}

/* ✅ 非0（= data-tm-zero="0"）の時だけ表示 */
td.td-filter-box .border-new.filter-btn .number[data-tm-zero="0"]{
  display: inline-flex !important;
}

/* ✅ 0 の時は非表示 */
td.td-filter-box .border-new.filter-btn .number[data-tm-zero="1"]{
  display: none !important;
}

/* =========================================================
   親モーダル：選択数バッジ（●内の数字だけ白）
   ========================================================= */
.filter-common-all.dropdown-new-stype .select-filter .count-filter{
  color: #fff !important;          /* 数字だけ白 */
}

/* もし●（背景色）が別で付いているなら、中央寄せも一緒に */
.filter-common-all.dropdown-new-stype .select-filter .count-filter{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* =========================================================
   fix: 件数modal（表示件数）でも選択中に ✓ を表示
   ========================================================= */
.filter-content.filter-content-number-record.dropdown-new-stype .dropdown-body .option.slted{
  position: relative !important;
  padding-right: 44px !important; /* ✓バッジ分 */
}

.filter-content.filter-content-number-record.dropdown-new-stype .dropdown-body .option.slted::after{
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

/* =========================================================
   fix: 件数modal（表示件数）を「左寄せ + ✓は右」にして崩れを解消
   ========================================================= */

/* text-center 指定があっても左寄せで表示する */
.filter-content.filter-content-number-record.dropdown-new-stype .dropdown-body.search.text-center{
  text-align: left !important;
  padding: 0 !important; /* 余計なズレ防止（必要なら外してOK） */
}

/* 各行を横並び：左に数字、右に✓ */
.filter-content.filter-content-number-record.dropdown-new-stype .dropdown-body.search.text-center .option{
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;

  width: 100% !important;
  padding: 10px 44px 10px 16px !important; /* 右は✓分、左は余白 */
  margin: 0 !important;

  border-radius: 10px !important;
}

/* hover/選択時の見やすさ（任意：既存のグレー枠があるなら残してOK） */
.filter-content.filter-content-number-record.dropdown-new-stype .dropdown-body.search.text-center .option.slted{
  background: rgba(0,0,0,.06) !important;
}

/* ✓は右に固定（既存の✓CSSがあっても件数modalだけ上書き） */
.filter-content.filter-content-number-record.dropdown-new-stype .dropdown-body.search.text-center .option.slted::after{
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

/* =========================================================
   更新日フィルター：作成日と同じデザインを適用
   ========================================================= */

.filter-content.dropdown-new-stype input[name="q[updated_at_gteq]"],
.filter-content.dropdown-new-stype input[name="q[updated_at_lteq]"]{
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

.filter-content.dropdown-new-stype input[name="q[updated_at_gteq]"][readonly],
.filter-content.dropdown-new-stype input[name="q[updated_at_lteq]"][readonly]{
  cursor: pointer !important;
}

/* =========================================================
   body直下に生成される qs-datepicker 用（更新日対策）
   ※作成日など既存挙動は壊さない
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

.filter-content.dropdown-new-stype input[name="q[updated_at_gteq]"],
.filter-content.dropdown-new-stype input[name="q[updated_at_lteq]"]{
  position: relative !important;
  z-index: 5 !important;
  pointer-events: auto !important;
}

`;

  function injectCssOnce() {
    let s = document.getElementById(STYLE_ID);
    if (!s) {
      s = document.createElement('style');
      s.id = STYLE_ID;
      document.head.appendChild(s);
    }
    if (s.textContent !== css) s.textContent = css;
  }

  // 初回
  injectCssOnce();

  // 0 のときだけバッジを非表示にするため、data 属性を付与（軽量）
  const applyFilterBadgeZeroState = () => {
    document.querySelectorAll('td.td-filter-box .border-new.filter-btn .number').forEach(el => {
      const v = (el.textContent || '').trim();
      el.dataset.tmZero = (v === '0') ? '1' : '0';
    });
  };

  // ✅ ページ入った瞬間の "0" フラッシュ対策：初回は即時に1回だけ実行
  applyFilterBadgeZeroState();

  // ✅ その後は従来通り（描画タイミングやSPA遷移に追従）
  setInterval(applyFilterBadgeZeroState, 500);

  // URL変化時だけ再注入（軽量）
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      injectCssOnce();
      console.log('[TM] filter css reinjected:', lastHref);
    }
  }, 500);

  console.log('[TM] filter css injector loaded:', location.href);
})();
