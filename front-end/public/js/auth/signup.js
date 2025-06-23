// auth/signup.js
import { flash } from '../../script.js';
import { registerUser } from '../../api/users.js';

const form = document.querySelector('main form');
const roleSelect = document.getElementById('signup-role');
const studentIdGroup = document.getElementById('student-id-group');
const institutionIdGroup = document.getElementById('institution-id-group');

// Show/hide Student ID field based on role selection
if (roleSelect) {
  roleSelect.addEventListener('change', () => {
    const selectedRole = roleSelect.value;
    studentIdGroup.style.display = selectedRole === 'student' ? 'block' : 'none';
    institutionIdGroup.style.display = selectedRole === 'institution_representative' ? 'block' : 'none';
  });
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const role     = form.role.value;
  const username = form.username.value.trim();
  const password = form.password.value;
  
  // Get student_id or institution_id based on role
  const student_id = role === 'student' ? form.student_id?.value.trim() : undefined;
  const institution_id = role === 'institution_representative' ? form.institution_id?.value.trim() : undefined;

  if (!username || !password) {
    return flash('Username and password are required');
  }

  // Check for required role-specific fields
  if (role === 'student' && !student_id) {
    return flash('Student ID is required for student registration');
  }
  
  if (role === 'institution_representative' && !institution_id) {
    return flash('Institution ID is required for institution representative registration');
  }

  try {
    await registerUser({ username, password, role, student_id, institution_id });
    flash('Signup successful! Redirecting to login…');
    setTimeout(() => (window.location.href = '/login'), 1500);
  } catch (err) {
    flash(`Error: ${err.message}`);
  }
});
