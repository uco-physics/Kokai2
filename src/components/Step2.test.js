import { render, screen, fireEvent } from '@testing-library/react';
import Step2 from './Step2';

describe('Step2コンポーネントテスト', () => {
    const mockOnNext = jest.fn();
    const mockOnPrev = jest.fn();
    const mockOnKeySizeChange = jest.fn();

    beforeEach(() => {
        mockOnNext.mockClear();
        mockOnPrev.mockClear();
        mockOnKeySizeChange.mockClear();
    });

    describe('RSA鍵サイズ選択', () => {
        test('RSAの鍵サイズオプション表示', () => {
            render(
                <Step2
                    keyType="rsa"
                    keySize=""
                    onKeySizeChange={mockOnKeySizeChange}
                    onNext={mockOnNext}
                    onPrev={mockOnPrev}
                />
            );

            // タイトルの確認
            expect(screen.getByText('鍵サイズの選択')).toBeInTheDocument();

            // RSAの鍵サイズオプションの確認
            expect(screen.getByText('2048ビット')).toBeInTheDocument();
            expect(screen.getByText('3072ビット')).toBeInTheDocument();
            expect(screen.getByText('4096ビット')).toBeInTheDocument();
        });

        test('RSAの鍵サイズ選択', () => {
            render(
                <Step2
                    keyType="rsa"
                    keySize=""
                    onKeySizeChange={mockOnKeySizeChange}
                    onNext={mockOnNext}
                    onPrev={mockOnPrev}
                />
            );

            fireEvent.click(screen.getByText('2048ビット'));
            expect(mockOnKeySizeChange).toHaveBeenCalledWith('2048');
        });
    });

    describe('ECDSA鍵サイズ選択', () => {
        test('ECDSAの曲線オプション表示', () => {
            render(
                <Step2
                    keyType="ecdsa"
                    keySize=""
                    onKeySizeChange={mockOnKeySizeChange}
                    onNext={mockOnNext}
                    onPrev={mockOnPrev}
                />
            );

            // ECDSAの曲線オプションの確認
            expect(screen.getByText('P-256')).toBeInTheDocument();
            expect(screen.getByText('P-384')).toBeInTheDocument();
        });

        test('ECDSA曲線の選択', () => {
            render(
                <Step2
                    keyType="ecdsa"
                    keySize=""
                    onKeySizeChange={mockOnKeySizeChange}
                    onNext={mockOnNext}
                    onPrev={mockOnPrev}
                />
            );

            fireEvent.click(screen.getByText('P-256'));
            expect(mockOnKeySizeChange).toHaveBeenCalledWith('P-256');
        });
    });

    describe('EdDSA鍵タイプ選択', () => {
        test('EdDSAのタイプオプション表示', () => {
            render(
                <Step2
                    keyType="eddsa"
                    keySize=""
                    onKeySizeChange={mockOnKeySizeChange}
                    onNext={mockOnNext}
                    onPrev={mockOnPrev}
                />
            );

            // EdDSAのタイプオプションの確認
            expect(screen.getByText('Ed25519')).toBeInTheDocument();
            expect(screen.getByText('Ed448')).toBeInTheDocument();
        });

        test('EdDSAタイプの選択', () => {
            render(
                <Step2
                    keyType="eddsa"
                    keySize=""
                    onKeySizeChange={mockOnKeySizeChange}
                    onNext={mockOnNext}
                    onPrev={mockOnPrev}
                />
            );

            fireEvent.click(screen.getByText('Ed25519'));
            expect(mockOnKeySizeChange).toHaveBeenCalledWith('Ed25519');
        });
    });

    test('ナビゲーションボタンの制御', () => {
        render(
            <Step2
                keyType="rsa"
                keySize=""
                onKeySizeChange={mockOnKeySizeChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // 戻るボタンの確認
        const prevButton = screen.getByText('戻る');
        expect(prevButton).toBeEnabled();
        fireEvent.click(prevButton);
        expect(mockOnPrev).toHaveBeenCalled();

        // 初期状態では次へボタンは無効
        const nextButton = screen.getByText('次へ');
        expect(nextButton).toBeDisabled();

        // 鍵サイズを選択すると次へボタンが有効になる
        fireEvent.click(screen.getByText('2048ビット'));
        expect(nextButton).toBeEnabled();

        // 次へボタンをクリック
        fireEvent.click(nextButton);
        expect(mockOnNext).toHaveBeenCalled();
    });

    test('選択済み鍵サイズの表示', () => {
        render(
            <Step2
                keyType="rsa"
                keySize="2048"
                onKeySizeChange={mockOnKeySizeChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // 2048ビットが選択された状態であることを確認
        const selectedOption = screen.getByText('2048ビット').closest('button');
        expect(selectedOption).toHaveClass('selected');  // または適切なクラス名
    });

    test('セキュリティレベル表示', () => {
        render(
            <Step2
                keyType="rsa"
                keySize="2048"
                onKeySizeChange={mockOnKeySizeChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // セキュリティレベルの表示確認
        expect(screen.getByText(/セキュリティレベル/)).toBeInTheDocument();
        expect(screen.getByText(/推奨用途/)).toBeInTheDocument();
    });

    test('アクセシビリティ対応', () => {
        render(
            <Step2
                keyType="rsa"
                keySize=""
                onKeySizeChange={mockOnKeySizeChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // キーボード操作
        const option = screen.getByText('2048ビット');
        option.focus();
        fireEvent.keyPress(option, { key: 'Enter', code: 'Enter' });
        expect(mockOnKeySizeChange).toHaveBeenCalledWith('2048');

        // ARIAラベルの確認
        expect(screen.getByRole('button', { name: '2048ビット' })).toBeInTheDocument();
    });
}); 