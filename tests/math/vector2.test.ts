import { Vec2 } from "@/math/vector2";

describe("Vector methods test", () => {
  test("Vector addition", () => {
    
    const v = new Vec2(1, 2).add({ x: 3, y: 4 });
    expect(v.x).toBeCloseTo(4);
    expect(v.y).toBeCloseTo(6);
  });
  
  test("Vector subtraction", () => {
    const v = new Vec2(1, 4).sub({ x: 3, y: 2 });
    expect(v.x).toBeCloseTo(-2);
    expect(v.y).toBeCloseTo(2);
  });

  test("Vector scalar product", () => {
    const v = new Vec2(2, -3);
    const v1 = v.scl(2);
    expect(v1.x).toBeCloseTo(4);
    expect(v1.y).toBeCloseTo(-6);
    
    const v2 = v1.scl(-0.5);
    expect(v2.x).toBeCloseTo(-2);
    expect(v2.y).toBeCloseTo(3);
    
    const v3 = v2.scl(0);
    expect(v3.x).toBeCloseTo(0);
    expect(v3.y).toBeCloseTo(0);
  });

  test("Vector dot product", () => {
    expect(new Vec2(1, 4).dot({ x: 3, y: 2 })).toBeCloseTo(11);
  });

  test("Vector cross product", () => {
    expect(new Vec2(1, 2).cross({ x: 3, y: 4 })).toBeCloseTo(-2);
  });

  test("Vector magnitude", () => {
    expect(new Vec2(3, 4).magnitude).toBeCloseTo(5);
    expect(new Vec2(-12, 5).magnitude).toBeCloseTo(13);
    expect(new Vec2(0, 0).magnitude).toBeCloseTo(0);
  });

  test("Vector angle", () => {
    expect(new Vec2(3, 3).angle).toBeCloseTo(Math.PI / 4);
    expect(new Vec2(3, -3).angle).toBeCloseTo(-Math.PI / 4);
  });
  
  test("Vector angle between", () => {
    expect(new Vec2(3, -3).angleTo({ x: 3, y: 3 })).toBeCloseTo(Math.PI / 2);
    expect(new Vec2(3, 3).angleTo({ x: 3, y: -3 })).toBeCloseTo(-Math.PI / 2);
  });
});