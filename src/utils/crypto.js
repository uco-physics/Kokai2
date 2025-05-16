/**
 * 暗号鍵生成に関するユーティリティ関数群
 * Web Crypto API、node-forge、openpgp.jsを使用
 */
import * as openpgp from 'openpgp';
import * as forge from 'node-forge';

/**
 * RSA鍵ペアを生成
 * @param {number} size - 鍵サイズ（2048/3072/4096）
 * @returns {Promise<CryptoKeyPair>} 生成された鍵ペア
 */
export async function generateRSAKeyPair(size) {
    try {
        // 鍵サイズの検証
        if (![2048, 3072, 4096].includes(Number(size))) {
            throw new Error('RSAの鍵サイズは2048/3072/4096ビットのみ対応しています');
        }

        return await window.crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: size,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256',
            },
            true,
            ['encrypt', 'decrypt']
        );
    } catch (error) {
        console.error('RSA鍵生成エラー:', error);
        throw error;
    }
}

/**
 * ECDSA鍵ペアを生成
 * @param {string} curve - 楕円曲線（'P-256'/'P-384'）
 * @returns {Promise<CryptoKeyPair>} 生成された鍵ペア
 */
export async function generateECDSAKeyPair(curve) {
    try {
        // 曲線の検証
        if (!['P-256', 'P-384'].includes(curve)) {
            throw new Error('ECDSAはP-256/P-384のみ対応しています');
        }

        return await window.crypto.subtle.generateKey(
            {
                name: 'ECDSA',
                namedCurve: curve,
            },
            true,
            ['sign', 'verify']
        );
    } catch (error) {
        console.error('ECDSA鍵生成エラー:', error);
        throw error;
    }
}

/**
 * EdDSA鍵ペアを生成
 * @param {string} curve - 楕円曲線（'Ed25519'）
 * @returns {Promise<Object>} 生成された鍵ペア
 */
export async function generateEdDSAKeyPair(curve) {
    try {
        // 曲線の検証
        if (curve !== 'Ed25519') {
            throw new Error('EdDSAはEd25519のみ対応しています');
        }

        return await openpgp.generateKey({
            type: curve.toLowerCase(),
            format: 'object'
        });
    } catch (error) {
        console.error('EdDSA鍵生成エラー:', error);
        throw error;
    }
}

/**
 * 鍵をPEM形式に変換
 * @param {CryptoKeyPair} keyPair - 変換する鍵ペア
 * @param {string} passphrase - 秘密鍵暗号化用パスフレーズ（オプション）
 * @returns {Promise<Object>} PEM形式の公開鍵と秘密鍵
 */
/**
 * 鍵をPEM形式に変換
 * @param {CryptoKeyPair} keyPair - 変換する鍵ペア（{ publicKey, privateKey }）
 * @param {string} passphrase - 秘密鍵暗号化用パスフレーズ（オプション）
 * @returns {Promise<Object>} PEM形式の公開鍵と秘密鍵
 */
export async function convertToPEM(keyPair, passphrase = '') {
    try {
        // 入力の検証
        if (!keyPair || !keyPair.publicKey || !keyPair.privateKey) {
            throw new Error('無効な鍵ペア: publicKeyまたはprivateKeyが欠けています');
        }

        // 公開鍵をSPKI形式でエクスポート
        const spki = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
        // 秘密鍵をPKCS#8形式でエクスポート
        const pkcs8 = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

        // node-forgeでPEM形式に変換
        const publicPem = forge.pki.publicKeyToPem(
            forge.pki.publicKeyFromAsn1(
                forge.asn1.fromDer(forge.util.createBuffer(new Uint8Array(spki)))
            )
        );

        let privatePem = forge.pki.privateKeyToPem(
            forge.pki.privateKeyFromAsn1(
                forge.asn1.fromDer(forge.util.createBuffer(new Uint8Array(pkcs8)))
            )
        );

        // パスフレーズが指定されている場合、秘密鍵を暗号化
        if (passphrase) {
            privatePem = forge.pki.encryptRsaPrivateKey(
                forge.pki.privateKeyFromPem(privatePem),
                passphrase,
                { algorithm: 'aes256' }
            );
        }

        return { publicKey: publicPem, privateKey: privatePem };
    } catch (error) {
        console.error('PEM変換エラー:', error);
        throw error;
    }
}

/**
 * 鍵をJWK形式に変換
 * @param {CryptoKeyPair} keyPair - 変換する鍵ペア
 * @returns {Promise<Object>} JWK形式の公開鍵と秘密鍵
 */
export async function convertToJWK(keyPair) {
    try {
        const publicJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
        const privateJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);

        return {
            publicKey: JSON.stringify(publicJwk, null, 2),
            privateKey: JSON.stringify(privateJwk, null, 2)
        };
    } catch (error) {
        console.error('JWK変換エラー:', error);
        throw error;
    }
}

/**
 * 鍵をSSH形式に変換
 * @param {CryptoKeyPair} keyPair - 変換する鍵ペア
 * @param {string} passphrase - 秘密鍵暗号化用パスフレーズ（オプション）
 * @returns {Promise<Object>} SSH形式の公開鍵と秘密鍵
 */
export async function convertToSSH(keyPair, passphrase = '') {
    try {
        const publicKey = forge.ssh.publicKeyToOpenSSH(keyPair.publicKey);
        const privateKey = passphrase
            ? forge.ssh.privateKeyToOpenSSH(keyPair.privateKey, passphrase)
            : forge.ssh.privateKeyToPem(keyPair.privateKey);

        return { publicKey, privateKey };
    } catch (error) {
        console.error('SSH変換エラー:', error);
        throw error;
    }
}

/**
 * 鍵をOpenPGP形式に変換
 * @param {Object} options - OpenPGP鍵生成オプション
 * @returns {Promise<Object>} OpenPGP形式の公開鍵と秘密鍵
 */
export async function convertToOpenPGP(options) {
    try {
        const { publicKey, privateKey } = await openpgp.generateKey({
            userIds: [{ name: options.name, email: options.email }],
            type: options.type,
            passphrase: options.passphrase,
            format: 'armored'
        });

        return { publicKey, privateKey };
    } catch (error) {
        console.error('OpenPGP変換エラー:', error);
        throw error;
    }
}

/**
 * メタデータを生成
 * @param {Object} params - 鍵生成パラメータ
 * @returns {Object} メタデータオブジェクト
 */
export function generateMetadata(params) {
    return {
        type: params.keyType,
        size: params.keySize,
        format: params.outputFormat,
        generated: new Date().toISOString(),
        hasPassphrase: !!params.passphrase
    };
} 