export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return 'Email is required';
  }
  if (email.length < 10 || email.length > 255) {
    return 'Email must be between 10 and 255 characters';
  }
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return '';
};

export const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,20}$/;

  if (!password) {
    return 'Password is required';
  }
  if (!passwordRegex.test(password)) {
    return 'Password must be 8–20 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character';
  }

  return '';
};

export const validateForm = (formData) => {
  const errors = {};

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
