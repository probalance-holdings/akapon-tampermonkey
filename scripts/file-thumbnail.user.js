// ==UserScript==
// @name         ファイル｜サムネイル※file-thumbnail.user.js
// @namespace    akapon
// @version      20260222 1200
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
@media (max-width: 768px) {
    /* 2列（カード間の余白を確保） */
    #thumbnail-list .element-thumbnail {
        width: calc(50% - 10px) !important;
        flex: 0 0 calc(50% - 10px) !important;
        max-width: calc(50% - 10px) !important;
        height: 280px !important; /* 既存指定を維持 */
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

  function init() {
    if (!shouldApply()) return;

    // ✅ 先にCSSを即時注入（チラつき防止）
    injectStyle(buildCss());

    // 以降のJSフックはDOM準備後でOK
    hookSwalCopyModalAutoCloseOnce();
  }

  // setTimeout(500) をやめて即時起動（チラつき防止）
  init();
})();
