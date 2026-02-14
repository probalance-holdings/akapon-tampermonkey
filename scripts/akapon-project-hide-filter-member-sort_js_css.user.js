// ==UserScript==
// @name         アカポン（プロジェクト｜検索modal内のメンバー検索＋10件/ページ＋右下ページネーション)※akapon-project-hide-number-buttons_html.user.js
// @namespace    akapon
// @version      1.0
// @match        https://member.createcloud.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-filter-member-sort_js_css.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-filter-member-sort_js_css.user.js
// ==/UserScript==

(() => {
  // =========================================================
  // メンバー（created-by-filter）：検索バー + 10件/ページ + ページネーション（右下）
  // =========================================================
  const MEMBER_MODAL_SEL = '.filter-content.dropdown-new-stype.created-by-filter';
  const SEARCH_WRAP_CLASS = 'tm-member-search-wrap';
  const PAGINATION_CLASS = 'tm-member-pagination';
  const INPUT_ID = 'tm_member_search_input';
  const PER_PAGE = 10;

  const STYLE_ID = 'tm_member_modal_pager_css';

  const css = `
/* =========================================================
   メンバー検索バー：親と同じ見た目
   ========================================================= */
.filter-content.dropdown-new-stype.created-by-filter .search-input{
  gap: 8px !important;
  margin-bottom: 10px !important;
}
.filter-content.dropdown-new-stype.created-by-filter .search-input .form-control{
  border-radius: 10px !important;
}
.filter-content.dropdown-new-stype.created-by-filter .btn-submit-search{
  border-radius: 10px !important;
  border: 1px solid #000 !important;
  background: #000 !important;
  box-shadow: none !important;
}
.filter-content.dropdown-new-stype.created-by-filter .btn-submit-search img{
  filter: brightness(0) invert(1) !important;
}

/* =========================================================
   メンバー：ページネーション（右下：青枠□ / 中は白数字）
   ========================================================= */
.filter-content.dropdown-new-stype.created-by-filter .dropdown-body{
  position: relative !important;
  padding-bottom: 15px !important; /* ページャ分の余白 */
}

.filter-content.dropdown-new-stype.created-by-filter .tm-member-pagination{
  position: sticky !important;
  bottom: 10px !important;
  display: flex !important;
  justify-content: flex-end !important;
  gap: 8px !important;
  margin-top: 10px !important;
  z-index: 2 !important;
}

.filter-content.dropdown-new-stype.created-by-filter .tm-member-pagination .tm-page-btn{
  width: 34px !important;
  height: 34px !important;
  border-radius: 8px !important;

  border: 2px solid #1e3c72 !important;
  background: #fff !important;
  color: #1e3c72 !important;

  font-weight: 800 !important;
  line-height: 1 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  box-shadow: none !important;
}

.filter-content.dropdown-new-stype.created-by-filter .tm-member-pagination .tm-page-btn.is-active{
  background: #1e3c72 !important;
  color: #fff !important;
}

/* =========================================================
   メンバー：名前と名前の間に薄い区切り線（間隔は広げない）
   ========================================================= */

/* 「すべて」以外の各メンバー行：余白は控えめ */
.filter-content.dropdown-new-stype.created-by-filter .dropdown-body .option{
  padding: 8px 14px !important;
  margin: 0 !important;
}

/* 「すべて」以外のメンバー行同士の間に線（最初のメンバー行には線なし） */
.filter-content.dropdown-new-stype.created-by-filter .dropdown-body .option:not(.option-all) + .option:not(.option-all){
  border-top: 1px dashed rgba(0,0,0,.18) !important;
}

/* 「すべて」行の下にも1本だけ線 */
.filter-content.dropdown-new-stype.created-by-filter .dropdown-body .option.option-all{
  border-bottom: 1px dashed rgba(0,0,0,.18) !important;
}
`;

  function injectCssOnce() {
    let s = document.getElementById(STYLE_ID);
    if (!s) {
      s = document.createElement('style');
      s.id = STYLE_ID;
      document.head.appendChild(s);
    }
    if (s.textContent !== css) s.textContent = css;
  }

  function getBody(modal) {
    return modal ? modal.querySelector('.dropdown-body') : null;
  }

  function getMemberOptions(body) {
    // 「すべて」以外の .option をメンバーとして扱う
    return Array.from(body.querySelectorAll('.option'))
      .filter(el => !el.classList.contains('option-all'));
  }

  function ensureMemberSearchBar(modal) {
    if (!modal) return;
    const body = getBody(modal);
    if (!body) return;

    if (!modal.querySelector(`.${SEARCH_WRAP_CLASS}`)) {
      const allOption = body.querySelector('.option.option-all') || body.firstElementChild;

      const wrap = document.createElement('div');
      wrap.className = `${SEARCH_WRAP_CLASS} d-flex search-input`;
      wrap.style.marginBottom = '8px';

      wrap.innerHTML = `
        <input class="form-control" id="${INPUT_ID}" type="text" placeholder="メンバーを検索">
        <button type="button" class="btn btn-submit-search">
          <img class="filter-black-icon" src="/assets/icon_search-dc4b4bb110950626b9fbef83df922bf22352c79180c14d501b361a4d3596c77e.png" width="16" height="16">
        </button>
      `;

      if (allOption) body.insertBefore(wrap, allOption);
      else body.prepend(wrap);
    }
  }

  function ensurePagination(modal) {
    const body = getBody(modal);
    if (!body) return null;

    let pager = body.querySelector(`.${PAGINATION_CLASS}`);
    if (!pager) {
      pager = document.createElement('div');
      pager.className = PAGINATION_CLASS;
      body.appendChild(pager);
    }
    return pager;
  }

  function renderPage(modal, page, queryText) {
    const body = getBody(modal);
    if (!body) return;

    const q = (queryText || '').trim().toLowerCase();
    const allOption = body.querySelector('.option.option-all');

    // 「すべて」は常に表示
    if (allOption) allOption.style.display = '';

    const allMembers = getMemberOptions(body);

    // 検索で絞り込んだ候補
    const matched = allMembers.filter(opt => {
      const text = (opt.textContent || '').trim().toLowerCase();
      return (!q || text.includes(q));
    });

    const totalPages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
    const current = Math.min(Math.max(1, page), totalPages);
    const start = (current - 1) * PER_PAGE;
    const end = start + PER_PAGE;

    const visibleSet = new Set(matched.slice(start, end));

    // 表示制御
    allMembers.forEach(opt => {
      opt.style.display = visibleSet.has(opt) ? '' : 'none';
    });

    // ページネーション描画
    const pager = ensurePagination(modal);
    if (!pager) return;

    pager.innerHTML = '';
    pager.dataset.page = String(current);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tm-page-btn' + (i === current ? ' is-active' : '');
      btn.textContent = String(i);

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const input = modal.querySelector(`#${INPUT_ID}`);
        renderPage(modal, i, (input?.value || ''));
      });

      pager.appendChild(btn);
    }
  }

  function setup(modal) {
    if (!modal) return;
    const body = getBody(modal);
    if (!body) return;

    ensureMemberSearchBar(modal);
    ensurePagination(modal);

    const input = modal.querySelector(`#${INPUT_ID}`);
    const btn = modal.querySelector(`.${SEARCH_WRAP_CLASS} button`);

    const apply = () => renderPage(modal, 1, (input?.value || ''));

    if (input && !input.dataset.tmBound) {
      input.dataset.tmBound = '1';
      input.addEventListener('input', apply);
    }
    if (btn && !btn.dataset.tmBound) {
      btn.dataset.tmBound = '1';
      btn.addEventListener('click', apply);
    }

    renderPage(modal, 1, (input?.value || ''));
  }

  // 初回CSS
  injectCssOnce();

  // モーダルが開いた時だけセットアップ（軽量）
  document.addEventListener('click', () => {
    const modal = document.querySelector(MEMBER_MODAL_SEL);
    if (modal && !modal.classList.contains('d-none')) {
      setup(modal);
    }
  }, true);

  // URL変化時の再注入（SPA対策：CSSだけ）
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      injectCssOnce();
    }
  }, 500);

  console.log('[TM] member modal search+paging loaded:', location.href);
})();
