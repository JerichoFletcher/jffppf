import { Rect } from "@/math";

describe("Rect serialization test", () => {
  test("Rect deserialization from JSON", () => {
    const rect = Rect.fromJSON({
      center: { x: 3, y: 5 },
      size: { x: 6, y: 10 },
    });

    expect(rect.center.x).toBeCloseTo(3);
    expect(rect.center.y).toBeCloseTo(5);
    expect(rect.size.x).toBeCloseTo(6);
    expect(rect.size.y).toBeCloseTo(10);

    expect(rect.left).toBeCloseTo(0);
    expect(rect.right).toBeCloseTo(6);
    expect(rect.bottom).toBeCloseTo(0);
    expect(rect.top).toBeCloseTo(10);
  });

  test("Rect serialization to JSON", () => {
    const rect = new Rect({ x: 3, y: 5 }, { x: 6, y: 10 });
    const obj = rect.toJSON();

    expect(obj.center.x).toBeCloseTo(3);
    expect(obj.center.y).toBeCloseTo(5);
    expect(obj.size.x).toBeCloseTo(6);
    expect(obj.size.y).toBeCloseTo(10);
  });
});