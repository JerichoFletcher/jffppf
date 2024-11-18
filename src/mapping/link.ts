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
  constructor(id?: string){
    this.#id = id || `link_${Link.#incrId++}`;
  }

  /**
   * The unique identifier of the link.
   */
  get id(): string{
    return this.#id;
  }

  /**
   * Checks whether this link allows navigation from one room to another.
   * @param src The source room.
   * @param dest The destination room.
   * @returns Whether this link provides a navigation path directly connecting `src` to `dest`.
   */
  abstract isConnected(src: Room, dest: Room): boolean;
}