window.addEventListener('beforeunload', () => {
    const loginForm = window.opener && window.opener.document.getElementById('login-form');
    if (loginForm) {
      loginForm.reset();
    }
});

document.getElementById('logout').addEventListener('click', () => {
    document.getElementById('login-form').reset();
    window.location.href = "index.html";
});  