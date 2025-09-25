function searchUsers(users, searchValue) {
  if (!searchValue) return [...users];
  searchValue = searchValue.trim()
    .toLowerCase();

  return users.filter(user => {
    if (user.full_name.toLowerCase()
      .includes(searchValue)) {
      return true;
    }

    if (user.note.toLowerCase()
      .includes(searchValue)) {
      return true;
    }

    const match = searchValue.match(/^([<>]=?|==?)\s*(\d+)$/);
    if (match) {
      const operator = match[1];
      const value = parseInt(match[2], 10);
      switch (operator) {
        case '>':
          return user.age > value;
        case '<':
          return user.age < value;
        case '=':
        case '==':
          return user.age === value;
        case '>=':
          return user.age >= value;
        case '<=':
          return user.age <= value;
      }
    } else if (!isNaN(parseInt(searchValue))) {
      if (user.age === parseInt(searchValue)) return true;
    }

    return false;
  });
}

export default searchUsers;
