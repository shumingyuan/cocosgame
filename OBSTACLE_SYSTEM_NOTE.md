# 障碍物系统实现说明

## 功能概述
实现了一个完整的障碍物系统，包括障碍物生成、碰撞检测、视角跟随和得分系统。

## 实现的功能

### 1. 障碍物生成 (Obstacle.ts)
- 创建了横向条状遮挡物，由左右两部分组成
- 中间留有缺口，供小鸟通过
- 缺口宽度可配置（minGapWidth 到 maxGapWidth）
- 障碍物颜色为棕色，模拟树枝外观

### 2. 随机缺口位置和宽度
- 缺口宽度在 minGapWidth (120) 到 maxGapWidth (200) 之间随机
- 确保缺口足够宽，让小鸟能够通过
- 障碍物之间的垂直间隔为 obstacleInterval (300)

### 3. 碰撞检测
- `checkCollision()`: 检查小鸟是否与障碍物碰撞
- `checkPassThrough()`: 检查小鸟是否成功通过缺口
- 使用小鸟的碰撞半径进行精确检测
- 碰撞后触发游戏结束逻辑

### 4. 视角跟随
- 当小鸟超过屏幕中心时，障碍物向下移动
- 实现了视角跟随效果，让玩家感觉小鸟在向上飞
- 同时保持小鸟在屏幕中心位置
- 自动清理屏幕下方的障碍物

### 5. 视差效果
- 通过移动障碍物而不是移动摄像机，实现视差效果
- 障碍物向下移动的速度与小鸟向上飞行的速度相关
- 增强了游戏的沉浸感和视觉效果

## 核心代码结构

### Obstacle.ts
```typescript
@ccclass('Obstacle')
export class Obstacle extends Component {
    gapWidth: number = 150; // 缺口宽度
    private gapCenterY: number = 0; // 缺口中心Y坐标
    
    // 创建左右障碍物
    createObstacles()
    
    // 设置缺口位置
    setGapPosition(gapCenterY: number)
    
    // 检查碰撞
    checkCollision(birdX, birdY, birdRadius): boolean
    
    // 检查通过
    checkPassThrough(birdX, birdY, birdRadius): boolean
}
```

### Game.ts
```typescript
@ccclass('Game')
export class Game extends Component {
    // 障碍物生成
    generateObstacle()
    generateInitialObstacles()
    
    // 碰撞检测
    checkCollisions()
    
    // 视角跟随
    updateCameraFollow()
    
    // 清理障碍物
    cleanupObstacles()
    
    // 游戏结束
    gameOver()
}
```

## 配置参数
- `obstacleInterval`: 300 - 障碍物之间的垂直间隔
- `minGapWidth`: 120 - 最小缺口宽度
- `maxGapWidth`: 200 - 最大缺口宽度
- `birdRadius`: 20 - 小鸟碰撞半径

## 使用说明
1. 在 Cocos Creator 编辑器中创建一个空节点作为障碍物预制体
2. 将 Obstacle 组件添加到该节点
3. 将预制体拖拽到 Game 组件的 obstaclePrefab 属性
4. 运行游戏，障碍物会自动生成

## 游戏流程
1. 游戏开始时，生成4个初始障碍物
2. 小鸟通过触摸屏幕左右两侧进行飞行
3. 当小鸟超过屏幕中心时，障碍物向下移动，实现视角跟随
4. 小鸟通过缺口时得分增加
5. 小鸟碰到障碍物时游戏结束

## 注意事项
- 需要在编辑器中设置障碍物预制体
- 障碍物的颜色和样式可以在 Obstacle.ts 中修改
- 可以通过调整参数来改变游戏难度