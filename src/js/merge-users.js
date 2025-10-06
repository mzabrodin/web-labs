import _ from 'lodash';

const courses = [
  'Mathematics',
  'Physics',
  'English',
  'Computer Science',
  'Dancing',
  'Chess',
  'Biology',
  'Chemistry',
  'Law',
  'Art',
  'Medicine',
  'Statistics',
];

function getRandomElem(array) {
  return _.sample(array);
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function calculateAge(birthDate) {
  if (!birthDate) {
    return null;
  }

  const birth = new Date(birthDate);
  if (_.isNaN(birth.getTime())) {
    return null;
  }

  const today = new Date();
  const monthDifference = today.getMonth() - birth.getMonth();
  let age = today.getFullYear() - birth.getFullYear();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

function formatUser(user) {
  const id = (_.isString(user.id) ? user.id : null)
    || (user.id && typeof user.id === 'object'
      ? `${user.id.name || ''}${user.id.value || ''}`.trim() || null
      : null)
    || null;

  return {
    gender: user.gender,
    title: user.title || user.name?.title || null,
    full_name: user.full_name || `${user.name?.first || ''} ${user.name?.last || ''}`.trim() || null,
    city: user.city || user.location?.city || null,
    state: user.state || user.location?.state || null,
    country: user.country || user.location?.country || null,
    postcode: user.postcode || user.location?.postcode || null,
    coordinates: {
      latitude: (user.coordinates ?? user.location?.coordinates)?.latitude || null,
      longitude: (user.coordinates ?? user.location?.coordinates)?.longitude || null,
    },
    timezone: {
      offset: (user.timezone ?? user.location?.timezone)?.offset || null,
      description: (user.timezone ?? user.location?.timezone)?.description || null,
    },
    email: user.email || null,
    b_date: user.b_day || user.dob?.date || null,
    age: user.dob?.age || null,
    phone: user.phone || null,
    picture_large: user.picture_large || user.picture?.large || null,
    picture_thumbnail: user.picture_thumbnail || user.picture?.thumbnail || null,
    id,
    favorite: user.favorite || null,
    course: user.course || null,
    bg_color: user.bg_color || null,
    note: user.note || null,
  };
}

function isDuplicate(firstUser, secondUser) {
  return _.some(['id', 'email', 'full_name'], (key) => _.has(firstUser, key) && _.has(secondUser, key) && firstUser[key] === secondUser[key]);
}

function mergeUserData(firstUser, secondUser) {
  const mergedUser = structuredClone(firstUser);

  _.forOwn(secondUser, (secondValue, key) => {
    const firstValue = mergedUser[key];

    if (secondValue != null) {
      if (_.isPlainObject(secondValue)) {
        mergedUser[key] = mergeUserData(firstValue || {}, secondValue);
      } else if (firstValue == null) {
        mergedUser[key] = secondValue;
      } else if (
        (_.isBoolean(firstValue) && firstValue === false && secondValue === true)
        || (_.isNumber(firstValue) && firstValue === 0 && _.isNumber(secondValue) && secondValue !== 0)
        || (_.isString(firstValue) && _.trim(firstValue) === '' && _.isString(secondValue) && _.trim(secondValue) !== '')
      ) {
        mergedUser[key] = secondValue;
      }
    }
  });

  return mergedUser;
}

function finalizeUser(user) {
  return {
    ...user,
    course: user.course || getRandomElem(courses),
    bg_color: user.bg_color || getRandomColor(),
    age: user.b_date ? calculateAge(user.b_date) : user.age,
    favorite: user.favorite ?? false,
    note: user.note || '',
    id: user.id || crypto.randomUUID(),
  };
}

function mergeUsers(firstArray, secondArray) {
  const allUsers = [...firstArray, ...secondArray];
  const processed = [];

  _.forEach(allUsers, (user) => {
    const formatted = formatUser(user);
    const existingIndex = _.findIndex(processed, (existing) => isDuplicate(existing, formatted));

    if (existingIndex !== -1) {
      processed[existingIndex] = mergeUserData(processed[existingIndex], formatted);
    } else {
      processed.push(formatted);
    }
  });

  return _.map(processed, (user) => finalizeUser(user));
}

export default mergeUsers;
