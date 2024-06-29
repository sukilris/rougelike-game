import { Enemy } from "./enemy/enemy";
import { Game } from "./game";
import { Player } from "./player";
import { createRandomColor, isCollide } from "./tools";
import { Point } from "./types";

export class Bullet {
  private _point: Point;
  get point() {
    return this._point;
  }
  private _radius = 5;
  get radius() {
    return this._radius;
  }
  // 攻击力
  private _attack = 5;
  get attack() {
    return this._attack;
  }
  private color = createRandomColor();
  private speed = 160;
  private game: Game;
  private player: Player;
  private enemy: Enemy;
  private targetPoint!: Point;
  private deltaX = 0;
  private deltaY = 0;
  private stopShooting!: () => void;
  constructor(player: Player, enemy: Enemy, game: Game) {
    this.game = game;
    this.player = player;
    this.enemy = enemy;
    this.targetPoint = {
      x: enemy.point.x,
      y: enemy.point.y,
    };
    this._point = {
      x: player.point.x,
      y: player.point.y,
    };
    this.deltaX = (this.targetPoint.x - this._point.x) / this.speed;
    this.deltaY = (this.targetPoint.y - this._point.y) / this.speed;
    this.shooting();
  }
  shooting() {
    this.stopShooting = this.game.registerLoop((deltaTime) => {
      this._point.x += this.deltaX;
      this._point.y += this.deltaY;
      if (this._point.y <= 0 || this._point.x <= 0) {
        this.destory();
      } else if (isCollide(this, this.enemy)) {
        this.destory();
        this.enemy.beAttack(this._attack);
      } else {
        this.create(this._point);
      }
    });
  }
  destory() {
    console.log("destory");
    this.stopShooting();
  }
  create(point: Point) {
    const ctx = this.game.ctx;
    // 开始绘制圆
    ctx.beginPath();
    ctx.arc(point.x, point.y, this._radius, 0, 2 * Math.PI);
    // 设置填充颜色并填充
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
