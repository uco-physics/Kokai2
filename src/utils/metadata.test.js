import {
    generateMetadata,
    getSecurityInfo,
    getCompatibilityInfo,
    getUsageInfo
} from './metadata';

describe('メタデータ生成テスト', () => {
    describe('セキュリティ情報の生成', () => {
        test('RSA-2048のセキュリティ情報', () => {
            const info = getSecurityInfo({
                keyType: 'rsa',
                keySize: '2048'
            });
            
            expect(info).toHaveProperty('securityLevel');
            expect(info).toHaveProperty('recommendation');
            expect(info.securityLevel).toBe('中');
            expect(info.recommendation).toMatch(/一般的な用途/);
        });

        test('RSA-4096のセキュリティ情報', () => {
            const info = getSecurityInfo({
                keyType: 'rsa',
                keySize: '4096'
            });
            
            expect(info.securityLevel).toBe('高');
            expect(info.recommendation).toMatch(/長期的な保護/);
        });

        test('ECDSA P-256のセキュリティ情報', () => {
            const info = getSecurityInfo({
                keyType: 'ecdsa',
                keySize: 'P-256'
            });
            
            expect(info.securityLevel).toBe('中');
            expect(info.recommendation).toMatch(/一般的な用途/);
        });

        test('Ed25519のセキュリティ情報', () => {
            const info = getSecurityInfo({
                keyType: 'eddsa',
                keySize: 'Ed25519'
            });
            
            expect(info.securityLevel).toBe('高');
            expect(info.recommendation).toMatch(/モダンな選択/);
        });
    });

    describe('互換性情報の生成', () => {
        test('RSA-PEMの互換性情報', () => {
            const info = getCompatibilityInfo({
                keyType: 'rsa',
                outputFormat: 'pem'
            });
            
            expect(info).toHaveProperty('compatibility');
            expect(info).toHaveProperty('supportedSystems');
            expect(info.compatibility).toBe('高');
            expect(info.supportedSystems).toContain('OpenSSL');
        });

        test('ECDSA-SSHの互換性情報', () => {
            const info = getCompatibilityInfo({
                keyType: 'ecdsa',
                outputFormat: 'ssh'
            });
            
            expect(info.compatibility).toBe('中');
            expect(info.supportedSystems).toContain('OpenSSH');
        });

        test('EdDSA-OpenPGPの互換性情報', () => {
            const info = getCompatibilityInfo({
                keyType: 'eddsa',
                outputFormat: 'openpgp'
            });
            
            expect(info.compatibility).toBe('中');
            expect(info.supportedSystems).toContain('GnuPG');
        });
    });

    describe('用途情報の生成', () => {
        test('RSA-JWKの用途情報', () => {
            const info = getUsageInfo({
                keyType: 'rsa',
                outputFormat: 'jwk'
            });
            
            expect(info).toHaveProperty('recommendedUses');
            expect(info).toHaveProperty('examples');
            expect(info.recommendedUses).toContain('JWT署名');
        });

        test('ECDSA-PEMの用途情報', () => {
            const info = getUsageInfo({
                keyType: 'ecdsa',
                outputFormat: 'pem'
            });
            
            expect(info.recommendedUses).toContain('TLS証明書');
        });

        test('EdDSA-SSHの用途情報', () => {
            const info = getUsageInfo({
                keyType: 'eddsa',
                outputFormat: 'ssh'
            });
            
            expect(info.recommendedUses).toContain('SSHアクセス');
        });
    });

    describe('メタデータ全体の生成', () => {
        test('完全なメタデータの生成', () => {
            const params = {
                keyType: 'rsa',
                keySize: '2048',
                outputFormat: 'pem'
            };
            
            const metadata = generateMetadata(params);
            
            expect(metadata).toHaveProperty('security');
            expect(metadata).toHaveProperty('compatibility');
            expect(metadata).toHaveProperty('usage');
            
            expect(metadata.security).toHaveProperty('securityLevel');
            expect(metadata.compatibility).toHaveProperty('compatibility');
            expect(metadata.usage).toHaveProperty('recommendedUses');
        });

        test('パラメータ変更時のメタデータ更新', () => {
            const params1 = {
                keyType: 'rsa',
                keySize: '2048',
                outputFormat: 'pem'
            };
            
            const params2 = {
                keyType: 'rsa',
                keySize: '4096',
                outputFormat: 'pem'
            };
            
            const metadata1 = generateMetadata(params1);
            const metadata2 = generateMetadata(params2);
            
            expect(metadata1.security.securityLevel).not.toBe(metadata2.security.securityLevel);
        });

        test('無効なパラメータの処理', () => {
            const params = {
                keyType: 'invalid',
                keySize: 'invalid',
                outputFormat: 'invalid'
            };
            
            expect(() => generateMetadata(params)).toThrow();
        });
    });
}); 