import { Vec2 } from "@/math";
import Link from "./link";
import Room from "./room";
import Rect from "@/math/rect";

/**
 * Represents a space consisting of rooms that can be navigated through.
 */
export default class RoomMap{
  #rooms: Map<string, Room>;
  #links: Map<string, Link>;
  #roomLinkMapping: Map<string, string[]>;
  #boundary: Rect;

  /**
   * Creates a room map from a list of rooms and the links in between.
   * @param rooms A collection of rooms.
   * @param links Links connecting the rooms.
   */
  public constructor(rooms: Room[], links: Link[]){
    this.#rooms = new Map<string, Room>();
    this.#links = new Map<string, Link>();
    this.#roomLinkMapping = new Map<string, string[]>();

    // Determine boundary limits
    let left = Infinity, right = -Infinity, bottom = Infinity, top = -Infinity;
    
    // Add rooms to the map
    for(const room of rooms){
      if(this.#rooms.has(room.id)){
        throw new Error(`Room map is invalid (duplicate room ID: '${room.id}')`);
      }
      
      this.#rooms.set(room.id, room);
      this.#roomLinkMapping.set(room.id, []);

      // Update boundary limits
      left = Math.min(left, room.boundary.left);
      right = Math.max(right, room.boundary.right);
      bottom = Math.min(bottom, room.boundary.bottom);
      top = Math.max(top, room.boundary.top);
    }

    // Set the map bounding box
    this.#boundary = new Rect({ x: left, y: bottom }, { x: right, y: top });
    
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
        
        this.#roomLinkMapping.get(entranceId)!.push(link.id);
      }
      
      // Validate link exits
      for(const exitId of link.exits.map(p => p.room.id)){
        if(!this.#rooms.has(exitId)){
          throw new Error(`Room map is invalid (link '${link.id}' has an exit with unknown room ID '${exitId}')`);
        }
      }

      this.#links.set(link.id, link);
    }
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
  public get roomLinkMapping(): Map<string, string[]>{
    return new Map(this.#roomLinkMapping);
  }

  /**
   * Determines what rooms can be accessed directly from a room.
   * @param room The origin room.
   * @returns A list containing all the rooms that can be traversed to directly from `room` via a link.
   */
  public neighborsOf(room: Room): Room[]{
    if(!this.#rooms.has(room.id)){
      throw new Error(`Room '${room.id}' is not part of this map`);
    }

    // Evaluate which rooms can be entered via direct link from this room
    return this.#roomLinkMapping.get(room.id)!
      .map(linkId => this.#links.get(linkId)!)
      .flatMap(link => link.exits.map(p => p.room));
  }

  /**
   * Maps a point on 2D space to a corresponding room in the map.
   * @param point The point to map.
   * @returns The room that the position at `point` is associated with, or `null` if the point is not inside any room.
   */
  public pointToRoom(point: Vec2): Room | null{
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