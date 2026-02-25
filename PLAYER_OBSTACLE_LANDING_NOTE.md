# 小鸟停留障碍物功能实现说明

## 功能概述
实现了小鸟能够停留在障碍物（树枝）上方的功能，以及改进了下落逻辑。

## 主要修改

### 1. Player.ts 修改

#### 添加障碍物引用
```typescript
import { Obstacle } from './Obstacle';

// 障碍物列表引用
private obstacles: Obstacle[] = [];

// 是否在地面上
private isOnGround: boolean = false;
```

#### 添加设置障碍物列表方法
```typescript
// 设置障碍物列表
setObstacles(obstacles: Obstacle[]) {
    this.obstacles = obstacles;
}
```

#### 添加障碍物碰撞检测方法
```typescript
// 检查与障碍物的碰撞
private checkObstacleCollision(currentY: number, newY: number): { collided: boolean, obstacleY: number } {
    const birdX = this.node.position.x;
    const birdRadius = 20; // 小鸟碰撞半径
    
    for (const obstacle of this.obstacles) {
        if (!obstacle.node.active) continue;
        
        const obstacleY = obstacle.node.position.y;
        const obstacleHeight = 30; // 障碍物高度
        
        // 检查小鸟是否在障碍物的Y坐标范围内
        // 小鸟从上方下落到障碍物上方
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
                        return { collided: true, obstacleY: obstacleY + obstacleHeight / 2 + birdRadius };
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
                        return { collided: true, obstacleY: obstacleY + obstacleHeight / 2 + birdRadius };
                    }
                }
            }
        }
    }
    
    return { collided: false, obstacleY: 0 };
}
```

#### 修改 update 方法
```typescript
// 检查是否碰到地面
if (newY <= this.groundY) {
    newY = this.groundY;
    this.velocityY = 0;
    this.velocityX = 0; // 碰到地面后停止水平移动
    this.isOnGround = true;
} else {
    // 检查与障碍物的碰撞
    const collision = this.checkObstacleCollision(this.node.position.y, newY);
    if (collision.collided) {
        newY = collision.obstacleY;
        this.velocityY = 0;
        this.velocityX = 0; // 碰到障碍物后停止水平移动
        this.isOnGround = true;
    } else {
        this.isOnGround = false;
    }
}
```

### 2. Game.ts 修改

#### 修改 update 方法
```typescript
update(dt: number) {
    // 更新 Player 的障碍物列表
    if (this.player) {
        this.player.setObstacles(this.obstacles);
    }
    
    // 检查碰撞
    this.checkCollisions();

    // 更新视角跟随
    this.updateCameraFollow();
}
```

## 工作原理

### 1. 碰撞检测
- 检查小鸟是否从障碍物上方下落
- 检查小鸟的X坐标是否在障碍物的范围内
- 如果满足条件，小鸟停留在障碍物上方

### 2. 停留逻辑
- 当小鸟停留在障碍物上时，速度归零
- 小鸟可以再次起飞，触发飞行动作
- 视角跟随逻辑保持不变

### 3. 地面检测
- 小鸟可以停留在屏幕底部（地面）
- 地面高度为0，即屏幕中心

## 测试建议
1. 测试小鸟是否能正确停留在障碍物上方
2. 测试小鸟从障碍物上起飞是否正常
3. 测试小鸟是否能停留在地面
4. 测试视角跟随是否正常工作
5. 测试障碍物向下移动时，小鸟是否能跟随移动

## 注意事项
- 障碍物高度设置为30像素，可以根据实际情况调整
- 小鸟碰撞半径设置为20像素，可以根据实际情况调整
- 需要确保障碍物预制体有UITransform组件