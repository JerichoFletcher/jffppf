import { Rect } from "../../src/math";

describe("Rectangle class test", () => {
  test("Rect define by center-size", () => {
    const rect = new Rect({ x: 3, y: 5 }, { x: 6, y: 10 });
    expect(rect.left).toBeCloseTo(0);
    expect(rect.right).toBeCloseTo(6);
    expect(rect.bottom).toBeCloseTo(0);
    expect(rect.top).toBeCloseTo(10);
  });

  test("Rect define by corner points", () => {
    const rect = Rect.fromCorners({ x: 0, y: 0 }, { x: 6, y: 10 });
    expect(rect.center.x).toBeCloseTo(3);
    expect(rect.center.y).toBeCloseTo(5);
    expect(rect.size.x).toBeCloseTo(6);
    expect(rect.size.y).toBeCloseTo(10);
  });
});