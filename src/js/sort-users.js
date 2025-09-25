const sortFields = ['full_name', 'age', 'b_date', 'country', 'course', 'gender'];

function sortUsers(users, key, ascending = true) {
  if (!sortFields.includes(key)) {
    return users;
  }

  return users.slice()
    .sort((a, b) => {
      let valueA = a[key];
      let valueB = b[key];

      if (key === 'b_date') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLocaleLowerCase();
        valueB = valueB.toLocaleLowerCase();
      }

      if (valueA < valueB) {
        return ascending ? -1 : 1;
      }

      if (valueA > valueB) {
        return ascending ? 1 : -1;
      }

      return 0;
    });
}

export default sortUsers;
