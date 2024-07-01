import { Game } from "../game";
import { MAX_ENEMY_COUNT } from "../tools/constants";
import { Enemy } from "./enemy";

export class EnemyManager {
  private max = MAX_ENEMY_COUNT;
  private count = 0;
  private _enemyies: Enemy[] = [];
  get enemyies() {
    return this._enemyies;
  }
  private clearInterval!: () => void;
  private game: Game;
  constructor(game: Game) {
    this.game = game;
  }
  start() {
    this.intervalCreateEnemy();
  }
  intervalCreateEnemy() {
    this.clearInterval = this.game.setInterval(() => {
      if (this.checkCount()) {
        return;
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
  removeEnemy(enemy: Enemy) {
    this.count--;
    const index = this._enemyies.findIndex((item) => item === enemy);
    this._enemyies.splice(index, 1);
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
    this.clearInterval();
  }
}
