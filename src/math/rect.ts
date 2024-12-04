import { Serializable } from "@/util";
import { Vec2, Vec2Like } from "./vector2";

/**
 * Represents a rectangle on a 2D surface.
 */
export class Rect implements Serializable{
  #center: Vec2;
  #size: Vec2;

  /**
   * Creates a rectangle by defining its center point and size.
   * @param center The center point of the rectangle.
   * @param size The size of the rectangle.
   */
  public constructor(center: Vec2Like, size: Vec2Like){
    this.#center = Vec2.fromVec2Like(center);
    this.#size = Vec2.fromVec2Like(size);
  }
  
  /**
   * Constructs a rectangle from two opposing corner points.
   * @param p1 The first corner.
   * @param p2 The second corner.
   * @returns A rectangle instance.
   */
  public static fromCorners(p1: Vec2Like, p2: Vec2Like): Rect{
    const left = Math.min(p1.x, p2.x);
    const right = Math.max(p1.x, p2.x);
    const bottom = Math.min(p1.y, p2.y);
    const top = Math.max(p1.y, p2.y);

    const center = new Vec2((left + right) / 2, (bottom + top) / 2);
    const size = new Vec2(right - left, top - bottom);

    return new Rect(center, size);
  }

  /**
   * Attempts to deserializes a JSON object into an instance of this class.
   * @param obj The serialized object.
   * @returns The deserialized class instance.
   */
  public static fromJSON(obj: Record<string, any>): Rect{
    const center = Vec2.fromJSON(obj["center"]);
    const size = Vec2.fromJSON(obj["size"]);

    return new Rect(center, size);
  }

  public toJSON(): Record<string, any>{
    return { center: this.#center.toJSON(), size: this.#size.toJSON() };
  }

  /**
   * The left boundary of the rectangle.
   */
  public get left(): number{
    return this.#center.x - this.#size.x / 2;
  }
  
  /**
   * The right boundary of the rectangle.
   */
  public get right(): number{
    return this.#center.x + this.#size.x / 2;
  }
  
  /**
   * The bottom boundary of the rectangle.
   */
  public get bottom(): number{
    return this.#center.y - this.#size.y / 2;
  }

  /**
   * The top boundary of the rectangle.
   */
  public get top(): number{
    return this.#center.y + this.#size.y / 2;
  }

  /**
   * The center point of the rectangle.
   */
  public get center(): Vec2{
    return this.#center;
  }

  /**
   * The size of the rectangle in each dimension.
   */
  public get size(): Vec2{
    return this.#size;
  }

  /**
   * Checks if a point lies within this rectangle.
   * @param p The point to check.
   * @returns Whether `point` is within the bounds of this rectangle.
   */
  public isWithin(point: Vec2Like): boolean{
    return this.left <= point.x && point.x <= this.right
      && this.bottom <= point.y && point.y <= this.top;
  }
}