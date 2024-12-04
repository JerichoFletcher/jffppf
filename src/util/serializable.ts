/**
 * Signifies that instances of a class can be serialized to and deserialized from JSON.
 */
export interface SerializableStatic<T>{
  new(...args: any[]): T;

  /**
   * Attempts to deserializes a JSON object into an instance of this class.
   * @param obj The serialized object.
   * @returns The deserialized class instance.
   */
  fromJSON(obj: Record<string, unknown>): T;
}

export interface Serializable{
  /**
   * Serializes this object into its JSON representation.
   * @returns The serialized representation of this object.
   */
  toJSON(): Record<string, unknown>;
}