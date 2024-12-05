import { Vec2, Vec2Like, Rect } from "@/math";
import { Serializable } from "@/util";

/**
 * Represents an arbitrary room.
 */
export abstract class Room implements Serializable{
  static #roomReg = new Map<string, Room>();
  static #incrId: number = 0;

  #id: string;

  /**
   * Creates an abstract room with the given ID.
   * @param id The identifier of the room.
   */
  public constructor(id?: string){
    if(id && Room.#roomReg.has(id)){
      throw new Error(`Room with ID '${id}' already exists`);
    }

    do{
      this.#id = id || `room_${Room.#incrId++}`;
    }while(Room.#roomReg.has(this.#id));
    Room.#roomReg.set(this.#id, this);
  }

  /**
   * Attempts to deserializes a JSON object into an instance of this class.
   * @param obj The serialized object.
   * @returns The deserialized class instance.
   */
  public static fromJSON(obj: Record<string, any>): Room{
    switch(obj.type){
      case "rect": return RectRoom.fromJSON(obj);
      case "poly": return PolygonRoom.fromJSON(obj);
      default: throw new Error(`Unknown room type '${obj.type}'`);
    }
  }

  public static find<T extends Room>(id: string): T | undefined{
    return Room.#roomReg.get(id) as (T | undefined);
  }

  public toJSON(): Record<string, unknown>{
    return { id: this.#id };
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
   * Whether the room shape is convex.
   */
  public abstract get isConvex(): boolean;
 
  /**
  * Check if a point is inside of the room.
  * @param point A point to check.
  * @returns Whether `point` lies within the boundary of the room.
  */
  public abstract isPointInside(point: Vec2Like): boolean;
}

import { RectRoom } from ".";
import { PolygonRoom } from ".";