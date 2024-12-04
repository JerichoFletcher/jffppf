import { Vec2 } from "@/math";

describe("Vec2 serialization test", () => {
  test("Vec2 deserialization from JSON", () => {
    const v = Vec2.fromJSON({ x: 3, y: 4 });
    expect(v.x).toBeCloseTo(3);
    expect(v.y).toBeCloseTo(4);
  });

  test("Vec2 serialization to JSON", () => {
    const v = new Vec2(3, 4);
    const obj = v.toJSON();

    expect(obj.x).toBeCloseTo(3);
    expect(obj.y).toBeCloseTo(4);
  });
});