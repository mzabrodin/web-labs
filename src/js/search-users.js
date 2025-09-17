const searchFields = ['full_name', 'note', 'age'];

function searchUsers(users, searchField, searchValue) {
  if (!searchFields.includes(searchField)) {
    return [];
  }

  return users.filter((user) => {
    const fieldValue = user[searchField];

    if (typeof fieldValue === 'number') {
      const match = searchValue.match(/^([<>]=?|==?)\s*(\d+)$/);
      if (match) {
        const operator = match[1];
        const value = parseInt(match[2], 10);

        switch (operator) {
          case '>':
            return fieldValue > value;
          case '<':
            return fieldValue < value;
          case '=':
          case '==':
            return fieldValue === value;
          case '>=':
            return fieldValue >= value;
          case '<=':
            return fieldValue <= value;
          default:
            return false;
        }
      } else {
        return false;
      }
    }

    if (typeof fieldValue === 'string') {
      return fieldValue.toLowerCase()
        .includes(searchValue.toLowerCase());
    }

    return false;
  });
}

export default searchUsers;
