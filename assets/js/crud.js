document.addEventListener('DOMContentLoaded', (event) => {
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

       if (user_id !== "" && (user_role === "admin" || user_role === "dev")) {
           return true;
       } else {
           return false;
       }
   }

   function loadUsers() {
       if (!checkAccess()) {
           window.location.href = "/access_denied";
           return;
       }

       $.get('/api/users/users/', function (users) {
           const tbody = $('#userTable tbody');
           tbody.empty();

           users.forEach(user => {
               const tr = $('<tr>');
               tr.append(`<td><input type="text" id="email-input-${user._id}" value="${user.email}" data-original="${user.email}" disabled /></td>`);
               tr.append(`<td><input type="text" id="first-name-input-${user._id}" value="${user.first_name}" data-original="${user.first_name}" disabled /></td>`);
               tr.append(`<td><input type="text" id="last-name-input-${user._id}" value="${user.last_name}" data-original="${user.last_name}" disabled /></td>`);
               tr.append(`<td><select id="role-select-${user._id}" data-original="${user.role || 'N/A'}" disabled>
                             <option value="dev" ${user.role === "dev" ? "selected" : ""}>dev</option>
                             <option value="admin" ${user.role === "admin" ? "selected" : ""}>admin</option>
                             <option value="serveur" ${user.role === "serveur" ? "selected" : ""}>serveur</option>
                             <option value="client" ${user.role === "client" ? "selected" : ""}>client</option>
                          </select></td>`);

               const actionTd = $('<td>');
               const editButton = $('<button class="edit">📝</button>'); // Utilisation de l'emoji crayon
               const cancelButton = $('<button class="cancel">🗑</button>'); // Utilisation de l'emoji corbeille
               actionTd.append(editButton);
               actionTd.append(cancelButton);
               tr.append(actionTd);

               editButton.on('click', function () {
                   editUser(user._id, editButton, cancelButton);
               });

               cancelButton.on('click', function () {
                   cancelEdit(user._id, editButton, cancelButton);
               });

               tbody.append(tr);
           });
       });
   }

   $('[data-title="Crud"]').on('click', function () {
       loadUsers();
   });

   function deleteUser(userId) {
       $.ajax({
           url: '/api/users/users/' + userId,
           type: 'DELETE',
           success: function (result) {
               loadUsers();
           }
       });
   }

   function editUser(userId, editButton, cancelButton) {
       const emailInput = document.getElementById(`email-input-${userId}`);
       const firstNameInput = document.getElementById(`first-name-input-${userId}`);
       const lastNameInput = document.getElementById(`last-name-input-${userId}`);
       const roleSelect = document.getElementById(`role-select-${userId}`);

       if (editButton.html() === "📝") {
           emailInput.disabled = false;
           firstNameInput.disabled = false;
           lastNameInput.disabled = false;
           roleSelect.disabled = false;

           editButton.html("✅"); // Utilisation de l'emoji coche
           cancelButton.html("❌"); // Utilisation de l'emoji croix rouge
       } else {
           // Sauvegarder les modifications et les envoyer au serveur
           emailInput.disabled = true;
           firstNameInput.disabled = true;
           lastNameInput.disabled = true;
           roleSelect.disabled = true;

           const updatedUser = {
               email: emailInput.value,
               first_name: firstNameInput.value,
               last_name: lastNameInput.value,
               role: roleSelect.value,
           };

           // Envoyer les données mises à jour au serveur
            $.ajax({
                  url: '/api/users/users/' + userId,
                  type: 'PUT',
                  contentType: 'application/json',
                  data: JSON.stringify(updatedUser),
                  success: function (result) {
                     if (result.success) {
                        loadUsers(); // Recharger la liste des utilisateurs
                     } else {
                        console.error('User update failed:', result.message);
                     }
                  },
                  error: function (jqXHR, textStatus, errorThrown) {
                     console.error('User update failed:', textStatus, errorThrown);
                  },
            });

           // Ici, vous pouvez envoyer les données mises à jour au serveur
           console.log(updatedUser);

           editButton.html("📝"); // Utilisation de l'emoji crayon
           cancelButton.html("🗑"); // Utilisation de l'emoji corbeille
       }
   }

   function cancelEdit(userId, editButton, cancelButton) {
       if (editButton.html() === "✅") {
           const emailInput = document.getElementById(`email-input-${userId}`);
           const firstNameInput = document.getElementById(`first-name-input-${userId}`);
           const lastNameInput = document.getElementById(`last-name-input-${userId}`);
           const roleSelect = document.getElementById(`role-select-${userId}`);

           // Annuler les modifications et restaurer les valeurs d'origine
           emailInput.value = emailInput.getAttribute("data-original");
           firstNameInput.value = firstNameInput.getAttribute("data-original");
           lastNameInput.value = lastNameInput.getAttribute("data-original");
           roleSelect.value = roleSelect.getAttribute("data-original");

           emailInput.disabled = true;
           firstNameInput.disabled = true;
           lastNameInput.disabled = true;
           roleSelect.disabled = true;

           editButton.html("📝"); // Utilisation de l'emoji crayon
           cancelButton.html("🗑"); // Utilisation de l'emoji corbeille
       } else {
           deleteUser(userId);
       }
   }

   loadUsers();
});
