import { getDistanceFromCoords } from './getDistanceFromCoords';

describe('getDistanceFromCoords', () => {
  test('returns the correct distance between two points', () => {
    const lat1 = 37.7749;
    const lon1 = -122.4194;
    const lat2 = 40.7128;
    const lon2 = -74.006;
    const expectedDistance = 4128.89; // calculated using an online distance calculator
    const result = parseFloat(getDistanceFromCoords(lat1, lon1, lat2, lon2));
    expect(result).toBeCloseTo(expectedDistance, 0);
  });
  test('returns the correct distance for two identical points', () => {
    const lat1 = 37.7749;
    const lon1 = 37.7749;
    const lat2 = 37.7749;
    const lon2 = 37.7749;
    const expectedDistance = 0.0; // calculated using an online distance calculator
    const result = parseFloat(getDistanceFromCoords(lat1, lon1, lat2, lon2));
    expect(result).toBe(expectedDistance);
  });
  test('returns the correct distance between two poles', () => {
    expect(parseFloat(getDistanceFromCoords(90, 0, -90, 0))).toBeCloseTo(
      20015.086796216
    );
  });
});
