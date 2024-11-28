import { Vec2 } from "@/math";
import Link from "./link";
import Room from "./room";
import RoomPoint from "./room-point";

/**
 * Represents a door that connects two rooms.
 */
export default class DoorLink extends Link{
  #point1: RoomPoint;
  #point2: RoomPoint;
  #linkLength: number;

  /**
   * Constructs a door link between two rooms.
   * @param p1 The connected point in the first room.
   * @param p2 The connected point in the second room.
   * @param id The identifier of the link.
   */
  public constructor(p1: RoomPoint, p2: RoomPoint, id?: string){
    if(p1.room.id === p2.room.id){
      throw new Error("Door link is invalid (linked points located inside the same room)");
    }
    
    if(!p1.room.isPointInside(p1.point) || !p2.room.isPointInside(p2.point)){
      throw new Error("Door link is invalid (linked points not inside the associated rooms)");
    }
    
    super(id);

    this.#point1 = { ...p1 };
    this.#point2 = { ...p2 };
    this.#linkLength = Vec2.fromVec2Like(this.#point1.point).sub(this.#point2.point).magnitude;
  }

  public get cost(): number{
    return this.#linkLength;
  }

  public get entrances(): RoomPoint[]{
    return [this.#point1, this.#point2];
  }

  public get exits(): RoomPoint[]{
    return [this.#point1, this.#point2];
  }

  public getPath(src: Room, dest: Room): Vec2[] | null{
    // Door links are two-way, so check if the IDs of the rooms match in either direction of the link
    if(src.id === this.#point1.room.id && dest.id === this.#point2.room.id){
      return [Vec2.fromVec2Like(this.#point1.point), Vec2.fromVec2Like(this.#point2.point)];
    }
    if(src.id === this.#point2.room.id && dest.id === this.#point1.room.id){
      return [Vec2.fromVec2Like(this.#point2.point), Vec2.fromVec2Like(this.#point1.point)];
    }

    // Otherwise, this link doesn't provide a path between the given rooms
    return null;
  }
}