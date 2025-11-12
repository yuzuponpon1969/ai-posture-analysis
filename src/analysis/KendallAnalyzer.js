/**
 * KendallAnalyzer - ケンダル法による姿勢評価
 */

import { PoseDetector } from '../pose/PoseDetector.js';

export class KendallAnalyzer {
    constructor() {
        this.LANDMARKS = PoseDetector.LANDMARKS;
    }

    /**
     * 側面観評価（Lateral View）
     * ケンダル法に基づく6つの評価項目
     */
    analyzeLateralView(landmarks) {
        const results = {
            totalScore: 0,
            details: []
        };

        // 1. 頭部前方位（Forward Head Posture）
        const headPosture = this.evaluateHeadPosture(landmarks);
        results.details.push(headPosture);

        // 2. 肩の位置（Shoulder Position）
        const shoulderPosition = this.evaluateShoulderPosition(landmarks);
        results.details.push(shoulderPosition);

        // 3. 脊柱アライメント（Spinal Alignment）
        const spinalAlignment = this.evaluateSpinalAlignment(landmarks);
        results.details.push(spinalAlignment);

        // 4. 骨盤傾斜（Pelvic Tilt）
        const pelvicTilt = this.evaluatePelvicTilt(landmarks);
        results.details.push(pelvicTilt);

        // 5. 膝の位置（Knee Position）
        const kneePosition = this.evaluateKneePosition(landmarks);
        results.details.push(kneePosition);

        // 6. 足首アライメント（Ankle Alignment）
        const ankleAlignment = this.evaluateAnkleAlignment(landmarks);
        results.details.push(ankleAlignment);

        // 総合スコアを計算（平均）
        const totalScore = results.details.reduce((sum, item) => sum + item.score, 0) / results.details.length;
        results.totalScore = totalScore;

        return results;
    }

    /**
     * 1. 頭部前方位の評価
     * 理想: 耳孔が肩の真上にある
     */
    evaluateHeadPosture(landmarks) {
        const ear = landmarks[this.LANDMARKS.LEFT_EAR];
        const shoulder = landmarks[this.LANDMARKS.LEFT_SHOULDER];

        // 水平方向の距離を計算
        const horizontalDistance = Math.abs(ear.x - shoulder.x);

        // 理想値: 0（耳が肩の真上）
        // 許容範囲: 0.03以内は良好、0.05以上は問題
        let score = 100;
        if (horizontalDistance > 0.03) {
            score = Math.max(0, 100 - (horizontalDistance - 0.03) * 2000);
        }

        // 角度を計算（参考値）
        const angle = Math.atan2(ear.y - shoulder.y, ear.x - shoulder.x) * (180 / Math.PI);

        return {
            name: '頭部前方位',
            score: score,
            value: horizontalDistance.toFixed(3),
            angle: angle.toFixed(1) + '°',
            description: this.getHeadPostureDescription(score)
        };
    }

    getHeadPostureDescription(score) {
        if (score >= 90) return '✅ 優秀：頭部が理想的な位置にあります';
        if (score >= 70) return '⚠️ 良好：軽度の前方偏位が見られます';
        if (score >= 50) return '⚠️ 注意：中等度の頭部前方位です';
        return '❌ 要改善：顕著な頭部前方位が見られます';
    }

    /**
     * 2. 肩の位置の評価
     * 理想: 肩が耳孔と股関節の中間にある
     */
    evaluateShoulderPosition(landmarks) {
        const ear = landmarks[this.LANDMARKS.LEFT_EAR];
        const shoulder = landmarks[this.LANDMARKS.LEFT_SHOULDER];
        const hip = landmarks[this.LANDMARKS.LEFT_HIP];

        // 理想的な肩の位置（耳と股関節の中間）
        const idealShoulderX = (ear.x + hip.x) / 2;
        const deviation = Math.abs(shoulder.x - idealShoulderX);

        // スコア計算
        let score = 100;
        if (deviation > 0.02) {
            score = Math.max(0, 100 - (deviation - 0.02) * 2500);
        }

        // 肩の傾き角度
        const angle = Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x) * (180 / Math.PI);

        return {
            name: '肩の位置',
            score: score,
            value: deviation.toFixed(3),
            angle: angle.toFixed(1) + '°',
            description: this.getShoulderDescription(score)
        };
    }

    getShoulderDescription(score) {
        if (score >= 90) return '✅ 優秀：肩が理想的な位置にあります';
        if (score >= 70) return '⚠️ 良好：軽度の位置偏位が見られます';
        if (score >= 50) return '⚠️ 注意：中等度の肩の位置異常です';
        return '❌ 要改善：顕著な肩の位置異常が見られます';
    }

    /**
     * 3. 脊柱アライメントの評価
     * 理想: 肩と股関節を結ぶ線が垂直に近い
     */
    evaluateSpinalAlignment(landmarks) {
        const shoulder = landmarks[this.LANDMARKS.LEFT_SHOULDER];
        const hip = landmarks[this.LANDMARKS.LEFT_HIP];

        // 肩-股関節の角度を計算（垂直を90度とする）
        const dx = shoulder.x - hip.x;
        const dy = shoulder.y - hip.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        // 理想角度: 90度（垂直）
        const idealAngle = 90;
        const angleDifference = Math.abs(angle - idealAngle);

        // スコア計算
        let score = 100;
        if (angleDifference > 5) {
            score = Math.max(0, 100 - (angleDifference - 5) * 3);
        }

        return {
            name: '脊柱アライメント',
            score: score,
            value: angleDifference.toFixed(1) + '°',
            angle: angle.toFixed(1) + '°',
            description: this.getSpinalDescription(score)
        };
    }

    getSpinalDescription(score) {
        if (score >= 90) return '✅ 優秀：脊柱アライメントが理想的です';
        if (score >= 70) return '⚠️ 良好：軽度のアライメント偏位があります';
        if (score >= 50) return '⚠️ 注意：中等度の脊柱アライメント異常です';
        return '❌ 要改善：顕著な脊柱アライメント異常が見られます';
    }

    /**
     * 4. 骨盤傾斜の評価
     * 理想: 骨盤が中間位（前後傾なし）
     */
    evaluatePelvicTilt(landmarks) {
        const hip = landmarks[this.LANDMARKS.LEFT_HIP];
        const knee = landmarks[this.LANDMARKS.LEFT_KNEE];

        // 股関節-膝の角度を計算
        const dx = knee.x - hip.x;
        const dy = knee.y - hip.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        // 理想角度: 90度（垂直）
        const idealAngle = 90;
        const angleDifference = Math.abs(angle - idealAngle);

        // スコア計算
        let score = 100;
        if (angleDifference > 5) {
            score = Math.max(0, 100 - (angleDifference - 5) * 3);
        }

        return {
            name: '骨盤傾斜',
            score: score,
            value: angleDifference.toFixed(1) + '°',
            angle: angle.toFixed(1) + '°',
            description: this.getPelvicDescription(score)
        };
    }

    getPelvicDescription(score) {
        if (score >= 90) return '✅ 優秀：骨盤が中間位にあります';
        if (score >= 70) return '⚠️ 良好：軽度の骨盤傾斜があります';
        if (score >= 50) return '⚠️ 注意：中等度の骨盤傾斜です';
        return '❌ 要改善：顕著な骨盤傾斜が見られます';
    }

    /**
     * 5. 膝の位置の評価
     * 理想: 膝が股関節の真下にある
     */
    evaluateKneePosition(landmarks) {
        const hip = landmarks[this.LANDMARKS.LEFT_HIP];
        const knee = landmarks[this.LANDMARKS.LEFT_KNEE];

        // 水平方向の距離を計算
        const horizontalDistance = Math.abs(knee.x - hip.x);

        // スコア計算
        let score = 100;
        if (horizontalDistance > 0.03) {
            score = Math.max(0, 100 - (horizontalDistance - 0.03) * 2000);
        }

        // 角度計算
        const angle = Math.atan2(knee.y - hip.y, knee.x - hip.x) * (180 / Math.PI);

        return {
            name: '膝の位置',
            score: score,
            value: horizontalDistance.toFixed(3),
            angle: angle.toFixed(1) + '°',
            description: this.getKneeDescription(score)
        };
    }

    getKneeDescription(score) {
        if (score >= 90) return '✅ 優秀：膝が理想的な位置にあります';
        if (score >= 70) return '⚠️ 良好：軽度の膝の位置偏位があります';
        if (score >= 50) return '⚠️ 注意：中等度の膝の位置異常です';
        return '❌ 要改善：顕著な膝の位置異常が見られます';
    }

    /**
     * 6. 足首アライメントの評価
     * 理想: 足首が膝の真下にある
     */
    evaluateAnkleAlignment(landmarks) {
        const knee = landmarks[this.LANDMARKS.LEFT_KNEE];
        const ankle = landmarks[this.LANDMARKS.LEFT_ANKLE];

        // 水平方向の距離を計算
        const horizontalDistance = Math.abs(ankle.x - knee.x);

        // スコア計算
        let score = 100;
        if (horizontalDistance > 0.03) {
            score = Math.max(0, 100 - (horizontalDistance - 0.03) * 2000);
        }

        // 角度計算
        const angle = Math.atan2(ankle.y - knee.y, ankle.x - knee.x) * (180 / Math.PI);

        return {
            name: '足首アライメント',
            score: score,
            value: horizontalDistance.toFixed(3),
            angle: angle.toFixed(1) + '°',
            description: this.getAnkleDescription(score)
        };
    }

    getAnkleDescription(score) {
        if (score >= 90) return '✅ 優秀：足首が理想的な位置にあります';
        if (score >= 70) return '⚠️ 良好：軽度の足首アライメント偏位があります';
        if (score >= 50) return '⚠️ 注意：中等度の足首アライメント異常です';
        return '❌ 要改善：顕著な足首アライメント異常が見られます';
    }
}
