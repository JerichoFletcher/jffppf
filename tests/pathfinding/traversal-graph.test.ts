import DoorLink from '@/mapping/door-link';
import RectRoom from '@/mapping/rect-room';
import RoomMap from '@/mapping/room-map';
import TraversalGraph from '@/pathfinding/traversal-graph';
import { AstarPathfinder } from '@/pathfinding';

describe('Traversal graph test', () => {
  const rooms = [
    new RectRoom({ x: 0, y: 0 }, { x: 3, y: 3 }, 'room_foo'),
    new RectRoom({ x: 3, y: 0 }, { x: 6, y: 6 }, 'room_bar'),
    new RectRoom({ x: 0, y: 3 }, { x: 3, y: 6 }, 'room_qux'),
  ];
  const links = [
    new DoorLink(
      { point: { x: 2.9, y: 1 }, room: rooms[0] },
      { point: { x: 3.1, y: 1 }, room: rooms[1] },
      'door_foo_bar'
    ),
    new DoorLink(
      { point: { x: 3.1, y: 5 }, room: rooms[1] },
      { point: { x: 2.9, y: 5 }, room: rooms[2] },
      'door_bar_qux'
    ),
    new DoorLink(
      { point: { x: 2, y: 2.9 }, room: rooms[0] },
      { point: { x: 2, y: 3.1 }, room: rooms[2] },
      'door_foo_qux'
    ),
  ];
  const map = new RoomMap(rooms, links);

  test('Cost computation test', () => {
    const graph = new TraversalGraph(map);
    expect(graph.initialized).toBeFalsy();

    const astar = new AstarPathfinder({ roomGridCellSize: 0.5 });
    graph.computeCosts(astar);

    expect(graph.initialized).toBeTruthy();
    expect(graph.costs).toStrictEqual({
      'room_foo': {
        'door_foo_bar': { 'door_foo_qux': 1.7 },
        'door_foo_qux': { 'door_foo_bar': 1.7 },
      },
      'room_bar': {
        'door_foo_bar': { 'door_bar_qux': 4 },
        'door_bar_qux': { 'door_foo_bar': 4 },
      },
      'room_qux': {
        'door_foo_qux': { 'door_bar_qux': 2.2 },
        'door_bar_qux': { 'door_foo_qux': 2.2 },
      },
    });
  });

  test('Cost setter validation test', () => {
    const graph = new TraversalGraph(map);
    expect(graph.initialized).toBeFalsy();

    graph.costs = { 'room_foo': {} };
    expect(graph.initialized).toBeFalsy();

    graph.costs = {
      'room_foo': {
        'door_foo_bar': { 'door_foo_qux': 1 },
        'door_foo_qux': { 'door_foo_bar': 1 },
      },
      'room_bar': {
        'door_foo_bar': { 'door_bar_qux': 1 },
        'door_bar_qux': { 'door_foo_bar': 1 },
      },
      'room_qux': {
        'door_foo_qux': { 'door_bar_qux': 1 },
        'door_bar_qux': { 'door_foo_qux': 1 },
      },
    };
    expect(graph.initialized).toBeTruthy();
  });
});