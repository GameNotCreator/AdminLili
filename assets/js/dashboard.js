document.addEventListener('DOMContentLoaded', (event) => {
    const namediplay = document.getElementById('namedisplay');
    $('body').on("click", "nav ul li a", function () {
       var title = $(this).data('title');
       $('.title').children('h2').html(title);
    });
 
    // Add this function to clear cookies
    function clearAllCookies() {
       const cookies = document.cookie.split(";");
 
       for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
       }
    }
 
    // Add an event listener for the logout button
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
       logoutButton.addEventListener('click', () => {
          clearAllCookies();
          window.location.href = './index.html';
       });
    }
 
    async function fetchProfile() {
       try {
          const response = await fetch('/api/auth/namedisplay');
          if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
          }
          const user = await response.json();
          namediplay.innerHTML = `${user.first_name} ${user.last_name}` || '';
       } catch (error) {
          console.error('Failed to fetch profile:', error);
       }
    }
 
    fetchProfile();
 
 });