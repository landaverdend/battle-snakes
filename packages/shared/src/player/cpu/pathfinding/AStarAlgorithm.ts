import { MinPriorityQueue } from '@datastructures-js/priority-queue';
import { Point } from '../../../constants/gridTypes';
import { GameState } from '../../../game/GameState';

type Node = {
  position: Point;
  parent: Node | null; // for path reconstruction.
  f: number; // g + h
};

export class AStarAlgorithm {
  /**
   * A* algo to find shortest path between two points using manhattan distance as the heuristic.
   */
  public static calculateAStar(gameStateRef: GameState, origin: Point, target: Point): Point[] {
    // Nodes that remain to be evaluated, ordered by f value.
    const open = new MinPriorityQueue<Node>((node: Node) => node.f);
    const gScores = new Map<string, number>(); // use a map to track nodes based on their key. (point.toString())

    const initialHeuristic = origin.calculateManhattanDistance(target);
    open.enqueue({
      position: origin,
      parent: null,
      f: 0 + initialHeuristic, // f = g + h
    });
    gScores.set(origin.toString(), 0);

    // Nodes that we've already evaluated...
    const closed = new Set<string>();

    while (!open.isEmpty()) {
      const current = open.dequeue() as Node;

      // check if we've reached the target.
      if (current?.position.equals(target)) {
        return this.reconstructPath(current);
      }
      // mark current node as visited.
      closed.add(current?.position?.toString());

      // get all the neighbors of the current node.
      for (const neighbor of this.getValidNeighbors(current, gameStateRef)) {
        const neighborKey = neighbor.toString();
        // skip already evaluated nodes.
        if (closed.has(neighborKey)) continue;

        // calculate the tentative g score...
        const currentGScore = gScores.get(current.position.toString()) ?? 0;
        const tentativeGScore = currentGScore + 1; // only add 1 since we're moving 1 cell at a time.

        // Do a check to see if there is a better path to the neighbor (lower g score), default to infinity if the neighbor is not in the gScores map
        if (tentativeGScore < (gScores.get(neighborKey) ?? Infinity)) {
          const heuristicScore = neighbor.calculateManhattanDistance(target);
          const node = {
            position: neighbor,
            parent: current,
            f: tentativeGScore + heuristicScore,
          };
          gScores.set(neighborKey, tentativeGScore);
          open.enqueue(node);
        }
      }
    }

    // It's possible that we didn't find a path.
    return [];
  }

  private static reconstructPath(current: Node): Point[] {
    const path: Point[] = [];

    let currentNode: Node | null = current;
    while (currentNode !== null) {
      path.push(currentNode.position);
      currentNode = currentNode.parent;
    }

    // remove the first element from the path since it's the origin...
    return path.reverse().slice(1);
  }

  private static getValidNeighbors(node: Node, gameStateRef: GameState): Point[] {
    return node.position.getAdjacentPoints().filter((point) => gameStateRef.isValidPosition(point));
  }
}
