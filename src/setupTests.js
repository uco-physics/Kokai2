import '@testing-library/jest-dom';

// CryptoKeyのモック
class CryptoKey {
    constructor(type = 'public', algorithm = { name: 'RSA-OAEP' }) {
        this.type = type;
        this.algorithm = algorithm;
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
            return Promise.reject(new Error('Unsupported algorithm'));
    }
});

// 鍵のエクスポート用モック
cryptoMock.subtle.exportKey.mockImplementation((format, key) => {
    const mockKeyData = new Uint8Array(32).fill(1);
    return Promise.resolve(mockKeyData.buffer);
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
jest.mock('openpgp', () => {
    const mockEdDSAKeyPair = {
        publicKey: {
            armor: () => '-----BEGIN PGP PUBLIC KEY BLOCK-----\nMock EdDSA Public Key\n-----END PGP PUBLIC KEY BLOCK-----'
        },
        privateKey: {
            armor: () => '-----BEGIN PGP PRIVATE KEY BLOCK-----\nMock EdDSA Private Key\n-----END PGP PRIVATE KEY BLOCK-----'
        }
    };

    return {
        generateKey: jest.fn().mockResolvedValue(mockEdDSAKeyPair),
        readKey: jest.fn().mockResolvedValue({
            getPublicKey: () => mockEdDSAKeyPair.publicKey,
            getPrivateKey: () => mockEdDSAKeyPair.privateKey
        }),
        createMessage: jest.fn(),
        encrypt: jest.fn(),
        decrypt: jest.fn()
    };
}); 