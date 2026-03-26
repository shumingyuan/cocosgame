import { _decorator, Component, Node, Prefab, instantiate, Vec3, UITransform, view, Collider2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Obstacle')
export class Obstacle extends Component {
    // 左侧树枝预制体
    @property({type: Prefab})
    leftTreePrefab: Prefab | null = null;

    // 右侧树枝预制体
    @property({type: Prefab})
    rightTreePrefab: Prefab | null = null;

    // 缺口宽度
    @property
    gapWidth: number = 150;

    // 缺口偏移（-100表示缺口偏左，100表示缺口偏右）
    @property
    gapOffset: number = 0;

    // 缺口中心位置（相对于屏幕中心的Y坐标）
    private gapCenterY: number = 0;

    // 左侧障碍物节点
    private leftObstacle: Node | null = null;

    // 右侧障碍物节点
    private rightObstacle: Node | null = null;

    // 屏幕宽度
    private screenWidth: number = 0;

    // 是否已被通过
    public passed: boolean = false;

    onLoad() {
        // 获取屏幕宽度 - 使用 view.getVisibleSize() 获取可见区域尺寸
        const visibleSize = view.getVisibleSize();
        this.screenWidth = visibleSize.width;

        // 创建左右障碍物
        this.createObstacles();
    }

    // 创建障碍物
    createObstacles() {
        // 随机决定障碍物的生成方式
        // 0: 只在左侧
        // 1: 只在右侧
        // 2: 两侧都有
        const obstacleType = Math.floor(Math.random() * 3);

        if (obstacleType === 0 || obstacleType === 2) {
            // 创建左侧障碍物
            this.leftObstacle = this.createSingleObstacle('left');
            if (this.leftObstacle) {
                this.node.addChild(this.leftObstacle);
            }
        }

        if (obstacleType === 1 || obstacleType === 2) {
            // 创建右侧障碍物
            this.rightObstacle = this.createSingleObstacle('right');
            if (this.rightObstacle) {
                this.node.addChild(this.rightObstacle);
            }
        }
    }

    // 创建单个障碍物
    private createSingleObstacle(side: string): Node | null {
        const prefab = side === 'left' ? this.leftTreePrefab : this.rightTreePrefab;
        
        if (!prefab) {
            console.warn(side + ' tree prefab is not set');
            return null;
        }

        // 实例化预制体
        const obstacle = instantiate(prefab);
        
        // 获取UITransform组件
        const transform = obstacle.getComponent(UITransform);
        if (!transform) {
            console.warn('UITransform component not found on tree prefab');
            return obstacle;
        }

        // 获取障碍物宽度（树枝长度）
        const obstacleWidth = transform.contentSize.width;
        
        // 计算缺口的左右边界
        // gapOffset 是缺口中心相对于屏幕中心的偏移
        // gapLeft = gapOffset - gapWidth/2
        // gapRight = gapOffset + gapWidth/2
        const gapLeft = this.gapOffset - this.gapWidth / 2;
        const gapRight = this.gapOffset + this.gapWidth / 2;
        
        // 设置位置
        if (side === 'left') {
            // 左侧树枝：右边缘在 gapLeft 位置
            // 树枝宽度500，所以左边缘 = gapLeft - 500
            const xPos = gapLeft - obstacleWidth / 2;
            obstacle.setPosition(new Vec3(xPos, 0, 0));
        } else {
            // 右侧树枝：左边缘在 gapRight 位置
            // 树枝宽度500，所以右边缘 = gapRight + 500
            const xPos = gapRight + obstacleWidth / 2;
            obstacle.setPosition(new Vec3(xPos, 0, 0));
        }
        
        return obstacle;
    }

    // 设置缺口位置
    setGapPosition(gapCenterY: number) {
        this.gapCenterY = gapCenterY;
        this.node.setPosition(new Vec3(Math.random() * this.screenWidth - this.screenWidth / 2, gapCenterY, 0));
    }

    // 获取缺口中心Y坐标
    getGapCenterY(): number {
        return this.gapCenterY;
    }

    // 获取缺口宽度
    getGapWidth(): number {
        return this.gapWidth;
    }

    // 检查小鸟是否通过缺口
    checkPassThrough(birdX: number, birdY: number, birdRadius: number): boolean {
        // 计算缺口的左右边界
        const gapLeft = this.gapOffset - this.gapWidth / 2;
        const gapRight = this.gapOffset + this.gapWidth / 2;
        
        // 检查小鸟是否在缺口水平范围内
        if (birdX > gapLeft + birdRadius && birdX < gapRight - birdRadius) {
            // 检查小鸟是否在障碍物的Y坐标附近
            const obstacleY = this.node.position.y;
            if (Math.abs(birdY - obstacleY) < birdRadius * 2) {
                return true;
            }
        }
        
        return false;
    }

    // 检查与玩家碰撞（使用距离检测）
    checkCollision(playerNode: Node): boolean {
        const playerPos = playerNode.position;
        const collisionRadius = 40; // 碰撞半径

        const checkTreeCollision = (treeNode: Node | null, side: string): boolean => {
            if (!treeNode) return false;
            const treePos = treeNode.position;
            const dx = playerPos.x - treePos.x;
            const dy = playerPos.y - treePos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const collided = distance < collisionRadius;
            if (collided) {
                console.log('[树枝碰撞检测]', side, '- 距离:', distance.toFixed(2), '玩家:', playerPos.x.toFixed(2), playerPos.y.toFixed(2), '树枝:', treePos.x.toFixed(2), treePos.y.toFixed(2));
            }
            return collided;
        };

        // 检查左右树枝
        if (checkTreeCollision(this.leftObstacle, '左侧')) return true;
        if (checkTreeCollision(this.rightObstacle, '右侧')) return true;

        return false;
    }

    update(dt: number) {
        // 可以在这里添加障碍物的动画效果
    }
}
