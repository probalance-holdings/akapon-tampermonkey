// ==UserScript==
// @name         校正画面｜ヘッダー※screen-header.user.js
// @namespace    akapon
// @version      20260227_0001
// @match        https://member.createcloud.jp/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/screen-header.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/screen-header.user.js
// ==/UserScript==

(function () {
  'use strict';

  // =========================================================
  // 校正画面判定（URLに依存せず、校正画面固有DOMの存在で判定）
  // =========================================================
  function isProofreadingHeaderPage() {
    const nav = document.getElementById('navbar-common');
    if (!nav) return false;

    const hasBreadcrumb = !!nav.querySelector('.dropdown-toggle-akaire-file-header');
    const hasFileNameInput = !!nav.querySelector('.show-change-name-akaire-file-header input.akaire_file_name');
    const hasTotalSize = !!nav.querySelector('.nav-bar-animation_size .animation_size');

    return hasBreadcrumb && hasFileNameInput && hasTotalSize;
  }

  // =========================================================
  // CSS（校正画面ヘッダー：縦中央揃え + 1024幅対策 + 文字サイズ統一）
  // =========================================================
  const STYLE_ID = 'tm-proofreading-screen-header-style';

  function buildCss() {
    return `
/* =========================================================
   TM: 校正画面（赤ヘッダー）専用
   ❶ ヘッダー内の文字/アイコンを縦中央揃え
   ❷ 総容量を2行（中央寄せ）
   ❸ 現在のプラン：王冠右に文字
   ❹ 必要箇所だけ縦線（白点線）
   ========================================================= */

/* ヘッダー全体の縦中央基準 */
html body #navbar-common{
  display: flex !important;
  align-items: center !important;
}

/* ul / li を縦中央に */
html body #navbar-common ul.navbar-nav,
html body #navbar-common ul.navbar-nav > li{
  display: flex !important;
  align-items: center !important;
}

/* リンク/ボタン/スパンも縦中央に寄せる（ズレ防止） */
html body #navbar-common a,
html body #navbar-common button,
html body #navbar-common span{
  vertical-align: middle !important;
}

/* 左：サイドバーアイコン（クリック領域） */
html body #navbar-common .btn-side-bar,
html body #navbar-common .btn-side-bar img{
  display: block !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

/* ❶ パンくず（プロジェクト ▷ タスク ▷）の間隔詰め */
html body #navbar-common .dropdown-toggle-akaire-file-header{
  display: inline-flex !important;
  align-items: center !important;
  gap: 3px !important;
  white-space: nowrap !important;
}
html body #navbar-common .dropdown-toggle-akaire-file-header span{
  padding: 0 !important;
  margin: 0 !important;
}
html body #navbar-common .dropdown-toggle-akaire-file-header i{
  margin: 0 !important;
  padding: 0 !important;
}

/* ❶ パンくず〜ファイル名の間隔を詰める */
html body #navbar-common .show-dropdown-hover-akaire-file-header{
  margin: 0 20px !important;
}
html body #navbar-common .show-change-name-akaire-file-header{
  display: flex !important;
  align-items: center !important;
  margin-left: 6px !important;
}
html body #navbar-common .show-change-name-akaire-file-header input.akaire_file_name{
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  line-height: 1.2 !important;
}

/* ❺ 移動後のチャット（ファイル名右） */
html body #navbar-common .tm-proof-chat-right{
  display: inline-flex !important;
  align-items: center !important;
  margin-left: 0 !important;
  position: static !important;
  left: auto !important;
}

/* ❷ 総容量（2行・中央） ※改行自体はJSで入れる */
html body #navbar-common .nav-bar-animation_size{
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: center !important;
  line-height: 1.05 !important;
  margin-right: 0.8em !important;
}

html body #navbar-common .nav-bar-animation_size .animation_size{
  display: inline-block !important;
  text-align: left !important;
  line-height: 1.05 !important;
}

/* 「：」の後で自動改行させる */
html body #navbar-common .nav-bar-animation_size .animation_size{
  white-space: pre-line !important;
}

html body #navbar-common .nav-bar-animation_size .animation_size::after{
  content: attr(data-size);
  display: block;
}

/* ❸ 現在のプラン：王冠の右に文字（折返し防止・バランス調整） */
html body #navbar-common #plan-header-toggle-btn{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  white-space: nowrap !important;
}
html body #navbar-common #plan-header-toggle-btn img{
  display: block !important;
  margin: 0 !important;
}

/* 右：通知/ヘルプ/ユーザーなどの縦ズレ抑制 */
html body #navbar-common #akapon-help-btn,
html body #navbar-common a.drop_btn,
html body #navbar-common .nav-notification a.drop_btn,
html body #navbar-common .user_info > button.btn-dropdown-logout{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  transform: none !important;
}

/* inline style の margin-top:4px を打ち消す（ベルがズレやすい） */
html body #navbar-common a.drop_btn[data-name="notificationDropbox"]{
  margin-top: 0 !important;
}

/* svg / img の縦位置ブレ防止 */
html body #navbar-common img,
html body #navbar-common svg{
  display: block !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

/* ❹ 縦線（白点線） ※増えすぎ防止のため “付与した要素だけ” に出す */
html body #navbar-common .tm-proof-sep-right{
  border-right: 1px dotted rgba(255,255,255,.55) !important;
  padding-right: 7px !important;
  margin-right: 7px !important;
}

/* =========================================================
   バーガー
   ========================================================= */
  html body #navbar-common .btn-side-bar,
  html body #navbar-common .btn-side-bar img{
    margin-top: 8px !important;
  }

  html body #navbar-common .btn-side-bar{
    width: 30px !important;
    height: 30px !important;
  }

/* ❸ 1024幅：文字サイズ統一（総容量は非表示にしない方針へ変更） */
@media (max-width: 1024px){
  html body #navbar-common,
  html body #navbar-common a,
  html body #navbar-common span,
  html body #navbar-common button{
    font-size: 1em !important;
  }

  html body #navbar-common .open-popup-chat,
  html body #navbar-common .open-popup-chat *{
    line-height: 1.2 !important;
  }
}

@media (min-width: 1367px) {
  html body #navbar-common .show-change-name-akaire-file-header{
    max-width: 340px !important;
    width: 350px !important;
    min-width: 240px !important;
  }
}

@media (max-width: 1024px){
  html body a.custom-nav-link[href="/akaire_feature/akaires/list_temp_file"]{
    padding-right: 0 !important;
    margin: 0 0px !important;
  }

  html body #navbar-common .show-dropdown-hover-akaire-file-header{
    margin: 0 0px !important;
  }
}

@media (max-width: 1024px){
  html body #navbar-common .nav-bar-animation_size .animation_size{
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    line-height: 1.05 !important;
  }
}

@media (min-width: 1024px) and (max-width: 1260px){

  /* ❶ 総容量を非表示 */
  html body #navbar-common .nav-bar-animation_size{
    display: none !important;
  }

  /* ❷ パンくず横余白を詰める */
  html body #navbar-common .show-dropdown-hover-akaire-file-header{
    margin: 0 8px !important;
  }

  /* ❸ ファイル名入力幅を自動縮小 */
  html body #navbar-common .show-change-name-akaire-file-header{
    max-width: 160px !important;
    width: auto !important;
    min-width: 0 !important;
  }

  /* ❹ ヘッダー外側のpadding削除（横幅確保） */
  html body .navbar_outer{
    padding: 0 6px !important;
  }

  /* ❺ 通知アイコン間隔少し縮小 */
  html body #navbar-common a.drop_btn[data-name="notificationDropbox"]{
    margin-right: 6px !important;
  }

  html body #navbar-common .nav-notification a.drop_btn{
    margin-left: 4px !important;
  }
}

/* =========================================================
   1025px ～ 1366px
   ========================================================= */
@media (min-width: 1024px) and (max-width: 1366px){

  html body #navbar-common .btn-side-bar,
  html body #navbar-common .btn-side-bar img{
    margin-top: 8px !important;
  }

  html body #navbar-common .btn-side-bar{
    width: 30px !important;
    height: 30px !important;
  }

  html body #navbar-common .show-change-name-akaire-file-header{
    display: flex !important;
    align-items: center !important;
    max-width: 320px !important;
    min-width: 200px !important;
    width: 100% !important;
    font-size: 13px !important;
  }

  html body #navbar-common .show-change-name-akaire-file-header input.akaire_file_name{
    flex: 1 1 auto !important;
    min-width: 0 !important;
    width: 100% !important;
  }
}

/* =========================================================
   1024px（iPad mini）だけ
   ========================================================= */
@media (width: 1024px){

  html body #navbar-common .show-change-name-akaire-file-header{
    display: flex !important;
    align-items: center !important;
    max-width: 250px !important;
    min-width: 200px !important;
    width: 100% !important;
    font-size: 13px !important;
  }

  html body #navbar-common .show-change-name-akaire-file-header input.akaire_file_name{
    flex: 1 1 auto !important;
    min-width: 0 !important;
    width: 100% !important;
  }
}

html body #navbar-common #plan-header-toggle-btn img{
  width: 20px !important;
  height: 14px !important;
  position: relative !important;
  top: -1px !important;
}
`;
  }

  function syncStyle() {
    const existing = document.getElementById(STYLE_ID);

    // 校正画面以外では確実に消す（遷移対策）
    if (!isProofreadingHeaderPage()) {
      if (existing) existing.remove();
      return;
    }

    if (existing) return;

    const parent = document.head || document.documentElement;
    if (!parent) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(buildCss()));
    parent.appendChild(style);
  }

  // =========================================================
  // ❷ トークをアイコンに差し替え（全サイズ）
  // - リンク自体（href/onclick/id）は残し、中身のみ差し替える
  // =========================================================
  function syncTalkToIcon() {
    if (!isProofreadingHeaderPage()) return;

    const nav = document.getElementById('navbar-common');
    if (!nav) return;

    const talk = nav.querySelector('a.open-popup-chat');
    if (!talk) return;

    if (talk.dataset.tmTalkIconApplied === '1') return;

    // 初回だけ「トーク」判定（既存DOM用）
    const text = (talk.textContent || '').replace(/\s+/g, '');
    if (text && text.indexOf('トーク') === -1) return;

    talk.innerHTML = `
      <img src="/assets/icon_chat_thumbnail_bigger-837c110ff35a722218fee2bc116bb13f9b7232facaccf36bde0467cf51948c86.png"
           width="25" height="22" alt="トーク">
    `.trim();

    talk.style.display = 'inline-flex';
    talk.style.alignItems = 'center';
    talk.style.justifyContent = 'center';

    talk.dataset.tmTalkIconApplied = '1';
  }

  // =========================================================
  // ❷ 総容量を2行にする（中央寄せ）
  // - 「総容量： 152.49MB」→「総容量<br>152.49MB」
  // =========================================================
function syncTotalSizeTwoLines() {
  const span = document.querySelector('#navbar-common .nav-bar-animation_size .animation_size');
  if (!span) return;

  // すでに <br> が入っていればOK（何度呼ばれても壊さない）
  if (span.innerHTML && span.innerHTML.includes('<br')) {
    span.dataset.tmTwoLinesApplied = '1';
    return;
  }

  const text = (span.textContent || '').trim(); // 例: "総容量： 152.49MB"
  if (!text.startsWith('総容量')) return;

  // 「総容量」+「残り」に分けて、必ず <br> を挿入
  const rest = text.replace(/^総容量/, ''); // "： 152.49MB"
  span.innerHTML = `総容量<br>${rest}`;

  span.dataset.tmTwoLinesApplied = '1';
}

  // =========================================================
  // ❹ 縦線（白点線）を必要箇所だけに付与（増えすぎ防止）
  // - 既存のグレー縦線位置に合わせたいので、
  //   左メニュー側の主要項目（ホーム/ファイル/一時保管）だけ付ける
  // =========================================================
  function syncHeaderSeparators() {
    if (!isProofreadingHeaderPage()) return;

    const nav = document.getElementById('navbar-common');
    if (!nav) return;

    const ul = nav.querySelector('ul.navbar-nav');
    if (!ul) return;

    // 対象：ホーム、ファイル、一時保管フォルダー
    const homeLi = ul.querySelector('li.nav-item a.custom-nav-link[href="/projects"]')?.closest('li.nav-item');
    const fileLi = ul.querySelector('#caseFile')?.closest('li.nav-item');
    const tempLi = ul.querySelector('a.custom-nav-link[href*="akaires/list_temp_file"]')?.closest('li.nav-item');

    [homeLi, fileLi, tempLi].forEach(li => {
      if (!li) return;
      if (li.classList.contains('tm-proof-sep-right')) return;
      li.classList.add('tm-proof-sep-right');
    });
  }

// =========================================================
// ❻ 「一時保管フォルダー」→「一時保管」に変更（全サイズ）
// =========================================================
function syncTempFolderText() {
  if (!isProofreadingHeaderPage()) return;

  const nav = document.getElementById('navbar-common');
  if (!nav) return;

  const link = nav.querySelector('a.custom-nav-link[href*="akaires/list_temp_file"]');
  if (!link) return;

  if (link.dataset.tmTempShortened === '1') return;

  const text = (link.textContent || '').trim();
  if (text === '一時保管フォルダー') {
    link.textContent = '一時保管';
    link.dataset.tmTempShortened = '1';
  }
}

  // =========================================================
  // ❺ チャットアイコンを「ファイル名（ファイル1）」の右側に移動
  // - 位置だけ移動し、リンクはそのまま使用
  // =========================================================
  function syncMoveChatToRightOfFileName() {
    if (!isProofreadingHeaderPage()) return;

    const nav = document.getElementById('navbar-common');
    if (!nav) return;

    const talkA = nav.querySelector('a.open-popup-chat');
    if (!talkA) return;

    // ✅ 移動済み判定は a タグ側で行う（場所が変わっても確実）
    if (talkA.dataset.tmMovedChatRight === '1') return;

    const fileNameBox = nav.querySelector('.show-change-name-akaire-file-header');
    if (!fileNameBox) return;

    // すでにファイル名枠の中に居るなら終了
    if (fileNameBox.contains(talkA)) {
      talkA.dataset.tmMovedChatRight = '1';
      return;
    }

    // 元のliを控えてから移動（移動後は closest('li') が取れない可能性があるため）
    const originalLi = talkA.closest('li');

    // ✅ 入力欄の直後にチャットを差し込む（必ず「ファイル1」の右になる）
    const input = fileNameBox.querySelector('input.akaire_file_name');
    if (input) {
      input.insertAdjacentElement('afterend', talkA);
    } else {
      fileNameBox.appendChild(talkA);
    }

    // ✅ 5pxの余白を付けて枠右に配置
    talkA.style.display = 'inline-flex';
    talkA.style.alignItems = 'center';
    talkA.style.justifyContent = 'center';
    talkA.style.marginLeft = '5px';
    talkA.style.flex = '0 0 auto';

    // ✅ 元の li が空になったら削除（表示崩れ防止）
    if (originalLi && originalLi !== fileNameBox.closest('li')) {
      if (originalLi.querySelector('a.open-popup-chat') === null) {
        originalLi.remove();
      }
    }

    talkA.dataset.tmMovedChatRight = '1';
  }

  // =========================================================
  // 起動（document-start なので、DOM生成後を軽く監視して1回適用）
  // =========================================================
  function tickInit() {
    syncStyle();

    // 先にアイコン化 → その後に移動（中身が変わっても位置が安定する）
    syncTalkToIcon();
    syncMoveChatToRightOfFileName();

    syncTotalSizeTwoLines();
    syncHeaderSeparators();
    syncTempFolderText();
  }
  // DOMがまだ無いタイミングがあるので、短時間だけポーリングして当てる
document.addEventListener('DOMContentLoaded', () => {

  // 0.2秒だけ待って1回実行
  setTimeout(() => {
    if (!isProofreadingHeaderPage()) return;
    tickInit();
  }, 200);

});
})();
