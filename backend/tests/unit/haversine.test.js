const { haversineDistance } = require('../../src/utils/haversine');

describe('Haversine Distance Calculation', () => {
  test('should calculate distance between two points correctly', () => {
    // Distance between Delhi (28.6139, 77.2090) and Mumbai (19.0760, 72.8777)
    // Expected distance is approximately 1148 km based on the haversine output
    const distance = haversineDistance(28.6139, 77.2090, 19.0760, 72.8777);
    expect(distance).toBeCloseTo(1148, 0);
  });

  test('should return 0 for same coordinates', () => {
    const distance = haversineDistance(28.6139, 77.2090, 28.6139, 77.2090);
    expect(distance).toBe(0);
  });

  test('should handle negative coordinates', () => {
    // Distance between two points with negative coordinates
    const distance = haversineDistance(-28.6139, -77.2090, -19.0760, -72.8777);
    expect(distance).toBeGreaterThan(0);
  });

  test('should return positive distance for different points', () => {
    const distance = haversineDistance(0, 0, 1, 1);
    expect(distance).toBeGreaterThan(0);
  });
});

