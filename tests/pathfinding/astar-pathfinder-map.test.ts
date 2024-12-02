import DoorLink from "@/mapping/door-link";
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
});