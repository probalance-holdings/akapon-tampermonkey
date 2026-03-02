// ==UserScript==
// @name         済｜校正画面｜動画の公開URL modal ※done-screen-movie-url-modal.user.js
// @namespace    akapon
// @version      0.0.2
// @description  movie share url modal customize (body only)
// @match        https://member.createcloud.jp/*
// @match        https://membernew.createcloud.jp/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/done-screen-movie-url-modal.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/done-screen-movie-url-modal.user.js
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

/* =========================================================
  【エンジニア向け対応依頼】

  tm-movie-url-modal を
  「モーダル外側クリックで閉じる」仕様に変更してください。

  ※現在、フロント側で display:none を直接制御すると
    再オープンできなくなるため、
    JSで display 操作は行わないでください。

  ■ 正しい対応方法（Bootstrap前提）

    1. modal を初期化する際に
       backdrop: true
       keyboard: true
       を有効にする

    2. もし data属性で制御する場合は
       data-backdrop="true"
       data-keyboard="true"
       を指定する

  ■ NG
    - style.display = 'none'
    - classList.remove('show') だけで閉じる
    - backdrop を手動で remove()

  必ず Bootstrap の Modal API 経由で close してください。
========================================================= */

  /* =========================================================
     CSS（タイトル行は一切触らない）
     ========================================================= */
  function buildCssText() {
    return `
/* =========================================================
   TM: 動画の公開URL modal（本文のみ制御）
   ========================================================= */

.modal.show .modal-content.tm-movie-url-modal{
  padding: 0 !important;
  margin: 0 auto !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 28px rgba(0,0,0,.28) !important;
  background: #fff !important;
  color: #000 !important;
}

/* body */
.modal.show .modal-content.tm-movie-url-modal .modal-body{
  padding: 14px !important;
  background: #fff !important;
  color: #000 !important;
}

/* 説明文（PC時のみ右へ寄せる） */
.modal.show .modal-content.tm-movie-url-modal .modal-body > span.mb-3{
  display: block !important;
  text-align: left !important;
  margin-top: 2px !important;
  margin-bottom: 10px !important;
  font-size: 0.9em !important;
}

/* PCのみ位置調整 */
@media (min-width: 769px){
  .modal.show .modal-content.tm-movie-url-modal .modal-body > span.mb-3{
    width: min(760px, 100%) !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
}

/* ================================================
   パンくず：ラベル枠（黒背景・白文字）を各要素の上に追加
   - 左：プロジェクト名（左寄せ）
   - 中：ファイル名
   - 右：ページ名
   - 区切り「＞」はそのまま表示
   - 高さはラベル分だけ増やす
   ================================================ */
/* =========================================================
   パンくず枠 横幅拡張 ＋ ページを確実に枠内へ
   ========================================================= */
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page{
  width: min(1000px, 96%) !important;
  margin: 0 auto 16px auto !important;
  box-shadow: 0 6px 22px rgba(0, 0, 0, .25) !important;

  /* ★中央列を上限260pxで固定（ページが押し出されない） */

  grid-template-columns: auto auto minmax(0, 260px) auto 110px !important;
  column-gap: 14px !important;
  align-items: center !important;

  padding: 5px 20px !important;

  background: linear-gradient(135deg, #f8f9fb, #eef1f6) !important;
  border: 1px solid rgba(0,0,0,.08) !important;
  border-radius: 16px !important;

  /* flex系の既存指定に負けない保険 */
  justify-content: initial !important;
}

/* ＞ を必ず2つ表示（消されても復活） */
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page .mx-1{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  /* ★太字・大きいのをやめる */
  font-weight: 400 !important;
  font-size: 0.95em !important;
  opacity: 0.60 !important;

  /* ★背景と同化して見えない対策 */
  color: #777 !important;

  /* ★ここが本命：余白を持たせず、区切り幅を固定 */
  width: 14px !important;
  min-width: 14px !important;
  max-width: 14px !important;
  flex: 0 0 14px !important;

  margin: 0 !important;
  padding: 0 !important;
  user-select: none !important;
}

/* 文字（3つの値）を小さめ＆太字解除（見た目を戻す） */
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(1),
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(3),
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(5){
  font-weight: 400 !important;
  font-size: 0.92em !important;

  /* ★左寄せを確実にする（既存が中央寄せでも上書き） */
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  text-align: left !important;
  min-width: 0 !important;
}

/* 左（プロジェクト名）：見えない対策（色を明示＋ellipsis保険） */
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(1){
  color: #333 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* ★中央（ファイル名）は260pxで止めて、ellipsis確実（左寄せ維持） */
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(3){
  width: 100% !important;

  max-width: 260px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;

  box-shadow: none !important;
  color: #333 !important;
}

/* ★右（ページ）：右側の列には置きつつ、枠内は左寄せ */
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(5){
  justify-self: end !important;
  width: 110px !important;
  min-width: 110px !important;
  white-space: nowrap !important;

  /* 枠内左寄せ */
  justify-content: flex-start !important;
  text-align: left !important;

  font-weight: 400 !important;
  color: #1e3c72 !important;
}

/* text-ellipsis クラス側も一応統一（他CSSに負けないよう） */
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page .text-ellipsis{
  /* ★ inline対策 */
  display: block !important;
  width: 100% !important;

  max-width: 260px !important;
  min-width: 0 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

/* 5要素の配置（HTML順を固定で当てる） */
.modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(1){ grid-column: 1 !important; }
.modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(2){ grid-column: 2 !important; }
.modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(3){ grid-column: 3 !important; }
.modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(4){ grid-column: 4 !important; }
.modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(5){ grid-column: 5 !important; }

/* 区切り「＞」 */
.modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page .mx-1{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  opacity: 0.60 !important;
  font-weight: 400 !important;
  font-size: 0.95em !important;

  /* ★ここが本命：余白を持たせず、区切り幅を固定 */
  width: 14px !important;
  min-width: 14px !important;
  max-width: 14px !important;
  flex: 0 0 14px !important;

  margin: 0 !important;
  padding: 0 !important;
  user-select: none !important;
}

/* =========================================================
   TM Movie URL: 3要素（プロジェクト/ファイル/ページ）
   - ❶ ファイル名の ellipsis を最優先（長文でもページ名が押し出されない）
   - ❷ 区切り「＞」を必ず表示（色を明示）
   - 黒ラベルは「要素内の上部」に配置（overflow:hidden でも見切れない）
   ========================================================= */

/* ★ 親側はラベル分の高さだけ確保（見切れ対策） */
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page{
  padding-top: 10px !important;
  overflow: visible !important;
  height: auto !important;
  min-height: 0 !important;
}

/* 区切り「＞」が見えない対策（色を固定） */
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page .mx-1{
  color: #777 !important;
}

/* 3つの値span：ラベルは“内側上”に置く前提で統一 */
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(1),
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(3),
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(5){
  position: relative !important;

  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  border-radius: 5px !important;

  /* ラベル（上）＋値テキスト（下） */
  padding-top: 23px !important;
  padding-right: 0 !important;
  padding-bottom: 0 !important;
  padding-left: 0 !important;

  text-align: left !important;
/* ★赤枠の空白原因を除去（横幅を勝手に確保しない） */
min-width: 250px !important;	min-width: 0 !important;

  /* ★ ellipsis のため必須 */
  overflow: hidden !important;
}

/* 左端は左寄せ（長い場合は省略） */
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(1){
  justify-self: start !important;
  white-space: nowrap !important;
  max-width: 320px !important;
  text-overflow: ellipsis !important;
}

/* ★中央（ファイル名）は260pxで止めて ellipsis 確実 */
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(3){
  display: block !important;
  width: 100% !important;

  max-width: 260px !important;
  white-space: nowrap !important;
  text-overflow: ellipsis !important;

  color: #333 !important;
  font-weight: 400 !important;
  font-size: 0.92em !important;
}

/* 右（ページ名）は枠内固定で右寄せ（はみ出し防止） */
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(5){
  justify-self: end !important;
  min-width: 70px !important;
  white-space: nowrap !important;

  /* 色強調は維持、太字は解除 */
  font-weight: 400 !important;
  color: #1e3c72 !important;
}

/* 黒ラベル：値spanの“内側上”へ（overflow:hidden でも切れない） */
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(1)::before,
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(3)::before,
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(5)::before{
  position: absolute !important;

  /* ★内側に置く */
  top: 0 !important;
  left: 0 !important;

  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  padding: 2px 10px !important;
  border-radius: 999px !important;

  background: #111 !important;
  color: #fff !important;

  font-weight: 900 !important;
  font-size: 0.72em !important;
  line-height: 1.4 !important;

  white-space: nowrap !important;
  box-shadow: 0 2px 8px rgba(0,0,0,.25) !important;
}

/* ラベル文言 */
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(1)::before{ content: "プロジェクト名" !important; }
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(3)::before{ content: "ファイル名" !important; }
html body .modal.show .modal-content.tm-movie-url-modal
.show-position-of-animation-page > span:nth-child(5)::before{ content: "ページ名" !important; }

/* SP微調整 */
@media (max-width: 768px){
  .modal.show .modal-content.tm-movie-url-modal .show-position-of-animation-page{
    font-size: 0.85em !important;
    padding: 8px 12px !important;
    gap: 4px !important;
  }

  .modal.show .modal-content.tm-movie-url-modal
  .show-position-of-animation-page .text-ellipsis{
    max-width: 140px !important;
  }
}

/* URL行 */
.modal.show .modal-content.tm-movie-url-modal .show-input-share-akaire-detail{
  width: min(760px, 100%) !important;
  margin: 0 auto !important;
}

.modal.show .modal-content.tm-movie-url-modal input.form-control.input-share-video{
  flex: 1 1 260px !important;
  width: auto !important;
  min-width: 0 !important;
  height: 40px !important;
  line-height: 40px !important;
  border-radius: 12px !important;
  border: 1px solid rgba(0,0,0,.10) !important;
  box-shadow: 0 6px 18px rgba(0,0,0,.18) !important;
  padding-left: 14px !important;
}

.modal.show .modal-content.tm-movie-url-modal .btn-copy-share-url-akaire-page{
  height: 40px !important;
  border-radius: 12px !important;
  border: 1px solid rgba(0,0,0,.12) !important;
  box-shadow: 0 6px 18px rgba(0,0,0,.18) !important;
  background: #fff !important;
}

/* パスワードブロック */
.modal.show .modal-content.tm-movie-url-modal .show-text-of-modal-share-video{
  width: min(760px, 100%) !important;
  margin: 12px auto 0 auto !important;
  text-align: center !important;
}

.modal.show .modal-content.tm-movie-url-modal
.show-text-of-modal-share-video .d-flex.justify-content-between.h-21px{
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  width: 100% !important;
}

/* 閉じるボタン */
.modal.show .modal-content.tm-movie-url-modal .text-center.mt-3 .btn{
  font-weight: 900 !important;
  border-radius: 8px !important;
  min-height: 34px !important;
  line-height: 34px !important;
  padding: 0 16px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,.18) !important;
}

/* SP調整 */
@media (max-width: 768px){
  .modal.show .modal-content.tm-movie-url-modal input.form-control.input-share-video{
    height: 36px !important;
    line-height: 36px !important;
  }
  .modal.show .modal-content.tm-movie-url-modal .btn-copy-share-url-akaire-page{
    height: 36px !important;
  }
}
`.trim();
  }

  function injectCss() {
    const id = 'tm-akapon-movie-url-modal-css';
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = buildCssText();
  }

  function tagModal() {
    const modal = document.querySelector('.modal.show .modal-content');
    if (!modal) return;

    const hasInput = modal.querySelector('.input-share-video');
    const hasCopy = modal.querySelector('.btn-copy-share-url-akaire-page');
    if (!hasInput || !hasCopy) return;

    modal.classList.add('tm-movie-url-modal');
  }

function moveMovieDescriptionOnce(){
  const modal = document.querySelector('.modal-content.tm-movie-url-modal');
  if (!modal) return;

  if (modal.dataset.tmMovieDescMoved === '1') return;

  const desc = modal.querySelector('span.mb-3');
  const bar  = modal.querySelector('.show-position-of-animation-page');
  if (!desc || !bar) return;

  const centerBlock = bar.closest('.text-center');
  if (!centerBlock) return;

  if (centerBlock.contains(desc)) {
    modal.dataset.tmMovieDescMoved = '1';
    return;
  }

  // ★ <br> を削除（改行タグだけ除去）
  desc.innerHTML = desc.innerHTML.replace(/<br\s*\/?>/gi, '');

  // ★ 中央寄せに変更
  desc.style.display = 'block';
  desc.style.textAlign = 'center';
  desc.style.fontWeight = 'bold';

  centerBlock.insertBefore(desc, centerBlock.firstChild);

  modal.dataset.tmMovieDescMoved = '1';
}

function init(){
  injectCss();

  // ★Observer連打対策：1フレームに1回だけ処理
  let rafScheduled = false;

  new MutationObserver(function(){
    // 既存の監視処理は止めない
    tagModal();

    // moveだけは間引いて軽くする
    if (rafScheduled) return;
    rafScheduled = true;

    requestAnimationFrame(function(){
      rafScheduled = false;
      moveMovieDescriptionOnce();
    });

  }).observe(document.body, {
    childList: true,
    subtree: true
  });
}

requestAnimationFrame(init);
})();
