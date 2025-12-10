const EligibilityChecker = ({ user }) => {
  const checkEligibility = () => {
    if (!user?.last_donation_date) {
      return { eligible: true, message: 'You are eligible to donate' };
    }

    const lastDonation = new Date(user.last_donation_date);
    const today = new Date();
    const daysSinceDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
    const minDaysBetweenDonations = 56; // 8 weeks

    if (daysSinceDonation >= minDaysBetweenDonations) {
      return { eligible: true, message: 'You are eligible to donate' };
    } else {
      const daysRemaining = minDaysBetweenDonations - daysSinceDonation;
      return { 
        eligible: false, 
        message: `You can donate again in ${daysRemaining} days` 
      };
    }
  };

  const eligibility = checkEligibility();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Eligibility Check</h2>
      <div className={`p-4 rounded ${eligibility.eligible ? 'bg-green-100' : 'bg-yellow-100'}`}>
        <p className={eligibility.eligible ? 'text-green-800' : 'text-yellow-800'}>
          {eligibility.message}
        </p>
      </div>
      {user?.last_donation_date && (
        <p className="mt-2 text-sm text-gray-600">
          Last donation: {new Date(user.last_donation_date).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export default EligibilityChecker;

