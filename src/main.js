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
        
        // 2方向の画像とポーズ結果を保持
        this.images = {
            lateral: null,   // 側面観
            frontal: null    // 正面観
        };
        this.poseResults = {
            lateral: null,
            frontal: null
        };
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

        // 側面観画像アップロード
        this.uiController.on('lateralImageUploaded', async (imageData) => {
            console.log('側面観画像がアップロードされました');
            this.images.lateral = imageData;
            this.checkAndShowAnalysisSection();
        });

        // 正面観画像アップロード
        this.uiController.on('frontalImageUploaded', async (imageData) => {
            console.log('正面観画像がアップロードされました');
            this.images.frontal = imageData;
            this.checkAndShowAnalysisSection();
        });

        // カメラ撮影（側面観・正面観）
        this.uiController.on('photoCapture', async ({ view, imageData }) => {
            console.log(`${view}が撮影されました`);
            if (view === 'lateral') {
                this.images.lateral = imageData;
            } else {
                this.images.frontal = imageData;
            }
            this.checkAndShowAnalysisSection();
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

    checkAndShowAnalysisSection() {
        // 少なくとも側面観があれば解析セクションを表示
        if (this.images.lateral) {
            document.getElementById('analysisSection').style.display = 'block';
            document.getElementById('analysisSection').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    async analyzePose() {
        if (!this.images.lateral) {
            alert('少なくとも側面観の画像を選択してください');
            return;
        }

        try {
            // ローディング表示
            this.uiController.showLoading();

            console.log('🔍 姿勢解析を開始...');

            // 側面観の解析
            if (this.images.lateral) {
                this.poseResults.lateral = await this.poseDetector.detectPose(this.images.lateral);
                await this.displayPose('lateral', this.images.lateral, this.poseResults.lateral);
            }

            // 正面観の解析
            if (this.images.frontal) {
                this.poseResults.frontal = await this.poseDetector.detectPose(this.images.frontal);
                await this.displayPose('frontal', this.images.frontal, this.poseResults.frontal);
            }

            console.log('✅ 骨格検出完了');

            // ケンダル法で評価
            const analysisResults = this.kendallAnalyzer.analyzeLateralView(
                this.poseResults.lateral.poseLandmarks
            );

            // 正面観評価（実装予定）
            if (this.poseResults.frontal) {
                // TODO: 正面観評価を追加
                console.log('正面観評価は実装予定');
            }

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

    async displayPose(view, imageData, poseResults) {
        const canvasId = view === 'lateral' ? 'lateralCanvas' : 'frontalCanvas';
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');

        // 画像を読み込む
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageData;
        });

        // Canvasサイズを画像に合わせる
        canvas.width = img.width;
        canvas.height = img.height;

        // 画像を描画
        ctx.drawImage(img, 0, 0);

        // 骨格を描画
        this.poseDetector.drawLandmarks(canvas, poseResults);
    }

    async generateReport() {
        if (!this.poseResults.lateral) {
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
        this.images = {
            lateral: null,
            frontal: null
        };
        this.poseResults = {
            lateral: null,
            frontal: null
        };
        
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
