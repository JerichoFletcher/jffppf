import { DistanceFunction } from "@/math/distance";
import Pathfinder, { PathResult } from "./pathfinder";
import RoomMap from "@/mapping/room-map";
import { Vec2Like, Vec2, Distance } from "@/math";
import Room from "@/mapping/room";
import PriorityQueue from "js-priority-queue";

/** How to determine the neighbors of each cell in room grids. */
export type NeighborStrategy = "4-way" | "8-way";
/** How to compute the distance between two points. */
export type DistanceMode = "manhattan" | "octile" | "euclidean" | DistanceFunction;

/**
 * Parameters and configurations for pathfinding using the A* algorithm.
 */
export interface AstarPathfindingConfig{
  /** The size (width and height) of each cell in room grids. Smaller values lead to finer-grained in-room pathing, at the cost of heavier workload. */
  roomGridCellSize?: number;
  /** How to determine the neighbors of each cell in room grids. */
  neighborStrategy?: NeighborStrategy;
  /** How to compute distances between points in the map. May accept a custom distance function. */
  distanceMode?: DistanceMode;
  /** The penalty for each turning point in the path. Values greater than 0 favors paths with fewer turns. */
  turnPenalty?: number;
}

/**
 * Encapsulates an instance of pathfinder that uses the A* algorithm.
 */
export class AstarPathfinder extends Pathfinder{
  #conf: AstarPathfindingConfig;
  #openSet: PriorityQueue<AstarNode>;
  #checkSet: Set<AstarNode>;
  #closedSet: Set<AstarNode>;
  
  constructor(conf?: AstarPathfindingConfig){
    super();

    this.#conf = conf ?? {};
    this.#conf.roomGridCellSize ??= 1;
    this.#conf.neighborStrategy ??= "8-way";
    this.#conf.distanceMode ??= "octile";
    this.#conf.turnPenalty ??= 0;

    // The open-set is a priority queue that sorts nodes based on the f-cost, which is the estimation of the optimal cost of a path
    // that passes through the node. We sort them such that nodes with the smallest f-cost gets processed first
    this.#openSet = new PriorityQueue<AstarNode>({
      comparator: (a, b) => {
        let comp = a.fCost - b.fCost;
        if(comp === 0){
          comp = a.hCost - b.hCost;
        }
        return comp;
      }
    });

    this.#checkSet = new Set<AstarNode>();
    this.#closedSet = new Set<AstarNode>();
  }

  public mapPointToRoom(map: RoomMap, src: Vec2Like, dest: Room): PathResult{
    if(!map.rooms.has(dest.id)){
      throw new Error("Destination room is not part of the map");
    }
    
    const roomStart = map.pointToRoom(src);
    if(roomStart === null){
      throw new Error("Origin point is outside of any room in the map");
    }

    // No search is required if the origin point is located in the destination room
    if(roomStart === dest){
      return { nodesVisited: 0, success: true, path: [], cost: 0 };
    }

    /// TODO: Construct a traversal graph based on the provided map and compute a path using hierarchical A*

    // No path is found
    return { nodesVisited: 0, success: false };
  }

  public mapPointToPoint(map: RoomMap, src: Vec2Like, dest: Vec2Like): PathResult{
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
      return this.roomPointToPoint(roomStart, src, dest);
    }

    /// TODO: Construct a traversal graph based on the provided map and compute a path using hierarchical A*

    // No path is found
    return { nodesVisited: 0, success: false };
  }

  public roomPointToPoint(room: Room, src: Vec2Like, dest: Vec2Like, conf?: AstarPathfindingConfig): PathResult{
    if(!room.isPointInside(src)){
      throw new Error("Origin point is outside of the room");
    }
    if(!room.isPointInside(dest)){
      throw new Error("Destination point is outside of the room");
    }

    // Determine what distance function to use
    let distFunc = conf?.distanceMode ?? this.#conf.distanceMode!;
    if(typeof distFunc === "string"){
      switch(distFunc){
        case "euclidean":
          distFunc = Distance.euclidean;
          break;
        case "manhattan":
          distFunc = Distance.manhattan;
          break;
        case "octile":
          distFunc = Distance.octile;
          break;
      }
    }

    // Determine the grid cell size to use
    const gridCellSize = conf?.roomGridCellSize ?? this.#conf.roomGridCellSize!;
    
    // Get the search grid for the room
    const roomGrid = AstarGrid.fromRoom(room, gridCellSize);
    
    const startNode = roomGrid.worldToNode(src);
    const endNode = roomGrid.worldToNode(dest);
    
    // Validation
    if(startNode === null){
      const startPos = roomGrid.worldToCell(src);
      throw new Error(`A* path search failed (start position [${startPos.x}, ${startPos.y}] is outside of the room)`);
    }
    if(endNode === null){
      const endPos = roomGrid.worldToCell(dest);
      throw new Error(`A* path search failed (end position [${endPos.x}, ${endPos.y}] is outside of the room)`);
    }
    
    // Initialization
    let nodesVisited = 0;
    let success = false;
    
    this.#openSet.clear();
    this.#checkSet.clear();
    this.#closedSet.clear();
    
    this.#openSet.queue(startNode);
    
    // Keep looping until no more nodes are available
    while(this.#openSet.length > 0){
      const current = this.#openSet.dequeue();
      this.#closedSet.add(current);

      nodesVisited++;

      // Bail if we have reached the end node and begin path retracing
      if(current === endNode){
        success = true;
        break;
      }

      // Determine neighbors of the current node using the neighbor strategy, defaults to 8-way
      const neighbors = roomGrid.neighborsOf(current, conf?.neighborStrategy ?? this.#conf.neighborStrategy!);
      
      for(const neighbor of neighbors){
        if(this.#closedSet.has(neighbor)){
          continue;
        }

        // Calculate the g-cost and overwrite if the current value is better than the old one
        const currGCost = current.gCost + distFunc(current.pos, neighbor.pos);
        if(!this.#checkSet.has(neighbor) || currGCost < neighbor.gCost){
          neighbor.parent = current;
          neighbor.gCost = currGCost;
          neighbor.hCost = distFunc(neighbor.pos, endNode.pos);

          // If turning point penalty is nonzero, add the penalty to the node's h-cost
          const turnPenalty = conf?.turnPenalty ?? this.#conf.turnPenalty!;
          if(turnPenalty !== 0 && neighbor.parent.parent){
            const oldDir = neighbor.parent.cell.sub(neighbor.parent.parent.cell);
            const newDir = neighbor.cell.sub(neighbor.parent.cell);

            if(!oldDir.equals(newDir)){
              neighbor.hCost += turnPenalty;
            }
          }

          // Consider this node for evaluation
          if(!this.#checkSet.has(neighbor)){
            this.#openSet.queue(neighbor);
            this.#checkSet.add(neighbor);
          }
        }
      }
    }

    // Retrace path from the resulting search tree
    if(success){
      const path: AstarNode[] = [];
      let current: AstarNode | null = endNode;

      while(current !== null){
        path.push(current);
        current = current.parent;
      }

      return { nodesVisited, success: true, path: this.simplifyPath(path.reverse()), cost: endNode.fCost };
    }

    // No path is found
    return { nodesVisited, success: false };
  }

  /**
   * Simplifies a result path to only include the start, end, and turning points.
   * @param path The raw path.
   * @param roomGrid The search grid of the room.
   * @returns The simplified path.
   */
  private simplifyPath(path: AstarNode[]): Vec2Like[]{
    if(path.length === 0){
      return [];
    }
    if(path.length === 1){
      return [path[0].pos];
    }

    const pathSimple: Vec2Like[] = [];
    let currDir = Vec2.zero;

    // If the direction between each pair differs from the previous pair, add its first node (the turning point) to the simplified path
    for(let i = 1; i < path.length; i++){
      const newDir = Vec2.fromVec2Like(path[i - 1].cell).sub(path[i].cell);
      
      if(!currDir.equals(newDir)){
        pathSimple.push(path[i - 1].pos);
      }
      currDir = newDir;
    }

    pathSimple.push(path[path.length - 1].pos);
    return pathSimple.map(v => { return { x: v.x, y: v.y }; });
  }
}

/**
 * Represents a node in a search tree.
 */
class AstarNode{
  #pos: Vec2;
  #cell: Vec2;

  constructor(pos: Vec2Like, cell: Vec2Like){
    this.#pos = Vec2.fromVec2Like(pos);
    this.#cell = Vec2.fromVec2Like(cell);

    this.parent = null;
    this.gCost = 0;
    this.hCost = 0;
  }

  /** The precedence of this node in the search tree. Primarily used for path retracing. */
  parent: AstarNode | null;
  /** The path cost from this node to the root (start) node. */
  gCost: number;
  /** The estimated (heuristic) cost from this node to the end node. */
  hCost: number;

  /** The world space position associated with this node. */
  get pos(): Vec2{
    return this.#pos;
  }

  /** The grid space position associated with this node. */
  get cell(): Vec2{
    return this.#cell;
  }

  /** The estimated cost of the optimal path going through this node. */
  get fCost(): number{
    return this.gCost + this.hCost;
  }
}

/**
 * Represents a grid of search nodes.
 */
class AstarGrid{
  #nodes: (AstarNode | null)[][];
  #gridDim: Vec2;
  #cellSize: number;
  #origin: Vec2;

  /**
   * Creates an A* grid.
   * @param gridDim The size of the grid, in cell count.
   * @param origin The origin point of the grid.
   * @param cellSize The world size of each cell.
   */
  constructor(gridDim: Vec2Like, origin: Vec2Like, cellSize: number){
    this.#gridDim = Vec2.fromVec2Like(gridDim);
    this.#origin = Vec2.fromVec2Like(origin);
    this.#cellSize = cellSize;

    this.#nodes = [];
    for(let x = 0; x < gridDim.x; x++){
      this.#nodes.push([]);
      for(let y = 0; y < gridDim.y; y++){
        this.#nodes[x].push(null);
      }
    }
  }

  /**
   * Creates an A* grid from a room.
   * @param room The room.
   * @param gridCellSize The desired world size of each cell in the grid.
   * @returns A grid that represents `room`.
   */
  static fromRoom(room: Room, gridCellSize: number): AstarGrid{
    const origin: Vec2Like = { x: room.boundary.left, y: room.boundary.bottom };
    const gridDim: Vec2Like = {
      x: Math.round(room.boundary.size.x / gridCellSize),
      y: Math.round(room.boundary.size.y / gridCellSize),
    };

    const grid = new AstarGrid(gridDim, origin, gridCellSize);

    // Add nodes at cells whose center point lies inside the room
    for(let x = 0; x < gridDim.x; x++){
      for(let y = 0; y < gridDim.y; y++){
        const pos = grid.cellToWorld({ x, y });
        if(room.isPointInside(pos)){
          grid.#nodes[x][y] = new AstarNode(pos, { x, y });
        }
      }
    }

    return grid;
  }
  
  /**
   * Gets the node at a world position.
   * @param pos The world position.
   * @returns The corresponding node at `pos`.
   */
  worldToNode(pos: Vec2Like): AstarNode | null{
    const cell = this.worldToCell(pos);
    return this.cellToNode(cell);
  }

  /**
   * Gets the node at a cell position.
   * @param cell The grid space position.
   * @returns The corresponding node at `cell`.
   */
  cellToNode(cell: Vec2Like): AstarNode | null{
    if(
      0 <= cell.x && cell.x < this.#gridDim.x
      && 0 <= cell.y && cell.y < this.#gridDim.y
    ){
      return this.#nodes[cell.x][cell.y];
    }

    return null;
  }

  /**
   * Converts a world space position to the corresponding grid space position.
   * @param pos The position in world space.
   * @returns The corresponding grid space position of `pos`.
   */
  worldToCell(pos: Vec2Like): Vec2Like{
    const cell = Vec2.fromVec2Like(pos)
      .sub(this.#origin)
      .scl(1 / this.#cellSize);
    return { x: Math.floor(cell.x), y: Math.floor(cell.y) };
  }

  /**
   * Gets the world space position of a grid space position.
   * @param cell The position in grid space.
   * @returns The world space position of `cell`, which corresponds to the world space center point of the cell at the specified coordinate.
   */
  cellToWorld(cell: Vec2Like): Vec2Like{
    return Vec2.fromVec2Like(cell)
      .add({ x: 0.5, y: 0.5 })
      .scl(this.#cellSize)
      .add(this.#origin);
  }

  /**
   * Finds the neighbors of a given node.
   * @param node The reference node.
   * @param neighborStrategy How to select cells as neighbors.
   * @returns An array of nodes neighboring `node`.
   */
  neighborsOf(node: AstarNode, neighborStrategy: NeighborStrategy): AstarNode[]{
    const cell = this.worldToCell(node.pos);
    const neighbors: AstarNode[] = [];

    let nextNeighbor: AstarNode | null;
    switch(neighborStrategy){
      case "8-way":
        for(let dx = -1; dx <= 1; dx += 2){
          for(let dy = -1; dy <= 1; dy += 2){
            nextNeighbor = this.cellToNode({ x: cell.x + dx, y: cell.y + dy });
            if(nextNeighbor !== null){
              neighbors.push(nextNeighbor);
            }
          }
        }

      case "4-way":
        for(let dx = -1; dx <= 1; dx += 2){
          nextNeighbor = this.cellToNode({ x: cell.x + dx, y: cell.y });
          if(nextNeighbor !== null){
            neighbors.push(nextNeighbor);
          }
        }
        for(let dy = -1; dy <= 1; dy += 2){
          nextNeighbor = this.cellToNode({ x: cell.x, y: cell.y + dy });
          if(nextNeighbor !== null){
            neighbors.push(nextNeighbor);
          }
        }
        break;
    }

    return neighbors;
  }

  /** The size of the grid in cell count. */
  get gridDim(): Vec2Like{
    return this.#gridDim;
  }
  
  /** The origin point of the grid. */
  get origin(): Vec2Like{
    return this.#origin;
  }
  
  /** The world size of each cell in the grid. */
  get cellSize(): number{
    return this.#cellSize;
  }
}