// ==UserScript==
// @name         済｜共通｜モーダル｜タイトル行ヘッダー共通・司令塔※done-common-modal-header-master.user.js
// @namespace    akapon
// @version      20260227 1900
// @match        https://member.createcloud.jp/*
// @match        https://membernew.createcloud.jp/*
// @run-at       document-end
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/done-common-modal-header-master.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/done-common-modal-header-master.user.js
// ==/UserScript==

(() => {
  'use strict';

/*
===========================================
【エンジニア向けメモ｜共通「戻る」ボタン仕様】
対象ファイル：akapon-unified-modal-header-master.user.js
対象要素　　：.tm-file-modal-header 内の
                 a.text-underline.text-black.back-text-link.tm-file-header-back-btn
                 （data-tm-file-header-back="1" を持つ想定）

■ やりたいこと（共通ルール）
- すべてのモーダルヘッダーの「戻る」ボタンで
  「1個前の状態（アクション）」に戻す挙動を統一したい。
- 単に「閉じる」のではなく、モーダル遷移の履歴を見て戻る。

■ 1個前の状態の定義
- ブラウザ履歴 history.back() は使わない。
- 「モーダルが開いている / 開いていない」の状態をスタックで管理する。

  例）
    1. 画面のみ（モーダル無し）→ モーダルAを開く
       ⇒ スタック：[NO_MODAL, A]

    2. モーダルA → モーダルBを開く（A上からBを表示）
       ⇒ スタック：[NO_MODAL, A, B]

    3. Bの「戻る」押下
       ⇒ Bを閉じ、Aを再表示
       ⇒ スタック：[NO_MODAL, A]

    4. Aの「戻る」押下
       ⇒ 「1個前」が NO_MODAL なので、Aを閉じて元の画面だけの状態へ
       ⇒ スタックはクリア

■ 実装イメージ
- .modal.show を監視し、最前面のモーダルIDを配列に積む。
  - ID が無いモーダルは data-tm-modal-key など任意のキーで代替。
  - 最初にモーダルが開いたタイミングでダミー値 NO_MODAL を先頭に積む。

- 戻るボタンクリック時の処理（擬似コード）：
  1) クリック元 a.tm-file-header-back-btn から親 .modal 要素を取得。
  2) そのモーダルIDをスタック内から検索。
     - 見つからなければ従来どおり「単純に閉じる」でOK。
  3) スタックの末尾から現在モーダルまでを削除。
  4) 新しい末尾要素が
       - NO_MODAL の場合：現在モーダルだけ閉じる（画面のみの状態へ）。
       - それ以外の場合：現在モーダルを閉じた後、そのIDのモーダルを再表示。

- Bootstrap4 / Bootstrap5 両対応が必要。
  - window.bootstrap.Modal（BS5）
  - jQuery(modalEl).modal('hide' / 'show')（BS4）
  - どちらも取れない場合は classList・style.display で fallback。

■ 注意点
-　タイトル行は全modalで追尾固定にしてください。（一部のmodalで追尾にならず、SP時など、スクロールができず、下部が見えない不具合が生じています）
- 既存システム側で独自にモーダルを開閉している箇所があるため、
  そこと競合しないように以下を守る：
  - 「戻る」ボタンの click イベントのみをハンドリングする。
  - 他の close ボタン（×など）には介入しない。
  - 「.modal.show になったタイミング」で行い、
    外部コードからの show/hide にも追従できるようにする。

- もし一部モーダルだけ履歴連動が難しい場合は、
  data-tm-back-ignore="1" などのフラグで除外する運用も許容。
*/

  /* =========================================================
     1) CSS（1回だけ）
  ========================================================= */
  const STYLE_ID = 'tm-unified-modal-header-style-v1';
  if (!document.getElementById(STYLE_ID)) {
    const css = `
/* =========================
   元のタイトル行は非表示
========================= */
.tm-file-original-header-hidden{
  display: none !important;
}

/* =========================
   共通ヘッダー本体
   - SPでも追尾固定（sticky）
   - スクロール時にシャドー付与
========================= */
.tm-file-modal-header{
  position: sticky !important;
  top: 0 !important;
  z-index: 1065 !important; /* bootstrap modal headerより上 */
  width: 100% !important;

  /* ★希望どおり */
  padding: 13px 12px !important;
  margin: 0 0 12px 0 !important;

  border-radius: 16px 16px 0 0 !important;
  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;
  color: #fff !important;
  box-shadow: none !important;
}

/* タイトル領域がボタンを覆ってクリックできない事故を防ぐ */
.tm-file-header-title{
  text-align: center !important;
  padding: 0 62px 0 62px !important; /* 戻るボタン分の余白 */
  line-height: 1.2 !important;
  pointer-events: none !important; /* ★クリックをボタンへ通す */
}

.tm-file-header-title-text{
  display: inline-block !important;
  max-width: 100% !important;
  font-weight: 800 !important;

  /* ★希望どおり */
  font-size: 1.1em !important;
  margin-top: 4px !important;

  color: #fff !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.tm-file-modal-header.tm-shadow{
  box-shadow: 0 10px 28px rgba(0,0,0,.28) !important;
}

/* スクロールしたら付くシャドー（JSでクラス付与） */
html body .tm-file-modal-header.tm-file-menu-scrolled{
  box-shadow: 0 10px 24px rgba(0,0,0,0.22) !important;
}

/* 通知設定モーダル：本文は白背景＋黒文字で統一 */
html body .tm-file-notify-modal {
  background: #fff !important;
  color: #000 !important;
}

html body .tm-file-notify-modal,
html body .tm-file-notify-modal * {
  color: #000 !important;
}

/* 通知設定モーダルの OK ボタン位置を崩さないための軽い調整だけ */
html body .tm-file-notify-modal .btn {
  border-radius: 6px !important;
}

/* ❼ modalMenu-**** 内だけ .ml-1 の margin-left を拡大（サイト全体には影響させない） */
html body [id^="modalMenu-"].modal .modal-content.text-center .ml-1{
  margin-left: 1.25rem !important;
}

/* =========================================================
   TM: file menu modal（#modalMenu-****）
   ❶ modal-body padding 調整
   ❷ メニューを 1行2列（同サイズ）
   ❸ 1行目（保存先変更）もシャドー
   ❹ 「アクティビティ」下の線（hr）を消す
   ❺ 右側の「保存先変更」プロジェクト名は非表示（点残り対策）
   ❻ 遷移アイコンを PCでも表示 + サイズ調整
   ❼ modalMenu-**** 内だけ .ml-1 margin-left を拡大（全体には影響させない）
   ========================================================= */
html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body{
  padding: 0 !important;
}

/* =========================================================
   PC：modalMenu-**** メニューを 2列にする（SPとは分ける）
   - 現状はSPでしかgrid指定が無いため、PCが1列になっている
========================================================= */
@media (min-width: 1024px){
  html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body > .text-left{
    width: min(760px, calc(100% - 72px)) !important;
    max-width: 760px !important;
    margin: 14px auto 20px !important;

    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 12px 14px !important;
    align-items: stretch !important;
  }
}

@media (max-width: 1023px){

  /* 既存：タイトル文字＆戻るボタン（←ここはそのまま） */

  /* =========================================================
     SP：modalMenu-**** のメニュー領域（幅・余白・サイズ）を上書き
     ========================================================= */

  /* メニュー領域：SP幅に合わせる（PCの min(760px, calc(100%-72px)) を上書き） */
  html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body > .text-left{
    width: calc(100% - 24px) !important;
    max-width: none !important;
    margin: 10px auto 14px !important;

    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 12px 14px !important;
    align-items: stretch !important;
  }

  /* カード：高さを低く（SP用） */
  html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body > .text-left > .dropdown-item{
    padding: 8px 10px !important;
    min-height: 38px !important;
    height: 38px !important;
  }

  /* ❶ ここだけ大きい：検証値どおり */
  html body .modal-body[data-tm-file-menu-scroll-bound="1"]
    .text-left .change-name-akaire-file .text-show-akaire-file-position{
    font-size: 0.8em !important;
    margin-left: 2px !important;
  }

  /* それ以外の文字：検証値どおり */
  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left > a.dropdown-item span,
  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left > div.dropdown-item span{
    font-size: 1.1em !important;
  }

  /* アイコン：検証値どおり（基本 12x12） */
  html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body > .text-left > .dropdown-item img{
    width: 12px !important;
    height: 12px !important;
  }

  /* 例外：pic_ids_member は 15x10 */
  html body [id^="modalMenu-"].modal .modal-content.text-center
    .modal-body > .text-left > .dropdown-item img[src*="pic_ids_member"]{
    width: 15px !important;
    height: 10px !important;
  }
}

/* ❹ 区切り線（アクティビティ下の線）を消す */
html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body > .text-left > hr.my-1{
  display: none !important;
}

/* 2列内の各カード（a/div 両対応） */
html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body > .text-left > .dropdown-item{
  width: 100% !important;
  margin: 0 !important;

  padding: 14px 16px !important;
  border-radius: 16px !important;
  border: 1px solid #ffffff !important;
  background: rgba(255,255,255,0.04) !important;

  box-shadow:
    0 10px 24px rgba(0,0,0,0.45),
    0 0 0 1px rgba(255,255,255,0.06) !important;

  transition: transform .12s ease, box-shadow .12s ease !important;

  /* ▼ 枠高さを12個すべて統一 */
  min-height: 50px !important;
  height: 50px !important;
  box-sizing: border-box !important;

  display: flex !important;
  align-items: center !important;
}

/* ❸ 1行目（保存先変更）も影を統一 */
html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body > .text-left > .dropdown-item:first-child{
  box-shadow: 0 10px 28px rgba(0,0,0,.28) !important;
}

/* ❺ 右側の「保存先変更」プロジェクト名は非表示（点残り対策） */
html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body > .text-left > .dropdown-item .default-project-name{
  display: none !important;
}

/* ▼ change-akaire-file-position コンテナごと非表示にする（点だけ残る対策） */
html body [id^="modalMenu-"].modal .modal-content.text-center
  .modal-body > .text-left .change-akaire-file-position{
  display: none !important;
}

/* ❻ 遷移アイコンを PCでも表示 + サイズ調整 */
html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body > .text-left > .dropdown-item .icon-img{
  width: 22px !important;
  height: 22px !important;
}

/* ❼ modalMenu-**** 内だけ .ml-1 margin-left を拡大（全体には影響させない） */
html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body > .text-left > .dropdown-item .ml-1{
  margin-left: 1.25rem !important;
}

/* ❺ の “点だけ残る” 対策（span 等が残るケース） */
html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body > .text-left > .dropdown-item .project-name{
  display: none !important;
}

/* ❻ 画像タグで入っている場合もサイズを揃える（共通） */
html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body > .text-left > .dropdown-item img{
  width: 22px !important;
  height: 22px !important;
}

/* ファイル削除メニュー「ファイルを削除」のテキストだけ左余白を 3px に調整 */
body a.dropdown-item[onclick^="AkaireFile.delete"]
span.text-dark.ml-2{
margin-left: 12px !important;
}

/* ▼ 「メンバー招待」アイコンだけ高さ 15px に調整 */
html body [id^="modalMenu-"].modal .modal-content.text-center
  .modal-body > .text-left > .dropdown-item img[src*="pic_ids_member"]{
  width: 22px !important;
  height: 15px !important;
}

/* ▼ 「ファイルを削除」アイコンも同じサイズに調整 */
html body [id^="modalMenu-"].modal .modal-content.text-center
  .modal-body > .text-left > .dropdown-item img[src*="trash3"]{
  width: 18px !important;
  height: 22px !important;
}

  /* =========================================================
     SP時：タイトル文字＆戻るボタンをSP用サイズに上書き
     ========================================================= */
@media (max-width: 1023px){
  html body .tm-file-modal-header .tm-file-header-title-text{
    font-size: 0.98em !important;
    margin-top: 3px !important;
  }

  html body .tm-file-modal-header
  a.text-underline.text-black.back-text-link.tm-file-header-back-btn{
    font-size: 0.8em !important;

    width: 47px !important;
    height: 23px !important;

    /* 既存の padding/min-height を無効化して「枠サイズ」を確実にする */
    padding: 0 !important;
    min-height: 0 !important;

    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
  }
}
/* ---- modal 内のタイトル（既存DOM側） ---- */
.modal.show .modal-content.text-center .modal-body.p-0 > h5.title-modal-file-menu{
  background: transparent !important;
  color: #fff !important;
}
.modal.show .modal-content.text-center .modal-body.p-0 > h5.title-modal-file-menu .icon-img{
  filter: brightness(0) invert(1) !important;
}
.modal.show .modal-content.text-center .modal-body.p-0 > h5.title-modal-file-menu .default-project-name{
  color: #fff !important;
  opacity: .95 !important;
}

/* =========================
   共通戻るボタン
========================= */
.tm-file-modal-header .tm-file-header-back-btn{
  position: absolute !important;
  right: 12px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 6px 12px !important;
  background: #fff !important;
  color: #000 !important;
  border: 1px solid #000 !important; /* ★ 枠を黒にして強調 */
  text-decoration: none !important;
  border-radius: 10px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.35) !important;
  font-size: 0.85em !important;      /* ★ 文字を少し大きめに */
  font-weight: 800 !important;

  /* ★クリック優先 */
  z-index: 2 !important;
  pointer-events: auto !important;
}

/* ★あなたの希望 hover（#555 + 白文字） */
.tm-file-modal-header .tm-file-header-back-btn:hover{
  opacity: 0.85 !important;
  background: #555 !important;
  color: #fff !important;
  border-color: #555 !important;
}

/* 共通「戻る」ボタンの最終上書き（他CSSより強く効かせる） */
html body .tm-file-modal-header
a.text-underline.text-black.back-text-link.tm-file-header-back-btn {

  /* 文字サイズ */
  font-size: 0.8em !important;

  /* 背景・文字色 */
  background: #fff !important;
  color: #000 !important;

  /* 念のため枠線も統一（既存があっても上書き） */
  border: 1px solid #000 !important;
}
/* =========================
   テーマ：通知設定/解除など（白背景・黒文字・ボタン反転）
========================= */
.tm-modal-theme-white{
  background: #fff !important;
  color: #000 !important;
}

.tm-modal-theme-white,
.tm-modal-theme-white *{
  color: #000 !important;
}

.tm-modal-theme-white .tm-file-modal-header{
  background: #ffffff !important;
  color: #000 !important;
  border-bottom: 1px solid rgba(0,0,0,.10) !important;
}

.tm-modal-theme-white .tm-file-header-title-text{
  color: #000 !important;
}

.tm-modal-theme-white .tm-file-modal-header .tm-file-header-back-btn{
  background: #000 !important;
  color: #fff !important;
  border: 1px solid #000 !important;
}

.tm-modal-theme-white .tm-file-modal-header .tm-file-header-back-btn:hover{
  background: #2b2b2b !important;
  color: #fff !important;
  opacity: 1 !important;
}

/* 既存の btn-primary を「反転」寄せに */
.tm-modal-theme-white .btn.btn-primary{
  background: #000 !important;
  border-color: #000 !important;
  color: #fff !important;
}
.tm-modal-theme-white .btn.btn-primary:hover{
  background: #2b2b2b !important;
  border-color: #2b2b2b !important;
  color: #fff !important;
}

/* タイトル行が上に来る分、body上余白が必要なケースの保険 */
.tm-file-modal-header + .modal-header,
.tm-file-modal-header + h5,
.tm-file-modal-header + p{
  margin-top: 0 !important;
}

/* メンバー招待 / 権限設定モーダル本体の角丸もヘッダーと揃えて16pxに統一 */
#popupInviteMember,
#settingMemberProjectModal{
  border-radius: 16px !important;
}

`;
    const styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  /* =========================================================
     2) 共通ヘッダー生成（1回だけ拾って差し込む）
  ========================================================= */

  const TITLE_SELECTORS = [
    // ① プロジェクト MENU
    'h5.title-menu-project',

    // ⑫/⑲ ファイル MENU / アクティビティ
    'h5.title-modal-file-menu',
    'h5.title-modal-file-menu span',
    '#show-name-history',

    // ⑬/⑭ プロジェクト先の変更系
    '.tm-project-change-header',
    '.tm-project-change-header *',

    // ⑮ 保存先最終確認
    '.tm-final-confirm-title',
    '.tm-final-confirm-header',

    // ⑱/㉗/㉘ バージョン更新/新規アップロード等
    'p.modal-title.font-weight-bold',
    'p.modal-title',
    '.modal-title.font-weight-bold',

    // ⑰/㉜ などの modal-header
    '.modal-header',
    '.modal-header *',

    // ⑧ 招待・メンバー系
    'h5.invite-member-header',
    'h5.invite-member-header span',

    // ㉖/㉕ 校正画面内の <h5> タイトル
    'h5',

    // ㉙ Download
    '.title-modal',

    // 既存 bootstrap のタイトル
    'h5.modal-title',
    'h5.modal-title *'
  ];

  // 空白整形
  function normalizeTitle(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
  }

  // 「元タイトル行」を非表示にする（影響は最小に：該当要素だけ）
  function hideOriginalHeaderElement(el) {
    if (!el) return;
    el.classList.add('tm-file-original-header-hidden');
  }

  // モーダル内のスクロールでシャドーON/OFF（SPで効く）
  function bindShadowOnScroll(modalContent) {
    if (!modalContent || modalContent.dataset.tmShadowBound === '1') return;
    modalContent.dataset.tmShadowBound = '1';

    // scroll対象は modal-body / dropdown-body 等、あり得るものを優先順で拾う
    const scroller =
      modalContent.querySelector('.modal-body') ||
      modalContent.querySelector('.dropdown-body') ||
      modalContent;

    const header = modalContent.querySelector('.tm-file-modal-header');
    if (!header || !scroller) return;

    const onScroll = () => {
      if (scroller.scrollTop > 2) header.classList.add('tm-shadow');
      else header.classList.remove('tm-shadow');
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* =========================
     戻るボタン用：モーダル履歴（1個前に戻る）
     - 1個前のアクションがモーダルならそのモーダルに戻す
     - 直前が「モーダル無し」なら単に閉じる
  ========================= */
  const MODAL_BACK_SENTINEL = '__NO_MODAL__';
  const modalBackStack = [];

  function updateModalBackStackFrom(modalsNodeList) {
    const modals = Array.from(modalsNodeList || []);
    if (!modals.length) {
      // すべて閉じたら履歴はリセット
      modalBackStack.length = 0;
      return;
    }

    const top = modals[modals.length - 1];
    if (!top) return;

    const id = top.id || top.getAttribute('data-tm-modal-key') || '';
    if (!id) return;

    const last = modalBackStack[modalBackStack.length - 1];

    if (!modalBackStack.length) {
      // 最初にモーダルが開いたときだけ「モーダル無し」の番人を入れておく
      modalBackStack.push({ id: MODAL_BACK_SENTINEL });
      modalBackStack.push({ id });
      return;
    }

    if (last && last.id === id) return; // 変化なし

    modalBackStack.push({ id });
  }

  function showModalCompat(modalEl) {
    if (!modalEl) return;

    // Bootstrap 5
    if (window.bootstrap && window.bootstrap.Modal) {
      try {
        const inst = window.bootstrap.Modal.getOrCreateInstance(modalEl);
        inst.show();
        return;
      } catch (e) {}
    }

    // Bootstrap 4 / jQuery
    if (window.jQuery && typeof window.jQuery(modalEl).modal === 'function') {
      try {
        window.jQuery(modalEl).modal('show');
        return;
      } catch (e) {}
    }

    // fallback
    modalEl.classList.add('show');
    modalEl.style.display = 'block';
    modalEl.removeAttribute('aria-hidden');
  }

  function hideModalCompat(modalEl) {
    if (!modalEl) return;

    // Bootstrap 5
    if (window.bootstrap && window.bootstrap.Modal) {
      try {
        const inst = window.bootstrap.Modal.getOrCreateInstance(modalEl);
        inst.hide();
        return;
      } catch (e) {}
    }

    // Bootstrap 4 / jQuery
    if (window.jQuery && typeof window.jQuery(modalEl).modal === 'function') {
      try {
        window.jQuery(modalEl).modal('hide');
        return;
      } catch (e) {}
    }

    // fallback
    modalEl.classList.remove('show');
    modalEl.style.display = 'none';
    modalEl.setAttribute('aria-hidden', 'true');
  }

  function goBackFromModal(modalEl) {
    if (!modalEl) return;

    const id = modalEl.id || modalEl.getAttribute('data-tm-modal-key') || '';
    if (!id) {
      // IDが無いモーダルは「閉じる」のみ
      hideModalCompat(modalEl);
      return;
    }

    // スタックから現在モーダルを探す
    let idx = modalBackStack.length - 1;
    while (idx >= 0 && modalBackStack[idx].id !== id) {
      idx--;
    }

    // 見つからない場合は通常の閉じる
    if (idx < 0) {
      hideModalCompat(modalEl);
      return;
    }

    // 現在モーダル以降を削除
    modalBackStack.splice(idx);

    const prev = modalBackStack[modalBackStack.length - 1];

    // ひとつ前が「モーダル無し」の sentinel なら、ただ閉じる
    if (!prev || prev.id === MODAL_BACK_SENTINEL) {
      hideModalCompat(modalEl);
      // いったん履歴をクリア（再度開かれたときに積み直し）
      modalBackStack.length = 0;
      return;
    }

    // 先に現在モーダルを閉じてから
    hideModalCompat(modalEl);

    // 1個前のモーダルを再表示
    const prevModal = document.getElementById(prev.id);
    if (prevModal) {
      showModalCompat(prevModal);
    }
  }

  function handleBackClick(event) {
    const btn = event.target && event.target.closest
      ? event.target.closest('.tm-file-header-back-btn')
      : null;
    if (!btn) return;

    const modal = btn.closest('.modal');
    if (!modal) return;

    // 「戻る」は常に1個前に戻す（ブラウザ履歴は使わない）
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation();
    }

    goBackFromModal(modal);
  }

/* =========================================================
   2.5) 下部modal側にあった共通ロジック（version17 から移管）
   - できるだけ既存のシステム挙動を壊さない範囲で
   - DOM/CSS は 1回だけ注入
========================================================= */

// 【非Bootstrap】メンバー招待（#popupInviteMember）にも共通ヘッダーを適用
let tmInviteMemberObserverBound = false;

function applyUnifiedHeaderInviteMemberPopup() {
  const root =
    document.getElementById('popupInviteMember') ||
    document.querySelector('#popupInviteMember.popup-invite-member');

  if (!root) return;

  // すでに適用済みならスキップ（直下に入れる）
  if (root.querySelector(':scope > .tm-file-modal-header')) return;

  const titleEl = root.querySelector('h5.invite-member-header');
  const titleText = normalizeTitle(titleEl ? titleEl.textContent : '') || 'メニュー';

  root.querySelectorAll('h5.invite-member-header').forEach(h => {
    h.classList.add('tm-file-original-header-hidden');
  });

  const header = document.createElement('div');
  header.className = 'tm-file-modal-header';
  header.innerHTML = `
    <a href="javascript:void(0)"
       class="text-underline text-black back-text-link tm-file-header-back-btn"
       data-tm-file-header-back="1">戻る</a>
    <div class="tm-file-header-title">
      <span class="tm-file-header-title-text"></span>
    </div>
  `;
  header.querySelector('.tm-file-header-title-text').textContent = titleText;

  root.insertBefore(header, root.firstChild);
}

function bindInviteMemberPopupObserverOnce() {
  if (tmInviteMemberObserverBound) return;
  tmInviteMemberObserverBound = true;

  try {
    const obs = new MutationObserver(() => {
      applyUnifiedHeaderInviteMemberPopup();
    });
    obs.observe(document.body, { childList: true, subtree: true });
  } catch (_) {}
}

// modalMenu-****：スクロールで共通ヘッダーに影を付ける（menu専用クラス）
function bindMenuHeaderScrollShadow(modal) {
  if (!modal || !(modal instanceof Element)) return;
  if (!modal.classList.contains('modal') || !(modal.id || '').startsWith('modalMenu-')) return;

  const content = modal.querySelector('.modal-content');
  const header = content ? content.querySelector('.tm-file-modal-header') : null;
  const body = modal.querySelector('.modal-body');
  if (!header || !body) return;

  const onScroll = () => {
    if (body.scrollTop > 4) header.classList.add('tm-file-menu-scrolled');
    else header.classList.remove('tm-file-menu-scrolled');
  };

  if (body.dataset.tmFileMenuScrollBound !== '1') {
    body.dataset.tmFileMenuScrollBound = '1';
    body.addEventListener('scroll', onScroll, { passive: true });
  }
  onScroll();
}

// menuモーダル（modalMenu-****）共通：直前に開いていた menuモーダルID を保持（他scriptが参照）
function rememberLastFileMenuModalIdOnce() {
  if (document.body.dataset.tmRememberLastFileMenuModalId === '1') return;
  document.body.dataset.tmRememberLastFileMenuModalId = '1';

  if (!window.__tmLastFileMenuModalId) window.__tmLastFileMenuModalId = '';

  document.addEventListener('click', (ev) => {
    const t = ev.target;
    if (!t || !t.closest) return;

    const menuModal = t.closest('[id^="modalMenu-"].modal');
    if (!menuModal) return;

    const id = menuModal.id || '';
    if (id) window.__tmLastFileMenuModalId = id;
  }, true);
}

// modalMenu-****：「ファイルの保存先を変更」行を行全体でクリック可能にする（委譲）
function enableSaveDestRowDelegateOnce() {
  if (document.body.dataset.tmFileSaveDestDelegate === '1') return;
  document.body.dataset.tmFileSaveDestDelegate = '1';

  document.addEventListener('click', (ev) => {
    const t = ev.target;
    if (!t || !t.closest) return;

    const menuModal = t.closest('[id^="modalMenu-"].modal');
    if (!menuModal) return;

    const row = t.closest('div.dropdown-item');
    if (!row) return;

    const label = row.querySelector('.text-show-akaire-file-position');
    const labelText = normalizeTitle(label ? label.textContent : '').replace(/\s+/g, '');
    if (labelText !== 'ファイルの保存先を変更') return;

    const onclickHolder =
      row.querySelector('[onclick*="AkaireFile.selectProjectForChange"]') ||
      null;
    if (!onclickHolder) return;

    const onclickStr = onclickHolder.getAttribute('onclick') || '';
    const m = onclickStr.match(/selectProjectForChange\s*\(\s*[^,]+,\s*['"](\d+)['"]\s*\)/);
    const projectId = m ? m[1] : null;
    if (!projectId) return; // 推測で実行しない

    ev.preventDefault();
    ev.stopPropagation();
    if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();

    if (window.AkaireFile && typeof window.AkaireFile.selectProjectForChange === 'function') {
      try {
        window.AkaireFile.selectProjectForChange(onclickHolder, projectId);
        return;
      } catch (_) {}
    }

    try {
      // eslint-disable-next-line no-new-func
      (new Function(onclickStr)).call(onclickHolder);
    } catch (_) {}
  }, true);
}

// modal overlay の掃除（閉じた後にクリック不能になる対策）
function forceClearModalOverlay() {
  try {
    document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
  } catch (_) {}
}

function hideModalCompat(modalEl) {
  if (!modalEl) return;

  // Bootstrap 5
  if (window.bootstrap && window.bootstrap.Modal) {
    try {
      const inst = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      inst.hide();
      return;
    } catch (_) {}
  }

  // Bootstrap 4 / jQuery
  if (window.jQuery && typeof window.jQuery(modalEl).modal === 'function') {
    try {
      window.jQuery(modalEl).modal('hide');
      return;
    } catch (_) {}
  }

  // fallback
  modalEl.classList.remove('show');
  modalEl.style.display = 'none';
  modalEl.setAttribute('aria-hidden', 'true');
}

// modalMenu のリンククリック後、次tickで「まだ開いてたら閉じる」
function bindModalMenuCloseFallbackOnce() {
  if (document.body.dataset.tmModalMenuCloseFallback === '1') return;
  document.body.dataset.tmModalMenuCloseFallback = '1';

  document.addEventListener('click', (ev) => {
    const a = ev.target && ev.target.closest
      ? ev.target.closest('[id^="modalMenu-"].modal a.dropdown-item[onclick*="hideModalForElement"]')
      : null;
    if (!a) return;

    const modal = a.closest('[id^="modalMenu-"].modal');
    if (!modal) return;

    setTimeout(() => {
      const cs = getComputedStyle(modal);
      if (cs.display !== 'none') {
        hideModalCompat(modal);
      }
      forceClearModalOverlay();
      setTimeout(forceClearModalOverlay, 0);
    }, 0);
  }, true);
}

// 「戻る」ボタンクリックでモーダルを閉じる（司令塔側へ移管）
function handleBackClick(event) {
  const btn = event.target && event.target.closest
    ? event.target.closest('.tm-file-header-back-btn')
    : null;
  if (!btn) return;

  event.preventDefault();
  event.stopPropagation();
  if (typeof event.stopImmediatePropagation === 'function') {
    event.stopImmediatePropagation();
  }

  const modal = btn.closest('.modal');
  if (!modal) return;

  try {
    const ae = document.activeElement;
    if (ae && modal.contains(ae) && typeof ae.blur === 'function') ae.blur();
  } catch (_) {}

  hideModalCompat(modal);
  forceClearModalOverlay();
  setTimeout(forceClearModalOverlay, 0);
}

  // 通知設定っぽい本文判定（タイトルが無いパターン用）
  function isNotifyLikeModal(modalContent) {
    const txt = normalizeTitle(modalContent?.textContent || '');
    return (
      txt.includes('通知') &&
      (txt.includes('OFF') || txt.includes('オフ') || txt.includes('非表示') || txt.includes('受信') || txt.includes('権限'))
    );
  }

  // CRM解除っぽい判定（タイトルが無いパターン用）
  function isCrmRemoveLike(modalContent) {
    if (!modalContent) return false;
    if (modalContent.querySelector('#render-content-with-remove-collaborator')) return true;
    const txt = normalizeTitle(modalContent.textContent || '');
    return txt.includes('解除') && (txt.includes('取引') || txt.includes('招待') || txt.includes('閲覧'));
  }

  function applyUnifiedHeader(modalContent, defaultTitle) {
    if (!modalContent) return;

    // すでに共通ヘッダーがあるなら何もしない
    if (modalContent.querySelector('.tm-file-modal-header')) {
      bindShadowOnScroll(modalContent);
      return;
    }

    // タイトルを 1 回だけ拾う
    let titleText = '';
    let usedEl = null;

    for (const sel of TITLE_SELECTORS) {
      const el = modalContent.querySelector(sel);
      if (!el) continue;

      // すでにtmヘッダー内の文字を拾わない保険
      if (el.closest('.tm-file-modal-header')) continue;

      const t = normalizeTitle(el.textContent);
      if (!t) continue;

      titleText = t;
      usedEl = el;
      break;
    }

    // タイトルが無いケースは本文から推定（この範囲だけ）
    let themeWhite = false;
    if (!titleText) {
      if (isNotifyLikeModal(modalContent)) {
        titleText = '通知設定';
        themeWhite = true;
      } else if (isCrmRemoveLike(modalContent)) {
        titleText = '解除';
        themeWhite = true;
      } else {
        titleText = defaultTitle || 'メニュー';
      }
    }

    // 元タイトル行（見つかった要素）を非表示
    if (usedEl) {
      // 例：.modal-header の場合は行全体を消したい
      const headerRow =
        usedEl.closest('.modal-header') ||
        usedEl.closest('h5') ||
        usedEl.closest('p') ||
        usedEl;
      hideOriginalHeaderElement(headerRow);
    }

    // 共通ヘッダーHTMLを作る（固定の1パターン）
    const header = document.createElement('div');
    header.className = 'tm-file-modal-header';
    header.innerHTML = `
      <a href="javascript:void(0)"
         class="text-underline text-black back-text-link tm-file-header-back-btn"
         data-tm-file-header-back="1">戻る</a>
      <div class="tm-file-header-title">
        <span class="tm-file-header-title-text"></span>
      </div>
    `;
    header.querySelector('.tm-file-header-title-text').textContent = titleText;

    // 先頭に差し込む
    modalContent.insertBefore(header, modalContent.firstChild);

    // 白テーマ付与（通知設定/解除）
    if (themeWhite) {
      modalContent.classList.add('tm-modal-theme-white');
    }

    // スクロールでシャドー
    bindShadowOnScroll(modalContent);
  }

  /* =========================================================
     3) 対象モーダル検出（重くならない：開いた瞬間だけ処理）
     - 追加DOM（childList）だけでなく
       既存DOMの class 変化（show付与）でも拾う
  ========================================================= */

  // いま「表示中」の .modal.show から .modal-content を拾う
  function scanShownModals() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
      const mc = modal.querySelector('.modal-content');
      if (mc) applyUnifiedHeader(mc, 'メニュー');
        bindMenuHeaderScrollShadow(modal);
    });
    // ★ 戻るボタン用：現在表示中のモーダルを履歴に反映
    updateModalBackStackFrom(modals);
  }

  // bootstrap: addedNodes 側からも拾う（念のため維持）
  function findBootstrapModalContents(root) {
    const list = [];
    if (!root) return list;

    // 追加ノード自身が .modal-content のこともある
    if (root.nodeType === 1 && root.matches('.modal.show .modal-content')) {
      list.push(root);
      return list;
    }

    // 追加ノード配下
    const found = root.querySelectorAll?.('.modal.show .modal-content');
    if (found && found.length) list.push(...found);
    return list;
  }

// 初回（ページロード時に開いてるモーダルがあれば拾う）
rememberLastFileMenuModalIdOnce();
enableSaveDestRowDelegateOnce();
bindModalMenuCloseFallbackOnce();

// 非Bootstrapの「メンバー招待」（#popupInviteMember）にも共通ヘッダーを適用
applyUnifiedHeaderInviteMemberPopup();
bindInviteMemberPopupObserverOnce();

// 戻るボタン（共通ヘッダー）クリックの閉じ処理
document.addEventListener('click', handleBackClick, true);

// 閉じた後に overlay が残ってクリック不能になるのを掃除
document.addEventListener('hidden.bs.modal', () => {
  forceClearModalOverlay();
  setTimeout(forceClearModalOverlay, 0);
}, true);

scanShownModals();

  // 監視①：DOM追加（従来どおり）
  const moChild = new MutationObserver(muts => {
    for (const m of muts) {
      for (const node of m.addedNodes) {
        const contents = findBootstrapModalContents(node);
        if (!contents.length) continue;
        contents.forEach(mc => applyUnifiedHeader(mc, 'メニュー'));
      }
    }
  });

  moChild.observe(document.documentElement, { childList: true, subtree: true });

  // 監視②：class 変化（show の付け外し）を拾う ← ここが本命
  const moAttr = new MutationObserver(muts => {
    for (const m of muts) {
      const t = m.target;
      if (!(t instanceof Element)) continue;

      // .modal に show が付いた瞬間（または show中に変化）だけ拾う
      if (t.classList && t.classList.contains('modal') && t.classList.contains('show')) {
        const mc = t.querySelector('.modal-content');
        if (mc) applyUnifiedHeader(mc, 'メニュー');
      }
    }
  });

  moAttr.observe(document.documentElement, {
    attributes: true,
    subtree: true,
    attributeFilter: ['class']
  });

  // クリック後に show が付くタイプへの保険（軽量・1回だけ）
  document.addEventListener('click', handleBackClick, true);

  document.addEventListener('click', () => {
    // 次の描画タイミングで確認
    setTimeout(scanShownModals, 0);
  }, true);

})();
