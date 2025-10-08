import L from 'leaflet';
import _ from 'lodash';
import {
  ArcElement, Chart, Legend, PieController, Tooltip, Title,
} from 'chart.js';
import dayjs from 'dayjs';
import WebDataRocks from '@webdatarocks/webdatarocks';
import { fixUser, validateUser } from './validate-users';
import filterUsers from './filter-users';
import searchUsers from './search-users';
import { fetchRandomUsersInit, fetchToExistingUsers } from './fetch-from-api';
import '@webdatarocks/webdatarocks/webdatarocks.min.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import '../css/index.css';

Chart.register(PieController, ArcElement, Tooltip, Legend, Title);
document.addEventListener('DOMContentLoaded', async () => {
  // region data
  let users = await fetchRandomUsersInit();
  // endregion

  // region elements
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

  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  const addTeacherDialog = document.querySelector('.add-teacher-dialog');
  const addTeacherOpenBtn = document.querySelectorAll('.add-teacher-button');
  const addTeacherCloseBtn = addTeacherDialog.querySelector('.close-button');
  const addTeacherForm = addTeacherDialog.querySelector('form');

  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');

  const mapContainer = document.getElementById('teacher-map');
  const toggleMapBtn = document.getElementById('toggle-map-a');
  const noCoordsMessage = document.getElementById('no-coords');

  const pieChartCanvas = document.getElementById('stats-chart');
  const pieChartButton = document.getElementById('pie-chart');

  const countriesReportButton = document.getElementById('country-report');
  const flatTableButton = document.getElementById('flat-table');
  const pivotFlatTableContainerDiv = document.getElementById('pivot-flat-table-container');
  const pivotByCountriesContainerDiv = document.getElementById('pivot-by-countries-container');
  const moreTeachersButton = document.getElementById('more-teachers');
  // endregion

  // region states
  let teacherMap = null;
  let teacherMarker = null;
  let pieChart = null;
  let pivotFlatTable = null;
  let pivotByCountries = null;
  // endregion

  // region extension functions
  function generateColors(count) {
    const hueStep = 360 / count;
    return _.map(_.range(count), (i) => `hsl(${i * hueStep}, 70%, 60%)`);
  }

  function getDataForPieChart(users) {
    const counts = _.countBy(users, 'course');
    return {
      labels: _.keys(counts),
      data: _.values(counts),
    };
  }

  function renderPieChart(users) {
    const {
      labels,
      data,
    } = getDataForPieChart(users);

    if (pieChart) {
      pieChart.data.labels = labels;
      pieChart.data.datasets[0].data = data;
      pieChart.data.datasets[0].backgroundColor = generateColors(data.length);
      pieChart.update();
      return;
    }

    const ctx = pieChartCanvas.getContext('2d');
    pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: 'Teachers',
          data,
          backgroundColor: generateColors(data.length),
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        aspectRatio: 1.5,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 20,
              padding: 15,
            },
          },
          tooltip: {
            enabled: true,
          },
          title: {
            display: true,
            text: 'Teachers by Courses',
            font: {
              size: 18,
            },
            padding: {
              top: 10,
              bottom: 20,
            },
          },
        },
      },
    });
  }

  function getScrollAmount() {
    const firstBlock = teacherFavorites.querySelector('.teacher-block');
    return firstBlock ? firstBlock.offsetWidth : 200;
  }

  function parseAgeRange(value) {
    if (!_.isString(value)) {
      return null;
    }

    if (_.includes(value, '-')) {
      const [min, max] = _.map(value.split('-'), Number);
      return {
        min,
        max,
      };
    }

    if (_.endsWith(value, '+')) {
      return {
        min: Number(value.replace('+', '')),
        max: Infinity,
      };
    }

    return null;
  }

  function populateRegions(users) {
    const uniqueCountries = _.sortBy(_.uniq(_.map(users, 'country')));
    regionSelect.innerHTML = '<option value="">All</option>';
    _.forEach(uniqueCountries, (country) => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      regionSelect.appendChild(option);
    });
  }

  function calculateDaysUntilNextBD(b_date) {
    const today = dayjs();
    let nextBirthday = dayjs(b_date)
      .year(today.year());
    if (nextBirthday.isBefore(today)) {
      nextBirthday = nextBirthday.add(1, 'year');
    }

    return nextBirthday.diff(today, 'days');
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
    teacherCardDialog.querySelector('.birthday-countdown').textContent = `${calculateDaysUntilNextBD(user.b_date)
      .toString()} days until birthday `;

    dialogStar.textContent = user.favorite ? '★' : '☆';
    dialogStar.dataset.email = user.email;

    teacherCardDialog.dataset.lat = user.coordinates?.latitude ?? '';
    teacherCardDialog.dataset.lng = user.coordinates?.longitude ?? '';
    // console.log(`${teacherCardDialog.dataset.lat} ${teacherCardDialog.dataset.lng}`);

    teacherCardDialog.showModal();
    wrapper.style.filter = 'blur(5px)';
  }

  // endregion

  // region render
  function renderByCountiesTable(data) {
    if (!pivotByCountries) {
      pivotByCountries = new WebDataRocks({
        container: '#pivot-by-countries-container',
        toolbar: false,
        height: 500,
        report: {
          dataSource: {
            data,
          },
          slice: {
            rows: [
              {
                uniqueName: 'country',
                caption: 'Country',
              },
            ],
            columns: [
              { uniqueName: 'Measures' },
            ],
            measures: [
              {
                uniqueName: 'full_name',
                aggregation: 'count',
                caption: 'Teachers',
              },
              {
                uniqueName: 'age',
                aggregation: 'average',
                caption: 'Age',
                format: 'age',
              },
            ],
          },
          options: {
            grid: {
              type: 'compact',
              title: 'Teacher by Countries',
              showHeaders: false,
            },
          },
          formats: [{
            name: 'age',
            decimalPlaces: 1,
          }],
        },
      });
    } else {
      pivotByCountries.updateData({ data });
    }
  }

  function renderFlatTablePage(data) {
    if (!pivotFlatTable) {
      pivotFlatTable = new WebDataRocks({
        container: '#pivot-flat-table-container',
        toolbar: false,
        height: 500,
        report: {
          dataSource: {
            data,
          },
          slice: {
            rows: [
              {
                uniqueName: 'full_name',
                caption: 'Name',
              },
              {
                uniqueName: 'course',
                caption: 'Speciality',
              },
              {
                uniqueName: 'age',
                caption: 'Age',
              },
              {
                uniqueName: 'gender',
                caption: 'Gender',
              },
              {
                uniqueName: 'country',
                caption: 'Nationality',
              },
            ],
            flatOrder: ['full_name', 'course', 'age', 'gender', 'country'],
          },
          options: {
            grid: {
              type: 'flat',
              showTotals: 'off',
              showGrandTotals: 'off',
              title: 'Flat Table',
              showHeaders: false,
            },
          },
        },
      });
    } else {
      pivotFlatTable.updateData({ data });
    }
  }

  function renderTeacherList(list) {
    teacherList.innerHTML = '';
    _.forEach(list, (user) => {
      const [firstName, lastName] = _.split(user.full_name, /\s/g);
      const initials = `${_.toUpper(firstName.charAt(0))}.${_.toUpper(lastName.charAt(0))}`;

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
    _.forEach(users, (user) => {
      if (!user.favorite) {
        return;
      }

      const [firstName, lastName] = _.split(user.full_name, /\s/g);
      const initials = `${_.toUpper(firstName.charAt(0))}.${_.toUpper(lastName.charAt(0))}`;

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
    });

    renderFavoritesArrows();
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

  // endregion

  // region filter and search
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

    renderTeacherList(filtered);
  }

  // endregion

  // region events
  [ageSelect, regionSelect, sexSelect, photoCheckbox, favoritesCheckbox].forEach((input) => input.addEventListener('change', applyFiltersAndSearch));

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    applyFiltersAndSearch();
  });

  _.forEach([teacherList, teacherFavorites], (list) => {
    list.addEventListener('click', (e) => {
      const block = e.target.closest('.teacher-block');
      if (!block) {
        return;
      }

      const user = _.find(users, { email: block.dataset.email });
      if (user) {
        openTeacherDialog(user);
      }
    });
  });

  dialogStar.addEventListener('click', () => {
    const user = _.find(users, { email: dialogStar.dataset.email });
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
      mapContainer.style.display = 'none';
      noCoordsMessage.style.display = 'none';
    });

  teacherCardDialog.addEventListener('cancel', () => {
    wrapper.style.filter = 'blur(0px)';
    mapContainer.style.display = 'none';
    noCoordsMessage.style.display = 'none';
  });

  _.forEach(addTeacherOpenBtn, (el) => {
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

  addTeacherForm.addEventListener('submit', async (e) => {
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
        longitude: null,
      },
      timezone: {
        offset: null,
        description: null,
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
        body: JSON.stringify(fixedUser),
      });

      if (!response.ok) {
        throw new Error('Failed to add teacher');
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
      behavior: 'smooth',
    });
  });

  rightArrow.addEventListener('click', () => {
    const amount = getScrollAmount();
    teacherFavorites.scrollBy({
      left: amount,
      behavior: 'smooth',
    });
  });

  toggleMapBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const lat = parseFloat(teacherCardDialog.dataset.lat);
    const lng = parseFloat(teacherCardDialog.dataset.lng);

    if (!_.isNaN(lat) && !_.isNaN(lng)) {
      if (mapContainer.style.display === 'block') {
        mapContainer.style.display = 'none';
      } else {
        mapContainer.style.display = 'block';
        noCoordsMessage.style.display = 'none';

        if (!teacherMap) {
          teacherMap = L.map(mapContainer)
            .setView([lat, lng], 5);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap',
          })
            .addTo(teacherMap);

          teacherMarker = L.marker([lat, lng])
            .addTo(teacherMap);
        } else {
          teacherMarker.setLatLng([lat, lng]);
          teacherMap.setView([lat, lng], 5);
          setTimeout(() => teacherMap.invalidateSize(), 200);
        }
      }
    } else if (noCoordsMessage.style.display === 'block') {
      noCoordsMessage.style.display = 'none';
    } else {
      noCoordsMessage.style.display = 'block';
      mapContainer.style.display = 'none';
    }
  });

  flatTableButton.addEventListener('click', () => {
    pivotFlatTableContainerDiv.style.display = 'block';
    pivotByCountriesContainerDiv.style.display = 'none';
    pieChartCanvas.style.display = 'none';
    renderFlatTablePage(users);
  });

  countriesReportButton.addEventListener('click', () => {
    pivotByCountriesContainerDiv.style.display = 'block';
    pivotFlatTableContainerDiv.style.display = 'none';
    pieChartCanvas.style.display = 'none';
    renderByCountiesTable(users);
  });

  pieChartButton.addEventListener('click', () => {
    pieChartCanvas.style.display = 'block';
    pivotFlatTableContainerDiv.style.display = 'none';
    pivotByCountriesContainerDiv.style.display = 'none';
  });

  moreTeachersButton.addEventListener('click', async () => {
    users = await fetchToExistingUsers(users, 10);

    renderTeacherList(users);
    renderFavorites(users);
    renderFlatTablePage(users);
    renderByCountiesTable(users);
    renderPieChart(users);

    document.getElementById('statistics')
      .scrollIntoView();
  });
  // endregion

  // region init
  populateRegions(users);
  renderTeacherList(users);
  renderFavorites(users);
  renderFavoritesArrows();
  renderFlatTablePage(users, false);
  renderPieChart(users);
  pieChartCanvas.style.display = 'none';
  // endregion
});
