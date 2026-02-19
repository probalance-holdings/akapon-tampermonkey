// ==UserScript==
// @name         15｜アカポン（ファイル｜その他）※akapon-file-another_css.user.js
// @namespace    akapon
// @version      0.0.8
// @description  thumbnail extra css (load-more button fix + header shadow on scroll)
// @author       akapon
// @match        https://member.createcloud.jp/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-file-another_css.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-file-another_css.user.js
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  /* =========================================================
     【サムネイル hover 表示｜エンジニア向けメモ】

     ■ 目的
     サムネイル表示時に出る既存 hover 文言（例：「ファイル内トークができます」等）と、
     Tampermonkey側で追加した hover tooltip が重複して見づらくなるため、
     “既存hoverの発生元（JS/CSS）” を特定して、見た目統一 or 抑止判断をしたい。

     ■ 現状（調査結果）
     - 「ファイル内トークができます」は疑似要素（::before/::after）ではなく、
       DOMテキストとして存在している（= JSで要素が生成/差し込まれている可能性が高い）。
       例：
         div.akaire-thumb-chat-label-zoom-<file_id>（例：akaire-thumb-chat-label-zoom-44266）
         内部に span（class無し）でも同文言が存在
     - その文言の表示/非表示のトリガー（hover時に表示される条件）と
       スタイル定義（CSS）をまだ特定できていない。

     ■ エンジニア側の調査ポイント
     1) サムネイル表示時の hover 文言を生成している JS の特定
        - イベントバインド元（mouseenter/mouseover 等）
        - innerHTML/insertAdjacentHTML/appendChild 等の生成箇所
     2) 表示時に付与される class / style の特定
        - “表示中だけ付くクラス” があれば、共通tooltipデザインへ寄せやすい
     3) accept-notify（ベル）など、他hover表示も同系統で出ている可能性があるため
        hover時にDOM増減するノードの監視（MutationObserver）で発生元を追うのが早い

　　 ■ 要件（今回の追加）
     - サムネイル表示時のみ、accept-notify（.accept-notify.cursor-pointer）に対して
       Tampermonkey側で追加した hover tooltipだけを非表示にしたい。
       ※既存のサイト側hover表示（案内文言等）は対象外／干渉しない前提。

　　 ■ 要件（今回の追加）
     - サムネイル表示時のみ、class="style-point status_green_point thumb_akaire_file_status_point dropdown-toggle status_text_description"に対して
       Tampermonkey側で追加した hover tooltipを表示にしたい。（表形式では表示済み）

     ■ 参考：対象DOM（例）
     <div class="akaire-thumb-chat-wrapper w-100 d-flex justify-content-center">
       <img ...>
     </div>
   ========================================================= */

  function shouldApply() {
    const path = location.pathname || '';
    if (path.startsWith('/akaire_file/')) return true;
    if (path.startsWith('/akaire_feature/akaire_files/')) return true;
    return false;
  }

  function injectCss() {
    const styleId = 'tm-akapon-file-thumbnail-another-css';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.type = 'text/css';

style.textContent = `

/* =========================================================
   TM: サムネイル一覧「もっと見る」ボタン（CSS競合対策）
   ========================================================= */
.load-more-thumbnail a.btn.bg-akapon,
.load-more-thumbnail a.btn.bg-akapon:hover,
.load-more-thumbnail a.btn.bg-akapon:focus,
.load-more-thumbnail a.btn.bg-akapon:active,
.load-more-thumbnail a.btn.bg-akapon:visited {
  background-color: #111 !important;
  border-color: #111 !important;
  color: #fff !important;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35) !important;
  border-radius: 10px !important;
  text-decoration: none !important;
}
.load-more-thumbnail a.btn.bg-akapon:hover {
  background-color: #000 !important;
  border-color: #000 !important;
}

/* load-moreが途中に挟まるのを防ぐ */
#thumbnail-list .load-more-thumbnail{
  width: 100% !important;
  flex: 0 0 100% !important;
}

/* =========================================================
   TM: 上部ボタン（並び順/検索・絞り込み/CSV）の間隔を広げる
   - ここは table.search-list の td 配置なので gap では増えない
   - td の padding で確実に間隔を作る
   ========================================================= */
html body table.search-list > tbody > tr > td.td-sort-box,
html body table.search-list > tbody > tr > td.td-filter-box{
  padding-right: 9px !important; /* ← 好みで 12〜28 で調整 */
}

/* CSV側が td の場合もまとめて効かせる（クラス不明でも最後のtdに効く保険） */
html body table.search-list > tbody > tr > td:last-child{
  padding-left: 9px !important;
}

/* ついでにボタン自身の mr-1 で詰まるのを避ける（この行だけ） */
html body table.search-list > tbody > tr > td.td-sort-box > .border-new.mr-1,
html body table.search-list > tbody > tr > td.td-filter-box > .border-new.mr-1{
  margin-right: 0 !important;
}

/* =========================================================
   TM: ヘッダーにスクロール時だけシャドー
   ========================================================= */
.tm-akapon-header-shadow-on{
  box-shadow: 0 10px 24px rgba(0,0,0,0.18) !important;
}
`.trim();

    (document.head || document.documentElement).appendChild(style);
  }

  // =========================================================
  // load-more 常に末尾へ
  // =========================================================
  function moveLoadMoreToBottom() {
    const list = document.querySelector('#thumbnail-list');
    if (!list) return;

    const loadMore = list.querySelector(':scope > .load-more-thumbnail');
    if (!loadMore) return;

    if (list.lastElementChild === loadMore) return;
    list.appendChild(loadMore);
  }

  function bindLoadMoreFix() {
    const startObserver = () => {
      const list = document.querySelector('#thumbnail-list');
      if (!list) return false;

      if (list.dataset.tmLoadMoreObserver === '1') return true;
      list.dataset.tmLoadMoreObserver = '1';

      const mo = new MutationObserver(() => {
        moveLoadMoreToBottom();
      });
      mo.observe(list, { childList: true });

      moveLoadMoreToBottom();
      return true;
    };

    const tick = () => {
      if (startObserver()) return;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    document.addEventListener(
      'click',
      (ev) => {
        const a = ev.target && ev.target.closest
          ? ev.target.closest('.load-more-thumbnail a[data-remote="true"]')
          : null;
        if (!a) return;

        setTimeout(() => {
          moveLoadMoreToBottom();
        }, 0);
      },
      true
    );
  }

  // =========================================================
  // ヘッダーシャドー
  // =========================================================
  function findHeaderEl() {
    return (
      document.querySelector('nav.navbar_outer') ||
      document.querySelector('nav.navbar-common') ||
      document.querySelector('nav.navbar') ||
      document.querySelector('header') ||
      null
    );
  }

  function bindHeaderShadow() {
    const header = findHeaderEl();
    if (!header) return false;

    if (header.dataset.tmAkaponHeaderShadowBound === '1') return true;
    header.dataset.tmAkaponHeaderShadowBound = '1';

    const onScroll = () => {
      const scrolled = (window.scrollY || document.documentElement.scrollTop || 0) > 4;
      header.classList.toggle('tm-akapon-header-shadow-on', scrolled);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return true;
  }

  function initHeaderShadowWatcher() {
    let done = false;

    const tick = () => {
      if (!document.body) {
        requestAnimationFrame(tick);
        return;
      }

      if (!done) {
        done = bindHeaderShadow();
      }

      if (!done) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }

  // =========================================================
  // 「＋」ボタンの右に区切り td を追加
  // =========================================================
  function insertSeparatorTdNextToPlusButton() {
    const PLUS_BTN_SEL =
      'a.btn.btn-create.plus.plus-icon.p-0.mw-40px.mr-1[href^="/akaire_feature/akaires?from_project_id="]';

    const btn = document.querySelector(PLUS_BTN_SEL);
    if (!btn) return false;

    // すでに + の直後に border-line があるなら何もしない
    const nextEl = btn.nextElementSibling;
    if (nextEl && nextEl.classList && nextEl.classList.contains('border-line')) return true;

    // 二重挿入防止（+自体にフラグ）
    if (btn.dataset.tmSeparatorAdded === '1') return true;

    // DOMに合わせて div を挿入（検証で入れた形と同じ）
    const divider = document.createElement('div');
    divider.className = 'border-line w-0 mx-2';

    btn.insertAdjacentElement('afterend', divider);
    btn.dataset.tmSeparatorAdded = '1';

    return true;
  }

  function initPlusSeparatorWatcher() {
    let done = false;

    const tick = () => {
      if (!document.body) {
        requestAnimationFrame(tick);
        return;
      }

      if (!done) {
        done = insertSeparatorTdNextToPlusButton();
      }

      if (!done) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);

    // SPA/部分描画対策：後から差し込まれる場合にも追従
    const mo = new MutationObserver(() => {
      insertSeparatorTdNextToPlusButton();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  // =========================================================
  // Hover tooltip（ファイルページ：ステータス変更 / ファイル名変更 / メニュー）
  // =========================================================
  function bindFileHoverTooltips() {
    if (window.__tmFileHoverTipBound) return;
    window.__tmFileHoverTipBound = true;

    const TIP_ID = 'tm-file-hover-tip';
    const STYLE_ID_TIP = 'tm-file-hover-tip-css';

    // CSSは1回だけ
    if (!document.getElementById(STYLE_ID_TIP)) {
      const st = document.createElement('style');
      st.id = STYLE_ID_TIP;
      st.textContent = `
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
  box-shadow: 0 10px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08);
  pointer-events: none;
  white-space: nowrap;
}
`;
      document.head.appendChild(st);
    }

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
    }

    function hideTip() {
      const tip = document.getElementById(TIP_ID);
      if (!tip) return;
      tip.style.display = 'none';
    }

    // 対象要素の “同一判定” 用（mouseout で内側移動を誤判定しない）
    function closestTargets(node) {
      if (!node || typeof node.closest !== 'function') {
        return { statusEl: null, editEl: null, menuEl: null };
      }
      const statusEl = node.closest('span.akaire_file_status_point.status_text_description');
      const editEl = node.closest('img.edit-akaire-file-name-img.description_icon');
      const menuEl = node.closest('img.filter-black-icon.three-dot');
      return { statusEl, editEl, menuEl };
    }

    // mouseover：表示
    document.addEventListener('mouseover', (e) => {
      const t = e.target;
      if (!t || typeof t.closest !== 'function') return;

      // ① ステータス変更（●）
      const statusEl = t.closest('span.akaire_file_status_point.status_text_description');
      if (statusEl) {
        showTipUnder(statusEl, 'ステータス変更');
        return;
      }

      // ② ファイル名変更（鉛筆アイコン：img）
      const editImg = t.closest('img.edit-akaire-file-name-img.description_icon');
      if (editImg) {
        showTipUnder(editImg, 'ファイル名変更');
        return;
      }

      // ③ メニュー（三本線：img）
      const menuImg = t.closest('img.filter-black-icon.three-dot');
      if (menuImg) {
        showTipUnder(menuImg, 'メニュー');
        return;
      }
    }, true);

    // mouseout：対象から出たら消す（relatedTarget が同一ターゲット内なら消さない）
    document.addEventListener('mouseout', (e) => {
      const from = e.target;
      const to = e.relatedTarget;

      const { statusEl: fromStatus, editEl: fromEdit, menuEl: fromMenu } = closestTargets(from);
      if (!fromStatus && !fromEdit && !fromMenu) return;

      if (to && typeof to.closest === 'function') {
        if (fromStatus && to.closest('span.akaire_file_status_point.status_text_description') === fromStatus) return;
        if (fromEdit && to.closest('img.edit-akaire-file-name-img.description_icon') === fromEdit) return;
        if (fromMenu && to.closest('img.filter-black-icon.three-dot') === fromMenu) return;
      }

      hideTip();
    }, true);

    // 万一の保険：画面外へ出たら消す
    window.addEventListener('scroll', hideTip, { passive: true });
  }

  // ---- start ----
  if (!shouldApply()) return;

  injectCss();
  bindLoadMoreFix();
  initHeaderShadowWatcher();
  initPlusSeparatorWatcher();
  bindFileHoverTooltips();

})();
