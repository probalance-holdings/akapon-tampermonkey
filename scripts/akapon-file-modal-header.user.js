// ==UserScript==
// @name         アカポン（ファイルmodal｜ヘッダー共通）※akapon-file-modal-header.user.js
// @namespace    akapon
// @version      20260225 1300
// @match        https://member.createcloud.jp/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  // =========================================================
  // 共通スタイル挿入（ファイル系モーダルのタイトル行）
  // =========================================================
  function injectCssOnce() {
    if (document.getElementById('tm-file-modal-header-style')) return;

    const css = `
/* 共通ヘッダー本体 */
html body .tm-file-modal-header {
  position: sticky !important;
  top: 0 !important;
  z-index: 99999 !important;

  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  width: 100% !important;
  margin: 0 !important;
  padding: 10px 14px !important;

  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;
  color: #fff !important;
  font-weight: 900 !important;
  font-size: 18px !important;

  border-radius: 12px 12px 0 0 !important;
}

/* スクロールしたら付くシャドー（JSでクラス付与） */
html body .tm-file-modal-header.tm-file-menu-scrolled{
  box-shadow: 0 10px 24px rgba(0,0,0,0.22) !important;
}

/* 「戻る」ボタン */
html body .tm-file-modal-header .tm-file-header-back-btn{
  position: absolute !important;
  right: 12px !important;
  left: auto !important;
  top: 50% !important;
  transform: translateY(-50%) !important;

  z-index: 100000 !important;
  pointer-events: auto !important;
  cursor: pointer !important;
  text-decoration: none !important;
}

/* タイトルテキスト部分 */
html body .tm-file-modal-header .tm-file-header-title {
  flex: 1 1 auto !important;
  text-align: center !important;
  padding: 0 40px !important; /* 左の戻るボタンと右余白ぶん */
  box-sizing: border-box !important;
}

html body .tm-file-modal-header .tm-file-header-title-text {
  display: inline-block !important;
  max-width: 100% !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* もともとのヘッダーは非表示にする（DOM は残す） */
html body .tm-file-original-header-hidden {
  display: none !important;
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

/* ---- メニュー領域（2列グリッド） ---- */
html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body > .text-left{
  width: min(760px, calc(100% - 72px)) !important;
  max-width: 760px !important;
  margin: 14px auto 20px !important;

  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 12px 14px !important;
  align-items: stretch !important;
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

  min-height: 62px !important;
  display: flex !important;
  align-items: center !important;
}

/* SPは1列に落とす（崩れ防止） + 余白詰め */
@media (max-width: 480px){
  html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body > .text-left{
    width: calc(100% - 24px) !important;
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
}

/* ❺ 保存先変更行：プロジェクト名(span)を確実に非表示（点残り対策） */
html body [id^="modalMenu-"].modal .modal-content.text-center
.modal-body > .text-left .change-akaire-file-position{
  display: none !important;
}

/* ❻ 遷移アイコンを PCでも表示 + サイズを 18px auto */
html body [id^="modalMenu-"].modal .modal-content.text-center
.modal-body > .text-left > div.dropdown-item.d-flex.cursor-pointer .d-xx-none.ml-1{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
}

html body [id^="modalMenu-"].modal .modal-content.text-center
.modal-body > .text-left > div.dropdown-item.d-flex.cursor-pointer .d-xx-none.ml-1 img{
  width: 18px !important;
  height: auto !important;
  margin-top: -3px;
}

/* ❼ modalMenu-**** 内だけ .ml-1 の margin-left を拡大（サイト全体には影響させない） */
html body [id^="modalMenu-"].modal .modal-content.text-center .ml-1{
  margin-left: 1.25rem !important;
}

/* =========================================================
   （移動）TM: モーダルタイトル行（共通）追尾固定（sticky）
   ========================================================= */
.modal.show .modal-content .modal-header{
  position: sticky !important;
  top: 0 !important;
  z-index: 60 !important;
}

/* =========================================================
   （移動）tm-share-url-modal のヘッダー
   ========================================================= */
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
   （移動）ファイルメニュー modal（h5.title-modal-file-menu をヘッダー扱い）
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

    `.trim();

    const style = document.createElement('style');
    style.id = 'tm-file-modal-header-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // =========================================================
  // 対象となる「ファイル系」モーダルかどうか判定
  // =========================================================
  function isFileRelatedModal(modal) {
    if (!modal || !(modal instanceof HTMLElement)) return false;

    const id = modal.id || '';

    // ファイルメニュー／Status／共有URL／期限など
    if (id.startsWith('modalMenu-')) return true;
    if (id.startsWith('modalSelectStatus-')) return true;
    if (id.startsWith('modalShareFile-')) return true;
    if (id.startsWith('modal_expiration_task_')) return true;

    // バージョン更新
    if (id === 'uploadVersionPopup') return true;

    // アクティビティ
    if (id === 'modalShowHistory') return true;

    // ファイル用メンバー招待モーダル
    if (modal.querySelector('h5.invite-member-header')) return true;

    // 通知設定（submit-update-status ボタンを持つモーダル）
    if (modal.querySelector('.submit-update-status[data-task-id][data-project-id]')) return true;

    return false;
  }

  // =========================================================
  // タイトル文字列を取得（元のヘッダーから拝借）
  // =========================================================
  function getOriginalTitle(modal) {
    if (!modal) return '';

    // 優先順で候補を探す
    const header =
      modal.querySelector('.modal-header') ||
      modal.querySelector('h5.modal-title') ||
      modal.querySelector('p.modal-title') ||
      modal.querySelector('h5.invite-member-header');

    if (header) {
      const text = (header.textContent || '').replace(/\s+/g, ' ').trim();
      if (text) return text;
    }

    // 通知設定モーダルは明示的にタイトル指定
    if (modal.querySelector('.submit-update-status[data-task-id][data-project-id]')) {
      return '通知設定';
    }

    return 'メニュー';
  }

  // =========================================================
  // モーダル内に共通ヘッダーをセット
  // =========================================================
  function applyUnifiedHeader(modal) {
    if (!isFileRelatedModal(modal)) return;

    const content = modal.querySelector('.modal-content');
    if (!content) return;

    // すでに適用済みならスキップ
    if (content.querySelector('.tm-file-modal-header')) return;

    const titleText = getOriginalTitle(modal);

    // 元のヘッダーはクラスを付けて非表示にする（DOM は残す）
    const originalHeaders = modal.querySelectorAll(
      '.modal-header, h5.modal-title, p.modal-title, h5.invite-member-header'
    );
    originalHeaders.forEach(h => {
      h.classList.add('tm-file-original-header-hidden');
    });

    // 通知設定モーダル用の白背景クラスを付ける
    if (modal.querySelector('.submit-update-status[data-task-id][data-project-id]')) {
      content.classList.add('tm-file-notify-modal');
    }

    // 共通ヘッダー DOM を作成（※デザインのみ。戻る機能は各modal側で実装）
    const header = document.createElement('div');
    header.className = 'tm-file-modal-header';
    header.innerHTML = `
      <a href="javascript:void(0)" class="text-underline text-black back-text-link tm-file-header-back-btn" data-tm-file-header-back="1">戻る</a>
      <div class="tm-file-header-title">
        <span class="tm-file-header-title-text"></span>
      </div>
    `.trim();

    const span = header.querySelector('.tm-file-header-title-text');
    if (span) {
      span.textContent = titleText || 'メニュー';
    }

    // modal-content の先頭に挿入
    content.insertBefore(header, content.firstChild);
  }

  // =========================================================
  // 【非Bootstrap】メンバー招待（#popupInviteMember）にも共通ヘッダーを適用
  // =========================================================
  let tmInviteMemberObserverBound = false;

  function applyUnifiedHeaderInviteMemberPopup() {
    const root = document.querySelector('#popupInviteMember.popup-invite-member');
    if (!root) return;

    // すでに適用済みならスキップ（直下に入れる）
    if (root.querySelector(':scope > .tm-file-modal-header')) return;

    // タイトル取得（h5.invite-member-header から）
    const titleEl = root.querySelector('h5.invite-member-header');
    const titleText = titleEl ? (titleEl.textContent || '').replace(/\s+/g, ' ').trim() : 'メニュー';

    // 元のヘッダーは隠す（DOM は残す）
    root.querySelectorAll('h5.invite-member-header').forEach(h => {
      h.classList.add('tm-file-original-header-hidden');
    });

    // 共通ヘッダー DOM を作成
    const header = document.createElement('div');
    header.className = 'tm-file-modal-header';
    header.innerHTML = `
      <a href="javascript:void(0)" class="text-underline text-black back-text-link tm-file-header-back-btn" data-tm-file-header-back="1">戻る</a>
      <div class="tm-file-header-title">
        <span class="tm-file-header-title-text"></span>
      </div>
    `.trim();

    const span = header.querySelector('.tm-file-header-title-text');
    if (span) {
      span.textContent = titleText || 'メニュー';
    }

    // popup の先頭に挿入
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
    } catch (e) {}
  }

  // =========================================================
  // modalMenu-****：スクロールで共通ヘッダーに影を付ける
  // =========================================================
  function bindMenuHeaderScrollShadow(modal) {
    if (!modal || !(modal instanceof HTMLElement)) return;
    if (!modal.id || !modal.id.startsWith('modalMenu-')) return;

    const content = modal.querySelector('.modal-content');
    const header = content ? content.querySelector('.tm-file-modal-header') : null;
    const body = modal.querySelector('.modal-body');
    if (!header || !body) return;

    const onScroll = () => {
      if (body.scrollTop > 4) header.classList.add('tm-file-menu-scrolled');
      else header.classList.remove('tm-file-menu-scrolled');
    };

    onScroll();

    if (!body.dataset.tmFileMenuScrollBound) {
      body.dataset.tmFileMenuScrollBound = '1';
      body.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  // =========================================================
  // modalMenu-****：「ファイルの保存先を変更」行を行全体でクリック可能にする（委譲）
  // =========================================================
  function enableSaveDestRowDelegateOnce() {
    if (document.body.dataset.tmFileSaveDestDelegate) return;
    document.body.dataset.tmFileSaveDestDelegate = '1';

    document.addEventListener('click', (ev) => {
      const t = ev.target;
      if (!t || !t.closest) return;

      const menuModal = t.closest('[id^="modalMenu-"].modal');
      if (!menuModal) return;

      const row = t.closest('div.dropdown-item');
      if (!row) return;

      const label = row.querySelector('.text-show-akaire-file-position');
      const labelText = (label ? label.textContent : '').replace(/\s+/g, '');
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
      if (typeof ev.stopImmediatePropagation === 'function') {
        ev.stopImmediatePropagation();
      }

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

  // =========================================================
  // 「戻る」ボタンクリックでモーダルを閉じる
  // =========================================================
  function handleBackClick(event) {
    const btn = event.target.closest('.tm-file-header-back-btn');
    if (!btn) return;

    const modal = btn.closest('.modal');
    if (!modal) return;

    // aria-hidden 警告対策：モーダル内にフォーカスが残っていたら外す
    try {
      const ae = document.activeElement;
      if (ae && modal.contains(ae) && typeof ae.blur === 'function') {
        ae.blur();
      }
    } catch (e) {}

    try {
      const w = window;
      if (w.jQuery && typeof w.jQuery === 'function') {
        const $m = w.jQuery(modal);
        if ($m && typeof $m.modal === 'function') {
          $m.modal('hide');
          return;
        }
      }
    } catch (e) {}

    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }

  // =========================================================
  // イベント登録
  // =========================================================
  function init() {
    injectCssOnce();
    enableSaveDestRowDelegateOnce();

    // 非Bootstrapの「メンバー招待」（#popupInviteMember）にも共通ヘッダーを適用
    applyUnifiedHeaderInviteMemberPopup();
    bindInviteMemberPopupObserverOnce();

    document.addEventListener('shown.bs.modal', event => {
      const modal = event.target;
      if (!(modal instanceof HTMLElement)) return;

      applyUnifiedHeader(modal);
      bindMenuHeaderScrollShadow(modal);
    });

    document.querySelectorAll('.modal.show').forEach(modal => {
      applyUnifiedHeader(modal);
      bindMenuHeaderScrollShadow(modal);
    });

    document.addEventListener('click', handleBackClick, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
