/**
 * 暗号方式選択コンポーネント
 */
import { useState } from 'react';

/**
 * 暗号方式の選択肢を定義
 */
const keyTypes = [
    {
        value: 'rsa',
        label: 'RSA',
        description: 'RSA (PKCS#1, RSA-PSS/RSA-OAEP)',
        details: {
            title: 'RSA暗号',
            description: `
                最も広く使われている公開鍵暗号方式です。
                暗号化と署名の両方に使用でき、互換性が高いのが特徴です。
                2048ビット以上の鍵サイズを推奨します。
            `,
            useCases: [
                'TLS/SSL証明書',
                'メール暗号化（S/MIME）',
                'デジタル署名',
                'セキュアな通信'
            ],
            security: '2048ビットで128ビット相当のセキュリティを提供'
        }
    },
    {
        value: 'ecdsa',
        label: 'ECDSA',
        description: 'ECDSA (NIST P-256/P-384)',
        details: {
            title: '楕円曲線デジタル署名アルゴリズム',
            description: `
                RSAより小さい鍵サイズで同等のセキュリティを提供します。
                署名生成が高速で、モバイルデバイスに適しています。
                P-256は一般的な用途に、P-384はより高いセキュリティが必要な場合に使用します。
            `,
            useCases: [
                'TLS/SSL証明書',
                'ブロックチェーン',
                'IoTデバイス認証',
                'モバイルアプリケーション'
            ],
            security: 'P-256で128ビット、P-384で192ビット相当のセキュリティを提供'
        }
    },
    {
        value: 'eddsa',
        label: 'EdDSA',
        description: 'EdDSA (Ed25519/Ed448)',
        details: {
            title: 'Edwards-curve デジタル署名アルゴリズム',
            description: `
                最新の楕円曲線署名方式です。
                高速で安全な実装が容易なのが特徴です。
                Ed25519は一般的な用途に、Ed448はより高いセキュリティが必要な場合に使用します。
            `,
            useCases: [
                'SSH認証',
                'ブロックチェーン',
                'セキュアメッセージング',
                'ソフトウェア署名'
            ],
            security: 'Ed25519で128ビット、Ed448で224ビット相当のセキュリティを提供'
        }
    }
];

/**
 * Step1コンポーネント
 * @param {Object} props - プロパティ
 * @param {function} props.onSelect - 選択時のコールバック
 * @param {string} props.selected - 現在選択されている値
 * @param {string} props.language - 表示言語
 */
export default function Step1({ onSelect, selected, language }) {
    const [showDetails, setShowDetails] = useState(null);

    // 言語に応じたテキストを取得
    const texts = {
        ja: {
            title: '暗号方式の選択',
            subtitle: '用途に応じて適切な暗号方式を選択してください',
            details: '詳細',
            useCases: '主な用途',
            security: 'セキュリティレベル',
            close: '閉じる'
        },
        en: {
            title: 'Select Cryptography Type',
            subtitle: 'Choose the appropriate cryptography type for your use case',
            details: 'Details',
            useCases: 'Use Cases',
            security: 'Security Level',
            close: 'Close'
        }
    }[language];

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">{texts.title}</h2>
                <p className="text-gray-600 mt-2">{texts.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {keyTypes.map(type => (
                    <div key={type.value} className="relative">
                        <button
                            onClick={() => onSelect(type.value)}
                            className={`w-full p-4 border rounded-lg hover:bg-blue-50 transition-colors ${
                                selected === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            }`}
                        >
                            <div className="font-bold text-lg">{type.label}</div>
                            <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                        </button>
                        <button
                            onClick={() => setShowDetails(type.value)}
                            className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
                            aria-label={`${texts.details}: ${type.label}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* 詳細モーダル */}
            {showDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold">
                                {keyTypes.find(t => t.value === showDetails).details.title}
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
                                {keyTypes.find(t => t.value === showDetails).details.description}
                            </p>

                            <div>
                                <h4 className="font-bold">{texts.useCases}:</h4>
                                <ul className="list-disc list-inside mt-2">
                                    {keyTypes.find(t => t.value === showDetails).details.useCases.map((use, index) => (
                                        <li key={index} className="text-gray-600">{use}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold">{texts.security}:</h4>
                                <p className="text-gray-600 mt-1">
                                    {keyTypes.find(t => t.value === showDetails).details.security}
                                </p>
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