import Pathfinder, { LinkDirection, NeighborStrategy, PathfindingConfig, PathResult } from "./pathfinder";
import { Vec2Like, Vec2, Distance } from "@/math";
import Room from "@/mapping/room";
import PriorityQueue from "js-priority-queue";
import { TraversalGraph } from "./traversal-graph";
import Link from "@/mapping/link";
import RoomPoint from "@/mapping/room-point";

/**
 * Encapsulates an instance of pathfinder that uses the A* algorithm.
 */
export class AstarPathfinder extends Pathfinder{
  #conf: PathfindingConfig;

  #openLinkSet: PriorityQueue<AstarNode<LinkDirection>>;
  #checkLinkSet: Map<Link, AstarNode<LinkDirection>>;
  #closedLinkSet: Set<Link>;

  #openNodeSet: PriorityQueue<AstarNode<Vec2Like>>;
  #checkNodeSet: Set<AstarNode<Vec2Like>>;
  #closedNodeSet: Set<AstarNode<Vec2Like>>;
  
  constructor(conf?: PathfindingConfig){
    super();

    this.#conf = conf ?? {};
    this.#conf.roomGridCellSize ??= 1;
    this.#conf.cellNeighborStrategy ??= "8-way";
    this.#conf.distanceMode ??= "octile";
    this.#conf.turnPenalty ??= 0;
    this.#conf.crossCorners ??= false;
    this.#conf.autoComputeGraphCosts ??= false;
    this.#conf.autoSimplifyPath ??= true;

    // The open-set is a priority queue that sorts nodes based on the f-cost, which is the estimation of the optimal cost of a path
    // that passes through the node. We sort them such that nodes with the smallest f-cost gets processed first
    this.#openNodeSet = new PriorityQueue({
      comparator: (a, b) => {
        let comp = a.fCost - b.fCost;
        if(comp === 0){
          comp = a.hCost - b.hCost;
        }
        return comp;
      }
    });
    this.#openLinkSet = new PriorityQueue({
      comparator: (a, b) => {
        let comp = a.fCost - b.fCost;
        if(comp === 0){
          comp = a.hCost - b.hCost;
        }
        return comp;
      }
    });

    this.#checkNodeSet = new Set();
    this.#closedNodeSet = new Set();

    this.#checkLinkSet = new Map();
    this.#closedLinkSet = new Set();
  }

  public mapPointToRoom(graph: TraversalGraph, src: Vec2Like, dest: Room, conf?: PathfindingConfig): PathResult<RoomPoint>{
    if(!graph.initialized){
      if(conf?.autoComputeGraphCosts ?? this.#conf.autoComputeGraphCosts!){
        graph.computeCosts(this, conf);
      }else{
        throw new Error("Graph is not initialized");
      }
    }

    if(!graph.map.rooms.has(dest.id)){
      throw new Error("Destination room is not part of the map");
    }
    
    const roomSrc = graph.map.pointToRoom(src);
    if(roomSrc === null){
      throw new Error("Origin point is outside of any room in the map");
    }

    // No search is required if the origin point is located in the destination room
    if(roomSrc === dest){
      return { nodesVisited: 0, success: true, path: [], cost: 0 };
    }

    // Compute the coarse global path first as a sequence of links
    const linkPathResult = this.mapRoomToRoom(graph, roomSrc, dest, conf);
    if(!linkPathResult.success){
      return { nodesVisited: linkPathResult.nodesVisited, success: false };
    }

    // For each room to be traversed in between links, compute the in-room path
    const path: RoomPoint[] = [];
    let nodesVisited = linkPathResult.nodesVisited;
    let cost = 0;
    let startPoint = {
      room: roomSrc,
      point: src,
    };

    for(const { entrance, exit } of linkPathResult.path){
      const currentPath = this.roomPointToPoint(startPoint.room, startPoint.point, entrance.point, conf);

      // This block should never be entered if the map graph is initialized correctly
      if(!currentPath.success){
        return { nodesVisited, success: false };
      }

      path.push(...currentPath.path, entrance, exit);
      nodesVisited += currentPath.nodesVisited;
      cost += currentPath.cost;

      startPoint = exit;
    }

    return { nodesVisited, success: true, path, cost };
  }

  public mapPointToPoint(graph: TraversalGraph, src: Vec2Like, dest: Vec2Like, conf?: PathfindingConfig): PathResult<RoomPoint>{
    if(!graph.initialized){
      if(conf?.autoComputeGraphCosts ?? this.#conf.autoComputeGraphCosts!){
        graph.computeCosts(this, conf);
      }else{
        throw new Error("Graph is not initialized");
      }
    }

    const roomSrc = graph.map.pointToRoom(src);
    const roomDest = graph.map.pointToRoom(dest);

    if(roomSrc === null){
      throw new Error("Origin point is outside of any room in the map");
    }
    if(roomDest === null){
      throw new Error("Destination point is outside of any room in the map");
    }

    // Search can be simplified if both points are located in the same room
    if(roomSrc === roomDest){
      return this.roomPointToPoint(roomSrc, src, dest, conf);
    }

    // Compute the global path to the room first
    const mapPathResult = this.mapPointToRoom(graph, src, roomDest, conf);
    if(!mapPathResult.success){
      return { nodesVisited: mapPathResult.nodesVisited, success: false };
    }

    const roomPathResult = this.roomPointToPoint(roomDest, mapPathResult.path[mapPathResult.path.length - 1].point, dest, conf);
    if(!roomPathResult.success){
      return { nodesVisited: mapPathResult.nodesVisited + roomPathResult.nodesVisited, success: false };
    }

    // Append with the remaining path inside the destination room
    const path = mapPathResult.path;
    path.push(...roomPathResult.path);

    return {
      nodesVisited: mapPathResult.nodesVisited + roomPathResult.nodesVisited,
      success: true,
      cost: mapPathResult.cost + roomPathResult.cost,
      path,
    };
  }

  public mapRoomToRoom(graph: TraversalGraph, src: Room, dest: Room, conf?: PathfindingConfig): PathResult<LinkDirection>{
    if(!graph.initialized){
      if(conf?.autoComputeGraphCosts ?? this.#conf.autoComputeGraphCosts!){
        graph.computeCosts(this, conf);
      }else{
        throw new Error("Graph is not initialized");
      }
    }

    if(!graph.map.rooms.has(src.id)){
      throw new Error("Origin room is not in the map");
    }
    if(!graph.map.rooms.has(dest.id)){
      throw new Error("Destination room is not in the map");
    }

    // No links should be traversed if we're already in the destination room
    if(src.id === dest.id){
      return { nodesVisited: 0, success: true, path: [], cost: 0 };
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

    // Initialization
    let nodesVisited = 0;
    let lastLink: AstarNode<LinkDirection> | null = null;

    this.#openLinkSet.clear();
    this.#checkLinkSet.clear();
    this.#closedLinkSet.clear();

    // Add links directly accessible from the starting room
    for(const link of graph.map.linksFrom(src)){
      const entrance = link.entrances.find(p => p.room.id === src.id)!;
      const exit = link.exits.find(p => p.room.id !== entrance.room.id)!;

      const node = new AstarNode<LinkDirection>(entrance.point, { link, entrance, exit });
      node.hCost = link.cost + distFunc(exit.point, dest.centroid);

      this.#openLinkSet.queue(node);
    }

    // Keep looping until no more links are available
    while(this.#openLinkSet.length > 0){
      const current = this.#openLinkSet.dequeue();
      const { link, exit } = current.data;
      this.#closedLinkSet.add(link);

      nodesVisited++;

      // Bail if we have reached the end room and begin path retracing
      if(exit.room.id === dest.id){
        lastLink = current;
        break;
      }

      // Determine neighboring links, which are links accessible from the current room
      const neighbors = graph.map.linksFrom(exit.room);

      for(const nextLink of neighbors){
        if(this.#closedLinkSet.has(nextLink)){
          continue;
        }
        const nextEntrance = nextLink.entrances.find(p => p.room.id === exit.room.id)!;
        const nextExit = nextLink.exits.find(p => p.room.id !== nextEntrance?.room.id)!;

        // Calculate g-cost for the link and override if the neighbor link has a greater g-cost
        const currGCost = current.gCost + graph.costOf(exit.room, link, nextLink);
        let neighborNode = this.#checkLinkSet.get(nextLink);

        if(!neighborNode || currGCost < neighborNode.gCost && currGCost !== Infinity){
          if(!neighborNode){
            neighborNode = new AstarNode(nextEntrance.point, {
              link: nextLink,
              entrance: nextEntrance,
              exit: nextExit,
            });
          }
          
          neighborNode.parent = current;
          neighborNode.gCost = currGCost;
          neighborNode.hCost = nextLink.cost + distFunc(nextExit.point, dest.centroid);

          // Consider the link for evaluation
          if(!this.#checkLinkSet.has(nextLink)){
            this.#openLinkSet.queue(neighborNode);
            this.#checkLinkSet.set(nextLink, neighborNode);
          }
        }
      }
    }
    
    // Retrace path from the resulting search tree
    if(lastLink !== null){
      const path: AstarNode<LinkDirection>[] = [];
      let current: AstarNode<LinkDirection> | null = lastLink;

      while(current !== null){
        path.push(current);
        current = current.parent;
      }

      return { nodesVisited, success: true, path: path.reverse().map(n => n.data), cost: lastLink.fCost };
    }

    // No path is found
    return { nodesVisited, success: false };
  }

  public roomPointToPoint(room: Room, src: Vec2Like, dest: Vec2Like, conf?: PathfindingConfig): PathResult<RoomPoint>{
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
    
    const startNode = roomGrid.worldToNode(src, true);
    const endNode = roomGrid.worldToNode(dest, true);
    
    // Validation
    if(startNode === null){
      const startPos = roomGrid.worldToCell(src);
      throw new Error(`A* path search failed (start position (${src.x}, ${src.y}) [${startPos.x}, ${startPos.y}] is outside of the room)`);
    }
    if(endNode === null){
      const endPos = roomGrid.worldToCell(dest);
      throw new Error(`A* path search failed (end position (${dest.x}, ${dest.y}) [${endPos.x}, ${endPos.y}] is outside of the room)`);
    }
    
    // Initialization
    let nodesVisited = 0;
    let success = false;
    
    this.#openNodeSet.clear();
    this.#checkNodeSet.clear();
    this.#closedNodeSet.clear();
    
    this.#openNodeSet.queue(startNode);
    
    // Keep looping until no more nodes are available
    while(this.#openNodeSet.length > 0){
      const current = this.#openNodeSet.dequeue();
      this.#closedNodeSet.add(current);

      nodesVisited++;

      // Bail if we have reached the end node and begin path retracing
      if(current === endNode){
        success = true;
        break;
      }

      // Determine neighbors of the current node using the neighbor strategy, defaults to 8-way
      const neighbors = roomGrid.neighborsOf(
        current,
        conf?.cellNeighborStrategy ?? this.#conf.cellNeighborStrategy!,
        conf?.crossCorners ?? this.#conf.crossCorners!
      );
      
      for(const neighbor of neighbors){
        if(this.#closedNodeSet.has(neighbor)){
          continue;
        }

        // Calculate the g-cost and overwrite if the current value is better than the old one
        const currGCost = current.gCost + distFunc(current.data, neighbor.data);
        if(!this.#checkNodeSet.has(neighbor) || currGCost < neighbor.gCost){
          neighbor.parent = current;
          neighbor.gCost = currGCost;
          neighbor.hCost = distFunc(neighbor.data, endNode.data);

          // If turning point penalty is nonzero, add the penalty to the node's h-cost
          const turnPenalty = conf?.turnPenalty ?? this.#conf.turnPenalty!;
          if(turnPenalty !== 0 && neighbor.parent.parent){
            const oldDir = neighbor.parent.pos.sub(neighbor.parent.parent.pos);
            const newDir = neighbor.pos.sub(neighbor.parent.pos);

            if(!oldDir.equals(newDir)){
              neighbor.hCost += turnPenalty;
            }
          }

          // Consider this node for evaluation
          if(!this.#checkNodeSet.has(neighbor)){
            this.#openNodeSet.queue(neighbor);
            this.#checkNodeSet.add(neighbor);
          }
        }
      }
    }

    // Retrace path from the resulting search tree
    if(success){
      let path: AstarNode<Vec2Like>[] = [];
      let current: AstarNode<Vec2Like> | null = endNode;

      while(current !== null){
        path.push(current);
        current = current.parent;
      }

      path.reverse();
      let finalPath: Vec2Like[];
      if(conf?.autoSimplifyPath ?? this.#conf.autoSimplifyPath!){
        finalPath = this.simplifyPath(path);
      }else{
        finalPath = path.map(p => p.data);
      }
      return { nodesVisited, success: true, path: finalPath.map(p => ({ point: p, room })), cost: endNode.fCost };
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
  private simplifyPath(path: AstarNode<Vec2Like>[]): Vec2Like[]{
    if(path.length === 0){
      return [];
    }
    if(path.length === 1){
      return [path[0].data];
    }

    const pathSimple: Vec2Like[] = [];
    let currDir = Vec2.zero;

    // If the direction between each pair differs from the previous pair, add its first node (the turning point) to the simplified path
    for(let i = 1; i < path.length; i++){
      const newDir = Vec2.fromVec2Like(path[i - 1].data).sub(path[i].data);
      
      if(!currDir.equals(newDir)){
        pathSimple.push(path[i - 1].data);
      }
      currDir = newDir;
    }

    pathSimple.push(path[path.length - 1].data);
    return pathSimple.map(v => { return { x: v.x, y: v.y }; });
  }
}

/**
 * Represents a node in a search tree.
 */
class AstarNode<T>{
  #pos: Vec2;
  #data: T;

  constructor(pos: Vec2Like, data: T){
    this.#pos = Vec2.fromVec2Like(pos);
    this.#data = data;

    this.parent = null;
    this.gCost = 0;
    this.hCost = 0;
  }

  /** The precedence of this node in the search tree. Primarily used for path retracing. */
  parent: AstarNode<T> | null;
  /** The path cost from this node to the root (start) node. */
  gCost: number;
  /** The estimated (heuristic) cost from this node to the end node. */
  hCost: number;

  /** The world space position associated with this node. */
  get pos(): Vec2{
    return this.#pos;
  }

  /** The data attached to this node. */
  get data(): T{
    return this.#data;
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
  #nodes: (AstarNode<Vec2Like> | null)[][];
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
        const worldPos = grid.cellToWorld({ x, y });
        if(room.isPointInside(worldPos)){
          grid.#nodes[x][y] = new AstarNode({ x, y }, worldPos);
        }
      }
    }

    return grid;
  }
  
  /**
   * Gets the node at a world position.
   * @param pos The world position.
   * @param withTolerance Whether to use 1-cell tolerance.
   * @returns The corresponding node at `pos`.
   */
  worldToNode(pos: Vec2Like, withTolerance: boolean = false): AstarNode<Vec2Like> | null{
    const cell = this.worldToCell(pos);
    return this.cellToNode(cell, withTolerance);
  }

  /**
   * Gets the node at a cell position.
   * @param cell The grid space position.
   * @param withTolerance Whether to use 1-cell tolerance.
   * @returns The corresponding node at `cell`.
   */
  cellToNode(cell: Vec2Like, withTolerance: boolean = false): AstarNode<Vec2Like> | null{
    if(
      0 <= cell.x && cell.x < this.#gridDim.x
      && 0 <= cell.y && cell.y < this.#gridDim.y
    ){
      const found = this.#nodes[cell.x][cell.y];
      if(found !== null){
        return this.#nodes[cell.x][cell.y];
      }
    }

    if(!withTolerance){
      return null;
    }

    // Apply a 1-cell tolerance
    const candidates = [];
    for(let dx = -1; dx <= 1; dx++){
      for(let dy = -1; dy <= 1; dy++){
        if(dx === 0 && dy === 0){
          continue;
        }

        const x2 = cell.x + dx;
        const y2 = cell.y + dy;

        if(0 <= x2 && x2 < this.#gridDim.x && 0 <= y2 && y2 < this.#gridDim.y){
          const neighbor = this.#nodes[cell.x + dx][cell.y + dy];
          if(neighbor !== null){
            candidates.push(neighbor);
          }
        }
      }
    }

    if(candidates.length > 0){
      candidates.sort((a, b) => a.pos.sub(cell).sqrMagnitude - b.pos.sub(cell).sqrMagnitude);
      return candidates[0];
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
   * @param crossCorners Whether crossing obstacle corners is allowed.
   * @returns An array of nodes neighboring `node`.
   */
  neighborsOf(node: AstarNode<Vec2Like>, neighborStrategy: NeighborStrategy, crossCorners: boolean): AstarNode<Vec2Like>[]{
    const cell = this.worldToCell(node.data);
    const neighbors: AstarNode<Vec2Like>[] = [];

    let nextNeighbor: AstarNode<Vec2Like> | null;
    switch(neighborStrategy){
      case "8-way":
        for(let dx = -1; dx <= 1; dx += 2){
          for(let dy = -1; dy <= 1; dy += 2){
            nextNeighbor = this.cellToNode({ x: cell.x + dx, y: cell.y + dy });
            if(nextNeighbor === null){
              continue;
            }

            // Check corners if crossing them is not allowed
            if(!crossCorners){
              const corner1 = this.cellToNode({ x: cell.x + dx, y: cell.y });
              if(corner1 === null){
                continue;
              }
              const corner2 = this.cellToNode({ x: cell.x, y: cell.y + dy });
              if(corner2 === null){
                continue;
              }
            }

            neighbors.push(nextNeighbor);
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