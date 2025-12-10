/**
 * Blood type compatibility matrix based on ABO/Rh system
 * Defines which donor blood types are compatible with recipient blood types
 */
const bloodTypeMatrix = {
  'O+': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
  'O-': ['O-', 'A-', 'B-', 'AB-'],
  'A+': ['A+', 'A-', 'AB+', 'AB-'],
  'A-': ['A-', 'AB-'],
  'B+': ['B+', 'B-', 'AB+', 'AB-'],
  'B-': ['B-', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB-']
};

/**
 * Check if a donor's blood type is compatible with the required blood type
 * @param {string} donorBloodType - The donor's blood type
 * @param {string} requiredBloodType - The required blood type
 * @returns {boolean} True if compatible, false otherwise
 */
function isCompatible(donorBloodType, requiredBloodType) {
  if (!donorBloodType || !requiredBloodType) {
    return false;
  }
  
  const compatibleTypes = bloodTypeMatrix[donorBloodType];
  return compatibleTypes ? compatibleTypes.includes(requiredBloodType) : false;
}

/**
 * Get all compatible donor blood types for a given recipient blood type
 * @param {string} recipientBloodType - The recipient's blood type
 * @returns {string[]} Array of compatible donor blood types
 */
function getCompatibleDonorTypes(recipientBloodType) {
  const compatibleDonors = [];
  
  for (const [donorType, compatibleRecipients] of Object.entries(bloodTypeMatrix)) {
    if (compatibleRecipients.includes(recipientBloodType)) {
      compatibleDonors.push(donorType);
    }
  }
  
  return compatibleDonors;
}

module.exports = {
  isCompatible,
  getCompatibleDonorTypes,
  bloodTypeMatrix
};

