document.addEventListener('DOMContentLoaded', (event) => {
    const profileForm = document.getElementById('profile-form');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const submitChangesBtn = document.getElementById('submit-changes-btn');
    const inputs = profileForm.querySelectorAll('input');
 
    function getCookie(name) {
      let cookieArray = document.cookie.split(';');
      for (let i = 0; i < cookieArray.length; i++) {
         let cookie = cookieArray[i];
         while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
         }
         if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length + 1, cookie.length);
         }
      }
      return "";
   }

    function checkAccess() {
      let user_id = getCookie("user_id");
      let user_role = getCookie("user_role");

      if (user_id !== "" && (user_role === "admin" || user_role === "client" || user_role === "serveur" || user_role === "dev")) {
         return true;
      } else {
         return false;
      }
   }

    // Set input fields to read-only
    function setReadOnlyInputs(readonly) {
       inputs.forEach(input => input.readOnly = readonly);
    }
 
    async function fetchProfile() {
      if (!checkAccess()) {
         window.location.href = "/";
         return;
      }
       try {
          const response = await fetch('/api/auth/profile');
          if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
          }
          const user = await response.json();
          inputs.forEach(input => {
             input.value = user[input.name] || '';
          });
       } catch (error) {
          console.error('Failed to fetch profile:', error);
       }
    }
 
    function editProfile() {
       setReadOnlyInputs(false);
       editProfileBtn.style.display = 'none';
       submitChangesBtn.style.display = 'block';
    }
 
    async function updateProfile(e) {
       e.preventDefault();
       const formData = new FormData(profileForm);
       const data = {};
       for (const [key, value] of formData.entries()) {
          data[key] = value;
       }
       const userId = document.cookie
          .split('; ')
          .find(row => row.startsWith('user_id='))
          .split('=')[1]; // Récupérez l'ID de l'utilisateur à partir du cookie
       const response = await fetch(`/api/auth/updateProfile/${userId}`, {
          method: 'POST',
          headers: {
             'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
       });
       const result = await response.json();
       const errorMessageElement = document.getElementById('error-message');
       if (response.ok) {
          setReadOnlyInputs(true);
          editProfileBtn.style.display = 'block';
          submitChangesBtn.style.display = 'none';
          errorMessageElement.textContent = 'Changes are done!';
       } else {
          errorMessageElement.textContent = result.message; // Display the error message from the server
       }
    }
 
    setReadOnlyInputs(true);
    fetchProfile();
 
    editProfileBtn.addEventListener('click', editProfile);
    profileForm.addEventListener('submit', updateProfile);
 
    const oldPasswordInput = document.getElementById('profile_old_password');
    const newPasswordInput = document.getElementById('profile_new_password');
    const toggleOldPasswordBtn = document.getElementById('toggle-old-password');
    const toggleNewPasswordBtn = document.getElementById('toggle-new-password');
 
    function togglePasswordVisibility(input, btn) {
       if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = 'Hide';
       } else {
          input.type = 'password';
          btn.textContent = 'Show';
       }
    }
 
    toggleOldPasswordBtn.addEventListener('click', () => togglePasswordVisibility(oldPasswordInput, toggleOldPasswordBtn));
    toggleNewPasswordBtn.addEventListener('click', () => togglePasswordVisibility(newPasswordInput, toggleNewPasswordBtn));
 });