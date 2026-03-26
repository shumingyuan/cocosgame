import { _decorator, Component, Node, Sprite, SpriteFrame, Vec3, UITransform, Collider2D } from 'cc';
import { Player } from './Player';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
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

    private sprite: Sprite | null = null;
    private frameIndex: number = 0;
    private animationTimer: number = 0;
    private readonly frameInterval: number = 0.125; // 每帧停留时间

    // 移动相关
    private startX: number = 0;
    private moveDirection: number = 1; // 1: 向右, -1: 向左
    private currentOffset: number = 0;

    // 碰撞相关
    private enemyRadius: number = 20;

    onLoad() {
        // 获取精灵组件
        this.sprite = this.node.getComponent(Sprite);
        
        // 初始化动画
        this.frameIndex = 0;
        this.animationTimer = 0;
        
        // 计算帧间隔
        if (this.frameRate > 0) {
            this.frameInterval = 1 / this.frameRate;
        }
        
        // 记录初始X位置
        this.startX = this.node.position.x;
        
        // 随机初始移动方向
        this.moveDirection = Math.random() > 0.5 ? 1 : -1;
    }

    update(dt: number) {
        // 播放动画
        this.playAnimation(dt);
        
        // 移动
        this.move(dt);
    }

    // 播放动画
    private playAnimation(dt: number) {
        if (this.frames.length === 0 || !this.sprite) return;

        this.animationTimer += dt;
        if (this.animationTimer >= this.frameInterval) {
            // 更新精灵帧
            if (this.frames[this.frameIndex]) {
                this.sprite.spriteFrame = this.frames[this.frameIndex];
            }
            
            // 切换到下一帧
            this.frameIndex++;
            if (this.frameIndex >= this.frames.length) {
                this.frameIndex = 0; // 循环播放
            }
            
            this.animationTimer = 0;
        }
    }

    // 移动
    private move(dt: number) {
        // 更新当前偏移
        this.currentOffset += this.moveDirection * this.moveSpeed * dt;
        
        // 检查是否超出移动范围
        if (this.currentOffset > this.moveRange) {
            this.currentOffset = this.moveRange;
            this.moveDirection = -1; // 反向移动
        } else if (this.currentOffset < -this.moveRange) {
            this.currentOffset = -this.moveRange;
            this.moveDirection = 1; // 反向移动
        }
        
        // 更新位置
        const newX = this.startX + this.currentOffset;
        this.node.setPosition(new Vec3(newX, this.node.position.y, 0));
        
        // 根据移动方向翻转精灵
        if (this.sprite) {
            this.node.setScale(new Vec3(this.moveDirection, 1, 1));
        }
    }

    // 检查与玩家的碰撞（使用距离检测）
    checkCollision(playerNode: Node): boolean {
        const playerPos = playerNode.position;
        const enemyPos = this.node.position;

        // 计算距离
        const dx = playerPos.x - enemyPos.x;
        const dy = playerPos.y - enemyPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const collisionRadius = 40; // 碰撞半径（玩家 + 敌人）
        const collided = distance < collisionRadius;

        if (collided) {
            console.log('[敌人碰撞检测] 距离:', distance.toFixed(2), '阈值:', collisionRadius, '玩家:', playerPos.x.toFixed(2), playerPos.y.toFixed(2), '敌人:', enemyPos.x.toFixed(2), enemyPos.y.toFixed(2));
        }

        return collided;
    }

    // 设置初始位置
    setStartPosition(x: number, y: number) {
        this.node.setPosition(new Vec3(x, y, 0));
        this.startX = x;
    }
}
