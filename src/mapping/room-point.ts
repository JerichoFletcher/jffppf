import { Vec2, Vec2Like } from "../math";
import { Room } from ".";

/**
 * Encapsulates the information about a point associated with a room.
 */
export interface RoomPoint{
  /** The encapsulated point information. */
  point: Vec2Like;
  /** What room to be associated with this point. */
  room: Room;
}

export function roomPointFromJSON(obj: Record<string, any>): RoomPoint{
  const room = Room.find(obj.room);
  if(!room)throw new Error(`Room '${obj.room}' not found or is uninitialized`);
  return { point: Vec2.fromJSON(obj.point), room };
}

export function roomPointToJSON(p: RoomPoint): Record<string, unknown>{
  return { point: Vec2.fromVec2Like(p.point).toJSON(), room: p.room.id };
}