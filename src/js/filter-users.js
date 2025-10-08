import _ from 'lodash';

const filterFields = ['country', 'age', 'gender', 'favorite', 'photo'];

function filterUsers(users, filters) {
  return _.filter(users, (user) => _.every(filters, (condition, key) => {
    const value = _.get(user, key);

    switch (key) {
      case 'country':
      case 'gender':
      case 'favorite':
        return value === condition;

      case 'age':
        if (_.isObject(condition) && _.has(condition, 'min') && _.has(condition, 'max')) {
          return value >= condition.min && value <= condition.max;
        }
        return true;

      case 'photo':
        if (condition) {
          return Boolean(user.picture_large || user.picture_thumbnail);
        }
        return true;

      default:
        return true;
    }
  }));
}

export default filterUsers;
