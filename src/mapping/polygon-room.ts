import { Vector2, Vec2, Lines } from "@/math";
import Room from "./room";

/**
 * Represents a polygonal room.
 */
export default class PolygonRoom extends Room{
  #vertices: Vec2[];
  #centroid: Vec2;
  #isConvex: boolean;

  /**
   * Constructs a room representation from a vertex list.
   * @param vertices The vertices (i.e. corners) of the room.
   * @param id The identifier of the room.
   */
  constructor(vertices: Vec2[], id?: string){
    // Check first if there are enough vertices for a valid polygon
    if(vertices.length < 3){
      throw new Error("Polygonal room shape is invalid (not enough vertices)");
    }

    super(id);
    
    this.#vertices = [...vertices];
    this.#centroid = { x: 0, y: 0 };
    this.#isConvex = true;

    // Determine convexity and winding order
    let orientationSign = 0, convexityCheck = true;
    let gaussArea = 0;

    for(let i = 0; i < vertices.length; i++){
      // Consider the next two edges of the polygon
      let p1 = vertices[i];
      let p2 = vertices[(i + 1) % vertices.length];
      let p3 = vertices[(i + 2) % vertices.length];
      
      // Sum up the vertex positions for centroid precalculation
      this.#centroid = Vector2.sum(this.#centroid, p1);

      // Check if the segment intersects another segment of the polygon
      for(let j = i + 2; j < vertices.length; j++){
        // Skip pairing the first and last edge since they neighbor each other
        if(i === 0 && j === vertices.length - 1)continue;

        // The polygon is invalid if it self intersects
        let q1 = vertices[j];
        let q2 = vertices[(j + 1) % vertices.length];
        if(Lines.segmentsIntersect(p1, p2, q1, q2)){
          throw new Error("Polygonal room shape is invalid (self-intersection present)");
        }
      }

      // Compute the signed area of the segment
      let segmentGaussArea = Vector2.cross(p1, p2);
      gaussArea += segmentGaussArea;

      // Perform a convexity check if the convexity has not been determined yet
      if(!convexityCheck){
        continue;
      }

      // Compute the orientation between the edges
      let segmentOrientation = Lines.orientation(p1, p2, p3);

      // If the two edges are not collinear...
      if(segmentOrientation !== 0){
        let localCrossSign = Math.sign(segmentOrientation);
        
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

    // Precompute the polygon centroid
    this.#centroid = Vector2.scl(this.#centroid, 1 / this.#vertices.length);
  }
  
  public get centroid(): Vec2{
    return this.#centroid;
  }
  
  /**
   * Gets the coordinate of a vertex of the room representation polygon.
   * @param index The index that points to the vertex.
   * @returns A copy of the vertex.
  */
  public getVertex(index: number): Vec2{
    // To prevent modification, return a copy of the point instead
    let temp = this.#vertices[index];
    return { x: temp.x, y: temp.y };
  }
  
  /**
   * How many vertices there are in the room representation polygon.
  */
  public get vertexCount(): number{
    return this.#vertices.length;
  }
  
  /**
   * Whether the room shape is convex.
  */
  public get isConvex(): boolean{
    return this.#isConvex;
  }

  public isPointInside(point: Vec2): boolean{
    if(this.#isConvex){
      // If the room polygon is convex, use half-plane checks
      for(let i = 0; i < this.#vertices.length; i++){
        let p1 = this.#vertices[i];
        let p2 = this.#vertices[(i + 1) % this.#vertices.length];
  
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
        let p1 = this.#vertices[i];
        let p2 = this.#vertices[(i + 1) % this.#vertices.length];
        
        // If the point lies on the edge between p1 and p2, the point is considered inside
        if(Lines.liesOnSegment(point, p1, p2)){
          return true;
        }
        
        // Create two vectors:
        // v1 goes from the point to p1
        // v2 goes from the point to p2
        let v1 = Vector2.diff(p1, point);
        let v2 = Vector2.diff(p2, point);
  
        // Add the angle between v1 and v2 to the cumulative winding angle
        let theta = Vector2.angleBetween(v1, v2);
        windingAngle += theta;
      }
      
      // The point is inside the polygon if the winding number is 1
      return Math.floor(windingAngle / (2 * Math.PI)) === 1;
    }
  }
}