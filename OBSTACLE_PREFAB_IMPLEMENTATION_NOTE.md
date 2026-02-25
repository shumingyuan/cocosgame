# 使用预制体实现障碍物说明

## 修改概述
将障碍物的实现方式从动态创建UI组件改为使用预制体实例化。

## 主要修改

### 1. 添加预制体属性
```typescript
// 左侧树枝预制体
@property({type: Prefab})
leftTreePrefab: Prefab | null = null;

// 右侧树枝预制体
@property({type: Prefab})
rightTreePrefab: Prefab | null = null;
```

### 2. 随机生成障碍物
```typescript
// 随机决定障碍物的生成方式
// 0: 只在左侧
// 1: 只在右侧
// 2: 两侧都有
const obstacleType = Math.floor(Math.random() * 3);
```

### 3. 实例化预制体
```typescript
// 实例化预制体
const obstacle = instantiate(prefab);

// 获取UITransform组件
const transform = obstacle.getComponent(UITransform);

// 获取障碍物宽度
const obstacleWidth = transform.contentSize.width;

// 设置位置
if (side === 'left') {
    const xPos = -this.screenWidth / 2 + obstacleWidth / 2;
    obstacle.setPosition(new Vec3(xPos, 0, 0));
} else {
    const xPos = this.screenWidth / 2 - obstacleWidth / 2;
    obstacle.setPosition(new Vec3(xPos, 0, 0));
}
```

### 4. 改进碰撞检测
使用实际的障碍物尺寸进行碰撞检测：
```typescript
// 检查左侧障碍物
if (this.leftObstacle) {
    const leftTransform = this.leftObstacle.getComponent(UITransform);
    if (leftTransform) {
        const leftWidth = leftTransform.contentSize.width;
        const leftX = this.leftObstacle.position.x;
        if (birdX < leftX + leftWidth / 2 + birdRadius) {
            return true;
        }
    }
}
```

## 使用说明

### 1. 创建预制体
- 在编辑器中创建两个预制体：
  - 左侧树枝（leftTree）：从屏幕左边缘向右延伸
  - 右侧树枝（rightTree）：从屏幕右边缘向左延伸

### 2. 配置Obstacle组件
- 将左侧树枝预制体拖拽到 `leftTreePrefab` 属性
- 将右侧树枝预制体拖拽到 `rightTreePrefab` 属性

### 3. 配置障碍物预制体
- 创建一个空节点作为障碍物预制体
- 添加 Obstacle 组件
- 配置预制体属性

## 优势
1. **可视化编辑**：可以在编辑器中直观地设计障碍物外观
2. **灵活性**：可以使用复杂的纹理和动画
3. **性能**：避免动态创建纹理的性能开销
4. **易于维护**：修改预制体即可更新所有障碍物外观

## 障碍物生成逻辑
- 随机生成三种类型的障碍物：
  - 只在左侧（33%概率）
  - 只在右侧（33%概率）
  - 两侧都有（33%概率）
- 确保游戏有足够的挑战性和多样性