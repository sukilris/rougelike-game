import { EnemyManager } from "./enemy/manager";
import { Player } from "./player";
import { Room } from "./room";
import { setInterval, clearInterval } from "@/game/tools/browser";

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
  private duration = 0;
  private lastTime = 0;
  private stopFlag = false;
  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._ctx = canvas.getContext("2d")!;
    this._room = new Room(this);
    this._enemyManager = new EnemyManager(this);
    this.player = new Player(this);
    this.init();
    this.start();
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
  init() {
    // 监听页面可见性
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.restart();
      }
    });
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
      // 累加时间
      this.duration += deltaTime;
      this.lastTime = timestamp;
      this.deps.forEach((callback) => {
        callback(deltaTime, timestamp);
      });
      requestAnimationFrame(_loop);
    };
    requestAnimationFrame(_loop);
  }
  restart() {
    this.stopFlag = false;
    this.start();
  }
  stop() {
    this.stopFlag = true;
    // 暂停的时候应该重置最新时间
    this.lastTime = 0;
  }
  setInterval(callback: () => void, delay: number) {
    let count = 1;
    return this.registerLoop(() => {
      if (this.duration >= delay * count) {
        count++;
        callback();
      }
    });
  }
}
