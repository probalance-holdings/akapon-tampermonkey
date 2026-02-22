// ==UserScript==
// @name         アカポン（右上アバター）※akapon-avatar_html_css.user.js
// @namespace    akapon
// @version      20260222 2100
// @match        https://member.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-avatar_html_css.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-avatar_html_css.user.js
// ==/UserScript==

(() => {
  'use strict';

  const STYLE_ID = 'tm_akapon_avatar_css';
  const MENU_SELECTOR = '.dropdown-menu.last-drop-down.dropdown-menu-right';
  const MENU_SHOW_SELECTOR = '.dropdown-menu.last-drop-down.dropdown-menu-right.show';
  const AVATAR_BTN_SELECTOR = 'button.btn-dropdown-logout#display-block';
  const WORK_ACC_ID = 'tm_avatar_work_list';
  const WORK_HEADER_CLASS = 'tm-avatar-accordion-header';
  const WORK_ARROW_CLASS = 'tm-avatar-accordion-arrow';
  const WORK_BODY_CLASS = 'tm-avatar-accordion-body';

  /* =========================
     CSS
  ========================= */
  function injectCss() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
/* ===== 右上アバター dropdown 全体 ===== */
${MENU_SELECTOR}{
  min-width: 260px !important;
  padding: 10px 0 !important;
  border-radius: 14px !important;
  border: 1px solid rgba(0,0,0,.10) !important;
  /* ❷ かっこいいシャドー */
  box-shadow:
    0 18px 40px rgba(0,0,0,.18),
    0 2px 10px rgba(0,0,0,.10) !important;

  /* ❶ 右寄せ（既存 right 指定を活かしつつ、余白調整） */
  margin-right: 0 !important;
  right: 0 !important;
  left: auto !important;
}

/* 余計な区切り線を消す */
${MENU_SELECTOR} hr{
  display:none !important;
}

/* 各行の共通見た目 */
${MENU_SELECTOR} a.dropdown-item{
  display:flex !important;
  align-items:center !important;
  gap: 10px !important;
  padding: 10px 14px !important;
  font-weight: 700 !important;
  color: #111 !important;
  text-decoration: none !important;
}

/* hover */
${MENU_SELECTOR} a.dropdown-item:hover{
  background: rgba(0,0,0,.06) !important;
}

/* ログアウトボタン（既存button） */
${MENU_SELECTOR} a.log-out button.btn-logout{
  font-weight: 800 !important;
}

/* 作業一覧（アコーディオン） */
${MENU_SELECTOR} .${WORK_HEADER_CLASS}{
  display:flex !important;
  align-items:center !important;
  justify-content:space-between !important;
  padding: 10px 14px !important;
  cursor:pointer !important;
  user-select:none !important;
  font-weight: 800 !important;
  color:#111 !important;
}

${MENU_SELECTOR} .${WORK_ARROW_CLASS}{
  font-size: 12px !important;
  transition: .2s !important;
}

${MENU_SELECTOR} .${WORK_ARROW_CLASS}.open{
  opacity: .5 !important;
}

${MENU_SELECTOR} .${WORK_BODY_CLASS}{
  display:none;
  padding: 0 14px 8px 14px !important;
  padding-left: 44px !important;   /* 追加：リンクを右へ */
}

${MENU_SELECTOR} .${WORK_BODY_CLASS} a{
  display:block !important;
  padding: 8px 0 !important;
  color:#111 !important;
  text-decoration:none !important;
  font-weight:700 !important;
}

/* ❻ ヘルプの下線をなくす（念押し） */
${MENU_SELECTOR} a.item-menu_support{
  text-decoration: none !important;
}

/* 上部タイトル */
${MENU_SELECTOR} .tm-avatar-menu-title{
  text-align:center !important;
  font-weight:900 !important;
  letter-spacing:.08em !important;
  font-size:22px !important;
  padding: 8px 0 10px !important;
  color:#111 !important;
}

/* 作業一覧アイコンだけ調整（大きすぎ・左寄り対策） */
${MENU_SELECTOR} #${WORK_ACC_ID} .tm-avatar-work-left{
  display:flex !important;
  align-items:center !important;
}

/* modal内アイコン専用（他CSSの影響を受けない） */
${MENU_SELECTOR} .avatar-modal-icon{
  width: 18px !important;
  height: 18px !important;

  /* PC基準：検証でちょうどよかった値 */
  margin-right: 23px !important;

  /* アイコン枠は維持（念のため） */
  flex: 0 0 22px !important;

  object-fit: contain !important;
  display: inline-block !important;

  /* 位置微調整（img全体には効かせない） */
  position: relative !important;
  top: -1px !important;
  left: 7px !important;

  vertical-align: middle !important;
  border-style: none !important;
}

/* ===== SP（共通） ===== */
@media (max-width: 768px){

  /* SPだけ：余白が大きすぎて崩れるのを防ぐ */
  ${MENU_SELECTOR} .avatar-modal-icon{
    margin-right: 14px !important;
    left: 4px !important;
  }

  /* ===== SPプロフィールModal（#profileModal）をPCと同じ構造に寄せる ===== */

  /* modal全体の余白/見た目 */
  #profileModal .modal-content.profile-modal{
    border-radius: 14px !important;
    border: 1px solid rgba(0,0,0,.10) !important;
    box-shadow:
      0 18px 40px rgba(0,0,0,.18),
      0 2px 10px rgba(0,0,0,.10) !important;
  }

  #profileModal .tm-avatar-menu-title{
    text-align:center !important;
    font-weight:900 !important;
    letter-spacing:.08em !important;
    font-size:18px !important;
    padding: 10px 0 10px !important;
    color:#111 !important;
  }

  /* SP modal：タイトル行を追尾固定＋スクロール時に下部へシャドー */
  #profileModal .tm-avatar-menu-title.tm-avatar-title-sticky{
    position: sticky !important;
    top: 0 !important;
    z-index: 2 !important;
    background: #fff !important;
  }

  #profileModal .tm-avatar-menu-title.tm-avatar-title-sticky.tm-avatar-title-shadow{
    box-shadow: 0 4px 10px rgba(0,0,0,.18) !important;
  }

  /* ===== SP modal：項目を必ず「縦並び」に固定 ===== */
  #profileModal .modal-body{
    display: block !important;
  }

  #profileModal .tm-avatar-item{
    display: flex !important;          /* inline化を防ぐ */
    align-items: center !important;
    gap: 10px !important;
    width: 100% !important;
    box-sizing: border-box !important;
    padding: 10px 14px !important;
    font-weight: 700 !important;
    color: #111 !important;
    text-decoration: none !important;
  }

  #profileModal .tm-avatar-item:hover{
    background: rgba(0,0,0,.06) !important;
  }

  /* 作業一覧ヘッダー：他項目と同じ左寄せ/余白に統一 */
  #profileModal .tm-avatar-accordion-header{
    display:flex !important;
    align-items:center !important;
    flex-wrap: nowrap !important;
    white-space: nowrap !important;

    width: 100% !important;
    box-sizing: border-box !important;
    padding: 10px 14px !important;     /* ←他の .tm-avatar-item と同じ */
    gap: 10px !important;

    justify-content: flex-start !important; /* space-between をやめる */
    cursor: pointer !important;

    position: relative !important;      /* ← 矢印の基準 */
  }

  /* ❶ 作業一覧の文字を他の文字と同じ左寄せに（行いっぱいに伸ばさない） */
  #profileModal .tm-avatar-work-left{
    display:flex !important;
    align-items:center !important;
    flex: 0 0 auto !important;          /* 1 1 auto → 0 0 auto */
    min-width: 0 !important;
    white-space: nowrap !important;
  }

  /* ❷ ▲は右端ではなく「作業一覧の右側（線の位置）」へ */
  #profileModal .tm-avatar-accordion-arrow{
    position: absolute !important;

    /* “極端な数値”を避けつつ、作業一覧ブロック基準で決め位置に置く */
    left: calc(14px + 18px + 14px + 10px + 56px) !important;

    top: 50% !important;
    transform: translateY(-50%) !important;

    margin: 0 !important;    /* margin-left:auto を無効化 */
    white-space: nowrap !important;
  }

  /* SP用：アイコン統一 */
  #profileModal .avatar-modal-icon{
    width: 18px !important;
    height: 18px !important;
    margin-right: 14px !important;
  /*  object-fit: contain !important;　*/
    display: inline-block !important;
    position: relative !important;
    top: -1px !important;
    left: 4px !important;
    vertical-align: middle !important;
    border-style: none !important;
    flex: 0 0 auto !important;
  }

  /* 作業一覧：中身は初期非表示（▼クリックで開く） */
  #profileModal .tm-avatar-accordion-body{
    display: none !important;

    /* ❶ 中身も他項目のテキスト開始位置（= アイコン分）に合わせて左寄せ */
    padding-left: calc(14px + 18px + 14px + 10px) !important;
    padding-right: 14px !important;
    text-align: left !important;
  }

  /* ❷ JSで tm-open を付けたら必ず開く（!important に勝つ） */
  #profileModal .tm-avatar-accordion-body.tm-open{
    display: block !important;
  }

  /* ❶ アコーディオン内リンクは必ず2行（縦並び） */
  #profileModal .tm-avatar-accordion-body a{
    display: block !important;
    padding: 8px 0 !important;
    white-space: nowrap !important;
  }

  /* ===== ❶ SP切替直後の「旧アイコン一瞬表示」を防ぐ ===== */
  #navbar-common img.icon.mail:not(.btn-side-bar):not(.tm-gear-icon){
    /* ヘッダー内の「まだ歯車化されていない」mailアイコンは非表示 */
    opacity: 0 !important;
  }
  #navbar-common img.icon.mail.tm-gear-icon{
    opacity: 1 !important;
  }

  /* SPの歯車アイコン（mailアイコン差し替え先） */
  #navbar-common img.icon.mail.tm-gear-icon{
    width: 24px !important;
    height: 24px !important;

    /* 白枠（背景/枠/影）を完全に消す */
    background: transparent !important;
    border: 0 !important;
    outline: none !important;
    box-shadow: none !important;
    padding: 0 !important;

    display: inline-block !important;
  }
}
    `.trim();


    document.head.appendChild(style);
  }

  /* =========================
     PC: dropdown を右上に寄せて固定
     - Popper の transform 位置決めを無効化し、
       右上アバターボタン基準で top/right を再計算する
  ========================= */
  function positionAvatarDropdownPC(menuEl) {
    if (!menuEl) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const avatarBtn = document.querySelector(AVATAR_BTN_SELECTOR);
    if (!avatarBtn) return;

    const rect = avatarBtn.getBoundingClientRect();

    // 右端の余白（好みで調整できるが、まずは安全値）
    const margin = 4;

    // ボタン右端からの距離 = viewport右端 - ボタン右端
    const right = Math.max(margin, Math.round(window.innerWidth - rect.right));
    const top = Math.round(rect.bottom + margin);

    // Popper/Bootstrap の inline transform を無効化して right/top で固定
    menuEl.style.position = 'fixed';
    menuEl.style.top = `${top}px`;
    menuEl.style.right = `${right}px`;
    menuEl.style.left = 'auto';
    menuEl.style.transform = 'none';
    menuEl.style.marginRight = '0';

    // 念のため（既存より前に出す）
    menuEl.style.zIndex = '1060';
  }

  /* =========================
     dropdown の中身を整形
  ========================= */
  function customizeAvatarDropdown(menuEl) {
    if (!menuEl) return;
    if (menuEl.dataset.tmAvatarCustomized === '1') return;

    // ★追加：PC時は右寄せ位置を先に確定
    positionAvatarDropdownPC(menuEl);

    // 1) 不要項目を非表示（添付にないもの）
      const removeSelectors = [
          'a.item-download_csv',
          'a.item-menu_completed_task'
      ];
      removeSelectors.forEach(sel => {
          const el = menuEl.querySelector(sel);
          if (el) el.remove(); // ← display:none ではなく削除
      });

    // 2) 表示する項目だけ残す（想定外が混ざっても出ないように）
    const allowed = new Set([
      'item-menu_account',
      'item-menu_setting-token',
      'item-menu_contract_information',
      'item-menu_notification',
      'item-menu_notice',
      'item-menu_contact',
      'item-menu_support'
    ]);

    menuEl.querySelectorAll('a.dropdown-item').forEach(a => {
      // ログアウトの button は別構造なのでここでは触らない
      const cls = (a.className || '').split(/\s+/).find(c => allowed.has(c));
      if (!cls) {
        // ただし「ログアウト」を包んでる a.log-out は残す
        if (!a.classList.contains('log-out')) a.style.display = 'none';
      }
    });

    // 3) 文言変更（❸❹❺）
    const account = menuEl.querySelector('a.item-menu_account');
    if (account) account.textContent = 'アカウント情報';

    const notification = menuEl.querySelector('a.item-menu_notification');
    if (notification) notification.textContent = 'アクティビティ';

    const notice = menuEl.querySelector('a.item-menu_notice');
    if (notice) notice.textContent = 'システムからのお知らせ';

    // 4) ❻ ヘルプ と お問合わせ のアイコンを逆にする
    // アイコンが class に紐づいている前提で、class を入れ替える
    const contact = menuEl.querySelector('a.item-menu_contact');
    const help = menuEl.querySelector('a.item-menu_support');

    if (contact && help) {
      contact.classList.remove('item-menu_contact');
      contact.classList.add('item-menu_support');

      help.classList.remove('item-menu_support');
      help.classList.add('item-menu_contact');

      // ヘルプの下線なし（念押し）
      help.style.textDecoration = 'none';
    }

      // 0) 上部に MENU タイトル（重複防止）
      if (!menuEl.querySelector('.tm-avatar-menu-title')) {
          const title = document.createElement('div');
          title.className = 'tm-avatar-menu-title';
          title.textContent = 'MENU';
          menuEl.insertAdjacentElement('afterbegin', title);
      }

    // 5) 2. 作業一覧（アコーディオン）を挿入（左上メニュー方式）
    // 既存 dropdown-item 群の中に差し込む（契約情報の後ろを目安）
    const contract = menuEl.querySelector('a.item-menu_contract_information');
    const insertAfter = contract || (menuEl.querySelector('a.item-menu_setting-token') || menuEl.querySelector('a.item-menu_account'));

    // 作業一覧ブロックを作る（既にあれば二重に作らない）
    if (!menuEl.querySelector(`#${WORK_ACC_ID}`)) {
      const accWrap = document.createElement('div');
      accWrap.id = WORK_ACC_ID;

        accWrap.innerHTML = `
<div class="${WORK_HEADER_CLASS}" data-target="${WORK_ACC_ID}-body">
  <div class="tm-avatar-work-left">
    <img class="avatar-modal-icon" src="/assets/project-3bb6cf83c266728e4f54d69406161de36aed4a62c7e947ca1060c44f6627262f.png" width="25" height="23">
    作業一覧
  </div>
  <span class="${WORK_ARROW_CLASS}">▼</span>
</div>
<div class="${WORK_BODY_CLASS}" id="${WORK_ACC_ID}-body">
  <a href="/tasks">・全タスク</a>
  <a href="/akaire_feature/akaire_files">・全ファイル</a>
</div>
`.trim();

      if (insertAfter && insertAfter.parentNode) {
        insertAfter.insertAdjacentElement('afterend', accWrap);
      } else {
        menuEl.appendChild(accWrap);
      }
    }

    menuEl.dataset.tmAvatarCustomized = '1';
  }

/* =========================
   SP: モーダル表示時のフォーカスを正規化
   - iframe に残るフォーカスが aria-hidden 警告の原因になりやすい
   - ここでは「ぼかす（blur）」＋「modalへ focus」だけを行う（副作用最小）
========================= */
function normalizeFocusForProfileModal(modalEl) {
  if (!modalEl) return;

  // iframe 等に残っているフォーカスを外す（iOS Safari 対策）
  const ae = document.activeElement;
  if (ae && ae !== document.body && typeof ae.blur === 'function') {
    try { ae.blur(); } catch (e) {}
  }

  // modal にフォーカス（tabindex=-1 なので可能）
  if (typeof modalEl.focus === 'function') {
    setTimeout(() => {
      try { modalEl.focus(); } catch (e) {}
    }, 0);
  }
}

/* =========================
   SPプロフィールModal タイトルの追尾固定＋シャドー制御
========================= */
function setupProfileModalTitleSticky(modal) {
  if (!modal) return;
  const body = modal.querySelector('.modal-body');
  if (!body) return;

  const ensureBase = () => {
    const title = modal.querySelector('.tm-avatar-menu-title');
    if (!title) return;
    title.classList.add('tm-avatar-title-sticky');
  };

  // スクロールイベントは1回だけbind
  if (modal.dataset.tmAvatarTitleStickyBound !== '1') {
    modal.dataset.tmAvatarTitleStickyBound = '1';

    body.addEventListener('scroll', () => {
      const title = modal.querySelector('.tm-avatar-menu-title');
      if (!title) return;
      ensureBase();
      if (body.scrollTop > 0) {
        title.classList.add('tm-avatar-title-shadow');
      } else {
        title.classList.remove('tm-avatar-title-shadow');
      }
    });
  }

  // 初期状態でも sticky 用クラスを付与
  ensureBase();
}

/* =========================
   SPプロフィールModal（#profileModal）整形
   - PCと同じ情報に統一
   - SPは文字サイズ/余白をSP用に
========================= */
function customizeProfileModalSP() {
  if (!window.matchMedia('(max-width: 768px)').matches) return;

  const modal = document.querySelector('#profileModal.modal.show');
  if (!modal) return;

  // 追加：フォーカスを正規化（警告と操作ブレを抑える）
  normalizeFocusForProfileModal(modal);

  const content = modal.querySelector('.modal-content.profile-modal');
  const body = modal.querySelector('.modal-body');
  if (!content || !body) return;

  // 二重実行防止（ただし、別JSで中身が戻された場合は再実行できるようにする）
  // ＝「フラグが1」かつ「期待DOMが残っている」時だけ return
  if (modal.dataset.tmAvatarCustomizedSp === '1' && body.querySelector('.tm-avatar-menu-title')) return;

  // ----- 中身をPCと同じ項目に（CSV/完成済み等は出さない） -----
  body.innerHTML = `
    <div class="tm-avatar-menu-title">MENU</div>

    <a class="tm-avatar-item item-menu_account" href="/users/33913">
      <img class="avatar-modal-icon" src="/assets/nav/item_menu_account-c48a560deda740d863face64f48191153c5e25e6421d3fcc3734a5247e294cf5.svg" width="22" height="22">
      <span>アカウント情報</span>
    </a>

    <a class="tm-avatar-item item-menu_setting-token" id="show-popup-setting-otp-on" href="javascript:void(0)">
      <img class="avatar-modal-icon" src="/assets/setting-auth-82c768c8d5fd0eb68b65bdccf32c8459a6ae33c9e70b7fb8a635688ef3236707.png" width="18" height="22">
      <span>二段階認証設定</span>
    </a>

    <a class="tm-avatar-item item-menu_contract_information" href="/company/contract">
      <img class="avatar-modal-icon" src="/assets/item_contract_menu_information-0ce9aa20faf3dcd41fd8dc5354d209d79560f69a81ca70333a7376b91dc59033.png" width="28" height="22">
      <span>契約情報</span>
    </a>

    <!-- 作業一覧（アコーディオン） -->
    <div id="${WORK_ACC_ID}">
      <div class="${WORK_HEADER_CLASS}" data-target="${WORK_ACC_ID}-body">
        <div class="tm-avatar-work-left">
          <img class="avatar-modal-icon" src="/assets/project-3bb6cf83c266728e4f54d69406161de36aed4a62c7e947ca1060c44f6627262f.png" width="25" height="23">
          作業一覧
        </div>
        <span class="${WORK_ARROW_CLASS}">▼</span>
      </div>
      <div class="${WORK_BODY_CLASS}" id="${WORK_ACC_ID}-body">
        <a href="/tasks">・全タスク</a>
        <a href="/akaire_feature/akaire_files">・全ファイル</a>
      </div>
    </div>

    <a class="tm-avatar-item item-menu_notification" href="/notification">
      <img class="avatar-modal-icon" src="/assets/nav/item_menu_notification-d262bbc82ef81da5db68e31e2a9bfe8481a993477882d1f82bbe63b48855c9d5.png" width="18" height="18">
      <span>アクティビティ</span>
    </a>

    <a class="tm-avatar-item item-menu_notice" href="/news">
      <img class="avatar-modal-icon" src="/assets/nav/item_menu_notice-7363b16fdd1870962589e324ef5b0c996d44b2cc04b6b04383e07722d4ee638b.png" width="18" height="18">
      <span>システムからのお知らせ</span>
    </a>

    <a class="tm-avatar-item item-menu_contact" href="/contact_us">
      <img class="avatar-modal-icon" src="/assets/nav/item_menu_contact-56196b9a1f28ab864e5424c781037b6b552eff1e90e445498daa86727cc8fefa.png" width="18" height="18">
      <span>お問合わせ</span>
    </a>

    <a class="tm-avatar-item item-menu_support" target="_blank" href="https://kanritools.com/help/">
      <img class="avatar-modal-icon" src="/assets/item_menu_support-ac56c8ab2e4c202ccee0b6fec97d4ad9c59ea2d9e6a294dd5db82aac10349e20.png" width="18" height="22">
      <span>ヘルプ</span>
    </a>

    <a class="tm-avatar-item log-out" id="btn-logout-user" rel="nofollow" data-method="delete" href="/logout">
      <img class="avatar-modal-icon" src="/assets/nav/item_menu_logout-3282c8cf0daeb1fd4d3e4e85bdf5d30398608c587653d9630011de4d418de9ca.png" width="22" height="22">
      <span>ログアウト</span>
    </a>
  `.trim();

  modal.dataset.tmAvatarCustomizedSp = '1';

  // 追加：DOM差し替え後もフォーカスを modal 側へ寄せる
  normalizeFocusForProfileModal(modal);

  // 追加：タイトル行の追尾固定＋スクロール時シャドー制御
  setupProfileModalTitleSticky(modal);
}

  /* =========================
     アコーディオン動作（作業一覧）
  ========================= */
  function bindAccordion() {
      document.addEventListener('click', (e) => {
          const t = e.target;
          if (!t || typeof t.closest !== 'function') return;

          const header = t.closest(`.${WORK_HEADER_CLASS}`);
          if (!header) return;

          // 追加：Bootstrapの dropdown 自動クローズを防ぐ
          e.preventDefault();
          e.stopPropagation();
          if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();

          const targetId = header.getAttribute('data-target');

          // id重複対策：同じブロック内（#tm_avatar_work_list）から探す
          const wrap = header.closest(`#${WORK_ACC_ID}`);
          const body =
            (wrap ? wrap.querySelector(`#${targetId}`) : null) ||
            header.parentElement?.querySelector?.(`#${targetId}`) ||
            document.getElementById(targetId);

          const arrow = header.querySelector(`.${WORK_ARROW_CLASS}`);
          if (!body || !arrow) return;

          const isOpen = body.classList.contains('tm-open');

          // ❷ modal側は !important のため class で制御
          body.classList.toggle('tm-open', !isOpen);

          // dropdown側も確実に開閉（既存CSSは !important ではないのでこれでもOK）
          body.style.display = isOpen ? 'none' : 'block';

          arrow.textContent = isOpen ? '▼' : '▲';
          arrow.classList.toggle('open', !isOpen);
      }, true);
  }

  /* =========================
     3) 外部クリックで dropdown を閉じる
  ========================= */
  function bindCloseOnOutsideClick() {
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (!t || typeof t.closest !== 'function') return;

      const menu = document.querySelector(MENU_SHOW_SELECTOR);
      if (!menu) return;

      const avatarBtn = document.querySelector(AVATAR_BTN_SELECTOR);

      // dropdown 内 or アバターボタン押下は許可
      if (t.closest(MENU_SHOW_SELECTOR)) return;
      if (avatarBtn && (t === avatarBtn || t.closest(AVATAR_BTN_SELECTOR))) return;

      // 閉じる（Bootstrap 依存せずに確実に閉じる）
      menu.classList.remove('show');
      if (avatarBtn) {
        avatarBtn.setAttribute('aria-expanded', 'false');
      }
    }, true);
  }

  /* =========================
     dropdown が開いたら整形
  ========================= */
  function watchDropdownOpen() {
    const mo = new MutationObserver(() => {
      const menu = document.querySelector(MENU_SHOW_SELECTOR);
      if (menu) customizeAvatarDropdown(menu);
    });

    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

    // 初回も念のため
    const menu = document.querySelector(MENU_SHOW_SELECTOR);
    if (menu) customizeAvatarDropdown(menu);
  }

  /* =========================
     init
  ========================= */

function replaceSpAvatarIconToGear() {
  if (!window.matchMedia('(max-width: 768px)').matches) return;

  // 対象：右上アバター（ヘッダー内の mail アイコン／btn-side-bar は絶対に触らない）
  const img =
    document.querySelector('#navbar-common img.icon.mail:not(.btn-side-bar)[data-tm-profile-avatar="1"]') ||
    document.querySelector('#navbar-common img.icon.mail:not(.btn-side-bar)');
  if (!img) return;

  // 目印を残す（src を dataURI に変えた後も「この要素が右上アバター」だと判別できるように）
  img.dataset.tmProfileAvatar = '1';

  // 既に歯車なら何もしない
  if (img.classList.contains('tm-gear-icon')) return;

  // 元srcを保持（差し戻し検知・デバッグ用）
  if (!img.dataset.tmOriginalSrc) {
    img.dataset.tmOriginalSrc = img.getAttribute('src') || '';
  }

  // 白歯車 + 黒丸背景（白背景でも必ず見える）
  const gearSvg =
    "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2024%2024%27%3E%3Ccircle%20cx%3D%2712%27%20cy%3D%2712%27%20r%3D%2711%27%20fill%3D%27%23111%27%2F%3E%3Cpath%20fill%3D%27%23fff%27%20d%3D%27M19.14%2012.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.11-.2-.36-.28-.57-.2l-2.39.96c-.5-.38-1.04-.69-1.64-.92l-.36-2.54c-.04-.24-.24-.41-.48-.41H9.68c-.24%200-.44.17-.48.41l-.36%202.54c-.6.23-1.14.54-1.64.92l-2.39-.96c-.21-.08-.46%200-.57.2L2.32%207.43c-.11.2-.06.47.12.61l2.03%201.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03%201.58c-.18.14-.23.41-.12.61l1.92%203.32c.11.2.36.28.57.2l2.39-.96c.5.38%201.04.69%201.64.92l.36%202.54c.04.24.24.41.48.41h4.64c.24%200%20.44-.17.48-.41l.36-2.54c.6-.23%201.14-.54%201.64-.92l2.39.96c.21.08.46%200%20.57-.2l1.92-3.32c.11-.2.06-.47-.12-.61l-2.03-1.58zM12%2015.5A3.5%203.5%200%201%201%2012%208a3.5%203.5%200%200%201%200%207.5z%27%2F%3E%3C%2Fsvg%3E";

  img.src = gearSvg;
  img.classList.add('tm-gear-icon');

  // ❶ 白枠（親要素背景）の打ち消し：歯車の直親だけ
  const p = img.parentElement;
  if (p) {
    p.style.background = 'transparent';
    p.style.border = '0';
    p.style.boxShadow = 'none';
  }

  // ❶ img自体の白枠打ち消し（念押し）
  img.style.background = 'transparent';
  img.style.border = '0';
  img.style.boxShadow = 'none';
  img.style.padding = '0';
}

/* =========================
   追加：アバターメニュー「ヘルプ」→ 検索モーダルを開く
   - 既存のWEB遷移(https://kanritools.com/help/)は使わず、
     管理画面側の検索ボタン（#akapon-help-btn）を押す
   - dropdown / profileModal 内の「ヘルプ」だけ対象
========================= */
function bindHelpSearchOpenFromAvatar() {
  if (window.__tmHelpSearchFromAvatarBound) return;
  window.__tmHelpSearchFromAvatarBound = true;

  const handler = (e) => {
    const t = e.target;
    if (!t || typeof t.closest !== 'function') return;

    const a = t.closest('a');
    if (!a) return;

    // ✅ 対象範囲：PCの右上アバタードロップダウン（MENU_SELECTOR） or SPの profileModal
    const inAvatarMenu =
      a.closest(MENU_SELECTOR) ||
      a.closest('#profileModal');

    if (!inAvatarMenu) return;

    // 「ヘルプ」文言で判定（class入替があるためテキスト基準にする）
    const label = (a.textContent || '').replace(/\s+/g, '').trim();
    if (label !== 'ヘルプ') return;

    const helpBtn = document.getElementById('akapon-help-btn');
    if (!helpBtn) return;

    // ✅ 既存の target="_blank" 遷移を潰す
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();

    helpBtn.click();
  };

  // ✅ target=_blank の先行動作対策：pointerdown を最優先で潰す
  document.addEventListener('pointerdown', handler, true);
  document.addEventListener('click', handler, true);
  document.addEventListener('auxclick', handler, true);
}

function init() {
  injectCss();
  bindAccordion();
  bindCloseOnOutsideClick();
  watchDropdownOpen();

  // 追加
  bindHelpSearchOpenFromAvatar();

  // 初回表示時点でも歯車化（クリック前対応）
  replaceSpAvatarIconToGear();

  // SP判定は1回だけにまとめる（重複排除）
  const isSP = window.matchMedia('(max-width: 768px)').matches;

  if (isSP) {

    /* =========================================================
       SP: 右上アバター監視（対象を絞って軽量化）
       - btn-side-bar は除外
       - src/class/style の「戻し（属性変更）」を拾って再度歯車化
       - body全体の attributes 監視は重いので、右上アバターimgに限定
       ========================================================= */
    const moSpAvatar = new MutationObserver(() => {
      replaceSpAvatarIconToGear();
    });

    const observeAvatarImg = (imgEl) => {
      if (!imgEl) return false;

      try {
        moSpAvatar.observe(imgEl, {
          attributes: true,
          attributeFilter: ['src', 'class', 'style']
        });
      } catch (e) {
        return false;
      }

      // 監視開始時点でも1回実行（初回遅延にも対応）
      replaceSpAvatarIconToGear();
      return true;
    };

    // まずは今ある右上アバターimgを監視（ヘッダー内のみ対象）
    const avatarImg = document.querySelector('#navbar-common img.icon.mail:not(.btn-side-bar)');
    const ok = observeAvatarImg(avatarImg);

    // もし初回にまだ居ない場合だけ、出現検知（childListのみ）→ 見つかったら監視を切替
    if (!ok) {
      const moFindAvatar = new MutationObserver(() => {
        const found = document.querySelector('#navbar-common img.icon.mail:not(.btn-side-bar)');
        if (!found) return;

        try { moFindAvatar.disconnect(); } catch (e) {}
        observeAvatarImg(found);
      });

      moFindAvatar.observe(document.body, { childList: true, subtree: true });
    }

    /* =========================================================
       SP modal：開いた後に別JSで戻される可能性があるため、
       「modalがshowになったタイミング」を拾って整形し、
       さらに短時間だけ監視して戻されたら再整形する
       ========================================================= */
    const moModal = new MutationObserver(() => {
      const modal = document.querySelector('#profileModal.modal.show');
      if (!modal) return;

      customizeProfileModalSP();

      const body = modal.querySelector('.modal-body');
      if (!body) return;

      // 500msだけ監視（戻されたら再適用）
      const start = Date.now();
      const moBody = new MutationObserver(() => {
        if (Date.now() - start > 500) {
          moBody.disconnect();
          return;
        }
        if (!body.querySelector('.tm-avatar-menu-title')) {
          customizeProfileModalSP();
        }
      });
      moBody.observe(body, { childList: true, subtree: true });
      setTimeout(() => moBody.disconnect(), 520);
    });

    moModal.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

  }

  // クリック起点：順序を修正（先に「右上アバターだったか」を判定してから歯車化する）
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!t || typeof t.closest !== 'function') return;

    // 右上アバター判定（srcが変わっても判定できるように data も使う）
    const avatarClicked =
      t.closest('#navbar-common img.icon.mail:not(.btn-side-bar)[data-tm-profile-avatar="1"]') ||
      t.closest('#navbar-common img.icon.mail.tm-gear-icon:not(.btn-side-bar)');

    // クリック時も念のため歯車化（白枠化の再発防止）
    replaceSpAvatarIconToGear();

    // 右上アバターを押したときだけ modal 整形（= src が変わっても判定できる）
    if (avatarClicked) {
      setTimeout(() => {
        customizeProfileModalSP();
      }, 120);
    }
  }, true);
}

init();

})();
