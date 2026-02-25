# 障碍物显示问题修复说明

## 问题描述
障碍物在正确的位置生成（从log可以看出），但是在编辑器预览中看不到障碍物。

## 问题原因
在创建 Sprite 组件时，只设置了颜色，但没有设置 SpriteFrame。在 Cocos Creator 中，Sprite 组件需要一个 SpriteFrame 才能显示内容。

## 修复内容

### 1. 导入必要的类
```typescript
import { SpriteFrame, Texture2D } from 'cc';
```

### 2. 创建 SpriteFrame
为 Sprite 组件创建一个简单的白色纹理：

```typescript
// 创建一个简单的白色纹理
const texture = new Texture2D();
texture.reset({
    width: 1,
    height: 1,
    format: Texture2D.PixelFormat.RGBA8888,
});

// 填充白色像素
const data = new Uint8Array([255, 255, 255, 255]);
texture.uploadData(data);

// 创建 SpriteFrame
const spriteFrame = new SpriteFrame();
spriteFrame.texture = texture;

// 设置 Sprite 的 SpriteFrame
sprite.spriteFrame = spriteFrame;

// 设置颜色为棕色，像树枝
sprite.color = new Color(139, 69, 19, 255);
```

## 工作原理
1. 创建一个 1x1 的白色纹理
2. 使用这个纹理创建 SpriteFrame
3. 将 SpriteFrame 设置给 Sprite 组件
4. 通过 Sprite 的 color 属性将白色纹理染成棕色

## 优势
- 不需要额外的图片资源
- 障碍物可以显示为纯色
- 可以通过修改 color 属性来改变障碍物的颜色
- 性能好，因为使用的是简单的 1x1 纹理

## 测试建议
1. 运行游戏，检查障碍物是否正确显示
2. 检查障碍物的颜色是否为棕色
3. 测试障碍物的位置和尺寸是否正确
4. 测试碰撞检测是否正常工作

## 替代方案
如果想要更复杂的障碍物外观，可以：
1. 在编辑器中创建一个 SpriteFrame 资源
2. 在 Obstacle 组件中添加一个 @property 属性来引用这个 SpriteFrame
3. 在创建障碍物时使用这个 SpriteFrame