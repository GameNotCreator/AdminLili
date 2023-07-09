$(document).ready(function () {
  // Événement pour la soumission du formulaire de connexion
  $("#login form").on("submit", function (e) {
     e.preventDefault();
     const data = $(this).serialize();

     $.ajax({
        type: "POST",
        url: "/api/auth/login",
        data: data,
        dataType: "json",
        success: function (response) {
           if (response.error) {
              $("#error-message").html(response.error);
           } else {
              window.location.href = "home.html";
           }
        },
     });
  });
});

const formOpenBtn = document.querySelector("#form-open"),
  home = document.querySelector(".home"),
  formContainer = document.querySelector(".form_container"),
  loginBtn = document.querySelector("#login"),
  pwShowHide = document.querySelectorAll(".pw_hide");
pwShowHide.forEach((icon) => {
  icon.addEventListener("click", () => {
    let getPwInput = icon.parentElement.querySelector("input");
    if (getPwInput.type === "password") {
      getPwInput.type = "text";
      icon.classList.replace("uil-eye-slash", "uil-eye");
    } else {
      getPwInput.type = "password";
      icon.classList.replace("uil-eye", "uil-eye-slash");
    }
  });
});