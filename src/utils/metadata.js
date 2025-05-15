/**
 * メタデータ生成に関するユーティリティ関数群
 */

/**
 * 鍵生成のメタデータを作成
 * @param {Object} params - 鍵生成パラメータ
 * @returns {Object} メタデータオブジェクト
 */
export function createMetadata(params) {
    const { keyType, keySize, outputFormat, passphrase } = params;
    
    return {
        // 基本情報
        type: keyType,
        size: keySize,
        format: outputFormat,
        generated: new Date().toISOString(),
        hasPassphrase: !!passphrase,

        // セキュリティ情報
        security: getSecurityInfo(keyType, keySize),

        // 用途情報
        usage: getUsageInfo(keyType, outputFormat),

        // 互換性情報
        compatibility: getCompatibilityInfo(keyType, outputFormat)
    };
}

/**
 * セキュリティ情報を取得
 * @param {string} keyType - 暗号方式
 * @param {string} keySize - 鍵サイズ
 * @returns {Object} セキュリティ情報
 */
function getSecurityInfo(keyType, keySize) {
    const info = {
        bitStrength: 0,
        recommendation: '',
        standards: []
    };

    switch (keyType) {
        case 'rsa':
            info.bitStrength = parseInt(keySize);
            info.standards = ['PKCS#1', 'FIPS 186-4'];
            if (keySize === '2048') {
                info.recommendation = '一般的な用途に適しています（～2030年）';
            } else if (keySize === '3072') {
                info.recommendation = '長期保存に適しています（～2040年）';
            } else if (keySize === '4096') {
                info.recommendation = '最高レベルのセキュリティを提供します';
            }
            break;

        case 'ecdsa':
            info.standards = ['NIST FIPS 186-4', 'RFC 8422', 'SEC 2'];
            if (keySize === 'P-256') {
                info.bitStrength = 128;
                info.recommendation = 'TLS/SSLに最適です（～2030年）';
            } else if (keySize === 'P-384') {
                info.bitStrength = 192;
                info.recommendation = '政府システムに推奨されます';
            }
            break;

        case 'eddsa':
            info.standards = ['RFC 8032'];
            if (keySize === 'Ed25519') {
                info.bitStrength = 128;
                info.recommendation = 'SSHやブロックチェーンに最適です';
            } else if (keySize === 'Ed448') {
                info.bitStrength = 224;
                info.recommendation = '長期的なセキュリティが必要な場合に推奨';
            }
            break;
    }

    return info;
}

/**
 * 用途情報を取得
 * @param {string} keyType - 暗号方式
 * @param {string} outputFormat - 出力形式
 * @returns {Object} 用途情報
 */
function getUsageInfo(keyType, outputFormat) {
    const usage = {
        signing: false,
        encryption: false,
        keyExchange: false,
        authentication: false,
        recommended: []
    };

    switch (keyType) {
        case 'rsa':
            usage.signing = true;
            usage.encryption = true;
            usage.keyExchange = true;
            usage.authentication = true;
            usage.recommended = ['TLS証明書', 'メール暗号化', 'ファイル暗号化'];
            break;

        case 'ecdsa':
            usage.signing = true;
            usage.authentication = true;
            usage.recommended = ['TLS証明書', 'ブロックチェーン署名'];
            break;

        case 'eddsa':
            usage.signing = true;
            usage.authentication = true;
            usage.recommended = ['SSH認証', 'ブロックチェーン署名'];
            break;
    }

    // 出力形式に基づく推奨用途の追加
    switch (outputFormat) {
        case 'pem':
            usage.recommended.push('OpenSSL操作');
            break;
        case 'ssh':
            usage.recommended.push('SSHサーバー認証');
            break;
        case 'jwk':
            usage.recommended.push('Webアプリケーション');
            break;
        case 'pgp':
            usage.recommended.push('メール暗号化');
            break;
    }

    return usage;
}

/**
 * 互換性情報を取得
 * @param {string} keyType - 暗号方式
 * @param {string} outputFormat - 出力形式
 * @returns {Object} 互換性情報
 */
function getCompatibilityInfo(keyType, outputFormat) {
    const compatibility = {
        browsers: [],
        tools: [],
        libraries: []
    };

    // ブラウザ互換性
    compatibility.browsers = [
        'Chrome 69+',
        'Firefox 60+',
        'Safari 12.1+',
        'Edge 79+'
    ];

    // ツール互換性
    switch (outputFormat) {
        case 'pem':
            compatibility.tools = ['OpenSSL', 'GnuPG', 'Keytool'];
            break;
        case 'ssh':
            compatibility.tools = ['OpenSSH', 'PuTTY'];
            break;
        case 'jwk':
            compatibility.tools = ['Web Crypto API', 'Node.js Crypto'];
            break;
        case 'pgp':
            compatibility.tools = ['GnuPG', 'Mailvelope', 'Enigmail'];
            break;
    }

    // ライブラリ互換性
    compatibility.libraries = [
        'OpenSSL',
        'Web Crypto API',
        'Node.js Crypto',
        'Bouncy Castle'
    ];

    if (keyType === 'eddsa') {
        compatibility.libraries.push('libsodium');
    }

    return compatibility;
}

/**
 * ファイル名を生成
 * @param {Object} params - 鍵生成パラメータ
 * @returns {Object} ファイル名情報
 */
export function generateFilenames(params) {
    const { keyType, keySize, outputFormat } = params;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const prefix = `${keyType}_${keySize}_${timestamp}`;
    const extension = outputFormat === 'jwk' ? 'json' : outputFormat;

    return {
        public: `${prefix}_public.${extension}`,
        private: `${prefix}_private.${extension}`,
        metadata: `${prefix}_metadata.json`,
        zip: `${prefix}_keys.zip`
    };
} 