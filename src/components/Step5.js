/**
 * 最終確認と生成コンポーネント
 */
import { useState } from 'react';
import { validateAll } from '../utils/errorHandler';

/**
 * Step5コンポーネント
 * @param {Object} props - プロパティ
 * @param {Object} props.params - 選択されたパラメータ
 * @param {function} props.onGenerate - 生成時のコールバック
 * @param {function} props.onBack - 戻るボタンのコールバック
 * @param {boolean} props.isGenerating - 生成中フラグ
 * @param {string} props.language - 表示言語
 */
export default function Step5({ params, onGenerate, onBack, isGenerating, language }) {
    const [error, setError] = useState('');

    // 言語に応じたテキストを取得
    const texts = {
        ja: {
            title: '確認と生成',
            subtitle: '選択した内容を確認して鍵を生成します',
            keyType: '暗号方式',
            keySize: '鍵サイズ',
            outputFormat: '出力形式',
            passphrase: 'パスフレーズ',
            set: '設定済み',
            notSet: '未設定',
            back: '戻る',
            generate: '生成',
            generating: '生成中...',
            keyTypes: {
                rsa: 'RSA',
                ecdsa: 'ECDSA',
                eddsa: 'EdDSA'
            },
            outputFormats: {
                pem: 'PEM (PKCS#8/SPKI)',
                jwk: 'JWK (JSON Web Key)',
                ssh: 'SSH (OpenSSH)',
                pgp: 'OpenPGP'
            },
            warning: {
                title: '注意事項',
                items: [
                    '生成された鍵はブラウザ内で処理され、サーバーには送信されません。',
                    '秘密鍵は適切に保管し、パスフレーズで保護することを推奨します。',
                    '生成後は必ずバックアップを作成してください。',
                    '重要な用途には、適切なセキュリティ評価を受けた専用ツールの使用を検討してください。'
                ]
            }
        },
        en: {
            title: 'Confirm and Generate',
            subtitle: 'Review your selections and generate keys',
            keyType: 'Cryptography Type',
            keySize: 'Key Size',
            outputFormat: 'Output Format',
            passphrase: 'Passphrase',
            set: 'Set',
            notSet: 'Not Set',
            back: 'Back',
            generate: 'Generate',
            generating: 'Generating...',
            keyTypes: {
                rsa: 'RSA',
                ecdsa: 'ECDSA',
                eddsa: 'EdDSA'
            },
            outputFormats: {
                pem: 'PEM (PKCS#8/SPKI)',
                jwk: 'JWK (JSON Web Key)',
                ssh: 'SSH (OpenSSH)',
                pgp: 'OpenPGP'
            },
            warning: {
                title: 'Important Notes',
                items: [
                    'Keys are generated in your browser and never sent to any server.',
                    'Store private keys securely and protect them with a passphrase.',
                    'Always create backups after generation.',
                    'For critical use cases, consider using dedicated tools with proper security audits.'
                ]
            }
        }
    }[language];

    // 生成ボタンクリック時の処理
    const handleGenerate = () => {
        const validation = validateAll(params);
        if (!validation.isValid) {
            setError(validation.message);
            return;
        }
        setError('');
        onGenerate();
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

            {/* 選択内容の表示 */}
            <div
                className="bg-white shadow overflow-hidden sm:rounded-lg cursor-pointer"
                onDoubleClick={handleGenerate} // ダブルクリックで生成を実行
            >
                <div className="px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">
                                {texts.keyType}
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {texts.keyTypes[params.keyType]}
                            </dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">
                                {texts.keySize}
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {params.keySize}
                            </dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">
                                {texts.outputFormat}
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {texts.outputFormats[params.outputFormat]}
                            </dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">
                                {texts.passphrase}
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {params.passphrase ? texts.set : texts.notSet}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                            {texts.warning.title}
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                            <ul className="list-disc list-inside">
                                {texts.warning.items.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={onBack}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800"
                >
                    {texts.back}
                </button>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`px-6 py-2 text-white rounded-lg ${
                        isGenerating
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {isGenerating ? texts.generating : texts.generate}
                </button>
            </div>
        </div>
    );
}