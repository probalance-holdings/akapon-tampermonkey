// ==UserScript==
// @name         21｜アカポン（ファイルの保存先を変更modal）※akapon-file-change-_html_css.user.js
// @namespace    akapon
// @version      1.0.0
// @description  Unified: file menu back links + project change modal (search/pager) + swal center + modal stack normalization
// @match        https://member.createcloud.jp/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

/* =========================================================
   【Known issue / 未解決バグ】
   下記モーダルの「戻る」ボタンをクリックすると、
   以後、同じモーダルに戻れなくなる（該当行がクリックできなくなる）ことがある。

   対象：
   ・プロジェクト先の変更
   ・変更後のプロジェクト先保管先
   ・保存先最終確認

   想定原因（要調査）：
   - 戻る操作時に modal の overlay / backdrop / body class が不整合になり、
     クリックイベントが遮断されている可能性
   - stopPropagation / stopImmediatePropagation / capture の影響で
     元のハンドラが再度発火しなくなる可能性
   - 一度付与した処理済みフラグ（dataset等）により、再セットアップされない可能性
   ========================================================= */

  // =========================================================
  // URL制限（t1準拠）
  // =========================================================
  function shouldApply() {
    const path = location.pathname || '';
    if (path.startsWith('/akaire_file/')) return true;
    if (path.startsWith('/akaire_feature/akaire_files/')) return true;
    return false;
  }

  // =========================================================
  // CSS（t1 + t2 を統合：重複は整理、機能は全部残す）
  // =========================================================
  const STYLE_ID = 'tm-akapon-file-change-unified-style';

  function buildCssTextUnified() {
    return `
/* =========================================================
   TM: SweetAlert2（new_alert_popup）中央統一
   - 通知（文字だけ）：中央で1秒表示（JSで閉じる）
   - 確認（OKあり）：中央で固定（JSで閉じない）
   ========================================================= */
.swal2-container{
  align-items: center !important;
  justify-content: center !important;
}
.swal2-popup.new_alert_popup{
  position: relative !important;
  top: auto !important;
  left: auto !important;
  right: auto !important;
  bottom: auto !important;

  margin: 0 !important;

  border-radius: 14px !important;
  overflow: hidden !important;

  box-shadow: 0 10px 28px rgba(0,0,0,.28) !important;
}
.swal2-popup.new_alert_popup .swal2-title{
  margin: 0 !important;
  padding: 12px 14px !important;
  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;
  color: #fff !important;
  font-weight: 900 !important;
  font-size: 14px !important;
}
.swal2-popup.new_alert_popup .swal2-html-container{
  margin: 0 !important;
  padding: 14px !important;
}
.swal2-popup.new_alert_popup .swal2-actions{
  margin: 0 !important;
  padding: 0 14px 14px 14px !important;
}

/* =========================================================
   TM: モーダルタイトル行（共通）追尾固定（sticky）
   ========================================================= */
.modal.show .modal-content .modal-header{
  position: sticky !important;
  top: 0 !important;
  z-index: 60 !important;
}

/* 参考：ベース（tm-share-url-modal のヘッダー） */
.modal.show .modal-content.text-center.tm-share-url-modal .modal-header,
.modal.show .modal-content.text-center.tm-share-url-modal > .modal-header{
  display: block !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 10px 14px !important;
  font-weight: 900 !important;
  color: #fff !important;
  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;
  border-radius: 12px 12px 0 0 !important;
}

/* =========================================================
   TM: ファイルメニュー modal（h5.title-modal-file-menu をヘッダー扱い）
   ========================================================= */
.modal.show .modal-content.text-center .modal-body.p-0 > h5.title-modal-file-menu{
  position: sticky !important;
  top: 0 !important;
  z-index: 60 !important;

  display: block !important;
  width: 100% !important;

  margin: 0 !important;
  padding: 10px 14px !important;

  font-weight: 900 !important;
  color: #fff !important;
  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;

  border-radius: 12px 12px 0 0 !important;
}
.modal.show .modal-content.text-center .modal-body.p-0 > h5.title-modal-file-menu img{
  filter: brightness(0) invert(1) !important;
}
.modal.show .modal-content.text-center .modal-body.p-0 > h5.title-modal-file-menu .default-project-name{
  color: #fff !important;
  opacity: .95 !important;
}

/* =========================================================
   TM: modal は常に画面中央（既存JSには触らず表示位置だけ強制）
   ========================================================= */
.modal.show{
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
.modal.show .modal-dialog{
  margin: 0 auto !important;
}

/* 共通：モーダル本体のシャドー統一 */
.modal.show .modal-content{
  box-shadow: 0 10px 28px rgba(0,0,0,.28) !important;
}

/* modal-content：角丸（上だけ） */
.modal-content{
  border-radius: 12px 12px 0 0 !important;
}

/* =========================================================
   TM: 中央コンテナ（text-center align-center-div）
   ========================================================= */
.text-center.align-center-div{
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .25) !important;
  margin: 15px auto !important;
}

/* =========================================================
   TM: 戻るボタン（t1：右上固定）
   - “後から付与される遷移先モーダル” でも効くよう、基礎スタイルは維持
   ========================================================= */
a.text-underline.text-black.back-text-link{
  color: #fff !important;
  background: #000 !important;
  border: 1px solid #000 !important;
  padding: 4px 9px !important;
  display: inline-block !important;
  text-decoration: none !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35) !important;
  font-size: 0.7em !important;
}
.back-text-link{
  position: absolute !important;
  top: 12px !important;
  right: 12px !important;
  z-index: 999999 !important;
}

/* =========================================================
   TM: プロジェクト先の変更（project modal）
   - 既存h5は残して非表示
   ========================================================= */
#modal-change-position-akaire-file-project h5.modal-title.mt-0.pb-3.pt-3.border-bottom-none{
  display: none !important;
}

/* 枠の高さ（text-left render-list-project） */
#modal-change-position-akaire-file-project .text-left.render-list-project{
  max-height: 550px !important;
  overflow: auto !important;
}

/* 枠線潰し */
#render-list-project .text-left.render-list-project,
#render-list-project .text-left.render-list-project *{
  border-color: transparent !important;
}
#render-list-project .text-left.render-list-project{
  border: none !important;
  outline: none !important;
  position: relative !important;
}

/* 行：太字解除 + 余白（10件見えるよう圧縮） */
#render-list-project .project-change-akaire-file-position{
  font-weight: 400 !important;
  padding: 9px 12px !important;
  margin: 0 !important;
}
#render-list-project .project-change-akaire-file-position + .project-change-akaire-file-position{
  border-top: 1px dashed rgba(0, 0, 0, .18) !important;
}

/* 検索バー */
#render-list-project .tm-project-search-wrap{
  display: flex !important;
  gap: 8px !important;
  padding: 6px 10px !important;
  margin: 0 !important;
  background: #fff !important;
  align-items: center !important;
}
#render-list-project .tm-project-search-wrap .form-control{
  height: 37px !important;
  min-height: 37px !important;
  padding-top: 6px !important;
  padding-bottom: 6px !important;

  border-radius: 10px !important;
  border: 1px solid rgba(0,0,0,.25) !important;
}

/* ページネーション */
:root{ --tm-accent: #1e3c72; }

#render-list-project .tm-project-pagination{
  position: relative !important;
  z-index: 9999 !important;
  pointer-events: auto !important;

  display: flex !important;
  justify-content: flex-end !important;
  gap: 8px !important;

  margin-top: 6px !important;
  padding: 0 12px 10px 12px !important;

  background: #fff !important;
}
#render-list-project .tm-project-pagination *{
  pointer-events: auto !important;
}
#render-list-project .tm-project-pagination .tm-page-btn{
  width: 34px !important;
  height: 34px !important;
  border-radius: 8px !important;

  border: 2px solid var(--tm-accent) !important;
  background: #fff !important;
  color: var(--tm-accent) !important;

  font-weight: 900 !important;
  line-height: 1 !important;

  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  box-shadow: none !important;
}
#render-list-project .tm-project-pagination .tm-page-btn.is-active{
  background: var(--tm-accent) !important;
  color: #fff !important;
}

/* =========================================================
   TM: project modal header（t2の .modal-header 方式）
   ========================================================= */
#modal-change-position-akaire-file-project .modal-header.tm-project-change-header{
  display: block !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 10px 14px !important;

  font-weight: 900 !important;
  font-size: 20px !important;
  color: #fff !important;

  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;
  border-radius: 12px 12px 0 0 !important;

  position: sticky !important;
  top: 0 !important;

  z-index: 99999 !important;
  pointer-events: auto !important;
}
#modal-change-position-akaire-file-project .modal-header.tm-project-change-header a.text-underline.text-black.back-text-link{
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
  border: 1px solid #fff !important;

  text-decoration: none !important;
  border-radius: 10px !important;

  z-index: 100000 !important;
  pointer-events: auto !important;
}
#modal-change-position-akaire-file-project .modal-header.tm-project-change-header a.text-underline.text-black.back-text-link:hover{
  opacity: 0.85 !important;
  background: #f2f2f2 !important;
  color: #000 !important;
}

/* =========================================================
   TM: accept modal header（t2）
   ========================================================= */
#modal-accept-change-position-akaire-file-project.tm-accept-header-ready h5.modal-title{
  display: none !important;
}
#modal-accept-change-position-akaire-file-project .modal-header.tm-project-change-header{
  display: block !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 10px 14px !important;

  font-weight: 900 !important;
  font-size: 20px !important;
  color: #fff !important;

  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;
  border-radius: 12px 12px 0 0 !important;

  position: sticky !important;
  top: 0 !important;

  z-index: 99999 !important;
  pointer-events: auto !important;
}
#modal-accept-change-position-akaire-file-project .modal-header.tm-project-change-header a.text-underline.text-black.back-text-link{
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
  border: 1px solid #fff !important;

  text-decoration: none !important;
  border-radius: 10px !important;

  z-index: 100000 !important;
  pointer-events: auto !important;
}

/* accept modal：不要影の制御（t2） */
#modal-accept-change-position-akaire-file-project .text-center.align-center-div,
#modal-accept-change-position-akaire-file-project .text-center.align-center-div *{
  box-shadow: none !important;
  filter: none !important;
}
#modal-accept-change-position-akaire-file-project .text-center.align-center-div{
  box-shadow: none !important;
  filter: none !important;
}
#modal-accept-change-position-akaire-file-project .text-center.align-center-div > .show-project-select.mx-3{
  display: block !important;
  text-align: left !important;
  background: #fff !important;
  border: 1px solid transparent !important;
  border-radius: 12px !important;

  transform: translateY(14px) !important;

  box-shadow: 0 4px 12px rgba(0,0,0,.16) !important;
  filter: none !important;

  padding: 12px 16px !important;
  min-height: 44px !important;

  position: relative !important;
  z-index: 2 !important;
}
#modal-accept-change-position-akaire-file-project .btn-select-project{
  transform: none !important;
  margin-top: 14px !important;
}
#modal-accept-change-position-akaire-file-project .modal-body{
  padding-bottom: 24px !important;
}

/* =========================================================
   TM: 最強CSS（ファイルメニューアイコン）（t2）
   ========================================================= */
html body img.menu-akaire-file-icon.menu-akaire-file-icon{
  width: 26px !important;
  height: 26px !important;
  margin-top: -9px !important;
}

/* =========================================================
   TM: 保存先最終確認モーダル（更新確認）
   - タイトル：青ザブトン
   - 本文：黒文字（白化バグ対策で強制）
   - ボタン：中央で詰める（黒/青＋シャドー）
   - チェック：ボタンの下の右側（ボタンブロック内で右下）
   ========================================================= */

/* このモーダルだけの本体（JSで付与する） */
.tm-final-confirm-content{
  background: #fff !important;
  color: #000 !important;
  border-radius: 12px 12px 0 0 !important;
  overflow: hidden !important;
}

/* 本文（白背景/黒文字：白化しても必ず戻す） */
.tm-final-confirm-content .modal-body{
  background: #fff !important;
  color: #000 !important;
  padding: 22px 18px 26px !important;
}

/* 文字が白になって消える対策（このモーダル内だけ黒で固定） */
.tm-final-confirm-content .modal-body,
.tm-final-confirm-content .modal-body *{
  color: #000 !important;
}

/* 太字解除（p.font-weight-bold を通常に） */
.tm-final-confirm-content .modal-body p.font-weight-bold{
  font-weight: 400 !important;
}

/* サイズ（このモーダルだけ） */
.tm-final-confirm-root .modal-dialog{
  max-width: 720px !important;
  width: 92vw !important;
  margin: 0 auto !important;
}

/* タイトル行：青ザブトン（グラデ＋白文字） */
.tm-final-confirm-header{
  position: sticky !important;
  top: 0 !important;
  z-index: 99999 !important;

  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;
  color: #fff !important;

  padding: 10px 14px !important;

  font-weight: 900 !important;
  font-size: 16px !important;

  border-radius: 12px 12px 0 0 !important;
  border-bottom: none !important;
}

.tm-final-confirm-header .tm-final-confirm-title{
  display: block !important;
  color: #fff !important;
}

/* ボタン＋チェックのレイアウト（中央寄せの“塊”にする） */
.tm-final-confirm-content .show-btn-confirm-position-akaire-file{
  display: inline-grid !important;
  grid-template-columns: auto auto !important;
  grid-auto-rows: auto !important;

  column-gap: 8px !important;
  row-gap: 8px !important;

  align-items: center !important;

  width: fit-content !important;
  margin: 14px auto 0 !important; /* ★中央に置く */
}

/* チェックのラッパー（2行目・右下） */
.tm-final-confirm-content .show-btn-confirm-position-akaire-file > div{
  grid-column: 1 / -1 !important;
  justify-self: end !important;

  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;

  margin-top: 2px !important;

  color: #000 !important;
}
.tm-final-confirm-content .show-btn-confirm-position-akaire-file > div label{
  color: #000 !important;
  font-weight: 400 !important;
}

/* ボタン共通 */
.tm-final-confirm-content .btn-onclick-confirm-change-position,
.tm-final-confirm-content .tm-final-confirm-back-btn{
  border-radius: 10px !important;
  padding: 8px 14px !important;
  font-weight: 900 !important;
  line-height: 1 !important;
  box-shadow: 0 6px 18px rgba(0,0,0,.18) !important;
}

/* OK：黒背景 */
.tm-final-confirm-content .btn-onclick-confirm-change-position{
  background: #000 !important;
  border: 2px solid #000 !important;
  color: #fff !important;
}

/* 戻る：青背景 */
.tm-final-confirm-content .tm-final-confirm-back-btn{
  background: #1e3c72 !important;
  border: 2px solid #1e3c72 !important;
  color: #fff !important;
}

.tm-final-confirm-content .btn-onclick-confirm-change-position:hover,
.tm-final-confirm-content .tm-final-confirm-back-btn:hover{
  opacity: .86 !important;
}

/* =========================================================
   TM: 保存先最終確認モーダル（更新確認） 最低限セット
   - タイトル行：青ザブトン + 中央寄せ
   - 本文：太字解除
   - ボタン塊：中央寄せ + 近づける + 影
   - チェック：ボタン下の右側
   - label：0.8em（あなたの残した指定）
   ========================================================= */

/* タイトル行（青ザブトン） */
.tm-final-confirm-header{
  position: sticky !important;
  top: 0 !important;
  z-index: 99999 !important;

  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;
  color: #fff !important;

  padding: 10px 14px !important;
  border-radius: 12px 12px 0 0 !important;

  /* ★タイトルを中央にするためのレイアウト */
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.tm-final-confirm-header .tm-final-confirm-title{
  display: block !important;
  width: 100% !important;
  text-align: center !important;
  color: #fff !important;
  font-weight: 900 !important;
}

/* 本文：太字解除（p.font-weight-bold が残っているため） */
.tm-final-confirm-content .modal-body p.font-weight-bold{
  font-weight: 400 !important;
  font-size: 0.8em !important;
}

/* ボタン＋チェックの塊：中央寄せ＆詰める */
.tm-final-confirm-content .show-btn-confirm-position-akaire-file{
  width: fit-content !important;
  margin: 14px auto 0 !important;

  display: inline-flex !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 8px !important;
}

/* チェック列：ボタンの下の右側 */
.tm-final-confirm-content .show-btn-confirm-position-akaire-file > div{
  width: 100% !important;
  display: inline-flex !important;
  justify-content: flex-end !important;
  align-items: center !important;
  gap: 6px !important;
  margin-top: 6px !important;

  /* ★さらに右へ：右端に寄せ切る */
  padding-right: 0 !important;
}

/* labelも右寄せの塊にする */
.tm-final-confirm-content .show-btn-confirm-position-akaire-file > div label{
  text-align: right !important;
}


/* ボタンの見た目：黒/青 + シャドー */
.tm-final-confirm-content .btn-onclick-confirm-change-position{
  background: #000 !important;
  border: 2px solid #000 !important;
  color: #fff !important;
  border-radius: 10px !important;
  padding: 8px 14px !important;
  font-weight: 900 !important;
  box-shadow: 0 6px 18px rgba(0,0,0,.18) !important;
}

.tm-final-confirm-content .tm-final-confirm-back-btn{
  background: #1e3c72 !important;
  border: 2px solid #1e3c72 !important;
  color: #fff !important;
  border-radius: 10px !important;
  padding: 8px 14px !important;
  font-weight: 900 !important;
  box-shadow: 0 6px 18px rgba(0,0,0,.18) !important;
}

.tm-final-confirm-content .btn-onclick-confirm-change-position:hover,
.tm-final-confirm-content .tm-final-confirm-back-btn:hover{
  opacity: .86 !important;
}

/* label 文字サイズ（あなたが残した指定を維持） */
.tm-final-confirm-content .show-btn-confirm-position-akaire-file label{
  font-size: 0.8em !important;
  font-weight: 400 !important;
}

/* =========================================================
   TM: 既存CSS（margin-left:152px）を確実に無効化
   - 既存と “同一セレクタ” で上書き（最優先）
   ========================================================= */
.confirm-submit-modal .modal-content .modal-body .show-btn-confirm-position-akaire-file .btn{
  margin-left: 0 !important;
  margin-right: 0 !important;
  margin: 0 !important;
}

/* こちらは “最終確認モーダル” の見た目用（gap管理） */
.tm-final-confirm-content .show-btn-confirm-position-akaire-file{
  column-gap: 8px !important;
  row-gap: 8px !important;
}

/* 保険：.confirm-submit-modal が外側に付いているケースでも潰す */
.confirm-submit-modal .tm-final-confirm-content .modal-content .modal-body
.show-btn-confirm-position-akaire-file .btn{
  margin-left: 0 !important;
  margin-right: 0 !important;
  margin: 0 !important;
}

/* checkbox は元サイズのまま、縦位置だけ揃える */
.tm-final-confirm-content .show-btn-confirm-position-akaire-file > div input{
  vertical-align: middle !important;
}

`.trim();
  }

  function injectCssOnce() {
    const head = document.head || document.documentElement;
    if (!head) return;

    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      style.type = 'text/css';
      head.appendChild(style);
    }
    const css = buildCssTextUnified();
    if (style.textContent !== css) style.textContent = css;

    // 常に末尾へ（後勝ち）
    const parent = style.parentNode || head;
    if (parent && parent.lastChild !== style) parent.appendChild(style);
  }

  // =========================================================
  // 共通ユーティリティ
  // =========================================================
  function normText(s) {
    return (s || '').replace(/\s+/g, '').trim();
  }

  function isVisible(el) {
    if (!el) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none') return false;
    if (cs.visibility === 'hidden') return false;
    if (cs.opacity === '0') return false;
    return true;
  }

  function getZ(el) {
    const z = parseInt(getComputedStyle(el).zIndex, 10);
    return Number.isFinite(z) ? z : 0;
  }

  // =========================================================
  // modal show/hide 互換（t1の互換を保持しつつ統合）
  // =========================================================
  function showModalCompat(modalEl) {
    if (!modalEl) return;

    // Bootstrap 5
    if (window.bootstrap && window.bootstrap.Modal) {
      try {
        const inst = window.bootstrap.Modal.getOrCreateInstance(modalEl);
        inst.show();
        return;
      } catch (_) {}
    }

    // Bootstrap 4 / jQuery
    if (window.jQuery && typeof window.jQuery(modalEl).modal === 'function') {
      try {
        window.jQuery(modalEl).modal('show');
        return;
      } catch (_) {}
    }

    // フォールバック
    modalEl.style.display = 'block';
    modalEl.classList.add('show');
    modalEl.setAttribute('aria-hidden', 'false');
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

    // フォールバック：閉じるボタンがあれば優先
    const closeBtn =
      modalEl.querySelector('[data-dismiss="modal"], [data-bs-dismiss="modal"], .close, button.close, [aria-label="Close"]') ||
      null;
    if (closeBtn && typeof closeBtn.click === 'function') {
      try {
        closeBtn.click();
        return;
      } catch (_) {}
    }

    modalEl.classList.remove('show');
    modalEl.style.display = 'none';
    modalEl.setAttribute('aria-hidden', 'true');
  }

  // =========================================================
  // オーバーレイ掃除（t1の「押せなくなる」対策を統合）
  // =========================================================
  function forceClearModalOverlay() {
    try {
      document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    } catch (_) {}
  }

  // =========================================================
  // 「直前に開いていたファイルメニュー(modalMenu-****)」を保持（t1）
  // =========================================================
  let lastFileMenuModalId = null;

  function findCurrentMenuModalEl() {
    if (!lastFileMenuModalId) return null;
    return document.getElementById(lastFileMenuModalId) || null;
  }

  // =========================================================
  // 「戻る」注入（t1）
  // =========================================================
  function findTitleHostForBack(modalRoot) {
    if (!modalRoot) return null;

    let host =
      modalRoot.querySelector('h5.modal-title') ||
      modalRoot.querySelector('.modal-title') ||
      null;
    if (host) return host;

    host =
      modalRoot.querySelector('.modal-header') ||
      modalRoot.querySelector('header') ||
      null;
    if (host) return host;

    const modalContent =
      modalRoot.querySelector('.modal-content') ||
      modalRoot.querySelector('.modal-dialog') ||
      modalRoot;

    return modalContent || null;
  }

  function injectBackLinkOnce(modalRoot) {
    if (!modalRoot) return false;

    if (modalRoot.dataset.akaponBackInjected === '1') return true;

    const host = findTitleHostForBack(modalRoot);
    if (!host) return false;

    try {
      const pos = getComputedStyle(host).position;
      if (pos === 'static') host.style.position = 'relative';
    } catch (_) {
      host.style.position = 'relative';
    }

    if (host.querySelector('a.back-text-link')) {
      modalRoot.dataset.akaponBackInjected = '1';
      return true;
    }

    host.insertAdjacentHTML('beforeend', '<a href="#" class="text-underline text-black back-text-link">戻る</a>');

    const back = host.querySelector('a.back-text-link');
    if (!back) return false;

    back.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();

      // ① いま開いている側を閉じる
      try {
        const bsRoot = modalRoot.classList && modalRoot.classList.contains('modal')
          ? modalRoot
          : (modalRoot.closest ? modalRoot.closest('.modal') : null);

        if (bsRoot) hideModalCompat(bsRoot);
        else hideModalCompat(modalRoot);
      } catch (_) {}

      // ② 残留オーバーレイ掃除
      forceClearModalOverlay();

      // ③ メニューを再表示
      setTimeout(() => {
        forceClearModalOverlay();
        const menuEl = findCurrentMenuModalEl();
        if (menuEl) {
          try { showModalCompat(menuEl); } catch (_) {}
        }
      }, 0);
    }, true);

    modalRoot.dataset.akaponBackInjected = '1';
    return true;
  }

  // =========================================================
  // 遷移先モーダル候補を探す（t1）
  // =========================================================
  function pickBestChildModalCandidate(excludeMenuId) {
    const nodes = Array.from(document.querySelectorAll('.modal, [role="dialog"], .modal-dialog, .modal-content'));
    const candidates = [];

    for (const el of nodes) {
      if (excludeMenuId) {
        const menu = el.closest(`#${CSS.escape(excludeMenuId)}`);
        if (menu) continue;
      }

      const root = el.classList.contains('modal') ? el : (el.closest('.modal') || el);
      if (excludeMenuId && root.id === excludeMenuId) continue;
      if (!isVisible(root)) continue;

      const hasSomeModalParts =
        !!root.querySelector('.modal-content, .modal-header, .modal-title, h5.modal-title') ||
        root.getAttribute('role') === 'dialog';
      if (!hasSomeModalParts) continue;

      candidates.push(root);
    }

    const uniq = [];
    const seen = new Set();
    for (const c of candidates) {
      if (seen.has(c)) continue;
      seen.add(c);
      uniq.push(c);
    }

    uniq.sort((a, b) => getZ(b) - getZ(a));
    return uniq[0] || null;
  }

  // 直近の「メニュー内クリック」から、遷移先モーダルを探すためのトークン（t1）
  let openToken = 0;

  function startBackInjectionProbe() {
    const myToken = ++openToken;

    let tryCount = 0;
    const timer = setInterval(() => {
      if (myToken !== openToken) {
        clearInterval(timer);
        return;
      }

      tryCount += 1;

      if (!lastFileMenuModalId) {
        clearInterval(timer);
        return;
      }

      const child = pickBestChildModalCandidate(lastFileMenuModalId);
      if (child) {
        const ok = injectBackLinkOnce(child);
        if (ok) {
          clearInterval(timer);
          return;
        }
      }

      if (tryCount >= 100) clearInterval(timer);
    }, 200);
  }

  // =========================================================
  // 「プロジェクト先の変更」modal の戻る（t1の強制注入）
  // =========================================================
  function injectBackToProjectModalOnce() {
    const titleSpan = Array.from(document.querySelectorAll('h5.modal-title span'))
      .find(el => normText(el.textContent) === 'プロジェクト先の変更');
    if (!titleSpan) return;

    const modalContent =
      titleSpan.closest('.modal-content.text-center') ||
      titleSpan.closest('.modal-content');
    if (!modalContent) return;

    const hasRenderList = !!modalContent.querySelector('#render-list-project');
    if (!hasRenderList) return;

    const titleH5 = modalContent.querySelector('h5.modal-title');
    if (!titleH5) return;

    if (titleH5.querySelector('a.back-text-link')) return;

    try {
      const pos = getComputedStyle(titleH5).position;
      if (pos === 'static') titleH5.style.position = 'relative';
    } catch (_) {
      titleH5.style.position = 'relative';
    }

    titleH5.insertAdjacentHTML('beforeend', '<a href="#" class="text-underline text-black back-text-link">戻る</a>');

    const back = titleH5.querySelector('a.back-text-link');
    if (!back) return;

    back.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();

      const modalRoot =
        titleH5.closest('.modal') ||
        titleH5.closest('[role="dialog"]') ||
        titleH5.closest('.modal-content') ||
        titleH5.closest('.modal-dialog');

      if (modalRoot) {
        try { hideModalCompat(modalRoot); } catch (_) {}
      }

      forceClearModalOverlay();

      const menuEl = findCurrentMenuModalEl();
      if (menuEl) {
        try { showModalCompat(menuEl); } catch (_) {}
      }
    }, true);
  }

  // =========================================================
  // メニューmodal id を保持 + クリックトリガーで probe（t1）
  // =========================================================
  function hookRememberMenuModalIdOnce() {
    if (document.body && document.body.dataset.tmHookMenuOnce === '1') return;
    if (document.body) document.body.dataset.tmHookMenuOnce = '1';

    // modalMenu-**** が shown を出すケースはここで拾う
    document.addEventListener('shown.bs.modal', (e) => {
      const modal = e.target;
      if (!modal) return;
      if (modal.id && modal.id.startsWith('modalMenu-')) {
        lastFileMenuModalId = modal.id;
      }
    }, true);

    // shown が出ない/ズレるケースでも拾えるようにクリックで補助
    document.addEventListener('click', (ev) => {
      const t = ev.target;
      if (!t || !t.closest) return;

      const menuModal = t.closest('[id^="modalMenu-"].modal');
      if (menuModal && menuModal.id) {
        lastFileMenuModalId = menuModal.id;

        // 「プロジェクト先の変更」保険注入（後描画対策）
        injectBackToProjectModalOnce();
        setTimeout(injectBackToProjectModalOnce, 200);
        setTimeout(injectBackToProjectModalOnce, 600);

        const row = t.closest('div.dropdown-item');
        if (row) {
          const isClickable =
            row.classList.contains('cursor-pointer') ||
            !!row.getAttribute('onclick') ||
            !!row.querySelector('[onclick], a, button');

          if (isClickable) {
            startBackInjectionProbe();
            setTimeout(injectBackToProjectModalOnce, 900);
            setTimeout(injectBackToProjectModalOnce, 1500);
          }
        }
      }
    }, true);
  }

  // =========================================================
  // TM: 「ファイルの保存先を変更」行（t1）
  // - 行のどこをクリックしても selectProjectForChange を実行
  // =========================================================
  function enableSaveDestRowAllClickableOnce() {
    if (!document.body) return;
    if (document.body.dataset.akaponSaveDestAllClickable === '1') return;
    document.body.dataset.akaponSaveDestAllClickable = '1';

    const extractProjectIdFromOnclick = (onclickStr) => {
      if (!onclickStr) return null;
      const m = onclickStr.match(/selectProjectForChange\s*\(\s*[^,]+,\s*['"](\d+)['"]\s*\)/);
      return m ? m[1] : null;
    };

    document.addEventListener('click', (ev) => {
      const t = ev.target;
      if (!t || !t.closest) return;

      const menuModal = t.closest('[id^="modalMenu-"].modal');
      if (!menuModal) return;

      const row = t.closest('div.dropdown-item.d-flex.cursor-pointer');
      if (!row) return;

      const labelEl = row.querySelector('.text-show-akaire-file-position');
      const labelText = normText(labelEl ? labelEl.textContent : '');
      if (labelText !== 'ファイルの保存先を変更') return;

      const onclickHolder =
        row.querySelector('[onclick*="AkaireFile.selectProjectForChange"]') ||
        null;

      const onclickStr = onclickHolder ? onclickHolder.getAttribute('onclick') : '';
      const projectId = extractProjectIdFromOnclick(onclickStr);
      if (!projectId) return;

      ev.preventDefault();
      ev.stopPropagation();
      if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();

      if (window.AkaireFile && typeof window.AkaireFile.selectProjectForChange === 'function') {
        try {
          window.AkaireFile.selectProjectForChange(t, projectId);
        } catch (_) {}
      }
    }, true);
  }

  // =========================================================
  // SweetAlert2: new_alert_popup 判定して「文字だけ」を1秒で閉じる（t2）
  // =========================================================
  function isNewAlertPopup(popupEl) {
    return !!(popupEl && popupEl.classList && popupEl.classList.contains('new_alert_popup'));
  }

  function isConfirmPopup(popupEl) {
    if (!popupEl) return false;
    const actions = popupEl.querySelector('.swal2-actions');
    if (!actions) return false;

    const ok = actions.querySelector('button.swal2-confirm');
    if (!ok) return false;
    const st = window.getComputedStyle(ok);
    return st && st.display !== 'none' && st.visibility !== 'hidden';
  }

  function isTextOnlyPopup(popupEl) {
    if (!popupEl) return false;
    const actions = popupEl.querySelector('.swal2-actions');
    if (!actions) return true;
    const st = window.getComputedStyle(actions);
    return !st || st.display === 'none' || st.visibility === 'hidden';
  }

  function closeSwalPopup(popupEl) {
    try {
      const container = popupEl.closest('.swal2-container');
      if (container) container.remove();
    } catch (_) {}

    try {
      document.querySelectorAll('.swal2-container').forEach((c) => c.remove());
    } catch (_) {}
  }

  function setupSwalCenterOverride() {
    if (window.__tmSwalCenterOverrideDone) return;
    window.__tmSwalCenterOverrideDone = true;

    const handled = new WeakSet();

    const handle = () => {
      injectCssOnce();

      const popups = document.querySelectorAll('.swal2-popup.new_alert_popup');
      popups.forEach((popup) => {
        if (!isNewAlertPopup(popup)) return;
        if (handled.has(popup)) return;

        if (isTextOnlyPopup(popup)) {
          handled.add(popup);
          setTimeout(() => closeSwalPopup(popup), 1000);
          return;
        }

        if (isConfirmPopup(popup)) {
          handled.add(popup);
          return;
        }
      });
    };

    handle();

    const root = document.body || document.documentElement;
    const mo = new MutationObserver(handle);
    mo.observe(root, { childList: true, subtree: true });
  }

  // =========================================================
  // JS：プロジェクト先の変更（10件/検索/ページャ）（t2）
  // =========================================================
  const PROJECT_LIST_SEL = '#render-list-project .text-left.render-list-project';
  const PROJECT_ITEM_CLASS = 'project-change-akaire-file-position';

  const TM_SEARCH_CLASS = 'tm-project-search-wrap';
  const TM_PAGER_CLASS = 'tm-project-pagination';
  const TM_INPUT_ID = 'tm_project_search_input';

  const PER_PAGE = 10;

  function getProjectListEl() {
    return document.querySelector(PROJECT_LIST_SEL);
  }

  function getProjectItems(listEl) {
    if (!listEl) return [];
    return Array.from(listEl.querySelectorAll(`.${PROJECT_ITEM_CLASS}`));
  }

  function ensureSearchBar(listEl) {
    if (!listEl) return;
    if (listEl.querySelector(`.${TM_SEARCH_CLASS}`)) return;

    const wrap = document.createElement('div');
    wrap.className = TM_SEARCH_CLASS;

    wrap.innerHTML = `
      <input class="form-control" id="${TM_INPUT_ID}" type="text" placeholder="プロジェクト名を検索">
    `;

    listEl.insertBefore(wrap, listEl.firstChild);
  }

  function ensurePagination(listEl) {
    if (!listEl) return null;

    let pager = listEl.querySelector(`.${TM_PAGER_CLASS}`);
    if (!pager) {
      pager = document.createElement('div');
      pager.className = TM_PAGER_CLASS;
      listEl.appendChild(pager);
    }
    return pager;
  }

  function movePagerAfterLastVisible(listEl) {
    if (!listEl) return;
    const pager = listEl.querySelector(`.${TM_PAGER_CLASS}`);
    if (!pager) return;

    const items = getProjectItems(listEl);
    const visible = items.filter((el) => el.style.display !== 'none');
    const last = visible.length ? visible[visible.length - 1] : null;

    if (last && last.parentNode === listEl) {
      const next = last.nextSibling;
      if (next !== pager) listEl.insertBefore(pager, next);
    } else {
      listEl.appendChild(pager);
    }
  }

  function renderProjectPage(listEl, page, queryText) {
    if (!listEl) return;

    const q = (queryText || '').trim().toLowerCase();
    const items = getProjectItems(listEl);

    const matched = items.filter((el) => {
      const t = (el.textContent || '').trim().toLowerCase();
      return (!q || t.includes(q));
    });

    const totalPages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
    const current = Math.min(Math.max(1, page), totalPages);

    const start = (current - 1) * PER_PAGE;
    const end = start + PER_PAGE;

    const visibleSet = new Set(matched.slice(start, end));

    items.forEach((el) => {
      el.style.display = visibleSet.has(el) ? '' : 'none';
    });

    const pager = ensurePagination(listEl);
    if (!pager) return;

    pager.innerHTML = '';
    pager.dataset.page = String(current);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tm-page-btn' + (i === current ? ' is-active' : '');
      btn.textContent = String(i);

      const onPageBtn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const input = listEl.querySelector(`#${TM_INPUT_ID}`);
        renderProjectPage(listEl, i, (input?.value || ''));
      };

      const capPassive = { capture: true, passive: true };
      const capOnly = { capture: true };

      btn.addEventListener('pointerdown', onPageBtn, capOnly);
      btn.addEventListener('mousedown', onPageBtn, capOnly);
      btn.addEventListener('touchstart', onPageBtn, capPassive);
      btn.addEventListener('click', onPageBtn, capOnly);

      pager.appendChild(btn);
    }

    movePagerAfterLastVisible(listEl);
  }

  function bindSearchEvents(listEl) {
    if (!listEl) return;

    const input = listEl.querySelector(`#${TM_INPUT_ID}`);
    const apply = () => renderProjectPage(listEl, 1, (input?.value || ''));

    if (input && !input.dataset.tmBound) {
      input.dataset.tmBound = '1';
      input.addEventListener('input', apply);
    }
  }

  function setupProjectChangeHeader() {
    const modal = document.querySelector('#modal-change-position-akaire-file-project');
    if (!modal) return;

    const modalContent = modal.querySelector('.modal-content');
    const modalBody = modal.querySelector('.modal-body.p-0') || modal.querySelector('.modal-body');
    if (!modalContent || !modalBody) return;

    if (modalContent.querySelector('.modal-header.tm-project-change-header')) return;

    const titleSpan = modal.querySelector('h5.modal-title span.text-ellipsis.max-width-240px');
    const titleText = (titleSpan?.textContent || '').trim() || 'プロジェクト先の変更';

    // 既存戻るを拾う（あれば移動）
    let backLink = modal.querySelector('a.text-underline.text-black.back-text-link');

    // 無ければ生成
    if (!backLink) {
      backLink = document.createElement('a');
      backLink.href = 'javascript:void(0)';
      backLink.className = 'text-underline text-black back-text-link';
      backLink.textContent = '戻る';
    }

    if (backLink && backLink.dataset.tmUnifiedBound !== '1') {
      backLink.dataset.tmUnifiedBound = '1';
      backLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // “閉じる” ではなく “menuへ戻る” を統一
        hideModalCompat(modal);
        forceClearModalOverlay();

        const menuEl = findCurrentMenuModalEl();
        if (menuEl) {
          setTimeout(() => {
            forceClearModalOverlay();
            try { showModalCompat(menuEl); } catch (_) {}
          }, 0);
        }
      }, true);
    }

    const header = document.createElement('div');
    header.className = 'modal-header tm-project-change-header';
    header.textContent = titleText;
    header.appendChild(backLink);

    modalContent.insertBefore(header, modalBody);
  }

  function setupAcceptChangeHeader() {
    if (window.__tmAcceptHeaderHookDone) return;
    window.__tmAcceptHeaderHookDone = true;

    const ACCEPT_ID = 'modal-accept-change-position-akaire-file-project';
    const PROJECT_ID = 'modal-change-position-akaire-file-project';

    const forceHide = (el) => {
      if (!el) return;
      el.classList.remove('show');
      el.style.display = 'none';
      el.setAttribute('aria-hidden', 'true');
    };

    const forceShow = (el) => {
      if (!el) return;
      el.style.display = 'block';
      el.classList.add('show');
      el.removeAttribute('aria-hidden');
    };

    const hideByBs = (el) => {
      if (!el) return;
      let tried = false;

      try {
        if (window.bootstrap?.Modal) {
          tried = true;
          window.bootstrap.Modal.getOrCreateInstance(el).hide();
        }
      } catch (_) {}

      try {
        if (!tried && window.jQuery && window.jQuery(el).modal) {
          tried = true;
          window.jQuery(el).modal('hide');
        }
      } catch (_) {}

      setTimeout(() => {
        try {
          const cs = window.getComputedStyle(el);
          if (el.classList.contains('show') || cs.display !== 'none') forceHide(el);
        } catch (_) {}
      }, 0);
    };

    const showByBs = (el) => {
      if (!el) return;
      el.removeAttribute('aria-hidden');

      let tried = false;

      try {
        if (window.bootstrap?.Modal) {
          tried = true;
          window.bootstrap.Modal.getOrCreateInstance(el).show();
        }
      } catch (_) {}

      try {
        if (!tried && window.jQuery && window.jQuery(el).modal) {
          tried = true;
          window.jQuery(el).modal('show');
        }
      } catch (_) {}

      setTimeout(() => {
        try {
          const cs = window.getComputedStyle(el);
          if (!el.classList.contains('show') && cs.display === 'none') forceShow(el);
        } catch (_) {}
      }, 0);
    };

    const hideMenuModals = () => {
      document.querySelectorAll('.modal[id^="modalMenu-"]').forEach((m) => {
        try {
          const cs = window.getComputedStyle(m);
          if (m.classList.contains('show') || cs.display !== 'none') hideByBs(m);
        } catch (_) {}
      });
    };

    const isVisibleModal = (m) => {
      try {
        const cs = window.getComputedStyle(m);
        return (m.classList.contains('show') || cs.display !== 'none') &&
               cs.visibility !== 'hidden' &&
               cs.opacity !== '0';
      } catch (_) {
        return false;
      }
    };

    const ensureAcceptHeader = (modalEl) => {
      if (!modalEl) return;

      const modalContent = modalEl.querySelector('.modal-content');
      const modalBody = modalEl.querySelector('.modal-body');
      if (!modalContent || !modalBody) return;

      let header = modalContent.querySelector('.modal-header.tm-project-change-header');
      if (!header) {
        header = document.createElement('div');
        header.className = 'modal-header tm-project-change-header';
        header.textContent = '変更後のプロジェクト先保管先';

        const back = document.createElement('a');
        back.href = 'javascript:void(0)';
        back.className = 'text-underline text-black back-text-link';
        back.textContent = '戻る';
        header.appendChild(back);

        modalContent.insertBefore(header, modalBody);
      }

      modalEl.classList.add('tm-accept-header-ready');

      const backLink = header.querySelector('a.back-text-link');
      if (!backLink) return;

      if (backLink.dataset.tmBound === '1') return;
      backLink.dataset.tmBound = '1';

      backLink.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();

        hideMenuModals();
        forceClearModalOverlay();

        const projectModal = document.getElementById(PROJECT_ID);

        const onHiddenOnce = () => {
          modalEl.removeEventListener('hidden.bs.modal', onHiddenOnce, true);
          hideMenuModals();
          forceClearModalOverlay();
          if (projectModal) showByBs(projectModal);
          hideMenuModals();
        };

        modalEl.addEventListener('hidden.bs.modal', onHiddenOnce, true);

        hideByBs(modalEl);

        setTimeout(() => {
          hideMenuModals();
          forceHide(modalEl);
          forceClearModalOverlay();
          if (projectModal) forceShow(projectModal);
          hideMenuModals();
        }, 180);
      }, true);
    };

    document.addEventListener('shown.bs.modal', (e) => {
      const modalEl = e.target;
      if (!(modalEl instanceof Element)) return;
      if (modalEl.id !== ACCEPT_ID) return;
      ensureAcceptHeader(modalEl);
    }, true);

    let acceptEl = document.getElementById(ACCEPT_ID);

    const attachAcceptAttrObserver = (el) => {
      if (!el) return;
      if (el.dataset.tmAcceptAttrObserver === '1') return;
      el.dataset.tmAcceptAttrObserver = '1';

      let raf = 0;
      const mo = new MutationObserver(() => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (!el.isConnected) return;
          if (!isVisibleModal(el)) return;
          ensureAcceptHeader(el);
        });
      });

      mo.observe(el, { attributes: true, attributeFilter: ['class', 'style', 'aria-hidden'] });

      if (isVisibleModal(el)) ensureAcceptHeader(el);
    };

    if (acceptEl) {
      attachAcceptAttrObserver(acceptEl);
      return;
    }

    const root = document.body || document.documentElement;
    const docMo = new MutationObserver(() => {
      const el = document.getElementById(ACCEPT_ID);
      if (!el) return;

      try { docMo.disconnect(); } catch (_) {}

      acceptEl = el;
      attachAcceptAttrObserver(acceptEl);
    });

    docMo.observe(root, { childList: true, subtree: false });
  }

// =========================================================
// 保存先最終確認モーダル（更新確認）
// - タイトル行「保存先最終確認」を追加（白背景/黒文字）
// - OKの右側に「戻る」ボタンを追加
// - 戻る → 「変更後のプロジェクト先保管先」（accept modal）へ戻す
// =========================================================
function setupFinalConfirmModal() {
  if (window.__tmFinalConfirmModalDone) return;
  window.__tmFinalConfirmModalDone = true;

  const ACCEPT_ID = 'modal-accept-change-position-akaire-file-project';

  const findConfirmModalContent = () => {
    // 1) ボタンで検出（最も確実）
    const okBtn = document.querySelector('.btn-onclick-confirm-change-position');
    if (okBtn) {
      const content = okBtn.closest('.modal-content');
      if (content) return content;
    }

    // 2) ボタン列で検出
    const btnRow = document.querySelector('.show-btn-confirm-position-akaire-file');
    if (btnRow) {
      const content = btnRow.closest('.modal-content');
      if (content) return content;
    }

    return null;
  };

  const getModalRoot = (modalContent) => {
    if (!modalContent) return null;
    // bootstrap modal を優先
    const modal = modalContent.closest('.modal');
    if (modal) return modal;

    // それ以外の構造でも hide/show できるように上位要素を返す
    const dialog = modalContent.closest('.modal-dialog');
    if (dialog) return dialog;

    return modalContent;
  };

  const ensureHeader = (modalContent) => {
  if (!modalContent) return;

  if (modalContent.dataset.tmFinalConfirmReady === '1') return;

  const body = modalContent.querySelector('.modal-body');
  if (!body) return;

  // ★このモーダルだけをCSSで狙えるようにクラス付与
  modalContent.classList.add('tm-final-confirm-content');
  const root = getModalRoot(modalContent);
  if (root && root.classList) root.classList.add('tm-final-confirm-root');

  // header挿入（存在すれば何もしない）
  if (!modalContent.querySelector('.tm-final-confirm-header')) {
    const header = document.createElement('div');
    header.className = 'tm-final-confirm-header';

    const title = document.createElement('span');
    title.className = 'tm-final-confirm-title';
    title.textContent = '保存先最終確認';

    header.appendChild(title);
    modalContent.insertBefore(header, body);
  }

  modalContent.dataset.tmFinalConfirmReady = '1';
};

  const ensureBackButtonNextToOk = (modalContent) => {
    if (!modalContent) return;

    const btnRow = modalContent.querySelector('.show-btn-confirm-position-akaire-file');
    if (!btnRow) return;

    const okBtn = btnRow.querySelector('.btn-onclick-confirm-change-position');
    if (!okBtn) return;

    // 既に戻るがあれば何もしない
    if (btnRow.querySelector('.tm-final-confirm-back-btn')) return;

    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'tm-final-confirm-back-btn';
    backBtn.textContent = '戻る';

    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();

      const modalRoot = getModalRoot(modalContent);

      // いまの確認モーダルを閉じる
      try { hideModalCompat(modalRoot); } catch (_) {}
      forceClearModalOverlay();

      // accept（変更後のプロジェクト先保管先）へ戻す
      const acceptModal = document.getElementById(ACCEPT_ID);
      if (acceptModal) {
        setTimeout(() => {
          forceClearModalOverlay();
          try { showModalCompat(acceptModal); } catch (_) {}
        }, 0);
      }
    }, true);

    // OKの右側に入れる（要求どおり）
    okBtn.insertAdjacentElement('afterend', backBtn);
  };

  const apply = () => {
    const modalContent = findConfirmModalContent();
    if (!modalContent) return;

    ensureHeader(modalContent);
    ensureBackButtonNextToOk(modalContent);
  };

  // 初回
  apply();

  // 後から出るので監視
  const root = document.body || document.documentElement;
  const mo = new MutationObserver(() => apply());
  mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
}

  function setupProjectChangeList() {
    const MODAL_ID = 'modal-change-position-akaire-file-project';

    const trySetupOrRefresh = () => {
      setupProjectChangeHeader();

      const listEl = getProjectListEl();
      if (!listEl) return false;

      const items = getProjectItems(listEl);
      if (items.length === 0) return false;

      ensureSearchBar(listEl);
      ensurePagination(listEl);
      bindSearchEvents(listEl);

      const input = listEl.querySelector(`#${TM_INPUT_ID}`);
      const q = input ? input.value : '';

      const pager = listEl.querySelector(`.${TM_PAGER_CLASS}`);
      const currentPage = Math.max(1, parseInt(pager?.dataset?.page || '1', 10) || 1);

      renderProjectPage(listEl, currentPage, q);

      return true;
    };

    trySetupOrRefresh();

    if (window.__tmProjectChangeListObserver) return;

    if (!window.__tmProjectChangeListCleanupBound) {
      window.__tmProjectChangeListCleanupBound = true;

      document.addEventListener('hidden.bs.modal', (e) => {
        const modal = e.target;
        if (!(modal instanceof Element)) return;
        if (modal.id !== MODAL_ID) return;

        try { window.__tmProjectChangeListObserver?.disconnect(); } catch (_) {}
        window.__tmProjectChangeListObserver = null;

        try { window.__tmProjectChangeListDocObserver?.disconnect(); } catch (_) {}
        window.__tmProjectChangeListDocObserver = null;
      }, true);
    }

    if (!window.__tmProjectChangeListDocObserver) {
      const root = document.body || document.documentElement;

      window.__tmProjectChangeListDocObserver = new MutationObserver(() => {
        const modal = document.getElementById(MODAL_ID);
        if (!modal) return;

        try { window.__tmProjectChangeListDocObserver.disconnect(); } catch (_) {}
        window.__tmProjectChangeListDocObserver = null;

        trySetupOrRefresh();

        const target = modal.querySelector('#render-list-project') || modal;

        let scheduled = false;

        window.__tmProjectChangeListObserver = new MutationObserver(() => {
          if (scheduled) return;
          scheduled = true;

          requestAnimationFrame(() => {
            scheduled = false;
            trySetupOrRefresh();
          });
        });

        window.__tmProjectChangeListObserver.observe(target, { childList: true, subtree: true });
      });

      window.__tmProjectChangeListDocObserver.observe(root, { childList: true, subtree: false });
    }
  }

  // =========================================================
  // 複数モーダル：重なり順の正規化（t2）
  // =========================================================
  function normalizeModalStack() {
    const modals = Array.from(document.querySelectorAll('.modal.show'));
    if (modals.length === 0) return;

    const now = Date.now();
    modals.forEach((m) => {
      if (!m.dataset.tmOpenedAt) m.dataset.tmOpenedAt = String(now + Math.random());
    });

    modals.sort((a, b) => {
      const aa = Number(a.dataset.tmOpenedAt || 0);
      const bb = Number(b.dataset.tmOpenedAt || 0);
      return aa - bb;
    });

    const backdrops = Array.from(document.querySelectorAll('.modal-backdrop'));

    const baseModalZ = 1050;
    const step = 20;

    modals.forEach((m, idx) => {
      m.style.zIndex = String(baseModalZ + idx * step);
      m.style.display = 'block';
      m.classList.add('show');
      m.setAttribute('aria-modal', 'true');
      m.removeAttribute('aria-hidden');
    });

    const topModalZ = baseModalZ + (modals.length - 1) * step;
    const safeBackdropZ = topModalZ - 10;

    backdrops.forEach((b) => {
      b.style.zIndex = String(safeBackdropZ);
    });

    if (document.body) document.body.classList.add('modal-open');
  }

  function setupModalStackWatcher() {
    if (window.__tmModalStackWatcherDone) return;
    window.__tmModalStackWatcherDone = true;

    injectCssOnce();

    let rafId = 0;
    const scheduleNormalize = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        normalizeModalStack();
      });
    };

    document.addEventListener('shown.bs.modal', scheduleNormalize, true);
    document.addEventListener('hidden.bs.modal', scheduleNormalize, true);

    const root = document.body || document.documentElement;
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== 'childList') continue;

        const nodes = [...(m.addedNodes || []), ...(m.removedNodes || [])];
        for (const n of nodes) {
          if (!(n instanceof Element)) continue;
          if (n.classList.contains('modal') || n.querySelector?.('.modal')) {
            scheduleNormalize();
            return;
          }
        }
      }
    });
    mo.observe(root, { childList: true, subtree: false });

    scheduleNormalize();
  }

  // =========================================================
  // init（統合）
  // =========================================================
  function init() {
    if (window.__tmAkaponFileChangeUnifiedOnce) return;
    window.__tmAkaponFileChangeUnifiedOnce = true;

    if (!shouldApply()) return;

    injectCssOnce();

    // t1
    hookRememberMenuModalIdOnce();
    enableSaveDestRowAllClickableOnce();

    // t2
      setupSwalCenterOverride();
      setupProjectChangeList();
      setupModalStackWatcher();
      setupAcceptChangeHeader();

      // ★追加：保存先最終確認モーダル
      setupFinalConfirmModal();

  }

  // document-start 対策
  const tick = () => {
    if (!document.documentElement) return requestAnimationFrame(tick);
    init();
  };
  requestAnimationFrame(tick);

})();
