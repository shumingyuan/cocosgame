# 小鸟功能增强说明

## 新增功能

### 1. 边界检测和防出界逻辑
- 添加了边界变量：minX、maxX、maxY
- 在 onLoad() 中初始化边界值，基于父节点的尺寸
- 在 update() 中进行边界检测：
  - 左边界：newX < minX 时，停止水平移动
  - 右边界：newX > maxX 时，停止水平移动
  - 上边界：newY > maxY 时，停止垂直移动
- 留出50像素的边距，防止小鸟完全贴边

### 2. 飞行动画控制
- 添加了 isPlayingAnimation 变量，控制动画播放状态
- playFlyAnimation() 方法：开始播放动画
- stopFlyAnimation() 方法：停止播放动画，重置到第一帧
- 在 update() 中：
  - 只在 isPlayingAnimation 为 true 时更新动画帧
  - 检测速度是否接近0，如果是则停止动画
- 动画只在触发飞行动作时播放，其余时候静止

### 3. 朝向更新
- 添加了 facingRight 变量，记录当前朝向（初始为向右）
- 在 moveToLeft() 方法中：
  - 如果当前朝向右边，则翻转向左（setScale(-1, 1, 1)）
- 在 moveToRight() 方法中：
  - 如果当前朝向左边，则翻转向右（setScale(1, 1, 1)）
- 每次触摸都会根据方向更新朝向

## 实现细节

### 边界检测
```typescript
// 初始化边界
const parentSize = parentTransform.contentSize;
this.minX = -parentSize.width / 2 + 50;
this.maxX = parentSize.width / 2 - 50;
this.maxY = parentSize.height / 2 - 50;

// 边界检测
if (newX < this.minX) {
    newX = this.minX;
    this.velocityX = 0;
}
```

### 动画控制
```typescript
// 开始播放
playFlyAnimation() {
    this.isPlayingAnimation = true;
}

// 停止播放
stopFlyAnimation() {
    this.isPlayingAnimation = false;
    this.sprite.spriteFrame = this.birdFlySprites[0];
}

// 检测停止条件
const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
if (speed < 10 && this.isPlayingAnimation) {
    this.stopFlyAnimation();
}
```

### 朝向更新
```typescript
// 向左飞
if (this.facingRight) {
    this.facingRight = false;
    this.node.setScale(new Vec3(-1, 1, 1));
}

// 向右飞
if (!this.facingRight) {
    this.facingRight = true;
    this.node.setScale(new Vec3(1, 1, 1));
}
```

## 效果
- 小鸟不会飞出屏幕边界
- 飞行动画只在触发动作时播放，其余时候静止
- 小鸟的朝向会根据触摸方向自动更新