# Cocos Creator 项目迁移指南 (V2.4.0 → V3.8.8)

## 迁移概述

本项目已从 Cocos Creator V2.4.0 成功迁移到 V3.8.8。以下是主要变更：

### 1. 代码迁移
- 将所有 JavaScript 文件 (.js) 转换为 TypeScript 文件 (.ts)
- 更新了所有 API 调用以符合 V3.8.8 规范

### 2. 主要变更点

#### Player.ts
- 将 `cc.Class` 结构转换为 TypeScript 装饰器模式
- 更新事件监听系统：`cc.systemEvent` → `input` 系统
- 更新音频播放：`cc.audioEngine` → `AudioSource` 组件
- 更新动作系统：`cc.tween` 适配 V3.x 语法

#### Game.ts
- 将 `cc.Class` 结构转换为 TypeScript 装饰器模式
- 更新节点位置获取：`getPosition()` → `position` 属性
- 更新向量操作：`cc.v2` → `Vec3` (V3.x 中统一使用 Vec3)

#### Star.ts
- 将 `cc.Class` 结构转换为 TypeScript 装饰器模式
- 更新节点位置计算：`getPosition()` → `position` 属性
- 更新距离计算：`sub().mag()` → `Vec3.subtract().length()`

### 3. 需要注意的事项

1. **音频组件**：需要在场景节点上添加 `AudioSource` 组件
2. **输入系统**：使用新的 `input` 系统替代 `cc.systemEvent`
3. **坐标系统**：V3.x 使用统一的 Vec3 坐标系统
4. **生命周期函数**：`onLoad` → `start`（在某些情况下）

### 4. 编辑器操作建议

在 Cocos Creator 3.8.8 编辑器中：

1. 打开项目后，可能会提示升级资源，确认升级
2. 检查场景中的节点，重新分配 TypeScript 脚本组件
3. 对于音频播放功能，在 Player 和 Game 节点上添加 AudioSource 组件
4. 更新脚本引用以指向新的 .ts 文件

### 5. 测试说明

迁移完成后，需要测试：
- 游戏基本功能是否正常运行
- 玩家控制是否响应
- 星星收集机制是否正常
- 音频播放是否正常
- 场景切换是否正常