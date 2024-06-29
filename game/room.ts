import { ENEMY_AREA_HEIGHT, PLAYER_AREA_HEIGHT } from "@/game/tools/constants";
import { Game } from "./game";

export class Room {
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
