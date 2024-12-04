import { Vec2, Vec2Like, Rect } from "@/math";
import Room from "./room";

/**
 * Represents a rectangular room.
 */
export default class RectRoom extends Room{
  #bounds: Rect;

  /**
   * Creates a rectangular room using two points as its opposite corners.
   * @param p1 The first corner point.
   * @param p2 The second corner point.
   * @param id The identifier of the room.
   */
  public constructor(p1: Vec2Like, p2: Vec2Like, id?: string){
    // The room is invalid if the points lie on the same horizontal or vertical line
    if(p1.x === p2.x || p1.y === p2.y){
      throw new Error("Rectangular room shape is invalid (would degenerate into a line segment)");
    }

    super(id);
    this.#bounds = Rect.fromCorners(p1, p2);
  }
  
  public get centroid(): Vec2{
    return this.#bounds.center;
  }

  public get boundary(): Rect{
    return this.#bounds;
  }

  public get isConvex(): boolean{
    return true;
  }

  public isPointInside(point: Vec2Like): boolean{
    return this.#bounds.isWithin(point);
  }
}