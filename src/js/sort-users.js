import _ from 'lodash';

const sortFields = ['full_name', 'age', 'b_date', 'country', 'course', 'gender'];

function sortUsers(users, key, ascending = true) {
  if (!_.includes(sortFields, key)) {
    return users;
  }

  return _.orderBy(
    users,
    (users) => {
      const value = _.get(users, key);

      if (key === 'b_date' && value) {
        return new Date(value);
      }

      if (_.isString(value)) {
        return _.toLower(value);
      }

      return value;
    },
    [ascending ? 'asc' : 'desc'],
  );
}

export default sortUsers;
