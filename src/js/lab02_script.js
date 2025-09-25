import { validateUsers } from './validate-users.js';
import mergeUsers from './merge-users.js';
import { additionalUsers, randomUserMock } from './FE4U-Lab2-mock.js';
import filterUsers from './filter-users.js';
import sortUsers from './sort-users.js';
import searchUsers from './search-users.js';
import calculatePercentage from './percentage-users.js';

const users = validateUsers(mergeUsers(randomUserMock, additionalUsers));

console.log('all users after merge and validation:');
console.log(users);
console.log(`all users length: ${randomUserMock.length + additionalUsers.length}`);
console.log(`users length after ${users.length}`);

const filtered = filterUsers(users, {
  country: 'United States',
  age: {
    min: 20,
    max: 30,
  },
  gender: 'Female',
});

console.log('filtered:');
console.log(filtered);
console.log(`filtered.length: ${filtered.length}`);

const sorted = sortUsers(users, 'age', false);
console.log('sorted:');
console.log(sorted);

const searched = searchUsers(users, 'No');
console.log('searched:');
console.log(searched);
console.log(`searched.length: ${searched.length}`);

const searchValue = '>30';
const percentage = calculatePercentage(users, searchValue);
console.log(`percentage of users with ${searchValue}: ${percentage}%`);
