import { cross, diff, Vec2 } from "./vector2";

/**
 * Compute the orientation of three points in a 2D plane.
 * @param a The first point.
 * @param b The second point.
 * @param c The third point.
 * @returns The orientation of the three points, i.e. the cross product between the vector `ab` and `bc`.
 * Positive values denote counterclockwise orientations. Negative values denote clockwise orientations.
 * A value of zero means the three points are collinear (lying on a common straight line).
 */
export function orientation(a: Vec2, b: Vec2, c: Vec2): number{
  return cross(diff(b, a), diff(c, b));
}

/**
 * Checks if a point lies within the bounding box defined by two corner points.
 * @param p The point to check.
 * @param a The first corner of the bounding box.
 * @param b The second corner of the bounding box.
 * @returns Whether `P` is within the bounding box `AB`.
 */
export function isWithinPoints(p: Vec2, a: Vec2, b: Vec2): boolean{
  return Math.min(a.x, b.x) <= p.x && p.x <= Math.max(a.x, b.x)
    && Math.min(a.y, b.y) <= p.y && p.y <= Math.max(a.y, b.y);
}

/**
 * Checks if a point lies within a bounding box.
 * @param p The point to check.
 * @param left The left boundary of the area.
 * @param right The right boundary of the area.
 * @param bottom The bottom boundary of the area.
 * @param top The top boundary of the area.
 * @returns Whether `P` is within the given bounds.
 */
export function isWithinBoundingBox(p: Vec2, left: number, right: number, bottom: number, top: number): boolean{
  return left <= p.x && p.x <= right
    && bottom <= p.y && p.y <= top;
}

/**
 * Checks if a point lies on a line segment.
 * @param p The point to check.
 * @param a The first end of the segment.
 * @param b The second end of the segment.
 * @returns Whether `P` lies on the line segment `AB`.
 */
export function liesOnSegment(p: Vec2, a: Vec2, b: Vec2): boolean{
  // This check is performed by first checking that P is collinear with A and B,
  // then doing a bounding box check to make sure P is within A and B
  return orientation(p, a, b) === 0 && isWithinPoints(p, a, b);
}

/**
 * Checks if two line segments intersect each other.
 * @param a The first end of the first segment.
 * @param b The second end of the first segment.
 * @param u The first end of the second segment.
 * @param v The second end of the second segment.
 * @returns Whether the line segments `ab` and `uv` intersect.
 */
export function segmentsIntersect(a: Vec2, b: Vec2, u: Vec2, v: Vec2): boolean{
  // AB and UV intersect if the orientations of ABU and ABV differ, and the orientations of UVA and UVB also differ
  let oABU = orientation(a, b, u);
  let oABV = orientation(a, b, v);
  let oUVA = orientation(u, v, a);
  let oUVB = orientation(u, v, b);

  if(Math.sign(oABU) !== Math.sign(oABV) && Math.sign(oUVA) !== Math.sign(oUVB)){
    return true;
  }

  // Handle special cases when collinear segments overlap each other
  if(oABU === 0 && isWithinPoints(u, a, b))return true;
  if(oABV === 0 && isWithinPoints(v, a, b))return true;
  if(oUVA === 0 && isWithinPoints(a, u, v))return true;
  if(oUVB === 0 && isWithinPoints(b, u, v))return true;

  // Otherwise, the segments don't intersect
  return false;
}