import Room from "@/mapping/room";
import { Vec2Like } from "@/math";
import { TraversalGraph } from "./traversal-graph";
import Link from "@/mapping/link";
import RoomPoint from "@/mapping/room-point";
import { DistanceFunction } from "@/math/distance";

/** How to determine the neighbors of each cell in room grids. */
export type NeighborStrategy = "4-way" | "8-way";
/** How to compute the distance between two points. */
export type DistanceMode = "manhattan" | "octile" | "euclidean" | DistanceFunction;

/**
 * Parameters and configurations for pathfinding.
 */
export interface PathfindingConfig{
  /** The size (width and height) of each cell in room grids. Smaller values lead to finer-grained in-room pathing, at the cost of heavier workload. */
  roomGridCellSize?: number;
  /** How to determine the neighbors of each cell in room grids. */
  cellNeighborStrategy?: NeighborStrategy;
  /** How to compute distances between points in the map. May accept a custom distance function. */
  distanceMode?: DistanceMode;
  /** The penalty for each turning point in the path. Values greater than 0 favors paths with fewer turns. */
  turnPenalty?: number;
  /** Whether crossing corners of obstacles is allowed. */
  crossCorners?: boolean;
  /** Whether to automatically initialize map graph costs using this pathfinder instance. */
  autoComputeGraphCosts?: boolean;
  /** Whether to simplify paths by merging segments with the same direction. */
  autoSimplifyPath?: boolean;
}

/**
 * An object containing information about the result of a path search.
 */
export type PathResult<T> = {
  /** How many nodes were visited in the search. */
  nodesVisited: number;
} & ({
  /** Whether the search found a path. */
  success: false;
} | {
  /** Whether the search found a path. */
  success: true;
  /** A list of points defining the final path. */
  path: T[];
  /** The total cost of the final path. */
  cost: number;
});

/**
 * Encapsulates information about the action of entering a link from a specific room.
 */
export interface LinkDirection{
  /** The link to be traversed. */
  link: Link;
  /** The point that the associated link is entered from. */
  entrance: RoomPoint;
  /** The point that the associated link exits to when entered from this direction. */
  exit: RoomPoint;
}

/**
 * An abstract representation of a pathfinding strategy.
 */
export default abstract class Pathfinder{
  /**
   * Computes a path between a point and a room in a map.
   * @param graph The traversal graph of the map.
   * @param src The origin of the path.
   * @param dest The destination room.
   * @param conf Additional pathfindng configurations.
   * @returns An array of points along which the result path goes, or an empty array if no such path exists.
   */
  public abstract mapPointToRoom(graph: TraversalGraph, src: Vec2Like, dest: Room, conf?: PathfindingConfig): PathResult<RoomPoint>;

  /**
   * Computes a path between two points in a map.
   * @param map The traversal graph of the map.
   * @param src The origin of the path.
   * @param dest The destination of the path.
   * @param conf Additional pathfindng configurations.
   * @returns An array of points along which the result path goes, or an empty array if no such path exists.
   */
  public abstract mapPointToPoint(graph: TraversalGraph, src: Vec2Like, dest: Vec2Like, conf?: PathfindingConfig): PathResult<RoomPoint>;

  /**
   * Computes a path of links between two rooms in a map.
   * @param graph The traversal graph of the map.
   * @param src The origin room of the path.
   * @param dest The destination room of the path.
   * @param conf Additional pathfindng configurations.
   * @returns An array of links to travel to reach `dest` from `src`, or an empty array if no such path exists.
   */
  public abstract mapRoomToRoom(graph: TraversalGraph, src: Room, dest: Room, conf?: PathfindingConfig): PathResult<LinkDirection>;

  /**
   * Computes a path between two points in a room.
   * @param room The room to be traversed.
   * @param src The origin of the path.
   * @param dest The destination of the path.
   * @param conf Additional pathfindng configurations.
   * @returns An array of points along which the result path goes, or an empty array if no such path exists.
   */
  public abstract roomPointToPoint(room: Room, src: Vec2Like, dest: Vec2Like, conf?: PathfindingConfig): PathResult<RoomPoint>;
}