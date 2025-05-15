import {
    validateCryptoParams,
    validateOutputFormat,
    validatePassphrase,
    validateAll,
    formatError
} from './errorHandler';

describe('パラメータバリデーションテスト', () => {
    describe('暗号パラメータの検証', () => {
        test('有効なRSAパラメータ', () => {
            const params = {
                keyType: 'rsa',
                keySize: '2048',
                outputFormat: 'pem'
            };
            expect(validateCryptoParams(params).isValid).toBe(true);
        });

        test('無効なRSA鍵サイズ', () => {
            const params = {
                keyType: 'rsa',
                keySize: '1024',
                outputFormat: 'pem'
            };
            const result = validateCryptoParams(params);
            expect(result.isValid).toBe(false);
            expect(result.message).toMatch(/RSAの鍵サイズは2048\/3072\/4096ビットのみ/);
        });

        test('有効なECDSAパラメータ', () => {
            const params = {
                keyType: 'ecdsa',
                keySize: 'P-256',
                outputFormat: 'pem'
            };
            expect(validateCryptoParams(params).isValid).toBe(true);
        });

        test('無効なECDSA曲線', () => {
            const params = {
                keyType: 'ecdsa',
                keySize: 'P-192',
                outputFormat: 'pem'
            };
            const result = validateCryptoParams(params);
            expect(result.isValid).toBe(false);
            expect(result.message).toMatch(/ECDSAはP-256\/P-384のみ/);
        });

        test('EdDSAとSSH形式の制約', () => {
            const params = {
                keyType: 'eddsa',
                keySize: 'Ed448',
                outputFormat: 'ssh'
            };
            const result = validateCryptoParams(params);
            expect(result.isValid).toBe(false);
            expect(result.message).toMatch(/SSHはEd25519のみ/);
        });
    });

    describe('出力形式の検証', () => {
        test('有効な出力形式', () => {
            const params = {
                keyType: 'rsa',
                keySize: '2048',
                outputFormat: 'pem'
            };
            expect(validateOutputFormat(params).isValid).toBe(true);
        });

        test('SSH形式の制約', () => {
            const params = {
                keyType: 'eddsa',
                keySize: 'Ed448',
                outputFormat: 'ssh'
            };
            const result = validateOutputFormat(params);
            expect(result.isValid).toBe(false);
            expect(result.message).toMatch(/SSH形式はRSA、ECDSA、Ed25519のみ/);
        });
    });

    describe('パスフレーズの検証', () => {
        test('有効なパスフレーズ', () => {
            const params = {
                outputFormat: 'pem',
                passphrase: 'secure-passphrase'
            };
            expect(validatePassphrase(params).isValid).toBe(true);
        });

        test('短すぎるパスフレーズ', () => {
            const params = {
                outputFormat: 'pem',
                passphrase: 'short'
            };
            const result = validatePassphrase(params);
            expect(result.isValid).toBe(false);
            expect(result.message).toMatch(/パスフレーズは8文字以上/);
        });

        test('パスフレーズなしの場合', () => {
            const params = {
                outputFormat: 'pem',
                passphrase: ''
            };
            expect(validatePassphrase(params).isValid).toBe(true);
        });
    });

    describe('全体の検証', () => {
        test('全て有効なパラメータ', () => {
            const params = {
                keyType: 'rsa',
                keySize: '2048',
                outputFormat: 'pem',
                passphrase: 'secure-passphrase'
            };
            expect(validateAll(params).isValid).toBe(true);
        });

        test('一つでも無効なパラメータがある場合', () => {
            const params = {
                keyType: 'rsa',
                keySize: '1024',  // 無効な鍵サイズ
                outputFormat: 'pem',
                passphrase: 'secure-passphrase'
            };
            expect(validateAll(params).isValid).toBe(false);
        });
    });

    describe('エラーメッセージのフォーマット', () => {
        test('既知のエラータイプ', () => {
            const error = new Error();
            error.name = 'NotSupportedError';
            expect(formatError(error)).toBe('選択された暗号方式はこのブラウザでサポートされていません。');
        });

        test('メモリ制限エラー', () => {
            const error = new Error();
            error.name = 'QuotaExceededError';
            expect(formatError(error)).toBe('メモリ制限を超えました。小さい鍵サイズを選択してください。');
        });

        test('カスタムエラーメッセージ', () => {
            const error = new Error('カスタムエラー');
            expect(formatError(error)).toBe('カスタムエラー');
        });

        test('デフォルトエラーメッセージ', () => {
            const error = new Error();
            expect(formatError(error)).toBe('エラーが発生しました。');
        });
    });
}); 