export const validateProfile = (profile) => {
  const errors = [];

  if (!profile) {
    errors.push('Profile data is required');
    return { isValid: false, errors };
  }

  if (!profile.username || typeof profile.username !== 'string') {
    errors.push('Username is required and must be a string');
  }

  if (!profile.connectedAt || isNaN(new Date(profile.connectedAt).getTime())) {
    errors.push('Connected date is required and must be a valid date');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateFollowerData = (data) => {
  const errors = [];

  if (!Array.isArray(data)) {
    errors.push('Follower data must be an array');
    return { isValid: false, errors };
  }

  data.forEach((item, index) => {
    const profileValidation = validateProfile(item);
    if (!profileValidation.isValid) {
      errors.push(`Invalid profile at index ${index}: ${profileValidation.errors.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateConfig = (config) => {
  const errors = [];

  if (!config || typeof config !== 'object') {
    errors.push('Config must be an object');
    return { isValid: false, errors };
  }

  if (config.lastUpdateAt && isNaN(new Date(config.lastUpdateAt).getTime())) {
    errors.push('Last update date must be a valid date');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};