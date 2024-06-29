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
  private radius = 10;
  private color = createRandomColor();
  private hp = ENEMY_DEFAULT_HP;
  private speed = 20;
  private stopCharge!: () => void;
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
    this.charge();
  }
  charge() {
    this.stopCharge = this.game.registerLoop((deltaTime) => {
      this._point.y += this.speed * (deltaTime / 1000);
      this.create(this._point);
    });
  }
  create(point: Point) {
    const ctx = this.game.ctx;
    // 开始绘制圆
    ctx.beginPath();
    ctx.arc(point.x, point.y, this.radius, 0, 2 * Math.PI);
    // 设置填充颜色并填充
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
