import { PolygonRoom } from "../../src/mapping";
import { Room } from "../../src/mapping";

describe("PolygonRoom serialization test", () => {
  test("PolygonRoom serialization to JSON", () => {
    const vert = [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 0, y: 4 },
    ];
    const room = new PolygonRoom(vert, "room_polygon-room-ser_test-00");
    const obj = room.toJSON();

    expect(obj.id).toBe(room.id);
    expect(obj.type).toBe("poly");
    expect(obj.vertices).toStrictEqual(vert);
  });

  test("PolygonRoom deserialization from JSON", () => {
    const obj = {
      id: "room_polygon-room-ser_test-01",
      type: "poly",
      vertices: [
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 0, y: 4 },
      ],
    };
    const room = Room.fromJSON(obj) as PolygonRoom;
    expect(room.id).toBe(obj.id);
    for(let i = 0; i < obj.vertices.length; i++){
      expect(room.getVertex(i).equals(obj.vertices[i])).toBeTruthy();
    }
  });
});