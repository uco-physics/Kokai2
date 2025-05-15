import {
    generateRSAKeyPair,
    generateECDSAKeyPair,
    generateEdDSAKeyPair,
    convertToPEM,
    convertToJWK,
    convertToSSH,
    convertToOpenPGP
} from './crypto';

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
            await expect(generateRSAKeyPair(1024)).rejects.toThrow();
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
            await expect(generateECDSAKeyPair('invalid-curve')).rejects.toThrow();
        });
    });

    // EdDSA鍵生成テスト
    describe('EdDSA鍵生成', () => {
        test('Ed25519鍵の生成', async () => {
            const keyPair = await generateEdDSAKeyPair('Ed25519');
            expect(keyPair).toHaveProperty('publicKey');
            expect(keyPair).toHaveProperty('privateKey');
            
            // OpenPGP.jsの鍵形式を検証
            expect(typeof keyPair.publicKey).toBe('object');
            expect(typeof keyPair.privateKey).toBe('object');
        });

        test('無効な曲線でエラー', async () => {
            await expect(generateEdDSAKeyPair('invalid-curve')).rejects.toThrow();
        });
    });
});

// 出力形式変換テスト
describe('鍵形式変換テスト', () => {
    let rsaKeyPair;
    
    beforeAll(async () => {
        rsaKeyPair = await generateRSAKeyPair(2048);
    });

    describe('PEM形式変換', () => {
        test('パスフレーズなしでの変換', async () => {
            const pem = await convertToPEM(rsaKeyPair);
            expect(pem).toHaveProperty('publicKey');
            expect(pem).toHaveProperty('privateKey');
            
            // PEM形式の検証
            expect(pem.publicKey).toMatch(/^-----BEGIN PUBLIC KEY-----/);
            expect(pem.publicKey).toMatch(/-----END PUBLIC KEY-----$/);
            expect(pem.privateKey).toMatch(/^-----BEGIN PRIVATE KEY-----/);
            expect(pem.privateKey).toMatch(/-----END PRIVATE KEY-----$/);
        });

        test('パスフレーズありでの変換', async () => {
            const pem = await convertToPEM(rsaKeyPair, 'test-passphrase');
            expect(pem.privateKey).toMatch(/^-----BEGIN ENCRYPTED PRIVATE KEY-----/);
            expect(pem.privateKey).toMatch(/-----END ENCRYPTED PRIVATE KEY-----$/);
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
        });

        test('パスフレーズ付きSSH形式への変換', async () => {
            const ssh = await convertToSSH(rsaKeyPair, 'test-passphrase');
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
            expect(pgp.publicKey).toMatch(/^-----BEGIN PGP PUBLIC KEY BLOCK-----/);
            expect(pgp.privateKey).toMatch(/^-----BEGIN PGP PRIVATE KEY BLOCK-----/);
        });
    });
}); 