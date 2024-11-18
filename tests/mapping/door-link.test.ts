import RectRoom from "@/mapping/rect-room";
import DoorLink from "@/mapping/door-link";

describe("Door link test", () => {
  test("Constructing a DoorLink with points outside of their respective rooms should throw an error", () => {
    let room1 = new RectRoom({ x: 0, y: 0 }, { x: 2, y: 2 });
    let room2 = new RectRoom({ x: 2.5, y: 0 }, { x: 4.5, y: 2 });

    expect(() => new DoorLink(
      { point: { x: 2.25, y: 1 }, room: room1 },
      { point: { x: 2.25, y: 1 }, room: room2 },
    )).toThrow();
  });

  test("DoorLink.isConnected should return true on rooms connected by the link", () => {
    let room1 = new RectRoom({ x: 0, y: 0 }, { x: 2, y: 2 });
    let room2 = new RectRoom({ x: 2.5, y: 0 }, { x: 4.5, y: 2 });
    let link = new DoorLink(
      { point: { x: 2, y: 1 }, room: room1 },
      { point: { x: 2.5, y: 1 }, room: room2 },
    );

    expect(link.isConnected(room1, room2)).toBe(true);
    expect(link.isConnected(room2, room1)).toBe(true);
  });

  test("DoorLink.isConnected should return false on rooms not connected by the link", () => {
    let room1 = new RectRoom({ x: 0, y: 0 }, { x: 2, y: 2 });
    let room2 = new RectRoom({ x: 2.5, y: 0 }, { x: 4.5, y: 2 });
    let room3 = new RectRoom({ x: 0, y: 2.5 }, { x: 4.5, y: 4.5 });
    let link = new DoorLink(
      { point: { x: 2, y: 1 }, room: room1 },
      { point: { x: 2.5, y: 1 }, room: room2 },
    );

    expect(link.isConnected(room1, room3)).toBe(false);
    expect(link.isConnected(room3, room1)).toBe(false);
    expect(link.isConnected(room2, room3)).toBe(false);
    expect(link.isConnected(room3, room2)).toBe(false);
  });
});