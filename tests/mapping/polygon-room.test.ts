import PolygonRoom from "@/mapping/polygon-room";

describe("PolygonRoom class test", () => {
  test("Convexity of a PolygonRoom with convex shape should be true", () => {
    let room = new PolygonRoom(
      { x: 5, y: 5 },
      { x: 0, y: 5 },
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    );

    expect(room.isConvex).toBe(true);
  });

  test("Convexity of a PolygonRoom with concave shape should be false", () => {
    let room = new PolygonRoom(
      { x: 1, y: 1 },
      { x: 0, y: 5 },
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    );

    expect(room.isConvex).toBe(false);
  });

  test("Constructing a PolygonRoom with not enough vertices should throw an error", () => {
    expect(() => new PolygonRoom({ x: 1, y: 1 }, { x: 2, y: 2 })).toThrow();
  });

  test("Constructing a PolygonRoom with self-intersecting shapes should throw an error", () => {
    expect(() => new PolygonRoom({ x: 1, y: 1 }, { x: 4, y: 4 }, { x: 1, y: 4 }, { x: 4, y: 1 })).toThrow();
  });

  test("Constructing a PolygonRoom with collinear vertices should throw an error", () => {
    expect(() => new PolygonRoom({ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 })).toThrow();
  });

  test("PolygonRoom constructed with CCW winded vertices should have its vertices in the same order", () => {
    let vert = [
      { x: 5, y: 5 },
      { x: 0, y: 5 },
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ];
    let room = new PolygonRoom(...vert);

    for(let i = 0; i < vert.length; i++){
      expect(room.getVertex(i)).toStrictEqual(vert[i]);
    }
  });

  test("PolygonRoom constructed with CW winded vertices should have its vertices reversed to CCW", () => {
    let vert = [
      { x: 5, y: 5 },
      { x: 5, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 5 },
    ];
    let room = new PolygonRoom(...vert);

    for(let i = 0; i < vert.length; i++){
      expect(room.getVertex(i)).toStrictEqual(vert[vert.length - i - 1]);
    }
  });

  test("Interior point detection for convex rooms", () => {
    let room = new PolygonRoom(
      { x: 3, y: 3 },
      { x: 5, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 5 },
    );

    expect(room.isPointInside({ x: 0, y: 2 })).toBe(true);
    expect(room.isPointInside({ x: 2, y: 3 })).toBe(true);
    expect(room.isPointInside({ x: 5, y: 4 })).toBe(false);
    expect(room.isPointInside({ x: 8, y: 8 })).toBe(false);
  });

  test("Interior point detection for concave rooms", () => {
    let room = new PolygonRoom(
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 5 },
      { x: 0, y: 5 },
      { x: 4, y: 1 },
      { x: 0, y: 3 },
    );

    expect(room.isPointInside({ x: 0, y: 1 })).toBe(true);
    expect(room.isPointInside({ x: 3, y: 3 })).toBe(true);
    expect(room.isPointInside({ x: 0, y: 4 })).toBe(false);
    expect(room.isPointInside({ x: 8, y: 8 })).toBe(false);
  });

  test("Centroid calculation for polygonal rooms", () => {
    let room = new PolygonRoom(
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 4, y: 2 },
      { x: 2, y: 4 },
      { x: 0, y: 4 },
    );
    let o = room.centroid;

    expect(o.x).toBeCloseTo(1.6);
    expect(o.y).toBeCloseTo(2);
  });
});