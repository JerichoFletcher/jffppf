import RectRoom from "@/mapping/rect-room";
import { AstarPathfinder } from "@/pathfinding/astar-pathfinder";

describe("A* pathfinder test for rooms", () => {
  test("Pathfinding test inside a rectangular room, using octile + 8-way movement", () => {
    const room = new RectRoom({ x: 0, y: 0 }, { x: 8, y: 8 });
    const pather = new AstarPathfinder();

    // Ideal path in this case is a straight diagonal with 7NE steps
    // The ideal path has a cost of 7 * 1.4 = 9.8
    const result = pather.roomPointToPoint(room, { x: 0.5, y: 0.5 }, { x: 7.5, y: 7.5 });
    expect(result.success).toBeTruthy()
    expect(result.success && result.cost).toBeCloseTo(9.8);
  });

  test("Pathfinding test inside a rectangular room, using Manhattan + 4-way movement", () => {
    const room = new RectRoom({ x: 0, y: 0 }, { x: 8, y: 8 });
    const pather = new AstarPathfinder();

    // Ideal path in this case is a combination of 7S and 7E steps
    // The ideal path has a cost of 7 + 7 = 14
    const result = pather.roomPointToPoint(room, { x: 0.5, y: 0.5 }, { x: 7.5, y: 7.5 }, {
      distanceMode: "manhattan",
      cellNeighborStrategy: "4-way",
    });
    expect(result.success).toBeTruthy();
    expect(result.success && result.cost).toBeCloseTo(14);
  });

  test("Pathfinding test with turning point penalty", () => {
    const room = new RectRoom({ x: 5, y: 10 }, { x: 20, y: 20 });
    const pather = new AstarPathfinder();

    // Ideal path in this case is either 9SE -> 5E steps or 5E -> 9SE steps (minimizing the number of turning points)
    // The ideal path has a cost of 9 * 1.4 + 5 * 1 = 17.6
    const result = pather.roomPointToPoint(room, { x: 5.5, y: 19.5 }, { x: 19.5, y: 10.5 }, {
      turnPenalty: 1,
    });
    expect(result.success).toBeTruthy();
    expect(result.success && result.cost).toBeCloseTo(17.6);
  });
});