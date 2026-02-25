# 障碍物Y坐标过大问题修复说明

## 问题描述
从调试信息来看，障碍物确实在生成，但是Y坐标非常大（217510, 217810等），导致障碍物在屏幕上方非常远的地方，玩家看不到。

## 问题原因
在视角跟随逻辑中，每次小鸟超过屏幕中心时：
1. 障碍物向下移动
2. `lastObstacleY` 也被更新（减去移动距离）
3. 然后又调用 `generateObstacle()`，它会基于 `lastObstacleY` 生成新障碍物
4. 这导致 `lastObstacleY` 不断增加，最终变得非常大

## 修复内容

### 1. 修改视角跟随逻辑
不再在视角跟随时更新 `lastObstacleY`，而是根据当前最高障碍物的位置来决定是否生成新障碍物：

```typescript
// 检查是否需要生成新的障碍物
if (this.obstacles.length > 0) {
    const topObstacle = this.obstacles[this.obstacles.length - 1];
    const topObstacleY = topObstacle.node.position.y;
    const screenTop = this.screenHeight / 2;
    
    if (topObstacleY < screenTop + this.obstacleInterval) {
        this.generateObstacleAtPosition(topObstacleY + this.obstacleInterval);
    }
}
```

### 2. 添加 generateObstacleAtPosition 方法
创建一个新方法，在指定Y坐标生成障碍物：

```typescript
generateObstacleAtPosition(y: number) {
    // 在指定位置生成障碍物
    // ...
}
```

### 3. 修改初始障碍物生成
确保初始障碍物在屏幕可见范围内：

```typescript
generateInitialObstacles() {
    const count = 4;
    for (let i = 0; i < count; i++) {
        const y = this.lastObstacleY + i * this.obstacleInterval;
        this.generateObstacleAtPosition(y);
    }
    this.lastObstacleY = this.lastObstacleY + (count - 1) * this.obstacleInterval;
}
```

## 修复后的效果
- 障碍物的Y坐标保持在合理范围内
- 障碍物在屏幕可见范围内生成
- 视角跟随正常工作
- 障碍物按需生成，不会无限累积

## 测试建议
1. 运行游戏，检查障碍物是否在屏幕可见范围内
2. 测试小鸟向上飞时，障碍物是否正确向下移动
3. 检查是否有新障碍物在合适的位置生成
4. 测试游戏结束逻辑是否正常工作