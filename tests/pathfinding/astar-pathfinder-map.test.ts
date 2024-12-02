import DoorLink from "@/mapping/door-link";
import PolygonRoom from "@/mapping/polygon-room";
import RectRoom from "@/mapping/rect-room";
import RoomMap from "@/mapping/room-map";
import { AstarPathfinder, TraversalGraph } from "@/pathfinding";

describe("A* pathfinder test for maps", () => {
  const rooms = [
    new RectRoom({ x: 0, y: 0 }, { x: 3, y: 3 }, "room_foo"),
    new RectRoom({ x: 3, y: 0 }, { x: 6, y: 6 }, "room_bar"),
    new RectRoom({ x: 0, y: 3 }, { x: 3, y: 6 }, "room_qux"),
    new RectRoom({ x: 6, y: 0 }, { x: 9, y: 6 }, "room_unreachable"),
  ];
  const links = [
    new DoorLink(
      { point: { x: 2.9, y: 1 }, room: rooms[0] },
      { point: { x: 3.1, y: 1 }, room: rooms[1] },
      "door_foo_bar"
    ),
    new DoorLink(
      { point: { x: 3.1, y: 5 }, room: rooms[1] },
      { point: { x: 2.9, y: 5 }, room: rooms[2] },
      "door_bar_qux"
    ),
  ];
  const map = new RoomMap(rooms, links);
  const graph = new TraversalGraph(map);
  const astar = new AstarPathfinder({ roomGridCellSize: 0.5 });
  graph.computeCosts(astar);

  test("Pathfinding request on uninitialized map graph should be rejected", () => {
    const tempGraph = new TraversalGraph(map);

    expect(() => astar.mapRoomToRoom(tempGraph, rooms[0], rooms[2], { autoComputeGraphCosts: false })).toThrow();
  });

  test("Pathfinding links on source room equals destination room should return empty path", () => {
    const pathResult = astar.mapRoomToRoom(graph, rooms[0], rooms[0]);

    expect(pathResult.success).toBeTruthy();
    expect(pathResult.success && pathResult.path.length).toBe(0);
  });

  test("Pathfinding links on unreachable destination room should return failure", () => {
    const pathResult = astar.mapRoomToRoom(graph, rooms[0], rooms[3]);

    expect(pathResult.success).toBeFalsy();
  });

  test("Pathfinding links should return the correct room link action sequence", () => {
    const pathResult = astar.mapRoomToRoom(graph, rooms[0], rooms[2]);

    expect(pathResult.success).toBeTruthy();
    expect(pathResult.success && pathResult.path.length).toBe(2);
  });

  test("Pathfinding point to room should return the correct global path", () => {
    const pathResult = astar.mapPointToRoom(graph, { x: 0, y: 0 }, rooms[2]);

    expect(pathResult.success).toBeTruthy();
    expect(pathResult.success && pathResult.cost).toBeCloseTo(6.9);
  });

  test("Pathfinding point to point should return the correct global path", () => {
    const pathResult = astar.mapPointToPoint(graph, { x: 0, y: 5.5 }, { x: 0, y: 0 });

    expect(pathResult.success).toBeTruthy();
    expect(pathResult.success && pathResult.cost).toBeCloseTo(9.6);
  });

  test("Pathfinding test on complex map", () => {
    const rooms2 = [
      new RectRoom({ x: 50, y: 50 }, { x: 300, y: 200 }, "room_SW"),
      new RectRoom({ x: 300, y: 100 }, { x: 450, y: 200 }, "room_SW_MID"),
      new RectRoom({ x: 500, y: 150 }, { x: 650, y: 250 }, "room_SE"),
      new RectRoom({ x: 250, y: 250 }, { x: 450, y: 450 }, "room_CENTER"),
      new RectRoom({ x: 100, y: 250 }, { x: 250, y: 350 }, "room_CENTER_SIDE_1"),
      new RectRoom({ x: 100, y: 350 }, { x: 250, y: 450 }, "room_CENTER_SIDE_2"),
      new PolygonRoom([
        { x: 450, y: 250 },
        { x: 450, y: 500 },
        { x: 550, y: 500 },
        { x: 650, y: 400 },
        { x: 650, y: 250 },
      ], "room_NE"),
      new PolygonRoom([
        { x: 450, y: 500 },
        { x: 450, y: 450 },
        { x: 100, y: 450 },
        { x: 100, y: 250 },
        { x: 500, y: 250 },
        { x: 500, y: 150 },
        { x: 650, y: 150 },
        { x: 650, y: 50 },
        { x: 450, y: 50 },
        { x: 450, y: 200 },
        { x: 50, y: 200 },
        { x: 50, y: 500 },
      ], "corridor_0"),
    ];
    const links2 = [
      new DoorLink(
        { point: { x: 299, y: 150 }, room: rooms2[0] },
        { point: { x: 301, y: 150 }, room: rooms2[1] },
        "door_SW_SW_MID"
      ),
      new DoorLink(
        { point: { x: 449, y: 150 }, room: rooms2[1] },
        { point: { x: 451, y: 150 }, room: rooms2[7] },
        "door_corridor_SW_MID"
      ),
      new DoorLink(
        { point: { x: 499, y: 150 }, room: rooms2[7] },
        { point: { x: 501, y: 150 }, room: rooms2[2] },
        "door_corridor_SE"
      ),
      new DoorLink(
        { point: { x: 400, y: 451 }, room: rooms2[7] },
        { point: { x: 400, y: 449 }, room: rooms2[3] },
        "door_corridor_CENTER"
      ),
      new DoorLink(
        { point: { x: 251, y: 300 }, room: rooms2[3] },
        { point: { x: 249, y: 300 }, room: rooms2[4] },
        "door_CENTER_SIDE_1"
      ),
      new DoorLink(
        { point: { x: 251, y: 400 }, room: rooms2[3] },
        { point: { x: 249, y: 400 }, room: rooms2[5] },
        "door_CENTER_SIDE_2"
      ),
      new DoorLink(
        { point: { x: 449, y: 300 }, room: rooms2[3] },
        { point: { x: 451, y: 300 }, room: rooms2[6] },
        "door_CENTER_NE"
      ),
    ];
    const map2 = new RoomMap(rooms2, links2);
    const graph2 = new TraversalGraph(map2);

    const pathResult = astar.mapPointToPoint(graph2, { x: 70, y: 120 }, { x: 540, y: 360 }, {
      autoComputeGraphCosts: true,
      roomGridCellSize: 25,
      distanceMode: "manhattan",
      cellNeighborStrategy: "4-way",
      turnPenalty: 100,
    });

    expect(pathResult.success).toBeTruthy();
    expect(pathResult.success && pathResult.cost).toBeCloseTo(1825);
  });
});