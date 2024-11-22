import { Vec2Like } from "@/math";
import Room from "./room";

/**
 * Encapsulates the information about a point associated with a room.
 */
export default interface RoomPoint{
  /** The encapsulated point information. */
  point: Vec2Like;
  /** What room to be associated with this point. */
  room: Room;
}