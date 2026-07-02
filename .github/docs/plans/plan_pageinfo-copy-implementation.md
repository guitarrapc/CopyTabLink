# CopyTabLink Copy 実装計画

## 1. 目的

現在開いている Web ページのタイトルと URL を、以下の操作でクリップボードへコピーする Chrome 拡張を実装する。

- ツールバーアイコンのクリック
- `Alt+C`（Plain text）
- `Alt+Shift+C`（Markdown）

本計画は、TypeScript + Manifest V3 を前提に、将来の MV 変更影響を最小化できる構成で進める。

## 2. 実装方針

### 2.1 技術スタック

- 言語: TypeScript
- ビルド成果物: `dist/`
- Manifest: V3
- E2E: Playwright（拡張を unpacked でロード）

### 2.2 UI 方針

- v1 は popup を作らない
- 実行トリガーは action click と commands のみ

### 2.3 設計方針（adapter/core 分離）

- `core`:
  - フォーマット整形・正規化など純関数ロジック
  - `chrome.*` 非依存
- `adapters/chrome`:
  - tabs / scripting / commands / offscreen / messaging など API 呼び出し
- `background`:
  - command/action の受信、use case の組み立て

この分離により、Manifest や Chrome API の変更時は adapter 層への局所修正を基本とする。

## 3. 予定ファイル構成

```text
copytablink-copy-extension/
  manifest.json
  tsconfig.json
  package.json
  src/
    background/index.ts
    core/
      pageInfo.ts
      formatters/plain.ts
      formatters/markdown.ts
    adapters/chrome/
      tabs.ts
      scripting.ts
      clipboard.ts
      commands.ts
  offscreen.html
  src/offscreen.ts
  tests/
    unit/
    e2e/
```

## 4. 実装ステップ

### Step 1: TypeScript プロジェクト初期化

- `package.json` を作成
- `tsconfig.json` を追加
- `src/` と `tests/` を作成
- ビルド成果物を `dist/` に出力

### Step 2: manifest の定義

`manifest.json` に以下を定義する。

- `manifest_version: 3`
- `background.service_worker`（ビルド後パス）
- `permissions`: `activeTab`, `scripting`, `tabs`, `offscreen`, `clipboardWrite`
- `commands`:
  - `copy-plain` (`Alt+C`)
  - `copy-markdown` (`Alt+Shift+C`)
- `action.default_title`

### Step 3: background エントリポイント実装

`src/background/index.ts` で以下を実装する。

- `chrome.action.onClicked` で plain コピーを実行
- `chrome.commands.onCommand` で command ごとに formatter を切り替え
- active tab 取得 → page info 取得 → format → clipboard write

### Step 4: core 実装

`src/core/` に純関数として実装する。

- `pageInfo` の型定義
- plain formatter
- markdown formatter
- 必要に応じて URL 正規化やタイトル正規化

### Step 5: adapter 実装

`src/adapters/chrome/` に Chrome API 呼び出しを集約する。

- `tabs.ts`: active tab 取得
- `scripting.ts`: ページ情報読み取り
- `clipboard.ts`: offscreen 作成確認とメッセージ送信
- `commands.ts`: command 名の定数と判定

### Step 6: offscreen 実装

- `offscreen.html` と `src/offscreen.ts` を追加
- `copy-to-clipboard` メッセージ受信で `navigator.clipboard.writeText()` 実行
- 応答 `{ ok: true | false, error?: string }` を返す

### Step 7: Unit テスト実装

`tests/unit/` で以下を検証する。

- plain formatter の出力
- markdown formatter の出力
- 正規化ロジック（導入時）
- title/site の重複回避ロジック（導入時）

### Step 8: Playwright E2E 実装

`tests/e2e/` で unpacked extension を読み込み、以下を自動検証する。

- `copy-plain` 実行時の clipboard 内容
- `copy-markdown` 実行時の clipboard 内容
- action click 経路
- 非対応ページで致命的エラーにならないこと

### Step 9: CI 構築

`.github/workflows/ci.yml` を作成し、PR で以下を実行する。

- `lint`
- `typecheck`
- `test:unit`
- `test:e2e`

すべて成功を Required Check とする。

### Step 10: リリースパッケージ workflow

`.github/workflows/release-package.yml` を作成し、tag push で以下を実施する。

- build
- 配布用 zip 生成（署名なし）
- artifact アップロード

Chrome Web Store への公開操作は手動で行う。

## 5. CI / テスト完了条件

### 5.1 CI 完了条件

- PR で `lint`, `typecheck`, `test:unit`, `test:e2e` がすべて成功
- flaky でないこと（連続実行で安定）

### 5.2 Unit 完了条件

- formatter の主要入力パターンを網羅
- 境界値（空 title、特殊文字 URL など）を検証

### 5.3 E2E 完了条件

- 2 つの command 経路と action click 経路を自動検証
- clipboard 出力が想定フォーマットと一致
- 非対応ページ系で runtime が破綻しない

## 6. Store デプロイ手順（v1）

1. リリースタグ作成で CI が zip artifact を生成
2. artifact をダウンロード
3. Chrome Web Store Developer Dashboard でアップロード
4. ストア審査後に公開

運用方針:

- パッケージ作成のみ自動化
- 公開判断は手動で実施

## 7. Manifest 変更時の運用ポリシー

- API 変更対応はまず `adapters/chrome` を更新
- `core` の公開関数シグネチャを維持する
- adapter の契約テストと E2E を先に更新
- 互換性が崩れる変更は spec と plan を同時更新する

## 8. 完了条件

以下を満たしたら v1 実装完了とする。

- `manifest.json` が MV3 として読み込める
- `Alt+C` で Plain text をコピーできる
- `Alt+Shift+C` で Markdown をコピーできる
- ツールバーアイコンからもコピーできる
- CI 必須チェック（lint/typecheck/unit/e2e）が通る
- リリース zip が CI で生成できる
- 非対応ページで拡張全体が壊れない
