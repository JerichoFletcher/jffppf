import RectRoom from "@/mapping/rect-room";
import { AstarPathfinder } from "@/pathfinding/astar-pathfinder";

describe("A* pathfinder test", () => {
  test("Pathfinding test inside a rectangular room, using octile + 8-way movement", () => {
    const room = new RectRoom({ x: 0, y: 0 }, { x: 8, y: 8 });
    const pather = new AstarPathfinder();

    // Ideal path in this case is a straight diagonal from (0.5, 0.5) to (7.5, 7.5)
    const result = pather.roomPointToPoint(room, { x: 0.5, y: 0.5 }, { x: 7.5, y: 7.5 });
    expect(result.success).toBeTruthy()
    expect(result.success && result.path).toStrictEqual([
      { x: 0.5, y: 0.5 },
      { x: 7.5, y: 7.5 },
    ]);
  });

  test("Pathfinding test inside a rectangular room, using Manhattan + 4-way movement", () => {
    const room = new RectRoom({ x: 0, y: 0 }, { x: 8, y: 8 });
    const pather = new AstarPathfinder();

    // Ideal path in this case is an L-shaped path from (0.5, 0.5), to one corner (either (7.5, 0.5) or (0.5, 7.5)), then to (7.5, 7.5)
    const result = pather.roomPointToPoint(room, { x: 0.5, y: 0.5 }, { x: 7.5, y: 7.5 }, {
      distanceMode: "manhattan",
      neighborStrategy: "4-way",
    });
    expect(result.success).toBeTruthy();
    expect(result.success && result.path).toStrictEqual([
      { x: 0.5, y: 0.5 },
      { x: 7.5, y: 0.5 },
      { x: 7.5, y: 7.5 },
    ]);
  });

  test("Pathfinding test inside a rectangular room where origin is not (0,0)", () => {
    const room = new RectRoom({ x: 5, y: 10 }, { x: 20, y: 20 });
    const pather = new AstarPathfinder();

    const result = pather.roomPointToPoint(room, { x: 5.5, y: 19.5 }, { x: 19.5, y: 10.5 }, {
      turnPenalty: 1,
    });
    expect(result.success).toBeTruthy();
    expect(result.success && result.path).toStrictEqual([
      { x: 5.5, y: 19.5 },
      { x: 14.5, y: 10.5 },
      { x: 19.5, y: 10.5 },
    ]);
  });
});