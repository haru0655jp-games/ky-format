# KY Format Specification / KY フォーマット仕様書

> **Version:** 0.1.0  
> **Status:** Draft / ドラフト

---

## 概要 / Overview

**KY Format** は、AIキャラクターチャットアプリケーション向けに設計されたオープンなファイルフォーマット仕様です。キャラクター定義・パッケージ・拡張機能を統一的に扱うことを目的としています。

**KY Format** is an open file format specification designed for AI character chat applications. It provides a unified way to handle character definitions, packages, and extensions.

---

## ファイル構造 / File Structure

`.kyfile` はアプリケーション全体をまとめたZIPアーカイブです。

`.kyfile` is a ZIP archive that bundles the entire application.

```
myapp.kyfile              (ZIP archive)
├── main.js               Main script / メインスクリプト
├── .kydata               Package definition / パッケージ定義
└── aria.kypack           Character package (ZIP) / キャラクターパッケージ (ZIP)
     ├── aria.json        Character data / キャラクターデータ
     └── aria.kytext      Field schema / フィールド定義
```

---

## 拡張子一覧 / File Extensions

| 拡張子 / Extension | 形式 / Format | 役割 / Role |
|---|---|---|
| `.kyfile` | ZIP | アプリ本体 / Application bundle |
| `.kypack` | ZIP | キャラクターパッケージ / Character package |
| `.kytext` | JSON | フィールド定義 / Field schema |
| `.kydata` | JSON | パッケージ定義 / Package definition |
| `.kap`    | JSON | 拡張機能 / Extension plugin |

詳細は [SPEC.md](SPEC.md) を参照してください。  
See [SPEC.md](SPEC.md) for detailed specifications.

---

## クイックスタート / Quick Start

```js
import { KyFile } from './src/ky-parser.js';

const app = await KyFile.load('myapp.kyfile');
const character = await app.getCharacter('aria');

console.log(character.name);         // "Aria"
console.log(character.system_prompt); // "あなたはAriaです..."
```

サンプルファイルは [`examples/`](examples/) ディレクトリを参照してください。  
See the [`examples/`](examples/) directory for sample files.

---

## ディレクトリ構成 / Repository Structure

```
ky-format/
├── README.md         この文書 / This document
├── SPEC.md           詳細仕様書 / Detailed specification
├── LICENSE           MIT License
├── src/
│   └── ky-parser.js  リファレンス実装 / Reference implementation (JavaScript)
└── examples/
    ├── myapp.kyfile/ （展開済みサンプル / Extracted sample）
    │   ├── main.js
    │   ├── .kydata
    │   └── aria.kypack/
    │       ├── aria.json
    │       └── aria.kytext
    └── plugins/
        └── voice_synth.kap
```

---

## ライセンス / License

[MIT License](LICENSE)

---

## コントリビューション / Contributing

Issue・Pull Request 歓迎です！  
Issues and Pull Requests are welcome!
