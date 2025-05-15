import '@testing-library/jest-dom';
import { mockKeyPairs, mockMetadata, mockErrorMessages } from './utils/testHelpers';

// CryptoKeyのモック
class CryptoKey {
    constructor(type = 'public', algorithm = { name: 'RSA-OAEP' }) {
        this.type = type;
        this.algorithm = algorithm;
        this.extractable = true;
        this.usages = ['encrypt', 'decrypt', 'sign', 'verify'];
    }
}

// Web Crypto APIのモック
const cryptoMock = {
    subtle: {
        generateKey: jest.fn(),
        exportKey: jest.fn(),
        importKey: jest.fn(),
        sign: jest.fn(),
        verify: jest.fn()
    },
    getRandomValues: jest.fn(array => {
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
        return array;
    })
};

// グローバルなcryptoオブジェクトのモック
global.crypto = cryptoMock;

// RSA鍵ペアのモックレスポンス
const mockRSAKeyPair = {
    publicKey: new CryptoKey('public', { name: 'RSA-OAEP', modulusLength: 2048 }),
    privateKey: new CryptoKey('private', { name: 'RSA-OAEP', modulusLength: 2048 })
};

// ECDSA鍵ペアのモックレスポンス
const mockECDSAKeyPair = {
    publicKey: new CryptoKey('public', { name: 'ECDSA', namedCurve: 'P-256' }),
    privateKey: new CryptoKey('private', { name: 'ECDSA', namedCurve: 'P-256' })
};

// EdDSA鍵ペアのモックレスポンス
const mockEdDSAKeyPair = {
    publicKey: {
        armor: () => '-----BEGIN PGP PUBLIC KEY BLOCK-----\nMock EdDSA Public Key\n-----END PGP PUBLIC KEY BLOCK-----'
    },
    privateKey: {
        armor: () => '-----BEGIN PGP PRIVATE KEY BLOCK-----\nMock EdDSA Private Key\n-----END PGP PRIVATE KEY BLOCK-----'
    }
};

// 鍵生成のモックレスポンス設定
cryptoMock.subtle.generateKey.mockImplementation((algorithm, extractable, keyUsages) => {
    switch (algorithm.name) {
        case 'RSA-OAEP':
            return Promise.resolve(mockRSAKeyPair);
        case 'ECDSA':
            return Promise.resolve(mockECDSAKeyPair);
        default:
            return Promise.reject(new Error(mockErrorMessages.browserNotSupported));
    }
});

// 鍵のエクスポート用モック
cryptoMock.subtle.exportKey.mockImplementation((format, key) => {
    if (key.type === 'public') {
        return Promise.resolve(new TextEncoder().encode(mockKeyPairs.rsa.publicKey).buffer);
    } else {
        return Promise.resolve(new TextEncoder().encode(mockKeyPairs.rsa.privateKey).buffer);
    }
});

// FileReaderのモック
global.FileReader = class {
    readAsArrayBuffer() {
        setTimeout(() => this.onload({ target: { result: new ArrayBuffer(32) } }), 0);
    }
};

// Blobのモック
global.Blob = class {
    constructor(content, options) {
        this.content = content;
        this.options = options;
    }
};

// URL.createObjectURLのモック
global.URL.createObjectURL = jest.fn(blob => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// node-forgeのモック
jest.mock('node-forge', () => ({
    pki: {
        rsa: {
            generateKeyPair: jest.fn().mockResolvedValue({
                publicKey: { n: 'mock-n', e: 'mock-e' },
                privateKey: { d: 'mock-d', p: 'mock-p', q: 'mock-q' }
            })
        }
    },
    util: {
        encode64: jest.fn(str => 'base64-encoded-' + str)
    }
}));

// OpenPGP.jsのモック
jest.mock('openpgp', () => ({
    generateKey: jest.fn().mockResolvedValue({
        publicKey: {
            armor: () => mockKeyPairs.eddsa.publicKey
        },
        privateKey: {
            armor: () => mockKeyPairs.eddsa.privateKey
        }
    }),
    readKey: jest.fn().mockResolvedValue({
        getPublicKey: () => ({ armor: () => mockKeyPairs.eddsa.publicKey }),
        getPrivateKey: () => ({ armor: () => mockKeyPairs.eddsa.privateKey })
    }),
    createMessage: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn()
}));

// メタデータ生成のモック
jest.mock('./utils/metadata', () => ({
    generateMetadata: jest.fn().mockReturnValue(mockMetadata),
    getSecurityInfo: jest.fn().mockReturnValue(mockMetadata.security),
    getCompatibilityInfo: jest.fn().mockReturnValue(mockMetadata.compatibility),
    getUsageInfo: jest.fn().mockReturnValue(mockMetadata.usage)
})); 