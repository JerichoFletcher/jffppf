import Room from "@/mapping/room";
import RoomMap from "@/mapping/room-map";
import { Vec2Like } from "@/math";

/**
 * An object containing information about the result of a path search.
 */
export type PathResult = {
  /** How many nodes were visited in the search. */
  nodesVisited: number;
} & ({
  /** Whether the search found a path. */
  success: false;
} | {
  /** Whether the search found a path. */
  success: true;
  /** A list of points defining the final path. */
  path: Vec2Like[];
  /** The total cost of the final path. */
  cost: number;
});

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
  public abstract mapPointToRoom(map: RoomMap, src: Vec2Like, dest: Room): PathResult;

  /**
   * Computes a path between two points in a map.
   * @param map The map to be traversed.
   * @param src The origin of the path.
   * @param dest The destination of the path.
   * @returns An array of points along which the result path goes, or an empty array if no such path exists.
   */
  public abstract mapPointToPoint(map: RoomMap, src: Vec2Like, dest: Vec2Like): PathResult;

  /**
   * Computes a path between two points in a room.
   * @param room The room to be traversed.
   * @param src The origin of the path.
   * @param dest The destination of the path.
   * @returns An array of points along which the result path goes, or an empty array if no such path exists.
   */
  public abstract roomPointToPoint(room: Room, src: Vec2Like, dest: Vec2Like): PathResult;
}