import { Vector2, Vec2, Lines } from "@/math";
import Room from "./room";

/**
 * Represents a rectangular room.
 */
export default class RectRoom extends Room{
  #centroid: Vec2;
  #leftBound: number;
  #rightBound: number;
  #bottomBound: number;
  #topBound: number;

  /**
   * Creates a rectangular room using two points as its opposite corners.
   * @param p1 The first corner point.
   * @param p2 The second corner point.
   * @param id The identifier of the room.
   */
  public constructor(p1: Vec2, p2: Vec2, id?: string){
    // The room is invalid if the points lie on the same horizontal or vertical line
    if(p1.x === p2.x || p1.y === p2.y){
      throw new Error("Rectangular room shape is invalid (would degenerate into a line segment)");
    }

    super(id);

    // Determine the room boundaries
    this.#leftBound = Math.min(p1.x, p2.x),
    this.#rightBound = Math.max(p1.x, p2.x),
    this.#bottomBound = Math.min(p1.y, p2.y),
    this.#topBound = Math.max(p1.y, p2.y);

    // Precompute the centroid
    this.#centroid = {
      x: (this.#leftBound + this.#rightBound) / 2,
      y: (this.#bottomBound + this.#topBound) / 2
    };
  }
  
  public get centroid(): Vec2{
    return this.#centroid;
  }

  public isPointInside(point: Vec2): boolean{
    return Lines.isWithinBoundingBox(point, this.#leftBound, this.#rightBound, this.#bottomBound, this.#topBound);
  }
}