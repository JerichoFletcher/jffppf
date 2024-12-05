import { Vec2, Lines, Vec2Like, Rect } from "@/math";
import { Room } from ".";

/**
 * Represents a polygonal room.
 */
export class PolygonRoom extends Room{
  #vertices: Vec2[];
  #boundary: Rect;
  #isConvex: boolean;

  /**
   * Constructs a room representation from a vertex list.
   * @param vertices The vertices (i.e. corners) of the room.
   * @param id The identifier of the room.
   */
  public constructor(vertices: Vec2Like[], id?: string){
    // Check first if there are enough vertices for a valid polygon
    if(vertices.length < 3){
      throw new Error("Polygonal room shape is invalid (not enough vertices)");
    }

    super(id);
    
    this.#vertices = [...vertices.map(v => Vec2.fromVec2Like(v))];
    this.#isConvex = true;

    // Determine convexity and winding order, as well as boundary limits
    let orientationSign = 0, convexityCheck = true;
    let gaussArea = 0;
    let left = Infinity, right = -Infinity, bottom = Infinity, top = -Infinity;

    for(let i = 0; i < this.#vertices.length; i++){
      // Consider the next two edges of the polygon
      const p1 = this.#vertices[i];
      const p2 = this.#vertices[(i + 1) % this.#vertices.length];
      const p3 = this.#vertices[(i + 2) % this.#vertices.length];
      
      // Update boundary limits
      left = Math.min(left, p1.x);
      right = Math.max(right, p1.x);
      bottom = Math.min(bottom, p1.y);
      top = Math.max(top, p1.y);

      // Check if the segment intersects another segment of the polygon
      for(let j = i + 2; j < this.#vertices.length; j++){
        // Skip pairing the first and last edge since they neighbor each other
        if(i === 0 && j === this.#vertices.length - 1)continue;

        // The polygon is invalid if it self intersects
        const q1 = this.#vertices[j];
        const q2 = this.#vertices[(j + 1) % this.#vertices.length];
        if(Lines.segmentsIntersect(p1, p2, q1, q2)){
          throw new Error("Polygonal room shape is invalid (self-intersection present)");
        }
      }

      // Compute the signed area of the segment
      const segmentGaussArea = p1.cross(p2);
      gaussArea += segmentGaussArea;

      // Perform a convexity check if the convexity has not been determined yet
      if(!convexityCheck){
        continue;
      }

      // Compute the orientation between the edges
      const segmentOrientation = Lines.orientation(p1, p2, p3);

      // If the two edges are not collinear...
      if(segmentOrientation !== 0){
        const localCrossSign = Math.sign(segmentOrientation);
        
        if(orientationSign === 0){
          // If this is the first non-collinear edge pair, set the reference sign to the sign of the current cross product
          orientationSign = localCrossSign;

        }else if(orientationSign !== localCrossSign){
          // If the signs don't match, the polygon is concave at the point p2, so the check can be stopped
          this.#isConvex = false;
          convexityCheck = false;
        }
      }
    }
    
    // If the signed area of the polygon is zero, the polygon is invalid
    if(gaussArea === 0){
      throw new Error("Polygonal room shape is invalid (signed area is zero)");
    }
    
    // If the signed area is negative, the vertices are ordered clockwise; transform the order to counterclockwise
    if(gaussArea < 0){
      this.#vertices.reverse();
    }

    // Set the polygon bounding box
    this.#boundary = Rect.fromCorners({ x: left, y: bottom }, { x: right, y: top });
  }

  /**
   * Attempts to deserializes a JSON object into an instance of this class.
   * @param obj The serialized object.
   * @returns The deserialized class instance.
   */
  public static fromJSON(obj: Record<string, any>): PolygonRoom{
    if(obj.type !== "poly")throw new Error("Room type is not 'poly'");
    const vertices = (obj.vertices as Record<string, any>[]).map(o => Vec2.fromJSON(o));
    return new PolygonRoom(vertices, obj.id);
  }

  public toJSON(): Record<string, unknown>{
    const obj = super.toJSON();
    obj.type = "poly";
    obj.vertices = this.#vertices.map(v => v.toJSON());
    return obj;
  }
  
  public get centroid(): Vec2{
    return this.#boundary.center;
  }

  public get boundary(): Rect{
    return this.#boundary;
  }
  
  public get isConvex(): boolean{
    return this.#isConvex;
  }

  /**
   * Gets the coordinate of a vertex of the room representation polygon.
   * @param index The index that points to the vertex.
   * @returns A copy of the vertex.
  */
  public getVertex(index: number): Vec2{
    // To prevent modification, return a copy of the point instead
    const temp = this.#vertices[index];
    return new Vec2(temp.x, temp.y);
  }
  
  /**
   * How many vertices there are in the room representation polygon.
  */
  public get vertexCount(): number{
    return this.#vertices.length;
  }

  public isPointInside(point: Vec2Like): boolean{
    if(this.#isConvex){
      // If the room polygon is convex, use half-plane checks
      for(let i = 0; i < this.#vertices.length; i++){
        const p1 = this.#vertices[i];
        const p2 = this.#vertices[(i + 1) % this.#vertices.length];
  
        // If the point along with p1 and p2 are in a clockwise orientation, the point is outside the polygon
        if(Lines.orientation(point, p1, p2) < 0){
          return false;
        }
      }
  
      // The point lies inside the polygon since it passes all checks against every vertex
      return true;
    }else{
      // If the room polygon is concave, use the winding number method
      let windingAngle = 0;
  
      for(let i = 0; i < this.#vertices.length; i++){
        const p1 = this.#vertices[i];
        const p2 = this.#vertices[(i + 1) % this.#vertices.length];
        
        // If the point lies on the edge between p1 and p2, the point is considered inside
        if(Lines.liesOnSegment(point, p1, p2)){
          return true;
        }
        
        // Create two vectors:
        // v1 goes from the point to p1
        // v2 goes from the point to p2
        const v1 = p1.sub(point);
        const v2 = p2.sub(point);
  
        // Add the angle between v1 and v2 to the cumulative winding angle
        const theta = v1.angleTo(v2);
        windingAngle += theta;
      }
      
      // The point is inside the polygon if the winding number is 1
      return Math.floor(windingAngle / (2 * Math.PI)) === 1;
    }
  }
}