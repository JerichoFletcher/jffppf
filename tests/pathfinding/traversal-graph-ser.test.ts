import { DoorLink, RectRoom, RoomMap } from "@/mapping";
import { AstarPathfinder, TraversalGraph } from "@/pathfinding";

describe("TraversalGraph serialization test", () => {
  const rooms = [
    new RectRoom({ x: 0, y: 0 }, { x: 3, y: 3 }, "room_traversal-graph-ser_test-00_foo"),
    new RectRoom({ x: 3, y: 0 }, { x: 6, y: 6 }, "room_traversal-graph-ser_test-00_bar"),
    new RectRoom({ x: 0, y: 3 }, { x: 3, y: 6 }, "room_traversal-graph-ser_test-00_qux"),
    new RectRoom({ x: 6, y: 0 }, { x: 9, y: 6 }, "room_traversal-graph-ser_test-00_unreachable"),
  ];
  const links = [
    new DoorLink(
      { point: { x: 2.9, y: 1 }, room: rooms[0] },
      { point: { x: 3.1, y: 1 }, room: rooms[1] },
      "door_traversal-graph-ser_test-00_foo-bar"
    ),
    new DoorLink(
      { point: { x: 3.1, y: 5 }, room: rooms[1] },
      { point: { x: 2.9, y: 5 }, room: rooms[2] },
      "door_traversal-graph-ser_test-00_bar-qux"
    ),
  ];
  const map = new RoomMap(rooms, links);

  test("TraversalGraph serialization to JSON", () => {
    const graph = new TraversalGraph(map);
    const astar = new AstarPathfinder();
    graph.computeCosts(astar);
    const obj = graph.toJSON();

    expect(((obj.map as Record<string, any>).rooms as Record<string, any>[]).every(r => graph.map.rooms.has(r.id)));
    expect(((obj.map as Record<string, any>).links as Record<string, any>[]).every(r => graph.map.links.has(r.id)));
    expect(obj.costs).toStrictEqual(graph.costs);
  });

  test("TraversalGraph deserialization from JSON", () => {
    const obj = {
      map: {
        rooms: [
          {
            id: "room_traversal-graph-ser_test-01_foo",
            type: "rect",
            bounds: {
              center: { x: 1.5, y: 1.5 },
              size: { x: 3, y: 3 }
            }
          }, {
            id: "room_traversal-graph-ser_test-01_bar",
            type: "rect",
            bounds: {
              center: { x: 4.5, y: 3 },
              size: { x: 3, y: 6 }
            }
          }, {
            id: "room_traversal-graph-ser_test-01_qux",
            type: "rect",
            bounds: {
              center: { x: 1.5, y: 4.5 },
              size: { x: 3, y: 3 }
            }
          }, {
            id: "room_traversal-graph-ser_test-01_unreachable",
            type: "rect",
            bounds: {
              center: { x: 7.5, y: 3 },
              size: { x: 3, y: 6 }
            }
          }
        ],
        links: [
          {
            id: "door_traversal-graph-ser_test-01_foo-bar",
            type: "door",
            point1: {
              point: { x: 2.9, y: 1 },
              room: "room_traversal-graph-ser_test-01_foo"
            },
            point2: {
              point: { x: 3.1, y: 1 },
              room: "room_traversal-graph-ser_test-01_bar"
            }
          },
          {
            id: "door_traversal-graph-ser_test-01_bar-qux",
            type: "door",
            point1: {
              point: { x: 3.1, y: 5 },
              room: "room_traversal-graph-ser_test-01_bar"
            },
            point2: {
              point: { x: 2.9, y: 5 },
              room: "room_traversal-graph-ser_test-01_qux"
            }
          }
        ]
      },
      costs: {
        "room_traversal-graph-ser_test-01_foo": {
          "door_traversal-graph-ser_test-01_foo-bar": {}
        },
        "room_traversal-graph-ser_test-01_bar": {
          "door_traversal-graph-ser_test-01_foo-bar": {
            "door_traversal-graph-ser_test-01_bar-qux": 4
          },
          "door_traversal-graph-ser_test-01_bar-qux": {
            "door_traversal-graph-ser_test-01_foo-bar": 4
          }
        },
        "room_traversal-graph-ser_test-01_qux": {
          "door_traversal-graph-ser_test-01_bar-qux": {}
        },
        "room_traversal-graph-ser_test-01_unreachable": {}
      }
    };
    const graph = TraversalGraph.fromJSON(obj);

    expect(obj.map.rooms.every(r => graph.map.rooms.has(r.id)));
    expect(obj.map.links.every(l => graph.map.links.has(l.id)));
    expect(obj.costs).toStrictEqual(graph.costs);
  });
});