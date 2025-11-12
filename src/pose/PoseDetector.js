/**
 * PoseDetector - MediaPipe Pose統合
 */

import { Pose } from '@mediapipe/pose';

export class PoseDetector {
    constructor() {
        this.pose = null;
        this.isInitialized = false;
    }

    async init() {
        console.log('📡 MediaPipe Poseを初期化中...');

        try {
            this.pose = new Pose({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
                }
            });

            this.pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                smoothSegmentation: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.isInitialized = true;
            console.log('✅ MediaPipe Pose初期化完了');

        } catch (error) {
            console.error('❌ MediaPipe Pose初期化エラー:', error);
            throw error;
        }
    }

    /**
     * 画像から姿勢を検出
     */
    async detectPose(imageData) {
        if (!this.isInitialized) {
            throw new Error('PoseDetectorが初期化されていません');
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = async () => {
                try {
                    this.pose.onResults((results) => {
                        resolve(results);
                    });

                    await this.pose.send({ image: img });

                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = (error) => {
                reject(new Error('画像の読み込みに失敗しました'));
            };

            img.src = imageData;
        });
    }

    /**
     * Canvasに骨格を描画
     */
    drawLandmarks(canvas, poseResults) {
        const ctx = canvas.getContext('2d');

        if (!poseResults || !poseResults.poseLandmarks) {
            return;
        }

        // ランドマークを手動で描画
        this.drawLandmarksManually(ctx, poseResults.poseLandmarks);
        this.drawConnectionsManually(ctx, poseResults.poseLandmarks);
    }

    /**
     * ランドマークを手動で描画
     */
    drawLandmarksManually(ctx, landmarks) {
        landmarks.forEach((landmark, index) => {
            const x = landmark.x * ctx.canvas.width;
            const y = landmark.y * ctx.canvas.height;

            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#FF0000';
            ctx.fill();
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    /**
     * 接続線を手動で描画
     */
    drawConnectionsManually(ctx, landmarks) {
        const connections = [
            [11, 12], // 左肩-右肩
            [11, 13], // 左肩-左肘
            [13, 15], // 左肘-左手首
            [12, 14], // 右肩-右肘
            [14, 16], // 右肘-右手首
            [11, 23], // 左肩-左股関節
            [12, 24], // 右肩-右股関節
            [23, 24], // 左股関節-右股関節
            [23, 25], // 左股関節-左膝
            [25, 27], // 左膝-左足首
            [24, 26], // 右股関節-右膝
            [26, 28], // 右膝-右足首
        ];

        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 4;

        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];

            if (startPoint && endPoint) {
                ctx.beginPath();
                ctx.moveTo(startPoint.x * ctx.canvas.width, startPoint.y * ctx.canvas.height);
                ctx.lineTo(endPoint.x * ctx.canvas.width, endPoint.y * ctx.canvas.height);
                ctx.stroke();
            }
        });
    }

    /**
     * ランドマークのインデックス定義
     */
    static get LANDMARKS() {
        return {
            NOSE: 0,
            LEFT_EYE_INNER: 1,
            LEFT_EYE: 2,
            LEFT_EYE_OUTER: 3,
            RIGHT_EYE_INNER: 4,
            RIGHT_EYE: 5,
            RIGHT_EYE_OUTER: 6,
            LEFT_EAR: 7,
            RIGHT_EAR: 8,
            MOUTH_LEFT: 9,
            MOUTH_RIGHT: 10,
            LEFT_SHOULDER: 11,
            RIGHT_SHOULDER: 12,
            LEFT_ELBOW: 13,
            RIGHT_ELBOW: 14,
            LEFT_WRIST: 15,
            RIGHT_WRIST: 16,
            LEFT_PINKY: 17,
            RIGHT_PINKY: 18,
            LEFT_INDEX: 19,
            RIGHT_INDEX: 20,
            LEFT_THUMB: 21,
            RIGHT_THUMB: 22,
            LEFT_HIP: 23,
            RIGHT_HIP: 24,
            LEFT_KNEE: 25,
            RIGHT_KNEE: 26,
            LEFT_ANKLE: 27,
            RIGHT_ANKLE: 28,
            LEFT_HEEL: 29,
            RIGHT_HEEL: 30,
            LEFT_FOOT_INDEX: 31,
            RIGHT_FOOT_INDEX: 32
        };
    }
}
