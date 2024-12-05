import { Vec2 } from "@/math/vector2";
import { Room } from ".";
import { RoomPoint } from ".";
import { Serializable } from "@/util";

/**
 * An abstraction of links between different rooms. May represent doors or stairs.
 */
export abstract class Link implements Serializable{
  static #linkReg = new Map<string, Link>();
  static #incrId: number = 0;

  #id: string;

  /**
   * Constructs an abstract link object.
   * @param id The identifier of the link.
   */
  public constructor(id?: string){
    if(id && Link.#linkReg.has(id)){
      throw new Error(`Link with ID '${id}' already exists`);
    }

    do{
      this.#id = id || `link_${Link.#incrId++}`;
    }while(Link.#linkReg.has(this.#id));
    Link.#linkReg.set(this.#id, this);
  }

  /**
   * Attempts to deserializes a JSON object into an instance of this class.
   * @param obj The serialized object.
   * @returns The deserialized class instance.
   */
  public static fromJSON(obj: Record<string, any>): Link{
    switch(obj.type){
      case "door": return DoorLink.fromJSON(obj);
      default: throw new Error(`Unknown link type '${obj.type}'`);
    }
  }

  public static find<T extends Link>(id: string): T | undefined{
    return Link.#linkReg.get(id) as (T | undefined);
  }

  public toJSON(): Record<string, unknown>{
    return { id: this.#id };
  }

  /**
   * The unique identifier of the link.
   */
  public get id(): string{
    return this.#id;
  }

  /**
   * The cost of this link for pathfinding purposes.
   */
  public abstract get cost(): number;

  /**
   * A list of points that serves as entrance to the link.
   */
  public abstract get entrances(): RoomPoint[];

  /**
   * A list of points that serves as exit from the link.
   */
  public abstract get exits(): RoomPoint[];

  /**
   * Gets the path this link connects from one room to another.
   * @param src The source room.
   * @param dest The destination room.
   * @returns The navigation path directly connecting `src` to `dest`, if one exists.
   */
  public abstract getPath(src: Room, dest: Room): Vec2[] | null;
}

import { DoorLink } from "./door-link";