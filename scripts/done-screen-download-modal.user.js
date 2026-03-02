// ==UserScript==
// @name         済｜校正画面｜Download modal※done-screen-download-modal.user.js
// @namespace    akapon
// @version      20260227 1600
// @description  download modal customize (body only)
// @match        https://member.createcloud.jp/*
// @match        https://membernew.createcloud.jp/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/done-screen-download-modal.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/done-screen-download-modal.user.js
// @run-at       document-start
// ==/UserScript==

(function () {
'use strict';

/* =========================================================
◆不具合残
　SPの時、タイトル行が追尾固定にならず。スクロールできない
 形式の種類が 何行になっても
 SP / PC どちらでも
 「形式を選択」カード（list-downloads-type を含む d-flex のブロック）が、
 セレクトボックスの下に一定の余白を空けて表示される
 その下の「ダウンロードする」ボタンが、カードのすぐ下に自然な間隔で並ぶ
 高さを 固定値（例：140px）に依存せず、中身の行数に応じて自動で伸び縮みする

 * 現状、このユーザースクリプトでは
 *   - 閉じている状態の <select> 本体（外枠・背景・角丸・シャドー）
 * だけを装飾しています。
 *
 * 一方で、クリックして開いたときの候補リスト部分は
 * ブラウザ／OS がネイティブ描画しているため、
 * CSS からは「枠の角丸」「シャドー」「背景グラデーション」などを
 * ほぼコントロールできません。
 *
 * もし候補リストも Download モーダルの世界観に合わせて
 * 角丸＋シャドー付きのカードUIにしたい場合は、
 * アプリ本体側で以下のような対応が必要になります：
 *
 *   1) <select id="select-current-page-animation"> /
 *      <select id="animation-selector-comemnt"> をそのまま使わず、
 *      自前のドロップダウンコンポーネントに置き換える。
 *      （例：現在値表示の <div> をクリックすると、
 *            その直下に <ul><li>... のリストを表示する方式）
 *
 *   2) 候補リスト側で
 *      - ホバー時のハイライト
 *      - 縦スクロール
 *      - キーボード操作（↑↓/Enter/Escape）
 *      をサポートし、現在選択中の値が分かるようにする。
 *
 *   3) 候補を選択したタイミングで、
 *      既存の select 要素と同じイベント／値更新になるように
 *      `select-current-page-animation` / `animation-selector-comemnt`
 *      に相当する状態を JS から更新する。
 *      （今のロジックを流用できるよう、インターフェースは維持）
 *
 * ここまでをシステム側で実装してもらえれば、
 * このユーザースクリプト側では
 *   - カード全体の見た目
 *   - 「ページ名」「バージョン」ラベル
 * など外枠のデザインだけを調整すれば良い状態になります。
 *
 * ※CSS/Tampermonkey だけではネイティブのドロップダウン
 *   （緑枠で囲んだ OS 標準のリスト）の見た目を完全に差し替えることはできないため、
 *   上記はシステム本体側の UI コンポーネント差し替え前提の要望です。
 * =========================================================
 */

/* =========================================================
   TM: Download modal（本文のみ制御）
   ※タイトル行は共通script側で管理
========================================================= */

function buildCssText(){
return `

/* =========================================================
   モーダル本体
========================================================= */
.modal.show .modal-content.tm-download-modal{
  padding: 0 !important;
  border-radius: 14px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 28px rgba(0,0,0,.28) !important;
  background: #fff !important;
}

.modal.show .modal-content.tm-download-modal .modal-body{
  padding: 20px 18px 24px 18px !important;
}

/* =========================================================
   セレクト部分（動画の公開URLと同じ“1本の帯”レイアウト）
========================================================= */

/* 外側の d-flex（PC 基本レイアウト） */
.modal.show .modal-content.tm-download-modal
.modal-body > .d-flex.justify-content-center{
  width: min(1000px, 96%) !important;
  margin: 10px auto 16px auto !important;
  padding: 8px 20px !important;
  height: 140px !important;  /* ★検証どおり：動画4タイプ時でも余裕を持たせる */
}

/* 念のため、システム側の .modal-download-animation 用も無色で固定 */
.modal .modal-download-animation .show-select-akaire-page-and-version{
  background-color: transparent !important;
}

/* 内側コンテナ：左がページ名、右が 01 のセレクト */
.modal.show .modal-content.tm-download-modal
.show-select-akaire-page-and-version{
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) 110px !important;
  column-gap: 14px !important;
  align-items: center !important;
  width: 100% !important;
}

/* 1個目セレクト（ページ名）は幅いっぱいに伸ばす */
.modal.show .modal-content.tm-download-modal
.show-select-akaire-page-and-version select:first-child{
  min-width: 0 !important;
}

/* 2個目セレクト（01）は最小110pxだけ保証（幅は自動） */
.modal.show .modal-content.tm-download-modal
.show-select-akaire-page-and-version select:last-child{
  min-width: 110px !important;
}

/* セレクト共通の見た目 */
.modal.show .modal-content.tm-download-modal
.show-select-akaire-page-and-version select{
  height: 40px !important;
  border-radius: 12px !important;
  border: 1px solid rgba(0,0,0,.10) !important;
  box-shadow: 0 6px 18px rgba(0,0,0,.18) !important;
  padding-left: 12px !important;
  font-weight: 600 !important;
}

/* =========================================================
   セレクト用ラベル（ページ名 / バージョン）
   - 動画公開URL側のラベルスタイルを流用
   - 追加の枠や背景は付けず、セレクトの上にチップだけ表示
========================================================= */

.modal.show .modal-content.tm-download-modal
.tm-download-select-block{
  position: relative !important;
  padding-top: 22px !important; /* ラベル分の余白だけ確保 */
}

/* 黒ラベル共通スタイル（movie側と同じ） */
.modal.show .modal-content.tm-download-modal
.tm-download-select-block::before{
  position: absolute !important;
  top: -10px !important;
  left: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 2px 10px !important;
  border-radius: 999px !important;
  background: #111 !important;
  color: #fff !important;
  font-weight: 900 !important;
  font-size: 0.95em !important;
  line-height: 1.4 !important;
  white-space: nowrap !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .25) !important;
}

/* SP のラベルは以前と同じ見え方に戻す */
@media (max-width: 768px){
  .modal.show .modal-content.tm-download-modal
  .tm-download-select-block::before{
    top: 0 !important;
    font-size: 0.72em !important;
  }
}

/* 左側セレクト用ラベル：ページ名 */
.modal.show .modal-content.tm-download-modal
.tm-download-select-page::before{
  content: "ページ名" !important;
}

/* 右側セレクト用ラベル：バージョン */
.modal.show .modal-content.tm-download-modal
.tm-download-select-version::before{
  content: "バージョン" !important;
}

/* =========================================================
   形式カード（PNG/JPG）
========================================================= */

.modal.show .modal-content.tm-download-modal
.list-downloads-type{
  background: linear-gradient(135deg,#f9fafc,#eef1f6) !important;
  border-radius: 16px !important;
  padding: 18px 22px !important;
  box-shadow: 0 8px 24px rgba(0,0,0,.18) !important;
  border: 1px solid rgba(0,0,0,.06) !important;
  min-width: 160px !important;
}

.modal.show .modal-content.tm-download-modal
.list-downloads-type .d-flex{
  align-items: center !important;
  gap: 12px !important;
  padding: 10px 6px !important;
  border-radius: 10px !important;
  transition: all .18s ease !important;
}

.modal.show .modal-content.tm-download-modal
.list-downloads-type .d-flex:hover{
  background: rgba(30,60,114,.08) !important;
  transform: translateY(-1px);
  cursor: pointer !important;
}

.modal.show .modal-content.tm-download-modal
.list-downloads-type span{
  font-size: 1.1em !important;
  font-weight: 800 !important;
  letter-spacing: .02em !important;
}

/* 右側「形式を選択」テキスト */
.modal.show .modal-content.tm-download-modal
.d-flex.mb-2.mt-2.align-items-center.justify-content-center > .font-size-16px{
  margin-left: 0 !important;
  font-weight: 700 !important;
  letter-spacing: .02em !important;
}
/* 選択状態（将来用） */
.modal.show .modal-content.tm-download-modal
.list-downloads-type .is-active{
  background: linear-gradient(90deg,#1e3c72,#2b2b2b) !important;
  color: #fff !important;
}

/* 右側説明 */
.modal.show .modal-content.tm-download-modal
.font-size-16px{
  font-weight: 700 !important;
  letter-spacing: .02em !important;
}

/* =========================================================
   ダウンロードボタン
   ========================================================= */

.modal.show .modal-content.tm-download-modal
.btn-primary{
  min-width: 180px !important;
  height: 40px !important;
  border-radius: 10px !important;
  font-weight: 800 !important;
  letter-spacing: .05em !important;
  box-shadow: 0 6px 18px rgba(0,0,0,25) !important;
}

/* ボタンの縦位置（PNG/JPG／動画4タイプどちらでも余裕を持たせる） */
.modal.show .modal-content.tm-download-modal
.justify-content-center.text-center.mt-2{
  margin-top: 60px !important;  /* ★検証どおり */
}

/* =========================================================
   PC調整
========================================================= */
@media (min-width: 1025px){

  .modal.show .modal-content.tm-download-modal .modal-body{
    padding: 0px 36px 32px 36px !important;
  }

  .modal.show .modal-content.tm-download-modal
  .show-select-akaire-page-and-version select{
    min-width: 260px !important;
  }

  .modal.show .modal-content.tm-download-modal
  .list-downloads-type span{
    font-size: 1.2em !important;
  }

}

/* =========================================================
   SP調整
========================================================= */
@media (max-width: 768px){

  /* 上下だけ余白。横は14pxまで詰める */
  .modal.show .modal-content.tm-download-modal .modal-body{
    padding: 0px 14px 20px 14px !important;
  }

  /* 帯カード：幅100%、上下マージンを詰め、高さは自動 */
  .modal.show .modal-content.tm-download-modal
  .modal-body > .d-flex.justify-content-center{
    width: 100% !important;
    margin: 0px auto 12px auto !important;
    padding: 0px 12px !important;
    height: 155px !important;  /* ★PC用140pxをSPでは解除 */
  }

  /* 中身は縦積み（2つのセレクトを上下に） */
  .modal.show .modal-content.tm-download-modal
  .show-select-akaire-page-and-version{
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    row-gap: 8px !important;
  }

  .modal.show .modal-content.tm-download-modal
  .show-select-akaire-page-and-version select{
    width: 100% !important;
    min-width: 0 !important;
  }

  .modal.show .modal-content.tm-download-modal
  .list-downloads-type{
    width: 40% !important;
  }

  .modal.show .modal-content.tm-download-modal
  .list-downloads-type span{
    font-size: 1em !important;
  }

  /* SP時：タイプ選択カード全体をもっと下げる */
  .modal.show .modal-content.tm-download-modal
  .d-flex.mb-2.mt-2.align-items-center.justify-content-center{
    margin-top: 40px !important;   /* ここでカード＋「JPG形式」をぐっと下へ */
  }

  /* SP時：カードとボタンの距離も少し広げる */
  .modal.show .modal-content.tm-download-modal
  .justify-content-center.text-center.mt-2{
    margin-top: 55px !important;   /* ボタンも一緒に下げる */
  }

}
`.trim();
}

function injectCss(){
  const id = 'tm-akapon-download-modal-css';
  let style = document.getElementById(id);
  if(!style){
    style = document.createElement('style');
    style.id = id;
    document.head.appendChild(style);
  }
  style.textContent = buildCssText();
}

/* セレクト2つをラベル付きブロックで包む */
function setupDownloadSelectLabels(modal){
  if (!modal) return;

  const wrapper = modal.querySelector('.show-select-akaire-page-and-version');
  if (!wrapper) return;

  // 一度だけ実行
  if (wrapper.dataset.tmDownloadLabeled === '1') return;

  const selects = wrapper.querySelectorAll('select');
  if (selects.length < 2) return;

  const pageSelect    = selects[0]; // ページ名
  const versionSelect = selects[1]; // バージョン

  // ページ名ブロック
  const pageBlock = document.createElement('div');
  pageBlock.className = 'tm-download-select-block tm-download-select-page';
  wrapper.insertBefore(pageBlock, pageSelect);
  pageBlock.appendChild(pageSelect);

  // バージョンブロック
  const versionBlock = document.createElement('div');
  versionBlock.className = 'tm-download-select-block tm-download-select-version';
  wrapper.insertBefore(versionBlock, versionSelect);
  versionBlock.appendChild(versionSelect);

  wrapper.dataset.tmDownloadLabeled = '1';
}

function tagModal(){
  const modal = document.querySelector('.modal.show .modal-content');
  if(!modal) return;

  const hasSelect = modal.querySelector('#select-current-page-animation');
  const hasDownloadBtn = modal.querySelector('.btn-primary');

  if(hasSelect && hasDownloadBtn){
    modal.classList.add('tm-download-modal');
    setupDownloadSelectLabels(modal);  // ★ ラベル生成をここで実行
  }
}

function init(){
  injectCss();

  new MutationObserver(function(){
    tagModal();
  }).observe(document.body,{
    childList:true,
    subtree:true
  });
}

requestAnimationFrame(init);
})();
