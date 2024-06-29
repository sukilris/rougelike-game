import { EnemyManager } from "./enemy/manager";
import { Player } from "./player";
import { Room } from "./room";

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
