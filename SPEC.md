# KY Format — Detailed Specification / 詳細仕様書

> **Version:** 0.1.0

---

## 1. `.kyfile` — アプリケーションバンドル / Application Bundle

### 概要
`.kyfile` はアプリケーション全体をZIP形式で圧縮したアーカイブです。拡張子は `.kyfile` ですが、内部はZIPとして扱います。

`.kyfile` is a ZIP archive of the entire application. Despite the `.kyfile` extension, it is internally a standard ZIP file.

### 必須ファイル / Required files

| ファイル / File | 説明 / Description |
|---|---|
| `main.js` | エントリーポイント / Entry point script |
| `.kydata` | パッケージ定義 / Package definition |

### 任意ファイル / Optional files

| ファイル / File | 説明 / Description |
|---|---|
| `*.kypack` | キャラクターパッケージ / Character packages |
| `*.kap` | 拡張機能 / Extension plugins |
| `assets/` | 画像・音声などのアセット / Images, audio, etc. |

---

## 2. `.kypack` — キャラクターパッケージ / Character Package

### 概要
1キャラクター分のデータをZIP形式でまとめたパッケージです。

A ZIP archive bundling all data for a single character.

### 必須ファイル / Required files

| ファイル / File | 説明 / Description |
|---|---|
| `{id}.json` | キャラクターデータ / Character data |
| `{id}.kytext` | フィールド定義 / Field schema |

### 命名規則 / Naming convention

```
{character_id}.kypack
```

例 / Example: `aria.kypack`

---

## 3. `*.json` — キャラクターデータ / Character Data

### 概要
キャラクターの設定情報を格納するJSONファイルです。

A JSON file containing character configuration.

### フィールド定義 / Fields

| フィールド / Field | 型 / Type | 必須 / Required | 説明 / Description |
|---|---|---|---|
| `id` | string | ✅ | キャラクターの一意ID / Unique character ID |
| `name` | string | ✅ | 表示名 / Display name |
| `version` | string | ✅ | semver形式のバージョン / Semver version string |
| `personality` | string | ✅ | 性格・口調の説明 / Personality description |
| `system_prompt` | string | ✅ | AIへのシステムプロンプト / System prompt for AI |
| `author` | string | ❌ | 作者名 / Author name |
| `tags` | string[] | ❌ | タグ一覧 / Tag list |
| `avatar` | string | ❌ | アバター画像のパス / Avatar image path |
| `created_at` | string | ❌ | ISO 8601形式の作成日時 / Creation date (ISO 8601) |

### サンプル / Example

```json
{
  "id": "aria",
  "name": "Aria",
  "version": "1.0.0",
  "personality": "明るく元気な女の子。丁寧語は使わず、フレンドリーに話す。",
  "system_prompt": "あなたはAriaというキャラクターです。明るく元気に、フレンドリーに話してください。",
  "author": "yourname",
  "tags": ["girl", "energetic", "friendly"],
  "avatar": "assets/aria.png",
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

## 4. `.kytext` — フィールド定義 / Field Schema

### 概要
対応する `.json` のフィールド定義（スキーマ）を記述するJSONファイルです。どのフィールドが必須か・型は何かを定義します。

A JSON file describing the field schema for the corresponding `.json`. Defines required fields and their types.

### フィールド定義 / Fields

| フィールド / Field | 型 / Type | 必須 / Required | 説明 / Description |
|---|---|---|---|
| `schema_version` | string | ✅ | このスキーマのバージョン / Schema version |
| `target` | string | ✅ | 対象のJSONファイル名 / Target JSON filename |
| `fields` | object | ✅ | フィールド定義のマップ / Map of field definitions |

### `fields` の各エントリ / Each entry in `fields`

| キー / Key | 型 / Type | 説明 / Description |
|---|---|---|
| `type` | string | `string` / `number` / `boolean` / `array` / `object` |
| `required` | boolean | 必須かどうか / Whether the field is required |
| `description` | string | フィールドの説明 / Field description |
| `default` | any | デフォルト値（任意）/ Default value (optional) |

### サンプル / Example

```json
{
  "schema_version": "0.1.0",
  "target": "aria.json",
  "fields": {
    "id":            { "type": "string",  "required": true,  "description": "Unique character ID" },
    "name":          { "type": "string",  "required": true,  "description": "Display name" },
    "version":       { "type": "string",  "required": true,  "description": "Semver version string" },
    "personality":   { "type": "string",  "required": true,  "description": "Personality description" },
    "system_prompt": { "type": "string",  "required": true,  "description": "System prompt for AI" },
    "author":        { "type": "string",  "required": false, "description": "Author name" },
    "tags":          { "type": "array",   "required": false, "description": "Tag list (strings)" },
    "avatar":        { "type": "string",  "required": false, "description": "Avatar image path" },
    "created_at":    { "type": "string",  "required": false, "description": "ISO 8601 date string" }
  }
}
```

---

## 5. `.kydata` — パッケージ定義 / Package Definition

### 概要
`.kyfile` 内に置かれるパッケージ定義ファイルです。アプリが使用するパッケージや基本設定を定義します。

The package definition file placed inside `.kyfile`. Defines packages and basic settings used by the application.

### フィールド定義 / Fields

| フィールド / Field | 型 / Type | 必須 / Required | 説明 / Description |
|---|---|---|---|
| `kydata_version` | string | ✅ | `.kydata` フォーマットのバージョン / Format version |
| `app` | object | ✅ | アプリ情報 / Application info |
| `app.name` | string | ✅ | アプリ名 / App name |
| `app.version` | string | ✅ | アプリバージョン / App version |
| `app.entry` | string | ✅ | エントリーポイント / Entry point filename |
| `packages` | array | ❌ | 使用するキャラクターパッケージ一覧 / Character packages to load |
| `plugins` | array | ❌ | 使用する拡張機能一覧 / Plugins to load |

### サンプル / Example

```json
{
  "kydata_version": "0.1.0",
  "app": {
    "name": "My AI Chat",
    "version": "1.0.0",
    "entry": "main.js"
  },
  "packages": [
    { "name": "aria", "file": "aria.kypack", "version": "1.0.0" },
    { "name": "hana", "file": "hana.kypack", "version": "1.2.0" }
  ],
  "plugins": [
    { "name": "voice_synth", "file": "voice_synth.kap", "version": "1.0.0" }
  ]
}
```

---

## 6. `.kap` — 拡張機能プラグイン / Extension Plugin

### 概要
アプリに追加機能を提供するプラグインファイルです。

A plugin file that provides additional functionality to the application.

### フィールド定義 / Fields

| フィールド / Field | 型 / Type | 必須 / Required | 説明 / Description |
|---|---|---|---|
| `plugin_id` | string | ✅ | プラグインの一意ID / Unique plugin ID |
| `name` | string | ✅ | プラグイン名 / Plugin name |
| `version` | string | ✅ | semver形式のバージョン / Semver version |
| `type` | string | ✅ | 機能タイプ（例: `tts`, `ui`, `filter`）/ Feature type |
| `author` | string | ❌ | 作者名 / Author name |
| `hooks` | object | ❌ | イベントフック定義 / Event hook definitions |
| `config` | object | ❌ | 設定値スキーマ / Config value schema |

### hooks で使えるイベント / Available hook events

| イベント / Event | タイミング / Timing |
|---|---|
| `on_load` | プラグイン読み込み時 / On plugin load |
| `on_message` | メッセージ送受信時 / On message send/receive |
| `on_unload` | プラグイン解放時 / On plugin unload |

### サンプル / Example

```json
{
  "plugin_id": "voice_synth",
  "name": "Voice Synthesizer",
  "version": "1.0.0",
  "type": "tts",
  "author": "yourname",
  "hooks": {
    "on_message": "handleMessage",
    "on_load": "initialize"
  },
  "config": {
    "engine": { "type": "string", "default": "voicevox", "description": "TTS engine name" },
    "speed":  { "type": "number", "default": 1.0,        "description": "Speech speed" }
  }
}
```

---

## バージョニング / Versioning

全フォーマットは [Semantic Versioning 2.0.0](https://semver.org/) に従います。

All formats follow [Semantic Versioning 2.0.0](https://semver.org/).

---

## 変更履歴 / Changelog

| バージョン / Version | 日付 / Date | 変更内容 / Changes |
|---|---|---|
| 0.1.0 | 2026-06-04 | 初版 / Initial draft |
