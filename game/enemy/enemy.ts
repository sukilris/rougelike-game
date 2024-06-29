import { Game } from "../game";
import { createRandomColor } from "../tools";
import { ENEMY_AREA_HEIGHT, ENEMY_DEFAULT_HP } from "../tools/constants";
import { Point } from "../types";

export class Enemy {
  private _point: Point;
  get point() {
    return this._point;
  }
  private game: Game;
  private _radius = 10;
  get radius() {
    return this._radius;
  }
  private color = createRandomColor();
  private _hp = ENEMY_DEFAULT_HP;
  get hp() {
    return this._hp;
  }
  private speed = 20;
  private stopForward!: () => void;
  private get room() {
    return this.game.room;
  }
  constructor(game: Game) {
    this.game = game;
    this._point = {
      x: Math.floor(Math.random() * this.room.width),
      y: Math.floor(Math.random() * ENEMY_AREA_HEIGHT),
    };
    this.init();
  }
  init() {
    this.create(this._point);
    this.forward();
  }
  forward() {
    this.stopForward = this.game.registerLoop((deltaTime) => {
      this._point.y += this.speed * (deltaTime / 1000);
      this.create(this._point);
    });
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
  // 受到攻击扣除生命值
  beAttack(attack: number) {
    this._hp -= attack;
    if (this._hp <= 0) {
      this.destory();
    }
  }
  destory() {
    this.stopForward();
    this.game.enemyManager.removeEnemy(this);
  }
}
