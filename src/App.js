/**
 * メインアプリケーションコンポーネント
 */
import { useState } from 'react';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
import { generateMetadata } from './utils/metadata';
import { validateAll } from './utils/errorHandler';
import {
    generateRSAKeyPair,
    generateECDSAKeyPair,
    generateEdDSAKeyPair,
    convertToPEM,
    convertToJWK,
    convertToSSH,
    convertToOpenPGP
} from './utils/crypto';

/**
 * アプリケーションコンポーネント
 */
export default function App() {
    // 現在のステップ
    const [currentStep, setCurrentStep] = useState(1);

    // 選択されたパラメータ
    const [params, setParams] = useState({
        keyType: '',
        keySize: '',
        outputFormat: '',
        passphrase: '',
        language: 'ja' // デフォルト言語
    });

    // 生成状態
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [generatedKeys, setGeneratedKeys] = useState(null);

    // 言語切り替え
    const toggleLanguage = () => {
        setParams(prev => ({
            ...prev,
            language: prev.language === 'ja' ? 'en' : 'ja'
        }));
    };

    // パラメータ更新
    const updateParams = (key, value) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    // 次のステップへ
    const nextStep = () => {
        setCurrentStep(prev => prev + 1);
    };

    // 前のステップへ
    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    // 鍵の生成処理
    const generateKeys = async () => {
        try {
            setIsGenerating(true);
            setError('');

            // パラメータの検証
            const validation = validateAll(params);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }

            // 鍵ペアの生成
            let keyPair;
            switch (params.keyType) {
                case 'rsa':
                    keyPair = await generateRSAKeyPair(parseInt(params.keySize));
                    break;
                case 'ecdsa':
                    keyPair = await generateECDSAKeyPair(params.keySize);
                    break;
                case 'eddsa':
                    keyPair = await generateEdDSAKeyPair(params.keySize);
                    break;
                default:
                    throw new Error('無効な暗号方式が選択されています。');
            }

            // 出力形式の変換
            let formattedKeys;
            switch (params.outputFormat) {
                case 'pem':
                    formattedKeys = await convertToPEM(keyPair, params.passphrase);
                    break;
                case 'jwk':
                    formattedKeys = await convertToJWK(keyPair);
                    break;
                case 'ssh':
                    formattedKeys = await convertToSSH(keyPair, params.passphrase);
                    break;
                case 'pgp':
                    formattedKeys = await convertToOpenPGP({
                        ...params,
                        name: 'Generated Key',
                        email: 'user@example.com'
                    });
                    break;
                default:
                    throw new Error('無効な出力形式が選択されています。');
            }

            // メタデータの生成
            const metadata = generateMetadata(params);

            setGeneratedKeys({
                ...formattedKeys,
                metadata
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // 現在のステップに応じたコンポーネントを表示
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1
                        onSelect={(value) => updateParams('keyType', value)}
                        selected={params.keyType}
                        language={params.language}
                    />
                );
            case 2:
                return (
                    <Step2
                        keyType={params.keyType}
                        onSelect={(value) => updateParams('keySize', value)}
                        selected={params.keySize}
                        onBack={prevStep}
                        language={params.language}
                    />
                );
            case 3:
                return (
                    <Step3
                        keyType={params.keyType}
                        keySize={params.keySize}
                        onSelect={(value) => updateParams('outputFormat', value)}
                        selected={params.outputFormat}
                        onBack={prevStep}
                        language={params.language}
                    />
                );
            case 4:
                return (
                    <Step4
                        outputFormat={params.outputFormat}
                        onSelect={(value) => updateParams('passphrase', value)}
                        passphrase={params.passphrase}
                        onBack={prevStep}
                        onNext={nextStep}
                        language={params.language}
                    />
                );
            case 5:
                return (
                    <Step5
                        params={params}
                        onGenerate={generateKeys}
                        onBack={prevStep}
                        isGenerating={isGenerating}
                        language={params.language}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* 言語切り替えボタン */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={toggleLanguage}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                        {params.language === 'ja' ? 'English' : '日本語'}
                    </button>
                </div>

                {/* メインコンテンツ */}
                <div className="bg-white shadow rounded-lg p-6">
                    {/* プログレスバー */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            {[1, 2, 3, 4, 5].map((step) => (
                                <div
                                    key={step}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        step === currentStep
                                            ? 'bg-blue-600 text-white'
                                            : step < currentStep
                                            ? 'bg-blue-200'
                                            : 'bg-gray-200'
                                    }`}
                                >
                                    {step}
                                </div>
                            ))}
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="h-1 w-full bg-gray-200"></div>
                            </div>
                            <div className="absolute inset-0 flex items-center">
                                <div
                                    className="h-1 bg-blue-600 transition-all duration-300"
                                    style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* エラーメッセージ */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* ステップコンポーネント */}
                    {renderStep()}

                    {/* 生成された鍵の表示 */}
                    {generatedKeys && (
                        <div className="mt-8 space-y-4">
                            <h3 className="text-lg font-bold">
                                {params.language === 'ja' ? '生成された鍵' : 'Generated Keys'}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium">
                                        {params.language === 'ja' ? '公開鍵' : 'Public Key'}
                                    </h4>
                                    <pre className="mt-2 p-4 bg-gray-50 rounded-lg overflow-x-auto">
                                        {generatedKeys.publicKey}
                                    </pre>
                                </div>
                                <div>
                                    <h4 className="font-medium">
                                        {params.language === 'ja' ? '秘密鍵' : 'Private Key'}
                                    </h4>
                                    <pre className="mt-2 p-4 bg-gray-50 rounded-lg overflow-x-auto">
                                        {generatedKeys.privateKey}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 