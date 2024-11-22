import { Vec2Like } from "@/math"

/** A function that computes the distance between two points. */
export type DistanceFunction = (from: Vec2Like, to: Vec2Like) => number;

/**
 * Computes the Manhattan (or taxicab) distance between two points.
 * @param from The first point.
 * @param to The second point.
 * @returns The Manhattan distance between `from` and `two`, which is the sum of absolute difference of each component of the points.
 */
export const manhattan: DistanceFunction = (from: Vec2Like, to: Vec2Like) => {
  return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
}

/**
 * Computes the Euclidean distance between two points.
 * @param from The first point.
 * @param to The second point.
 * @returns The Euclidean distance, or straight-line distance, between `from` and `two`.
 */
export const euclidean: DistanceFunction = (from: Vec2Like, to: Vec2Like) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.sqrt(dx * dx + dy * dy);
}