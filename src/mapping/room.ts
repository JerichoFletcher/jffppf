import { Vector2 } from "@/math";

/**
 * Represents an arbitrary room.
 */
export default interface Room{
  /**
   * Check if a point is inside of the room.
   * @param point A point to check.
   * @returns Whether `point` lies within the boundary of the room.
   */
  isPointInside(point: Vector2): boolean;
}