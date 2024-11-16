import { Vector2, diff, dot, cross } from "./vector2";

/**
 * Represents a room.
 */
export default class Room{
  #vertices: Vector2[];
  #isConvex: boolean;
  #area: number;

  /**
   * Constructs a room representation from a vertex list.
   * @param vertices The vertices (i.e. corners) of the room.
   */
  constructor(...vertices: Vector2[]){
    // Validate that at least 3 vertices are supplied
    if(vertices.length < 3){
      throw new Error("Room definition must have at least 3 vertices");
    }

    // Initialize fields
    this.#vertices = [...vertices];
    this.#isConvex = true;

    // Determine convexity and winding order
    let crossSign = 0, convexityCheck = true;
    let signedArea = 0;

    for(let i = 0; i < vertices.length; i++){
      // Consider the next two edges of the polygon
      let p1 = vertices[i];
      let p2 = vertices[(i + 1) % vertices.length];
      let p3 = vertices[(i + 2) % vertices.length];

      let v1 = diff(p2, p1);
      let v2 = diff(p3, p2);

      // Compute the signed area of the segment
      let localSignedArea = cross(p1, p2);
      signedArea += localSignedArea;

      // Perform a convexity check if the convexity has not been determined yet
      if(!convexityCheck){
        continue;
      }

      // Compute the cross product between the edges
      let localCross = cross(v1, v2);

      // If the two edges are not collinear...
      if(localCross !== 0){
        let localCrossSign = Math.sign(localCross);
        
        if(crossSign === 0){
          // If this is the first non-collinear edge pair, set the reference sign to the sign of the current cross product
          crossSign = localCrossSign;

        }else if(crossSign !== localCrossSign){
          // If the signs don't match, the polygon is concave at the point p2, so the check can be stopped
          this.#isConvex = false;
          convexityCheck = false;
        }
      }
    }

    // If the signed area of the polygon is zero, the polygon is invalid
    if(signedArea === 0){
      throw new Error("Room shape is invalid (signed area is zero)");
    }

    // If the signed area is negative, the vertices are ordered clockwise; transform the order to counterclockwise
    if(signedArea < 0){
      this.#vertices.reverse();
    }

    // The area of the polygon is half the absolute value of the shoelace area
    this.#area = Math.abs(signedArea / 2);
  }

  /**
   * Check if a point is inside of the room.
   * @param point A point to check.
   * @returns Whether `point` lies within the boundary of the room polygon.
   */
  public isPointInside(point: Vector2): boolean{
    if(this.#isConvex){
      // If the room polygon is convex, use half-plane checks
      for(let i = 0; i < this.#vertices.length; i++){
        // Consider two vertices p1 and p2 of the polygon
        let p1 = this.#vertices[i];
        let p2 = this.#vertices[(i + 1) % this.#vertices.length];

        // Create two vectors:
        // v1 goes from the point to the edge at p1
        // v2 lies on the edge and goes counterclockwise on the polygon
        let v1 = diff(p1, point);
        let v2 = diff(p2, p1);

        // If the point is inside the polygon, the cross product of v1 and v2 will always be non-negative
        if(cross(v1, v2) < 0){
          return false;
        }
      }

      // No negative cross product is found, so the point lies inside the polygon
      return true;
    }else{
      // If the room polygon is concave, use the winding number method
      let windingAngle = 0;

      for(let i = 0; i < this.#vertices.length; i++){
        // Consider two vertices p1 and p2 of the polygon
        let p1 = this.#vertices[i];
        let p2 = this.#vertices[(i + 1) % this.#vertices.length];

        // Create two vectors:
        // v1 goes from the point to p1
        // v2 goes from the point to p2
        let v1 = diff(p1, point);
        let v2 = diff(p2, point);

        // If the point lies on the edge between p1 and p2, the point is considered inside
        // This check is performed by first checking that the point is collinear with p1 and p2,
        // then doing a bounding box check to make sure the point is within p1 and p2
        if(
          cross(v1, v2) === 0
          && Math.min(v1.x, v2.x) <= point.x && point.x <= Math.max(v1.x, v2.x)
          && Math.min(v1.y, v2.y) <= point.y && point.y <= Math.max(v1.y, v2.y)
        ){
          return true;
        }

        // Compute the angle between v1 and v2
        let angle = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
        if(angle > Math.PI){
          angle -= 2 * Math.PI;
        }
        if(angle < -Math.PI){
          angle += 2 * Math.PI;
        }

        // Add the angle to the cumulative winding angle
        windingAngle += angle;
      }
      
      // The point is inside the polygon if the winding number is 1
      return Math.floor(windingAngle / (2 * Math.PI)) === 1;
    }
  }

  /**
   * Gets the coordinate of a vertex of the room representation polygon.
   * @param index The index that points to the vertex.
   * @returns A copy of the vertex.
   */
  public getVertex(index: number): Vector2{
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

  /**
   * The area of the room.
   */
  public get area(): number{
    return this.#area;
  }
}