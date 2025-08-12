// Utility to clear all user data for fresh start
console.log('Clearing all user data...');

// Clear all localStorage data
if (typeof window !== 'undefined') {
  localStorage.removeItem('student_users');
  localStorage.removeItem('faculty_users');
  localStorage.removeItem('student_session');
  localStorage.removeItem('faculty_session');
  localStorage.removeItem('student_credentials');
  localStorage.removeItem('faculty_credentials');
  localStorage.removeItem('currentUser');
  
  console.log('All user data cleared successfully!');
  console.log('You can now start fresh registration.');
} else {
  console.log('Run this in browser console to clear data:');
  console.log(`
localStorage.removeItem('student_users');
localStorage.removeItem('faculty_users');
localStorage.removeItem('student_session');
localStorage.removeItem('faculty_session');
localStorage.removeItem('student_credentials');
localStorage.removeItem('faculty_credentials');
localStorage.removeItem('currentUser');
console.log('Data cleared!');
  `);
}
