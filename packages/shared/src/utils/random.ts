import { Point } from '../constants/gridTypes';

export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomPosition(boardWidth: number, boardHeight: number): Point {
  return new Point(getRandomNumber(0, boardWidth - 1), getRandomNumber(0, boardHeight - 1));
}

export function getRandomColor() {
  return '#' + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, '0');
}
