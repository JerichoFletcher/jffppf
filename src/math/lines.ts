import { cross, diff, Vector2 } from "./vector2";

/**
 * Compute the orientation of three points in a 2D plane.
 * @param p1 The first point.
 * @param p2 The second point.
 * @param p3 The third point.
 * @returns The orientation of the three points, i.e. the cross product between the vector `v12` and `v23`.
 * Positive values denote counterclockwise orientations. Negative values denote clockwise orientations.
 * A value of zero means the three points are collinear (lying on a common straight line).
 */
export function orientation(p1: Vector2, p2: Vector2, p3: Vector2): number{
  return cross(diff(p2, p1), diff(p3, p2));
}

/**
 * Checks if a point lies on a line segment.
 * @param p The point to check.
 * @param a The first end of the segment.
 * @param b The second end of the segment.
 * @returns Whether `p` lies on the line segment `uv`.
 */
export function liesOnSegment(p: Vector2, a: Vector2, b: Vector2): boolean{
  // This check is performed by first checking that the point is collinear with p1 and p2,
  // then doing a bounding box check to make sure the point is within p1 and p2
  return cross(diff(a, p), diff(b, p)) === 0
    && Math.min(a.x, b.x) <= p.x && p.x <= Math.max(a.x, b.x)
    && Math.min(a.y, b.y) <= p.y && p.y <= Math.max(a.y, b.y);
}