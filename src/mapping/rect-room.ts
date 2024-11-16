import { isWithinBoundingBox, Vector2 } from "@/math";
import Room from "./room";

/**
 * Represents a rectangular room.
 */
export default class RectRoom implements Room{
  #leftBound: number;
  #rightBound: number;
  #bottomBound: number;
  #topBound: number;

  /**
   * Creates a rectangular room using two points as its opposite corners.
   * @param p1 The first corner point.
   * @param p2 The second corner point.
   */
  constructor(p1: Vector2, p2: Vector2){
    // The room is invalid if the points lie on the same horizontal or vertical line
    if(p1.x === p2.x || p1.y === p2.y){
      throw new Error("Rectangular room shape is invalid (would degenerate into a line segment)");
    }

    // Determine the room boundaries
    this.#leftBound = Math.min(p1.x, p2.x),
    this.#rightBound = Math.max(p1.x, p2.x),
    this.#bottomBound = Math.min(p1.y, p2.y),
    this.#topBound = Math.max(p1.y, p2.y);
  }

  public isPointInside(point: Vector2): boolean {
    return isWithinBoundingBox(point, this.#leftBound, this.#rightBound, this.#bottomBound, this.#topBound);
  }
}