import RectRoom from "@/mapping/rect-room";

describe("RectRoom class test", () => {
  test("Constructing a RectRoom with horizontally or vertically collinear points should throw an error", () => {
    expect(() => new RectRoom({ x: 1, y: 1 }, { x: 1, y: 5 })).toThrow();
    expect(() => new RectRoom({ x: 3, y: 3 }, { x: 7, y: 3 })).toThrow();
  });

  test("Interior point detection for rectangular rooms", () => {
    let room = new RectRoom({ x: 0, y: 0 }, { x: 5, y: 5 });

    expect(room.isPointInside({ x: 2, y: 4 })).toBe(true);
    expect(room.isPointInside({ x: 5, y: 1 })).toBe(true);
    expect(room.isPointInside({ x: 6, y: 3 })).toBe(false);
    expect(room.isPointInside({ x: -1, y: 7 })).toBe(false);
  });
});