import { _decorator, Component, Node, director, Prefab, instantiate, Vec3, UITransform, Collider2D } from 'cc';
import { Player } from './Player';
import { Obstacle } from './Obstacle';
import { Enemy } from './Enemy';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    // Player 节点，用于获取主角弹跳的高度，和控制主角行动开关
    @property({type: Node})
    player: Node | null = null;

    // 障碍物预制体
    @property({type: Prefab})
    obstaclePrefab: Prefab | null = null;

    // 敌人预制体
    @property({type: Prefab})
    enemyPrefab: Prefab | null = null;

    // 障碍物生成间隔
    @property
    obstacleInterval: number = 300;

    // 最小障碍物间隔
    @property
    minObstacleInterval: number = 250;

    // 最大障碍物间隔
    @property
    maxObstacleInterval: number = 600;

    // 最小缺口宽度
    @property
    minGapWidth: number = 120;

    // 最大缺口宽度
    @property
    maxGapWidth: number = 300;

    // 最小缺口偏移
    @property
    minGapOffset: number = -100;

    // 最大缺口偏移
    @property
    maxGapOffset: number = 500;

    // 敌人生成概率
    @property
    enemySpawnChance: number = 0.3;

    // 障碍物容器节点
    private obstacleContainer: Node | null = null;

    // 所有障碍物
    private obstacles: Obstacle[] = [];

    // 所有敌人
    private enemies: Enemy[] = [];

    // 屏幕高度
    private screenHeight: number = 0;

    // 屏幕中心Y坐标
    private screenCenterY: number = 800;

    // 上一个障碍物的Y坐标
    private lastObstacleY: number = 0;

    // 视角跟随阈值（屏幕中心）
    private cameraFollowThreshold: number = 800;

    // 得分
    private score: number = 0;
    // 玩家Y最大距离
    private startPlayerY: number = 0;
    private maxPlayerY: number = 0;

    onLoad() {
        // 获取屏幕尺寸
        if (this.node) {
            const transform = this.node.getComponent(UITransform);
            if (transform) {
                this.screenHeight = transform.contentSize.height;
                this.screenCenterY = 200;
                this.cameraFollowThreshold = this.screenCenterY;
            } else {
                console.warn('UITransform component not found on Game node');
                // 使用默认值
                this.screenHeight = 960; // 假设屏幕高度为960
                this.screenCenterY = 200;
                this.cameraFollowThreshold = this.screenCenterY;
            }
        }

        // 创建障碍物容器
        this.obstacleContainer = new Node('ObstacleContainer');
        this.node.addChild(this.obstacleContainer);

        // 初始化障碍物 - 从屏幕上方开始生成
        this.lastObstacleY = 200;
        this.generateInitialObstacles();

        // 记录起始高度 + 初始化最大高度
        if (this.player) {
            this.startPlayerY = this.player.position.y;
            this.maxPlayerY = this.startPlayerY;
        }

        // 初始化得分
        this.score = 0;
    }
    
    // 生成初始障碍物
    generateInitialObstacles() {
        // 生成4个初始障碍物，间隔在 minObstacleInterval 和 maxObstacleInterval 之间随机
        const count = 4;
        let currentY = this.lastObstacleY;
        for (let i = 0; i < count; i++) {
            this.generateObstacleAtPosition(currentY);
            // 随机生成下一个障碍物的间隔
            const randomInterval = this.minObstacleInterval + Math.random() * (this.maxObstacleInterval - this.minObstacleInterval);
            currentY += randomInterval;
        }
        // 更新 lastObstacleY 为最后一个障碍物的位置
        this.lastObstacleY = currentY;
    }

    // 生成单个障碍物
    generateObstacle() {
        // 随机生成障碍物间隔
        const randomInterval = this.minObstacleInterval + Math.random() * (this.maxObstacleInterval - this.minObstacleInterval);
        this.generateObstacleAtPosition(this.lastObstacleY + randomInterval);
        this.lastObstacleY += randomInterval;
    }

    // 在指定位置生成障碍物
    generateObstacleAtPosition(y: number) {
        if (!this.obstaclePrefab) {
            console.warn('Obstacle prefab is not set');
            return;
        }

        // 实例化障碍物
        const obstacleNode = instantiate(this.obstaclePrefab);
        this.obstacleContainer!.addChild(obstacleNode);

        // 获取障碍物组件
        const obstacle = obstacleNode.getComponent(Obstacle);
        if (!obstacle) {
            console.warn('Obstacle component not found');
            return;
        }

        // 设置随机缺口宽度
        const gapWidth = this.minGapWidth + Math.random() * (this.maxGapWidth - this.minGapWidth);
        obstacle.gapWidth = gapWidth;

        // 设置随机缺口偏移
        const gapOffset = this.minGapOffset + Math.random() * (this.maxGapOffset - this.minGapOffset);
        obstacle.gapOffset = gapOffset;

        // 设置障碍物位置
        obstacle.setGapPosition(y);

        // 添加到障碍物列表
        this.obstacles.push(obstacle);

        // 随机生成敌人
        if (this.enemyPrefab && Math.random() < this.enemySpawnChance) {
            this.generateEnemyOnObstacle(obstacle, y);
        }
    }

    // 在障碍物上方生成敌人
    generateEnemyOnObstacle(obstacle: Obstacle, obstacleY: number) {
        if (!this.enemyPrefab) return;

        // 实例化敌人
        const enemyNode = instantiate(this.enemyPrefab);
        this.obstacleContainer!.addChild(enemyNode);

        // 获取敌人组件
        const enemy = enemyNode.getComponent(Enemy);
        if (!enemy) {
            console.warn('Enemy component not found');
            return;
        }

        // 随机选择障碍物的左侧或右侧
        const side = Math.random() > 0.5 ? 'left' : 'right';
        let enemyX = 0;

        if (side === 'left' && obstacle.leftObstacle) {
            // 在左侧障碍物上生成
            const leftTransform = obstacle.leftObstacle.getComponent(UITransform);
            if (leftTransform) {
                const leftWidth = leftTransform.contentSize.width;
                const leftX = obstacle.leftObstacle.position.x;
                // 敌人在左侧障碍物的中心位置
                enemyX = leftX;
            }
        } else if (side === 'right' && obstacle.rightObstacle) {
            // 在右侧障碍物上生成
            const rightTransform = obstacle.rightObstacle.getComponent(UITransform);
            if (rightTransform) {
                const rightWidth = rightTransform.contentSize.width;
                const rightX = obstacle.rightObstacle.position.x;
                // 敌人在右侧障碍物的中心位置
                enemyX = rightX;
            }
        } else {
            // 如果没有合适的障碍物，不生成敌人
            enemyNode.destroy();
            return;
        }

        // 设置敌人位置（在障碍物顶部）
        const obstacleHeight = 30; // 障碍物高度
        const enemyY = obstacleY + obstacleHeight / 2 + 10; // 障碍物顶部 + 一点间距
        enemy.setStartPosition(enemyX, enemyY);

        // 添加到敌人列表
        this.enemies.push(enemy);
    }

    
    // 视角跟随
    updateCameraFollow() {
        if (!this.player) return;

        const birdY = this.player.position.y;

        // 如果小鸟超过屏幕中心，移动障碍物向下
        if (birdY > this.cameraFollowThreshold) {
            const deltaY = birdY - this.cameraFollowThreshold;
            
            // 移动所有障碍物向下
            for (const obstacle of this.obstacles) {
                const currentY = obstacle.node.position.y;
                obstacle.node.setPosition(new Vec3(obstacle.node.position.x, currentY - deltaY, 0));
            }

            // 移动所有敌人向下
            for (const enemy of this.enemies) {
                const currentY = enemy.node.position.y;
                enemy.node.setPosition(new Vec3(enemy.node.position.x, currentY - deltaY, 0));
            }

            // 保持小鸟在屏幕中心
            this.player.setPosition(new Vec3(this.player.position.x, this.cameraFollowThreshold, 0));

            // 清理屏幕下方的障碍物和敌人
            this.cleanupObstacles();

            // 检查是否需要生成新的障碍物
            // 只有当最高障碍物距离屏幕顶部不足一个间隔时才生成新障碍物
            if (this.obstacles.length > 0) {
                const topObstacle = this.obstacles[this.obstacles.length - 1];
                const topObstacleY = topObstacle.node.position.y;
                const screenTop = this.screenHeight / 2;
                
                if (topObstacleY < screenTop + this.obstacleInterval) {
                    this.generateObstacleAtPosition(topObstacleY + this.obstacleInterval);
                }
            }
        }
    }

    // 清理屏幕下方的障碍物和敌人
    cleanupObstacles() {
        const removeY = -this.screenHeight / 2 - 100; // 屏幕下方100像素

        // 移除屏幕下方的障碍物
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            if (obstacle.node.position.y < removeY) {
                obstacle.node.destroy();
                this.obstacles.splice(i, 1);
            }
        }

        // 移除屏幕下方的敌人
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (enemy.node.position.y < removeY) {
                enemy.node.destroy();
                this.enemies.splice(i, 1);
            }
        }
    }

    // 游戏结束
    gameOver() {
        console.log('[游戏结束] 最终分数:', this.score);
        this.score = 0; // 重置分数
        // 可以在这里添加游戏结束逻辑，如显示游戏结束界面
       
    }

    update(dt: number) {
        if (!this.player) return;

        // 更新 Player 的障碍物列表（可以留空，不再依赖gap逻辑）
        const playerComp = this.player.getComponent(Player);
        if (playerComp) {
            playerComp.setObstacles(this.obstacles);
        }

        // 根据玩家达到的最高 Y 更新分数（子弹高度增量得分）
        const playerY = this.player.position.y;
        if (playerY > this.maxPlayerY+300) {
            this.maxPlayerY = playerY;
            this.score = Math.max(0, Math.floor(this.maxPlayerY - this.startPlayerY));
        }

        

        // 更新视角跟随
        this.updateCameraFollow();
    }
}