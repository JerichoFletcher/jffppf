import Room from "@/mapping/room";

describe("Room class test", () => {
  test("Convexity of a Room with convex shape should be true", () => {
    let room = new Room(
      { x: 5, y: 5 },
      { x: 0, y: 5 },
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    );

    expect(room.isConvex).toBe(true);
  });

  test("Convexity of a Room with concave shape should be false", () => {
    let room = new Room(
      { x: 1, y: 1 },
      { x: 0, y: 5 },
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    );

    expect(room.isConvex).toBe(false);
  });
  
  test("Room area should be the correct value", () => {
    let vert = [
      { x: 5, y: 5 },
      { x: 0, y: 5 },
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ]

    let room = new Room(...vert);

    expect(room.area).toBeCloseTo(vert[0].x * vert[0].y);
  });

  test("Constructing a Room with not enough vertices should throw an error", () => {
    expect(() => new Room({ x: 1, y: 1 }, { x: 2, y: 2 })).toThrow();
  });

  test("Constructing a Room with collinear vertices should throw an error", () => {
    expect(() => new Room({ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 })).toThrow();
  });

  test("Room constructed with CCW winded vertices should have its vertices in the same order", () => {
    let vert = [
      { x: 5, y: 5 },
      { x: 0, y: 5 },
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ];
    let room = new Room(...vert);

    for(let i = 0; i < vert.length; i++){
      expect(room.getVertex(i)).toStrictEqual(vert[i]);
    }
  });

  test("Room constructed with CW winded vertices should have its vertices reversed to CCW", () => {
    let vert = [
      { x: 5, y: 5 },
      { x: 5, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 5 },
    ];
    let room = new Room(...vert);

    for(let i = 0; i < vert.length; i++){
      expect(room.getVertex(i)).toStrictEqual(vert[vert.length - i - 1]);
    }
  });

  test("Interior point detection for convex rooms", () => {
    let room = new Room(
      { x: 3, y: 3 },
      { x: 5, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 5 },
    );

    expect(room.isPointInside({ x: 0, y: 2 })).toBe(true);
    expect(room.isPointInside({ x: 2, y: 3 })).toBe(true);
    expect(room.isPointInside({ x: 5, y: 4 })).toBe(false);
  });

  test("Interior point detection for concave rooms", () => {
    let room = new Room(
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
  });
});