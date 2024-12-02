import DoorLink from "@/mapping/door-link";
import RectRoom from "@/mapping/rect-room";
import RoomMap from "@/mapping/room-map";
import { AstarPathfinder, TraversalGraph } from "@/pathfinding";

describe("A* pathfinder test for maps", () => {
  const rooms = [
    new RectRoom({ x: 0, y: 0 }, { x: 3, y: 3 }, "room_foo"),
    new RectRoom({ x: 3, y: 0 }, { x: 6, y: 6 }, "room_bar"),
    new RectRoom({ x: 0, y: 3 }, { x: 3, y: 6 }, "room_qux"),
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
  const astar = new AstarPathfinder();
  graph.computeCosts(astar);

  test("Pathfinding request on uninitialized map graph should be rejected", () => {
    const tempAstar = new AstarPathfinder({ autoComputeGraphCosts: false });
    const tempGraph = new TraversalGraph(map);

    expect(() => tempAstar.mapRoomToRoom(tempGraph, rooms[0], rooms[2])).toThrow();
  });

  test("Pathfinding links on source room equals destination room should return empty path", () => {
    const pathResult = astar.mapRoomToRoom(graph, rooms[0], rooms[0]);

    expect(pathResult.success).toBeTruthy();
    expect(pathResult.success && pathResult.path.length).toBe(0);
  });

  test("Pathfinding links should return the correct room link action sequence", () => {
    const pathResult = astar.mapRoomToRoom(graph, rooms[0], rooms[2]);

    expect(pathResult.success).toBeTruthy();
    expect(pathResult.success && pathResult.path.length).toBe(2);
    expect(pathResult).toStrictEqual({});
  });
});