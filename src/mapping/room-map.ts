import { Vec2Like } from "../math";
import { Room } from ".";
import { Rect } from "../math";
import { Link } from "./link";
import { Serializable } from "../util";

/**
 * Represents a space consisting of rooms that can be navigated through.
 */
export class RoomMap implements Serializable{
  #rooms: Map<string, Room>;
  #links: Map<string, Link>;
  #roomLinkEntranceMapping: Map<string, string[]>;
  #roomLinkExitMapping: Map<string, string[]>;
  #boundary: Rect;

  /**
   * Creates a room map from a list of rooms and the links in between.
   * @param rooms A collection of rooms.
   * @param links Links connecting the rooms.
   */
  public constructor(rooms: Room[], links: Link[]){
    this.#rooms = new Map();
    this.#links = new Map();
    this.#roomLinkEntranceMapping = new Map();
    this.#roomLinkExitMapping = new Map();

    // Determine boundary limits
    let left = Infinity, right = -Infinity, bottom = Infinity, top = -Infinity;
    
    // Add rooms to the map
    for(const room of rooms){
      if(this.#rooms.has(room.id)){
        throw new Error(`Room map is invalid (duplicate room ID: '${room.id}')`);
      }
      
      this.#rooms.set(room.id, room);
      this.#roomLinkEntranceMapping.set(room.id, []);
      this.#roomLinkExitMapping.set(room.id, []);

      // Update boundary limits
      left = Math.min(left, room.boundary.left);
      right = Math.max(right, room.boundary.right);
      bottom = Math.min(bottom, room.boundary.bottom);
      top = Math.max(top, room.boundary.top);
    }

    // Set the map bounding box
    this.#boundary = Rect.fromCorners({ x: left, y: bottom }, { x: right, y: top });
    
    // Add links to the map
    for(const link of links){
      if(this.#links.has(link.id)){
        throw new Error(`Room map is invalid (duplicate link ID: '${link.id}')`);
      }

      // Update room link mapping
      for(const entranceId of link.entrances.map(p => p.room.id)){
        if(!this.#rooms.has(entranceId)){
          throw new Error(`Room map is invalid (link '${link.id}' has an entrance with unknown room ID '${entranceId}')`);
        }
        
        this.#roomLinkEntranceMapping.get(entranceId)!.push(link.id);
      }
      
      // Validate link exits
      for(const exitId of link.exits.map(p => p.room.id)){
        if(!this.#rooms.has(exitId)){
          throw new Error(`Room map is invalid (link '${link.id}' has an exit with unknown room ID '${exitId}')`);
        }

        this.#roomLinkExitMapping.get(exitId)!.push(link.id);
      }

      this.#links.set(link.id, link);
    }
  }

  /**
   * Attempts to deserializes a JSON object into an instance of this class.
   * @param obj The serialized object.
   * @returns The deserialized class instance.
   */
  public static fromJSON(obj: Record<string, any>): RoomMap{
    const rooms = (obj.rooms as Record<string, any>[]).map(o => Room.fromJSON(o));
    const links = (obj.links as Record<string, any>[]).map(o => Link.fromJSON(o));
    return new RoomMap(rooms, links);
  }

  public toJSON(): Record<string, unknown>{
    return {
      rooms: [...this.#rooms.values()].map(r => r.toJSON()),
      links: [...this.#links.values()].map(l => l.toJSON()),
    };
  }

  /**
   * The rooms contained in the map.
   */
  public get rooms(): Map<string, Room>{
    return new Map(this.#rooms);
  }

  /**
   * The links that connect rooms in the map.
   */
  public get links(): Map<string, Link>{
    return new Map(this.#links);
  }

  /**
   * The mapping between each room and the links enterable from the room.
   */
  public get roomLinkEntranceMapping(): Map<string, string[]>{
    return new Map(this.#roomLinkEntranceMapping);
  }
  
  /**
   * Retrieves all links that can be entered from a room.
   * @param room The origin room.
   * @returns A list containing all the links that can be traversed directly from `room`.
   */
  public linksFrom(room: Room): Link[]{
    if(!this.#rooms.has(room.id)){
      throw new Error(`Room '${room.id}' is not part of this map`);
    }
    
    // Look up links connected from this room
    return this.#roomLinkEntranceMapping.get(room.id)!
      .map(linkId => this.#links.get(linkId)!);
  }

  /**
   * Retrieves all links that leads to a room.
   * @param room The destination room.
   * @returns A list containing all the links that exit to `room`.
   */
  public linksTo(room: Room): Link[]{
    if(!this.#rooms.has(room.id)){
      throw new Error(`Room '${room.id}' is not part of this map`);
    }

    // Look up links connected to this room
    return this.#roomLinkExitMapping.get(room.id)!
      .map(linkId => this.#links.get(linkId)!);
  }

  /**
   * Determines what rooms can be accessed directly from a room.
   * @param room The origin room.
   * @returns A list containing all the rooms that is connected via at least one link to `room`.
   */
  public neighborsOf(room: Room): Room[]{
    if(!this.#rooms.has(room.id)){
      throw new Error(`Room '${room.id}' is not part of this map`);
    }

    // Evaluate which rooms can be entered via direct link from this room
    return this.linksFrom(room)
      .flatMap(link => link.exits.map(p => p.room));
  }
  
  /**
   * Maps a point on 2D space to a corresponding room in the map.
   * @param point The point to map.
   * @returns The room that the position at `point` is associated with, or `null` if the point is not inside any room.
   */
  public pointToRoom(point: Vec2Like): Room | null{
    // Do not bother searching if the point lies outside the bounding box of the map
    if(!this.#boundary.isWithin(point)){
      return null;
    }

    for(const room of this.#rooms.values()){
      // Check first if the point lies inside the room's bounding box
      // before performing the possibly more expensive room-specific check
      if(room.boundary.isWithin(point) && room.isPointInside(point)){
        return room;
      }
    }

    return null;
  }
}