// ==UserScript==
// @name         アカポン（ファイル｜サムネイル）※akapon-file-thumbnail_css.user.js
// @namespace    akapon
// @version      20260222 1200
// @match        https://member.createcloud.jp/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-file-thumbnail_css.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-file-thumbnail_css.user.js
// ==/UserScript==

(() => {
  'use strict';

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

/* =========================================================
   TM: file menu modal（#modalMenu-****）
   ❶ タイトルを追尾固定 + スクロール時のみシャドー
   ❷ メニューを 1行2列（同サイズ）
   ❸ 1行目（保存先変更）もシャドー
   ❹ 「アクティビティ」下の線（hr）を消す
   ========================================================= */

html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body{
  padding: 0 !important; /* p-0を前提に固定 */
}

/* ---- タイトル（sticky） ---- */
html body [id^="modalMenu-"].modal .modal-content.text-center h5.modal-title.title-modal-file-menu{
  border-bottom: none !important;
  border-bottom-width: 0 !important;
  border-bottom-style: none !important;

  position: sticky !important;
  top: 0 !important;
  z-index: 5 !important;

  background: #ffffff !important;
  margin: 0 !important;
  padding: 18px 16px !important;
}

/* スクロールしたら付くシャドー（JSでクラス付与） */
html body [id^="modalMenu-"].modal .modal-content.text-center .akapon-menu-header-scrolled{
  box-shadow: 0 10px 24px rgba(0,0,0,0.22) !important;
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

  /* ❸ 1行目も含め全てシャドー */
  box-shadow:
    0 10px 24px rgba(0,0,0,0.45),
    0 0 0 1px rgba(255,255,255,0.06) !important;

  transition: transform .12s ease, box-shadow .12s ease !important;

  /* ❷ 高さ統一 */
  min-height: 62px !important;
  display: flex !important;
  align-items: center !important;
}

/* SPは1列に落とす（崩れ防止） + 余白詰め */
@media (max-width: 480px){
  html body [id^="modalMenu-"].modal .modal-content.text-center h5.modal-title.title-modal-file-menu{
    padding: 16px 12px !important;
  }

  html body [id^="modalMenu-"].modal .modal-content.text-center .modal-body > .text-left{
    width: calc(100% - 24px) !important;
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
}

/* TM: file menu modal / 保存先変更行：プロジェクト名(span)を確実に非表示（点残り対策） */
html body [id^="modalMenu-"].modal .modal-content.text-center
.modal-body > .text-left .change-akaire-file-position{
  display: none !important; /* spanではなく親ごと消して残骸を無くす */
}

/* TM: file menu modal / 遷移アイコンを PCでも表示 + サイズを 18px auto */
html body [id^="modalMenu-"].modal .modal-content.text-center
.modal-body > .text-left > div.dropdown-item.d-flex.cursor-pointer .d-xx-none.ml-1{
  display: inline-flex !important;   /* d-xx-none を無効化して表示 */
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

/* TM: file menu modal / SP専用の遷移アイコン(.d-xx-none)を PCでも表示する */
html body [id^="modalMenu-"].modal .modal-content.text-center
.modal-body > .text-left > div.dropdown-item.d-flex.cursor-pointer .d-xx-none.ml-1{
  display: inline-flex !important;   /* d-xx-none を無効化して表示 */
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
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

/* =========================================================
   TM: 「ファイルの保存先を変更」行は “行全体” を無効化
   - 右端アイコン（onclick付き）だけクリック可能にする
   ========================================================= */

/* 行自体：押せない見た目（hover/active も抑える） */
html body [id^="modalMenu-"].modal .modal-content.text-center
.modal-body > .text-left > div.dropdown-item.change-name-akaire-file{
  cursor: default !important;
  user-select: none !important;
}

/* テキスト側はクリック不要（タップハイライト等も抑えたい場合の保険） */
html body [id^="modalMenu-"].modal .modal-content.text-center
.modal-body > .text-left > div.dropdown-item.change-name-akaire-file
span.text-show-akaire-file-position{
  cursor: default !important;
}

/* 右端アイコン（onclick付き）だけはクリック可能 */
html body [id^="modalMenu-"].modal .modal-content.text-center
.modal-body > .text-left > div.dropdown-item.change-name-akaire-file
.d-xx-none.ml-1[onclick*="AkaireFile.selectProjectForChange"]{
  cursor: pointer !important;
}

/* =========================================================
   TM: 「ファイルの保存先を変更」行
   - 親に cursor-pointer が付いていて “押せそう” に見えるのを抑止
   - ただし右側（プロジェクト名 span[onclick]）はクリック可能のまま
   ========================================================= */

/* 親rowは default（押せない見た目） */
html body [id^="modalMenu-"].modal .modal-content.text-center
.modal-body > .text-left > div.dropdown-item.d-flex.cursor-pointer:has(.change-name-akaire-file .text-show-akaire-file-position){
  cursor: default !important;
}

/* 左側ブロック（アイコン＋文言）も default */
html body [id^="modalMenu-"].modal .modal-content.text-center
.modal-body > .text-left .change-name-akaire-file{
  cursor: default !important;
  user-select: none !important;
}

/* 右側のプロジェクト名（onclick付き）は pointer のまま */
html body [id^="modalMenu-"].modal .modal-content.text-center
.modal-body > .text-left .change-akaire-file-position .text-show-name[onclick*="AkaireFile.selectProjectForChange"]{
  cursor: pointer !important;
}

/* =========================================================
   TM: modalMenu-**** 内だけ .ml-1 の margin-left を拡大
   - サイト全体の .ml-1 は絶対に変更しない
   ========================================================= */
html body [id^="modalMenu-"].modal .modal-content.text-center .ml-1{
  margin-left: 1.25rem !important;
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

  let isMenuModalHooked = false;

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

  function hookFileMenuModalScrollShadowOnce() {
    if (isMenuModalHooked) return;
    isMenuModalHooked = true;

    document.addEventListener('shown.bs.modal', (e) => {
      const modal = e.target;
      if (!modal) return;

      if (modal.id && modal.id.startsWith('modalMenu-')) {
        const header = modal.querySelector('h5.modal-title.title-modal-file-menu');
        const body = modal.querySelector('.modal-body');
        if (!header || !body) return;

        const onScroll = () => {
          if (body.scrollTop > 4) {
            header.classList.add('akapon-menu-header-scrolled');
          } else {
            header.classList.remove('akapon-menu-header-scrolled');
          }
        };

        onScroll();

        if (!body.dataset.akaponMenuScrollBound) {
          body.dataset.akaponMenuScrollBound = '1';
          body.addEventListener('scroll', onScroll, { passive: true });
        }

        // =========================================================
        // TM: 保存先変更行 “全体” をクリック可能にする（安定版）
        // - shown.bs.modal 依存をやめ、常時1回だけ document capture で代理
        // - 「ファイルの保存先を変更」行だけ対象（誤爆防止）
        // - arrow.click() が効かない環境用に onclick 文字列実行もフォールバック
        // =========================================================
        if (!document.body.dataset.akaponSaveDestDelegate) {
          document.body.dataset.akaponSaveDestDelegate = '1';

          document.addEventListener('click', (ev) => {
            const t = ev.target;
            if (!t || !t.closest) return;

            // modalMenu-**** 内だけ対象
            const menuModal = t.closest('[id^="modalMenu-"].modal');
            if (!menuModal) return;

            // 対象行（保存先変更の行も含む dropdown-item）
            const row = t.closest('div.dropdown-item');
            if (!row) return;

            // 「ファイルの保存先を変更」行だけ
            const label = row.querySelector('.text-show-akaire-file-position');
            const labelText = (label ? label.textContent : '').replace(/\s+/g, '');
            if (labelText !== 'ファイルの保存先を変更') return;

            // 行内の onclick から projectId を取得（矢印 or プロジェクト名）
            const onclickHolder =
              row.querySelector('[onclick*="AkaireFile.selectProjectForChange"]') ||
              null;
            if (!onclickHolder) return;

            const onclickStr = onclickHolder.getAttribute('onclick') || '';
            const m = onclickStr.match(/selectProjectForChange\s*\(\s*[^,]+,\s*['"](\d+)['"]\s*\)/);
            const projectId = m ? m[1] : null;
            if (!projectId) return; // 推測で実行しない

            // ✅ 行内どこを押しても “保存先変更” を実行（既存のonclickと同じ関数）
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

            // フォールバック：onclick文字列実行（元コメント方針どおり）
            try {
              // onclickStr は既存DOM由来なのでここではそのまま実行
              // eslint-disable-next-line no-new-func
              (new Function(onclickStr)).call(onclickHolder);
            } catch (_) {}
          }, true); // capture

        }
      }
    });
  }

  function init() {
    if (!shouldApply()) return;

    // ✅ 先にCSSを即時注入（チラつき防止）
    injectStyle(buildCss());

    // 以降のJSフックはDOM準備後でOK
    hookSwalCopyModalAutoCloseOnce();
    hookFileMenuModalScrollShadowOnce();
  }

  // setTimeout(500) をやめて即時起動（チラつき防止）
  init();
})();
