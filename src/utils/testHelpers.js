import { render } from '@testing-library/react';

// テストラッパーコンポーネント
export const renderWithProviders = (ui, options = {}) => {
    return render(ui, {
        wrapper: ({ children }) => children,
        ...options,
    });
};

// モック鍵ペアデータ
export const mockKeyPairs = {
    rsa: {
        publicKey: '-----BEGIN PUBLIC KEY-----\nMock RSA Public Key\n-----END PUBLIC KEY-----',
        privateKey: '-----BEGIN PRIVATE KEY-----\nMock RSA Private Key\n-----END PRIVATE KEY-----'
    },
    ecdsa: {
        publicKey: '-----BEGIN PUBLIC KEY-----\nMock ECDSA Public Key\n-----END PUBLIC KEY-----',
        privateKey: '-----BEGIN PRIVATE KEY-----\nMock ECDSA Private Key\n-----END PRIVATE KEY-----'
    },
    eddsa: {
        publicKey: '-----BEGIN PGP PUBLIC KEY BLOCK-----\nMock EdDSA Public Key\n-----END PGP PUBLIC KEY BLOCK-----',
        privateKey: '-----BEGIN PGP PRIVATE KEY BLOCK-----\nMock EdDSA Private Key\n-----END PGP PRIVATE KEY BLOCK-----'
    }
};

// メタデータのモックデータ
export const mockMetadata = {
    security: {
        securityLevel: '中',
        recommendation: '一般的な用途に適しています'
    },
    compatibility: {
        compatibility: '高',
        supportedSystems: ['OpenSSL', 'OpenSSH', 'GnuPG']
    },
    usage: {
        recommendedUses: ['TLS証明書', 'SSH認証', 'コード署名'],
        examples: ['Webサーバー証明書', 'GitHubデプロイキー']
    }
};

// エラーメッセージのモックデータ
export const mockErrorMessages = {
    invalidKeySize: 'RSAの鍵サイズは2048/3072/4096ビットのみ対応しています',
    invalidCurve: 'ECDSAはP-256/P-384のみ対応しています',
    invalidPassphrase: 'パスフレーズは8文字以上必要です',
    browserNotSupported: '選択された暗号方式はこのブラウザでサポートされていません'
};

// 非同期処理のヘルパー
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0)); 