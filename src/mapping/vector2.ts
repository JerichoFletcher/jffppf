/**
 * Represents a vector (or point) on the 2D surface.
 */
export interface Vector2{
  /** The x-component of the vector. */
  x: number;
  /** The y-component of the vector. */
  y: number;
}

/**
 * Computes the square of the magnitude of a vector.
 * @param v The vector.
 * @returns The square magnitude of `v`.
 */
export function sqrMagnitude(v: Vector2): number{
  return dot(v, v);
}

/**
 * Computes the magnitude of a vector.
 * @param v The vector.
 * @returns The magnitude of `v`.
 */
export function magnitude(v: Vector2): number{
  return Math.sqrt(sqrMagnitude(v));
}

/**
 * Computes the sum of two vectors.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns The sum of `v1` and `v2`.
 */
export function sum(v1: Vector2, v2: Vector2): Vector2{
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

/**
 * Computes the difference between two vectors.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns The difference between `v1` and `v2`, i.e. a vector from the endpoint of `v2` to the endpoint of `v1`.
 */
export function diff(v1: Vector2, v2: Vector2): Vector2{
  return { x: v1.x - v2.x, y: v1.y - v2.y };
}

/**
 * Computes the dot product of two vectors.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns The dot product of `v1` and `v2`.
 */
export function dot(v1: Vector2, v2: Vector2): number{
  return v1.x * v2.x + v1.y * v2.y;
}

/**
 * Computes the 2D cross product of two vectors.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns The cross product of `v1` and `v2`.
 */
export function cross(v1: Vector2, v2: Vector2): number{
  return v1.x * v2.y - v2.x * v1.y;
}