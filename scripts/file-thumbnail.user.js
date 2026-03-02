// ==UserScript==
// @name         ファイル｜サムネイル※file-thumbnail.user.js
// @namespace    akapon
// @version      20260302 2300
// @match        https://member.createcloud.jp/*
// @match        https://membernew.createcloud.jp/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/file-thumbnail.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/file-thumbnail.user.js
// ==/UserScript==

(() => {
  'use strict';
/* =========================================================
まだSPが途中
   ========================================================= */

  const STYLE_ID = 'akapon-file-thumbnail-style';

  function shouldApply() {
    const path = location.pathname || '';
    if (path.startsWith('/akaire_file/')) return true;
    if (path.startsWith('/akaire_feature/akaire_files/')) return true;
    return false;
  }

function buildCss() {
  return `
/* =========================================================
   アカポン（ファイル｜サムネイル）CSS
   対象:
   - /akaire_file/
   - /akaire_feature/akaire_files/（校正画面）
   ========================================================= */

/* ===== サムネ枠（カード） ===== */
#thumbnail-list .element-thumbnail,
#thumbnail-list .akaire-file-element-thumbnail {
    width: calc(16.66% - 10px);
    height: 270px !important;

    background: linear-gradient(180deg, #1c202a 0%, #151820 100%);
    border-radius: 12px;
    box-sizing: border-box;
    position: relative;

    margin-top: 5px;
    margin-bottom: 10px;
}

/* ===============================
   ★最強CSS：サムネ枠 強制指定（ご指定どおり）
   - 既存CSSに勝つため、詳細セレクタ + !important
=============================== */
html body #thumbnail-list .element-thumbnail{
    width: calc(16.66% - 10px) !important;
    background: #000 !important;
    height: 250px !important;
    border-radius: 16px !important; /* ★12 → 16 */
    box-shadow: 5px 5px 5px #000000 !important;
    border: 1px solid #fff !important;
}
/* PC時の既存「1列5個固定」を上書きしても6列を維持 */
@media screen and (min-width: 1024px) {
    html body #thumbnail-list .element-thumbnail{
        width: calc(16.66% - 10px) !important;
        max-width: calc(16.66% - 10px) !important;
    }
}

/* PC時：1列5個に固定（6個にならない） */
@media screen and (min-width: 1024px) {
    #thumbnail-list .element-thumbnail {
        width: calc(20% - 8px);
        /* flex: 0 0 calc(20% - 8px); */
        max-width: calc(20% - 8px);
    }
}

/* ===== 重要：shadow競合対策 ===== */
#thumbnail-list .element-thumbnail.akaire-file-element-thumbnail {
    box-shadow:
        0 0 0 1px rgba(120, 160, 255, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.06),
        0 12px 28px rgba(0, 0, 0, 0.30),
        0 4px 12px rgba(0, 0, 0, 0.18) !important;
}

/* ===== 画像エリア ===== */
#thumbnail-list .element-thumbnail .display-image-file {
    overflow: hidden;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    position: relative;
}

#thumbnail-list .element-thumbnail .display-image-file a {
    display: block;
}

#thumbnail-list .element-thumbnail .display-image-file img.thumbnail-image {
    display: block;
    width: 100%;
    height: 170px;
    object-fit: cover;
    object-position: center;
    filter: brightness(1.10) contrast(1.04) saturate(1.05);
}

/* ===== 下の情報エリア（共通） ===== */
#thumbnail-list .element-thumbnail .thumbnail-info-pc,
#thumbnail-list .element-thumbnail .thumbnail-info-sp {
    background: #3c3c3c;
    color: rgba(255, 255, 255, 0.92);
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    border-top: 2px solid #ffffff;
}

#thumbnail-list .element-thumbnail .thumbnail-info-pc .text-white,
#thumbnail-list .element-thumbnail .thumbnail-info-sp .text-white {
    color: rgba(255, 255, 255, 0.92);
}

#thumbnail-list {
    padding-bottom: 0;
    margin-bottom: 0;

    /* ✅ 追加：カード間の余白（最強CSS） */
    gap: 8px !important;
}

/* =========================================================
   SP版：完成形イメージに合わせる
   - SPでも「PC側の情報レイアウト」を表示
   - SPの6アイコンUI（thumbnail-info-sp）は非表示
   - SPは2列表示に寄せる
   ========================================================= */
@media (max-width: 767px) {

    /* ★SP：grid 2列（奇数でも最後の1枚は左に残る） */
    html body #thumbnail-list{
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 10px !important;

        justify-content: initial !important; /* flex中央寄せを無効化 */
        justify-items: stretch !important;
    }

    /* ★grid化するので width/flex 系は外して高さだけ保持 */
    html body #thumbnail-list .element-thumbnail{
        width: auto !important;
        max-width: none !important;
        flex: initial !important;

        height: 187px !important; /* ★200 → 187 */
    }

    /* SPでもPC側情報を見せる（完成形イメージの見た目に揃える） */
    #thumbnail-list .element-thumbnail .thumbnail-info-pc {
        display: block !important;
    }
    #thumbnail-list .element-thumbnail .thumbnail-info-sp {
        display: none !important;
    }

    /* 文字が詰まりやすいので最低限の読みやすさだけ調整（見た目は維持） */
    #thumbnail-list .element-thumbnail .thumbnail-info-pc .fs-14 { font-size: 13px !important; }
    #thumbnail-list .element-thumbnail .thumbnail-info-pc .fs-13 { font-size: 12px !important; }
    #thumbnail-list .element-thumbnail .thumbnail-info-pc .fs-12 { font-size: 11px !important; }

    /* 下部アイコン行のはみ出し防止（レイアウトは変えない） */
    #thumbnail-list .element-thumbnail .thumbnail-info-pc .third-line {
        gap: 4px !important;
    }
    #thumbnail-list .element-thumbnail .thumbnail-info-pc .third-line .w-60 {
        min-width: 0 !important;
    }

    /* =========================================================
       ✅ SPだけ：種別表示の「文字だけ」非表示
       - アイコン(img)は残す
       - 4種類（動画/YouTube/画像/WWW）全部ここ
    ========================================================= */
    html body #thumbnail-list .element-thumbnail .thumbnail-info-pc
    .akaire-animetion-type-container{
        font-size: 0 !important;
        line-height: 0 !important;
    }
    html body #thumbnail-list .element-thumbnail .thumbnail-info-pc
    .akaire-animetion-type-container > img{
        display: inline-block !important;
        font-size: initial !important;
        line-height: initial !important;
    }

    /* =========================================================
       ✅ SPだけ：ラベル文字を非表示（❶更新日： ❷期限日：）
       - ラベル（1つ目span）だけ消す
       - 値（2つ目span）は必ず表示（消える事故を防ぐ）
    ========================================================= */
    html body #thumbnail-list .element-thumbnail .thumbnail-info-pc
    .file-thumb-updated_at-text > span:nth-of-type(1){
        display: none !important;
    }
    html body #thumbnail-list .element-thumbnail .thumbnail-info-pc
    .file-thumb-updated_at-text > span:nth-of-type(2){
        display: inline !important; /* ★日付は必ず残す */
    }

    html body #thumbnail-list .element-thumbnail .thumbnail-info-pc
    .file-thumb-deadline-text > span:nth-of-type(1){
        display: none !important;
    }
    html body #thumbnail-list .element-thumbnail .thumbnail-info-pc
    .file-thumb-deadline-text > span:nth-of-type(2){
        display: inline !important; /* ★期限の値は必ず残す */
    }

    /* =========================================================
       ✅ SPだけ：種別表示の「文字だけ」非表示（❸）
       - アイコン(img)は残す
       - 4種類（動画/YouTube/画像/WWW）すべて同じ場所なので一括
       - .akaire-animetion-type-container 内の「img以外」を消す
    ========================================================= */
    html body #thumbnail-list .element-thumbnail .thumbnail-info-pc
    .akaire-animetion-type-container{
        font-size: 0 !important;    /* 文字を消す（アイコンは残る） */
        line-height: 0 !important;
    }

    /* 念のため：imgは元サイズで表示 */
    html body #thumbnail-list .element-thumbnail .thumbnail-info-pc
    .akaire-animetion-type-container > img{
        font-size: initial !important;
        line-height: initial !important;
        display: inline-block !important;
    }
}

/* さらに狭い端末：1列（崩れ防止） */
@media (max-width: 420px) {
    #thumbnail-list .element-thumbnail {
        width: calc(100% - 10px) !important;
        flex: 0 0 calc(100% - 10px) !important;
        max-width: calc(100% - 10px) !important;
    }
}

.swal2-popup.akaire_alert_popup {
    position: relative !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    transform: none !important;
    height: auto !important;
    min-height: unset !important;
    width: 70% !important;
    max-width: 980px !important;
    border-top: none !important;
    border-radius: 8px !important;

    /* ✅ ❶シャドー強化（“モーダル感”を明確に） */
    box-shadow:
      0 16px 40px rgba(0, 0, 0, 0.35),
      0 6px 16px rgba(0, 0, 0, 0.22),
      0 0 0 1px rgba(255, 255, 255, 0.06) !important;

    padding: 18px 14px !important;
    overflow: hidden !important;
}

/* さらに狭い端末：1列（崩れ防止） */
@media (max-width: 420px) {
    #thumbnail-list .element-thumbnail {
        width: calc(100% - 10px) !important;
        flex: 0 0 calc(100% - 10px) !important;
        max-width: calc(100% - 10px) !important;
    }
}

/* さらに狭い端末：1列（崩れ防止） */
@media (max-width: 420px) {
    #thumbnail-list .element-thumbnail {
        width: calc(100% - 10px) !important;
        flex: 0 0 calc(100% - 10px) !important;
        max-width: calc(100% - 10px) !important;
    }
}

/* ===============================
   iPad：列数制御（最強CSS）
   - mini横(1024x768)：4列
   - Air/Pro横：画面幅に応じて列数可変
   - Air/Pro縦：3列で統一
=============================== */

/* iPad mini 横長（1024×768）：4列で横幅を広げる */
@media (width: 1024px) and (height: 768px) and (orientation: landscape) {

    html body #thumbnail-list{
        justify-content: center !important; /* ★iPadも中央寄せ */
    }

    html body #thumbnail-list .element-thumbnail {
        width: calc(25% - 10px) !important;
        flex: 0 0 calc(25% - 10px) !important;
        max-width: calc(25% - 10px) !important;
    }
}

/* iPad Air 横（1180×820 など）：4列／全体中央／端数は左寄せ */
@media (min-width: 1100px) and (max-width: 1299px) and (orientation: landscape) {

    html body #thumbnail-list{
        display: grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        gap: 10px !important;

        width: fit-content !important;
        margin-left: auto !important;
        margin-right: auto !important;
        justify-content: start !important; /* 端数は左寄せ */
    }

    html body #thumbnail-list .element-thumbnail{
        width: auto !important;
        max-width: none !important;
        flex: initial !important;
    }
}

/* iPad Pro 横（1366×1024）：5列／全体中央／端数は左寄せ */
@media (min-width: 1300px) and (max-width: 1366px) and (orientation: landscape) {

    html body #thumbnail-list{
        display: grid !important;
        grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
        gap: 10px !important;

        width: fit-content !important;   /* ★グリッド全体を“内容幅”にする */
        margin-left: auto !important;    /* ★全体中央 */
        margin-right: auto !important;   /* ★全体中央 */
        justify-content: start !important; /* ★端数行は左から並ぶ */
    }

    html body #thumbnail-list .element-thumbnail{
        width: auto !important;
        max-width: none !important;
        flex: initial !important;
    }
}

/* iPad 縦（820×1180 等）：3列／PC情報強制表示／SP情報非表示 */
@media (min-width: 820px) and (max-width: 1024px) and (orientation: portrait) {

    html body #thumbnail-list{
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 10px !important;

        width: fit-content !important;
        margin-left: auto !important;
        margin-right: auto !important;
        justify-content: start !important; /* 端数は左寄せ */
    }

    html body #thumbnail-list .element-thumbnail{
        width: auto !important;
        max-width: none !important;
        flex: initial !important;
    }

    /* ★iPad縦は iPadPro縦と同じ：PC情報を見せる */
    html body #thumbnail-list .element-thumbnail .thumbnail-info-pc{
        display: block !important;
    }
    html body #thumbnail-list .element-thumbnail .thumbnail-info-sp{
        display: none !important;
    }
}

/* iPad mini 縦（768×1024）：3列／PC情報強制表示／SP情報非表示 */
@media (width: 768px) and (height: 1024px) and (orientation: portrait) {

    html body #thumbnail-list{
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 10px !important;

        width: fit-content !important;
        margin-left: auto !important;
        margin-right: auto !important;
        justify-content: start !important;
    }

    html body #thumbnail-list .element-thumbnail{
        width: auto !important;
        max-width: none !important;
        flex: initial !important;
    }

    html body #thumbnail-list .element-thumbnail .thumbnail-info-pc{
        display: block !important;
    }
    html body #thumbnail-list .element-thumbnail .thumbnail-info-sp{
        display: none !important;
    }
}
`;
  }

function injectStyle(cssText) {
  // document-start では head が無いことがあるのでフォールバック
  const parent = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
  if (!parent) return;

  const old = document.getElementById(STYLE_ID);
  if (old) old.remove();

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.type = 'text/css';
  style.appendChild(document.createTextNode(cssText));
  parent.appendChild(style);
}

  // =========================================================
  // TM: コピー中 swal2（akaire_alert_popup）
  // ❶ 10秒で自動クローズ
  // ❷ 外部クリックでクローズ
  // ※ akaire_alert_popup のみ対象（他Swalへ影響させない）
  // =========================================================
  let isSwalCopyModalHooked = false;

  function hookSwalCopyModalAutoCloseOnce() {
    if (isSwalCopyModalHooked) return;
    isSwalCopyModalHooked = true;

    // swal2-popup が後から出るので監視
    const closeAkaireSwalIfVisible = () => {
      const popup = document.querySelector('.swal2-popup.akaire_alert_popup');
      if (!popup) return false;

      // SweetAlert2があれば正式に閉じる
      if (window.Swal && typeof window.Swal.close === 'function') {
        try {
          window.Swal.close();
          return true;
        } catch (_) {}
      }

      // フォールバック：DOMを閉じる（akaire_alert_popup のみ）
      const container = popup.closest('.swal2-container');
      if (container) container.remove();
      else popup.remove();
      return true;
    };

    // 外部クリックで閉じる（containerクリック時のみ）
    document.addEventListener('click', (ev) => {
      const t = ev.target;
      if (!t || !t.closest) return;

      const container = t.closest('.swal2-container');
      if (!container) return;

      const popup = container.querySelector('.swal2-popup.akaire_alert_popup');
      if (!popup) return; // akaire_alert_popup 以外は無視

      // 「外部」＝container自体をクリックしたときだけ
      if (t === container) {
        ev.preventDefault();
        ev.stopPropagation();
        closeAkaireSwalIfVisible();
      }
    }, true);

    // 出現検知 → 10秒タイマー設定（akaire_alert_popup のみ）
    const mo = new MutationObserver(() => {
      const popup = document.querySelector('.swal2-popup.akaire_alert_popup');
      if (!popup) return;

      if (popup.dataset.akaponAutoCloseSet === '1') return;
      popup.dataset.akaponAutoCloseSet = '1';

      setTimeout(() => {
        closeAkaireSwalIfVisible();
      }, 10000);
    });

    mo.observe(document.documentElement, { childList: true, subtree: true });

    // 念のため初回もチェック
    const popupNow = document.querySelector('.swal2-popup.akaire_alert_popup');
    if (popupNow && popupNow.dataset.akaponAutoCloseSet !== '1') {
      popupNow.dataset.akaponAutoCloseSet = '1';
      setTimeout(() => {
        closeAkaireSwalIfVisible();
      }, 10000);
    }
  }

// =========================================================
// SP：種別アイコン押下で「非表示にした文字」を下部モーダル表示
// - 黒枠 / 白文字 / 影 / 角丸
// - SP（<=768px）のみ有効
// =========================================================
let isSpTypeTextModalHooked = false;

function hookSpTypeTextModalOnce() {
  if (isSpTypeTextModalHooked) return;
  isSpTypeTextModalHooked = true;

  const MODAL_ID = 'tm-sp-type-text-modal';

  function ensureModal() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.style.position = 'fixed';
    modal.style.zIndex = '2147483647';
    modal.style.display = 'none';

    // 黒枠 / 白文字 / 影 / 角丸（最強）
    modal.style.background = '#000';
    modal.style.color = '#fff';
    modal.style.border = '2px solid #000';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 10px 28px rgba(0,0,0,.35)';
    modal.style.padding = '10px 12px';
    modal.style.maxWidth = '92vw';
    modal.style.fontSize = '13px';
    modal.style.lineHeight = '1.4';

    document.body.appendChild(modal);

    // 外側クリックで閉じる
    document.addEventListener('click', (e) => {
      const el = document.getElementById(MODAL_ID);
      if (!el || el.style.display === 'none') return;

      // modal 自身 or アイコン押下元は除外
      if (el.contains(e.target)) return;
      if (e.target && e.target.closest && e.target.closest('.akaire-animetion-type-container')) return;

      el.style.display = 'none';
    }, true);

    // 画面リサイズ/スクロールで閉じる（位置ズレ防止）
    window.addEventListener('resize', () => {
      const el = document.getElementById(MODAL_ID);
      if (el) el.style.display = 'none';
    }, { passive: true });

    window.addEventListener('scroll', () => {
      const el = document.getElementById(MODAL_ID);
      if (el) el.style.display = 'none';
    }, { passive: true });

    return modal;
  }

  function extractText(container) {
    // img以外の表示文字を拾う（例：00:01:31 など）
    const clone = container.cloneNode(true);
    clone.querySelectorAll('img').forEach(img => img.remove());
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
  }

  document.addEventListener('click', (e) => {
    // SPのみ
    if (!window.matchMedia || !window.matchMedia('(max-width: 768px)').matches) return;

    const container = e.target && e.target.closest ? e.target.closest('.akaire-animetion-type-container') : null;
    if (!container) return;

    const text = extractText(container);
    if (!text) return;

    const modal = ensureModal();

    // 表示内容
    modal.textContent = text;

    // 位置：押下したアイコン行の「下」
    const r = container.getBoundingClientRect();
    const gap = 8;

    let top = Math.round(r.bottom + gap);
    let left = Math.round(r.left);

    // 画面外にはみ出さないように補正
    modal.style.display = 'block';
    modal.style.top = '0px';
    modal.style.left = '0px';

    // いったん描画してサイズ取得
    const mw = modal.offsetWidth;
    const mh = modal.offsetHeight;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (left + mw > vw - 8) left = Math.max(8, vw - mw - 8);
    if (top + mh > vh - 8) top = Math.max(8, Math.round(r.top - mh - gap)); // 下に出ないなら上に出す

    modal.style.left = `${left}px`;
    modal.style.top  = `${top}px`;
  }, true);
}

function init() {
    if (!shouldApply()) return;

    // ✅ 先にCSSを即時注入（チラつき防止）
    injectStyle(buildCss());

    // 以降のJSフックはDOM準備後でOK
    hookSwalCopyModalAutoCloseOnce();

    // ✅ SP：アイコン押下で文字モーダル
    hookSpTypeTextModalOnce();
  }

  // setTimeout(500) をやめて即時起動（チラつき防止）
  init();
})();
