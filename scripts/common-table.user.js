// ==UserScript==
// @name         共通｜プロジェクト/タスク/ファイルtable）※common-table.user.js
// @namespace    akapon
// @version      20250227 2400
// @match        https://member.createcloud.jp/*
// @match        https://membernew.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/common-table.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/common-table.user.js
// ==/UserScript==

(() => {
  'use strict';

/* ============================================================

【アイコン操作UI統一仕様（重要｜モーダル化方針）】

■ 背景
現在、通知・チャット・期限・メンバーの各アイコンに
hoverツールチップが複数実装されており、

・システム側既存ツールチップ
・Tampermonkey側ツールチップ

が混在しています。

これにより
UIの一貫性欠如・二重表示・可読性低下が発生しています。

------------------------------------------------------------

【最終方針】

hoverツールチップは廃止し、
「通知ON｜OFF」と同一デザインのモーダルUIへ統一してください。

※ 添付デザイン（黒背景・白文字・角丸・中央表示）を基準とする。

------------------------------------------------------------

【対象アイコンと表示文言】

1. 通知アイコン
   表示文言：
   「通知ON｜OFF」

2. チャットアイコン
   表示文言：
   「チャット」

3. 期限アイコン
   表示文言：
   「期限日設定」

4. メンバーアイコン
   表示文言：
   「メンバーを招待｜解除」

------------------------------------------------------------

【実装ルール】

■ 1. hoverツールチップは使用しない
・title属性の使用禁止
・独自JS tooltipの使用禁止
・Bootstrap tooltipの使用禁止

■ 2. 表示方法
・クリック時にモーダル表示
・「通知ON｜OFF」と同一レイアウト
・背景：黒（#000相当）
・文字：白
・角丸統一
・中央表示

■ 3. デザイン統一
・既存「通知ON｜OFF」モーダルのCSSを再利用
・新規デザインは追加しない
・クラスを共通化すること

------------------------------------------------------------

【禁止事項】

・hoverベースのUI追加
・画面ごとに異なるデザイン採用
・フロント側のみでの一時的対処

------------------------------------------------------------

【理由】

・UI一貫性の確保
・操作意図の明確化
・多重ツールチップの排除
・保守性向上
・UX改善

------------------------------------------------------------

本スクリプトはhover表示の補助を目的としますが、
上記アイコン群はモーダル型UIへ移行してください。

============================================================ */

  const TIP_ID = 'tm-project-table-hover-tip';
  const STYLE_ID = 'tm-project-table-hover-tip-css';

  /* =====================================================
     CSS（ツールチップ + ページネーション）
  ===================================================== */
  function injectCssOnce() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
/* ===============================
   ツールチップ
=============================== */
#${TIP_ID}{
  position: fixed;
  z-index: 2147483647;
  display: none;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(0,0,0,0.92);
  color: #fff;
  font-size: 13px;
  font-weight: 900;
  line-height: 1;
  box-shadow: 0 10px 24px rgba(0,0,0,0.45);
  pointer-events: none;
  white-space: nowrap;
}

/* ===============================
   ページネーション（数字のみ）
=============================== */
nav.pagy-bootstrap-nav{
  display:flex;
  justify-content:flex-end;  /* ← 右寄せ */
  margin:18px 0;
}

nav.pagy-bootstrap-nav .pagination{
  gap:8px;
  align-items:center;
}

/* Prev / Next / … 非表示 */
/* Prev / Next は非表示 */
nav.pagy-bootstrap-nav .page-item.prev,
nav.pagy-bootstrap-nav .page-item.next{
  display:none !important;
}

/* gap（省略ページ）は表示させる */
nav.pagy-bootstrap-nav .page-item.gap{
  display:flex !important;
}

/* 省略表示（…）をハイフン風に変更 */
nav.pagy-bootstrap-nav .page-item.gap .page-link{
  border:none !important;
  background:transparent !important;
  color:#999 !important;
  font-weight:700 !important;
  pointer-events:none !important;
  width:auto !important;
  padding:0 6px !important;
}

/* 数字ボタン */
nav.pagy-bootstrap-nav .page-item .page-link{
  width:36px;
  height:36px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:10px !important;
  font-weight:800;
  border:2px solid #1e3c72 !important;
  color:#1e3c72 !important;
  background:#fff !important;
  padding:0 !important;
}

/* active */
nav.pagy-bootstrap-nav .page-item.active .page-link{
  background:#1e3c72 !important;
  color:#fff !important;
  border-color:#1e3c72 !important;
}

/* hover */
nav.pagy-bootstrap-nav .page-item:not(.active) .page-link:hover{
  background:#1e3c72 !important;
  color:#fff !important;
}

@media (max-width: 768px){
  nav.pagy-bootstrap-nav{
    margin: 12px 0 !important;
    justify-content: flex-end !important; /* ★SPも右寄せ */
  }

  nav.pagy-bootstrap-nav .pagination{
    gap: 6px !important;
    flex-wrap: wrap !important; /* ページ数が多い時に横はみ出し防止 */
    justify-content: flex-end !important; /* ★中身も右寄せ */
  }

  /* 数字ボタン（SP小さめ） */
  nav.pagy-bootstrap-nav .page-item .page-link{
    width: 30px !important;
    height: 30px !important;
    border-radius: 8px !important;
    border-width: 1px !important;
    font-size: 12px !important;
    font-weight: 800 !important;
  }

  /* 省略表示（…） */
  nav.pagy-bootstrap-nav .page-item.gap .page-link{
    padding: 0 4px !important;
    font-size: 12px !important;
  }
}

.render_pagy.project-pagy .pagination{
  box-shadow:none !important;
}

.render_pagy.project-pagy{
  overflow: visible !important;
}

nav.pagy-bootstrap-nav{
  overflow: visible !important;
}

.page-link {
    margin-left: 0px !important
}

/* ===============================
   プロジェクト：? ボタン位置調整
=============================== */
.file-intro-button{
  position: relative !important;
  top: 0px !important;
}

/* ============================================================

【重要】
.bg-akapon は他画面（例：一時保管・アップロード等）でも使用されています。

そのため、グローバル上書きは禁止。

本CSSは「ファイルサムネイル形式」の
「もっと見る」ボタンのみに限定して適用しています。

影響範囲：
akaire_file / project_akaire_files サムネイル表示のみ

他画面には影響しません。

============================================================ */

/* ===============================
   ファイルサムネイル：もっと見る（限定適用）
=============================== */
a.btn.bg-akapon.text-white.mt-2{
  background:#000 !important;
  border-color:#000 !important;
}

/* ===============================
   ファイルサムネイル：もっと見る hover
=============================== */
a.btn.bg-akapon.text-white.mt-2:hover{
  background:#222 !important;
  border-color:#222 !important;
  color:#fff !important;
  transition:all .2s ease !important;
}
`;
    document.head.appendChild(style);
  }

  /* =====================================================
     ツールチップ処理
  ===================================================== */

  function ensureTip() {
    let tip = document.getElementById(TIP_ID);
    if (!tip) {
      tip = document.createElement('div');
      tip.id = TIP_ID;
      document.body.appendChild(tip);
    }
    return tip;
  }

  function showTipUnder(el, text) {
    const tip = ensureTip();
    tip.textContent = text;

    const rect = el.getBoundingClientRect();
    const top = rect.bottom + 8;
    const left = rect.left + rect.width / 2;

    tip.style.top = `${Math.round(top)}px`;
    tip.style.left = `${Math.round(left)}px`;
    tip.style.transform = 'translateX(-50%)';
    tip.style.display = 'block';
    tip.style.visibility = 'visible';
  }

  // ★左側で見切れない：アイコン左端を起点にして表示（必要に応じて左右に寄せる）
  function showTipUnderLeft(el, text) {
    const tip = ensureTip();
    tip.textContent = text;

    const rect = el.getBoundingClientRect();
    const top = rect.bottom + 8;

    // いったん計測用に表示（ユーザーには見せない）
    tip.style.display = 'block';
    tip.style.visibility = 'hidden';
    tip.style.transform = 'none';

    const tipW = tip.offsetWidth || 0;
    const padding = 8;

    // アイコン左端から文字を開始
    let left = rect.left;

    // 左に食い込むなら少し内側へ
    if (left < padding) left = padding;

    // 右に食い込むなら右端から戻す
    const maxLeft = window.innerWidth - tipW - padding;
    if (left > maxLeft) left = Math.max(padding, maxLeft);

    tip.style.top = `${Math.round(top)}px`;
    tip.style.left = `${Math.round(left)}px`;
    tip.style.visibility = 'visible';
  }

  function hideTip() {
    const tip = document.getElementById(TIP_ID);
    if (!tip) return;
    tip.style.display = 'none';
  }

  function bindHover() {
    if (window.__tmProjectTableTipBound) return;
    window.__tmProjectTableTipBound = true;

    document.addEventListener('mouseover', (e) => {
      const t = e.target;
      if (!t || typeof t.closest !== 'function') return;

      const editFileName = t.closest('img.edit-akaire-file-name-img');
      if (editFileName) return showTipUnder(editFileName, 'ファイル名');

      const menuIcon = t.closest('img.three-dot, img[src*="akaire_thumb_menu"]');
      if (menuIcon) return showTipUnder(menuIcon, 'メニュー');

      const editProjectName = t.closest('img.edit-project-name-img');
      if (editProjectName) return showTipUnder(editProjectName, 'プロジェクト名');

      // ★ステータス：プロジェクトthumb側（project_thumb_status_point）も対象に追加
      const statusDot = t.closest(
        [
          'span.project_status_point[data-toggle="modal"]',
          'span.akaire_file_status_point[data-toggle="modal"]',
          'span.thumb_akaire_file_status_point[data-toggle="modal"]',
          'span.project_thumb_status_point[data-toggle="modal"]' // ←追加
        ].join(', ')
      );
      // ★左側で見切れない：アイコン左端から文字開始
      if (statusDot) return showTipUnderLeft(statusDot, 'ステータス');

      const notifyImg = t.closest('img.accept-notify');
      // ★左側で見切れない：アイコン左端から文字開始
      if (notifyImg) return showTipUnderLeft(notifyImg, '通知ON｜OFF');

      const chatBtn = t.closest('a.open-popup-chat.btn-chat');
      if (chatBtn) return showTipUnder(chatBtn, 'チャット');

    }, true);

    document.addEventListener('mouseout', hideTip, true);
    document.addEventListener('mouseleave', hideTip, true);
  }

  injectCssOnce();
  bindHover();

  /* =====================================================
     ✚（thumb-icons-plus）をHTMLごと削除（1回だけ）
     - 表示が重くならないよう常時監視はしない
  ===================================================== */
  function removeThumbPlusOnce() {
    if (window.__tmThumbPlusRemoved) return;
    window.__tmThumbPlusRemoved = true;

    const nodes = document.querySelectorAll('img.thumb-icons-plus');
    if (!nodes || !nodes.length) return;

    nodes.forEach((el) => {
      // 念のため対象onclickを含むものだけ（安全側）
      const oc = (el.getAttribute('onclick') || '');
      if (oc.includes('Project.showSettingPicProject')) {
        el.remove(); // ← HTMLごと削除
      }
    });
  }

  // DOM確定後に1回だけ実行
  setTimeout(removeThumbPlusOnce, 0);

})();
