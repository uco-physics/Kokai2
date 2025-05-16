/**
 * メインアプリケーションコンポーネント
 * 公開鍵暗号鍵ペア生成ツールのUIとロジックを管理
 * ステップ形式でRSA/ECDSA/EdDSAの鍵を生成し、PEM/JWK/SSH/OpenPGP形式で出力
 */
import React, { useState, useEffect, useRef } from 'react';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
import { createMetadata } from './utils/metadata';
import { validateAll } from './utils/errorHandler';
import { generateRSAKeyPair, generateECDSAKeyPair, generateEdDSAKeyPair } from './utils/crypto';
import JSZip from 'jszip';

// 言語テキスト（日本語/英語）
const texts = {
    ja: {
        title: '公開鍵暗号鍵ペア生成ツール',
        step1: '暗号方式の選択',
        step2: '鍵サイズの選択',
        step3: '出力形式の選択',
        step4: 'オプション設定',
        step5: '確認と生成',
        generate: '生成',
        download: 'ダウンロード',
        downloadAll: '一括ダウンロード',
        close: '閉じる',
        back: '戻る',
        next: '次へ',
        publicKey: '公開鍵',
        privateKey: '秘密鍵',
        metadata: 'メタデータ',
        error: 'エラー',
        reset: 'リセット',
        currentSelection: '現在の選択',
        languageToggle: 'English',
    },
    en: {
        title: 'Public Key Cryptography Key Pair Generator',
        step1: 'Select Cryptography Type',
        step2: 'Select Key Size',
        step3: 'Select Output Format',
        step4: 'Set Options',
        step5: 'Confirm and Generate',
        generate: 'Generate',
        download: 'Download',
        downloadAll: 'Download All',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        publicKey: 'Public Key',
        privateKey: 'Private Key',
        metadata: 'Metadata',
        error: 'Error',
        reset: 'Reset',
        currentSelection: 'Current Selection',
        languageToggle: '日本語',
    },
};

/**
 * デバッグ用カスタムフック
 * 状態変更をコンソールにログ出力（本番環境では無効化可能）
 */
const useDebugState = (name, value, debugMode) => {
    useEffect(() => {
        if (debugMode) {
            console.log(`[Debug] ${name} updated:`, value);
        }
    }, [name, value, debugMode]);
    return value;
};

export default function App() {
    // 状態管理
    const [step, setStep] = useState(() => {
        const saved = localStorage.getItem('step');
        return saved ? parseInt(saved) : 1;
    });
    const [keyType, setKeyType] = useState(() => localStorage.getItem('keyType') || '');
    const [keySize, setKeySize] = useState(() => localStorage.getItem('keySize') || '');
    const [outputFormat, setOutputFormat] = useState(() => localStorage.getItem('outputFormat') || '');
    const [passphrase, setPassphrase] = useState(() => localStorage.getItem('passphrase') || '');
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'ja');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedKeys, setGeneratedKeys] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState('');
    const [debugMode, setDebugMode] = useState(true); // デバッグモード（本番ではfalse推奨）

    // モーダルのフォーカス管理用
    const resultModalRef = useRef(null);
    const closeButtonRef = useRef(null);

    // 状態変更をデバッグログに記録
    useDebugState('step', step, debugMode);
    useDebugState('keyType', keyType, debugMode);
    useDebugState('keySize', keySize, debugMode);
    useDebugState('outputFormat', outputFormat, debugMode);
    useDebugState('passphrase', passphrase, debugMode);
    useDebugState('language', language, debugMode);
    useDebugState('isGenerating', isGenerating, debugMode);
    useDebugState('showResults', showResults, debugMode);
    useDebugState('error', error, debugMode);

    // localStorageに状態を保存
    useEffect(() => {
        localStorage.setItem('step', step.toString());
        localStorage.setItem('keyType', keyType);
        localStorage.setItem('keySize', keySize);
        localStorage.setItem('outputFormat', outputFormat);
        localStorage.setItem('passphrase', passphrase);
        localStorage.setItem('language', language);
    }, [step, keyType, keySize, outputFormat, passphrase, language]);

    // モーダル表示時のフォーカス管理
    useEffect(() => {
        if (showResults && closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
    }, [showResults]);

    // ステップナビゲーション
    const handleNext = () => {
        if (debugMode) console.log('[Debug] handleNext called, current step:', step);
        setStep((prev) => Math.min(prev + 1, 5));
    };

    const handleBack = () => {
        if (debugMode) console.log('[Debug] handleBack called, current step:', step);
        setStep((prev) => Math.max(prev - 1, 1));
    };

    // 状態設定関数（ログ付き）
    const setKeyTypeWithLog = (value) => {
        if (debugMode) console.log('[Debug] setKeyType called with:', value);
        setKeyType(value);
    };

    const setKeySizeWithLog = (value) => {
        if (debugMode) console.log('[Debug] setKeySize called with:', value);
        setKeySize(value);
    };

    const setOutputFormatWithLog = (value) => {
        if (debugMode) console.log('[Debug] setOutputFormat called with:', value);
        setOutputFormat(value);
    };

    const setPassphraseWithLog = (value) => {
        if (debugMode) console.log('[Debug] setPassphrase called with:', value);
        setPassphrase(value);
    };

    // 鍵生成処理
    const handleGenerate = async () => {
        if (debugMode) {
            console.log('[Debug] handleGenerate called with params:', { keyType, keySize, outputFormat, passphrase });
            console.log('[Debug] keySize type:', typeof keySize, 'value:', keySize);
        }
        setIsGenerating(true);
        setError('');
        try {
            const params = { keyType, keySize, outputFormat, passphrase };
            const validation = validateAll(params);
            if (debugMode) console.log('[Debug] Validation result:', validation);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }

            let keys;
            if (debugMode) console.log('[Debug] Generating key pair for keyType:', keyType);
            switch (keyType) {
                case 'rsa':
                    keys = await generateRSAKeyPair(params);
                    break;
                case 'ecdsa':
                    keys = await generateECDSAKeyPair(params);
                    break;
                case 'eddsa':
                    keys = await generateEdDSAKeyPair(params);
                    break;
                default:
                    throw new Error(texts[language].error + ': 無効な暗号方式');
            }
            if (debugMode) console.log('[Debug] Generated keys:', keys);

            const metadata = createMetadata({
                keyType,
                keySize,
                outputFormat,
                passphrase: !!passphrase,
                generatedAt: new Date().toISOString(),
            });
            if (debugMode) console.log('[Debug] Generated metadata:', metadata);

            setGeneratedKeys({
                publicKey: keys.publicKey,
                privateKey: keys.privateKey,
                metadata,
            });
            setShowResults(true);
        } catch (err) {
            if (debugMode) console.error('[Debug] Key generation failed:', err);
            const errorMessage = err.message.includes('JWK形式')
                ? `${texts[language].error}: ${err.message} (Ed25519/Ed448はJWKに対応していません)`
                : `${texts[language].error}: ${err.message}`;
            setError(errorMessage);
            setGeneratedKeys(null);
            setShowResults(false);
        } finally {
            setIsGenerating(false);
        }
    };

    // 単一ファイルのダウンロード
    const downloadFile = (content, fileName) => {
        if (debugMode) console.log('[Debug] Downloading file:', fileName);
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    };

    // 一括ZIPダウンロード
    const downloadAll = async () => {
        if (!generatedKeys) return;
        if (debugMode) console.log('[Debug] Downloading all files');

        const { publicKey, privateKey, metadata } = generatedKeys;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const prefix = `${keyType}_${keySize}_${timestamp}`;
        const extension = outputFormat === 'jwk' ? 'json' : outputFormat === 'pgp' ? 'asc' : outputFormat === 'ssh' ? 'key' : outputFormat;
        const publicExtension = outputFormat === 'ssh' ? 'pub' : extension;

        // ZIPアーカイブの作成
        const zip = new JSZip();
        zip.file(`${prefix}_public.${publicExtension}`, publicKey);
        zip.file(`${prefix}_private.${extension}`, privateKey);
        zip.file(`${prefix}_metadata.json`, JSON.stringify(metadata, null, 2));

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadFile(zipBlob, `${prefix}_keys.zip`);
    };

    // ステップのレンダリング
    const renderStep = () => {
        if (debugMode) {
            console.log('[Debug] Rendering step:', step);
            console.log('[Debug] Current params:', { keyType, keySize, outputFormat, passphrase });
        }

        switch (step) {
            case 1:
                return (
                    <Step1
                        selected={keyType}
                        onSelect={setKeyTypeWithLog}
                        onNext={handleNext}
                        language={language}
                    />
                );
            case 2:
                return (
                    <Step2
                        keyType={keyType}
                        selected={keySize}
                        onSelect={setKeySizeWithLog}
                        onBack={handleBack}
                        onNext={handleNext}
                        language={language}
                    />
                );
            case 3:
                return (
                    <Step3
                        keyType={keyType}
                        keySize={keySize}
                        selected={outputFormat}
                        onSelect={setOutputFormatWithLog}
                        onBack={handleBack}
                        onNext={handleNext}
                        language={language}
                    />
                );
            case 4:
                return (
                    <Step4
                        outputFormat={outputFormat}
                        passphrase={passphrase}
                        onSelect={setPassphraseWithLog}
                        onBack={handleBack}
                        onNext={handleNext}
                        language={language}
                    />
                );
            case 5:
                return (
                    <Step5
                        params={{ keyType, keySize, outputFormat, passphrase }}
                        onGenerate={handleGenerate}
                        onBack={handleBack}
                        isGenerating={isGenerating}
                        language={language}
                    />
                );
            default:
                return null;
        }
    };

    // 現在の選択状態を表示
    const renderCurrentSelection = () => {
        if (!keyType) return null;
        return (
            <div
                className="bg-blue-50 p-4 rounded-lg mb-4"
                role="status"
                aria-live="polite"
            >
                <h3 className="font-bold">{texts[language].currentSelection}</h3>
                <p>
                    {keyType.toUpperCase()}
                    {keySize && `, ${keySize}`}
                    {outputFormat && `, ${outputFormat.toUpperCase()}`}
                    {passphrase && `, ${texts[language].passphrase}: 設定済み`}
                </p>
            </div>
        );
    };

    // エラーモーダル
    const renderErrorModal = () => {
        if (!error) return null;
        return (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                role="dialog"
                aria-labelledby="error-title"
                aria-describedby="error-message"
            >
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                    <h3 id="error-title" className="text-xl font-bold text-red-600">
                        {texts[language].error}
                    </h3>
                    <p id="error-message" className="mt-2 text-gray-700">
                        {error}
                    </p>
                    <button
                        onClick={() => setError('')}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        autoFocus
                    >
                        {texts[language].close}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* ヘッダー */}
                <header className="mb-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">{texts[language].title}</h1>
                        <button
                            onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
                            className="px-3 py-1 border rounded-md hover:bg-gray-50"
                            aria-label={texts[language].languageToggle}
                        >
                            {texts[language].languageToggle}
                        </button>
                    </div>
                    {/* ステップインジケーター */}
                    <div className="mt-4 flex space-x-2" role="navigation" aria-label="ステップ進行状況">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div
                                key={s}
                                className={`h-2 flex-1 rounded-full ${
                                    s <= step ? 'bg-blue-500' : 'bg-gray-200'
                                }`}
                                aria-current={s === step ? 'step' : undefined}
                            />
                        ))}
                    </div>
                </header>

                {/* デバッグパネル */}
                {debugMode && (
                    <div className="bg-gray-100 p-4 mb-4 rounded-lg shadow">
                        <h3 className="text-lg font-bold mb-2">[Debug Panel]</h3>
                        <button
                            onClick={() => setDebugMode(false)}
                            className="mb-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            aria-label="デバッグパネルを非表示"
                        >
                            Hide Debug Panel
                        </button>
                        <p><strong>Step:</strong> {step}</p>
                        <p><strong>KeyType:</strong> {keyType || 'Not selected'}</p>
                        <p><strong>KeySize:</strong> {keySize || 'Not selected'}</p>
                        <p><strong>OutputFormat:</strong> {outputFormat || 'Not selected'}</p>
                        <p><strong>Passphrase:</strong> {passphrase ? 'Set' : 'Not set'}</p>
                        <p><strong>Language:</strong> {language}</p>
                        <button
                            onClick={() => {
                                setStep(1);
                                setKeyType('');
                                setKeySize('');
                                setOutputFormat('');
                                setPassphrase('');
                                setError('');
                                setGeneratedKeys(null);
                                setShowResults(false);
                                if (debugMode) console.log('[Debug] State reset');
                            }}
                            className="mt-2 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            aria-label="状態をリセット"
                        >
                            {texts[language].reset}
                        </button>
                    </div>
                )}
                {!debugMode && (
                    <button
                        onClick={() => setDebugMode(true)}
                        className="mb-4 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        aria-label="デバッグパネルを表示"
                    >
                        Show Debug Panel
                    </button>
                )}

                {/* メインコンテンツ */}
                <main>
                    {renderCurrentSelection()}
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">{renderStep()}</div>
                    </div>

                    {/* 結果表示モーダル */}
                    {showResults && generatedKeys && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                            role="dialog"
                            aria-labelledby="result-title"
                            ref={resultModalRef}
                            tabIndex={-1}
                        >
                            <div className="bg-white rounded-lg max-w-2xl wivenza, setShowResults } = useState(false);
    const [error, setError] = useState('');
    const [debugMode, setDebugMode] = useState(true); // デバッグモード（本番ではfalse推奨）

    // モーダルのフォーカス管理用
    const resultModalRef = useRef(null);
    const closeButtonRef = useRef(null);

    // 状態変更をデバッグログに記録
    useDebugState('step', step, debugMode);
    useDebugState('keyType', keyType, debugMode);
    useDebugState('keySize', keySize, debugMode);
    useDebugState('outputFormat', outputFormat, debugMode);
    useDebugState('passphrase', passphrase, debugMode);
    useDebugState('language', language, debugMode);
    useDebugState('isGenerating', isGenerating, debugMode);
    useDebugState('showResults', showResults, debugMode);
    useDebugState('error', error, debugMode);

    // localStorageに状態を保存
    useEffect(() => {
        localStorage.setItem('step', step.toString());
        localStorage.setItem('keyType', keyType);
        localStorage.setItem('keySize', keySize);
        localStorage.setItem('outputFormat', outputFormat);
        localStorage.setItem('passphrase', passphrase);
        localStorage.setItem('language', language);
    }, [step, keyType, keySize, outputFormat, passphrase, language]);

    // モーダル表示時のフォーカス管理
    useEffect(() => {
        if (showResults && closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
    }, [showResults]);

    // ステップナビゲーション
    const handleNext = () => {
        if (debugMode) console.log('[Debug] handleNext called, current step:', step);
        setStep((prev) => Math.min(prev + 1, 5));
    };

    const handleBack = () => {
        if (debugMode) console.log('[Debug] handleBack called, current step:', step);
        setStep((prev) => Math.max(prev - 1, 1));
    };

    // 状態設定関数（ログ付き）
    const setKeyTypeWithLog = (value) => {
        if (debugMode) console.log('[Debug] setKeyType called with:', value);
        setKeyType(value);
    };

    const setKeySizeWithLog = (value) => {
        if (debugMode) console.log('[Debug] setKeySize called with:', value);
        setKeySize(value);
    };

    const setOutputFormatWithLog = (value) => {
        if (debugMode) console.log('[Debug] setOutputFormat called with:', value);
        setOutputFormat(value);
    };

    const setPassphraseWithLog = (value) => {
        if (debugMode) console.log('[Debug] setPassphrase called with:', value);
        setPassphrase(value);
    };

    // 鍵生成処理
    const handleGenerate = async () => {
        if (debugMode) {
            console.log('[Debug] handleGenerate called with params:', { keyType, keySize, outputFormat, passphrase });
            console.log('[Debug] keySize type:', typeof keySize, 'value:', keySize);
        }
        setIsGenerating(true);
        setError('');
        try {
            const params = { keyType, keySize, outputFormat, passphrase };
            const validation = validateAll(params);
            if (debugMode) console.log('[Debug] Validation result:', validation);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }

            let keys;
            if (debugMode) console.log('[Debug] Generating key pair for keyType:', keyType);
            switch (keyType) {
                case 'rsa':
                    keys = await generateRSAKeyPair(params);
                    break;
                case 'ecdsa':
                    keys = await generateECDSAKeyPair(params);
                    break;
                case 'eddsa':
                    keys = await generateEdDSAKeyPair(params);
                    break;
                default:
                    throw new Error(texts[language].error + ': 無効な暗号方式');
            }
            if (debugMode) console.log('[Debug] Generated keys:', keys);

            const metadata = createMetadata({
                keyType,
                keySize,
                outputFormat,
                passphrase: !!passphrase,
                generatedAt: new Date().toISOString(),
            });
            if (debugMode) console.log('[Debug] Generated metadata:', metadata);

            setGeneratedKeys({
                publicKey: keys.publicKey,
                privateKey: keys.privateKey,
                metadata,
            });
            setShowResults(true);
        } catch (err) {
            if (debugMode) console.error('[Debug] Key generation failed:', err);
            const errorMessage = err.message.includes('JWK形式')
                ? `${texts[language].error}: ${err.message} (Ed25519/Ed448はJWKに対応していません)`
                : `${texts[language].error}: ${err.message}`;
            setError(errorMessage);
            setGeneratedKeys(null);
            setShowResults(false);
        } finally {
            setIsGenerating(false);
        }
    };

    // 単一ファイルのダウンロード
    const downloadFile = (content, fileName) => {
        if (debugMode) console.log('[Debug] Downloading file:', fileName);
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    };

    // 一括ZIPダウンロード
    const downloadAll = async () => {
        if (!generatedKeys) return;
        if (debugMode) console.log('[Debug] Downloading all files');

        const { publicKey, privateKey, metadata } = generatedKeys;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const prefix = `${keyType}_${keySize}_${timestamp}`;
        const extension = outputFormat === 'jwk' ? 'json' : outputFormat === 'pgp' ? 'asc' : outputFormat === 'ssh' ? 'key' : outputFormat;
        const publicExtension = outputFormat === 'ssh' ? 'pub' : extension;

        // ZIPアーカイブの作成
        const zip = new JSZip();
        zip.file(`${prefix}_public.${publicExtension}`, publicKey);
        zip.file(`${prefix}_private.${extension}`, privateKey);
        zip.file(`${prefix}_metadata.json`, JSON.stringify(metadata, null, 2));

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadFile(zipBlob, `${prefix}_keys.zip`);
    };

    // ステップのレンダリング
    const renderStep = () => {
        if (debugMode) {
            console.log('[Debug] Rendering step:', step);
            console.log('[Debug] Current params:', { keyType, keySize, outputFormat, passphrase });
        }

        switch (step) {
            case 1:
                return (
                    <Step1
                        selected={keyType}
                        onSelect={setKeyTypeWithLog}
                        onNext={handleNext}
                        language={language}
                    />
                );
            case 2:
                return (
                    <Step2
                        keyType={keyType}
                        selected={keySize}
                        onSelect={setKeySizeWithLog}
                        onBack={handleBack}
                        onNext={handleNext}
                        language={language}
                    />
                );
            case 3:
                return (
                    <Step3
                        keyType={keyType}
                        keySize={keySize}
                        selected={outputFormat}
                        onSelect={setOutputFormatWithLog}
                        onBack={handleBack}
                        onNext={handleNext}
                        language={language}
                    />
                );
            case 4:
                return (
                    <Step4
                        outputFormat={outputFormat}
                        passphrase={passphrase}
                        onSelect={setPassphraseWithLog}
                        onBack={handleBack}
                        onNext={handleNext}
                        language={language}
                    />
                );
            case 5:
                return (
                    <Step5
                        params={{ keyType, keySize, outputFormat, passphrase }}
                        onGenerate={handleGenerate}
                        onBack={handleBack}
                        isGenerating={isGenerating}
                        language={language}
                    />
                );
            default:
                return null;
        }
    };

    // 現在の選択状態を表示
    const renderCurrentSelection = () => {
        if (!keyType) return null;
        return (
            <div
                className="bg-blue-50 p-4 rounded-lg mb-4"
                role="status"
                aria-live="polite"
            >
                <h3 className="font-bold">{texts[language].currentSelection}</h3>
                <p>
                    {keyType.toUpperCase()}
                    {keySize && `, ${keySize}`}
                    {outputFormat && `, ${outputFormat.toUpperCase()}`}
                    {passphrase && `, ${texts[language].passphrase}: 設定済み`}
                </p>
            </div>
        );
    };

    // エラーモーダル
    const renderErrorModal = () => {
        if (!error) return null;
        return (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                role="dialog"
                aria-labelledby="error-title"
                aria-describedby="error-message"
            >
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                    <h3 id="error-title" className="text-xl font-bold text-red-600">
                        {texts[language].error}
                    </h3>
                    <p id="error-message" className="mt-2 text-gray-700">
                        {error}
                    </p>
                    <button
                        onClick={() => setError('')}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        autoFocus
                    >
                        {texts[language].close}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* ヘッダー */}
                <header className="mb-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">{texts[language].title}</h1>
                        <button
                            onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
                            className="px-3 py-1 border rounded-md hover:bg-gray-50"
                            aria-label={texts[language].languageToggle}
                        >
                            {texts[language].languageToggle}
                        </button>
                    </div>
                    {/* ステップインジケーター */}
                    <div className="mt-4 flex space-x-2" role="navigation" aria-label="ステップ進行状況">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div
                                key={s}
                                className={`h-2 flex-1 rounded-full ${
                                    s <= step ? 'bg-blue-500' : 'bg-gray-200'
                                }`}
                                aria-current={s === step ? 'step' : undefined}
                            />
                        ))}
                    </div>
                </header>

                {/* デバッグパネル */}
                {debugMode && (
                    <div className="bg-gray-100 p-4 mb-4 rounded-lg shadow">
                        <h3 className="text-lg font-bold mb-2">[Debug Panel]</h3>
                        <button
                            onClick={() => setDebugMode(false)}
                            className="mb-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            aria-label="デバッグパネルを非表示"
                        >
                            Hide Debug Panel
                        </button>
                        <p><strong>Step:</strong> {step}</p>
                        <p><strong>KeyType:</strong> {keyType || 'Not selected'}</p>
                        <p><strong>KeySize:</strong> {keySize || 'Not selected'}</p>
                        <p><strong>OutputFormat:</strong> {outputFormat || 'Not selected'}</p>
                        <p><strong>Passphrase:</strong> {passphrase ? 'Set' : 'Not set'}</p>
                        <p><strong>Language:</strong> {language}</p>
                        <button
                            onClick={() => {
                                setStep(1);
                                setKeyType('');
                                setKeySize('');
                                setOutputFormat('');
                                setPassphrase('');
                                setError('');
                                setGeneratedKeys(null);
                                setShowResults(false);
                                if (debugMode) console.log('[Debug] State reset');
                            }}
                            className="mt-2 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            aria-label="状態をリセット"
                        >
                            {texts[language].reset}
                        </button>
                    </div>
                )}
                {!debugMode && (
                    <button
                        onClick={() => setDebugMode(true)}
                        className="mb-4 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        aria-label="デバッグパネルを表示"
                    >
                        Show Debug Panel
                    </button>
                )}

                {/* メインコンテンツ */}
                <main>
                    {renderCurrentSelection()}
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">{renderStep()}</div>
                    </div>

                    {/* 結果表示モーダル */}
                    {showResults && generatedKeys && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                            role="dialog"
                            aria-labelledby="result-title"
                            ref={resultModalRef}
                            tabIndex={-1}
                        >
                            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-start">
                                    <h3 id="result-title" className="text-xl font-bold">
                                        {texts[language].generate}
                                    </h3>
                                    <button
                                        ref={closeButtonRef}
                                        onClick={() => setShowResults(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                        aria-label={texts[language].close}
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mt-4 space-y-4">
                                    <div>
                                        <h4 className="font-bold">{texts[language].publicKey}</h4>
                                        <textarea
                                            className="mt-1 w-full h-32 p-2 border rounded"
                                            value={generatedKeys.publicKey}
                                            readOnly
                                            aria-describedby="public-key-desc"
                                        />
                                        <p id="public-key-desc" className="sr-only">
                                            {texts[language].publicKey} for {keyType}
                                        </p>
                                        <button
                                            onClick={() =>
                                                downloadFile(
                                                    generatedKeys.publicKey,
                                                    `public_${keyType}_${keySize}.${
                                                        outputFormat === 'jwk' ? 'json' : outputFormat === 'pgp' ? 'asc' : outputFormat === 'ssh' ? 'pub' : outputFormat
                                                    }`
                                                )
                                            }
                                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            {texts[language].download}
                                        </button>
                                    </div>

                                    <div>
                                        <h4 className="font-bold">{texts[language].privateKey}</h4>
                                        <textarea
                                            className="mt-1 w-full h-32 p-2 border rounded"
                                            value={generatedKeys.privateKey}
                                            readOnly
                                            aria-describedby="private-key-desc"
                                        />
                                        <p id="private-key-desc" className="sr-only">
                                            {texts[language].privateKey} for {keyType}
                                        </p>
                                        <button
                                            onClick={() =>
                                                downloadFile(
                                                    generatedKeys.privateKey,
                                                    `private_${keyType}_${keySize}.${
                                                        outputFormat === 'jwk' ? 'json' : outputFormat === 'pgp' ? 'asc' : outputFormat === 'ssh' ? 'key' : outputFormat
                                                    }`
                                                )
                                            }
                                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            {texts[language].download}
                                        </button>
                                    </div>

                                    <div>
                                        <h4 className="font-bold">{texts[language].metadata}</h4>
                                        <textarea
                                            className="mt-1 w-full h-32 p-2 border rounded"
                                            value={JSON.stringify(generatedKeys.metadata, null, 2)}
                                            readOnly
                                            aria-describedby="metadata-desc"
                                        />
                                        <p id="metadata-desc" className="sr-only">
                                            Metadata for generated keys
                                        </p>
                                        <button
                                            onClick={() =>
                                                downloadFile(
                                                    JSON.stringify(generatedKeys.metadata, null, 2),
                                                    `metadata_${keyType}_${keySize}.json`
                                                )
                                            }
                                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            {texts[language].download}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-between">
                                    <button
                                        onClick={downloadAll}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        {texts[language].downloadAll}
                                    </button>
                                    <button
                                        onClick={() => setShowResults(false)}
                                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                    >
                                        {texts[language].close}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {renderErrorModal()}
                </main>
            </div>
        </div>
    );
}