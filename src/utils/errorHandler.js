/**
 * エラー処理に関するユーティリティ関数群
 */

/**
 * 無効な暗号方式の組み合わせをチェック
 * @param {Object} params - 選択されたパラメータ
 * @returns {Object} エラー情報（isValid: boolean, message: string）
 */
export function validateCryptoParams(params) {
    const { keyType, keySize, outputFormat } = params;

    // EdDSAの鍵サイズ制約
    if (keyType === 'eddsa') {
        if (keySize === 'Ed25519' && outputFormat === 'ssh') {
            return { isValid: true };
        }
        if (keySize !== 'Ed25519' && outputFormat === 'ssh') {
            return {
                isValid: false,
                message: 'SSHはEd25519のみサポートしています。'
            };
        }
    }

    // RSAの鍵サイズ制約
    if (keyType === 'rsa') {
        const size = parseInt(keySize);
        if (![2048, 3072, 4096].includes(size)) {
            return {
                isValid: false,
                message: 'RSAの鍵サイズは2048/3072/4096ビットのみサポートしています。'
            };
        }
    }

    // ECDSAの曲線制約
    if (keyType === 'ecdsa' && !['P-256', 'P-384'].includes(keySize)) {
        return {
            isValid: false,
            message: 'ECDSAはP-256/P-384のみサポートしています。'
        };
    }

    return { isValid: true };
}

/**
 * 出力形式の制約をチェック
 * @param {Object} params - 選択されたパラメータ
 * @returns {Object} エラー情報（isValid: boolean, message: string）
 */
export function validateOutputFormat(params) {
    const { keyType, keySize, outputFormat } = params;

    // SSHの制約
    if (outputFormat === 'ssh') {
        if (!['rsa', 'ecdsa'].includes(keyType) && 
            !(keyType === 'eddsa' && keySize === 'Ed25519')) {
            return {
                isValid: false,
                message: 'SSH形式はRSA、ECDSA、Ed25519のみサポートしています。'
            };
        }
    }

    return { isValid: true };
}

/**
 * パスフレーズの制約をチェック
 * @param {Object} params - 選択されたパラメータ
 * @returns {Object} エラー情報（isValid: boolean, message: string）
 */
export function validatePassphrase(params) {
    const { outputFormat, passphrase } = params;

    // パスフレーズが必要な形式
    if (['pem', 'pgp'].includes(outputFormat) && passphrase) {
        if (passphrase.length < 8) {
            return {
                isValid: false,
                message: 'パスフレーズは8文字以上必要です。'
            };
        }
    }

    return { isValid: true };
}

/**
 * 全てのパラメータの組み合わせを検証
 * @param {Object} params - 選択されたパラメータ
 * @returns {Object} エラー情報（isValid: boolean, message: string）
 */
export function validateAll(params) {
    const cryptoCheck = validateCryptoParams(params);
    if (!cryptoCheck.isValid) return cryptoCheck;

    const formatCheck = validateOutputFormat(params);
    if (!formatCheck.isValid) return formatCheck;

    const passphraseCheck = validatePassphrase(params);
    if (!passphraseCheck.isValid) return passphraseCheck;

    return { isValid: true };
}

/**
 * エラーメッセージを生成
 * @param {Error} error - エラーオブジェクト
 * @returns {string} ユーザーフレンドリーなエラーメッセージ
 */
export function formatError(error) {
    // 既知のエラータイプを判定
    if (error.name === 'NotSupportedError') {
        return '選択された暗号方式はこのブラウザでサポートされていません。';
    }
    if (error.name === 'QuotaExceededError') {
        return 'メモリ制限を超えました。小さい鍵サイズを選択してください。';
    }
    
    // デフォルトメッセージ
    return error.message || 'エラーが発生しました。';
} 