import { Point } from '../types';

export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomPosition(boardWidth: number, boardHeight: number): Point { 
  return { x: getRandomNumber(0, boardWidth - 1), y: getRandomNumber(0, boardHeight - 1) };
}
