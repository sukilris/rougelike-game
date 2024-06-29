import { Bullet } from "../bullet";
import { Enemy } from "../enemy/enemy";

export const createRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const isCollide = (bullet: Bullet, enemy: Enemy) => {
  const dx = bullet.point.x - enemy.point.x;
  const dy = bullet.point.y - enemy.point.y;
  const distanceSquared = dx * dx + dy * dy;
  const radiusSum = bullet.radius + enemy.radius;
  return distanceSquared <= radiusSum * radiusSum;
};
