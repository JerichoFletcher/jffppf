import * as Vector2 from "@/math/vector2";

describe("Vector methods test", () => {
  test("Vector addition", () => {
    expect(Vector2.sum({ x: 1, y: 2 }, { x: 3, y: 4 })).toStrictEqual<Vector2.Vec2>({ x: 4, y: 6 });
  });
  
  test("Vector subtraction", () => {
    expect(Vector2.diff({ x: 1, y: 4 }, { x: 3, y: 2 })).toStrictEqual<Vector2.Vec2>({ x: -2, y: 2 });
  });

  test("Vector scalar product", () => {
    expect(Vector2.scl({ x: 2, y: 3 }, 2)).toStrictEqual<Vector2.Vec2>({ x: 4, y: 6 });
    expect(Vector2.scl({ x: -1, y: 5 }, 3)).toStrictEqual<Vector2.Vec2>({ x: -3, y: 15 });
    expect(Vector2.scl({ x: -3, y: 2 }, -1)).toStrictEqual<Vector2.Vec2>({ x: 3, y: -2 });
    expect(Vector2.scl({ x: 4, y: -7 }, 0).x).toBeCloseTo(0);
    expect(Vector2.scl({ x: 4, y: -7 }, 0).y).toBeCloseTo(0);
  });

  test("Vector dot product", () => {
    expect(Vector2.dot({ x: 1, y: 4 }, { x: 3, y: 2 })).toBeCloseTo(11);
  });

  test("Vector cross product", () => {
    expect(Vector2.cross({ x: 1, y: 2 }, { x: 3, y: 4 })).toBeCloseTo(-2);
  });

  test("Vector magnitude", () => {
    expect(Vector2.magnitude({ x: 3, y: 4 })).toBeCloseTo(5);
    expect(Vector2.magnitude({ x: -12, y: 5 })).toBeCloseTo(13);
    expect(Vector2.magnitude({ x: 0, y: 0 })).toBeCloseTo(0);
  });

  test("Vector angle", () => {
    expect(Vector2.angle({ x: 3, y: 3 })).toBeCloseTo(Math.PI / 4);
    expect(Vector2.angle({ x: 3, y: -3 })).toBeCloseTo(-Math.PI / 4);
  });
  
  test("Vector angle between", () => {
    expect(Vector2.angleBetween({ x: 3, y: -3 }, { x: 3, y: 3 })).toBeCloseTo(Math.PI / 2);
    expect(Vector2.angleBetween({ x: 3, y: 3 }, { x: 3, y: -3 })).toBeCloseTo(-Math.PI / 2);
  });
});