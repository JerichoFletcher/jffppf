import { Vec2, Vec2Like } from "./vector2";

/**
 * Represents a rectangle on a 2D surface.
 */
export default class Rect{
  #left: number;
  #right: number;
  #bottom: number;
  #top: number;

  /**
   * Constructs a rectangle from two opposing corner points.
   * @param p1 The first corner.
   * @param p2 The second corner.
   */
  public constructor(p1: Vec2Like, p2: Vec2Like){
    this.#left = Math.min(p1.x, p2.x);
    this.#right = Math.max(p1.x, p2.x);
    this.#bottom = Math.min(p1.y, p2.y);
    this.#top = Math.max(p1.y, p2.y);
  }

  /**
   * The left boundary of the rectangle.
   */
  public get left(): number{
    return this.#left;
  }
  
  /**
   * The right boundary of the rectangle.
   */
  public get right(): number{
    return this.#right;
  }
  
  /**
   * The bottom boundary of the rectangle.
   */
  public get bottom(): number{
    return this.#bottom;
  }

  /**
   * The top boundary of the rectangle.
   */
  public get top(): number{
    return this.#top;
  }

  /**
   * The center point of the rectangle.
   */
  public get center(): Vec2{
    return new Vec2((this.#left + this.#right) / 2, (this.#bottom + this.#top) / 2);
  }

  /**
   * The size of the rectangle in each dimension.
   */
  public get size(): Vec2{
    return new Vec2(this.#right - this.#left, this.#top - this.#bottom);
  }

  /**
   * Checks if a point lies within this rectangle.
   * @param p The point to check.
   * @returns Whether `point` is within the bounds of this rectangle.
   */
  public isWithin(point: Vec2Like): boolean{
    return this.#left <= point.x && point.x <= this.#right
      && this.#bottom <= point.y && point.y <= this.#top;
  }
}