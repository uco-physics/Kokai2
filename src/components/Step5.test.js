import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Step5 from './Step5';

describe('Step5コンポーネントテスト', () => {
    const mockOnPrev = jest.fn();
    const mockOnComplete = jest.fn();
    const defaultProps = {
        keyType: 'rsa',
        keySize: '2048',
        outputFormat: 'pem',
        passphrase: 'test-passphrase',
        onPrev: mockOnPrev,
        onComplete: mockOnComplete
    };

    beforeEach(() => {
        mockOnPrev.mockClear();
        mockOnComplete.mockClear();
    });

    test('コンポーネントの初期表示', () => {
        render(<Step5 {...defaultProps} />);

        // タイトルの確認
        expect(screen.getByText('確認と生成')).toBeInTheDocument();

        // 選択内容の表示確認
        expect(screen.getByText(/暗号方式: RSA/)).toBeInTheDocument();
        expect(screen.getByText(/鍵サイズ: 2048ビット/)).toBeInTheDocument();
        expect(screen.getByText(/出力形式: PEM/)).toBeInTheDocument();
        expect(screen.getByText(/パスフレーズ: 設定済み/)).toBeInTheDocument();
    });

    test('メタデータ情報の表示', () => {
        render(<Step5 {...defaultProps} />);

        // セキュリティ情報の確認
        expect(screen.getByText(/セキュリティレベル/)).toBeInTheDocument();
        expect(screen.getByText(/推奨用途/)).toBeInTheDocument();

        // 互換性情報の確認
        expect(screen.getByText(/互換性/)).toBeInTheDocument();
        expect(screen.getByText(/対応システム/)).toBeInTheDocument();
    });

    test('鍵生成の実行', async () => {
        render(<Step5 {...defaultProps} />);

        // 生成ボタンの確認
        const generateButton = screen.getByText('鍵を生成');
        expect(generateButton).toBeEnabled();

        // 生成ボタンをクリック
        fireEvent.click(generateButton);

        // ローディング表示の確認
        expect(screen.getByText('生成中...')).toBeInTheDocument();

        // 生成完了の確認
        await waitFor(() => {
            expect(mockOnComplete).toHaveBeenCalled();
        });
    });

    test('生成された鍵の表示', async () => {
        render(<Step5 {...defaultProps} />);

        // 鍵を生成
        fireEvent.click(screen.getByText('鍵を生成'));

        // 生成された鍵の表示確認
        await waitFor(() => {
            expect(screen.getByText('公開鍵')).toBeInTheDocument();
            expect(screen.getByText('秘密鍵')).toBeInTheDocument();
        });

        // 鍵のコピーボタンの確認
        expect(screen.getByText('公開鍵をコピー')).toBeInTheDocument();
        expect(screen.getByText('秘密鍵をコピー')).toBeInTheDocument();
    });

    test('エラー処理', async () => {
        // エラーを発生させるためのモックプロパティ
        const errorProps = {
            ...defaultProps,
            keySize: 'invalid'
        };

        render(<Step5 {...errorProps} />);

        // 生成ボタンをクリック
        fireEvent.click(screen.getByText('鍵を生成'));

        // エラーメッセージの表示確認
        await waitFor(() => {
            expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
        });

        // 再試行ボタンの確認
        const retryButton = screen.getByText('再試行');
        expect(retryButton).toBeEnabled();
    });

    test('ナビゲーションボタンの制御', () => {
        render(<Step5 {...defaultProps} />);

        // 戻るボタンの確認
        const prevButton = screen.getByText('戻る');
        expect(prevButton).toBeEnabled();
        fireEvent.click(prevButton);
        expect(mockOnPrev).toHaveBeenCalled();
    });

    test('鍵のコピー機能', async () => {
        render(<Step5 {...defaultProps} />);

        // 鍵を生成
        fireEvent.click(screen.getByText('鍵を生成'));

        await waitFor(() => {
            // コピーボタンをクリック
            fireEvent.click(screen.getByText('公開鍵をコピー'));
            expect(screen.getByText('コピーしました')).toBeInTheDocument();
        });
    });

    test('鍵のダウンロード機能', async () => {
        render(<Step5 {...defaultProps} />);

        // 鍵を生成
        fireEvent.click(screen.getByText('鍵を生成'));

        await waitFor(() => {
            // ダウンロードボタンの確認
            expect(screen.getByText('公開鍵をダウンロード')).toBeInTheDocument();
            expect(screen.getByText('秘密鍵をダウンロード')).toBeInTheDocument();
        });
    });

    test('アクセシビリティ対応', () => {
        render(<Step5 {...defaultProps} />);

        // キーボード操作
        const generateButton = screen.getByText('鍵を生成');
        generateButton.focus();
        fireEvent.keyPress(generateButton, { key: 'Enter', code: 'Enter' });

        // ARIAラベルの確認
        expect(screen.getByRole('button', { name: '鍵を生成' })).toBeInTheDocument();
    });

    test('セキュリティ警告の表示', () => {
        render(<Step5 {...defaultProps} passphrase="" />);

        // パスフレーズなしの警告表示
        expect(screen.getByText(/パスフレーズが設定されていません/)).toBeInTheDocument();
        expect(screen.getByText(/セキュリティ上のリスク/)).toBeInTheDocument();
    });
}); 