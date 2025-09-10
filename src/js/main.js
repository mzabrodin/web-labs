const wrapper = document.querySelector('.wrapper');

const addTeacherDialog = document.querySelector('.add-teacher-dialog');
const openAddTeacherDialogButtons = document.querySelectorAll('.add-teacher-button');
const closeAddTeacherDialogButton = addTeacherDialog.querySelector('.close-button');

const openAddTeacherDialog = () => {
  addTeacherDialog.showModal();
  wrapper.style.filter = 'blur(5px)';
};

openAddTeacherDialogButtons.forEach((button) => {
  button.addEventListener('click', openAddTeacherDialog);
});

closeAddTeacherDialogButton.addEventListener('click', () => {
  addTeacherDialog.close();
  wrapper.style.filter = 'blur(0)';
});

const teacherCardDialog = document.querySelector('.teacher-card-dialog');
const openTeacherCardDialogButtons = document.querySelectorAll('.teacher-img');
const closeTeacherCardDialogButton = teacherCardDialog.querySelector('.close-button');

const openTeacherCardDialog = () => {
  teacherCardDialog.showModal();
  wrapper.style.filter = 'blur(5px)';
};

openTeacherCardDialogButtons.forEach((button) => {
  button.addEventListener('click', openTeacherCardDialog);
});

closeTeacherCardDialogButton.addEventListener('click', () => {
  teacherCardDialog.close();
  wrapper.style.filter = 'blur(0)';
});
