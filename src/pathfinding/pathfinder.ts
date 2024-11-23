import Room from "@/mapping/room";
import RoomMap from "@/mapping/room-map";
import { Vec2, Vec2Like } from "@/math";

/**
 * An abstract representation of a pathfinding strategy.
 */
export default abstract class Pathfinder{
  /**
   * Computes a path between a point and a room in a map.
   * @param map The map to be traversed.
   * @param src The origin of the path.
   * @param dest The destination room.
   * @returns An array of points along which the result path goes, or an empty array if no such path exists.
   */
  public abstract findPathToRoom(map: RoomMap, src: Vec2Like, dest: Room): Vec2[];

  /**
   * Computes a path between two points in a map.
   * @param map The map to be traversed.
   * @param src The origin of the path.
   * @param dest The destination of the path.
   * @returns An array of points along which the result path goes, or an empty array if no such path exists.
   */
  public abstract findPathToPoint(map: RoomMap, src: Vec2Like, dest: Vec2Like): Vec2[];

  /**
   * Computes a path between two points in a room.
   * @param room The room to be traversed.
   * @param src The origin of the path.
   * @param dest The destination of the path.
   * @returns An array of points along which the result path goes, or an empty array if no such path exists.
   */
  public abstract findPathInRoom(room: Room, src: Vec2Like, dest: Vec2Like): Vec2[];
}