import * as Vector2 from "@/math/vector2";

describe("Vector methods test", () => {
  test("Vector addition", () => {
    expect(Vector2.sum({ x: 1, y: 2 }, { x: 3, y: 4 })).toStrictEqual<Vector2.Vector2>({ x: 4, y: 6 });
  });
  
  test("Vector subtraction", () => {
    expect(Vector2.diff({ x: 1, y: 4 }, { x: 3, y: 2 })).toStrictEqual<Vector2.Vector2>({ x: -2, y: 2 });
  });

  test("Vector dot product", () => {
    expect(Vector2.dot({ x: 1, y: 4 }, { x: 3, y: 2 })).toBeCloseTo(11);
  });

  test("Vector cross product", () => {
    expect(Vector2.cross({ x: 1, y: 2 }, { x: 3, y: 4 })).toBeCloseTo(-2);
  });

  test("Vector magnitude", () => {
    expect(Vector2.magnitude({ x: 3, y: 4 })).toBeCloseTo(5);
  });
});