import { DistanceFunction } from "@/math/distance";
import Pathfinder from "./pathfinder";
import RoomMap from "@/mapping/room-map";
import { Vec2Like, Vec2 } from "@/math";
import Room from "@/mapping/room";

/**
 * Encapsulates an instance of pathfinder that uses the A* algorithm.
 */
export default class AstarPathfinder extends Pathfinder{
  #distFunc: DistanceFunction;
  
  /**
   * Constructs an A* pathfinder.
   * @param distFunc The distance function to be used in path calculations.
   */
  constructor(distFunc: DistanceFunction){
    super();
    this.#distFunc = distFunc;
  }

  public findPathToRoom(map: RoomMap, src: Vec2Like, dest: Room): Vec2[]{
    if(!map.rooms.has(dest.id)){
      throw new Error("Destination room is not part of the map");
    }
    
    const roomStart = map.pointToRoom(src);
    if(roomStart === null){
      throw new Error("Origin point is outside of any room in the map");
    }

    // No search is required if the origin point is located in the destination room
    if(roomStart === dest){
      return [];
    }

    /// TODO: Construct a traversal graph based on the provided map and compute a path using hierarchical A*

    // No path is found
    return [];
  }

  public findPathToPoint(map: RoomMap, src: Vec2Like, dest: Vec2Like): Vec2[]{
    const roomStart = map.pointToRoom(src);
    const roomEnd = map.pointToRoom(dest);

    if(roomStart === null){
      throw new Error("Origin point is outside of any room in the map");
    }
    if(roomEnd === null){
      throw new Error("Destination point is outside of any room in the map");
    }

    // Path search can be simplified if both points are located in the same room
    if(roomStart === roomEnd){
      return this.findPathInRoom(roomStart, src, dest);
    }

    /// TODO: Construct a traversal graph based on the provided map and compute a path using hierarchical A*

    // No path is found
    return [];
  }

  public findPathInRoom(room: Room, src: Vec2Like, dest: Vec2Like): Vec2[]{
    if(!room.isPointInside(src)){
      throw new Error("Origin point is outside of the room");
    }
    if(!room.isPointInside(dest)){
      throw new Error("Destination point is outside of the room");
    }

    // The path is trivial if the room is convex
    if(room.isConvex){
      /// TODO: Prefer 4- or 8-way paths instead of a pure straight line
      return [Vec2.fromVec2Like(src), Vec2.fromVec2Like(dest)];
    }

    /// TODO: Quantize the room space into grid cells and compute a traversal path using A*

    // No path is found
    return [];
  }
}