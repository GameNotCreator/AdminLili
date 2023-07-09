$(document).ready(function() {
    $("#forgot-password-form").on("submit", function(e) {
        e.preventDefault();
        const email = $("#email").val();

        // Send email address to the server
        $.ajax({
            url: "/api/auth/forgot-password",
            method: "POST",
            data: { email },
            success: function(response) {
                if (response.error) {
                    alert(response.error);
                } else {
                    $("#forgot-password-form").hide();
                    $("#reset-password-form").show();
                }
            }
        });
    });

    $("#reset-password-form").on("submit", function(e) {
        e.preventDefault();
        const email = $("#email").val();
        const verificationCode = $("#verification-code").val();
        const newPassword = $("#new-password").val();

        // Send email, verification code, and new password to the server
        $.ajax({
            url: "/api/auth/reset-password",
            method: "POST",
            data: { email, verificationCode, newPassword },
            success: function(response) {
                if (response.error) {
                    alert(response.error);
                } else {
                    alert("Password reset successfully. Please log in with your new password.");
                    window.location.href = "index.html";
                }
            }
        });
    });
});
