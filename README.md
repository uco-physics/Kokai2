# Kokai2 - 公開鍵生成ツール

ブラウザで動作する公開鍵暗号鍵ペア生成ツールです。RSA、ECDSA、EdDSAの鍵ペアを生成し、PEM、JWK、SSH、OpenPGP形式で出力できます。

## 特徴

- 🔐 複数の暗号方式サポート（RSA、ECDSA、EdDSA）
- 📄 多様な出力形式（PEM、JWK、SSH、OpenPGP）
- 🌐 ブラウザ内で完結（サーバーに情報を送信しない）
- 🎨 モダンなUI（Tailwind CSS）
- 🌍 多言語対応（日本語/英語）
- ♿ アクセシビリティ対応
- 🌙 ダークモード対応

## セットアップ

```bash
# リポジトリのクローン
git clone https://github.com//kokai2.git
cd kokai2

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

## 使用技術

- React 18
- Tailwind CSS
- node-forge
- OpenPGP.js
- Web Crypto API

## セキュリティ

- 全ての処理はブラウザ内で完結し、サーバーには一切データを送信しません
- Web Crypto APIを使用して暗号学的に安全な乱数を生成
- パスフレーズによる秘密鍵の保護をサポート

## 対応ブラウザ

- Chrome 69以降
- Firefox 60以降
- Safari 12.1以降
- Edge 79以降

## 開発

```bash
# テストの実行
npm test

# コードの整形
npm run format

# リントチェック
npm run lint

# ビルド
npm run build
```

## ライセンス

MIT License

## 注意事項

このツールは教育目的および一般的な用途向けに開発されています。重要なシステムでの使用には、適切なセキュリティ評価を受けた専用ツールの使用を検討してください。

## コントリビューション

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 作者

あなたの名前 - [@](https://github.com/)

## 謝辞

- [node-forge](https://github.com/digitalbazaar/forge)
- [OpenPGP.js](https://github.com/openpgpjs/openpgpjs)
- [Tailwind CSS](https://tailwindcss.com/)