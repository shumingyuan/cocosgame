# 星星无限生成问题修复说明

## 问题原因
在 Game.ts 的 update 方法中，当星星超时条件满足时，错误地调用了 gameOver() 方法，
而 gameOver() 方法又被修改为调用 spawnNewStar()，导致了星星的无限生成循环。

## 修复方案
1. 在 update 方法中，当星星超时时，直接调用 spawnNewStar() 而不是 gameOver()
2. 恢复 gameOver() 方法的原始功能，即重新加载场景
3. 保持星星被收集时（onPicked）也会调用 spawnNewStar() 的逻辑

## 当前逻辑
- 星星超时：生成新星星继续游戏
- 星星被收集：生成新星星并加分
- 游戏结束：重新加载场景

这样避免了无限生成循环的问题。