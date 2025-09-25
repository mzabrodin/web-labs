function capitalize(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return str;
  }

  return str
    .split('-')
    .map(w => w.charAt(0)
      .toLocaleUpperCase() + w.slice(1))
    .join('-');
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isCapitalized(str) {
  return /^[A-ZА-Я]/.test(str);
}

function isValidPhone(phone) {
  const phoneRegex = /^[0-9-]+$/;
  return phoneRegex.test(phone);
}

export function fixUser(user) {
  const fixedUser = structuredClone(user);

  if (typeof fixedUser.gender === 'string') {
    fixedUser.gender = capitalize(fixedUser.gender);
  }

  if (typeof fixedUser.full_name === 'string') {
    fixedUser.full_name = fixedUser.full_name
      .split(' ')
      .map(capitalize)
      .join(' ');
  }
  if (typeof fixedUser.note === 'string') {
    fixedUser.note = capitalize(fixedUser.note);
  }
  if (typeof fixedUser.state === 'string') {
    fixedUser.state = capitalize(fixedUser.state);
  }
  if (typeof fixedUser.city === 'string') {
    fixedUser.city = capitalize(fixedUser.city);
  }
  if (typeof fixedUser.country === 'string') {
    fixedUser.country = capitalize(fixedUser.country);
  }
  if (typeof fixedUser.age === 'string' && !Number.isNaN(parseInt(fixedUser.age, 10))) {
    fixedUser.age = parseInt(fixedUser.age, 10);
  }

  if (typeof fixedUser.phone === 'string') {
    fixedUser.phone = fixedUser.phone.replace(/\D/g, '');
  }

  return fixedUser;
}

export function validateUser(user) {
  const errors = [];

  if (!isCapitalized(user.full_name)) {
    errors.push(`invalid full_name: ${user.full_name}`);
  }
  if (!isCapitalized(user.gender)) {
    errors.push(`invalid gender: ${user.gender}`);
  }
  if (user.note && !isCapitalized(user.note)) {
    errors.push(`invalid note: ${user.note}`);
  }
  if (!isCapitalized(user.state)) {
    errors.push(`invalid state: ${user.state}`);
  }
  if (!isCapitalized(user.city)) {
    errors.push(`invalid city: ${user.city}`);
  }
  if (!isCapitalized(user.country)) {
    errors.push(`invalid country: ${user.country}`);
  }
  if (typeof user.age !== 'number') {
    errors.push(`invalid age: ${user.age}`);
  }
  if (!isValidPhone(user.phone)) {
    errors.push(`invalid phone: ${user.phone}`);
  }
  if (!isValidEmail(user.email)) {
    errors.push(`invalid email: ${user.email}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateUsers(users) {
  return users
    .map((user) => {
      const fixedUser = fixUser(user);
      const result = validateUser(fixedUser);
      if (!result.valid) {
        //console.error(`user ${fixedUser.full_name} is invalid:`, result.errors);
        return null;
      }
      return fixedUser;
    })
    .filter((u) => u !== null);
}
