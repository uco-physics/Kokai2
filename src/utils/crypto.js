/**
 * 暗号鍵生成に関するユーティリティ関数群
 * Web Crypto API、node-forge、openpgp.jsを使用し、RSA、ECDSA、EdDSAの鍵ペアを生成・変換
 * 初心者向けに詳細なコメントを付与
 */
import * as openpgp from 'openpgp';
import * as forge from 'node-forge';

/**
 * RSA鍵ペアを生成
 * @param {number|string} size - 鍵サイズ（2048/3072/4096）
 * @returns {Promise<CryptoKeyPair>} 生成された鍵ペア（{ publicKey, privateKey }）
 */
export async function generateRSAKeyPair(size) {
    try {
        const keySize = Number(size); // 文字列を数値に変換（例: "2048" -> 2048）
        if (![2048, 3072, 4096].includes(keySize)) {
            throw new Error('RSAの鍵サイズは2048/3072/4096ビットのみ対応しています');
        }

        return await window.crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP', // 暗号化/復号用（RSA-PSSも互換性あり）
                modulusLength: keySize,
                publicExponent: new Uint8Array([1, 0, 1]), // 標準的な公開指数: 65537
                hash: 'SHA-256',
            },
            true, // 鍵をエクスポート可能にする
            ['encrypt', 'decrypt']
        );
    } catch (error) {
        console.error('[RSA鍵生成エラー]', error);
        throw error;
    }
}

/**
 * ECDSA鍵ペアを生成
 * @param {string} curve - 楕円曲線（'P-256'/'P-384'）
 * @returns {Promise<CryptoKeyPair>} 生成された鍵ペア（{ publicKey, privateKey }）
 */
export async function generateECDSAKeyPair(curve) {
    try {
        if (!['P-256', 'P-384'].includes(curve)) {
            throw new Error('ECDSAはP-256/P-384のみ対応しています');
        }

        return await window.crypto.subtle.generateKey(
            {
                name: 'ECDSA',
                namedCurve: curve,
            },
            true, // 鍵をエクスポート可能にする
            ['sign', 'verify']
        );
    } catch (error) {
        console.error('[ECDSA鍵生成エラー]', error);
        throw error;
    }
}

/**
 * EdDSA鍵ペアを生成
 * @param {string} curve - 楕円曲線（'Ed25519'/'Ed448'）
 * @returns {Promise<Object>} 生成された鍵ペア（openpgp.js形式）
 */
export async function generateEdDSAKeyPair(curve) {
    try {
        if (!['Ed25519', 'Ed448'].includes(curve)) {
            throw new Error('EdDSAはEd25519/Ed448のみ対応しています');
        }

        const key = await openpgp.generateKey({
            type: curve.toLowerCase(), // openpgp.jsは小文字を期待
            userIds: [{ name: 'Generated Key', email: 'generated@example.com' }],
            format: 'object',
        });

        return {
            publicKey: key.publicKey,
            privateKey: key.privateKey,
        };
    } catch (error) {
        console.error('[EdDSA鍵生成エラー]', error);
        throw error;
    }
}

/**
 * 鍵をPEM形式に変換
 * @param {CryptoKeyPair|Object} keyPair - 変換する鍵ペア（{ publicKey, privateKey }）
 * @param {string} [passphrase] - 秘密鍵暗号化用パスフレーズ（オプション）
 * @returns {Promise<Object>} PEM形式の公開鍵と秘密鍵（{ publicKey, privateKey }）
 */
export async function convertToPEM(keyPair, passphrase = '') {
    try {
        if (!keyPair || !keyPair.publicKey || !keyPair.privateKey) {
            throw new Error('無効な鍵ペア: publicKeyまたはprivateKeyが欠けています');
        }

        // Web Crypto APIの鍵をエクスポート（RSAおよびECDSA用）
        let publicPem, privatePem;

        if (keyPair.publicKey instanceof CryptoKey) {
            // Web Crypto APIの鍵（RSA/ECDSA）
            const spki = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
            const pkcs8 = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

            publicPem = forge.pki.publicKeyToPem(
                forge.pki.publicKeyFromAsn1(
                    forge.asn1.fromDer(forge.util.createBuffer(new Uint8Array(spki)))
                )
            );

            privatePem = forge.pki.privateKeyToPem(
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
        } else {
            // openpgp.jsの鍵（EdDSA）
            publicPem = keyPair.publicKey.armor();
            privatePem = keyPair.privateKey.armor();
        }

        return { publicKey: publicPem, privateKey: privatePem };
    } catch (error) {
        console.error('[PEM変換エラー]', error);
        throw error;
    }
}

/**
 * 鍵をJWK形式に変換
 * @param {CryptoKeyPair} keyPair - 変換する鍵ペア（{ publicKey, privateKey }）
 * @returns {Promise<Object>} JWK形式の公開鍵と秘密鍵（{ publicKey, privateKey }）
 */
export async function convertToJWK(keyPair) {
    try {
        if (!keyPair || !keyPair.publicKey || !keyPair.privateKey) {
            throw new Error('無効な鍵ペア: publicKeyまたはprivateKeyが欠けています');
        }

        // Web Crypto APIの鍵のみ対応（EdDSAはJWK非対応）
        if (!(keyPair.publicKey instanceof CryptoKey)) {
            throw new Error('JWK形式はRSAおよびECDSAのみ対応しています');
        }

        const publicJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
        const privateJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);

        return {
            publicKey: JSON.stringify(publicJwk, null, 2),
            privateKey: JSON.stringify(privateJwk, null, 2),
        };
    } catch (error) {
        console.error('[JWK変換エラー]', error);
        throw error;
    }
}

/**
 * 鍵をSSH形式に変換
 * @param {CryptoKeyPair|Object} keyPair - 変換する鍵ペア（{ publicKey, privateKey }）
 * @param {string} [passphrase] - 秘密鍵暗号化用パスフレーズ（オプション）
 * @returns {Promise<Object>} SSH形式の公開鍵と秘密鍵（{ publicKey, privateKey }）
 */
export async function convertToSSH(keyPair, passphrase = '') {
    try {
        if (!keyPair || !keyPair.publicKey || !keyPair.privateKey) {
            throw new Error('無効な鍵ペア: publicKeyまたはprivateKeyが欠けています');
        }

        let publicKey, privateKey;

        if (keyPair.publicKey instanceof CryptoKey) {
            // Web Crypto APIの鍵（RSA/ECDSA）
            const spki = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
            const pkcs8 = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

            const forgePublicKey = forge.pki.publicKeyFromAsn1(
                forge.asn1.fromDer(forge.util.createBuffer(new Uint8Array(spki)))
            );
            const forgePrivateKey = forge.pki.privateKeyFromAsn1(
                forge.asn1.fromDer(forge.util.createBuffer(new Uint8Array(pkcs8)))
            );

            publicKey = forge.ssh.publicKeyToOpenSSH(forgePublicKey);
            privateKey = passphrase
                ? forge.ssh.privateKeyToOpenSSH(forgePrivateKey, passphrase)
                : forge.ssh.privateKeyToPem(forgePrivateKey);
        } else {
            // openpgp.jsの鍵（EdDSA）
            publicKey = keyPair.publicKey.toPacketList().write().toString('base64');
            privateKey = keyPair.privateKey.toPacketList().write().toString('base64');
            if (passphrase) {
                privateKey = await openpgp.encryptKey({
                    privateKey: keyPair.privateKey,
                    passphrase,
                }).then((encryptedKey) => encryptedKey.armor());
            } else {
                privateKey = keyPair.privateKey.armor();
            }
        }

        return { publicKey, privateKey };
    } catch (error) {
        console.error('[SSH変換エラー]', error);
        throw error;
    }
}

/**
 * 鍵をOpenPGP形式に変換
 * @param {CryptoKeyPair|Object} keyPair - 変換する鍵ペア（{ publicKey, privateKey }）
 * @param {string} [passphrase] - 秘密鍵暗号化用パスフレーズ（オプション）
 * @returns {Promise<Object>} OpenPGP形式の公開鍵と秘密鍵（{ publicKey, privateKey }）
 */
export async function convertToOpenPGP(keyPair, passphrase = '') {
    try {
        if (!keyPair || !keyPair.publicKey || !keyPair.privateKey) {
            throw new Error('無効な鍵ペア: publicKeyまたはprivateKeyが欠けています');
        }

        let publicKey, privateKey;

        if (keyPair.publicKey instanceof CryptoKey) {
            // Web Crypto APIの鍵（RSA/ECDSA）をopenpgp.jsで再生成
            const algorithm = keyPair.publicKey.algorithm.name;
            let type;
            if (algorithm === 'RSA-OAEP') {
                type = 'rsa';
            } else if (algorithm === 'ECDSA') {
                type = keyPair.publicKey.algorithm.namedCurve.toLowerCase();
            } else {
                throw new Error('OpenPGP形式への変換はRSAまたはECDSAのみ対応しています');
            }

            const key = await openpgp.generateKey({
                userIds: [{ name: 'Generated Key', email: 'generated@example.com' }],
                type,
                rsaBits: algorithm === 'RSA-OAEP' ? keyPair.publicKey.algorithm.modulusLength : undefined,
                curve: algorithm === 'ECDSA' ? type : undefined,
                passphrase,
                format: 'armored',
            });

            publicKey = key.publicKey;
            privateKey = key.privateKey;
        } else {
            // openpgp.jsの鍵（EdDSA）
            publicKey = keyPair.publicKey.armor();
            privateKey = passphrase
                ? (await openpgp.encryptKey({ privateKey: keyPair.privateKey, passphrase })).armor()
                : keyPair.privateKey.armor();
        }

        return { publicKey, privateKey };
    } catch (error) {
        console.error('[OpenPGP変換エラー]', error);
        throw error;
    }
}

/**
 * メタデータを生成
 * @param {Object} params - 鍵生成パラメータ（keyType, keySize, outputFormat, passphrase）
 * @returns {Object} メタデータオブジェクト
 */
export function generateMetadata(params) {
    return {
        type: params.keyType,
        size: params.keySize,
        format: params.outputFormat,
        generated: new Date().toISOString(),
        hasPassphrase: !!params.passphrase,
    };
}