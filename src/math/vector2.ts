import { Serializable } from "@/util";

/** Represents a 2D vector-like object type. */
export type Vec2Like = Vec2 | { x: number, y: number };

/**
 * Represents a vector (or point) on the 2D surface.
 */
export class Vec2 implements Serializable{
  #x: number;
  #y: number;

  /**
   * Creates a vector with the given dimension.
   * @param x The value of the x-component.
   * @param y The value of the y-component.
   */
  public constructor(x?: number, y?: number){
    this.#x = x || 0;
    this.#y = y || 0;
  }

  /**
   * Creates a vector from a vector-like object.
   * @param v A vector-like object.
   * @returns A vector instance.
   */
  public static fromVec2Like(v: Vec2Like): Vec2{
    return v instanceof Vec2 ? v : new Vec2(v.x, v.y);
  }

  /**
   * Attempts to deserializes a JSON object into an instance of this class.
   * @param obj The serialized object.
   * @returns The deserialized class instance.
   */
  public static fromJSON(obj: Record<string, any>): Vec2{
    return new Vec2(obj["x"], obj["y"]);
  }

  public toJSON(): Record<string, any>{
    return { x: this.#x, y: this.#y };
  }

  /** Shorthand for the zero vector, [0, 0]. */
  public static get zero(): Vec2{
    return new Vec2(0, 0);
  }

  /** The x-component of the vector. */
  public get x(): number{
    return this.#x;
  }

  /** The y-component of the vector. */
  public get y(): number{
    return this.#y;
  }

  /**
   * The square magnitude of this vector.
   */
  public get sqrMagnitude(): number{
    return this.dot(this);
  }

  /**
   * The magnitude of this vector.
   */
  public get magnitude(): number{
    return Math.sqrt(this.sqrMagnitude);
  }

  /**
   * The angle of this vector to the X-axis.
   */
  public get angle(): number{
    return Math.atan2(this.#y, this.#x);
  }

  /**
   * Adds two vectors.
   * @param other The other vector.
   * @returns The sum of this vector and `other`.
   */
  public add(other: Vec2Like): Vec2{
    return new Vec2(this.#x + other.x, this.#y + other.y);
  }

  /**
   * Subtracts a vector from this vector.
   * @param other The other vector.
   * @returns This vector subtracted by `other`.
   */
  public sub(other: Vec2Like): Vec2{
    return new Vec2(this.#x - other.x, this.#y - other.y);
  }

  /**
   * Scales a vector by a constant factor.
   * @param factor The scaling factor.
   * @returns This vector multiplied by `factor`.
   */
  public scl(factor: number): Vec2{
    return new Vec2(this.#x * factor, this.#y * factor);
  }

  /**
   * Computes the signed angle between two vectors.
   * @param other The other vector.
   * @returns The angle from this vector to `other`.
   */
  public angleTo(other: Vec2 | Vec2Like): number{
    const otherV = other instanceof Vec2 ? other : new Vec2(other.x, other.y);
    let theta = otherV.angle - this.angle;

    // Normalize the angle difference to the range [-PI, PI]
    if(theta > Math.PI){
      theta -= 2 * Math.PI;
    }
    if(theta < -Math.PI){
      theta += 2 * Math.PI;
    }

    return theta;
  }

  /**
   * Computes the dot product of two vectors.
   * @param other The other vector.
   * @returns The dot product of this vector and `other`.
   */
  public dot(other: Vec2Like): number{
    return this.#x * other.x + this.#y * other.y;
  }

  /**
   * Computes the 2D cross product of two vectors.
   * @param other The other vector.
   * @returns The cross product of this vector and `other`.
   */
  public cross(other: Vec2Like): number{
    return this.#x * other.y - this.#y * other.x;
  }

  /**
   * Determines if two vectors are equal.
   * @param other The other vector.
   * @returns `true` if this vector equals `other`, and `false` otherwise.
   */
  public equals(other: Vec2Like): boolean{
    return this.#x == other.x && this.#y == other.y;
  }
}