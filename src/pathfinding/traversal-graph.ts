import RoomMap from "@/mapping/room-map";
import Room from "@/mapping/room";
import Link from "@/mapping/link";
import Pathfinder from "./pathfinder";

/**
 * An object that stores information about inter-link pathfinding costs in each room.
 */
interface CostMap{
  /** Cost mappings applied for each link in a room. */
  [roomId: string]: undefined | {
    /** Cost mappings applied for each outgoing link in a room, relative to an incoming link. */
    [inLinkId: string]: undefined | {
      /** The cost of travelling from the incoming link to this outgoing link. */
      [outLinkId: string]: number | undefined;
    }
  }
}

/**
 * Represents a graph of traversal costs between rooms in a map.
 */
export default class TraversalGraph{
  #map: RoomMap;
  #initialized: boolean;
  #costs: CostMap;

  /**
   * Initializes a graph.
   * @param map The map to be represented.
   */
  constructor(map: RoomMap){
    this.#map = map;
    this.#initialized = false;
    this.#costs = {};
  }

  /** The map represented by this graph. */
  get map(): RoomMap{
    return this.#map;
  }

  /** Whether the graph has been initialized, i.e. room cost mappings have been set. */
  get initialized(): boolean{
    return this.#initialized;
  }

  /** The cost mappings data stored in this graph. Direct access to cost data is not recommended; consider calling `costOf` instead. */
  get costs(): CostMap{
    return this.#costs;
  }

  set costs(val: CostMap){
    const validCheck = this.isCostMappingsValid(val);
    this.#costs = val;
    this.#initialized = validCheck.valid;
  }

  /**
   * Gets the cost of travelling from a link to another through a room.
   * @param room The room to be traversed.
   * @param enterFrom The link that enters the room.
   * @param exitTo The destination link that leaves the room.
   * @returns The precomputed cost of travelling from `enterFrom` to `exitTo` through `room`.
   */
  public costOf(room: Room, enterFrom: Link, exitTo: Link): number{
    if(!this.#initialized){
      throw new Error("Graph is not initialized");
    }

    const roomMap = this.#costs[room.id];
    if(roomMap === undefined){
      throw new Error(`Room '${room.id}' not in graph`);
    }

    const inLinkMap = roomMap[enterFrom.id];
    if(inLinkMap === undefined){
      throw new Error(`Link '${enterFrom.id}' not connected to room '${room.id}'`);
    }

    const cost = inLinkMap[exitTo.id];
    if(cost === undefined){
      throw new Error(`Link '${exitTo.id}' unreachable from link '${enterFrom.id}' in room '${room.id}'`);
    }

    return cost;
  }

  /**
   * Calculate the costs of travelling between each link in each room.
   * @param pather The pathfinding module to use to compute the costs.
   */
  public computeCosts(pather: Pathfinder){
    // Reset the current cost map
    this.#costs = {};

    for(const room of this.#map.rooms.values()){
      this.#costs[room.id] = {};

      const inLinks = this.#map.linksTo(room);
      const outLinks = this.#map.linksFrom(room);
      
      // Pair each incoming links to each outgoing links
      for(const inLink of inLinks){
        this.#costs[room.id]![inLink.id] = {};

        for(const outLink of outLinks){
          if(inLink.id === outLink.id){
            continue;
          }

          const inPoint = inLink.exits.filter(p => p.room.id === room.id)[0];
          const outPoint = outLink.entrances.filter(p => p.room.id === room.id)[0];

          const pathResult = pather.roomPointToPoint(room, inPoint.point, outPoint.point);
          const cost = pathResult.success ? pathResult.cost : Infinity;

          this.#costs[room.id]![inLink.id]![outLink.id] = cost;
        }
      }
    }

    this.#initialized = true;
  }

  /**
   * Checks if a given cost mapping is valid for the traversal graph.
   * @param costs A mapping for the costs of each edge.
   * @returns Whether `costs` is valid for this graph, i.e. there exists an entry for each inter-link path inside each room.
   */
  private isCostMappingsValid(costs: CostMap): {
    valid: true
  } | {
    valid: false,
    reason: string,
  }{
    for(const room of this.#map.rooms.values()){
      const roomMapping = costs[room.id];
      if(roomMapping === undefined){
        return { valid: false, reason: `Mapping for room '${room.id}' not found` };
      }

      for(const inLink of this.#map.linksTo(room)){
        const inLinkMapping = roomMapping[inLink.id];
        if(inLinkMapping === undefined){
          return { valid: false, reason: `Mapping for incoming link '${room.id}.${inLink.id}' not found` };
        }

        for(const outLink of this.#map.linksFrom(room)){
          if(inLinkMapping[outLink.id] === undefined && inLink.id !== outLink.id){
            return { valid: false, reason: `Mapping for outgoing link '${room.id}.${inLink.id}.${outLink.id}' not found` };
          }
        }
      }
    }

    return { valid: true };
  }
}