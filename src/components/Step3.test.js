import { render, screen, fireEvent } from '@testing-library/react';
import Step3 from './Step3';

describe('Step3コンポーネントテスト', () => {
    const mockOnNext = jest.fn();
    const mockOnPrev = jest.fn();
    const mockOnOutputFormatChange = jest.fn();

    beforeEach(() => {
        mockOnNext.mockClear();
        mockOnPrev.mockClear();
        mockOnOutputFormatChange.mockClear();
    });

    describe('出力形式の選択', () => {
        test('RSAの出力形式オプション表示', () => {
            render(
                <Step3
                    keyType="rsa"
                    keySize="2048"
                    outputFormat=""
                    onOutputFormatChange={mockOnOutputFormatChange}
                    onNext={mockOnNext}
                    onPrev={mockOnPrev}
                />
            );

            // タイトルの確認
            expect(screen.getByText('出力形式の選択')).toBeInTheDocument();

            // RSAの出力形式オプションの確認
            expect(screen.getByText('PEM')).toBeInTheDocument();
            expect(screen.getByText('JWK')).toBeInTheDocument();
            expect(screen.getByText('SSH')).toBeInTheDocument();
            expect(screen.getByText('OpenPGP')).toBeInTheDocument();
        });

        test('ECDSAの出力形式オプション表示', () => {
            render(
                <Step3
                    keyType="ecdsa"
                    keySize="P-256"
                    outputFormat=""
                    onOutputFormatChange={mockOnOutputFormatChange}
                    onNext={mockOnNext}
                    onPrev={mockOnPrev}
                />
            );

            // ECDSAの出力形式オプションの確認
            expect(screen.getByText('PEM')).toBeInTheDocument();
            expect(screen.getByText('JWK')).toBeInTheDocument();
            expect(screen.getByText('SSH')).toBeInTheDocument();
        });

        test('EdDSAの出力形式オプション表示', () => {
            render(
                <Step3
                    keyType="eddsa"
                    keySize="Ed25519"
                    outputFormat=""
                    onOutputFormatChange={mockOnOutputFormatChange}
                    onNext={mockOnNext}
                    onPrev={mockOnPrev}
                />
            );

            // EdDSAの出力形式オプションの確認
            expect(screen.getByText('PEM')).toBeInTheDocument();
            expect(screen.getByText('SSH')).toBeInTheDocument();
            expect(screen.getByText('OpenPGP')).toBeInTheDocument();
        });
    });

    test('出力形式の選択', () => {
        render(
            <Step3
                keyType="rsa"
                keySize="2048"
                outputFormat=""
                onOutputFormatChange={mockOnOutputFormatChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // PEM形式を選択
        fireEvent.click(screen.getByText('PEM'));
        expect(mockOnOutputFormatChange).toHaveBeenCalledWith('pem');

        // JWK形式を選択
        fireEvent.click(screen.getByText('JWK'));
        expect(mockOnOutputFormatChange).toHaveBeenCalledWith('jwk');

        // SSH形式を選択
        fireEvent.click(screen.getByText('SSH'));
        expect(mockOnOutputFormatChange).toHaveBeenCalledWith('ssh');

        // OpenPGP形式を選択
        fireEvent.click(screen.getByText('OpenPGP'));
        expect(mockOnOutputFormatChange).toHaveBeenCalledWith('openpgp');
    });

    test('ナビゲーションボタンの制御', () => {
        render(
            <Step3
                keyType="rsa"
                keySize="2048"
                outputFormat=""
                onOutputFormatChange={mockOnOutputFormatChange}
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

        // 出力形式を選択すると次へボタンが有効になる
        fireEvent.click(screen.getByText('PEM'));
        expect(nextButton).toBeEnabled();

        // 次へボタンをクリック
        fireEvent.click(nextButton);
        expect(mockOnNext).toHaveBeenCalled();
    });

    test('選択済み出力形式の表示', () => {
        render(
            <Step3
                keyType="rsa"
                keySize="2048"
                outputFormat="pem"
                onOutputFormatChange={mockOnOutputFormatChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // PEMが選択された状態であることを確認
        const selectedOption = screen.getByText('PEM').closest('button');
        expect(selectedOption).toHaveClass('selected');  // または適切なクラス名
    });

    test('互換性情報の表示', () => {
        render(
            <Step3
                keyType="rsa"
                keySize="2048"
                outputFormat="pem"
                onOutputFormatChange={mockOnOutputFormatChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // 互換性情報の表示確認
        expect(screen.getByText(/互換性/)).toBeInTheDocument();
        expect(screen.getByText(/対応システム/)).toBeInTheDocument();
    });

    test('ツールチップの表示', () => {
        render(
            <Step3
                keyType="rsa"
                keySize="2048"
                outputFormat=""
                onOutputFormatChange={mockOnOutputFormatChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // PEMの情報アイコンにホバー
        const pemInfo = screen.getByTestId('pem-info');
        fireEvent.mouseEnter(pemInfo);
        expect(screen.getByText(/最も一般的な形式/)).toBeInTheDocument();

        // JWKの情報アイコンにホバー
        const jwkInfo = screen.getByTestId('jwk-info');
        fireEvent.mouseEnter(jwkInfo);
        expect(screen.getByText(/Web標準/)).toBeInTheDocument();
    });

    test('アクセシビリティ対応', () => {
        render(
            <Step3
                keyType="rsa"
                keySize="2048"
                outputFormat=""
                onOutputFormatChange={mockOnOutputFormatChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // キーボード操作
        const option = screen.getByText('PEM');
        option.focus();
        fireEvent.keyPress(option, { key: 'Enter', code: 'Enter' });
        expect(mockOnOutputFormatChange).toHaveBeenCalledWith('pem');

        // ARIAラベルの確認
        expect(screen.getByRole('button', { name: 'PEM' })).toBeInTheDocument();
    });
}); 