const { isCompatible, getCompatibleDonorTypes } = require('../../src/utils/bloodCompatibility');

describe('Blood Type Compatibility', () => {
  test('O- should be compatible with all blood types', () => {
    expect(isCompatible('O-', 'O-')).toBe(true);
    expect(isCompatible('O-', 'A-')).toBe(true);
    expect(isCompatible('O-', 'B-')).toBe(true);
    expect(isCompatible('O-', 'AB-')).toBe(true);
  });

  test('O+ should be compatible with all positive blood types', () => {
    expect(isCompatible('O+', 'O+')).toBe(true);
    expect(isCompatible('O+', 'A+')).toBe(true);
    expect(isCompatible('O+', 'B+')).toBe(true);
    expect(isCompatible('O+', 'AB+')).toBe(true);
  });

  test('AB+ should only be compatible with AB+', () => {
    expect(isCompatible('AB+', 'AB+')).toBe(true);
    expect(isCompatible('AB+', 'A+')).toBe(false);
    expect(isCompatible('AB+', 'O+')).toBe(false);
  });

  test('A+ should be compatible with A+ and AB+', () => {
    expect(isCompatible('A+', 'A+')).toBe(true);
    expect(isCompatible('A+', 'AB+')).toBe(true);
    expect(isCompatible('A+', 'O+')).toBe(false);
  });

  test('getCompatibleDonorTypes should return correct donor types', () => {
    const donors = getCompatibleDonorTypes('AB+');
    expect(donors).toContain('AB+');
    expect(donors.length).toBeGreaterThan(0);
  });

  test('should return false for invalid blood types', () => {
    expect(isCompatible('INVALID', 'A+')).toBe(false);
    expect(isCompatible('A+', 'INVALID')).toBe(false);
  });
});

