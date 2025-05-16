/**
 * 暗号鍵生成に関するユーティリティ関数群
 * Web Crypto API、node-forge、openpgp.jsを使用し、RSA、ECDSA、EdDSAの鍵ペアを生成
 * パラメータに基づき、指定された形式（PEM/JWK/SSH/OpenPGP）で直接生成
 * 初心者向けに詳細なコメントを付与
 */
import * as openpgp from 'openpgp';
import * as forge from 'node-forge';

/**
 * RSA鍵ペアを生成
 * @param {Object} params - 鍵生成パラメータ
 * @param {string} params.keySize - 鍵サイズ（2048/3072/4096）
 * @param {string} params.outputFormat - 出力形式（pem/jwk/ssh/pgp）
 * @param {string} [params.passphrase] - 秘密鍵暗号化用パスフレーズ
 * @returns {Promise<Object>} 生成された鍵ペア（{ publicKey, privateKey }）
 */
export async function generateRSAKeyPair({ keySize, outputFormat, passphrase = '' }) {
    try {
        const size = Number(keySize);
        if (![2048, 3072, 4096].includes(size)) {
            throw new Error('RSAの鍵サイズは2048/3072/4096ビットのみ対応しています');
        }

        if (!['pem', 'jwk', 'ssh', 'pgp'].includes(outputFormat)) {
            throw new Error('無効な出力形式: pem/jwk/ssh/pgpを指定してください');
        }

        let publicKey, privateKey;

        if (outputFormat === 'pgp') {
            // OpenPGP形式: openpgp.jsで直接生成
            const { publicKey: pub, privateKey: priv } = await openpgp.generateKey({
                type: 'rsa',
                rsaBits: size,
                userIds: [{ name: 'Generated Key', email: 'generated@example.com' }],
                passphrase,
                format: 'armored',
            });
            publicKey = pub;
            privateKey = priv;
        } else {
            // Web Crypto APIでRSA鍵を生成（PEM/JWK/SSH用）
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: 'RSA-OAEP',
                    modulusLength: size,
                    publicExponent: new Uint8Array([1, 0, 1]), // 65537
                    hash: 'SHA-256',
                },
                true,
                ['encrypt', 'decrypt']
            );

            // SPKI/PKCS#8をエクスポート
            const spki = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
            const pkcs8 = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

            // node-forgeでパース
            const forgePublicKey = forge.pki.publicKeyFromAsn1(
                forge.asn1.fromDer(forge.util.createBuffer(new Uint8Array(spki)))
            );
            const forgePrivateKey = forge.pki.privateKeyFromAsn1(
                forge.asn1.fromDer(forge.util.createBuffer(new Uint8Array(pkcs8)))
            );

            switch (outputFormat) {
                case 'pem':
                    publicKey = forge.pki.publicKeyToPem(forgePublicKey);
                    privateKey = forge.pki.privateKeyToPem(forgePrivateKey);
                    if (passphrase) {
                        privateKey = forge.pki.encryptRsaPrivateKey(
                            forgePrivateKey,
                            passphrase,
                            { algorithm: 'aes256' }
                        );
                    }
                    break;
                case 'jwk':
                    publicKey = JSON.stringify(await window.crypto.subtle.exportKey('jwk', keyPair.publicKey), null, 2);
                    privateKey = JSON.stringify(await window.crypto.subtle.exportKey('jwk', keyPair.privateKey), null, 2);
                    break;
                case 'ssh':
                    publicKey = forge.ssh.publicKeyToOpenSSH(forgePublicKey, 'rsa', 'generated@example.com');
                    privateKey = forge.ssh.privateKeyToOpenSSH(forgePrivateKey, passphrase || undefined);
                    break;
            }
        }

        return { publicKey, privateKey };
    } catch (error) {
        console.error('[RSA鍵生成エラー]', error);
        throw error;
    }
}

/**
 * ECDSA鍵ペアを生成
 * @param {Object} params - 鍵生成パラメータ
 * @param {string} params.keySize - 楕円曲線（P-256/P-384）
 * @param {string} params.outputFormat - 出力形式（pem/jwk/ssh/pgp）
 * @param {string} [params.passphrase] - 秘密鍵暗号化用パスフレーズ
 * @returns {Promise<Object>} 生成された鍵ペア（{ publicKey, privateKey }）
 */
export async function generateECDSAKeyPair({ keySize, outputFormat, passphrase = '' }) {
    try {
        if (!['P-256', 'P-384'].includes(keySize)) {
            throw new Error('ECDSAはP-256/P-384のみ対応しています');
        }

        if (!['pem', 'jwk', 'ssh', 'pgp'].includes(outputFormat)) {
            throw new Error('無効な出力形式: pem/jwk/ssh/pgpを指定してください');
        }

        let publicKey, privateKey;

        if (outputFormat === 'pgp') {
            // OpenPGP形式: openpgp.jsで直接生成
            const { publicKey: pub, privateKey: priv } = await openpgp.generateKey({
                type: keySize.toLowerCase(),
                userIds: [{ name: 'Generated Key', email: 'generated@example.com' }],
                passphrase,
                format: 'armored',
            });
            publicKey = pub;
            privateKey = priv;
        } else {
            // Web Crypto APIでECDSA鍵を生成（PEM/JWK/SSH用）
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: 'ECDSA',
                    namedCurve: keySize,
                },
                true,
                ['sign', 'verify']
            );

            // SPKI/PKCS#8をエクスポート
            const spki = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
            const pkcs8 = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

            // node-forgeでパース
            const forgePublicKey = forge.pki.publicKeyFromAsn1(
                forge.asn1.fromDer(forge.util.createBuffer(new Uint8Array(spki)))
            );
            const forgePrivateKey = forge.pki.privateKeyFromAsn1(
                forge.asn1.fromDer(forge.util.createBuffer(new Uint8Array(pkcs8)))
            );

            switch (outputFormat) {
                case 'pem':
                    publicKey = forge.pki.publicKeyToPem(forgePublicKey);
                    privateKey = forge.pki.privateKeyToPem(forgePrivateKey);
                    if (passphrase) {
                        privateKey = forge.pki.encryptPemPrivateKey(
                            forgePrivateKey,
                            passphrase,
                            { algorithm: 'aes256' }
                        );
                    }
                    break;
                case 'jwk':
                    publicKey = JSON.stringify(await window.crypto.subtle.exportKey('jwk', keyPair.publicKey), null, 2);
                    privateKey = JSON.stringify(await window.crypto.subtle.exportKey('jwk', keyPair.privateKey), null, 2);
                    break;
                case 'ssh':
                    publicKey = forge.ssh.publicKeyToOpenSSH(
                        forgePublicKey,
                        `ecdsa-sha2-nistp${keySize.toLowerCase().replace('p-', '')}`,
                        'generated@example.com'
                    );
                    privateKey = forge.ssh.privateKeyToOpenSSH(forgePrivateKey, passphrase || undefined);
                    break;
            }
        }

        return { publicKey, privateKey };
    } catch (error) {
        console.error('[ECDSA鍵生成エラー]', error);
        throw error;
    }
}

/**
 * EdDSA鍵ペアを生成
 * @param {Object} params - 鍵生成パラメータ
 * @param {string} params.keySize - 楕円曲線（Ed25519/Ed448）
 * @param {string} params.outputFormat - 出力形式（pem/ssh/pgp）
 * @param {string} [params.passphrase] - 秘密鍵暗号化用パスフレーズ
 * @returns {Promise<Object>} 生成された鍵ペア（{ publicKey, privateKey }）
 */
export async function generateEdDSAKeyPair({ keySize, outputFormat, passphrase = '' }) {
    try {
        if (!['Ed25519', 'Ed448'].includes(keySize)) {
            throw new Error('EdDSAはEd25519/Ed448のみ対応しています');
        }

        if (!['pem', 'ssh', 'pgp'].includes(outputFormat)) {
            throw new Error('無効な出力形式: pem/ssh/pgpを指定してください (EdDSAはJWK非対応)');
        }

        // openpgp.jsでEdDSA鍵を生成
        const key = await openpgp.generateKey({
            type: keySize.toLowerCase(),
            userIds: [{ name: 'Generated Key', email: 'generated@example.com' }],
            passphrase,
            format: 'armored',
        });

        let publicKey, privateKey;

        switch (outputFormat) {
            case 'pem':
            case 'pgp':
                publicKey = key.publicKey;
                privateKey = key.privateKey;
                break;
            case 'ssh':
                const pubKey = await openpgp.readKey({ armoredKey: key.publicKey });
                const publicKeyBytes = pubKey.toPacketList().write();
                publicKey = `ssh-${keySize.toLowerCase()} ${Buffer.from(publicKeyBytes).toString('base64')} generated@example.com`;
                privateKey = key.privateKey; // 簡易形式（PGP形式）
                break;
        }

        return { publicKey, privateKey };
    } catch (error) {
        console.error('[EdDSA鍵生成エラー]', error);
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