import mergeUsers from './merge-users.js';
import { validateUsers } from './validate-users.js';

export async function fetchRandomUsersInit() {
  const targetCount = 50;
  let users = [];

  try {
    while (users.length < targetCount) {
      const remaining = targetCount - users.length;
      const response = await fetch(`https://randomuser.me/api/?results=${remaining}`, {
        method: 'GET',
      });

      if (!response.ok) {
        new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      const newUsers = validateUsers(mergeUsers(data.results, []));

      newUsers.forEach(u => {
        if (users.length < targetCount) {
          users.push(u);
        }
      });
    }

    return users;

  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}


export async function fetchToExistingUsers(users, numberOfNew) {
  try {
    let result = [...users];
    const targetCount = users.length + numberOfNew;

    while (result.length < targetCount) {
      const remaining = targetCount - result.length;
      const response = await fetch(`https://randomuser.me/api/?results=${remaining}`, {
        method: 'GET',
      });

      if (!response.ok) {
        new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      const newUsers = validateUsers(mergeUsers(data.results, result));

      newUsers.forEach(u => {
        if (result.length < targetCount) {
          result.push(u);
        }
      });
    }

    return result;
  } catch (error) {
    console.error('Error fetching users:', error);
    return users;
  }
}
