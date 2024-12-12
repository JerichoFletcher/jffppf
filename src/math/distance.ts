import { Vec2Like } from "../math"

/** A function that computes the distance between two points. */
export type DistanceFunction = (from: Vec2Like, to: Vec2Like) => number;

/**
 * Computes the Manhattan (or taxicab) distance between two points.
 * @param from The first point.
 * @param to The second point.
 * @returns The Manhattan distance between `from` and `to`, which is the sum of absolute difference of each component of the points.
 */
export const manhattan: DistanceFunction = (from: Vec2Like, to: Vec2Like) => {
  return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
}

/**
 * Computes the octile distance between two points.
 * @param from The first point.
 * @param to The second point.
 * @returns The octile distance between `from` and `to`, which is the cost of the shortest path between the two points on an 8-way grid,
 * where orthogonal steps have a cost of 1, and diagonal steps have a cost of √2 ≈ 1.4.
 */
export const octile: DistanceFunction = (from: Vec2Like, to: Vec2Like) => {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  return 1.4 * Math.min(dx, dy) + Math.abs(dx - dy);
}

/**
 * Computes the Euclidean distance between two points.
 * @param from The first point.
 * @param to The second point.
 * @returns The Euclidean distance, or straight-line distance, between `from` and `to`.
 */
export const euclidean: DistanceFunction = (from: Vec2Like, to: Vec2Like) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.sqrt(dx * dx + dy * dy);
}