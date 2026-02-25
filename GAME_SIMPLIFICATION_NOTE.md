# 游戏逻辑精简说明

## 修改内容
已将 Game.ts 文件精简，移除了所有与星星和得分相关的功能：

### 移除的功能：
- 星星预制资源 (starPrefab)
- 星星生成和销毁逻辑 (spawnNewStar, destroyAllStars)
- 星星位置计算逻辑 (getNewStarPosition)
- 计时器相关逻辑 (timer, starDuration)
- 得分系统 (score, scoreDisplay, scoreAudio, gainScore)
- 地面节点 (ground)
- 游戏结束逻辑 (gameOver)

### 保留的功能：
- Player 节点引用
- 基础的游戏框架 (onLoad, update 方法)

### 当前状态：
- 游戏现在只包含 Player 节点的引用
- 保留了基本的生命周期方法
- 可以继续专注于跳跃机制的开发

Player.ts 文件保持不变，仍包含完整的跳跃和动画逻辑。