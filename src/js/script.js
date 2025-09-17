import validateUsers from './validate-users.js';
import mergeUsers from './merge-users.js';
import { additionalUsers, randomUserMock } from './FE4U-Lab2-mock.js';
import filterUsers from './filter-users.js';
import sortUsers from './sort-users.js';
import searchUsers from './search-users.js';
import calculatePercentage from './percentage-users.js';

const users = validateUsers(mergeUsers(randomUserMock, additionalUsers));

console.log(users);
console.log(`all users before merge and validation: ${randomUserMock.length + additionalUsers.length}`);
console.log(`users after${users.length}`);

const filtered = filterUsers(users, {
  country: 'United States',
  age: {
    min: 20,
    max: 80,
  },
  gender: 'Male',
  favorite: false,
});

console.log(filtered);
console.log(filtered.length);

const sorted = sortUsers(users, 'country', true);
console.log(sorted);

const searched = searchUsers(users, 'full_name', 'No');
console.log(searched);
console.log(searched.length);

const percentage = calculatePercentage(users, 'age', '>= 75');
console.log(`percentage of users with age >= 75: ${percentage}%`);
