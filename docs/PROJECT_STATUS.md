# AI姿勢分析アプリ - プロジェクト状態

## 📅 最終更新日
2025-11-12

## 🎯 プロジェクト概要
MediaPipe Poseを使用したブラウザベースの姿勢分析アプリ。
理学療法で広く使われるケンダル法に基づいて、静止姿勢を評価。

**GitHubリポジトリ**: https://github.com/yuzuponpon1969/ai-posture-analysis

## ✅ 実装済み機能

### Phase 1: 基本セットアップ ✅
- [x] プロジェクト構造の作成
- [x] package.json、vite.config.js設定
- [x] 基本的なHTML/CSS作成
- [x] MediaPipe Pose統合

### Phase 2: 入力機能 ✅
- [x] 画像アップロード機能
  - ドラッグ＆ドロップ対応
  - ファイル選択機能
- [x] Webカメラ撮影機能
  - カメラ起動/停止
  - 写真撮影
  - プレビュー表示

### Phase 3: 解析機能 ✅
- [x] MediaPipe Poseによる骨格検出
- [x] Canvas描画（骨格表示）
- [x] 側面観評価（6項目）
  - 頭部前方位
  - 肩の位置
  - 脊柱アライメント
  - 骨盤傾斜
  - 膝の位置
  - 足首アライメント

### Phase 4: スコアリング ✅
- [x] 理学療法の標準的な基準値に基づく評価
- [x] 総合スコア計算
- [x] 詳細スコア表示
- [x] 視覚的フィードバック

## 🚧 開発中の機能

### Phase 5: レポート生成 🔜
- [ ] Google Apps Script連携
- [ ] Googleスライドレポート自動生成
- [ ] URLコピー＆アクセス機能

### Phase 6: 後面観評価 📅
- [ ] 肩の高さの左右差
- [ ] 肩甲骨位置
- [ ] 骨盤の高さの左右差
- [ ] 脊柱側弯

## 📂 ファイル構成

```
ai-gait-analysis/
├── index.html                    # メインHTML（5001文字）
├── vite.config.js                # Vite設定（457文字）
├── package.json                  # 依存関係（624文字）
├── .gitignore                    # Git除外設定（254文字）
├── README.md                     # プロジェクト説明
├── src/
│   ├── main.js                   # エントリーポイント（5465文字）
│   ├── styles/
│   │   └── main.css              # スタイルシート（8971文字）
│   ├── pose/
│   │   └── PoseDetector.js       # MediaPipe統合（3522文字）
│   ├── analysis/
│   │   └── KendallAnalyzer.js    # 評価ロジック（8240文字）
│   └── ui/
│       └── UIController.js       # UI制御（9022文字）
├── gas/
│   └── (Google Apps Script - 未実装)
└── docs/
    └── PROJECT_STATUS.md         # このファイル
```

## 🎨 技術的な実装詳細

### MediaPipe Pose設定
- **Model Complexity**: 1（バランス重視）
- **Min Detection Confidence**: 0.5
- **Min Tracking Confidence**: 0.5
- **Smooth Landmarks**: true

### 評価アルゴリズム

#### 1. 頭部前方位
```javascript
// 水平距離で評価
horizontalDistance = |ear.x - shoulder.x|
// 理想値: 0.03以内
score = 100 - (distance - 0.03) * 2000
```

#### 2. 肩の位置
```javascript
// 耳と股関節の中間からの偏差
idealShoulderX = (ear.x + hip.x) / 2
deviation = |shoulder.x - idealShoulderX|
// 理想値: 0.02以内
score = 100 - (deviation - 0.02) * 2500
```

#### 3. 脊柱アライメント
```javascript
// 肩-股関節の角度（垂直を90度とする）
angle = atan2(dy, dx) * (180 / π)
angleDifference = |angle - 90|
// 理想値: ±5度以内
score = 100 - (angleDifference - 5) * 3
```

#### 4. 骨盤傾斜
```javascript
// 股関節-膝の角度（垂直を90度とする）
angle = atan2(dy, dx) * (180 / π)
angleDifference = |angle - 90|
// 理想値: ±5度以内
score = 100 - (angleDifference - 5) * 3
```

#### 5. 膝の位置
```javascript
// 水平距離で評価
horizontalDistance = |knee.x - hip.x|
// 理想値: 0.03以内
score = 100 - (distance - 0.03) * 2000
```

#### 6. 足首アライメント
```javascript
// 水平距離で評価
horizontalDistance = |ankle.x - knee.x|
// 理想値: 0.03以内
score = 100 - (distance - 0.03) * 2000
```

### スコア評価基準
- **90-100点**: ✅ 優秀（理想的）
- **70-89点**: ⚠️ 良好（軽度の問題）
- **50-69点**: ⚠️ 注意（中等度の問題）
- **0-49点**: ❌ 要改善（顕著な問題）

## 🐛 既知の問題

現在、既知の重大なバグはありません。

## 📝 次のステップ

### 優先度 高
1. ✅ 基本機能の実装完了
2. 🔜 npm installとテスト実行
3. 🔜 Google Apps Script連携

### 優先度 中
4. 後面観評価の実装
5. 履歴管理機能
6. データエクスポート機能

### 優先度 低
7. UI/UXの改善
8. アニメーション効果
9. 多言語対応

## 🔧 開発環境

- **Node.js**: v18以上推奨
- **npm**: v9以上推奨
- **ブラウザ**: Chrome, Firefox, Safari（最新版）

## 📞 サポート

問題が発生した場合は、GitHubのIssuesで報告してください。

---

**最終更新者**: yuzuponpon1969  
**更新日時**: 2025-11-12
