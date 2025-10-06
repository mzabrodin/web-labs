import _ from 'lodash';

function capitalize(str) {
  if (!_.isString(str) || str.length === 0) {
    return str;
  }

  return _.map(str.split('-'), (w) => _.upperFirst(w))
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

  if (_.isString(fixedUser.gender)) {
    fixedUser.gender = capitalize(fixedUser.gender);
  }

  if (_.isString(fixedUser.full_name)) {
    fixedUser.full_name = fixedUser.full_name
      .split(' ')
      .map(capitalize)
      .join(' ');
  }
  if (_.isString(fixedUser.note)) {
    fixedUser.note = capitalize(fixedUser.note);
  }
  if (_.isString(fixedUser.state)) {
    fixedUser.state = capitalize(fixedUser.state);
  }
  if (_.isString(fixedUser.city)) {
    fixedUser.city = capitalize(fixedUser.city);
  }
  if (_.isString(fixedUser.country)) {
    fixedUser.country = capitalize(fixedUser.country);
  }
  if (_.isString(fixedUser.age) && !_.isNaN(parseInt(fixedUser.age, 10))) {
    fixedUser.age = parseInt(fixedUser.age, 10);
  }

  if (_.isString(fixedUser.phone)) {
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
  return _.filter(_.map(users, (user) => {
    const fixedUser = fixUser(user);
    return validateUser(fixedUser).valid ? fixedUser : null;
  }));
}
