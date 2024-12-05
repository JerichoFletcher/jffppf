import { DoorLink, RoomMap } from "@/mapping";
import { RectRoom } from "@/mapping";
import { AstarPathfinder, TraversalGraph } from "@/pathfinding";

describe("Traversal graph test", () => {
  const rooms = [
    new RectRoom({ x: 0, y: 0 }, { x: 3, y: 3 }, "room_traversal-graph_test_foo"),
    new RectRoom({ x: 3, y: 0 }, { x: 6, y: 6 }, "room_traversal-graph_test_bar"),
    new RectRoom({ x: 0, y: 3 }, { x: 3, y: 6 }, "room_traversal-graph_test_qux"),
  ];
  const links = [
    new DoorLink(
      { point: { x: 2.9, y: 1 }, room: rooms[0] },
      { point: { x: 3.1, y: 1 }, room: rooms[1] },
      "door_traversal-graph_test_foo-bar"
    ),
    new DoorLink(
      { point: { x: 3.1, y: 5 }, room: rooms[1] },
      { point: { x: 2.9, y: 5 }, room: rooms[2] },
      "door_traversal-graph_test_bar-qux"
    ),
    new DoorLink(
      { point: { x: 2, y: 2.9 }, room: rooms[0] },
      { point: { x: 2, y: 3.1 }, room: rooms[2] },
      "door_traversal-graph_test_foo-qux"
    ),
  ];
  const map = new RoomMap(rooms, links);

  test("Cost computation test", () => {
    const graph = new TraversalGraph(map);
    expect(graph.initialized).toBeFalsy();

    const astar = new AstarPathfinder({ roomGridCellSize: 0.5 });
    graph.computeCosts(astar);

    expect(graph.initialized).toBeTruthy();
    expect(graph.costs).toStrictEqual({
      "room_traversal-graph_test_foo": {
        "door_traversal-graph_test_foo-bar": { "door_traversal-graph_test_foo-qux": 1.7 },
        "door_traversal-graph_test_foo-qux": { "door_traversal-graph_test_foo-bar": 1.7 },
      },
      "room_traversal-graph_test_bar": {
        "door_traversal-graph_test_foo-bar": { "door_traversal-graph_test_bar-qux": 4 },
        "door_traversal-graph_test_bar-qux": { "door_traversal-graph_test_foo-bar": 4 },
      },
      "room_traversal-graph_test_qux": {
        "door_traversal-graph_test_foo-qux": { "door_traversal-graph_test_bar-qux": 2.2 },
        "door_traversal-graph_test_bar-qux": { "door_traversal-graph_test_foo-qux": 2.2 },
      },
    });
  });

  test("Cost setter validation test", () => {
    const graph = new TraversalGraph(map);
    expect(graph.initialized).toBeFalsy();

    graph.costs = { "room_foo": {} };
    expect(graph.initialized).toBeFalsy();

    graph.costs = {
      "room_traversal-graph_test_foo": {
        "door_traversal-graph_test_foo-bar": { "door_traversal-graph_test_foo-qux": 1 },
        "door_traversal-graph_test_foo-qux": { "door_traversal-graph_test_foo-bar": 1 },
      },
      "room_traversal-graph_test_bar": {
        "door_traversal-graph_test_foo-bar": { "door_traversal-graph_test_bar-qux": 1 },
        "door_traversal-graph_test_bar-qux": { "door_traversal-graph_test_foo-bar": 1 },
      },
      "room_traversal-graph_test_qux": {
        "door_traversal-graph_test_foo-qux": { "door_traversal-graph_test_bar-qux": 1 },
        "door_traversal-graph_test_bar-qux": { "door_traversal-graph_test_foo-qux": 1 },
      },
    };
    expect(graph.initialized).toBeTruthy();
  });
});