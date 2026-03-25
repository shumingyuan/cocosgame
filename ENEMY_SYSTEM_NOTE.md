# 敌人系统实现说明

## 功能概述
实现了敌人（小怪）系统，包括：
1. 敌人动画播放（4帧循环动画）
2. 敌人在障碍物上方左右移动
3. 敌人随机生成在障碍物上
4. 玩家触碰敌人后游戏结束

## 文件结构

### 1. Enemy.ts
新创建的敌人组件，控制敌人的行为。

#### 主要属性
```typescript
// 动画帧
@property({type: SpriteFrame})
frames: SpriteFrame[] = [];

// 移动速度
@property
moveSpeed: number = 50;

// 移动范围（相对于初始位置）
@property
moveRange: number = 100;

// 动画帧率
@property
frameRate: number = 8;
```

#### 主要方法
- `playAnimation(dt: number)`: 播放4帧循环动画
- `move(dt: number)`: 在障碍物上方左右移动
- `checkCollision(playerX, playerY, playerRadius)`: 检查与玩家的碰撞
- `setStartPosition(x, y)`: 设置初始位置

### 2. Game.ts 修改

#### 添加敌人相关属性
```typescript
// 敌人预制体
@property({type: Prefab})
enemyPrefab: Prefab | null = null;

// 敌人生成概率（0-1之间）
@property
enemySpawnChance: number = 0.3;

// 所有敌人
private enemies: Enemy[] = [];
```

#### 添加敌人生成方法
```typescript
// 在障碍物上方生成敌人
generateEnemyOnObstacle(obstacle: Obstacle, obstacleY: number) {
    // 随机选择障碍物的左侧或右侧
    // 在障碍物上方生成敌人
    // 设置敌人位置
}
```

#### 修改碰撞检测
```typescript
// 检查每个敌人
for (const enemy of this.enemies) {
    if (!enemy.node.active) continue;
    
    // 检查碰撞
    if (enemy.checkCollision(birdX, birdY, birdRadius)) {
        // 游戏结束
        this.gameOver();
        return;
    }
}
```

#### 修改视角跟随
```typescript
// 移动所有敌人向下
for (const enemy of this.enemies) {
    const currentY = enemy.node.position.y;
    enemy.node.setPosition(new Vec3(enemy.node.position.x, currentY - deltaY, 0));
}
```

#### 修改清理方法
```typescript
// 移除屏幕下方的敌人
for (let i = this.enemies.length - 1; i >= 0; i--) {
    const enemy = this.enemies[i];
    if (enemy.node.position.y < removeY) {
        enemy.node.destroy();
        this.enemies.splice(i, 1);
    }
}
```

## 使用说明

### 1. 创建敌人预制体
1. 在编辑器中创建一个新的空节点
2. 添加 Sprite 组件
3. 添加 Enemy 组件
4. 将 cat1.png, cat2.png, cat3.png, cat4.png 拖拽到 Enemy 组件的 frames 属性
5. 调整 moveSpeed 和 moveRange 属性
6. 保存为预制体

### 2. 配置 Game 组件
1. 将敌人预制体拖拽到 Game 组件的 enemyPrefab 属性
2. 调整 enemySpawnChance 属性（0-1之间，0.3表示30%的概率生成敌人）

## 敌人行为

### 1. 动画播放
- 循环播放4帧动画
- 默认帧率为8帧/秒（每帧停留0.125秒）
- 可以通过 frameRate 属性调整

### 2. 移动逻辑
- 在障碍物上方左右移动
- 移动范围为初始位置左右各100像素
- 碰到边界后反向移动
- 根据移动方向翻转精灵

### 3. 生成逻辑
- 在每个障碍物生成时，有30%的概率生成敌人
- 敌人随机生成在障碍物的左侧或右侧
- 敌人位置在障碍物上方30像素

### 4. 碰撞检测
- 使用圆形碰撞检测
- 碰撞半径为20像素
- 玩家触碰敌人后游戏结束

## 扩展建议

### 1. 添加更多敌人类型
- crab（螃蟹）和 spider（蜘蛛）的动画帧已经准备好
- 可以创建不同的敌人预制体
- 可以调整不同敌人的移动速度和范围

### 2. 添加敌人AI
- 追踪玩家
- 跳跃攻击
- 发射子弹

### 3. 添加敌人掉落物
- 金币
- 道具
- 生命值

## 测试建议
1. 测试敌人动画是否正常播放
2. 测试敌人是否在障碍物上方正确移动
3. 测试玩家触碰敌人是否游戏结束
4. 测试敌人生成概率是否正确
5. 测试敌人是否跟随障碍物一起移动和清理