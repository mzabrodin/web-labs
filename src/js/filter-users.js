const filterFields = ['country', 'age', 'gender', 'favorite'];

function filterUsers(users, filters) {
  return users.filter((user) => Object.entries(filters)
    .filter(([key]) => filterFields.includes(key))
    .every(([key, condition]) => {
      const value = user[key];

      if (typeof condition === 'object' && condition.min !== undefined && condition.max !== undefined) {
        return value >= condition.min && value <= condition.max;
      }

      return value === condition;
    }));
}

export default filterUsers;
