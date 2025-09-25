const filterFields = ['country', 'age', 'gender', 'favorite', 'photo'];

function filterUsers(users, filters) {
  return users.filter((user) => Object.entries(filters)
    .filter(([key]) => filterFields.includes(key))
    .every(([key, condition]) => {
      const value = user[key];

      if (key === 'photo') {
        return Boolean(user.picture_large || user.picture_thumbnail);
      }

      if (typeof condition === 'object' && condition.min !== undefined && condition.max !== undefined) {
        return value >= condition.min && value <= condition.max;
      }

      return value === condition;
    }));
}

export default filterUsers;
