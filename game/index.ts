import { createRandomColor } from "@/tools";
import {
  setInterval,
  clearInterval,
  requestAnimationFrame,
  cancelAnimationFrame,
} from "@/tools/browser";
import {
  ENEMY_AREA_HEIGHT,
  ENEMY_DEFAULT_HP,
  MAX_ENEMY_COUNT,
  PLAYER_AREA_HEIGHT,
} from "@/tools/constants";

interface Point {
  x: number;
  y: number;
}

class Room {
  private _width: number;
  get width() {
    return this._width;
  }
  private _height: number;
  get height() {
    return this._height;
  }
  private ctx: CanvasRenderingContext2D;
  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const rect = canvas.getBoundingClientRect();
    this._width = canvas.width = rect.width;
    this._height = canvas.height = rect.height;
    this.ctx = ctx;
    this.init();
  }
  init() {
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, ENEMY_AREA_HEIGHT);
    this.ctx.lineTo(this._width, ENEMY_AREA_HEIGHT);
    this.ctx.moveTo(0, this._height - PLAYER_AREA_HEIGHT);
    this.ctx.lineTo(this._width, this._height - PLAYER_AREA_HEIGHT);
    this.ctx.stroke();
    this.ctx.closePath();
  }
}
class Enemy {
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
    this.stopCharge = loop((deltaTime) => {
      this.ctx.clearRect(
        Math.floor(this._point.x - this.radius),
        Math.floor(this._point.y - this.radius),
        this.radius * 2 + 1,
        this.radius * 2 + 1
      );
      this._point.y += this.speed * (deltaTime / 1000);
      this.create(this._point);
    });
  }
  create(point: Point) {
    // 开始绘制圆
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, this.radius, 0, 2 * Math.PI);
    // 设置填充颜色并填充
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }
}
class EnemyManager {
  private max = MAX_ENEMY_COUNT;
  private count = 0;
  private _enemyies: Enemy[] = [];
  get enemyies() {
    return this._enemyies;
  }
  private ctx: CanvasRenderingContext2D;
  private room: Room;
  private interval: number | null = null;
  constructor(room: Room, ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.room = room;
    this.init();
  }
  init() {
    this.intervalCreateEnemy();
  }
  intervalCreateEnemy() {
    this.interval = setInterval(() => {
      if (this.checkCount()) {
        return this.stopCreateEnemy();
      }
      this.createEnemy();
    }, 1000);
  }
  hasEnemy() {
    return this._enemyies.length > 0;
  }
  checkCount() {
    return this.count >= this.max;
  }
  createEnemy() {
    this.count++;
    this._enemyies.push(new Enemy(this.room, this.ctx));
  }
  getHead() {
    if (this.hasEnemy()) {
      let head = this._enemyies[0];
      this._enemyies.forEach((enemy) => {
        if (enemy.point.y > head.point.y) {
          head = enemy;
        }
      });
      return head;
    }
  }
  stopCreateEnemy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
class Player {
  private point: Point;
  private room: Room;
  private ctx: CanvasRenderingContext2D;
  private radius = 20;
  private enemyManager!: EnemyManager;
  private stopAttack!: () => void;
  constructor(room: Room, ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.room = room;
    this.point = {
      x: this.room.width / 2,
      y: this.room.height - PLAYER_AREA_HEIGHT / 2,
    };
    this.init();
  }
  init() {
    this.ctx.beginPath();
    this.ctx.arc(this.point.x, this.point.y, this.radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = createRandomColor();
    this.ctx.fill();
  }
  start(enemyManager: EnemyManager) {
    this.enemyManager = enemyManager;
    this.attack();
  }
  attack() {
    this.stopAttack = loop(() => {
      const headEnemy = this.enemyManager.getHead();
      if (!headEnemy) {
        return this.stopAttack();
      }
      // 发射子弹攻击敌人
    });
  }
}

type LoopCallback = (deltaTime: number, timestamp: number) => void;
export class Game {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private _room!: Room;
  get room() {
    return this._room;
  }
  private player!: Player;
  private enemyManager!: EnemyManager;
  private deps: LoopCallback[] = [];
  private lastTime = 0;
  private stopFlag = false;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this._room = new Room(this);
    this.player = new Player(this);
    this.enemyManager = new EnemyManager(this);
    this.start();
  }
  registerLoop(callback: LoopCallback) {
    this.deps.push(callback);
  }
  start() {
    const _loop = (timestamp: number) => {
      if (this.stopFlag) return;
      if (!this.lastTime) this.lastTime = timestamp;
      const deltaTime = timestamp - this.lastTime;
      this.lastTime = timestamp;
      this.deps.forEach((callback) => callback(deltaTime, timestamp));
      requestAnimationFrame(_loop);
    };
    requestAnimationFrame(_loop);
  }
  stop() {
    this.stopFlag = true;
  }
}
