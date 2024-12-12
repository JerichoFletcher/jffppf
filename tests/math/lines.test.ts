import * as Lines from "../../src/math/lines";

describe("Lines methods test", () => {
  test("orientation test", () => {
    let a = { x: 0, y: 0 };
    let b = { x: 0, y: 3 };
    let c = { x: 3, y: 3 };
    let d = { x: 4, y: 4 };

    expect(Lines.orientation(a, c, b)).toBeGreaterThan(0);
    expect(Lines.orientation(b, d, c)).toBeLessThan(0);
    expect(Lines.orientation(a, c, d)).toBeCloseTo(0);
  });

  test("isWithinPoints test", () => {
    let a = { x: 0, y: 5 };
    let b = { x: 5, y: 0 };

    expect(Lines.isWithinPoints({ x: 2, y: 4 }, a, b)).toBe(true);
    expect(Lines.isWithinPoints({ x: 4, y: 5 }, a, b)).toBe(true);
    expect(Lines.isWithinPoints({ x: 0, y: 5 }, a, b)).toBe(true);
    expect(Lines.isWithinPoints({ x: 5, y: 5 }, a, b)).toBe(true);
    expect(Lines.isWithinPoints({ x: 6, y: 4 }, a, b)).toBe(false);
    expect(Lines.isWithinPoints({ x: 3, y: -1 }, a, b)).toBe(false);
  });

  test("liesOnSegment test", () => {
    let a = { x: 1, y: 1 };
    let b = { x: 5, y: 5 };

    expect(Lines.liesOnSegment({ x: 2, y: 2 }, a, b)).toBe(true);
    expect(Lines.liesOnSegment({ x: 4, y: 4 }, a, b)).toBe(true);
    expect(Lines.liesOnSegment({ x: 1, y: 3 }, a, b)).toBe(false);
    expect(Lines.liesOnSegment({ x: 6, y: 6 }, a, b)).toBe(false);
  });

  test("segmentsIntersect test", () => {
    let a = { x: 0, y: 0 }, b = { x: 5, y: 5 };
    let c = { x: 5, y: 0 }, d = { x: 0, y: 5 };
    let e = { x: 2, y: 2 }, f = { x: 7, y: 7 };
    let g = { x: -4, y: -4 }, h = { x: 1, y: 1 };

    expect(Lines.segmentsIntersect(a, b, c, d)).toBe(true);
    expect(Lines.segmentsIntersect(e, f, c, d)).toBe(true);
    expect(Lines.segmentsIntersect(a, b, e, f)).toBe(true);
    expect(Lines.segmentsIntersect(e, f, g, h)).toBe(false);
  });
});