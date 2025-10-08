import _ from 'lodash';

function searchUsers(users, searchValue) {
  let mySearchValue = searchValue;
  mySearchValue = _.trim(mySearchValue);

  if (!mySearchValue) {
    return [...users];
  }

  mySearchValue = _.toLower(mySearchValue);

  return _.filter(users, (user) => {
    const name = _.toLower(_.get(user, 'full_name', ''));
    const note = _.toLower(_.get(user, 'note', ''));
    const age = _.get(user, 'age');

    if (_.includes(name, mySearchValue) || _.includes(note, mySearchValue)) {
      return true;
    }

    const match = mySearchValue.match(/^([<>]=?|==?)\s*(\d+)$/);
    if (match) {
      const operator = match[1];
      const value = parseInt(match[2], 10);

      switch (operator) {
        case '>':
          return age > value;
        case '<':
          return age < value;
        case '=':
        case '==':
          return age === value;
        case '>=':
          return age >= value;
        case '<=':
          return age <= value;
      }
    }

    const numeric = parseInt(mySearchValue, 10);
    if (!_.isNaN(numeric)) {
      return age === numeric;
    }
  });
}

export default searchUsers;
