// ==UserScript==
// @name         全ファイルページ｜※all-files.user.js
// @namespace    akapon
// @version      20260302-1002
// @match        https://member.createcloud.jp/*
// @match        https://membernew.createcloud.jp/*
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/all-files.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/all-files.user.js
// ==/UserScript==

(function() {
  'use strict';

  function injectCssGuaranteed(id, cssText) {
    // 既にあれば更新＆末尾へ（後勝ち）
    const existing = document.getElementById(id);
    if (existing) {
      existing.textContent = cssText;
      if (existing.parentNode) existing.parentNode.appendChild(existing);
      return true;
    }

    const style = document.createElement('style');
    style.id = id;
    style.textContent = cssText;

    // head が無い/差し込み不可の瞬間でも documentElement に入れる
    const target = document.head || document.documentElement;
    if (!target) return false;

    target.appendChild(style);
    return true;
  }

  const CSS_TEXT = `
    /* ============================================
       全ファイルページ
       tableタイトル行以外を 0.9em に統一
       ※ thead（タイトル行）は除外
       ※ .table-project の font-size:14px!important に負けるケースがあるため
          tbody配下を「より強いセレクタ＋重要度」で固定する
       ============================================ */

    /* =========================================
       ❸ 本文（tbody）：文字位置を少しだけ下へ
       - thead は触らない
       ========================================= */
    html body table.table-project.table-project-newstyle > tbody > tr > td{
      vertical-align: middle !important;
      padding-top: 10px !important;
      padding-bottom: 6px !important;
    }

    /* まず tbody の td 自体を確実に固定 */
    html body table.table-project.table-project-newstyle > tbody > tr > td {
      font-size: 0.9em !important;
      line-height: 1.35 !important;
    }

    /* td 内の主要要素も確実に継承させる（個別に 14px!important 等が当たっても勝つ） */
    html body table.table-project.table-project-newstyle > tbody > tr > td a,
    html body table.table-project.table-project-newstyle > tbody > tr > td span,
    html body table.table-project.table-project-newstyle > tbody > tr > td div,
    html body table.table-project.table-project-newstyle > tbody > tr > td p,
    html body table.table-project.table-project-newstyle > tbody > tr > td strong,
    html body table.table-project.table-project-newstyle > tbody > tr > td small,
    html body table.table-project.table-project-newstyle > tbody > tr > td button,
    html body table.table-project.table-project-newstyle > tbody > tr > td input,
    html body table.table-project.table-project-newstyle > tbody > tr > td select,
    html body table.table-project.table-project-newstyle > tbody > tr > td textarea,
    html body table.table-project.table-project-newstyle > tbody > tr > td img {
      font-size: 0.95em !important;
      line-height: 1.35 !important;
    }

    /* =========================================
       ❶ テーブル内リンク：下線はホバー時だけ
       ========================================= */
    html body table.table.table-project.table-project-newstyle a.text-underline{
      text-decoration: none !important;
    }
    html body table.table.table-project.table-project-newstyle a.text-underline:hover{
      text-decoration: underline !important;
    }

    /* ===============================
       title行：thead内 bg-primary を限定上書き（高さUP＋文字を少し下へ）
       =============================== */

    html body table.table.table-project.table-project-newstyle thead tr.bg-primary {
      height: 40px !important;
      min-height: 40px !important;
    }

    html body table.table.table-project.table-project-newstyle thead tr.bg-primary > th {
      height: 40px !important;
      line-height: 40px !important;
      vertical-align: middle !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }

    html body table.table.table-project.table-project-newstyle thead tr.bg-primary > th > * {
      display: inline-block !important;
      transform: translateY(2px) !important;
    }

    /* =========================================
       ステータス列：文字だけ左寄せ（アイコン位置はそのまま）
       - 列や d-flex の中央寄せは触らない
       - status-text を固定幅の箱にして、箱の中だけ左寄せ
       ========================================= */
    html body table.table.table-project.table-project-newstyle span.status-text {
      display: inline-block !important;
      width: 4.6em !important;        /* ← 揃え幅（必要なら 5.0em） */
      text-align: left !important;     /* ← 文字だけ左寄せ */
      margin-left: 10px !important;    /* ← ml-3 を維持しつつ微調整 */
      white-space: nowrap !important;
    }

    /* =========================================
       ステータス●（textContentの「●」）を大きくする
       ========================================= */
    html body table.table.table-project.table-project-newstyle
    span.open-select-status-modal.style-point.akaire_file_status_point {
      font-size: 22px !important;   /* ←大きさ（20〜26で調整） */
      line-height: 1 !important;
      display: inline-block !important;
      transform: translateY(-1px) !important; /* ←縦位置微調整（不要なら0） */
    }

    /* =========================================
       ❶ 本文（tbody）の1〜3列だけ 左に10px余白
       - thead（タイトル行）は触らない
       ========================================= */
    html body table.table.table-project.table-project-newstyle tbody > tr > td:nth-child(1),
    html body table.table.table-project.table-project-newstyle tbody > tr > td:nth-child(2),
    html body table.table.table-project.table-project-newstyle tbody > tr > td:nth-child(3){
      padding-left: 10px !important;
    }

    /* =========================================
       ❷ 本文（tbody）の 3列(ファイル名) / 4列(完成者) / 7列(完成日) だけ太字
       - thead（タイトル文字）は変更しない
       ========================================= */
    html body table.table.table-project.table-project-newstyle tbody > tr > td:nth-child(3),
    html body table.table.table-project.table-project-newstyle tbody > tr > td:nth-child(4),
    html body table.table.table-project.table-project-newstyle tbody > tr > td:nth-child(7){
      font-weight: 800 !important;
    }
    /* aタグなども確実に太字 */
    html body table.table.table-project.table-project-newstyle tbody > tr > td:nth-child(3) a,
    html body table.table.table-project.table-project-newstyle tbody > tr > td:nth-child(4) a,
    html body table.table.table-project.table-project-newstyle tbody > tr > td:nth-child(7) a{
      font-weight: 800 !important;
    }

    /* =========================================
       ❷（置換）モーダル表示時：クリックした行を「薄い赤ザブトン」で強調
       - 線の強調はしない
       ========================================= */
    html body table.table.table-project.table-project-newstyle tbody > tr.tm-allfiles-active-row > td{
      background: rgba(255, 77, 77, 0.10) !important;
      box-shadow: none !important;
    }
    html body table.table.table-project.table-project-newstyle tbody > tr.tm-allfiles-active-row{
      outline: none !important;
    }

    html body table.table.table-project.table-project-newstyle > thead * {
      font-size: inherit !important;
    }
  `;

  // document-start 直後：まず1回注入
  injectCssGuaranteed('akapon-all-files-table-font', CSS_TEXT);

  /* =====================================================
     ステータス列：
     img.edit-project-name-img（ホバーで「プロジェクト名」になる）を廃止し、
     ●（span.akaire_file_status_point）に置換して「ステータス文字の左」へ移動
     - 監視はしない（重くしない）
     - 数回だけリトライして、遅延描画にも最低限追従
  ===================================================== */
  function applyStatusDotOnce() {
    const targets = document.querySelectorAll(
      'table.table-project.table-project-newstyle span.open-select-status-modal'
    );
    if (!targets.length) return false;

    targets.forEach((btn) => {
      if (btn.dataset.tmStatusDotApplied === '1') return;
      btn.dataset.tmStatusDotApplied = '1';

      // 既存imgを除去（ホバーで「プロジェクト名」になる原因）
      btn.querySelectorAll('img').forEach((img) => img.remove());

      // 既存情報からID/ステータスを引き継ぐ
      const fileId = btn.getAttribute('data-file-id') || '';
      const oldStatus = btn.getAttribute('data-file-status') || '';

      if (fileId && !btn.id) btn.id = `status-akaire_file-${fileId}`;
      if (oldStatus) btn.setAttribute('data-status-old', oldStatus);

      // 指定の「●」span化（クラス付与）
      btn.classList.add(
        'style-point',
        'akaire_file_status_point',
        'dropdown-toggle',
        'status_text_description'
      );

      // ★初期ステータスに応じて色クラスを付与
      setStatusPointClass(btn, oldStatus || 'preparation');

      // 表示は ● に統一
      btn.textContent = '●';

      // 「準備中」等の左に移動
      const wrap = btn.closest('div.d-flex');
      if (wrap) {
        const statusText = wrap.querySelector('span.status-text');
        if (statusText) {
          wrap.insertBefore(btn, statusText);

          // ★ステータス文字もクリック可能に（既存のbtnクリックへ委譲）
          //   - システム側の既存処理（data-* / modal / changeStatus等）をそのまま使う
          //   - 1回だけ付与（重くしない）
          if (statusText.dataset.tmStatusTextClickable !== '1') {
            statusText.dataset.tmStatusTextClickable = '1';
            statusText.style.cursor = 'pointer';

            statusText.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              btn.click();
            }, true);
          }
        }
      }
    });

    return true;
  }

  // =====================================================
  // ステータスに応じて point 色クラスを付け替える（最小）
  // =====================================================
  function setStatusPointClass(el, status) {
    if (!el) return;

    el.classList.remove('status_green_point', 'status_orange_point', 'status_red_point', 'status_gray_point');

    switch (status) {
      case 'working':
        el.classList.add('status_orange_point');
        break;
      case 'complete':
        el.classList.add('status_red_point');
        break;
      case 'on_hold':
        el.classList.add('status_gray_point');
        break;
      case 'preparation':
      default:
        el.classList.add('status_green_point');
        break;
    }
  }

  // =====================================================
  // AkaireFile.changeStatus をラップして、変更後に●の色も同期
  // （監視はしない。1回だけ仕込む）
  // =====================================================
  function hookChangeStatusOnce() {
    if (!window.AkaireFile || typeof window.AkaireFile.changeStatus !== 'function') return false;
    if (window.AkaireFile.__tmChangeStatusWrapped === true) return true;

    const original = window.AkaireFile.changeStatus;
    window.AkaireFile.changeStatus = function(li, fileId, projectId, status) {
      const ret = original.apply(this, arguments);

      try {
        const id = `status-akaire_file-${fileId}`;
        const dot = document.getElementById(id);
        if (dot) {
          dot.setAttribute('data-status-old', status);
          setStatusPointClass(dot, status);
        }
      } catch (e) {}

      return ret;
    };

    window.AkaireFile.__tmChangeStatusWrapped = true;
    return true;
  }

  // =====================================================
  // 共通ステータスモーダルのタイトルが使い回される問題の対策
  // - クリック直前に、トリガー要素の data-file-name でタイトルを更新
  // - 監視なし（イベント委譲1本だけ）
  // =====================================================
  function bindStatusModalTitleFixOnce() {
    if (window.__tmAllFilesStatusTitleFixBound) return;
    window.__tmAllFilesStatusTitleFixBound = true;

    document.addEventListener('click', (e) => {
      const t = e.target;
      if (!t || typeof t.closest !== 'function') return;

      // ●（open-select-status-modal） or ステータス文字（status-text）クリックを拾う
      const btn = t.closest('span.open-select-status-modal');
      const isText = t.closest('span.status-text');

      // 文字クリックの場合は同じ行の btn を探す
      const trigger = btn || (isText ? isText.closest('td')?.querySelector('span.open-select-status-modal') : null);
      if (!trigger) return;

      const fileName = trigger.getAttribute('data-file-name') || '';
      if (!fileName) return;

      const targetSel = trigger.getAttribute('data-target') || '';
      if (!targetSel) return;

      const modal = document.querySelector(targetSel);
      if (!modal) return;

      // tm-file-modal-header 側（あなたが貼ったタイトル行）
      const headerTitle = modal.querySelector('.tm-file-header-title-text');
      if (headerTitle) headerTitle.textContent = `${fileName} のステータスを選択してください`;

      // 旧ヘッダー側（存在する画面もあるため保険）
      const h5Ellipsis = modal.querySelector('h5.modal-title .text-ellipsis');
      if (h5Ellipsis) h5Ellipsis.textContent = fileName;

    }, true); // ← capture（モーダルが開く前に必ず書き換える）
  }

  // =====================================================
  // ❸ ステータスモーダルを開いた行を強調表示（1行だけ）
  // - 監視なし（イベント委譲1本）
  // =====================================================
  function bindActiveRowHighlightOnce(){
    if (window.__tmAllFilesRowHighlightBound) return;
    window.__tmAllFilesRowHighlightBound = true;

    const ACTIVE_CLASS = 'tm-allfiles-active-row';

    function clearActive(){
      document.querySelectorAll(
        'table.table-project.table-project-newstyle tbody > tr.' + ACTIVE_CLASS
      ).forEach(tr => tr.classList.remove(ACTIVE_CLASS));
    }

    document.addEventListener('click', (e) => {
      const t = e.target;
      if (!t || typeof t.closest !== 'function') return;

      // ●クリック（span.open-select-status-modal） or 文字クリック（span.status-text）
      const btn = t.closest('span.open-select-status-modal');
      const text = t.closest('span.status-text');

      let tr = null;
      if (btn) tr = btn.closest('tr');
      if (!tr && text) tr = text.closest('tr');
      if (!tr) return;

      // 対象テーブルのみ
      const table = tr.closest('table.table-project.table-project-newstyle');
      if (!table) return;

      clearActive();
      tr.classList.add(ACTIVE_CLASS);

      // モーダルが閉じたら解除（存在する場合だけ）
      const trigger = btn || (text ? tr.querySelector('span.open-select-status-modal') : null);
      const targetSel = trigger ? (trigger.getAttribute('data-target') || '') : '';
      if (!targetSel) return;

      const modal = document.querySelector(targetSel);
      if (!modal) return;

      // Bootstrap modal の close を拾える場合だけ（拾えない環境でも害なし）
      const onHidden = () => {
        tr.classList.remove(ACTIVE_CLASS);
        modal.removeEventListener('hidden.bs.modal', onHidden);
      };
      modal.addEventListener('hidden.bs.modal', onHidden);
    }, true);
  }

document.addEventListener('DOMContentLoaded', () => {
  injectCssGuaranteed('akapon-all-files-table-font', CSS_TEXT);

  // ★追加：タイトル使い回し防止（タスク1固定になる件）
  bindStatusModalTitleFixOnce();

  // ★追加：行ハイライト
  bindActiveRowHighlightOnce();

  // ✅ /all_akaire_files：絞り込み（親モーダル）の並び順・項目・クリック（＞）をこのscriptだけで整形
  bindAllFilesFilterFixOnce();

  // 1回だけだと遅延描画に負けることがあるので、軽いリトライ（最大6回）
  let tries = 0;
  const tick = () => {
    tries += 1;
    const ok = applyStatusDotOnce();

    // ★changeStatus のラップも、最大6回だけ試す（重くしない）
    hookChangeStatusOnce();

    if (ok || tries >= 6) return;
    setTimeout(tick, 200);
  };
  tick();
});

  // load 後：最終保険（外部CSSが最後に差し込まれるケース対策）＋最後の1回
  window.addEventListener('load', () => {
    injectCssGuaranteed('akapon-all-files-table-font', CSS_TEXT);
    applyStatusDotOnce();
  });

  // =====================================================
  // /all_akaire_files 専用：絞り込み（親モーダル）
  // - 共通scriptは触らず、このページだけ整形する
  // - 監視はしない（クリック時に1回だけ整える）
  // =====================================================
  function bindAllFilesFilterFixOnce(){
    if (window.__tmAllFilesFilterFixBound) return;
    window.__tmAllFilesFilterFixBound = true;

    // /all_akaire_files 以外では何もしない
    const p = location.pathname || '';
    if (!(p === '/all_akaire_files' || p.startsWith('/all_akaire_files/'))) return;

    // 「検索・絞り込み」ボタンを押したタイミングで、親モーダルが描画されるため
    // クリック後に少しだけ待ってから整形する（重くしない）
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (!t || typeof t.closest !== 'function') return;

      // フィルターボタン（上部）を押したとき
      const btn = t.closest('[onclick*="selectFilterDisplay"][data-target="#modalFilterCommonAll"], td.td-filter-box [onclick*="selectFilterDisplay"]');
      if (!btn) return;

      setTimeout(applyAllFilesFilterOrderOnce, 50);
    }, true);
  }

  function applyAllFilesFilterOrderOnce(){
    // 親モーダル（PC DOM）
    const root = document.querySelector('.filter-common-all.dropdown-new-stype');
    if (!root) return;

    const body = root.querySelector('.dropdown-body');
    if (!body) return;

    // 二重適用防止（このページだけ）
    if (body.dataset.tmAllFilesFilterFixed === '1') return;
    body.dataset.tmAllFilesFilterFixed = '1';

    // ✅ /all_akaire_files：余計な項目を削除（検証上だけ出てくる）
    // - 期限日（ダミー）
    // - ID
    body.querySelectorAll('[data-tm-filter-key="due_date_dummy"], [data-tm-filter-key="id"]').forEach(el => el.remove());

    // 取得対象行
    const rows = Array.from(body.querySelectorAll('.select-filter, .select-filter-eachpage'));

    // ラベル取得（既存DOMに依存）
    const getLabel = (row) => {
      const span = row.querySelector('span.ml-3') || row.querySelector('span');
      return span ? (span.textContent || '').trim() : (row.textContent || '').trim();
    };

    const setLabel = (row, text) => {
      const span = row.querySelector('span.ml-3') || row.querySelector('span');
      if (span) span.textContent = text;
    };

    const ensureRightChevron = (row) => {
      if (row.querySelector('.select-filter-right')) return;
      const right = document.createElement('div');
      right.className = 'select-filter-right';
      row.appendChild(right);
    };

    const setOnclick = (row, onclickStr) => {
      row.setAttribute('onclick', onclickStr);
      row.style.pointerEvents = '';   // 共通側で無効化されている場合を戻す（このページだけ）
      row.style.opacity = '';         // 同上
    };

    // 目的の並び順
    const ORDER = [
      { label: '作成日',   onclick: "SearchForm.selectFilterDisplay('toggle', '.created-at-filter', event)" },
      { label: '更新日',   onclick: "SearchForm.selectFilterDisplay('toggle', '.updated-at-filter', event)" },
      { label: '完成日',   onclick: "SearchForm.selectFilterDisplay('toggle', '.complete-date-at-filter', event)" },
      { label: '作成者',   onclick: "SearchForm.selectFilterDisplay('toggle', '.created-by-filter', event)" },
      { label: '完成者',   onclick: "SearchForm.selectFilterDisplay('toggle', '.complete-updater-filter', event)" },
      { label: 'ステータス', onclick: "SearchForm.selectFilterDisplay('toggle', '.status-filter', event)" },
      { label: '件数',     onclick: "SearchForm.selectFilterDisplay('toggle', '.filter-content-number-record', event)" }
    ];

    // 行をラベルで引く（「（ダミー）」が付いてても拾う）
    const findRowByLabel = (want) => {
      return rows.find(r => {
        const l = getLabel(r).replace('（ダミー）','').trim();
        return l === want;
      }) || null;
    };

    // 無ければ作る（このページだけ）
    const createRow = (labelText, onclickStr, isEachPage = false) => {
      const row = document.createElement('div');
      row.className = 'd-flex justify-content-between cursor-pointer select-filter' + (isEachPage ? ' select-filter-eachpage' : '');
      row.innerHTML = `
        <div class="d-flex align-items-center">
          <div style="width:26px"></div>
          <span class="ml-3">${labelText}</span>
        </div>
        <div class="select-filter-right"></div>
      `.trim();
      setOnclick(row, onclickStr);
      return row;
    };

    // まず「更新日（ダミー）」の表記が残っていたら「更新日」に戻す（このページだけ）
    rows.forEach(r => {
      const l = getLabel(r);
      if (l.includes('更新日')) setLabel(r, '更新日');
      if (l.includes('完成日')) setLabel(r, '完成日');
    });

    // 並び替え＋不足行を追加
    ORDER.forEach(spec => {
      let row = findRowByLabel(spec.label);

      if (!row) {
        const isPerPage = (spec.label === '件数');
        row = createRow(spec.label, spec.onclick, isPerPage);
        body.appendChild(row);
      }

      // onclick を必ず付与（＞で子モーダル表示）
      setLabel(row, spec.label);
      setOnclick(row, spec.onclick);
      ensureRightChevron(row);

      body.appendChild(row);
    });
  }

})();
