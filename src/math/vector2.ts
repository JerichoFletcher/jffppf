/**
 * Represents a vector (or point) on the 2D surface.
 */
export interface Vec2{
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
export function sqrMagnitude(v: Vec2): number{
  return dot(v, v);
}

/**
 * Computes the magnitude of a vector.
 * @param v The vector.
 * @returns The magnitude of `v`.
 */
export function magnitude(v: Vec2): number{
  return Math.sqrt(sqrMagnitude(v));
}

/**
 * Computes the angle of a vector to the X-axis.
 * @param v The vector.
 * @returns The angle between `v` and the X-axis.
 */
export function angle(v: Vec2): number{
  return Math.atan2(v.y, v.x);
}

/**
 * Computes the signed angle between two vectors.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns The angle from `v1` to `v2`.
 */
export function angleBetween(v1: Vec2, v2: Vec2): number{
  let theta = angle(v2) - angle(v1);

  // Normalize the angle difference to the range [-PI, PI]
  if(theta > Math.PI){
    theta -= 2 * Math.PI;
  }
  if(theta < -Math.PI){
    theta += 2 * Math.PI;
  }

  return theta;
}

/**
 * Computes the sum of two vectors.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns The sum of `v1` and `v2`.
 */
export function sum(v1: Vec2, v2: Vec2): Vec2{
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

/**
 * Computes the difference between two vectors.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns The difference between `v1` and `v2`, i.e. a vector from the endpoint of `v2` to the endpoint of `v1`.
 */
export function diff(v1: Vec2, v2: Vec2): Vec2{
  return { x: v1.x - v2.x, y: v1.y - v2.y };
}

/**
 * Scales a vector by a scalar value.
 * @param v The vector.
 * @param k The scaling factor.
 * @returns The vector `v` scaled by `k`.
 */
export function scl(v: Vec2, k: number): Vec2{
  return { x: k * v.x, y: k * v.y };
}

/**
 * Computes the dot product of two vectors.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns The dot product of `v1` and `v2`.
 */
export function dot(v1: Vec2, v2: Vec2): number{
  return v1.x * v2.x + v1.y * v2.y;
}

/**
 * Computes the 2D cross product of two vectors.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns The cross product of `v1` and `v2`.
 */
export function cross(v1: Vec2, v2: Vec2): number{
  return v1.x * v2.y - v2.x * v1.y;
}