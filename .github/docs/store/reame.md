# Chrome Web Store: アイテム概要メモ

## どこで入力するか

Chrome Web Store Developer Dashboard の対象アイテム編集画面で入力する。

- `ストア掲載情報 (Store listing)` を開く
- `アイテム概要 / Short description` に入力する（一覧や検索結果で主に見える短文）
- あわせて `詳細説明 / Description` も入力する

## アイテム概要に入れるべき内容

概要は短く、以下を1文で伝えるのが良い。

- 何をする拡張か（現在タブの情報をコピー）
- 何形式をサポートするか（Plain / Markdown）
- どんな場面で便利か（ドキュメント、Issue、PR、チャット）

避ける内容:

- 誇張表現（No.1 など）
- 実際にない機能（自動投稿、クラウド同期など）
- 長すぎる説明

## 提案文（日本語）

### アイテム概要（短文）

現在のタブのタイトルとURLをワンクリックでコピー。Plain text と Markdown リンク形式に対応します。

### 詳細説明（貼り付け用）

CopyTabLink Copy は、現在開いているページのタイトルと URL をすばやくコピーする Chrome 拡張です。

- ツールバーアイコンからコピー
- キーボードショートカットでコピー
- コンテキストメニューからコピー
- Plain text / Markdown リンクの2形式を切り替え可能

ブログ執筆、技術メモ、Issue / Pull Request、チャットでのリンク共有を素早く行えます。

## 提案文（英語）

### Short description

Copy the current tab title and URL in one click. Supports both plain text and Markdown link formats.

### Detailed description

CopyTabLink Copy helps you quickly copy the current page title and URL.

- Copy from the toolbar action
- Copy with keyboard shortcuts
- Copy from the context menu
- Choose plain text or Markdown link output

Great for writing docs, technical notes, issues, pull requests, and chat messages.

## 審査用: 権限を使う理由（実際の利用内容）

この拡張は、ユーザー操作（ツールバークリック / ショートカット / コンテキストメニュー）を起点に、現在タブのタイトルと URL を取得してクリップボードへコピーするために以下の権限を使用します。

- `activeTab`:
  - ユーザーが拡張を実行した「現在のタブ」に限定してアクセスするため。アクティブタブのタイトル/URL取得、およびコピー完了トースト表示対象タブの特定で利用。
- `scripting`:
  - コピー完了/失敗の通知をページ上に表示するため、必要時に content script を実行。
- `tabs`:
  - 現在アクティブなタブ情報（tabId, title, url）を問い合わせるため。コピー対象ページ情報の組み立てに利用。
- `offscreen`:
  - Service Worker 環境で安定してクリップボード書き込みを行うため、offscreen document を利用。
- `clipboardWrite`:
  - 生成したテキスト（Plain / Markdown）をクリップボードへ保存するため。
- `contextMenus`:
  - 右クリックメニューから「現在ページ情報をコピー」操作を提供するため。

### リモートコードについて

- 本拡張はリモートコードを使用していません。
- 実行されるコードはすべて拡張パッケージ内に同梱されたローカルファイルのみです。
- 外部サーバーから JavaScript を取得して実行する処理（`fetch` でスクリプト取得、`eval`、`importScripts` など）は実装していません。

## 審査用: データ使用（Data usage）

### 結論

- 現在および今後の予定として、ユーザーデータを収集しません（No data collected）。

### フォーム項目ごとの回答

以下のカテゴリはすべて「収集しない」

- 個人を特定できる情報
- 健康に関する情報
- 財務状況や支払いに関する情報
- 認証に関する情報
- 個人的コミュニケーション
- 位置情報
- ウェブ履歴
- ユーザーのアクティビティ
- ウェブサイトのコンテンツ

### 補足説明（審査担当向け）

拡張機能は、ユーザーが明示的に実行したときだけ現在タブの `title` と `url` を一時的に取得し、ユーザー端末上のクリップボードへ書き込みます。
取得したデータを外部へ送信する通信処理はありません。取得したデータを永続保存する処理（`chrome.storage`、`localStorage`、`indexedDB` など）はありません。したがって、データカテゴリの「収集」には該当しません。
