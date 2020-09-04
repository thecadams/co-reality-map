import { PLAYA_AVATAR_SIZE } from "settings";

type AddressEvaluatorFunc = (x: number, y: number, point: Point) => string;

type Point = {
  x: number;
  y: number;
  name: string;
  area?: string;
  radius?: number;
  evaluator: AddressEvaluatorFunc;
};

const MINIMUM_DISTANCE = PLAYA_AVATAR_SIZE / 2;

const distance = (x1: number, y1: number, x2: number, y2: number) =>
  Math.floor(Math.hypot(x2 - x1, y2 - y1));

const clockTime = (cx: number, cy: number, tox: number, toy: number) => {
  const hours = (Math.atan2(cy - toy, tox - cx) * 6) / Math.PI + 6;
  const minutes = (hours - Math.floor(hours)) * 60;
  return `${Math.floor(hours)}:${Math.floor(minutes)}`;
};

const clockEvaluator = (x: number, y: number, point: Point) => {
  const distanceFromCenter = distance(point.x, point.y, x, y);
  if (distanceFromCenter < MINIMUM_DISTANCE) {
    return point.name;
  } else {
    const clock = clockTime(point.x, point.y, x, y);
    return `${clock}, ${distanceFromCenter} playa-pixels from ${point.name}`;
  }
};

const ESPLANADE_DISTANCE = 300;
const STREET_WIDTH = 48;

const cityEvaluator = (x: number, y: number, man: Point) => {
  const distanceFromTheMan = distance(man.x, man.y, x, y);
  const clockFromTheMan = clockTime(man.x, man.y, x, y);
  if (
    clockFromTheMan.startsWith("11:") ||
    clockFromTheMan.startsWith("12:") ||
    clockFromTheMan.startsWith("1:") ||
    distanceFromTheMan < ESPLANADE_DISTANCE ||
    distanceFromTheMan >= ESPLANADE_DISTANCE + STREET_WIDTH * 6
  ) {
    return `Open Playa, ${clockFromTheMan}, ${distanceFromTheMan} playa-pixels from The Man`;
  }
  if (distanceFromTheMan < ESPLANADE_DISTANCE + STREET_WIDTH) {
    return `${clockFromTheMan} & A`;
  }
  if (distanceFromTheMan < ESPLANADE_DISTANCE + STREET_WIDTH * 2) {
    return `${clockFromTheMan} & B`;
  }
  if (distanceFromTheMan < ESPLANADE_DISTANCE + STREET_WIDTH * 3) {
    return `${clockFromTheMan} & C`;
  }
  if (distanceFromTheMan < ESPLANADE_DISTANCE + STREET_WIDTH * 4) {
    return `${clockFromTheMan} & D`;
  }
  if (distanceFromTheMan < ESPLANADE_DISTANCE + STREET_WIDTH * 5) {
    return `${clockFromTheMan} & E`;
  }
  if (distanceFromTheMan < ESPLANADE_DISTANCE + STREET_WIDTH * 6) {
    return `${clockFromTheMan} & F`;
  }
  return `Open Playa, ${clockFromTheMan}, ${distanceFromTheMan} playa-pixels from The Man`;
};

const MAN: Point = {
  x: 2028,
  y: 1873,
  name: "The Man",
  evaluator: cityEvaluator,
};
const CENTER_CAMP: Point = {
  x: 1915,
  y: 2179,
  name: "Center Camp",
  radius: 94,
  evaluator: clockEvaluator,
};
const TEMPLE: Point = {
  x: 2141,
  y: 2485,
  name: "Temple",
  evaluator: clockEvaluator,
};
const NORTHWEST_SATELLITE: Point = {
  x: 1485,
  y: 677,
  name: "Northwest Satellite",
  evaluator: clockEvaluator,
};
const SOUTHEAST_SATELLITE: Point = {
  x: 2468,
  y: 3132,
  name: "Southeast Satellite",
  evaluator: clockEvaluator,
};
const DEEP_PLAYA: Point = {
  x: 2254,
  y: 2485,
  name: "Deep Playa",
  evaluator: () => "Deep Playa",
};

const POINTS: Point[] = [
  MAN,
  CENTER_CAMP,
  TEMPLE,
  NORTHWEST_SATELLITE,
  SOUTHEAST_SATELLITE,
  DEEP_PLAYA,
];

export const playaAddress: (x: number, y: number) => string = (x, y) => {
  const distancesToPointsList = POINTS.map((point) => ({
    point,
    distance: distance(point.x, point.y, x, y),
  })).sort((a, b) => a.distance - b.distance);
  for (const entry of distancesToPointsList) {
    // If point is too far, use the next closest
    if (entry.point.radius && entry.distance > entry.point.radius) {
      continue;
    }
    return entry.point.evaluator(x, y, entry.point);
  }
  return "(unknown)";
};
