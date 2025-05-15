import {
    generateRSAKeyPair,
    generateECDSAKeyPair,
    generateEdDSAKeyPair,
    convertToPEM,
    convertToJWK,
    convertToSSH,
    convertToOpenPGP
} from './crypto';

// モックデータ
const mockKeyPairs = {
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

describe('暗号鍵生成テスト', () => {
    // RSA鍵生成テスト
    describe('RSA鍵生成', () => {
        test('2048ビット鍵の生成', async () => {
            const keyPair = await generateRSAKeyPair(2048);
            expect(keyPair).toHaveProperty('publicKey');
            expect(keyPair).toHaveProperty('privateKey');
            
            // 鍵の形式を検証
            expect(keyPair.publicKey).toBeInstanceOf(CryptoKey);
            expect(keyPair.privateKey).toBeInstanceOf(CryptoKey);
            
            // アルゴリズムを検証
            expect(keyPair.publicKey.algorithm.name).toBe('RSA-OAEP');
            expect(keyPair.privateKey.algorithm.name).toBe('RSA-OAEP');
            expect(keyPair.publicKey.algorithm.modulusLength).toBe(2048);
        });

        test('無効な鍵サイズでエラー', async () => {
            await expect(generateRSAKeyPair(1024)).rejects.toThrow('RSAの鍵サイズは2048/3072/4096ビットのみ対応しています');
        });
    });

    // ECDSA鍵生成テスト
    describe('ECDSA鍵生成', () => {
        test('P-256曲線の鍵生成', async () => {
            const keyPair = await generateECDSAKeyPair('P-256');
            expect(keyPair).toHaveProperty('publicKey');
            expect(keyPair).toHaveProperty('privateKey');
            
            // 鍵の形式を検証
            expect(keyPair.publicKey).toBeInstanceOf(CryptoKey);
            expect(keyPair.privateKey).toBeInstanceOf(CryptoKey);
            
            // アルゴリズムを検証
            expect(keyPair.publicKey.algorithm.name).toBe('ECDSA');
            expect(keyPair.privateKey.algorithm.name).toBe('ECDSA');
            expect(keyPair.publicKey.algorithm.namedCurve).toBe('P-256');
        });

        test('無効な曲線でエラー', async () => {
            await expect(generateECDSAKeyPair('invalid-curve')).rejects.toThrow('ECDSAはP-256/P-384のみ対応しています');
        });
    });

    // EdDSA鍵生成テスト
    describe('EdDSA鍵生成', () => {
        test('Ed25519鍵の生成', async () => {
            const keyPair = await generateEdDSAKeyPair('Ed25519');
            expect(keyPair).toHaveProperty('publicKey');
            expect(keyPair).toHaveProperty('privateKey');
            
            // OpenPGP.jsの鍵形式を検証
            expect(keyPair.publicKey.armor()).toBe(mockKeyPairs.eddsa.publicKey);
            expect(keyPair.privateKey.armor()).toBe(mockKeyPairs.eddsa.privateKey);
        });

        test('無効な曲線でエラー', async () => {
            await expect(generateEdDSAKeyPair('invalid-curve')).rejects.toThrow('EdDSAはEd25519のみ対応しています');
        });
    });
});

// 出力形式変換テスト
describe('鍵形式変換テスト', () => {
    let rsaKeyPair;
    
    beforeEach(async () => {
        rsaKeyPair = await generateRSAKeyPair(2048);
    });

    describe('PEM形式変換', () => {
        test('パスフレーズなしでの変換', async () => {
            const pem = await convertToPEM(rsaKeyPair);
            expect(pem).toHaveProperty('publicKey');
            expect(pem).toHaveProperty('privateKey');
            
            // PEM形式の検証
            expect(pem.publicKey).toBe(mockKeyPairs.rsa.publicKey);
            expect(pem.privateKey).toBe(mockKeyPairs.rsa.privateKey);
        });

        test('パスフレーズありでの変換', async () => {
            const pem = await convertToPEM(rsaKeyPair, 'test-passphrase');
            expect(pem.publicKey).toBe(mockKeyPairs.rsa.publicKey);
            expect(pem.privateKey).toMatch(/^-----BEGIN ENCRYPTED PRIVATE KEY-----/);
        });
    });

    describe('JWK形式変換', () => {
        test('JWK形式への変換', async () => {
            const jwk = await convertToJWK(rsaKeyPair);
            expect(jwk).toHaveProperty('publicKey');
            expect(jwk).toHaveProperty('privateKey');
            
            // JWK形式の検証
            const publicJWK = JSON.parse(jwk.publicKey);
            const privateJWK = JSON.parse(jwk.privateKey);
            
            expect(publicJWK).toHaveProperty('kty', 'RSA');
            expect(publicJWK).toHaveProperty('n');  // modulus
            expect(publicJWK).toHaveProperty('e');  // exponent
            
            expect(privateJWK).toHaveProperty('kty', 'RSA');
            expect(privateJWK).toHaveProperty('d');  // private exponent
        });
    });

    describe('SSH形式変換', () => {
        test('SSH形式への変換', async () => {
            const ssh = await convertToSSH(rsaKeyPair);
            expect(ssh).toHaveProperty('publicKey');
            expect(ssh).toHaveProperty('privateKey');
            
            // SSH形式の検証
            expect(ssh.publicKey).toMatch(/^ssh-rsa /);
            expect(ssh.privateKey).toMatch(/^-----BEGIN PRIVATE KEY-----/);
        });

        test('パスフレーズ付きSSH形式への変換', async () => {
            const ssh = await convertToSSH(rsaKeyPair, 'test-passphrase');
            expect(ssh.publicKey).toMatch(/^ssh-rsa /);
            expect(ssh.privateKey).toMatch(/^-----BEGIN ENCRYPTED PRIVATE KEY-----/);
        });
    });

    describe('OpenPGP形式変換', () => {
        test('OpenPGP形式への変換', async () => {
            const pgp = await convertToOpenPGP({
                type: 'rsa',
                name: 'Test User',
                email: 'test@example.com',
                passphrase: 'test-passphrase'
            });
            
            expect(pgp).toHaveProperty('publicKey');
            expect(pgp).toHaveProperty('privateKey');
            
            // OpenPGP形式の検証
            expect(pgp.publicKey).toBe(mockKeyPairs.eddsa.publicKey);
            expect(pgp.privateKey).toBe(mockKeyPairs.eddsa.privateKey);
        });
    });
}); 