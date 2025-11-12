/**
 * AI姿勢分析アプリ（ケンダル法）
 * メインエントリーポイント
 */

import { PoseDetector } from './pose/PoseDetector.js';
import { UIController } from './ui/UIController.js';
import { KendallAnalyzer } from './analysis/KendallAnalyzer.js';

class PostureAnalysisApp {
    constructor() {
        this.poseDetector = null;
        this.uiController = null;
        this.kendallAnalyzer = null;
        this.currentImage = null;
        this.currentPoseResults = null;
    }

    async init() {
        console.log('🚀 AI姿勢分析アプリを初期化中...');

        try {
            // UIコントローラーの初期化
            this.uiController = new UIController();
            this.uiController.init();

            // MediaPipe Poseの初期化
            this.poseDetector = new PoseDetector();
            await this.poseDetector.init();

            // ケンダル法解析器の初期化
            this.kendallAnalyzer = new KendallAnalyzer();

            // イベントリスナーの設定
            this.setupEventListeners();

            console.log('✅ 初期化完了！');
        } catch (error) {
            console.error('❌ 初期化エラー:', error);
            alert('アプリの初期化に失敗しました。ページを再読み込みしてください。');
        }
    }

    setupEventListeners() {
        // タブ切り替え
        this.uiController.on('tabChange', (tab) => {
            console.log('タブ切り替え:', tab);
        });

        // 画像アップロード
        this.uiController.on('imageUploaded', async (imageData) => {
            console.log('画像がアップロードされました');
            this.currentImage = imageData;
            await this.displayImage(imageData);
        });

        // カメラ撮影
        this.uiController.on('photoCapture', async (imageData) => {
            console.log('写真が撮影されました');
            this.currentImage = imageData;
            await this.displayImage(imageData);
        });

        // 解析ボタン
        this.uiController.on('analyzeClick', async () => {
            await this.analyzePose();
        });

        // リセットボタン
        this.uiController.on('resetClick', () => {
            this.reset();
        });

        // レポート生成ボタン
        this.uiController.on('generateReportClick', async () => {
            await this.generateReport();
        });
    }

    async displayImage(imageData) {
        const canvas = document.getElementById('poseCanvas');
        const ctx = canvas.getContext('2d');

        // 画像を読み込む
        const img = new Image();
        img.onload = () => {
            // Canvasサイズを画像に合わせる
            canvas.width = img.width;
            canvas.height = img.height;

            // 画像を描画
            ctx.drawImage(img, 0, 0);

            // 解析セクションを表示
            document.getElementById('analysisSection').style.display = 'block';
            
            // 解析セクションまでスクロール
            document.getElementById('analysisSection').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        };
        img.src = imageData;
    }

    async analyzePose() {
        if (!this.currentImage) {
            alert('画像を選択してください');
            return;
        }

        try {
            // ローディング表示
            this.uiController.showLoading();

            console.log('🔍 姿勢解析を開始...');

            // MediaPipe Poseで骨格検出
            this.currentPoseResults = await this.poseDetector.detectPose(this.currentImage);

            if (!this.currentPoseResults || !this.currentPoseResults.poseLandmarks) {
                throw new Error('姿勢が検出できませんでした');
            }

            console.log('✅ 骨格検出完了');

            // Canvasに骨格を描画
            this.drawPoseLandmarks(this.currentPoseResults);

            // ケンダル法で評価
            const analysisResults = this.kendallAnalyzer.analyzeLateralView(
                this.currentPoseResults.poseLandmarks
            );

            console.log('✅ 姿勢評価完了:', analysisResults);

            // 結果を表示
            this.uiController.displayResults(analysisResults);

            // ローディング非表示
            this.uiController.hideLoading();

        } catch (error) {
            console.error('❌ 解析エラー:', error);
            this.uiController.hideLoading();
            alert(`解析に失敗しました: ${error.message}`);
        }
    }

    drawPoseLandmarks(poseResults) {
        const canvas = document.getElementById('poseCanvas');
        const ctx = canvas.getContext('2d');

        // 画像を再描画
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);

            // 骨格を描画
            this.poseDetector.drawLandmarks(canvas, poseResults);
        };
        img.src = this.currentImage;
    }

    async generateReport() {
        if (!this.currentPoseResults) {
            alert('先に姿勢解析を実行してください');
            return;
        }

        try {
            console.log('📄 レポート生成中...');
            
            // TODO: Google Apps Script連携
            alert('レポート生成機能は後ほど実装します');

        } catch (error) {
            console.error('❌ レポート生成エラー:', error);
            alert(`レポート生成に失敗しました: ${error.message}`);
        }
    }

    reset() {
        this.currentImage = null;
        this.currentPoseResults = null;
        
        // UIをリセット
        this.uiController.reset();
        
        // 解析・結果セクションを非表示
        document.getElementById('analysisSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        
        console.log('🔄 リセット完了');
    }
}

// アプリケーションの起動
document.addEventListener('DOMContentLoaded', async () => {
    const app = new PostureAnalysisApp();
    await app.init();
});
