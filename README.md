# 公開鍵暗号鍵ペア生成ツール（Kokai2）

このプロジェクトは、ブラウザ上でRSA、ECDSA、EdDSAの鍵ペアを生成するWebアプリケーションです。GitHub Pages上で動作し、サーバーレスで使用できます。

## 機能

- **対応暗号方式**:
  - RSA (2048/3072/4096ビット)
  - ECDSA (P-256/P-384)
  - EdDSA (Ed25519/Ed448)

- **出力形式**:
  - PEM (PKCS#8, SPKI)
  - JWK (JSON Web Key)
  - SSH
  - OpenPGP

- **その他の機能**:
  - パスフレーズによる秘密鍵の保護
  - 複数の出力形式でのダウンロード
  - メタデータ付きZIPダウンロード

## 使用方法

1. ブラウザで https://[username].github.io/Kokai2 にアクセス
2. 暗号方式を選択（RSA、ECDSA、EdDSA）
3. 鍵サイズを選択（例：RSA 2048ビット）
4. 出力形式を選択（PEM、JWK、SSH、OpenPGP）
5. 必要に応じてパスフレーズを設定
6. 「生成」ボタンをクリック
7. 生成された鍵をダウンロード

## 開発者向け情報

### プロジェクト構造
```
Kokai2/
├── index.html      # メインアプリケーション（HTML/CSS/JS）
└── README.md       # このファイル

# 将来的な拡張時の推奨構造:
Kokai2/
├── src/
│   ├── components/
│   │   ├── KeyGenForm.js
│   │   ├── ResultDisplay.js
│   │   └── TestPanel.js
│   ├── crypto/
│   │   ├── rsa.js
│   │   ├── ecdsa.js
│   │   └── eddsa.js
│   └── utils/
│       ├── format.js
│       └── validation.js
├── index.html
└── README.md
```

### ローカルでの開発方法

1. リポジトリのクローン:
   ```bash
   git clone https://github.com/[username]/Kokai2.git
   cd Kokai2
   ```

2. 開発:
   - VS CodeなどのエディタでIndex.htmlを編集
   - ブラウザで直接index.htmlを開いてテスト（file://パス）
   - DevTools（F12）でコンソールログやエラーを確認

3. GitHub Pagesへのデプロイ:
   ```bash
   git add .
   git commit -m "更新内容の説明"
   git push origin main
   ```
   - GitHub上でSettings → Pages → Source を「main」に設定

### 鍵の検証方法

生成された鍵は以下のコマンドで検証できます：

```bash
# RSA鍵の検証
openssl rsa -in private.pem -check
openssl rsa -in public.pem -pubin -text

# ECDSA鍵の検証
openssl ec -in private.pem -check
openssl ec -in public.pem -pubin -text

# Ed25519鍵の検証（OpenSSL 1.1.1以降）
openssl pkey -in private.pem -text
```

## 技術スタック

- **フロントエンド**:
  - React (CDN経由)
  - Tailwind CSS (CDN経由)
  
- **暗号ライブラリ**:
  - Web Crypto API
  - node-forge (CDN経由)
  - openpgp.js (CDN経由)

## セキュリティ注意事項

- 生成された鍵は全てブラウザ内で生成され、サーバーには送信されません
- パスフレーズで保護された秘密鍵は、AES-256-CBCで暗号化されます
- 重要な用途には、適切なセキュリティ評価を受けた専用ツールの使用を推奨します

## ライセンス

MITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。