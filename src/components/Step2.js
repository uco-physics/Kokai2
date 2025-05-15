/**
 * 鍵サイズ選択コンポーネント
 */
import { useState } from 'react';

/**
 * 鍵サイズの選択肢を定義
 */
const keySizes = {
    rsa: [
        {
            value: '2048',
            label: '2048ビット',
            description: '一般的な用途に推奨（～2030年）',
            details: {
                security: '112ビット相当の安全性',
                speed: '生成・処理が比較的高速',
                compatibility: '最も広くサポート',
                recommendation: 'Webサーバー証明書やメール暗号化に最適'
            }
        },
        {
            value: '3072',
            label: '3072ビット',
            description: '長期保存に推奨（～2040年）',
            details: {
                security: '128ビット相当の安全性',
                speed: '2048ビットより約1.5倍遅い',
                compatibility: '主要な暗号ライブラリでサポート',
                recommendation: '長期保存が必要なデータの暗号化に'
            }
        },
        {
            value: '4096',
            label: '4096ビット',
            description: '最高レベルのセキュリティ',
            details: {
                security: '144ビット相当の安全性',
                speed: '2048ビットより約2倍遅い',
                compatibility: '一部のデバイスで処理に時間がかかる',
                recommendation: '最高レベルのセキュリティが必要な場合に'
            }
        }
    ],
    ecdsa: [
        {
            value: 'P-256',
            label: 'P-256',
            description: '一般的な用途に推奨',
            details: {
                security: '128ビット相当の安全性',
                speed: 'RSA 2048ビットより高速',
                compatibility: 'TLS 1.3で推奨',
                recommendation: 'Webサーバー証明書に最適'
            }
        },
        {
            value: 'P-384',
            label: 'P-384',
            description: '政府システムに推奨',
            details: {
                security: '192ビット相当の安全性',
                speed: 'P-256より約1.5倍遅い',
                compatibility: 'NSA Suite B準拠',
                recommendation: '政府システムや高セキュリティ要件に'
            }
        }
    ],
    eddsa: [
        {
            value: 'Ed25519',
            label: 'Ed25519',
            description: 'SSH/ブロックチェーンに最適',
            details: {
                security: '128ビット相当の安全性',
                speed: 'ECDSAより高速で実装が容易',
                compatibility: 'OpenSSH 6.5+でサポート',
                recommendation: 'SSHキーやソフトウェア署名に'
            }
        },
        {
            value: 'Ed448',
            label: 'Ed448',
            description: '長期的なセキュリティ',
            details: {
                security: '224ビット相当の安全性',
                speed: 'Ed25519より約2倍遅い',
                compatibility: 'OpenSSL 1.1.1+でサポート',
                recommendation: '将来的な量子コンピュータ対策に'
            }
        }
    ]
};

/**
 * Step2コンポーネント
 * @param {Object} props - プロパティ
 * @param {string} props.keyType - 選択された暗号方式
 * @param {function} props.onSelect - 選択時のコールバック
 * @param {string} props.selected - 現在選択されている値
 * @param {function} props.onBack - 戻るボタンのコールバック
 * @param {string} props.language - 表示言語
 */
export default function Step2({ keyType, onSelect, selected, onBack, language }) {
    const [showDetails, setShowDetails] = useState(null);

    // 言語に応じたテキストを取得
    const texts = {
        ja: {
            title: '鍵サイズの選択',
            subtitle: '用途に応じて適切な鍵サイズを選択してください',
            details: '詳細',
            security: 'セキュリティレベル',
            speed: '処理速度',
            compatibility: '互換性',
            recommendation: '推奨用途',
            back: '戻る',
            close: '閉じる'
        },
        en: {
            title: 'Select Key Size',
            subtitle: 'Choose the appropriate key size for your use case',
            details: 'Details',
            security: 'Security Level',
            speed: 'Processing Speed',
            compatibility: 'Compatibility',
            recommendation: 'Recommended Use',
            back: 'Back',
            close: 'Close'
        }
    }[language];

    // 選択可能な鍵サイズを取得
    const availableSizes = keySizes[keyType] || [];

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">{texts.title}</h2>
                <p className="text-gray-600 mt-2">{texts.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableSizes.map(size => (
                    <div key={size.value} className="relative">
                        <button
                            onClick={() => onSelect(size.value)}
                            className={`w-full p-4 border rounded-lg hover:bg-blue-50 transition-colors ${
                                selected === size.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            }`}
                        >
                            <div className="font-bold text-lg">{size.label}</div>
                            <div className="text-sm text-gray-600 mt-1">{size.description}</div>
                        </button>
                        <button
                            onClick={() => setShowDetails(size.value)}
                            className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
                            aria-label={`${texts.details}: ${size.label}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>
                ))}
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
                                {availableSizes.find(s => s.value === showDetails).label}
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
                            <div>
                                <h4 className="font-bold">{texts.security}:</h4>
                                <p className="text-gray-600 mt-1">
                                    {availableSizes.find(s => s.value === showDetails).details.security}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-bold">{texts.speed}:</h4>
                                <p className="text-gray-600 mt-1">
                                    {availableSizes.find(s => s.value === showDetails).details.speed}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-bold">{texts.compatibility}:</h4>
                                <p className="text-gray-600 mt-1">
                                    {availableSizes.find(s => s.value === showDetails).details.compatibility}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-bold">{texts.recommendation}:</h4>
                                <p className="text-gray-600 mt-1">
                                    {availableSizes.find(s => s.value === showDetails).details.recommendation}
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