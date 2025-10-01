import { additionalUsers, randomUserMock } from './FE4U-Lab2-mock.js';
import mergeUsers from './merge-users.js';
import { fixUser, validateUser, validateUsers } from './validate-users.js';
import filterUsers from './filter-users.js';
import sortUsers from './sort-users.js';
import searchUsers from './search-users.js';
import { fetchRandomUsersInit, fetchToExistingUsers } from './fetchFromAPI.js';

document.addEventListener('DOMContentLoaded', async () => {
  //region data
  const users = await fetchRandomUsersInit();
  let statsUsers = [...users];

  const tableKeys = {
    'table-name': 'full_name',
    'table-speciality': 'course',
    'table-age': 'age',
    'table-gender': 'gender',
    'table-nationality': 'country',
  };
//endregion

  //region elements
  const wrapper = document.querySelector('.wrapper');

  const teacherList = document.getElementById('teacher-list');
  const teacherFavorites = document.getElementById('teachers-scroll-bar');
  const teacherCardDialog = document.querySelector('.teacher-card-dialog');
  const dialogStar = teacherCardDialog.querySelector('.star');

  const ageSelect = document.getElementById('age');
  const regionSelect = document.getElementById('region');
  const sexSelect = document.getElementById('sex');
  const photoCheckbox = document.getElementById('photo');
  const favoritesCheckbox = document.getElementById('favorites');

  const statsTable = document.querySelector('#statistics table');
  const statsTbody = statsTable.querySelector('tbody');
  const statsThead = statsTable.querySelector('thead');
  const pagination = document.querySelector('.pagination');

  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  const addTeacherDialog = document.querySelector('.add-teacher-dialog');
  const addTeacherOpenBtn = document.querySelectorAll('.add-teacher-button');
  const addTeacherCloseBtn = addTeacherDialog.querySelector('.close-button');
  const addTeacherForm = addTeacherDialog.querySelector('form');

  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');
  //endregion

  //region states
  const sortState = {};
  let currentPage = 1;
  const rowsPerPage = 10;
  //endregion

  //region extension functions
  function resetTableSorting() {
    Object.keys(sortState)
      .forEach(k => sortState[k] = 'none');
    renderSortArrows();

    ageSelect.value = '';
    regionSelect.value = '';
    sexSelect.value = '';
    photoCheckbox.checked = false;
    favoritesCheckbox.checked = false;
    searchInput.value = '';

    statsUsers = [...users];
    renderStatisticsPage(statsUsers);
  }

  function getScrollAmount() {
    const firstBlock = teacherFavorites.querySelector('.teacher-block');
    return firstBlock ? firstBlock.offsetWidth : 200;
  }

  function parseAgeRange(value) {
    if (!value) {
      return null;
    }

    if (value.includes('-')) {
      const [min, max] = value.split('-')
        .map(Number);
      return {
        min,
        max
      };
    }
    if (value.includes('+')) {
      return {
        min: Number(value.replace('+', '')),
        max: Infinity
      };
    }

    return null;
  }

  function populateRegions(users) {
    const uniqueCountries = [...new Set(users.map(u => u.country))].sort();
    regionSelect.innerHTML = '<option value="">All</option>';
    uniqueCountries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      regionSelect.appendChild(option);
    });
  }

  function openTeacherDialog(user) {
    teacherCardDialog.querySelector('img').src = user.picture_large || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png';
    teacherCardDialog.querySelector('h2').textContent = user.full_name;
    teacherCardDialog.querySelector('.subject').textContent = user.course;
    teacherCardDialog.querySelector('.location').textContent = `${user.city}, ${user.country}`;
    teacherCardDialog.querySelector('.age-sex').textContent = `${user.age}, ${user.gender}`;
    teacherCardDialog.querySelector('.email').href = `mailto:${user.email}`;
    teacherCardDialog.querySelector('.email').textContent = user.email;
    teacherCardDialog.querySelector('.tel').href = `tel:${user.phone}`;
    teacherCardDialog.querySelector('.tel').textContent = user.phone;
    teacherCardDialog.querySelector('.teacher-card-footer').textContent = `${user.note}`;

    dialogStar.textContent = user.favorite ? '★' : '☆';
    dialogStar.dataset.email = user.email;

    teacherCardDialog.showModal();
    wrapper.style.filter = 'blur(5px)';
  }

  //endregion

  //region render
  function renderTeacherList(list) {
    teacherList.innerHTML = '';
    list.forEach((user) => {
      const [firstName, lastName] = user.full_name.split(/\s/g);
      const initials = firstName.charAt(0)
        .toUpperCase() + '.' + lastName.charAt(0)
        .toLowerCase();

      const teacherBlock = document.createElement('div');
      teacherBlock.className = 'teacher-block';
      teacherBlock.dataset.email = user.email;

      if (user.favorite) {
        teacherBlock.classList.add('favorite');
      }

      teacherBlock.innerHTML = `
        <div class="teacher-img">
          <img src="${user.picture_large}" alt="${initials}">
          <span class="star">${user.favorite ? '★' : ''}</span>
        </div>
        <h3>${firstName}<br/>${lastName}</h3>
        <p>${user.course}</p>
        <small>${user.country}</small>
      `;
      teacherList.appendChild(teacherBlock);
    });
  }

  function renderFavorites(users) {
    teacherFavorites.innerHTML = '';
    users.forEach((user) => {
      if (!user.favorite) {
        return;
      }

      const [firstName, lastName] = user.full_name.split(/\s/g);
      const initials = firstName.charAt(0)
        .toUpperCase() + '.' + lastName.charAt(0)
        .toLowerCase();

      const favBlock = document.createElement('div');
      favBlock.className = 'teacher-block';
      favBlock.dataset.email = user.email;
      favBlock.innerHTML = `
        <div class="teacher-img">
          <img src="${user.picture_large}" alt="${initials}">
        </div>
        <h3>${firstName}<br/>${lastName}</h3>
        <small>${user.country}</small>
      `;
      teacherFavorites.appendChild(favBlock);

      renderFavoritesArrows();
    });
  }

  function renderStatisticsPage(list) {
    statsTbody.innerHTML = '';
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageRows = list.slice(start, end);

    pageRows.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.full_name}</td>
        <td>${user.course}</td>
        <td>${user.age}</td>
        <td>${user.gender}</td>
        <td>${user.country}</td>
      `;
      statsTbody.appendChild(tr);
    });

    renderSortArrows();
    renderPagination(list.length);
  }

  function renderPagination(totalRows) {
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    pagination.innerHTML = '';

    const createPageButton = (pageNum, text = null) => {
      const a = document.createElement('a');
      a.textContent = text || pageNum;
      a.dataset.page = pageNum;
      if (pageNum === currentPage) {
        a.classList.add('active');
      }
      return a;
    };

    const prev = createPageButton(currentPage - 1, 'Prev');
    if (currentPage === 1) {
      prev.classList.add('disabled');
    }
    pagination.appendChild(prev);

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);

    if (endPage - startPage < 3) {
      startPage = Math.max(1, endPage - 2);
    }

    if (startPage > 1) {
      pagination.appendChild(createPageButton(1));
      if (startPage > 2) {
        const span = document.createElement('span');
        span.textContent = '...';
        pagination.appendChild(span);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pagination.appendChild(createPageButton(i));
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const span = document.createElement('span');
        span.textContent = '...';
        pagination.appendChild(span);
      }
      pagination.appendChild(createPageButton(totalPages));
    }

    const next = createPageButton(currentPage + 1, 'Next');
    if (currentPage === totalPages) next.classList.add('disabled');
    pagination.appendChild(next);
  }

  function renderSortArrows() {
    const ths = statsThead.querySelectorAll('th');
    ths.forEach(th => {
      const key = tableKeys[th.id];
      if (!key) {
        return;
      }

      const arrow = sortState[key] === 'asc' ? '  ↑' : sortState[key] === 'desc' ? '  ↓' : '';

      th.querySelectorAll('.sort-arrow')
        .forEach(s => s.remove());

      if (arrow) {
        const span = document.createElement('span');
        span.className = 'sort-arrow';
        span.textContent = arrow;
        th.appendChild(span);
      }
    });
  }

  function renderFavoritesArrows() {
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');

    if (teacherFavorites.children.length === 0) {
      leftArrow.style.display = 'none';
      rightArrow.style.display = 'none';
    } else {
      leftArrow.style.display = 'block';
      rightArrow.style.display = 'block';
    }
  }

  //endregion

  //region filter and search
  function applyFiltersAndSearch() {
    const filters = {};
    if (regionSelect.value) {
      filters.country = regionSelect.value;
    }
    const ageRange = parseAgeRange(ageSelect.value);
    if (ageRange) {
      filters.age = ageRange;
    }
    if (sexSelect.value) {
      filters.gender = sexSelect.value;
    }
    if (favoritesCheckbox.checked) {
      filters.favorite = true;
    }
    if (photoCheckbox.checked) {
      filters.photo = true;
    }

    let filtered = filterUsers(users, filters);
    const searchValue = searchInput.value.trim();
    if (searchValue) {
      filtered = searchUsers(filtered, searchValue);
    }

    statsUsers = [...filtered];
    currentPage = 1;
    renderStatisticsPage(statsUsers);
    renderTeacherList(filtered);
  }

  //endregion

  //region events
  [ageSelect, regionSelect, sexSelect, photoCheckbox, favoritesCheckbox].forEach(input =>
    input.addEventListener('change', applyFiltersAndSearch)
  );

  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    applyFiltersAndSearch();
  });

  [teacherList, teacherFavorites].forEach(list =>
    list.addEventListener('click', e => {
      const block = e.target.closest('.teacher-block');
      if (!block) {
        return;
      }

      const user = users.find(u => u.email === block.dataset.email);
      if (user) {
        openTeacherDialog(user);
      }
    })
  );

  dialogStar.addEventListener('click', () => {
    const user = users.find(u => u.email === dialogStar.dataset.email);
    if (!user) {
      return;
    }

    user.favorite = !user.favorite;
    dialogStar.textContent = user.favorite ? '★' : '☆';
    applyFiltersAndSearch();
    renderFavorites(users);
    renderFavoritesArrows();
  });

  teacherCardDialog.querySelector('.close-button')
    .addEventListener('click', () => {
      wrapper.style.filter = 'blur(0px)';
      teacherCardDialog.close();
    });

  teacherCardDialog.addEventListener('cancel', () => {
    wrapper.style.filter = 'blur(0px)';
  });

  statsThead.addEventListener('click', (e) => {
    const th = e.target.closest('th');
    if (!th) {
      return;
    }

    const key = tableKeys[th.id];
    if (!key) {
      return;
    }

    const current = sortState[key] || 'none';
    const next = current === 'none' ? 'asc' : current === 'asc' ? 'desc' : 'none';
    sortState[key] = next;
    Object.keys(sortState)
      .forEach(k => {
        if (k !== key) {
          sortState[k] = 'none';
        }
      });

    statsUsers = next === 'none' ? [...users] : sortUsers([...statsUsers], key, next === 'asc');
    renderStatisticsPage(statsUsers);
  });

  pagination.addEventListener('click', async (e) => {
    const a = e.target.closest('a');
    if (!a) {
      return;
    }

    const page = parseInt(a.dataset.page);
    if (!page || page === currentPage) return;

    const totalPages = Math.ceil(statsUsers.length / rowsPerPage);
    if (page > totalPages) {
      statsUsers = await fetchToExistingUsers(statsUsers, 10);
      users.push(...statsUsers.slice(-10));
      populateRegions(users);
      renderTeacherList(users);
      renderFavorites(users);
      resetTableSorting();
    }

    currentPage = page;
    renderStatisticsPage(statsUsers);
    const statisticsSection = document.getElementById('statistics');
    statisticsSection.scrollIntoView();
  });

  addTeacherOpenBtn.forEach(el => {
    el.addEventListener('click', () => {
      addTeacherDialog.showModal();
      wrapper.style.filter = 'blur(5px)';
    });
  });

  addTeacherCloseBtn.addEventListener('click', () => {
    addTeacherDialog.close();
    wrapper.style.filter = 'blur(0px)';
  });

  addTeacherDialog.addEventListener('cancel', () => {
    wrapper.style.filter = 'blur(0px)';
  });

  addTeacherForm.addEventListener('submit', async e => {
    e.preventDefault();

    const formData = new FormData(addTeacherForm);

    const fullName = (formData.get('name') || '').trim();
    const city = (formData.get('city') || '').trim();
    const email = (formData.get('email') || '').trim();
    const phone = (formData.get('phone') || '').trim();
    const dob = formData.get('date');
    const age = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : null;
    let gender = formData.get('sex') || 'unspecified';
    const course = formData.get('speciality') || '';
    const country = (formData.get('country') || '').trim();
    const notes = (formData.get('notes') || '').trim();
    const color = formData.get('color') || '#ffffff';
    const state = city;

    let title = null;
    if (gender.toLowerCase() === 'male') {
      gender = 'Male';
      title = 'Mr';
    }
    if (gender.toLowerCase() === 'female') {
      gender = 'Female';
      title = 'Mrs';
    }

    if (!['Male', 'Female'].includes(gender)) {
      gender = 'Unspecified';
    }

    const errors = [];
    if (!fullName) {
      errors.push('Name is required');
    } else if (fullName.split(/\s+/).length < 2) {
      errors.push('Full name should contain at least first and last name');
    }

    if (!['Male', 'Female'].includes(gender)) {
      errors.push('Invalid gender');
    }

    if (!city) {
      errors.push('City is required');
    }

    if (!country) {
      errors.push('Country is required');
    }

    const birthDate = dob ? new Date(dob) : null;
    const today = new Date();
    if (!dob) {
      errors.push('Date of birth is required');
    } else if (birthDate > today) {
      errors.push('Birth date cannot be in the future');
    } else if (birthDate < new Date(1900)) {
      errors.push('Birth date cannot be that much in the past');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.push('Email is required');
    } else if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    if (!phone) {
      errors.push('Phone is required');
    } else if (phone.replace(/\D/g, '').length < 8) {
      errors.push('Phone number must contain at least 8 digits');
    }

    if (!course) {
      errors.push('Speciality/course is required');
    }

    if (!color) {
      errors.push('Background color is required');
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    const newUser = {
      id: crypto.randomUUID(),
      title,
      full_name: fullName,
      gender,
      course,
      country,
      city,
      state,
      postcode: '',
      coordinates: {
        latitude: null,
        longitude: null
      },
      timezone: {
        offset: null,
        description: null
      },
      email,
      b_date: dob,
      age,
      phone,
      picture_large: null,
      picture_thumbnail: null,
      favorite: false,
      bg_color: color,
      note: notes,
    };

    const fixedUser = fixUser(newUser);
    const validation = validateUser(fixedUser);

    if (!validation.valid) {
      alert(`${validation.errors.join('\n')}`);
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixedUser)
      });

      if (!response.ok) {
        new Error('Failed to add teacher');
      }

      const savedTeacher = await response.json();
      console.log('Added:', savedTeacher);

      users.push(fixedUser);
      applyFiltersAndSearch();
      renderFavorites(users);
      addTeacherForm.reset();
      addTeacherDialog.close();
      wrapper.style.filter = 'blur(0px)';
      populateRegions(users);

    } catch (err) {
      alert(err.message);
    }
  });

  leftArrow.addEventListener('click', () => {
    const amount = getScrollAmount();
    teacherFavorites.scrollBy({
      left: -amount,
      behavior: 'smooth'
    });
  });

  rightArrow.addEventListener('click', () => {
    const amount = getScrollAmount();
    teacherFavorites.scrollBy({
      left: amount,
      behavior: 'smooth'
    });
  });
  //endregion

  //region init
  populateRegions(users);
  renderTeacherList(users);
  renderFavorites(users);
  renderStatisticsPage(statsUsers);
  renderFavoritesArrows();
  //endregion
});
