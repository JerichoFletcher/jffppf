import { DoorLink, Link } from "@/mapping";
import { RectRoom } from "@/mapping";

describe("DoorLink serialization test", () => {
  test("DoorLink serialization to JSON", () => {
    const room1 = new RectRoom({ x: 0, y: 0 }, { x: 1, y: 1 }, "room_door-link-ser_test-00_a");
    const room2 = new RectRoom({ x: 1, y: 0 }, { x: 2, y: 1 }, "room_door-link-ser_test-00_b");

    const link = new DoorLink(
      { point: { x: 0.5, y: 0.5 }, room: room1 },
      { point: { x: 1.5, y: 0.5 }, room: room2 },
      "link_door-link-ser_test-00"
    );
    const obj = link.toJSON();
    
    expect(obj.id).toBe(link.id);
    expect(obj.type).toBe("door");
    expect(link.entrances.some(p => p.room.id === (obj.point1 as any).room)).toBeTruthy();
    expect(link.entrances.some(p => p.room.id === (obj.point2 as any).room)).toBeTruthy();
    expect(link.exits.some(p => p.room.id === (obj.point1 as any).room)).toBeTruthy();
    expect(link.exits.some(p => p.room.id === (obj.point2 as any).room)).toBeTruthy();
  });

  test("DoorLink deserialization from JSON", () => {
    const room1 = new RectRoom({ x: 0, y: 0 }, { x: 1, y: 1 }, "room_door-link-ser_test-01_a");
    const room2 = new RectRoom({ x: 1, y: 0 }, { x: 2, y: 1 }, "room_door-link-ser_test-01_b");

    const obj = {
      id: "link_door-link-ser_test-01",
      type: "door",
      point1: {
        point: { x: 0.5, y: 0.5 },
        room: room1.id,
      },
      point2: {
        point: { x: 1.5, y: 0.5 },
        room: room2.id,
      },
    };
    const link = Link.fromJSON(obj);

    expect(link.id).toBe(obj.id);
    expect(link.entrances.some(p => p.room.id === obj.point1.room)).toBeTruthy();
    expect(link.entrances.some(p => p.room.id === obj.point2.room)).toBeTruthy();
    expect(link.exits.some(p => p.room.id === obj.point1.room)).toBeTruthy();
    expect(link.exits.some(p => p.room.id === obj.point2.room)).toBeTruthy();
  });
});