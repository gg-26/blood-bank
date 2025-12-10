const { computePriorityScore } = require('../../src/controllers/requestController');

describe('computePriorityScore', () => {
  const baseRequest = {
    urgency_level: 'medium',
    createdAt: new Date(),
    requester: {
      donation_count: 0,
      last_donation_date: null
    }
  };

  it('boosts priority for donors with prior donations', () => {
    const donorRequest = {
      ...baseRequest,
      requester: { donation_count: 4, last_donation_date: new Date('2024-11-15') }
    };

    const nonDonorRequest = {
      ...baseRequest,
      requester: { donation_count: 0 }
    };

    const donorScore = computePriorityScore(donorRequest);
    const nonDonorScore = computePriorityScore(nonDonorRequest);

    expect(donorScore).toBeGreaterThan(nonDonorScore);
  });

  it('still respects urgency while boosting donors', () => {
    const highUrgencyNonDonor = {
      ...baseRequest,
      urgency_level: 'high',
      requester: { donation_count: 0 }
    };

    const mediumUrgencyDonor = {
      ...baseRequest,
      urgency_level: 'medium',
      requester: { donation_count: 2, last_donation_date: new Date('2024-12-01') }
    };

    const highUrgencyScore = computePriorityScore(highUrgencyNonDonor);
    const mediumDonorScore = computePriorityScore(mediumUrgencyDonor);

    expect(highUrgencyScore).toBeGreaterThan(mediumDonorScore);
  });

  it('favors fresher requests when other factors equal', () => {
    const older = {
      ...baseRequest,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
    };
    const newer = {
      ...baseRequest,
      createdAt: new Date()
    };

    expect(computePriorityScore(newer)).toBeGreaterThan(computePriorityScore(older));
  });
});

