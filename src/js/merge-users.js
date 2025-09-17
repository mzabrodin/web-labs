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
  return array[Math.floor(Math.random() * array.length)];
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
  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  const monthDifference = today.getMonth() - birth.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

function formatUser(user) {
  const id = (typeof user.id === 'string' ? user.id : null)
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
  return !!((firstUser.id && secondUser.id && firstUser.id === secondUser.id)
    || (firstUser.email && secondUser.email && firstUser.email === secondUser.email)
    || (firstUser.full_name && secondUser.full_name
      && firstUser.full_name === secondUser.full_name));
}

function mergeUserData(firstUser, secondUser) {
  const mergedUser = { ...firstUser };

  Object.keys(secondUser)
    .forEach((key) => {
      const firstValue = mergedUser[key];
      const secondValue = secondUser[key];

      if (secondValue != null) {
        if (typeof secondValue === 'object' && !Array.isArray(secondValue)) {
          mergedUser[key] = mergeUserData(firstValue || {}, secondValue);
        } else if (firstValue == null) {
          mergedUser[key] = secondValue;
        } else if ((typeof firstValue === 'boolean' && firstValue === false && secondValue === true)
          || (typeof firstValue === 'number' && firstValue === 0 && typeof secondValue === 'number' && secondValue !== 0)
          || (typeof firstValue === 'string' && firstValue.trim() === '' && typeof secondValue === 'string' && secondValue.trim() !== '')
        ) {
          mergedUser[key] = secondValue;
        }
      }
    });

  return mergedUser;
}

function finalizeUser(user) {
  const finalizedUser = { ...user };

  if (!finalizedUser.course) {
    finalizedUser.course = getRandomElem(courses);
  }
  if (!finalizedUser.bg_color) {
    finalizedUser.bg_color = getRandomColor();
  }
  if (finalizedUser.b_date) {
    finalizedUser.age = calculateAge(finalizedUser.b_date);
  }
  if (finalizedUser.favorite == null) {
    finalizedUser.favorite = false;
  }
  if (!finalizedUser.note) {
    finalizedUser.note = '';
  }
  if (!finalizedUser.id) {
    finalizedUser.id = crypto.randomUUID();
  }

  return finalizedUser;
}

function mergeUsers(firstArray, secondArray) {
  const allUsers = [...firstArray, ...secondArray];
  const processed = [];

  allUsers.forEach((user) => {
    const formatted = formatUser(user);
    const existingIndex = processed.findIndex((u) => isDuplicate(u, formatted));

    if (existingIndex !== -1) {
      processed[existingIndex] = mergeUserData(processed[existingIndex], formatted);
    } else {
      processed.push(formatted);
    }
  });

  return processed.map((user) => finalizeUser(user));
}

export default mergeUsers;
