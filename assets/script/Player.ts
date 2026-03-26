import { _decorator, Component, Node, Sprite, SpriteFrame, AudioClip, AudioSource, Vec2, Vec3, tween, Tween, systemEvent, SystemEvent, EventTouch, input, Input, UITransform } from 'cc';
import { Obstacle } from './Obstacle';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    // 主角跳跃高度
    @property
    jumpHeight: number = 90;

    // 主角跳跃持续时间
    @property
    jumpDuration: number = 0.1;

    @property({type: AudioClip})
    jumpAudio: AudioClip | null = null;

    // 飞行动画精灵帧
    @property({type: SpriteFrame})
    birdFlySprites: SpriteFrame[] = [];

    private sprite: Sprite | null = null;
    private frameIndex = 0;
    private animationTimer = 0;
    private readonly frameInterval = 0.1; // 每帧停留0.1秒
    private isPlayingAnimation: boolean = false; // 是否正在播放动画
    
    // 速度相关
    velocityX: number = 0; // 水平速度
    velocityY: number = 0; // 垂直速度
    private gravity: number = -800; // 重力加速度
    private groundY: number = -800; // 地面高度
    
    // 边界相关
    private minX: number = 0; // 最小X坐标
    private maxX: number = 0; // 最大X坐标
    private maxY: number = 0; // 最大Y坐标
    
    // 朝向相关
    private facingRight: boolean = true; // 当前是否朝向右边
    
    // 障碍物列表引用
    private obstacles: Obstacle[] = [];

    onLoad() {
        // 获取精灵组件
        this.sprite = this.node.getComponent(Sprite);
        
        // 初始化触摸输入监听
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        
        // 初始化动画
        this.frameIndex = 0;
        this.isPlayingAnimation = false;
        
        // 初始化速度
        this.velocityX = 0;
        this.velocityY = 0;
        
        // 初始化边界
        if (this.node.parent) {
            const parentTransform = this.node.parent.getComponent(UITransform);
            if (parentTransform) {
                const parentSize = parentTransform.contentSize;
                this.minX = -parentSize.width / 2 + 50; // 左边界，留出50像素边距
                this.maxX = parentSize.width / 2 - 50; // 右边界，留出50像素边距
                this.maxY = parentSize.height / 2 - 50; // 上边界，留出50像素边距
            }
        }
        
        // 初始化朝向
        this.facingRight = true;
    }

    onTouchStart(event: EventTouch) {
        // 获取触摸点位置
        const touchLoc = event.getLocation();
        const canvasSize = this.node.parent!.getComponent(UITransform)!.contentSize;
        const touchX = touchLoc.x;
        
        // 获取画布中心点
        const centerX = canvasSize.width / 2;
        
        // 根据触摸位置判断是左边还是右边
        if (touchX < centerX) {
            // 触摸左边，向左飞
            this.moveToLeft();
        } else {
            // 触摸右边，向右飞
            this.moveToRight();
        }
    }

    // 向左飞
    moveToLeft() {
        // 播放飞行动画
        this.playFlyAnimation();
        
        // 播放音效
        this.playJumpSound();
        
        // 设置速度 - 向左上方
        this.velocityX = -this.jumpHeight * 2; // 水平速度向左
        this.velocityY = this.jumpHeight * 3; // 垂直速度向上
        
        // 更新朝向 - 如果当前朝向右边，则翻转向左
        if (this.facingRight) {
            this.facingRight = false;
            this.node.setScale(new Vec3(-1, 1, 1)); // 水平翻转
        }
    }
    
    // 向右飞
    moveToRight() {
        // 播放飞行动画
        this.playFlyAnimation();
        
        // 播放音效
        this.playJumpSound();
        
        // 设置速度 - 向右上方
        this.velocityX = this.jumpHeight * 2; // 水平速度向右
        this.velocityY = this.jumpHeight * 3; // 垂直速度向上
        
        // 更新朝向 - 如果当前朝向左边，则翻转向右
        if (!this.facingRight) {
            this.facingRight = true;
            this.node.setScale(new Vec3(1, 1, 1)); // 恢复正常朝向
        }
    }

    playJumpSound() {
        // 使用 AudioSource 组件播放音频
        // 首先尝试获取节点上的 AudioSource 组件
        let audioSource = this.node.getComponent(AudioSource);
        if (!audioSource) {
            // 如果没有 AudioSource 组件，则添加一个
            audioSource = this.node.addComponent(AudioSource);
        }
        if (audioSource && this.jumpAudio) {
            audioSource.clip = this.jumpAudio;
            audioSource.play();
        }
    }

    // 播放飞行动画
    playFlyAnimation() {
        if (this.birdFlySprites.length >= 3 && this.sprite) {
            this.frameIndex = 0;
            this.animationTimer = 0;
            this.isPlayingAnimation = true; // 开始播放动画
        }
    }
    
    // 停止飞行动画
    stopFlyAnimation() {
        this.isPlayingAnimation = false; // 停止播放动画
        // 重置到第一帧
        if (this.birdFlySprites.length > 0 && this.sprite) {
            this.sprite.spriteFrame = this.birdFlySprites[0];
        }
    }

    // 设置障碍物列表
    setObstacles(obstacles: Obstacle[]) {
        this.obstacles = obstacles;
    }

    update(dt: number) {
        // 处理飞行动画 - 只在播放动画时更新
        if (this.isPlayingAnimation && this.birdFlySprites.length >= 3 && this.sprite) {
            this.animationTimer += dt;
            if (this.animationTimer >= this.frameInterval) {
                if (this.birdFlySprites[this.frameIndex]) {
                    this.sprite.spriteFrame = this.birdFlySprites[this.frameIndex];
                    this.frameIndex++;
                    if (this.frameIndex >= 3) {
                        this.frameIndex = 0; // 循环播放
                    }
                }
                this.animationTimer = 0;
            }
        }
        
        // 应用重力
        this.velocityY += this.gravity * dt;
        
        // 更新位置
        let newX = this.node.position.x + this.velocityX * dt;
        let newY = this.node.position.y + this.velocityY * dt;
        
        // 边界检测 - 防止飞出屏幕
        if (newX < this.minX) {
            newX = this.minX;
            this.velocityX = 0; // 碰到边界后停止水平移动
        } else if (newX > this.maxX) {
            newX = this.maxX;
            this.velocityX = 0; // 碰到边界后停止水平移动
        }
        
        if (newY > this.maxY) {
            newY = this.maxY;
            this.velocityY = 0; // 碰到上边界后停止垂直移动
        }
        
        // 检查是否碰到地面
        if (newY <= this.groundY) {
            newY = this.groundY;
            this.velocityY = 0;
            this.velocityX = 0; // 碰到地面后停止水平移动
        }
        
        // 设置新位置
        this.node.setPosition(new Vec3(newX, newY, 0));
        
        // 检查是否停止运动 - 如果速度接近0，停止动画
        const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
        if (speed < 10 && this.isPlayingAnimation) {
            this.stopFlyAnimation();
        }
    }
    
    onDestroy() {
        // 取消触摸输入监听
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }
}