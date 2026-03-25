# 障碍物生成和缺口设计调整说明

## 修改概述
按照用户要求调整了障碍物生成逻辑和缺口设计，包括：
1. 高度间隔在250-600之间随机
2. 通过调整树枝的水平位置来实现缺口
3. 缺口的位置和宽度都在一定范围内随机变化

## 主要修改

### 1. Game.ts 修改

#### 添加新的属性
```typescript
// 最小障碍物间隔
@property
minObstacleInterval: number = 250;

// 最大障碍物间隔
@property
maxObstacleInterval: number = 600;

// 最小缺口宽度
@property
minGapWidth: number = 120;

// 最大缺口宽度
@property
maxGapWidth: number = 300;

// 最小缺口偏移（-100表示缺口偏左，100表示缺口偏右）
@property
minGapOffset: number = -100;

// 最大缺口偏移
@property
maxGapOffset: number = 100;
```

#### 修改障碍物间隔生成
```typescript
// 生成初始障碍物
generateInitialObstacles() {
    const count = 4;
    let currentY = this.lastObstacleY;
    for (let i = 0; i < count; i++) {
        this.generateObstacleAtPosition(currentY);
        // 随机生成下一个障碍物的间隔
        const randomInterval = this.minObstacleInterval + Math.random() * (this.maxObstacleInterval - this.minObstacleInterval);
        currentY += randomInterval;
    }
    this.lastObstacleY = currentY;
}

// 生成单个障碍物
generateObstacle() {
    const randomInterval = this.minObstacleInterval + Math.random() * (this.maxObstacleInterval - this.minObstacleInterval);
    this.generateObstacleAtPosition(this.lastObstacleY + randomInterval);
    this.lastObstacleY += randomInterval;
}
```

#### 修改障碍物生成，添加缺口偏移
```typescript
// 设置随机缺口宽度
const gapWidth = this.minGapWidth + Math.random() * (this.maxGapWidth - this.minGapWidth);
obstacle.gapWidth = gapWidth;

// 设置随机缺口偏移
const gapOffset = this.minGapOffset + Math.random() * (this.maxGapOffset - this.minGapOffset);
obstacle.gapOffset = gapOffset;
```

### 2. Obstacle.ts 修改

#### 添加缺口偏移属性
```typescript
// 缺口偏移（-100表示缺口偏左，100表示缺口偏右）
@property
gapOffset: number = 0;
```

#### 修改障碍物位置计算
```typescript
// 计算缺口的左右边界
// gapOffset 是缺口中心相对于屏幕中心的偏移
// gapLeft = gapOffset - gapWidth/2
// gapRight = gapOffset + gapWidth/2
const gapLeft = this.gapOffset - this.gapWidth / 2;
const gapRight = this.gapOffset + this.gapWidth / 2;

if (side === 'left') {
    // 左侧树枝：右边缘在 gapLeft 位置
    // 树枝宽度500，所以左边缘 = gapLeft - 500
    const xPos = gapLeft - obstacleWidth / 2;
    obstacle.setPosition(new Vec3(xPos, 0, 0));
} else {
    // 右侧树枝：左边缘在 gapRight 位置
    // 树枝宽度500，所以右边缘 = gapRight + 500
    const xPos = gapRight + obstacleWidth / 2;
    obstacle.setPosition(new Vec3(xPos, 0, 0));
}
```

#### 修改碰撞检测，使用新的缺口计算
```typescript
// 计算缺口的左右边界
const gapLeft = this.gapOffset - this.gapWidth / 2;
const gapRight = this.gapOffset + this.gapWidth / 2;

// 检查小鸟是否在缺口范围内
const inGap = birdX > gapLeft - birdRadius && birdX < gapRight + birdRadius;
```

## 工作原理

### 1. 障碍物高度间隔
- 最小间隔：250像素
- 最大间隔：600像素
- 每次生成障碍物时随机选择间隔

### 2. 缺口计算
- 缺口宽度：在120-300之间随机
- 缺口偏移：在-100到100之间随机（-100表示偏左，100表示偏右）
- 缺口中心 = 屏幕中心 + 缺口偏移
- 缺口左边界 = 缺口中心 - 缺口宽度/2
- 缺口右边界 = 缺口中心 + 缺口宽度/2

### 3. 树枝位置计算
- 左侧树枝：右边缘在缺口左边界
  - 树枝宽度500，所以中心X = 缺口左边界 - 250
- 右侧树枝：左边缘在缺口右边界
  - 树枝宽度500，所以中心X = 缺口右边界 + 250

### 4. 示例
假设：
- 屏幕宽度：720（中心在X=0）
- 缺口偏移：-150（缺口偏左）
- 缺口宽度：300
- 树枝宽度：500

计算：
- 缺口中心 = 0 + (-150) = -150
- 缺口左边界 = -150 - 150 = -300
- 缺口右边界 = -150 + 150 = 0
- 左侧树枝中心 = -300 - 250 = -550
- 右侧树枝中心 = 0 + 250 = 250

## 配置说明

### Game 组件属性
- `minObstacleInterval`: 最小障碍物间隔（默认250）
- `maxObstacleInterval`: 最大障碍物间隔（默认600）
- `minGapWidth`: 最小缺口宽度（默认120）
- `maxGapWidth`: 最大缺口宽度（默认300）
- `minGapOffset`: 最小缺口偏移（默认-100）
- `maxGapOffset`: 最大缺口偏移（默认100）

### Obstacle 组件属性
- `leftTreePrefab`: 左侧树枝预制体
- `rightTreePrefab`: 右侧树枝预制体
- `gapWidth`: 缺口宽度（会被Game随机设置）
- `gapOffset`: 缺口偏移（会被Game随机设置）

## 测试建议
1. 测试障碍物间隔是否在250-600之间随机
2. 测试缺口宽度是否在120-300之间随机
3. 测试缺口位置是否在-100到100之间随机
4. 测试树枝位置是否正确
5. 测试碰撞检测是否正常
6. 测试小鸟能否正确停留在障碍物上

## 优势
1. 障碍物间隔随机，增加游戏挑战性
2. 缺口位置和宽度随机，避免游戏太过死板
3. 通过调整树枝位置实现缺口，逻辑更清晰
4. 支持更大的缺口宽度范围（120-300）
5. 缺口可以偏离中心，增加游戏难度