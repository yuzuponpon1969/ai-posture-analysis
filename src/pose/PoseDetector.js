/**
 * PoseDetector - TensorFlow.js Pose Detection統合
 */

import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

export class PoseDetector {
    constructor() {
        this.detector = null;
        this.isInitialized = false;
    }

    async init() {
        console.log('📡 TensorFlow.js Pose Detectionを初期化中...');

        try {
            // MoveNet Lightningモデルを使用（高速で精度も良い）
            this.detector = await poseDetection.createDetector(
                poseDetection.SupportedModels.MoveNet,
                {
                    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
                }
            );

            this.isInitialized = true;
            console.log('✅ TensorFlow.js Pose Detection初期化完了');

        } catch (error) {
            console.error('❌ TensorFlow.js Pose Detection初期化エラー:', error);
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
                    // TensorFlow.js Pose Detectionで姿勢推定
                    const poses = await this.detector.estimatePoses(img);
                    
                    if (poses && poses.length > 0) {
                        // MediaPipe形式に変換
                        const pose = poses[0];
                        const landmarks = this.convertToMediaPipeFormat(pose.keypoints);
                        
                        resolve({
                            poseLandmarks: landmarks
                        });
                    } else {
                        reject(new Error('姿勢が検出できませんでした'));
                    }

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
     * TensorFlow.js keypointsをMediaPipe形式に変換
     */
    convertToMediaPipeFormat(keypoints) {
        // MoveNetのキーポイントインデックス
        const moveNetToMediaPipe = {
            0: 0,   // nose
            1: 2,   // left_eye -> left_eye
            2: 5,   // right_eye -> right_eye
            3: 7,   // left_ear
            4: 8,   // right_ear
            5: 11,  // left_shoulder
            6: 12,  // right_shoulder
            7: 13,  // left_elbow
            8: 14,  // right_elbow
            9: 15,  // left_wrist
            10: 16, // right_wrist
            11: 23, // left_hip
            12: 24, // right_hip
            13: 25, // left_knee
            14: 26, // right_knee
            15: 27, // left_ankle
            16: 28  // right_ankle
        };

        // MediaPipe形式の33個のランドマーク配列を初期化
        const mediaPipeLandmarks = new Array(33).fill(null).map(() => ({
            x: 0,
            y: 0,
            z: 0,
            visibility: 0
        }));

        // MoveNetのキーポイントをMediaPipe形式に変換
        keypoints.forEach((keypoint, index) => {
            const mediaPipeIndex = moveNetToMediaPipe[index];
            if (mediaPipeIndex !== undefined) {
                // 画像座標を正規化（0-1の範囲に）
                mediaPipeLandmarks[mediaPipeIndex] = {
                    x: keypoint.x,
                    y: keypoint.y,
                    z: 0,
                    visibility: keypoint.score || 0
                };
            }
        });

        return mediaPipeLandmarks;
    }

    /**
     * Canvasに骨格を描画
     */
    drawLandmarks(canvas, poseResults) {
        const ctx = canvas.getContext('2d');

        if (!poseResults || !poseResults.poseLandmarks) {
            return;
        }

        // ランドマークを描画
        this.drawLandmarksManually(ctx, poseResults.poseLandmarks);
        // 接続線を描画
        this.drawConnectionsManually(ctx, poseResults.poseLandmarks);
    }

    /**
     * ランドマークを手動で描画
     */
    drawLandmarksManually(ctx, landmarks) {
        landmarks.forEach((landmark, index) => {
            if (landmark.visibility > 0.5) {
                const x = landmark.x;
                const y = landmark.y;

                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = '#FF0000';
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
    }

    /**
     * 接続線を手動で描画
     */
    drawConnectionsManually(ctx, landmarks) {
        const connections = [
            [0, 7],   // 鼻-左耳
            [0, 8],   // 鼻-右耳
            [7, 11],  // 左耳-左肩（近似）
            [8, 12],  // 右耳-右肩（近似）
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

            if (startPoint && endPoint && 
                startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
                ctx.beginPath();
                ctx.moveTo(startPoint.x, startPoint.y);
                ctx.lineTo(endPoint.x, endPoint.y);
                ctx.stroke();
            }
        });
    }

    /**
     * ランドマークのインデックス定義（MediaPipe互換）
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
