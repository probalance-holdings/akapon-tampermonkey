// ==UserScript==
// @name         済｜共通｜モーダル｜見た目差分の確認用※done-common-modal-difference.user.js
// @namespace    akapon
// @version      20260302 2400
// @description  モーダルタイトル行の“見た目差分”を一時的にそろえるための確認用スクリプト
// @match        https://member.createcloud.jp/*
// @match        https://membernew.createcloud.jp/*
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/done-common-modal-difference.user.js
// @downloadURL  https://raw.githubusercontent.com/probalance-holdings/akapon-tampermonkey/main/scripts/done-common-modal-difference.user.js
// ==/UserScript==

/*
===========================================
【エンジニア向け指示コメント｜チケット＞期限モーダル崩れ】

チケット詳細の「期限」モーダル（.modal_expiration_task）でレイアウトが崩れます。
原因は、モーダル内の構造が下記のように
.container-new.search > .align-center-div > .modal-header ...
になっており、ヘッダー分のオフセットが不足して上部と被っているためです。

[DOM構造（抜粋）]
<div class="container-new search">
  <div class="align-center-div">
    <div class="modal-header ... tm-file-original-header-hidden">
      <h5 class="modal-title ...">…期限</h5>

検証上、下記の指定で崩れが解消し、他ページへの影響もありません
（期限モーダル内に限定すればOK）。

対象：期限モーダル内の .align-center-div
目的：ヘッダーとの被り回避＋中央寄せを安定化

[適用CSS（期限モーダル内だけに限定）]
.modal_expiration_task .container-new.search .align-center-div{
  max-width: 550px;
  margin: 74px auto;
}

※ margin-top を個別要素に当てるより、.align-center-div の margin でまとめて下げた方が安定しました。
※ 他画面の .align-center-div に波及しないよう、必ず .modal_expiration_task でスコープしてください。
===========================================
*/
/*
===========================================
現在のプラン　⇒　解約　⇒　プロジェクト～外部メンバーまでクリックできない
このスクリプトは「見た目差分の確認用」です。
本来であれば下記司令塔スクリプトのみで
全モーダルのタイトル行を統一できる想定です。

  アカポン（モーダル｜タイトル行ヘッダー共通・司令塔）
  akapon-unified-modal-header-master.user.js

しかし、ページごとに DOM 構造や既存 CSS で効き方が異なり、
Tampermonkey 側からは統一しきれない箇所があります。

その“例外的な見た目”を一時的に合わせるためだけに、
この -modal-difference.user.js を使っています。

◆ このスクリプトの位置づけ
- あくまで「デザイン確認用」の一時コードです。
- 本番システム側でこのコードを流用・組み込みしないでください。
- 実際の実装は、必ず司令塔スクリプト
  akapon-unified-modal-header-master.user.js 側で
  エンジニアが調整してください。

◆ 運用ルール
- ここのコードは“正解”ではなく、
  「こう見えてほしい」という参考デザインです。
- 挙動が異なるモーダルがあった場合も、
  司令塔側の実装で吸収してください。

◆ 依頼内容（アプリ本体側での修正をお願いします）
　❶　SPのファイル　＞メニューの文字サイズとアイコンサイズ、枠の高さの調整（全て2列）
  ❷　SPのファイル　＞メニュー　＞バージョンを更新する　の文字サイズとアイコンサイズ、枠の高さの調整｜アップロードされます⇒「アップロード」のみとし、右寄せ
  ❸　ファイルの保存先を変更ボタンだけCSSが違うので、他のボタンと同じCSSにしてください。
  ❹  以下の「校正」系モーダルにあるフッターの閉じるボタンをクリックした時
   modalが閉じないのがおかしいので、モーダルを閉じてください。

   対象モーダル：
   1) 「動画データを校正する」
   2）「オンラインコンテンツを校正する」※閉じるを追加
   3) 「WEBサイトのURLを校正する」
   4) 「画像またはPDFを校正する」

===========================================
*/

(function () {
  'use strict';

// ========================================================
// 【ページ名】プロジェクト作成（作成方法選択）
// 【目的】このモーダルだけ .tm-file-modal-header（メニュー）を表示しない
// 対象：#CreateProjectOptionsModal の .modal-content.bg-black
// ========================================================
injectCssOnce(
  'tm-modal-diff-hide-header-create-project-options',
  [
    '/* 作成方法選択モーダルだけ：タイトル行（tm-file-modal-header）を非表示 */',
    'html body #CreateProjectOptionsModal .modal-content.bg-black > .tm-file-modal-header{',
    '  display: none !important;',
    '}'
  ].join('\n')
);

function injectCssOnce(id, cssText) {
    var target = document.head || document.documentElement;

    var existing = document.getElementById(id);
    if (existing) {
      // 既存があれば内容更新
      existing.textContent = cssText;

      // ★末尾へ移動して「後勝ち」を保証
      if (existing.parentNode) existing.parentNode.removeChild(existing);
      target.appendChild(existing);
      return;
    }

    var style = document.createElement('style');
    style.id = id;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(cssText));
    target.appendChild(style);
  }

// ========================================================
// 【ページ名】現在のプラン（changePlan / 年額 / 月額 / 解約 / etc）
// 【目的】
// ❶ .modal-body-content.centered-content の border/shadow/radius を “このID群だけ” 強制で無効化
// ❷ 820×1180（iPad縦想定）で width:780px ＋ 中央寄せ
// ❸ 下記2枠に shadow を付与
//    - .plan-info（内側に .plan-info-title がいる枠）
//    - .team-name-input（チーム名入力＋更新ボタンの枠）
// ========================================================
injectCssOnce(
  'tm-modal-diff-current-plan-centered-content',
  [
    '/* 現在のプラン系モーダル：.centered-content の枠/影/角丸を無効化（このID群だけ） */',
    'html body #changePlanModal .modal-body-content.centered-content,',
    'html body #annualPaymentModal .modal-body-content.centered-content,',
    'html body #monthlyPaymentModal .modal-body-content.centered-content,',
    'html body #cancelSubscriptionModal .modal-body-content.centered-content,',
    'html body #showCompanyMemberModal .modal-body-content.centered-content,',
    'html body #handleConfirmPaymentMethodModal .modal-body-content.centered-content,',
    'html body #announcementSettingsModal .modal-body-content.centered-content,',
    'html body #introduceReportModal .modal-body-content.centered-content,',
    'html body #announcementSettingsConfirmModal .modal-body-content.centered-content,',
    'html body #billingInformationSettingsConfirmModal .modal-body-content.centered-content{',
    '  border: none !important;',
    '  box-shadow: none !important;',
    '  border-radius: 0 !important;',
    '}',

    '',
    '/* 820×1180想定：横幅780px＋中央寄せ（はみ出し防止） */',
    '@media (max-width: 820px) and (min-width: 768px){',
    '  html body #changePlanModal .modal-body-content.centered-content,',
    '  html body #annualPaymentModal .modal-body-content.centered-content,',
    '  html body #monthlyPaymentModal .modal-body-content.centered-content,',
    '  html body #cancelSubscriptionModal .modal-body-content.centered-content,',
    '  html body #showCompanyMemberModal .modal-body-content.centered-content,',
    '  html body #handleConfirmPaymentMethodModal .modal-body-content.centered-content,',
    '  html body #announcementSettingsModal .modal-body-content.centered-content,',
    '  html body #introduceReportModal .modal-body-content.centered-content,',
    '  html body #announcementSettingsConfirmModal .modal-body-content.centered-content,',
    '  html body #billingInformationSettingsConfirmModal .modal-body-content.centered-content{',
    '    width: 780px !important;',
    '    max-width: calc(100% - 40px) !important;',
    '    margin-left: auto !important;',
    '    margin-right: auto !important;',
    '    box-sizing: border-box !important;',
    '  }',
    '}',

    '',
    '/* ❷ shadow：plan-info（枠全体） ※検証で効いた指定に合わせる */',
    'html body #changePlanModal .plan-info,',
    'html body #annualPaymentModal .plan-info,',
    'html body #monthlyPaymentModal .plan-info,',
    'html body #cancelSubscriptionModal .plan-info,',
    'html body #showCompanyMemberModal .plan-info,',
    'html body #handleConfirmPaymentMethodModal .plan-info,',
    'html body #announcementSettingsModal .plan-info,',
    'html body #introduceReportModal .plan-info,',
    'html body #announcementSettingsConfirmModal .plan-info,',
    'html body #billingInformationSettingsConfirmModal .plan-info{',
    '  box-shadow: 0 10px 28px rgba(0, 0, 0, .28) !important;',
    '}',

    '',
    '/* ❷ shadow：team-name-input は「枠(div)」ではなく input(.form-control) に影を付ける（検証で効いた形） */',
    'html body #changePlanModal .team-name-input .form-control,',
    'html body #annualPaymentModal .team-name-input .form-control,',
    'html body #monthlyPaymentModal .team-name-input .form-control,',
    'html body #cancelSubscriptionModal .team-name-input .form-control,',
    'html body #showCompanyMemberModal .team-name-input .form-control,',
    'html body #handleConfirmPaymentMethodModal .team-name-input .form-control,',
    'html body #announcementSettingsModal .team-name-input .form-control,',
    'html body #introduceReportModal .team-name-input .form-control,',
    'html body #announcementSettingsConfirmModal .team-name-input .form-control,',
    'html body #billingInformationSettingsConfirmModal .team-name-input .form-control{',
    '  box-shadow: 0 10px 28px rgba(0, 0, 0, .28) !important;',
    '}',
    ''
  ].join('\\n')
);

/* CSSがどうしても負ける場合の最終手段：このID群だけ inline で潰す（1回だけ） */
function enforceCurrentPlanCenteredContentOnce() {
  var ids = [
    'changePlanModal',
    'annualPaymentModal',
    'monthlyPaymentModal',
    'cancelSubscriptionModal',
    'showCompanyMemberModal',
    'handleConfirmPaymentMethodModal',
    'announcementSettingsModal',
    'introduceReportModal',
    'announcementSettingsConfirmModal',
    'billingInformationSettingsConfirmModal'
  ];

  ids.forEach(function(id){
    var root = document.getElementById(id);
    if (!root) return;

    var cc = root.querySelector('.modal-body-content.centered-content');
    if (!cc) return;

    if (cc.dataset.tmCenteredContentFixed === '1') return;

    cc.style.border = 'none';
    cc.style.boxShadow = 'none';
    cc.style.borderRadius = '0';
    cc.dataset.tmCenteredContentFixed = '1';
  });
}

/* ✅ 追加：plan-info / team-name-input に “強制で” シャドーを入れる（CSS勝ち負け無関係） */
function enforceCurrentPlanShadowOnce() {
  var ids = [
    'changePlanModal',
    'annualPaymentModal',
    'monthlyPaymentModal',
    'cancelSubscriptionModal',
    'showCompanyMemberModal',
    'handleConfirmPaymentMethodModal',
    'announcementSettingsModal',
    'introduceReportModal',
    'announcementSettingsConfirmModal',
    'billingInformationSettingsConfirmModal'
  ];

  ids.forEach(function(id){
    var root = document.getElementById(id);
    if (!root) return;

    // ① plan-info（枠）
    var planInfo = root.querySelector('.plan-info');
    if (planInfo && planInfo.dataset.tmShadowFixed !== '1') {
      planInfo.style.border = 'none';  // ✅ border: 1px solid black; を確実に無効化
      planInfo.style.boxShadow = '0 10px 28px rgba(0, 0, 0, .28)';
      planInfo.dataset.tmShadowFixed = '1';
    }

    // ② team-name-input は “枠(div)” じゃなく “input(.form-control)” に影（あなたの検証通り）
    var teamInput = root.querySelector('.team-name-input .form-control');
    if (teamInput && teamInput.dataset.tmShadowFixed !== '1') {
      teamInput.style.border = 'none';        // ✅ 線（枠線）を消す
      teamInput.style.outline = 'none';       // ✅ フォーカス輪郭も消す（残る場合がある）
      teamInput.style.boxShadow = '0 10px 28px rgba(0, 0, 0, .28)';
      teamInput.dataset.tmShadowFixed = '1';
    }
  });
}

function runCurrentPlanFixes() {
  enforceCurrentPlanCenteredContentOnce();
  enforceCurrentPlanShadowOnce();
}

runCurrentPlanFixes();

/* モーダルはクリック後にDOMが差し替わるので、クリック後にもう一回当てる */
document.addEventListener('click', function(){
  setTimeout(runCurrentPlanFixes, 0);
});

/* さらに：モーダルDOMが後から挿入されても確実に当てる */
try {
  var mo = new MutationObserver(function(){
    runCurrentPlanFixes();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
} catch(e) {}


// ========================================================
// 【ページ名】外部メンバー（プラン制限）モーダル
// 【目的】このモーダルだけ：白背景・黒文字・ボタン反転＆デザイン強化
// ※ タイトル行（tm-file-modal-header）は共通scriptで対応済みなので触らない
// ========================================================
injectCssOnce(
  'tm-modal-diff-plan-limit-external-member',
  [
    /* --- モーダル本体：白背景・黒文字（ヘッダーは触らない） --- */
    'html body .modal .modal-content.tm-diff-plan-limit-external-member{',
    '  background: #fff !important;',
    '  color: #000 !important;',
    '}',

    /* --- 本文：黒文字＋読みやすい余白 --- */
    'html body .modal .modal-content.tm-diff-plan-limit-external-member .modal-body{',
    '  color: #000 !important;',
    '  padding: 18px 18px 22px 18px !important;',
    '}',

'html body .modal .modal-content.tm-diff-plan-limit-external-member .modal-body p{',
'  color: #000 !important;',
'  font-weight: 800 !important;',
'  line-height: 1.25 !important;',        // ← 行間を詰める（詰めすぎない）
'  max-width: none !important;',
'  width: 100% !important;',
'  white-space: nowrap !important;',
'  word-break: keep-all !important;',
'  overflow: hidden !important;',
'  text-overflow: ellipsis !important;',
'  text-align: center !important;',
'  margin: 0 0 6px 0 !important;',        // ← 段落間の余白を狭く
'}',

/* 2つ目の p.mb-3 の余白が広がるのを抑える */
'html body .modal .modal-content.tm-diff-plan-limit-external-member .modal-body p.mb-3{',
'  margin-bottom: 6px !important;',
'}',

    /* --- ボタン：色反転＋かっこよく（pill + shadow） --- */
    'html body .modal .modal-content.tm-diff-plan-limit-external-member .modal-body a.btn{',
    '  display: inline-flex !important;',
    '  align-items: center !important;',
    '  justify-content: center !important;',
    '  min-width: 220px !important;',
    '  height: 44px !important;',
    '  padding: 0 22px !important;',
    '  border-radius: 999px !important;',
    '  font-weight: 900 !important;',
    '  letter-spacing: .02em !important;',
    '  box-shadow: 0 10px 24px rgba(0,0,0,.18) !important;',
    '}',

/* 通常：黒背景＋白文字＋黒枠 */
'html body .modal .modal-content.tm-diff-plan-limit-external-member .modal-body a.btn.btn-primary{',
'  background: #000 !important;',
'  border: 2px solid #000 !important;',
'  color: #fff !important;',
'}',

/* hover：白背景＋黒文字（反転） */
'html body .modal .modal-content.tm-diff-plan-limit-external-member .modal-body a.btn.btn-primary:hover{',
'  background: #fff !important;',
'  border-color: #000 !important;',
'  color: #000 !important;',
'  transition: all .18s ease !important;',
'}',

    /* SP微調整 */
    '@media (max-width: 1023px){',
    '  html body .modal .modal-content.tm-diff-plan-limit-external-member .modal-body a.btn{',
    '    min-width: 200px !important;',
    '    height: 40px !important;',
    '    font-size: 0.95em !important;',
    '  }',
    '}'
  ].join('\n')
);

// --- 該当モーダルだけに class を付与（見た目差分対象の特定） ---
function markPlanLimitExternalMemberModal() {
  var modals = document.querySelectorAll('.modal .modal-content[data-tm-shadow-bound="1"]');
  if (!modals || !modals.length) return;

  modals.forEach(function(modal){
    if (modal.classList.contains('tm-diff-plan-limit-external-member')) return;

    // 「外部メンバー機能は、Standardプラン以上...」の文言で特定（このモーダルだけ）
    var p = modal.querySelector('.modal-body p.font-weight-bold');
    if (!p) return;

    var text = (p.textContent || '').replace(/\s+/g, '');
    if (text.indexOf('外部メンバー機能は') === -1) return;

    modal.classList.add('tm-diff-plan-limit-external-member');
  });
}

// モーダルはクリック後にDOMが組まれるので、クリックごとに軽く再判定（既存方針と同じ）
markPlanLimitExternalMemberModal();
document.addEventListener('click', function(){
  setTimeout(markPlanLimitExternalMemberModal, 0);
}, true);

  // ========================================================
  // 【ページ名】プロジェクト > 通知設定
  // 【場所】プロジェクト詳細画面の「通知設定」モーダルタイトル行
  //
  // 目的：
  //   - タイトル行を共通モーダルヘッダーと同じデザインに寄せる
  //   - 司令塔側の .tm-file-modal-header が効きにくいケースを
  //     一時的に上書きしてデザイン確認する
  // ========================================================

  // 見た目上書き用 CSS
  injectCssOnce(
    'tm-modal-diff-project-notify',
    [
      '/* プロジェクト > 通知設定｜タイトル行を共通デザインに寄せる（見た目差分用） */',
      'html body .modal .modal-content.tm-modal-theme-white .tm-file-modal-header.tm-diff-project-notify-header{',
      '  background: linear-gradient(90deg, #1e3c72, #2b2b2b) !important;',
      '  color: #fff !important;',
      '  padding: 10px 0px 10px 18px !important;',
      '  min-height: 44px !important;',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',   // ★ 横方向センター
      '  position: relative !important;',
      '  box-shadow: 0 10px 24px rgba(0,0,0,0.22) !important;',
      '}',
      'html body .modal .modal-content.tm-modal-theme-white .tm-file-modal-header.tm-diff-project-notify-header .tm-file-header-title{',
      '  margin: 0 auto !important;',
      '  text-align: center !important;',
      '}',
      'html body .modal .modal-content.tm-modal-theme-white .tm-file-modal-header.tm-diff-project-notify-header .tm-file-header-title-text{',
      '  color: #fff !important;',
      '  font-weight: 800 !important;',
      '}'
    ].join('\n')
  );

  // SP版ボタン高さ・文字サイズの見た目差分（確認用）
  injectCssOnce(
    'tm-modal-diff-sp-buttons',
    [
      '/* SP版：確認系モーダルのボタン高さと文字サイズを統一（見た目差分用） */',
      '@media (max-width: 1023px){',
      '  .confirm-submit-modal .btn, .akaire-popup .btn{',
      '    height: 26px !important;',
      '  }',
      '  .tm-modal-theme-white .btn.btn-primary{',
      '    font-size: 1.0em !important;',
      '  }',
      '}'
    ].join('\n')
  );



  // ========================================================
  // 【ページ名】プロジェクト > Status
  // 【場所】プロジェクト詳細画面の「Status を選択してください」モーダル内リスト
  //
  // 目的：
  //   - 4つの行の間隔をそろえる
  //   - 選択済み（active）はグレー線/グレー背景なし
  //   - 「（現在のステータス）」を赤にする
  //   - リストを少し左寄せ & 文字を大きく
  //   - SP 時はフォントサイズだけ少し抑える
  // ========================================================
  injectCssOnce(
    'tm-modal-diff-project-status',
    [
      '/* PC：ステータス一覧の配置 & 間隔 */',
      'html body .outer_status_newstyle .status_popup_sp{',
      '  width: 360px !important;',
      '  margin: 24px auto 40px auto !important;', // ★左右 auto で中央寄せ
      '  padding: 0 !important;',
      '  list-style: none !important;',
      '}',
      'html body .outer_status_newstyle .status_popup_sp .li-status{',
      '  padding: 8px 16px !important;',
      '  margin-bottom: 10px !important;',       // 4つの間隔
      '  font-size: 1.15em !important;',
      '}',
      '/* 選択済み行：グレー線/背景を消す */',
      'html body .outer_status_newstyle .status_popup_sp .li-status.active{',
      '  background: transparent !important;',
      '  border-color: transparent !important;',
      '}',
      '',
      '/* 「（現在のステータス）」だけ赤に */',
      'html body .outer_status_newstyle .status_popup_sp .li-status.active .current-status-text{',
      '  color: #e53935 !important;',
      '}',
      '',
      '@media (max-width: 1023px){',
      '  /* SP：左右余白を詰め、幅は画面に合わせる */',
      '  html body .outer_status_newstyle .status_popup_sp{',
      '    width: auto !important;',
      '    margin: 16px 16px 24px 16px !important;',
      '  }',
      '  /* SP：文字サイズは少しだけ小さめ */',
      '  html body .outer_status_newstyle .status_popup_sp .li-status{',
      '    font-size: 1.05em !important;',
      '  }',
      '}'
    ].join('\n')
  );

  // ========================================================
  // 【ページ名】プロジェクト > メニュー
  // 【場所】プロジェクト詳細画面の「プロジェクト○○ メニュー」モーダル
  //  - 権限一括設定 / ファイルを開く / プロジェクトを削除 の3行＋上部情報行
  //  - 司令塔側で統一しきれないSP表示を“見た目だけ”合わせるための差分
  // ========================================================
  injectCssOnce(
    'tm-modal-diff-project-menu',
    [
      '/* SP：プロジェクトメニュー内のカード間隔・作成者行レイアウト調整（見た目差分用） */',
      '@media (max-width: 1023px){',
      '  /* メニュー3行のカードを少しコンパクトに */',
      '  html body .modal-content.text-center .modal-body.outer_status_newstyle > .dropdown-item{',
      '    border-radius: 9px !important;',
      '    padding: 5px 10px !important;',
      '  }',
      '',
      '  /* 作成者行：名前周りを1行として見やすくする（省略記号を解除して幅を広げる） */',
      '  html body .modal-body.outer_status_newstyle .creator-line{',
      '    display: block !important;',
      '    white-space: normal !important;',
      '  }',
      '  html body .modal-body.outer_status_newstyle .creator-line .creator-name{',
      '    max-width: 100% !important;',
      '    text-overflow: clip !important;',
      '  }',
      '',
      '  /* 作成日：作成者行の下に改行して表示 */',
      '  html body .modal-body.outer_status_newstyle .created-at{',
      '    display: block !important;',
      '    margin-top: 2px !important;',
      '  }',
      '}'
    ].join('\n')
  );

  // ========================================================
  // 【ページ名】ファイル > メニュー
  // 【場所】ファイル詳細画面の「ファイル○○ メニュー」モーダル
  //  - SP時のみ、行の大きさ・アイコンサイズ・レイアウトを最適化
  //  - 画面幅があるSPでは2列、それ以外は1列で表示
  // ========================================================
injectCssOnce(
  'tm-modal-diff-file-menu-sp',
  [
    '@media (max-width: 1023px){',
    '  /* タイトル行（ファイル名＋メニュー）の文字とアイコンを少しだけ小さく */',
    '  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .title-modal-file-menu{',
    '    font-size: 1.0em !important;',
    '    padding: 6px 10px 8px !important;',
    '  }',
    '  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .title-modal-file-menu .menu-akaire-file-icon{',
    '    width: 18px !important;',
    '    height: 18px !important;',
    '  }',
    '',
    '  /* =====================================================',
    '     メニュー本体：2列（grid） + 余白を詰める',
    '     ===================================================== */',
    '  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left{',
    '    display: grid !important;',
    '    grid-template-columns: 1fr 1fr !important;',
    '    gap: 6px 8px !important;',
    '    padding: 6px 8px 10px !important;',
    '  }',
    '',
    '  /* 区切り線(hr)は全幅1行扱い */',
    '  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left > hr{',
    '    grid-column: 1 / -1 !important;',
    '    width: 100% !important;',
    '    margin: 6px 0 2px !important;',
    '  }',
    '',
    '  /* =====================================================',
    '     個々のメニュー行：高さを低めに（カード）',
    '     a.dropdown-item も div.dropdown-item も対象',
    '     ===================================================== */',
'  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left > a.dropdown-item,',
'  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left > div.dropdown-item{',
'    display: flex !important;',
'    align-items: center !important;',
'    box-sizing: border-box !important;',
'    /* ★ 低く */',
'    padding: 4px 8px !important;',
'    margin: 0 !important;',
'    border-radius: 10px !important;',
'    border: 1px solid #e0e0e0 !important;',
'    background: #fff !important;',
'    /* ★ 低く */',
'    min-height: 32px !important;',
'    font-size: 0.9em !important;',
'  }',
    '',
'  /* =====================================================',
'     1行目（保存先変更）も他と同じく2列の1セル扱いにする（全幅指定を削除）',
'     ===================================================== */',
'  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left > div.dropdown-item.d-flex.cursor-pointer{',
'    /* grid-column: 1 / -1 !important; */',
'  }',
    '',
    '  /* ❷ アイコン：width/height属性を上書き（全て小さく統一） */',
    '  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left img,',
    '  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left img[width],',
    '  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left img[height],',
    '  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left .description_icon,',
    '  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left .filter-black-icon,',
    '  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left .icon_black{',
    '    width: 18px !important;',
    '    height: 18px !important;',
    '    margin-right: 6px !important;',
    '    flex: 0 0 auto !important;',
    '  }',
    '',
'  /* テキスト全体のフォントサイズ（カード内） */',
'  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left > a.dropdown-item span,',
'  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left > div.dropdown-item span{',
'    font-size: 0.9em !important;',
'    margin-top: 3px !important;',
'  }',

'  /* 保存先だけさらに小さく（SP最終調整） */',
'  html body [id^="modalMenu-"].modal ',
'  .modal-content.text-center ',
'  .modal-body[data-tm-file-menu-scroll-bound="1"] ',
'  .text-left ',
'  .change-name-akaire-file ',
'  .text-show-akaire-file-position{',
'    font-size: 0.65em !important;',
'    margin-left: 2px !important;',
'  }',

'  /* SP：メニュー内アイコンを15pxに統一 */',
'  html body [id^="modalMenu-"].modal ',
'  .modal-content.text-center ',
'  .modal-body > .text-left > .dropdown-item img{',
'    width: 15px !important;',
'    height: 15px !important;',
'  }',

'  /* SP：例外（メンバー招待アイコン） */',
'  html body [id^="modalMenu-"].modal ',
'  .modal-content.text-center ',
'  .modal-body > .text-left > .dropdown-item img[src*="pic_ids_member"]{',
'    width: 17px !important;',
'    height: 12px !important;',
'  }',

'  /* SP：例外（ゴミ箱アイコン） */',
'  html body [id^="modalMenu-"].modal ',
'  .modal-content.text-center ',
'  .modal-body > .text-left > .dropdown-item img[src*="trash3"]{',
'    width: 12px !important;',
'    height: 17px !important;',
'  }',

'  /* SP：枠（角丸＋高さ） */',
'  html body [id^="modalMenu-"].modal ',
'  .modal-content.text-center ',
'  .modal-body > .text-left > .dropdown-item{',
'    border-radius: 8px !important;',
'    min-height: 30px !important;',
'    height: 30px !important;',
'  }',

'}',
    '',
    '/* 画面がかなり狭いSPでは1列表示にフォールバック */',
    '@media (max-width: 480px){',
    '  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left{',
    '    display: block !important;',
    '  }',
    '  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left > a.dropdown-item,',
    '  html body .modal-body[data-tm-file-menu-scroll-bound="1"] .text-left > div.dropdown-item{',
    '    width: 100% !important;',
    '  }',
    '}'
  ].join('\n')
);

  // ========================================================
  // 【ページ名】バージョンを更新する
  // 【場所】「Ver XX にアップロードされます。」表示行
  //
  // 目的：
  //  - .col-7 の flex 固定（58.333%）のせいで右に寄って見切れているため、
  //    このモーダル内のカウント表示だけ col-7 の制約を解除して全文見えるようにする
  // ========================================================
  injectCssOnce(
    'tm-modal-diff-version-update',
    [
      '/* 「Ver XX にアップロードされます。」の幅を広げて全文見えるようにする（見た目差分用） */',
      'html body .modal-content[data-tm-shadow-bound="1"] .select-page-box .current-page .count-total-version-view,',
      'html body .modal-content[data-tm-shadow-bound="1"] .select-page-box .current-page .count-total-version{',
      '  flex: 0 0 auto !important;',      // col-7 の 58.333% 固定を解除
      '  max-width: none !important;',
      '  width: auto !important;',
      '  text-align: right !important;',   // ★ 左寄せ → 右寄せに変更
      '  white-space: normal !important;',
      '}',
      '',
      '/* 矢印「>」＋ Ver XX をバー右端に寄せる */',
      'html body .modal-content[data-tm-shadow-bound="1"] .select-page-box .current-page > .col-1{',
      '  margin-left: auto !important;',  // ここから右側の要素を右端へ押し出す
      '  text-align: right !important;',
      '}',
      '',
      '@media (max-width: 1023px){',
      '  /* SP：バージョン更新モーダル内のタイトル行＆選択肢の文字・アイコンを少し小さく（見た目差分用） */',
      '  html body .modal-content[data-tm-shadow-bound="1"] .select-page-box .select-type-upload,',
      '  html body .modal-content[data-tm-shadow-bound="1"] .select-page-box .create-akaire-box-content a{',
      '    font-size: 0.9em !important;',
      '  }',
      '  html body .modal-content[data-tm-shadow-bound="1"] .select-page-box .create-akaire-box-content img.create-akaire-box-icon-upload{',
      '    width: 32px !important;',
      '    height: 32px !important;',
      '  }',
      '  /* SP：Ver XX 表示テキストも少しだけ小さく */',
      '  html body .modal-content[data-tm-shadow-bound="1"] .select-page-box .current-page .count-total-version-view,',
      '  html body .modal-content[data-tm-shadow-bound="1"] .select-page-box .select-page .count-total-version{',
      '    font-size: 0.9em !important;',
      '  }',
      '}'
    ].join('\n')
  );

  // ========================================================
  // 【ページ名】バージョンを更新する（SP専用テキスト調整）
  //  - 「Ver XX にアップロードされます。」の末尾「されます」を SP のみ削除
  // ========================================================
  function tmAdjustVersionUploadTextForSp(){
    if (window.innerWidth > 1023) return;

    var nodes = document.querySelectorAll(
      'html body .modal-content[data-tm-shadow-bound="1"] .select-page-box .count-total-version,' +
      'html body .modal-content[data-tm-shadow-bound="1"] .select-page-box .count-total-version-view'
    );

    if (!nodes || !nodes.length) return;

    var each = nodes.forEach ? nodes.forEach.bind(nodes) : function(cb){
      Array.prototype.forEach.call(nodes, cb);
    };

    each(function(el){
      if (!el || typeof el.textContent !== 'string') return;
      var text = el.textContent;
      var replaced = text.replace(/されます。?/g, '');
      if (replaced !== text){
        el.textContent = replaced;
      }
    });
  }

  // 「ページ選択」周りを触ったタイミングで SP 用テキストを調整
  document.addEventListener('click', function(ev){
    var target = ev.target;
    if (!target || !target.closest) return;
    if (!target.closest('.modal-content[data-tm-shadow-bound="1"] .select-page-box')) return;
    setTimeout(tmAdjustVersionUploadTextForSp, 0);
  });

  // 初回表示時にも一度だけ調整
  document.addEventListener('DOMContentLoaded', tmAdjustVersionUploadTextForSp);

  // ========================================================
  // 【ページ名】ファイル > 期限（.modal_expiration_task）
  //
  // ❶ コンテンツをヘッダーから十分下げる
  // ❷ PC/SP の文字サイズを調整
  // ❸ 更新・Reset ボタンのサイズ＆色を統一
  // ❹ 余計なシャドーを削除してシンプルに
  // ========================================================
  injectCssOnce(
    'tm-modal-diff-file-expiration',
    [
      '/* コンテナをヘッダーから下にずらし、シャドーを削除 */',
      'html body .modal_expiration_task .modal-content .container-new{',
      '  padding: 75px 20px 24px 20px !important;',  // 検証でちょうど良かった値',
      '  box-shadow: none !important;',
      '  border-radius: 16px !important;',
      '}',

      '/* PC / SP 共通：期限モーダル内の文字サイズ＆太さ（PC基準） */',
      'html body .modal_expiration_task .expiration_outer,',
      'html body .modal_expiration_task .expiration_outer label,',
      'html body .modal_expiration_task .expiration_outer .input_outer,',
      'html body .modal_expiration_task .task_color,',
      'html body .modal_expiration_task .align-center-div{',
      '  font-size: 0.9em !important;',  // PCではこのサイズ',
      '  font-weight: 700 !important;',
      '}',

      '/* ボタンブロック全体：角丸だけ残し、シャドーは付けない（影はボタンのみ） */',
      'html body .modal_expiration_task .text-center.align-center-div{',
      '  border-radius: 12px !important;',
      '  overflow: hidden !important;',
      '  margin: 15px auto !important;',
      '  box-shadow: none !important;',   // コンテナのシャドーは消す',
      '}',

      '/* 更新 / Reset ボタン共通デザイン（PC基準） */',
      'html body .modal_expiration_task .align-center-div .set-expiration-date.btn{',
      '  min-width: 120px !important;',
      '  height: 40px !important;',
      '  line-height: 40px !important;',
      '  padding: 0 26px !important;',
      '  border-radius: 999px !important;',
      '  font-size: 1.2em !important;',
      '  font-weight: 700 !important;',
      '  box-shadow: 0 6px 18px rgba(0, 0, 0, .25) !important;',
      '}',

      '/* 更新ボタン：黒ベース */',
      'html body .modal_expiration_task .align-center-div .set-expiration-date.btn-primary{',
      '  background: #000 !important;',
      '  border-color: #000 !important;',
      '  color: #fff !important;',
      '}',

      '/* Resetボタン：ダークグレー系でシックに */',
      'html body .modal_expiration_task .align-center-div .set-expiration-date.btn-danger{',
      '  background: #455a64 !important;',   // ブルーグレー',
      '  border-color: #455a64 !important;',
      '  color: #fff !important;',
      '}',

      '/* ボタン行の余白調整：上の余白を少なめに */',
      'html body .modal_expiration_task .align-center-div.text-center.pt-3{',
      '  margin-top: 5px !important;',
      '  padding-bottom: 18px !important;',
      '}',

      '/* =============================',
      '   SP版専用の細かい調整',
      '   - ラベル文字を少し大きく',
      '   - 日付入力枠／カレンダーアイコン／カラー枠の高さをコンパクトに',
      '   - ボタンサイズ＆文字サイズを少し小さめに',
      '   ============================= */',
      '@media (max-width: 1023px){',
      '  /* ラベル＆行全体の文字：SPはやや大きめに */',
      '  html body .modal_expiration_task .expiration_outer,',
      '  html body .modal_expiration_task .expiration_outer label,',
      '  html body .modal_expiration_task .expiration_outer .input_outer,',
      '  html body .modal_expiration_task .task_color,',
      '  html body .modal_expiration_task .align-center-div{',
      '    font-size: 1.2em !important;',


      '  }',
      '',
      '  /* 日付入力枠の高さを抑える */',
      '  html body .modal_expiration_task .expiration_outer .input_outer input,',
      '  html body .modal_expiration_task .expiration_outer .input_outer .form-control{',
      '    height: 32px !important;',
      '    line-height: 32px !important;',
      '    padding-top: 2px !important;',
      '    padding-bottom: 2px !important;',
      '  }',
      '',
      '  /* 枠内カレンダーアイコンを小さく */',
      '  html body .modal_expiration_task .expiration_outer .input_outer img,',
      '  html body .modal_expiration_task .expiration_outer .input_outer svg{',
      '    width: 18px !important;',
      '    height: 18px !important;',
      '  }',
      '',
      '  /* カラー選択ボックス枠＋色ブロックの高さ調整 */',
      '  .modal_expiration_task .modal-content .container-new .modal-body .expiration_outer .color_bg_outer{',
      '    height: 31px !important;',
      '    min-height: 31px !important;',
      '  }',
      '  .modal_expiration_task .modal-content .container-new .modal-body .expiration_outer .color_bg_outer .color_bg{',
      '    height: 31px !important;',
      '  }',
      '',
      '  /* SP時：更新／Reset ボタンを一回り小さく */',
      '  html body .modal_expiration_task .align-center-div .set-expiration-date.btn{',
      '    min-width: 100px !important;',
      '    height: 30px !important;',
      '    line-height: 30px !important;',
      '    padding: 0 20px !important;',
      '    font-size: 0.8em !important;',
      '  }',
      '}'
    ].join('\n')
  );

  // --------------------------------------------------------
  // SP：オンラインコンテンツ選択モーダル（capture-url / gdrive 削除）
  //  - タイトル行と選択ボックスの見た目を調整
  // --------------------------------------------------------
  injectCssOnce(
    'tm-modal-diff-capture-sp',
    [
      '@media (max-width: 1023px){',
      '  /* 「下記より、校正するオンラインコンテンツを選択してください。」の行 */',
      '  #capture-url-select .box-mobile .additional-akaire-title-block,',
      '  #gdrive-file-deleted .box-mobile .additional-akaire-title-block{',
      '    font-size: 1.1em !important;',
      '  }',
      '',
      '  /* SP時の選択ボックス（カード） */',
      '  #capture-url-select .google-option-box.mobile,',
      '  #gdrive-file-deleted .google-option-box.mobile{',
      '    box-shadow: 0px 3px 6px #000000 !important;',
      '    padding: 7px 8px 12px 8px !important;',
      '    border-radius: 10px !important;',
      '  }',
      '}'
    ].join('\n')
  );

  // --------------------------------------------------------
  // プロジェクト > メンバー（#popupInviteMember）
  // ページネーションの見た目だけを「ファイルの保存先を変更」風に寄せる
  //  ※ 挙動（クリック処理）はサーバ側 / 既存JSに任せる
  // --------------------------------------------------------
  injectCssOnce(
    'tm-modal-diff-project-member-pagination',
    [
      '/* プロジェクト > メンバー（#popupInviteMember）ページネーション見た目調整',
      '   - 「ファイルの保存先を変更」モーダルのページネーションを参考にしたサンプル */',
      '#popupInviteMember .pagination{',
      '  margin-top: 6px !important;',
      '  padding: 0 12px 10px 12px !important;',
      '  display: flex !important;',
      '  justify-content: center !important;',
      '  background: #fff !important;',
      '  list-style: none !important;',
      '}',
      '#popupInviteMember .pagination .pagy-border-style{',
      '  display: flex !important;',
      '  gap: 8px !important;',
      ' margin: 0 0 0 auto !important;',
      '  padding: 0 !important;',
      '  border: none !important;',
      '  background: transparent !important;',
      '  box-shadow: 0 0px 0px rgba(0, 0, 0, 0.00) !important;',
      '}',
      '#popupInviteMember .pagination .page-item{',
      '  margin: 0 !important;',
      '}',
      '#popupInviteMember .pagination .page-item a.page-link{',
      '  width: 34px !important;',
      '  height: 34px !important;',
      '  border-radius: 8px !important;',
      '  border: 2px solid #1e3c72 !important;',
      '  background: #fff !important;',
      '  color: #1e3c72 !important;',
      '  font-weight: 900 !important;',
      '  line-height: 1 !important;',
      '  display: inline-flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  padding: 0 !important;',
      '}',
      '#popupInviteMember .pagination .page-item.active a.page-link{',
      '  background: #1e3c72 !important;',
      '  color: #fff !important;',
      '}',
      '#popupInviteMember .pagination .page-item.prev,',
      '#popupInviteMember .pagination .page-item.next{',
      '  display: none !important;',
      '}'
    ].join('\n')
  );

  // --------------------------------------------------------
  // 全モーダル共通：角丸を 16px に（見た目差分用）
  // プロジェクト > メニュー / 通知設定 / Status などもここで丸める
  // --------------------------------------------------------
  injectCssOnce(
    'tm-modal-diff-border-radius',
    [
      '.modal-dialog .modal-content{',
      '  border-radius: 16px !important;',
      '}'
    ].join('\n')
  );

  // 「通知設定」モーダルのヘッダーにだけクラスを付与する
  function markProjectNotifyHeader() {
    var headers = document.querySelectorAll(
      '.modal-content.tm-modal-theme-white .tm-file-modal-header'
    );
    if (!headers.length) return;

    headers.forEach(function (header) {
      if (header.dataset.tmDiffMarked === '1') return;

      var titleEl = header.querySelector('.tm-file-header-title-text');
      if (!titleEl) return;

      var text = (titleEl.textContent || '').replace(/\s+/g, '');
      if (text !== '通知設定') return; // 他モーダルとは区別する

      header.classList.add('tm-diff-project-notify-header');
      header.dataset.tmDiffMarked = '1';
    });
  }

  // 初期実行
  markProjectNotifyHeader();

  // モーダルはクリック後にDOMが組まれることが多いので、
  // クリックのたびに“次のtick”で再判定しておく（軽量）
  document.addEventListener(
    'click',
    function () {
      setTimeout(markProjectNotifyHeader, 0);
    },
    true
  );

injectCssOnce(
  'tm-modal-diff-notify-setting',
  [
    /* ===============================
       テキストブロック中央配置
       =============================== */
    '.modal-dialog p{',
    '  line-height: 1.5 !important;',
    '  font-size: 0.95em !important;',
    '}',

    '.modal-content[data-tm-shadow-bound="1"] .modal-body.text-center p{',
    '  max-width: 420px !important;',
    '  margin: 20px auto !important;',   // ← 中央へ
    '  text-align: left !important;',    // ← ブロック内左寄せ
    '}',

    /* 今後表示させない */
    '.modal-content[data-tm-shadow-bound="1"] .setting-show-again_group label{',
    '  font-size: 0.85em !important;',
    '}',

    /* ===============================
       OKボタン最適化
       =============================== */
'.modal-content[data-tm-shadow-bound="1"] .submit-update-status{',
'  height: 33px !important;',
'  padding: 0 18px 2px 18px !important;',  // ← 下に少し余白
'  border-radius: 6px !important;',
'  font-weight: 700 !important;',
'  line-height: 30px !important;',         // ← 中央寄りで少し下げる
'  transition: all .2s ease !important;',
'}',

'.modal-content[data-tm-shadow-bound="1"] .submit-update-status:hover{',
'  background: #fff !important;',
'  color: #1e3c72 !important;',
'  border: 2px solid #1e3c72 !important;',
'}',

'@media (max-width:1023px){',
'  .modal-content[data-tm-shadow-bound="1"] .submit-update-status{',
'    height: 30px !important;',
'    font-size: .85em !important;',
'    line-height: 25px !important;',
'  }',
'}',

    /* ===============================
       SP調整
       =============================== */
    '@media (max-width: 1023px){',

    '  .modal-dialog p{',
    '    font-size: 0.9em !important;',
    '  }',

    '  .modal-content[data-tm-shadow-bound="1"] .modal-body.text-center p{',
    '    max-width: 90% !important;',
    '    margin: 18px auto !important;',
    '  }',

    '  .modal-content[data-tm-shadow-bound="1"] .submit-update-status{',
    '    height: 25px !important;',
    '    min-width: 60px !important;',
    '    font-size: 0.85em !important;',
    '  }',

    '  .modal-content[data-tm-shadow-bound="1"] .setting-show-again_group label{',
    '    font-size: 0.8em !important;',
    '  }',

    '}'
  ].join('\n')
);

injectCssOnce(
  'tm-modal-diff-notify-bullet',
  [
    /* 箇条書き風にする（JS使わない） */
    '.modal-content[data-tm-shadow-bound="1"] .modal-body.text-center p{',
    '  max-width: 480px !important;',
    '  margin: 20px auto !important;',
    '  text-align: left !important;',
    '}',

    /* 各行の先頭に「・」を付ける */
    '.modal-content[data-tm-shadow-bound="1"] .modal-body.text-center p br{',
    '  display: block;',
    '  content: "";',
    '}',

    '.modal-content[data-tm-shadow-bound="1"] .modal-body.text-center p{',
    '  white-space: normal !important;',
    '}',

  ].join('\n')
);

injectCssOnce(
  'tm-modal-diff-notify-button-width',
  [
    '.modal-content[data-tm-shadow-bound="1"] .submit-update-status{',
    '  min-width: 90px !important;',
    '  width: auto !important;',
    '}',

    /* Bootstrap col-2 幅固定を解除 */
    '.modal-content[data-tm-shadow-bound="1"] .submit-update-status.col-2{',
    '  flex: 0 0 auto !important;',
    '  max-width: none !important;',
    '}'
  ].join('\n')
);

  // --------------------------------------------------------
  // ❶ 箇条書き化 ＆ ❷ <br>追加
  // --------------------------------------------------------
  function adjustNotifyModalText(){
    var modal = document.querySelector(
      '.modal-content[data-tm-shadow-bound="1"] .modal-body.text-center p'
    );
    if (!modal) return;

    var text = modal.innerHTML;

    // 既に処理済みなら何もしない
    if (text.indexOf('・赤入れファイルの通知をOFFにします。') !== -1) return;
  }

  // モーダル表示時に再調整
  document.addEventListener('click', function(){
    setTimeout(adjustNotifyModalText, 0);
  }, true);

  // 初回
  adjustNotifyModalText();

// ========================================================
// 通知設定モーダル：ON/OFF文言切り替え（安全版）
// ========================================================
function adjustNotifyTextByState(){

  var modal = document.querySelector(
    '.modal-content[data-tm-shadow-bound="1"]'
  );
  if (!modal) return;

  var p = modal.querySelector('.modal-body p');
  if (!p) return;

  // 現在の状態を取得（OKボタンの引数を見る）
  var btn = modal.querySelector('.submit-update-status');
  if (!btn) return;

  var isCurrentlyOn = btn.getAttribute('onclick').indexOf('false') !== -1;
  // false を渡している＝今は ON 状態

  if (isCurrentlyOn) {

    // ---- ON状態 → OFFに変更確認 ----
    p.innerHTML =
      '・ファイルの通知をOFFにします。<br>' +
      '・ファイルのメンバー一覧から非表示になります。<br>' +
      '・チャットやコメント権限がOFFになります。<br>' +
      '・閲覧権限は残ります。<br><br>' +
      'OFFに変更してよろしいですか？';

  } else {

    // ---- OFF状態 → ONに変更確認 ----
    p.innerHTML =
      '・ファイルの通知をONにします。<br>' +
      '・トークメンバーに表示され、トーク権限がONになります。<br><br>' +
      'ONにしてよろしいですか？';
  }
}

// モーダル表示時
document.addEventListener('click', function(){
  setTimeout(adjustNotifyTextByState, 0);
}, true);

// 初回
adjustNotifyTextByState();

      // ========================================================
  // 【Statusモーダル統一処理】
  // ❶ active行に（現在のステータス）を付与
  // ❷ タイトル内の「Status」を「ステータス」に統一
  // ========================================================

function unifyStatusModal() {
  // =====================================================
  // 変更点：
  // ① data-tm-shadow-bound=1 のモーダルだけでなく
  //    「表示中のモーダル（.modal.show）」も拾う
  // ② /all_akaire_files の SP ステータスモーダル（.modal-file-name がある方）は
  //    data-tm-shadow-bound=1 を付けてから、既存処理を効かせる
  // =====================================================

  var list = [];

  // 既存対象（司令塔対象）
  document.querySelectorAll('.modal-content[data-tm-shadow-bound="1"]').forEach(function(m){
    list.push(m);
  });

  // 追加対象：表示中のモーダル（対象外モーダルを拾うため）
  document.querySelectorAll('.modal.show .modal-content').forEach(function(m){
    if (list.indexOf(m) === -1) list.push(m);
  });

  if (!list.length) return;

  list.forEach(function(modal){

    // ✅ 全ファイルSPのステータス選択モーダルを対象に含める
    // （あなたが貼った DOM：.modal-file-name がある / ul.status_popup_sp がある）
    try{
      var p = location.pathname || '';
      var isAllFiles = (p === '/all_akaire_files' || p.indexOf('/all_akaire_files/') === 0);
      var isSp = (window.innerWidth <= 1023);

      if (isAllFiles && isSp) {
        var hasStatusList = !!modal.querySelector('ul.status_popup_sp');
        var hasFileName = !!modal.querySelector('.modal-file-name');
        var isFileInfo = !!modal.querySelector('.file-info-name, .status_popup_sp.my-3');

        if (hasStatusList && hasFileName && !isFileInfo) {
          // 司令塔CSS/処理対象に入れる
          modal.setAttribute('data-tm-shadow-bound', '1');

          // 既存の modal-header を隠し、tm-file-modal-header を作る（無ければ）
          var nameEl = modal.querySelector('.modal-file-name');
          var fileName = nameEl ? (nameEl.textContent || '').trim() : '';

          if (fileName) {
            var tmHeader = modal.querySelector(':scope > .tm-file-modal-header');
            if (!tmHeader) {
              tmHeader = document.createElement('div');
              tmHeader.className = 'tm-file-modal-header';
              tmHeader.innerHTML =
                '<a href="javascript:void(0)" class="text-underline text-black back-text-link tm-file-header-back-btn" data-tm-file-header-back="1">戻る</a>' +
                '<div class="tm-file-header-title">' +
                  '<span class="tm-file-header-title-text"></span>' +
                '</div>';
              modal.insertBefore(tmHeader, modal.firstChild);
            }

            var titleEl = tmHeader.querySelector('.tm-file-header-title-text');
            if (titleEl) titleEl.textContent = fileName + ' のステータスを選択してください';

            var origHeader = modal.querySelector(':scope > .modal-header');
            if (origHeader) origHeader.style.display = 'none';
          }
        }
      }
    }catch(e){}

    // -----------------------------
    // ❷ タイトル文言を統一（既存処理そのまま）
    // -----------------------------
    var title = modal.querySelector('.tm-file-header-title-text');
    if (title && title.textContent.indexOf('Status') !== -1) {
      title.textContent = title.textContent.replace(/Status/g, 'ステータス');
    }

    var subTitle = modal.querySelector('.default-project-name');
    if (subTitle && subTitle.textContent.indexOf('Status') !== -1) {
      subTitle.textContent = subTitle.textContent.replace(/Status/g, 'ステータス');
    }

    // -----------------------------
    // ❶ active行に現在表示を付与（既存処理そのまま）
    // -----------------------------
    var active = modal.querySelector('.outer_status_newstyle .li-status.active');
    if (!active) return;

    if (active.querySelector('.current-status-text')) return;

    var span = document.createElement('span');
    span.className = 'current-status-text';
    span.textContent = '（現在のステータス）';
    span.style.marginLeft = '8px';
    span.style.fontWeight = '800';

    active.appendChild(span);
  });
}

  // 初回
  unifyStatusModal();

  // モーダル表示のたびに再判定
  document.addEventListener('click', function(){
    setTimeout(unifyStatusModal, 0);
  }, true);

  // ========================================================
  // 【共通】モーダルタイトル末尾の「×/✕」だけ削除
  // - 対象：.tm-file-header-title-text
  // - 末尾に付く場合のみ削除（文中の×は触らない）
  // ========================================================
  function sanitizeModalHeaderTitleX(){
    var titles = document.querySelectorAll(
      '.modal.show .tm-file-modal-header .tm-file-header-title-text,' +
      '.modal-content[data-tm-shadow-bound="1"] .tm-file-modal-header .tm-file-header-title-text'
    );
    if (!titles || !titles.length) return;

    titles.forEach(function(el){
      if (!el || typeof el.textContent !== 'string') return;
      var t = el.textContent;

      // 末尾だけ削除（例：「ファイル4 情報 ×」→「ファイル4 情報」）
      var cleaned = t.replace(/\s*[×✕]\s*$/g, '');
      if (cleaned !== t) el.textContent = cleaned;
    });
  }

  // クリック後にDOMが組まれる系が多いので、既存方針に合わせて軽く追従
  document.addEventListener('click', function(){
    setTimeout(sanitizeModalHeaderTitleX, 0);
  }, true);

  // 念のため初回も実行
  sanitizeModalHeaderTitleX();

})();
