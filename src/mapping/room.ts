import { Vec2, Vec2Like } from "@/math";
import Rect from "@/math/rect";

/**
 * Represents an arbitrary room.
 */
export default abstract class Room{
  static #incrId: number = 0;

  #id: string;

  /**
   * Creates an abstract room with the given ID.
   * @param id The identifier of the room.
   */
  public constructor(id?: string){
    this.#id = id || `room_${Room.#incrId++}`;
  }
  
  /**
   * The unique identifier of the room.
  */
  public get id(): string{
    return this.#id;
  }
  
  /**
   * The centroid of the room shape.
  */
  public abstract get centroid(): Vec2;

  /**
   * The rectangular boundary of the room.
   */
  public abstract get boundary(): Rect;
 
  /**
  * Check if a point is inside of the room.
  * @param point A point to check.
  * @returns Whether `point` lies within the boundary of the room.
  */
  public abstract isPointInside(point: Vec2Like): boolean;
}