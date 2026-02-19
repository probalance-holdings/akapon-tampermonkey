// ==UserScript==
// @name         1｜アカポン（プロジェクト｜並び順）※akapon-project-hide-Sort-buttons_css.user.js
// @namespace    akapon
// @version      1.3
// @match        https://member.createcloud.jp/*
// @match        https://akapon.jp/*
// @match        https://akapon.jp/ai/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-Sort-buttons_css.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-project-hide-Sort-buttons_css.user.js
// ==/UserScript==

(() => {
  const STYLE_ID = 'search_modal_sort_all_css';

  const css = `
/* =========================
  PC: 並び順ボタン（td-sort-box内）
========================= */
td.td-sort-box .border-new.sort{
  background: #1f1f1f !important;
  color: #fff !important;
  border-radius: 12px !important;
  box-shadow: 0 6px 18px rgba(0,0,0,.25) !important;
  border: 1px solid #1f1f1f !important;
  padding: 8px 12px !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 0px !important;
}
td.td-sort-box .border-new.sort:hover{
  background: #3f3f3f !important;
  border-color: #3f3f3f !important;
}

/* テキスト中央寄せ */
td.td-sort-box .border-new.sort .sort-text-display{
  color: #fff !important;
  font-weight: 700 !important;
  display: block !important;
  width: 100% !important;
  text-align: center !important;
  margin: 0 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* 右の chevron は非表示 */
td.td-sort-box .border-new.sort > div img{
  display: none !important;
}

/* =========================
  PC: sortBox（中央モーダル化）
========================= */
#sortBox.sort_box{
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;

  width: 86% !important;
  max-width: 420px !important;

  background: #fff !important;
  border-radius: 14px !important;
  overflow: hidden !important;
  box-shadow: 0 16px 38px rgba(0, 0, 0, .28) !important;

  z-index: 999999 !important;
  margin: 0 !important;
  border: none !important;

  bottom: auto !important;
  right: auto !important;
}
#sortBox.sort_box:not(.d-none){
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

#sortBox.sort_box .sort_box_title{
  padding: 12px 14px !important;
  background: linear-gradient(90deg, #1e3c72, #555) !important;
  color: #fff !important;
  font-weight: 700 !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  border: none !important;
}
#sortBox.sort_box .sort_box_title *{ color:#fff !important; }

#sortBox.sort_box .sort_box_text{
  padding: 10px 12px 10px !important;
  background: #fff !important;
  max-height: 70vh !important;
  overflow: auto !important;
}

/* 「・」を消す */
#sortBox.sort_box ul,
#sortBox.sort_box li{
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
#sortBox.sort_box li::marker,
#sortBox.sort_box li::before{
  content: none !important;
}

/* 行の区切り */
#sortBox.sort_box .li-sort-item{
  border-bottom: 1px solid #eee !important;
  padding: 10px 0 !important;
}
#sortBox.sort_box .li-sort-item:last-child{
  border-bottom: none !important;
}

/* 親ラベル（＋/－を隠す） */
#sortBox.sort_box .sort_item{
  font-weight: 700 !important;
  color: #222 !important;
  white-space: nowrap !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;

  text-indent: -0.9em !important;
  padding-left: 3.2em !important;
  font-size: 0.9em !important;
}

/* 親の右側に 子（昇順/降順）を横並び */
#sortBox.sort_box .li-sort-item > ul{
  display: inline-flex !important;
  align-items: center !important;
  gap: 10px !important;
  margin-left: 10px !important;
}
#sortBox.sort_box .li-sort-item > ul > li.sort-option{
  display: inline-flex !important;
}

/* 子ボタン */
#sortBox.sort_box .li-sort-item > ul > li.sort-option a{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 6px 10px !important;
  line-height: 1.2 !important;
  font-size: 14px !important;
  border-radius: 10px !important;
  border: 1px solid #ddd !important;
  background: #f7f7f7 !important;
  color: #222 !important;
  font-weight: 700 !important;
  text-decoration: none !important;
  white-space: nowrap !important;
  transition: background-color .15s ease, border-color .15s ease, color .15s ease !important;
}
#sortBox.sort_box .li-sort-item > ul > li.sort-option a:hover{
  background: #e9eefc !important;
  border-color: #1e3c72 !important;
  color: #1e3c72 !important;
}
#sortBox.sort_box .li-sort-item > ul > li.sort-option.slted a{
  background: #eef3ff !important;
  border-color: #1e3c72 !important;
  color: #1e3c72 !important;
  box-shadow: 0 0 0 2px rgba(30, 60, 114, .15) !important;
}

/* overflowで切られないように */
td.td-sort-box,
table.search-list,
table.search-list *{
  overflow: visible !important;
}

/* 既存の「＋」「✔」系を潰す */
.search-pc .sort_box_text .sort_list .sort_item:before,
.search-pc .slted::after{
  content: none !important;
  display: none !important;
}

.search-pc .sort_box_text .sort_list .slted,
.search-pc .sort_box_text .sort_list .pcs-slted,
.search-pc .slted {
  background: transparent !important;
  box-shadow: none !important;
  outline: none !important;
  border-color: transparent !important;
}

.border-new span {
    position: relative;
    top: 0px !important;
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

  // 初回
  injectCssOnce();

  // SPA/再描画対策：軽い監視（URL変化時だけ再注入）
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      injectCssOnce();
      console.log('[TM] css reinjected:', lastHref);
    }
  }, 500);

  console.log('[TM] css injector loaded:', location.href);
})();

  document.addEventListener('click', (e) => {
    // sortBox内のリンク全部を対象（class依存しない）
    const a = e.target.closest('#sortBox a[href]');
    if (!a) return;

    e.preventDefault();
    e.stopPropagation();

    // 直近の sort-option を選択状態にする（見た目だけ）
    const li = a.closest('li');
    if (li) {
      const ul = li.parentElement;
      if (ul) ul.querySelectorAll('li').forEach(x => x.classList.remove('slted'));
      li.classList.add('slted');
    }
    a.classList.add('slted');

    console.log('[TM] navigation blocked:', a.href);
  }, true);
