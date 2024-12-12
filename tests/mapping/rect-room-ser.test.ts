import { RectRoom } from "../../src/mapping";
import { Rect } from "../../src/math";
import { Room } from "../../src/mapping";

describe("RectRoom serialization test", () => {
  test("RectRoom serialization to JSON", () => {
    const room = new RectRoom({ x: 0, y: 0 }, { x: 10, y: 10 }, "room_rect-room-ser_test-00");
    const obj = room.toJSON();

    expect(obj.id).toBe(room.id);
    expect(obj.type).toBe("rect");
    expect(obj.bounds).toStrictEqual(room.boundary.toJSON());
  });

  test("RectRoom deserialization from JSON", () => {
    const bounds = Rect.fromCorners({ x: 0, y: 0 }, { x: 10, y: 10 });
    const obj = { type: "rect", id: "room_rect-room-ser_test-01", bounds: bounds.toJSON() };

    const room = Room.fromJSON(obj) as RectRoom;
    expect(room.id).toBe(obj.id);
    expect(room.boundary.center.equals(bounds.center)).toBeTruthy();
    expect(room.boundary.size.equals(bounds.size)).toBeTruthy();
  });
});