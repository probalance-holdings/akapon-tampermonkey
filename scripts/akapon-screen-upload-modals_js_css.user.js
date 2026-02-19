// ==UserScript==
// @name         9｜アカポン（アップロード周りモーダル調整｜保存3秒｜YouTube広告｜バージョン更新）※akapon-screen-upload-modals_js_css.user.js
// @namespace    akapon
// @version      1.0
// @match        https://member.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-screen-upload-modals_js_css.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-screen-upload-modals_js_css.user.js
// ==/UserScript==

/* =========================================================
   メモ（運用メモ）
   - アップロード後の●●保存しましたmodalの修正
   - アップロードデータを保存しましたを3秒のみにする
   - YouTube広告についてのモーダルにシャドー
   - バージョンを更新するmodalの修正
   ========================================================= */

(() => {
  'use strict';

  const STYLE_ID = 'akapon-upload-modals-css';
  const SAVE_MODAL_TEXT = 'アップロードデータを保存しました';
  const SAVE_AUTO_CLOSE_MS = 3000;

  /* =========================================================
     1) CSS注入（YouTube広告モーダル + バージョン更新モーダル）
     ========================================================= */
  const css = `
/* =========================
   YouTube広告についてのモーダル
   ========================= */
#modal-show-warning-upload-video-youtube-ads .modal-dialog .modal-content{
  max-width: 765px !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.35) !important;
}

/* =========================
   バージョンを更新するmodal（uploadVersionPopup / uploadNewPagePopup）
   ========================= */

/* ① akaire（SweetAlert2）モーダル位置・見た目（下部トースト風） */
.swal2-container.swal2-center:has(.akaire_alert_popup){
  align-items: flex-end !important;
  padding-bottom: 18px !important;
}
.swal2-popup.akaire_alert_popup{
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.35) !important;

  padding: 18px 14px !important;
  overflow: hidden !important;
}
@media (max-width: 768px){
  .swal2-popup.akaire_alert_popup{
    width: calc(100% - 20px) !important;
    max-width: none !important;
  }
}

/* ② 既存の黒いバー（select-page / current-page）基礎 */
#uploadVersionPopup .select-page-box,
#uploadNewPagePopup .select-page-box{
  width: 100% !important;
  max-width: 1000px !important;
  margin: 0 auto !important;
  position: relative !important; /* dropdown absolute の基準 */
}

/* 黒バー：current-page（表示中の行） */
#uploadVersionPopup .select-page-box .current-page,
#uploadNewPagePopup .select-page-box .current-page{
  max-width: 1000px !important;
  margin: 10px auto 0 !important;
  background: #000 !important;
  padding: 8px !important;
  color: #fff !important;
  font-weight: bold !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.35) !important;
  display: flex !important;
  align-items: center !important;
}

/* dropdown-menu は show 以外は絶対出さない（誤爆対策） */
#uploadVersionPopup .select-page-box .select-page.dropdown-menu:not(.show),
#uploadNewPagePopup .select-page-box .select-page.dropdown-menu:not(.show){
  display: none !important;
}

/* ③ select-type-animation（アップロード種類選択） */
#uploadVersionPopup .select-type-animation,
#uploadNewPagePopup .select-type-animation{
  width: 575px !important;
  margin: 30px auto !important;
  border: 1px solid var(--primary-color) !important;
  border-radius: 12px !important;
  padding: 18px 20px !important;

  box-shadow: 0 2px 8px rgba(0,0,0,0.35) !important;
  background: #fff !important;
}

/* A) select-type-upload：崩れにくい中央固定 + iPad最適化 */
#uploadVersionPopup .select-type-upload,
#uploadNewPagePopup .select-type-upload{
  color: var(--primary-color) !important;
  font-weight: bold !important;
  position: absolute !important;

  left: 50% !important;
  transform: translateX(-50%) !important;

  margin-top: 22px !important;
  background: var(--second-color) !important;

  width: 280px !important;
  text-align: center !important;

  font-size: 1.5em !important;
}
@media (min-width: 769px) and (max-width: 1024px){
  #uploadVersionPopup .select-type-upload,
  #uploadNewPagePopup .select-type-upload{
    width: 360px !important;
  }
}

/* 4つの選択：ブロック全体は中央、文字は左寄せ */
#uploadVersionPopup .create-akaire-box-content,
#uploadNewPagePopup .create-akaire-box-content{
  width: fit-content !important;
  margin: 0 auto !important;
  text-align: left !important;
}

/* 行：見やすく */
#uploadVersionPopup .create-akaire-box-link,
#uploadNewPagePopup .create-akaire-box-link{
  display: flex !important;
  align-items: center !important;
  gap: 14px !important;
  padding: 10px 6px !important;
  font-size: 18px !important;
}
#uploadVersionPopup .create-akaire-box-link img,
#uploadNewPagePopup .create-akaire-box-link img{
  flex: 0 0 auto !important;
}

/* SP：幅を画面に合わせて縮める */
@media (max-width: 768px){
  #uploadVersionPopup .select-type-animation,
  #uploadNewPagePopup .select-type-animation{
    width: calc(100% - 20px) !important;

    /* ✅ 端末差で崩れない：最小16px〜最大33pxの間で自動調整 */
    margin: clamp(16px, 4vh, 33px) auto !important;

    padding: 14px 14px !important;
  }

  #uploadVersionPopup .create-akaire-box-link,
  #uploadNewPagePopup .create-akaire-box-link{
    font-size: 16px !important;
    padding: 10px 4px !important;
    gap: 12px !important;
  }
}

/* B) select-page（黒バー内） */
#uploadVersionPopup .select-page.cursor-pointer.dropdown-menu,
#uploadNewPagePopup .select-page.cursor-pointer.dropdown-menu{
  display: flex !important;
  align-items: center !important;
}
#uploadVersionPopup .select-page.cursor-pointer.dropdown-menu .col-4,
#uploadNewPagePopup .select-page.cursor-pointer.dropdown-menu .col-4{
  flex: 1 1 auto !important;
  min-width: 0 !important;
}
#uploadVersionPopup .select-page.cursor-pointer.dropdown-menu .col-1,
#uploadNewPagePopup .select-page.cursor-pointer.dropdown-menu .col-1{
  flex: 0 0 40px !important;
  width: 40px !important;
  margin-left: 12px !important;
  text-align: center !important;
}
#uploadVersionPopup .select-page.cursor-pointer.dropdown-menu .col-7.count-total-version,
#uploadNewPagePopup .select-page.cursor-pointer.dropdown-menu .col-7.count-total-version{
  flex: 0 0 320px !important;
  text-align: right !important;
  padding-right: 20px !important;
}

/* 黒バー（current-page-box内） */
#uploadVersionPopup .select-page-box .current-page > .col-4,
#uploadNewPagePopup .select-page-box .current-page > .col-4{
  flex: 0 0 62% !important;
  max-width: 62% !important;
  min-width: 0 !important;
}
#uploadVersionPopup .select-page-box .current-page > .col-1,
#uploadNewPagePopup .select-page-box .current-page > .col-1{
  flex: 0 0 40px !important;
  width: 40px !important;
  text-align: center !important;
}
#uploadVersionPopup .select-page-box .current-page > .col-7.count-total-version,
#uploadNewPagePopup .select-page-box .current-page > .col-7.count-total-version{
  flex: 1 1 auto !important;
  min-width: 0 !important;
  text-align: right !important;
  padding-right: 20px !important;
  white-space: nowrap !important;
}
@media (max-width: 768px){
  #uploadVersionPopup .select-page-box .current-page > .col-4,
  #uploadNewPagePopup .select-page-box .current-page > .col-4{
    flex-basis: 52% !important;
    max-width: 52% !important;
  }
  #uploadVersionPopup .select-page-box .current-page > .col-7.count-total-version,
  #uploadNewPagePopup .select-page-box .current-page > .col-7.count-total-version{
    padding-right: 12px !important;
  }
}

/* ④ dropdown（クリック後に出る白い一覧） */
#uploadVersionPopup .select-page-box .select-page.dropdown-menu.show,
#uploadNewPagePopup .select-page-box .select-page.dropdown-menu.show{
  display: flex !important;
  align-items: center !important;

  width: 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;

  transform: none !important;
  position: absolute !important;
  top: calc(100% + 6px) !important;
  left: 0 !important;
  right: 0 !important;

  margin: 0 !important;
  padding: 8px 10px !important;

  background: #fff !important;
  color: #000 !important;
  border: 1px solid rgba(0,0,0,0.15) !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
  z-index: 1060 !important;
}

/* dropdown内：ページ名が見えない対策（pを確実に表示） */
#uploadVersionPopup .select-page-box .select-page.dropdown-menu.show .col-4 p,
#uploadNewPagePopup .select-page-box .select-page.dropdown-menu.show .col-4 p{
  display: block !important;
  margin: 0 !important;
  padding: 6px 4px !important;
  color: #000 !important;
  text-align: left !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* 「行表示」：col-1/col-7 は使わない */
#uploadVersionPopup .select-page-box .select-page.dropdown-menu.show > .col-1,
#uploadNewPagePopup .select-page-box .select-page.dropdown-menu.show > .col-1,
#uploadVersionPopup .select-page-box .select-page.dropdown-menu.show > .col-7,
#uploadNewPagePopup .select-page-box .select-page.dropdown-menu.show > .col-7{
  display: none !important;
}

/* col-4 をフル幅にして行を作る */
#uploadVersionPopup .select-page-box .select-page.dropdown-menu.show > .col-4,
#uploadNewPagePopup .select-page-box .select-page.dropdown-menu.show > .col-4{
  flex: 1 1 auto !important;
  max-width: 100% !important;
  width: 100% !important;
  min-width: 0 !important;
}

/* 1行（JSで作る .akapon-page-row） */
#uploadVersionPopup .select-page-box .select-page.dropdown-menu.show .akapon-page-row,
#uploadNewPagePopup .select-page-box .select-page.dropdown-menu.show .akapon-page-row{
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 10px 6px !important;
  border-bottom: 1px solid rgba(0,0,0,0.12) !important;
}
#uploadVersionPopup .select-page-box .select-page.dropdown-menu.show .akapon-page-row:last-child,
#uploadNewPagePopup .select-page-box .select-page.dropdown-menu.show .akapon-page-row:last-child{
  border-bottom: none !important;
}

/* 左：ページ名 */
#uploadVersionPopup .select-page-box .select-page.dropdown-menu.show .akapon-page-row > p,
#uploadNewPagePopup .select-page-box .select-page.dropdown-menu.show .akapon-page-row > p{
  flex: 1 1 auto !important;
  min-width: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* 右： > Verxx にアップロード(されます) */
#uploadVersionPopup .select-page-box .select-page.dropdown-menu.show .akapon-page-right,
#uploadNewPagePopup .select-page-box .select-page.dropdown-menu.show .akapon-page-right{
  flex: 0 0 auto !important;
  white-space: nowrap !important;
  margin-left: auto !important;
  text-align: right !important;
  padding-right: 20px !important;
  font-weight: 600 !important;
}

@media (max-width: 768px){
  #uploadVersionPopup .select-page-box .select-page.dropdown-menu.show,
  #uploadNewPagePopup .select-page-box .select-page.dropdown-menu.show{
    top: calc(100% + 4px) !important;
    padding: 6px 8px !important;
  }

  #uploadVersionPopup .select-page-box .select-page.dropdown-menu.show .akapon-upload-suffix,
  #uploadNewPagePopup .select-page-box .select-page.dropdown-menu.show .akapon-upload-suffix{
    display: none !important;
  }

  #uploadVersionPopup .select-page-box .select-page.dropdown-menu.show .akapon-page-right,
  #uploadNewPagePopup .select-page-box .select-page.dropdown-menu.show .akapon-page-right{
    padding-right: 12px !important;
  }
}
`;

  function injectCssOnce() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    if (style.textContent !== css) style.textContent = css;
  }

  /* =========================================================
     2) バージョン更新 dropdown を行表示に組み替え（あなたのコード）
     ========================================================= */
  function enhanceDropdown(menu) {
    if (!menu || menu.dataset.akaponEnhanced === '1') return;
    menu.dataset.akaponEnhanced = '1';

    const col4 = menu.querySelector(':scope > .col-4');
    if (!col4) return;

    const ps = Array.from(col4.querySelectorAll(':scope > p'));
    if (!ps.length) return;

    const frag = document.createDocumentFragment();

    ps.forEach((p) => {
      const verRaw = p.getAttribute('data-total-vesion') || '';
      const ver = String(verRaw).trim();

      const row = document.createElement('div');
      row.className = 'akapon-page-row';

      // pはそのまま移動（onclick=... も維持）
      row.appendChild(p);

      const right = document.createElement('div');
      right.className = 'akapon-page-right';
      right.innerHTML = `&gt;&nbsp;Ver ${ver} にアップロード<span class="akapon-upload-suffix">されます。</span>`;
      row.appendChild(right);

      frag.appendChild(row);
    });

    col4.innerHTML = '';
    col4.appendChild(frag);
  }

  function bindEnhancerObserverOnce() {
    if (window.__akaponUploadEnhancerBound) return;
    window.__akaponUploadEnhancerBound = true;

    const observer = new MutationObserver(() => {
      document
        .querySelectorAll(
          '#uploadVersionPopup .select-page-box .select-page.dropdown-menu.show, #uploadNewPagePopup .select-page-box .select-page.dropdown-menu.show'
        )
        .forEach(enhanceDropdown);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    // すでに開いている場合も即適用
    document
      .querySelectorAll(
        '#uploadVersionPopup .select-page-box .select-page.dropdown-menu.show, #uploadNewPagePopup .select-page-box .select-page.dropdown-menu.show'
      )
      .forEach(enhanceDropdown);
  }

  /* =========================================================
     3) SP時だけ文言短縮（あなたのコード）
     ========================================================= */
  function bindShortenOnce() {
    if (window.__akaponShortenUploadTextBound) return;
    window.__akaponShortenUploadTextBound = true;

    const SP_MAX = 768;
    const TICK_MS = 200;

    function isSp() {
      return window.matchMedia(`(max-width:${SP_MAX}px)`).matches;
    }

    function shortenNow() {
      const nodes = document.querySelectorAll(
        '#uploadVersionPopup .select-page-box .current-page .count-total-version, ' +
        '#uploadNewPagePopup .select-page-box .current-page .count-total-version, ' +
        '#uploadVersionPopup .select-page-box .select-page .count-total-version, ' +
        '#uploadNewPagePopup .select-page-box .select-page .count-total-version'
      );

      nodes.forEach((el) => {
        const raw = (el.textContent || '');
        const txt = raw.replace(/\s+/g, ' ').trim();
        if (!txt) return;

        // Ver 04 の 04 も保持
        const m = txt.match(/Ver\s*([0-9]{1,3})/i);
        if (!m) return;

        // 「アップロード」系だけ対象にする（誤爆防止）
        if (!txt.includes('アップロード')) return;

        // 元テキストはSP以外に戻すために保存
        if (!el.dataset.originalText) el.dataset.originalText = txt;

        if (isSp()) {
          const desired = `Ver ${m[1]} にアップロード`;
          if (txt !== desired) el.textContent = desired;
        } else {
          if (el.dataset.originalText && el.textContent !== el.dataset.originalText) {
            el.textContent = el.dataset.originalText;
          }
        }
      });
    }

    // ✅ ポップアップが存在する間だけ定期実行（確実＆軽量）
    let timer = null;

    function startTick() {
      if (timer) return;
      timer = setInterval(() => {
        // popupが無いなら止める
        const hasPopup =
          document.querySelector('#uploadVersionPopup') ||
          document.querySelector('#uploadNewPagePopup');
        if (!hasPopup) {
          clearInterval(timer);
          timer = null;
          return;
        }
        shortenNow();
      }, TICK_MS);
    }

    // 初回
    shortenNow();
    startTick();

    // popup出現も拾う（出たらtick開始＆即短縮）
    const mo = new MutationObserver(() => {
      const hasPopup =
        document.querySelector('#uploadVersionPopup') ||
        document.querySelector('#uploadNewPagePopup');
      if (hasPopup) {
        shortenNow();
        startTick();
      }
    });

    mo.observe(document.body, { childList: true, subtree: true });

    // リサイズでも即反映
    window.addEventListener('resize', shortenNow);
  }

  /* =========================================================
     4) 「アップロードデータを保存しました」を3秒で閉じる
     （既存実装を壊さず、表示されたら自動で閉じる）
     ========================================================= */
  function bindAutoCloseSaveModalOnce() {
    if (window.__akaponSaveAutoCloseBound) return;
    window.__akaponSaveAutoCloseBound = true;

    const closeIfNeeded = (root) => {
      const el = root || document;

      // SweetAlert2想定
      const swalPopup = el.querySelector('.swal2-popup');
      if (swalPopup) {
        const text = (swalPopup.textContent || '').trim();
        if (text.includes(SAVE_MODAL_TEXT) && !swalPopup.dataset.akaponAutoCloseSet) {
          swalPopup.dataset.akaponAutoCloseSet = '1';
          setTimeout(() => {
            // Swal が居る場合はそれで閉じる（なければDOM操作）
            try {
              if (window.Swal && typeof window.Swal.close === 'function') {
                window.Swal.close();
              } else {
                const container = document.querySelector('.swal2-container');
                if (container) container.style.display = 'none';
              }
            } catch (_) {}
          }, SAVE_AUTO_CLOSE_MS);
        }
      }

      // Bootstrap modal想定（文言が含まれるmodalがあれば閉じる）
      const modal = el.querySelector('.modal.show');
      if (modal) {
        const text = (modal.textContent || '').trim();
        if (text.includes(SAVE_MODAL_TEXT) && !modal.dataset.akaponAutoCloseSet) {
          modal.dataset.akaponAutoCloseSet = '1';
          setTimeout(() => {
            try {
              if (window.jQuery && typeof window.jQuery === 'function') {
                window.jQuery(modal).modal('hide');
              } else {
                modal.classList.remove('show');
                modal.style.display = 'none';
              }
            } catch (_) {}
          }, SAVE_AUTO_CLOSE_MS);
        }
      }
    };

    const mo = new MutationObserver(() => closeIfNeeded(document));
    mo.observe(document.body, { childList: true, subtree: true });
    closeIfNeeded(document);
  }

  /* =========================================================
     5) openPopupShareUrl（あなたの関数）
     既に存在する場合は上書きしない
     ========================================================= */
  function defineOpenPopupShareUrlIfMissing() {
    if (typeof window.openPopupShareUrl === 'function') return;

    window.openPopupShareUrl = function openPopupShareUrl() {
      var is_plan_free_or_light = false;
      var plan_name = 'Enterprise';
      if (is_plan_free_or_light) {
        if (window.Popup && typeof window.Popup.confirm === 'function') {
            Popup.confirm(
                'チームアカウントがStandardプラン以上をご契約の場合にご利用いただけます。<br>' +
                '現在のアカウントは「' + plan_name + 'プラン」プランのため、本機能はご利用いただけません。',
            {
              success: () => {
                if (window.Subscription && typeof window.Subscription.openPlanHeaderModal === 'function') {
                  Subscription.openPlanHeaderModal();
                }
              },
              cancel: () => {},
              confirmText: 'プランを変更する',
              width: 'auto',
            }
          );
        }
      } else {
        try {
          if (window.jQuery && typeof window.jQuery === 'function') {
            window.jQuery('.btn-share-url button').click();
          } else {
            const btn = document.querySelector('.btn-share-url button');
            if (btn) btn.click();
          }
        } catch (_) {}
      }
    };
  }

  /* =========================================================
     init
     ========================================================= */
  injectCssOnce();
  bindEnhancerObserverOnce();
  bindShortenOnce();
  bindAutoCloseSaveModalOnce();
  defineOpenPopupShareUrlIfMissing();

  // SPA対策：URL変化でCSSだけ再注入（軽量）
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      injectCssOnce();
    }
  }, 500);

  console.log('[akapon] upload modals script loaded:', location.href);
})();
