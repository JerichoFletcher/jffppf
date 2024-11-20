import { Vec2 } from "@/math";
import Room from "./room";

/**
 * An abstraction of links between different rooms. May represent doors or stairs.
 */
export default abstract class Link{
  static #incrId: number = 0;

  #id: string;

  /**
   * Constructs an abstract link object.
   * @param id The identifier of the link.
   */
  public constructor(id?: string){
    this.#id = id || `link_${Link.#incrId++}`;
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
   * Gets the path this link connects from one room to another.
   * @param src The source room.
   * @param dest The destination room.
   * @returns The navigation path directly connecting `src` to `dest`, if one exists.
   */
  public abstract getPath(src: Room, dest: Room): Vec2[] | null;
}