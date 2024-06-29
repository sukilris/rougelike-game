import { Game } from "../game";
import { MAX_ENEMY_COUNT } from "../tools/constants";
import { setInterval, clearInterval } from "@/game/tools/browser";
import { Enemy } from "./enemy";

export class EnemyManager {
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
