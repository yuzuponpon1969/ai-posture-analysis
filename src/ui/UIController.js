/**
 * UIController - UI状態管理とイベント処理
 */

export class UIController {
    constructor() {
        this.eventListeners = {};
        this.currentTab = 'upload';
        this.cameraStream = null;
    }

    init() {
        this.setupTabSwitching();
        this.setupImageUpload();
        this.setupCamera();
        this.setupButtons();
    }

    /**
     * イベントリスナーを登録
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    /**
     * イベントを発火
     */
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }

    /**
     * タブ切り替え機能
     */
    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;

                // すべてのタブボタンとコンテンツから active クラスを削除
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // 選択されたタブをアクティブ化
                btn.classList.add('active');
                document.querySelector(`.tab-content[data-tab="${targetTab}"]`).classList.add('active');

                this.currentTab = targetTab;
                this.emit('tabChange', targetTab);
            });
        });
    }

    /**
     * 画像アップロード機能
     */
    setupImageUpload() {
        const uploadArea = document.querySelector('.upload-area');
        const fileInput = document.getElementById('imageUpload');

        // クリックでファイル選択
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // ファイル選択時
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageFile(file);
            }
        });

        // ドラッグ＆ドロップ
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');

            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleImageFile(file);
            } else {
                alert('画像ファイルを選択してください');
            }
        });
    }

    /**
     * 画像ファイルを処理
     */
    handleImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.emit('imageUploaded', e.target.result);
        };
        reader.readAsDataURL(file);
    }

    /**
     * Webカメラ機能
     */
    setupCamera() {
        const startBtn = document.getElementById('startCamera');
        const captureBtn = document.getElementById('capturePhoto');
        const stopBtn = document.getElementById('stopCamera');
        const video = document.getElementById('cameraVideo');
        const canvas = document.getElementById('cameraCanvas');

        // カメラ起動
        startBtn.addEventListener('click', async () => {
            try {
                this.cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: 1280, height: 720 }
                });

                video.srcObject = this.cameraStream;
                video.style.display = 'block';
                canvas.style.display = 'none';

                // ボタン状態を更新
                startBtn.disabled = true;
                captureBtn.disabled = false;
                stopBtn.disabled = false;

            } catch (error) {
                console.error('カメラ起動エラー:', error);
                alert('カメラにアクセスできませんでした');
            }
        });

        // 写真撮影
        captureBtn.addEventListener('click', () => {
            const ctx = canvas.getContext('2d');
            
            // Canvasサイズをビデオに合わせる
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // ビデオフレームをキャプチャ
            ctx.drawImage(video, 0, 0);

            // Canvas を表示、ビデオを非表示
            video.style.display = 'none';
            canvas.style.display = 'block';

            // 画像データを取得
            const imageData = canvas.toDataURL('image/jpeg');
            this.emit('photoCapture', imageData);

            // カメラを停止
            this.stopCamera();
        });

        // カメラ停止
        stopBtn.addEventListener('click', () => {
            this.stopCamera();
        });
    }

    /**
     * カメラを停止
     */
    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }

        const video = document.getElementById('cameraVideo');
        video.srcObject = null;
        video.style.display = 'block';
        
        const canvas = document.getElementById('cameraCanvas');
        canvas.style.display = 'none';

        // ボタン状態を更新
        document.getElementById('startCamera').disabled = false;
        document.getElementById('capturePhoto').disabled = true;
        document.getElementById('stopCamera').disabled = true;
    }

    /**
     * ボタンのイベント設定
     */
    setupButtons() {
        // 解析ボタン
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.emit('analyzeClick');
        });

        // リセットボタン
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.emit('resetClick');
        });

        // レポート生成ボタン
        document.getElementById('generateReportBtn').addEventListener('click', () => {
            this.emit('generateReportClick');
        });

        // URLコピーボタン
        document.getElementById('copyUrlBtn').addEventListener('click', () => {
            this.copySlideUrl();
        });

        // スライドを開くボタン
        document.getElementById('openSlideBtn').addEventListener('click', () => {
            this.openSlide();
        });
    }

    /**
     * ローディング表示
     */
    showLoading() {
        document.getElementById('loadingIndicator').style.display = 'block';
        document.getElementById('analyzeBtn').disabled = true;
    }

    /**
     * ローディング非表示
     */
    hideLoading() {
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('analyzeBtn').disabled = false;
    }

    /**
     * 結果を表示
     */
    displayResults(results) {
        // 総合スコアを表示
        document.getElementById('totalScore').textContent = results.totalScore.toFixed(0);

        // 詳細スコアを表示
        const detailedScoresContainer = document.getElementById('detailedScores');
        detailedScoresContainer.innerHTML = '';

        results.details.forEach(item => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            scoreItem.innerHTML = `
                <div class="score-item-title">${item.name}</div>
                <div class="score-item-value">${item.score.toFixed(0)}/100</div>
                <div class="score-item-description">${item.description}</div>
            `;
            detailedScoresContainer.appendChild(scoreItem);
        });

        // 結果セクションを表示
        document.getElementById('resultsSection').style.display = 'block';

        // 結果セクションまでスクロール
        document.getElementById('resultsSection').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    /**
     * スライドURLをコピー
     */
    copySlideUrl() {
        const urlInput = document.getElementById('slideUrl');
        urlInput.select();
        document.execCommand('copy');

        const copyBtn = document.getElementById('copyUrlBtn');
        copyBtn.textContent = '✅';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyBtn.textContent = '📋';
            copyBtn.classList.remove('copied');
        }, 2000);
    }

    /**
     * スライドを開く
     */
    openSlide() {
        const url = document.getElementById('slideUrl').value;
        if (url) {
            window.open(url, '_blank');
        }
    }

    /**
     * リセット
     */
    reset() {
        // ファイル入力をクリア
        document.getElementById('imageUpload').value = '';

        // カメラを停止
        this.stopCamera();

        // Canvasをクリア
        const canvas = document.getElementById('poseCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // スライドURLエリアを非表示
        document.getElementById('slideUrlContainer').style.display = 'none';
    }
}
