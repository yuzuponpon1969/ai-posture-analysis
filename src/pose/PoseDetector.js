/**
 * PoseDetector - MediaPipe Pose統合
 */

import { Pose } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

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
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
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

        // 接続線を描画
        drawConnectors(ctx, poseResults.poseLandmarks, POSE_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 4
        });

        // ランドマークを描画
        drawLandmarks(ctx, poseResults.poseLandmarks, {
            color: '#FF0000',
            fillColor: '#FF0000',
            lineWidth: 2,
            radius: 6
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
