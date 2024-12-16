import { Vec2, Vec2Like } from "../math";
import { Room } from ".";
import { RoomPoint, roomPointFromJSON, roomPointToJSON } from "./room-point";
import { Link } from "./link";

/**
 * Represents a door that connects two rooms.
 */
export class DoorLink extends Link{
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
    super(id);
    
    if(p1.room.id === p2.room.id){
      throw new Error(`Door link '${this.id}' is invalid (linked points located inside the same room)`);
    }
    
    if(!p1.room.isPointInside(p1.point)){
      throw new Error(`Door link '${this.id}' is invalid (first point not inside the associated room)`);
    }
    if(!p2.room.isPointInside(p2.point)){
      throw new Error(`Door link '${this.id}' is invalid (second point not inside the associated room)`);
    }

    this.#point1 = { ...p1 };
    this.#point2 = { ...p2 };
    this.#linkLength = Vec2.fromVec2Like(this.#point1.point).sub(this.#point2.point).magnitude;
  }

  /**
   * Attempts to deserializes a JSON object into an instance of this class.
   * @param obj The serialized object.
   * @returns The deserialized class instance.
   */
  public static fromJSON(obj: Record<string, any>): DoorLink{
    if(obj.type !== "door")throw new Error("Link type is not 'door'");
    const point1 = roomPointFromJSON(obj.point1);
    const point2 = roomPointFromJSON(obj.point2);
    return new DoorLink(point1, point2, obj.id);
  }

  public toJSON(): Record<string, unknown>{
    const obj = super.toJSON();
    obj.type = "door";
    obj.point1 = roomPointToJSON(this.#point1);
    obj.point2 = roomPointToJSON(this.#point2);
    return obj;
  }

  public get vertices(): Vec2Like[]{
    return [
      { x: this.#point1.point.x, y: this.#point1.point.y },
      { x: this.#point2.point.x, y: this.#point2.point.y },
    ];
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