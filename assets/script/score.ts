import { _decorator, Component, Node, Label } from 'cc';
import { Game } from './game';
const { ccclass, property } = _decorator;

@ccclass('score')
export class score extends Component {
    @property({ type: Label })
    scoreLabel: Label | null = null;

    private gameComponent: Game | null = null;
    private lastScore: number = -1;

    start() {
        // 获取 Game 脚本组件
        const gameNode = this.node.parent;
        if (gameNode) {
            this.gameComponent = gameNode.getComponent(Game);
        }
    }

    update(deltaTime: number) {
        if (!this.gameComponent || !this.scoreLabel) return;

        // 获取当前分数
        const currentScore = (this.gameComponent as any).score;

        // 只在分数变化时更新显示，提高性能
        if (currentScore !== this.lastScore) {
            this.scoreLabel.string = `Score: ${currentScore}`;
            this.lastScore = currentScore;
        }
    }
}


