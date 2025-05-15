/**
 * 出力形式選択コンポーネント
 */
import { useState } from 'react';
import { validateOutputFormat } from '../utils/errorHandler';

/**
 * 出力形式の選択肢を定義
 */
const outputFormats = [
    {
        value: 'pem',
        label: 'PEM',
        description: 'PKCS#8/SPKI形式（OpenSSL互換）',
        details: {
            title: 'Privacy Enhanced Mail形式',
            description: `
                最も広く使用されている鍵形式です。
                Base64エンコードされたASN.1形式で、
                ヘッダーとフッターで囲まれています。
            `,
            features: [
                'OpenSSLと完全互換',
                'テキストベースで可読性が高い',
                'パスフレーズによる暗号化が可能',
                '多くのツールでサポート'
            ],
            useCases: [
                'TLS/SSL証明書',
                'SSH鍵',
                'S/MIME証明書',
                '一般的な暗号化/署名'
            ]
        }
    },
    {
        value: 'jwk',
        label: 'JWK',
        description: 'JSON Web Key形式（Web API向け）',
        details: {
            title: 'JSON Web Key形式',
            description: `
                Web APIやJWTで使用される標準的なJSON形式です。
                Web Crypto APIと直接互換性があり、
                Webアプリケーションでの使用に最適です。
            `,
            features: [
                'JSON形式で扱いやすい',
                'Web Crypto API互換',
                'JWT/JWSでの使用に最適',
                'Base64URLエンコード'
            ],
            useCases: [
                'Webアプリケーション',
                'JWT署名/検証',
                'ブラウザベースの暗号化',
                'REST API認証'
            ]
        }
    },
    {
        value: 'ssh',
        label: 'SSH',
        description: 'OpenSSH形式（サーバー認証用）',
        details: {
            title: 'OpenSSH鍵形式',
            description: `
                SSHサーバーの認証に使用される標準形式です。
                公開鍵は authorized_keys に、
                秘密鍵は id_rsa などのファイルに保存されます。
            `,
            features: [
                'OpenSSHと完全互換',
                'パスフレーズ保護対応',
                '一般的なSSHクライアントで使用可能',
                'Base64エンコード'
            ],
            useCases: [
                'SSHサーバー認証',
                'GitHubアクセス',
                'サーバー管理',
                'リモートログイン'
            ]
        }
    },
    {
        value: 'pgp',
        label: 'OpenPGP',
        description: 'PGP/GPG形式（メール暗号化用）',
        details: {
            title: 'OpenPGP鍵形式',
            description: `
                メールの暗号化や署名に使用される標準形式です。
                GnuPGなどのPGPツールと互換性があり、
                エンドツーエンドの暗号化に使用されます。
            `,
            features: [
                'GnuPG/PGP互換',
                'ASCII Armor形式',
                'パスフレーズ保護対応',
                'メール暗号化に最適'
            ],
            useCases: [
                'メール暗号化',
                'ファイル署名',
                'ソフトウェア配布',
                'セキュアな通信'
            ]
        }
    }
];

/**
 * Step3コンポーネント
 * @param {Object} props - プロパティ
 * @param {string} props.keyType - 選択された暗号方式
 * @param {string} props.keySize - 選択された鍵サイズ
 * @param {function} props.onSelect - 選択時のコールバック
 * @param {string} props.selected - 現在選択されている値
 * @param {function} props.onBack - 戻るボタンのコールバック
 * @param {string} props.language - 表示言語
 */
export default function Step3({ keyType, keySize, onSelect, selected, onBack, language }) {
    const [showDetails, setShowDetails] = useState(null);
    const [error, setError] = useState('');

    // 言語に応じたテキストを取得
    const texts = {
        ja: {
            title: '出力形式の選択',
            subtitle: '用途に応じて適切な出力形式を選択してください',
            details: '詳細',
            features: '主な特徴',
            useCases: '使用例',
            back: '戻る',
            close: '閉じる',
            error: 'この形式は選択された暗号方式では使用できません'
        },
        en: {
            title: 'Select Output Format',
            subtitle: 'Choose the appropriate output format for your use case',
            details: 'Details',
            features: 'Features',
            useCases: 'Use Cases',
            back: 'Back',
            close: 'Close',
            error: 'This format is not available for the selected cryptography type'
        }
    }[language];

    // 形式の選択時の処理
    const handleSelect = (format) => {
        const validation = validateOutputFormat({ keyType, keySize, outputFormat: format });
        if (!validation.isValid) {
            setError(validation.message);
            return;
        }
        setError('');
        onSelect(format);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">{texts.title}</h2>
                <p className="text-gray-600 mt-2">{texts.subtitle}</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {outputFormats.map(format => {
                    const validation = validateOutputFormat({
                        keyType,
                        keySize,
                        outputFormat: format.value
                    });
                    const isDisabled = !validation.isValid;

                    return (
                        <div key={format.value} className="relative">
                            <button
                                onClick={() => handleSelect(format.value)}
                                disabled={isDisabled}
                                className={`w-full p-4 border rounded-lg transition-colors ${
                                    isDisabled
                                        ? 'bg-gray-100 cursor-not-allowed opacity-60'
                                        : selected === format.value
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:bg-blue-50'
                                }`}
                            >
                                <div className="font-bold text-lg">{format.label}</div>
                                <div className="text-sm text-gray-600 mt-1">{format.description}</div>
                            </button>
                            <button
                                onClick={() => setShowDetails(format.value)}
                                disabled={isDisabled}
                                className={`absolute top-2 right-2 p-1 ${
                                    isDisabled
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                                aria-label={`${texts.details}: ${format.label}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-start">
                <button
                    onClick={onBack}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800"
                >
                    {texts.back}
                </button>
            </div>

            {/* 詳細モーダル */}
            {showDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold">
                                {outputFormats.find(f => f.value === showDetails).details.title}
                            </h3>
                            <button
                                onClick={() => setShowDetails(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            <p className="text-gray-600">
                                {outputFormats.find(f => f.value === showDetails).details.description}
                            </p>

                            <div>
                                <h4 className="font-bold">{texts.features}:</h4>
                                <ul className="list-disc list-inside mt-2">
                                    {outputFormats
                                        .find(f => f.value === showDetails)
                                        .details.features.map((feature, index) => (
                                            <li key={index} className="text-gray-600">{feature}</li>
                                        ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold">{texts.useCases}:</h4>
                                <ul className="list-disc list-inside mt-2">
                                    {outputFormats
                                        .find(f => f.value === showDetails)
                                        .details.useCases.map((useCase, index) => (
                                            <li key={index} className="text-gray-600">{useCase}</li>
                                        ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => setShowDetails(null)}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {texts.close}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 