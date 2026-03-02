// ==UserScript==
// @name         校正画面｜微調整※screen-page-control-space.user.js
// @namespace    akapon
// @version      20260302-1900
// @description  .page-control の下に余白を入れる（指定アップロードアイコンが内包されている時のみ）
// @match        https://member.createcloud.jp/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

/* =========================================================
【エンジニア向けメモ｜校正画面 page-control 直下の余白が効かない件】

■やりたいこと
- 下記DOMの “直下に空白” を入れたい
  <div class="d-flex page-control ...">
    ...
    <img class="create-akaire-box-icon-upload" src="...no_animation_drive_preview..." alt="アップロード">
    ...
  </div>
- ただし、上記 img.create-akaire-box-icon-upload（no_animation_drive_preview）が
  「.page-control 内に存在する時だけ」空白を追加したい

■現状の問題
- CSSで ::after / margin-bottom / padding-bottom を入れても “負ける”
- inline style（!important）でも効かないケースがあるため、
  このscript側だけで完結させるのは難しい（親/祖先要素の overflow / display / height / position などで潰れている可能性）

■想定原因（優先して確認してほしい）
1) .page-control もしくはその親要素に
   - overflow: hidden / overflow: auto
   - height 固定 / max-height 固定
   - display:flex で align-items / flex-wrap / gap などの影響
   - margin-collapse が起きない形に見えても、別のラッパーが高さ固定
   が入っていて、余白が視覚的に出ない

2) “空白を出したい場所” が .page-control の下ではなく、
   実際には以下のどれかの間で必要になっている可能性
   - .page-control と、その直後の兄弟要素の間
   - .page-control 内の特定子要素の下（最後の行）
   ＝ DOM上の余白追加ポイントの再特定が必要

■エンジニア対応方針（推奨）
A) CSSで確実に出すなら「兄弟要素の間」に入れる
   例：.page-control の “直後に来る要素” を特定し、
       .page-control + .NEXT_ELEMENT { margin-top: XXpx; } の形にする
   → “空白を出したい位置” が確実に兄弟間なら、これが一番安定

B) DOMでスペーサーを挿入する（最終手段として安定）
   条件成立時だけ
   <div data-tm-page-control-spacer="1" style="height:14px;"></div>
   を .page-control の直後に insertAfter する
   ※overflow/height固定が上位にある場合は、挿入先を “固定の外側” にする必要あり

C) そもそも親側の overflow/height固定を見直す（根本）
   「余白が出るべき領域」が高さ固定で切られているなら、
   その固定の解除 or 内側での余白確保に変更

■このscript側の条件判定（現状の意図）
- img.create-akaire-box-icon-upload が存在
- src に "no_animation_drive_preview" を含む（同名classの別用途混入回避）
========================================================= */

  const STYLE_ID = 'tm-screen-page-control-space-css';
  const FLAG_CLASS = 'tm-page-control-has-uploadicon';

  function injectCssOnce() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
/* =========================================================
   校正画面：page-control 下に余白（条件付き）
   条件：.page-control 内に「.create-akaire-box-icon-upload」が存在する時のみ
========================================================= */
html body .page-control.${FLAG_CLASS}::after{
  content:"";
  display:block;
  height: 14px; /* ← ここで「下の空白量」を調整 */
}
`.trim();

    (document.head || document.documentElement).appendChild(style);
  }

  function markPageControlIfNeeded(root) {
    if (!root || root.nodeType !== 1) return;

    const icons = root.querySelectorAll('img.create-akaire-box-icon-upload');
    if (!icons.length) return;

    icons.forEach((img) => {
      const pageControl = img.closest('.page-control');
      if (!pageControl) return;

      // 念のため src が指定のものだけ対象（HTMLに class が同名で別用途があっても巻き込まない）
      const src = String(img.getAttribute('src') || '');
      if (src.indexOf('no_animation_drive_preview') === -1) return;

      if (!pageControl.classList.contains(FLAG_CLASS)) {
        pageControl.classList.add(FLAG_CLASS);
      }
    });
  }

  function init() {
    injectCssOnce();

    // 初回
    markPageControlIfNeeded(document);

    // 動的描画対策
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const n of m.addedNodes) {
          if (n && n.nodeType === 1) markPageControlIfNeeded(n);
        }
      }
    });

    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  // document-start でも確実に動かす
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
