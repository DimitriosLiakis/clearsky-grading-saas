import { flash } from '../../script.js';
import { registerUser, changePassword } from '../../api/users.js';

const form            = document.querySelector('#user-mgmt-form');
const roleSelect      = document.querySelector('#role');
const studentIdGroup  = document.querySelector('#student-id-group');
const institutionIdGroup  = document.querySelector('#institution-id-group');

// Show/hide ID fields based on role
roleSelect.addEventListener('change', () => {
  studentIdGroup.style.display =
    roleSelect.value === 'student' ? 'block' : 'none';
  institutionIdGroup.style.display =
    roleSelect.value === 'institution_representative' ? 'block' : 'none';
});

// Add user handler
form.addEventListener('submit', async e => {
  e.preventDefault();

  const username   = form.username.value.trim();
  const password   = form.password.value;
  const role       = form.role.value;
  const student_id = role === 'student'
    ? form.student_id.value.trim()
    : undefined;
  const institution_id = role === 'institution_representative'
    ? form.institution_id.value.trim()
    : undefined;

  if (!username || !password) {
    return flash('Username and password are required');
  }

  // Validate role-specific fields
  if (role === 'student' && !student_id) {
    return flash('Student ID is required for student registration');
  }
  
  if (role === 'institution_representative' && !institution_id) {
    return flash('Institution ID is required for institution representative registration');
  }

  try {
    await registerUser({ username, password, role, student_id, institution_id });
    flash('User added!');
    form.reset();
    studentIdGroup.style.display = 'none';
    institutionIdGroup.style.display = 'none';
  } catch (err) {
    flash(`Error: ${err.message}`);
  }
});

// Change password handler
const changeForm = document.querySelector('#change-pass-form');
changeForm.addEventListener('submit', async e => {
  e.preventDefault();

  const payload = {
    username     : changeForm.username.value.trim(),
    old_password : changeForm.old_password.value,
    new_password : changeForm.new_password.value
  };

  try {
    await changePassword(payload);
    flash('Password changed ✔');
    changeForm.reset();
  } catch (err) {
    flash(`Error: ${err.message}`);
  }
});
