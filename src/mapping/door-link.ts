import Link from "./link";
import Room from "./room";
import RoomPoint from "./room-point";

/**
 * Represents a door that connects two rooms.
 */
export default class DoorLink extends Link{
  #point1: RoomPoint;
  #point2: RoomPoint;

  /**
   * Constructs a door link between two rooms.
   * @param p1 The connected point in the first room.
   * @param p2 The connected point in the second room.
   * @param id The identifier of the link.
   */
  constructor(p1: RoomPoint, p2: RoomPoint, id?: string){
    // Door links require that the connected points are inside their respective rooms
    if(!p1.room.isPointInside(p1.point) || !p2.room.isPointInside(p2.point)){
      throw new Error("Door link is invalid (linked points not inside the associated rooms)");
    }
    
    super(id);

    this.#point1 = p1;
    this.#point2 = p2;
  }

  public isConnected(src: Room, dest: Room): boolean{
    // Door links are two-way, so check if the IDs of the rooms match in either direction of the link
    return (src.id === this.#point1.room.id && dest.id === this.#point2.room.id)
      || (src.id === this.#point2.room.id && dest.id === this.#point1.room.id);
  }
}