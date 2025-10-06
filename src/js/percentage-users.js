import searchUsers from './search-users';

function calculatePercentage(users, searchField, searchValue) {
  if (!Array.isArray(users) || users.length === 0) return 0;

  const matchingUsers = searchUsers(users, searchField, searchValue);

  return (matchingUsers.length / users.length) * 100;
}

export default calculatePercentage;
