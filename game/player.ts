import { Bullet } from "./bullet";
import { EnemyManager } from "./enemy/manager";
import { Game } from "./game";
import { createRandomColor } from "./tools";
import { PLAYER_AREA_HEIGHT } from "./tools/constants";
import { setInterval, clearInterval } from "@/game/tools/browser";
import { Point } from "./types";

export class Player {
  private _point: Point;
  get point() {
    return this._point;
  }
  private game: Game;
  private radius = 20;
  private enemyManager!: EnemyManager;
  private interval: number | null = null;
  private color = createRandomColor();
  constructor(game: Game) {
    this.game = game;
    this._point = {
      x: this.game.room.width / 2,
      y: this.game.room.height - PLAYER_AREA_HEIGHT / 2,
    };
    this.enemyManager = this.game.enemyManager;
  }
  create() {
    const ctx = this.game.ctx;
    ctx.beginPath();
    ctx.arc(this._point.x, this._point.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  play() {
    this.game.registerLoop((deltaTime) => {
      this.create();
    });
  }
  start() {
    this.play();
    this.attack();
  }
  attack() {
    this.interval = setInterval(() => {
      const headEnemy = this.enemyManager.getHead();
      if (headEnemy) {
        // 发射子弹攻击敌人
        new Bullet(this, headEnemy, this.game);
      }
    }, 1000);
  }
  stopAttack() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
