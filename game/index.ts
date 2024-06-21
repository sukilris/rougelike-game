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
  game: Game;
  constructor(game: Game) {
    this.game = game;
    const canvas = game.canvas;
    const rect = canvas.getBoundingClientRect();
    this._width = canvas.width = rect.width;
    this._height = canvas.height = rect.height;
  }
  init() {
    this.start();
  }
  create() {
    const ctx = this.game.ctx;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, ENEMY_AREA_HEIGHT);
    ctx.lineTo(this._width, ENEMY_AREA_HEIGHT);
    ctx.moveTo(0, this._height - PLAYER_AREA_HEIGHT);
    ctx.lineTo(this._width, this._height - PLAYER_AREA_HEIGHT);
    ctx.stroke();
    ctx.closePath();
  }
  start() {
    this.game.registerLoop((deltaTime) => {
      this.game.ctx.clearRect(0, 0, this._width, this._height);
      this.create();
    });
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
class EnemyManager {
  private max = MAX_ENEMY_COUNT;
  private count = 0;
  private _enemyies: Enemy[] = [];
  get enemyies() {
    return this._enemyies;
  }
  private interval: number | null = null;
  private game: Game;
  constructor(game: Game) {
    this.game = game;
  }
  start() {
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
    this._enemyies.push(new Enemy(this.game));
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
class Bullet {
  private _point: Point;
  get point() {
    return this._point;
  }
  private radius = 5;
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
    ctx.arc(point.x, point.y, this.radius, 0, 2 * Math.PI);
    // 设置填充颜色并填充
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

type LoopCallback = (deltaTime: number, timestamp: number) => void;
export class Game {
  private _canvas!: HTMLCanvasElement;
  get canvas() {
    return this._canvas;
  }
  private _ctx!: CanvasRenderingContext2D;
  get ctx() {
    return this._ctx;
  }
  private _room!: Room;
  get room() {
    return this._room;
  }
  private player!: Player;
  private _enemyManager!: EnemyManager;
  get enemyManager() {
    return this._enemyManager;
  }
  private deps = new Set<LoopCallback>();
  private lastTime = 0;
  private stopFlag = false;
  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._ctx = canvas.getContext("2d")!;
    this._room = new Room(this);
    this._enemyManager = new EnemyManager(this);
    this.player = new Player(this);
    this.start();
    this.play();
  }
  registerLoop(callback: LoopCallback) {
    this.deps.add(callback);
    return () => {
      this.unRegisterLoop(callback);
    };
  }
  unRegisterLoop(callback: LoopCallback) {
    this.deps.delete(callback);
  }
  play() {
    this._room.init();
    this.player.start();
    this.enemyManager.start();
  }
  start() {
    const _loop = (timestamp: number) => {
      if (this.stopFlag) return;
      if (!this.lastTime) this.lastTime = timestamp;
      const deltaTime = timestamp - this.lastTime;
      this.lastTime = timestamp;
      this.deps.forEach((callback) => {
        callback(deltaTime, timestamp);
      });
      requestAnimationFrame(_loop);
    };
    requestAnimationFrame(_loop);
  }
  stop() {
    this.stopFlag = true;
  }
}
