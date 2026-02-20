// ==UserScript==
// @name         アカポン（CRM｜チーム＆外部）※akapon-crm_html_css.user.js
// @namespace    akapon
// @version      202602202300
// @match        https://member.createcloud.jp/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-crm_html_css.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/akapon-crm_html_css.user.js
// ==/UserScript==

(() => {
  'use strict';
/* =========================================================
   【エンジニア向けコメント／未解決バグ：離脱時の Swal2（変更履歴）】

   ■現象
   - 下記URLで、何も入力していない（=ユーザー的には null 状態）にも関わらず、
     ページ離脱時に「変更履歴があります。まだ保存されていません。本当に閉じてよろしいですか？」の Swal2 が表示される。
     対象候補：
       - https://member.createcloud.jp/users
       - https://member.createcloud.jp/users/new

   ■表示されるDOM（例）
   - container 側に下記クラスが付いている可能性が高い：
     .swal2-container.swal2-center.swal2-backdrop-show
   - popup 内に #swal2-title / .swal2-title があり、文言は以下を含む：
     「変更履歴があります」「まだ保存されていません」
   - ただし new_alert_popup が付かないパターンがある

   ■これまでの対策（Tampermonkey側）と結果
   1) beforeunload の capture 停止（stopImmediatePropagation等）
      → 効かない（= beforeunload 以外で Swal が出ている可能性）
   2) window.onbeforeunload の defineProperty ラップ
      → 効かない（= onbeforeunload ではなく SPA 的に独自遷移フック/クリックフックで Swal を出している可能性）
   3) Swal.fire の monkey patch（未入力なら fire を握り潰す）
      → 効かない（= Swal.fire を通っていない、もしくは別インスタンス/別参照で呼んでいる可能性）
   4) MutationObserver で swal2-container / swal2-popup を検知して即削除
      → 効かない（= 監視より前に描画されている、または即再生成されている、あるいは Shadow DOM/iframe 等の別DOMで生成）

   ■推定原因（要調査）
   - 変更検知ロジックが「入力フォームの値」ではなく
     - グローバル state
     - localStorage / sessionStorage
     - hidden input
     - JS側の dirty flag
     - SPA の router ガード（turbo / pjax / axios遷移等）
     を根拠に「変更あり」と誤判定している可能性が高い。
   - /users は一覧画面のため、フォームが無くても dirty 判定が立っている可能性あり。

   ■エンジニア側でやるべき調査（優先順）
   (A) Swal2 の発火元を特定する（最優先）
     - Chrome DevTools → Sources → Event Listener Breakpoints
       - Control: beforeunload
       - DOM Mutation（Subtree modifications）※SwalがDOM挿入される瞬間を捕捉
     - もしくは Console で関数フックして stack を取る：
       - window.Swal && (Swal.fire = new Proxy(Swal.fire, { apply(t, thisArg, args){ console.trace('Swal.fire', args); return Reflect.apply(t, thisArg, args);} }))
       - もし Swal.fire を通ってないなら、Swal2 の内部 createPopup/ renderContainer 相当箇所の stack を追う
     - swal2-container が insert された瞬間の call stack を必ず取る

   (B) 「変更あり」フラグの根拠を突き止める
     - ページ表示直後（未入力）で dirty 判定が true になる理由を確認
     - storage（localStorage/sessionStorage）に未入力なのに値が残っていないか確認
     - hidden input / default 値差分で dirty 判定になっていないか確認

   (C) 正しい仕様
     - 初期表示状態（ユーザー未入力・未操作）では離脱確認は出さない
     - “入力をした” または “編集に相当する操作をした” 場合のみ確認を出す

   ■推奨する恒久対応（アプリ側）
   - dirty 判定の初期スナップショットを「描画完了後」に取り直す
     例：初回レンダリング後に current state を baseline として保持し、
         baseline と比較して差分がある時のみ Swal を出す。
   - /users（一覧）では dirty ガード自体を無効化する（画面特性上不要なら）

   ■補足
   - Tampermonkey側での抑止は限界があるため、
     発火元特定 → アプリ側の dirty 判定修正が最短。
   ========================================================= */

  // =========================================================
  // 対象：
  // - /users
  // - /users/new
  //
  // 問題：
  // - 何も入力していない（情報がnull相当）状態でページ離脱すると
  //   「変更履歴があります。まだ保存されていません。本当に閉じてよろしいですか？」
  //   の Swal2（new_alert_popup）が出る
  //
  // 対策：
  // ① beforeunload を「未入力なら抑止」
  // ② Swal.fire を「未入力なら抑止」
  // ③ DOM直挿しで swal2-popup が出るケースもあるため、出現を監視して「未入力なら即消し」
  // =========================================================
  const isTargetPage = () => {
    const path = location.pathname || '';
    return (
      path === '/users' ||
      path === '/users/' ||
      path === '/users/new' ||
      path === '/users/new/'
    );
  };

  if (!isTargetPage()) return;

  // =========================
  // 入力が「空」か判定
  // =========================
  const pickMainForm = () => {
    // /users/new は new_user が多い想定。/users 側はフォームが無い可能性があるため柔軟に。
    return (
      document.querySelector('form#new_user') ||
      document.querySelector('form[action*="/users"]') ||
      document.querySelector('form') ||
      null
    );
  };

  const isMeaningfulField = (el) => {
    if (!el) return false;
    if (el.disabled) return false;

    const type = (el.getAttribute('type') || '').toLowerCase();
    if (type === 'hidden' || type === 'submit' || type === 'button' || type === 'reset') return false;

    // 表示されていない要素は除外
    if (el.offsetParent === null && el.getClientRects().length === 0) return false;

    return true;
  };

  const isAllInputsBlank = () => {
    const form = pickMainForm();
    // フォームが無い（=入力しようがない）場合は「未入力」とみなす
    if (!form) return true;

    const fields = form.querySelectorAll('input, textarea, select');
    for (const el of fields) {
      if (!isMeaningfulField(el)) continue;

      const tag = el.tagName.toLowerCase();
      const type = (el.getAttribute('type') || '').toLowerCase();

      if (type === 'checkbox' || type === 'radio') {
        if (el.checked) return false;
        continue;
      }

      if (type === 'file') {
        if (el.files && el.files.length > 0) return false;
        continue;
      }

      if (tag === 'select') {
        const v = (el.value ?? '').toString().trim();
        if (v !== '') return false;
        continue;
      }

      const v = (el.value ?? '').toString().trim();
      if (v !== '') return false;
    }
    return true;
  };

const isUnsavedChangesText = (text) => {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  // 「？」「本当に〜」の有無・改行差異があっても一致させる
  return t.includes('変更履歴があります') && t.includes('まだ保存されていません');
};

  const isUnsavedChangesSwalArgs = (args) => {
    let titleText = '';
    let htmlText = '';

    if (args && typeof args[0] === 'string') {
      titleText = args[0] || '';
      htmlText = (typeof args[1] === 'string' ? args[1] : '') || '';
    } else if (args && args[0] && typeof args[0] === 'object') {
      titleText = args[0].title || '';
      htmlText = args[0].html || args[0].text || '';
    }

    const merged = `${titleText} ${htmlText}`.replace(/\s+/g, ' ').trim();
    return isUnsavedChangesText(merged);
  };

  // =========================
  // ① beforeunload（離脱確認）を「未入力なら抑止」
  // =========================
  window.addEventListener(
    'beforeunload',
    (e) => {
      if (!isTargetPage()) return;
      if (!isAllInputsBlank()) return;

      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      e.cancelBubble = true;
      return undefined;
    },
    true
  );

  const wrapOnBeforeUnload = () => {
    if (window.__tmUsersLeaveGuardOnBeforeUnloadWrapped) return;
    window.__tmUsersLeaveGuardOnBeforeUnloadWrapped = true;

    let original = window.onbeforeunload;

    Object.defineProperty(window, 'onbeforeunload', {
      configurable: true,
      get() {
        return original;
      },
      set(fn) {
        const maybeFn = fn;
        original = function (e) {
          if (isTargetPage() && isAllInputsBlank()) return undefined;
          if (typeof maybeFn === 'function') return maybeFn.call(window, e);
          return maybeFn;
        };
      },
    });

    if (typeof original === 'function') {
      const current = original;
      window.onbeforeunload = current;
    }
  };

  wrapOnBeforeUnload();
  {
    let tries = 0;
    const iv = setInterval(() => {
      tries++;
      wrapOnBeforeUnload();
      if (tries >= 30) clearInterval(iv);
    }, 200);
  }

  // =========================
  // ② Swal.fire を「未入力なら抑止」
  // =========================
  const patchSwalIfReady = () => {
    if (window.__tmUsersLeaveGuardSwalPatched) return true;

    const Swal = window.Swal;
    if (!Swal || typeof Swal.fire !== 'function') return false;

    window.__tmUsersLeaveGuardSwalPatched = true;

    const origFire = Swal.fire.bind(Swal);
    Swal.fire = function (...args) {
      if (isTargetPage() && isAllInputsBlank() && isUnsavedChangesSwalArgs(args)) {
        return Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true });
      }
      return origFire(...args);
    };

    // close があるなら保険で保持
    if (typeof Swal.close === 'function' && !Swal.__tmCloseWrapped) {
      Swal.__tmCloseWrapped = true;
    }

    return true;
  };

  // Swal が後から来るケースに備えて：poll + defineProperty（二重保険）
  {
    let tries = 0;
    const iv = setInterval(() => {
      tries++;
      if (patchSwalIfReady() || tries >= 50) clearInterval(iv);
    }, 200);
  }

  // window.Swal 自体が後から代入される場合にも対応
  (() => {
    if (window.__tmUsersLeaveGuardSwalDefineProperty) return;
    window.__tmUsersLeaveGuardSwalDefineProperty = true;

    let _swal = window.Swal;
    Object.defineProperty(window, 'Swal', {
      configurable: true,
      get() {
        return _swal;
      },
      set(v) {
        _swal = v;
        // 代入された瞬間にパッチ
        try {
          patchSwalIfReady();
        } catch (_) {}
      },
    });
  })();

  // =========================
  // ③ DOM直挿し swal2-popup を「未入力なら即消し」
  // =========================
const removeUnsavedSwalIfExists = () => {
  if (!isTargetPage()) return;
  if (!isAllInputsBlank()) return;

// Swal2 は new_alert_popup が付かない場合があるので、container から拾う
const container = document.querySelector('.swal2-container.swal2-center.swal2-backdrop-show');
if (!container) return;

const popup = container.querySelector('.swal2-popup');
if (!popup) return;

const titleEl = popup.querySelector('#swal2-title, .swal2-title');
const titleText = titleEl ? (titleEl.textContent || '') : '';
const wholeText = popup.textContent || '';
if (!isUnsavedChangesText(titleText) && !isUnsavedChangesText(wholeText)) return;

// 可能なら Swal.close() で正しく閉じる
const Swal = window.Swal;
if (Swal && typeof Swal.close === 'function') {
  try {
    Swal.close();
    return;
  } catch (_) {}
}

// close が無い/効かない場合は container を除去（最優先）
if (container.parentNode) {
  container.parentNode.removeChild(container);
  return;
}
};
  // 初回も念のため実行（すでに出てる場合）
  document.addEventListener('DOMContentLoaded', () => {
    removeUnsavedSwalIfExists();
  });

  // 生成された瞬間を監視
  (() => {
    if (window.__tmUsersLeaveGuardSwalObserver) return;
    window.__tmUsersLeaveGuardSwalObserver = true;

    const obs = new MutationObserver(() => {
      removeUnsavedSwalIfExists();
    });

    obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
  })();

  // =========================
  // CSS/HTML/JS（ご指定どおり：追加の見た目変更などはしない）
  // =========================
})();
