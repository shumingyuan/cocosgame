# 小鸟停留障碍物和碰撞检测功能实现说明

## 功能概述
实现了两个核心功能：
1. 小鸟从上方下落至障碍物上时，让小鸟停下
2. 小鸟从下方撞击障碍物时，游戏结束

## 主要修改

### 1. Player.ts 修改

#### 添加障碍物引用
```typescript
import { Obstacle } from './Obstacle';

// 障碍物列表引用
private obstacles: Obstacle[] = [];

// 当前停留的障碍物
private currentObstacle: Obstacle | null = null;
```

#### 添加设置障碍物列表方法
```typescript
// 设置障碍物列表
setObstacles(obstacles: Obstacle[]) {
    this.obstacles = obstacles;
}
```

#### 添加停留检测方法
```typescript
// 检查是否可以停留在障碍物上
private checkLandingOnObstacle(currentY: number, newY: number): { canLand: boolean, landY: number, obstacle: Obstacle | null } {
    const birdX = this.node.position.x;
    const birdRadius = 20; // 小鸟碰撞半径
    
    for (const obstacle of this.obstacles) {
        if (!obstacle.node.active) continue;
        
        const obstacleY = obstacle.node.position.y;
        const obstacleHeight = 30; // 障碍物高度
        
        // 检查小鸟是否从上方下落到障碍物上方
        // 条件：当前Y > 障碍物顶部，新Y <= 障碍物顶部 + 小鸟半径
        if (currentY > obstacleY + obstacleHeight / 2 && newY <= obstacleY + obstacleHeight / 2 + birdRadius) {
            // 检查小鸟是否在障碍物的X坐标范围内
            // 检查左侧障碍物
            if (obstacle.leftObstacle) {
                const leftTransform = obstacle.leftObstacle.getComponent(UITransform);
                if (leftTransform) {
                    const leftWidth = leftTransform.contentSize.width;
                    const leftX = obstacle.leftObstacle.position.x;
                    // 检查小鸟是否在左侧障碍物上方
                    if (birdX >= leftX - leftWidth / 2 - birdRadius && birdX <= leftX + leftWidth / 2 + birdRadius) {
                        return { canLand: true, landY: obstacleY + obstacleHeight / 2 + birdRadius, obstacle: obstacle };
                    }
                }
            }
            
            // 检查右侧障碍物
            if (obstacle.rightObstacle) {
                const rightTransform = obstacle.rightObstacle.getComponent(UITransform);
                if (rightTransform) {
                    const rightWidth = rightTransform.contentSize.width;
                    const rightX = obstacle.rightObstacle.position.x;
                    // 检查小鸟是否在右侧障碍物上方
                    if (birdX >= rightX - rightWidth / 2 - birdRadius && birdX <= rightX + rightWidth / 2 + birdRadius) {
                        return { canLand: true, landY: obstacleY + obstacleHeight / 2 + birdRadius, obstacle: obstacle };
                    }
                }
            }
        }
    }
    
    return { canLand: false, landY: 0, obstacle: null };
}
```

#### 修改 update 方法
```typescript
// 检查是否可以停留在障碍物上（从上方下落）
const landing = this.checkLandingOnObstacle(this.node.position.y, newY);
if (landing.canLand) {
    newY = landing.landY;
    this.velocityY = 0;
    this.velocityX = 0; // 停留在障碍物上后停止水平移动
    this.currentObstacle = landing.obstacle;
} else {
    this.currentObstacle = null;
    
    // 检查是否碰到地面
    if (newY <= this.groundY) {
        newY = this.groundY;
        this.velocityY = 0;
        this.velocityX = 0; // 碰到地面后停止水平移动
    }
}
```

#### 公开速度属性
```typescript
// 速度相关
velocityX: number = 0; // 水平速度
velocityY: number = 0; // 垂直速度
```

### 2. Obstacle.ts 修改

#### 修改 checkCollision 方法
```typescript
// 检查碰撞
checkCollision(birdX: number, birdY: number, birdRadius: number, velocityY: number = 0): boolean {
    const obstacleY = this.node.position.y;
    const obstacleHeight = 30; // 障碍物高度
    
    // 检查小鸟是否在障碍物的Y坐标范围内
    if (Math.abs(birdY - obstacleY) < birdRadius + obstacleHeight / 2) {
        // 检查左侧障碍物
        if (this.leftObstacle) {
            const leftTransform = this.leftObstacle.getComponent(UITransform);
            if (leftTransform) {
                const leftWidth = leftTransform.contentSize.width;
                const leftX = this.leftObstacle.position.x;
                // 检查小鸟是否在左侧障碍物范围内
                if (birdX < leftX + leftWidth / 2 + birdRadius) {
                    // 如果小鸟从上方下落（velocityY < 0），不算碰撞
                    // 如果小鸟从下方撞击（velocityY >= 0），算碰撞
                    if (velocityY >= 0 || birdY < obstacleY) {
                        return true; // 碰到左侧障碍物
                    }
                }
            }
        }
        
        // 检查右侧障碍物
        if (this.rightObstacle) {
            const rightTransform = this.rightObstacle.getComponent(UITransform);
            if (rightTransform) {
                const rightWidth = rightTransform.contentSize.width;
                const rightX = this.rightObstacle.position.x;
                // 检查小鸟是否在右侧障碍物范围内
                if (birdX > rightX - rightWidth / 2 - birdRadius) {
                    // 如果小鸟从上方下落（velocityY < 0），不算碰撞
                    // 如果小鸟从下方撞击（velocityY >= 0），算碰撞
                    if (velocityY >= 0 || birdY < obstacleY) {
                        return true; // 碰到右侧障碍物
                    }
                }
            }
        }
    }
    
    return false;
}
```

### 3. Game.ts 修改

#### 修改 update 方法
```typescript
update(dt: number) {
    // 更新 Player 的障碍物列表
    if (this.player) {
        const playerComp = this.player.getComponent(Player);
        if (playerComp) {
            playerComp.setObstacles(this.obstacles);
        }
    }
    
    // 检查碰撞
    this.checkCollisions();

    // 更新视角跟随
    this.updateCameraFollow();
}
```

#### 修改 checkCollisions 方法
```typescript
// 检查碰撞
checkCollisions() {
    if (!this.player) return;

    const playerComp = this.player.getComponent(Player);
    if (!playerComp) return;

    const birdX = this.player.position.x;
    const birdY = this.player.position.y;
    const birdRadius = 20; // 小鸟碰撞半径
    const velocityY = playerComp.velocityY; // 获取小鸟的垂直速度

    // 检查每个障碍物
    for (const obstacle of this.obstacles) {
        // 检查碰撞
        if (obstacle.checkCollision(birdX, birdY, birdRadius, velocityY)) {
            // 游戏结束
            this.gameOver();
            return;
        }

        // 检查是否通过缺口
        if (!obstacle.passed && obstacle.checkPassThrough(birdX, birdY, birdRadius)) {
            obstacle.passed = true;
            this.score++;
            console.log('Score:', this.score);
        }
    }
}
```

## 工作原理

### 1. 停留检测
- 检查小鸟是否从障碍物上方下落（当前Y > 障碍物顶部，新Y <= 障碍物顶部 + 小鸟半径）
- 检查小鸟的X坐标是否在障碍物的范围内
- 如果满足条件，小鸟停留在障碍物上方

### 2. 碰撞检测
- 检查小鸟是否在障碍物的Y坐标范围内
- 检查小鸟的X坐标是否在障碍物的范围内
- 根据小鸟的垂直速度判断碰撞类型：
  - 如果 velocityY < 0（从上方下落），不算碰撞
  - 如果 velocityY >= 0（从下方撞击），算碰撞，游戏结束

## 测试建议
1. 测试小鸟是否能正确停留在障碍物上方
2. 测试小鸟从障碍物上起飞是否正常
3. 测试小鸟从下方撞击障碍物是否游戏结束
4. 测试小鸟是否能停留在地面
5. 测试视角跟随是否正常工作

## 注意事项
- 障碍物高度设置为30像素，可以根据实际情况调整
- 小鸟碰撞半径设置为20像素，可以根据实际情况调整
- 需要确保障碍物预制体有UITransform组件