$(document).ready(function() {
    $("#registerModalButton").click(function(e) {
        let username = $('#usernameInput').val().trim();
        let p1 = $('#passwordInput').val().trim();
        let p2 = $('#repasswordInput').val().trim();
        let email = $('#emailInput').val().trim();

        if (p1 !== p2) {
            alert('The passwords must match');
            return false;
        }

        if (!username || !p1 || !p2 || !email) {
            alert('Please fill in all fields');
            return false;
        }

        if (/ /.test(username)) {
            alert('The username may not contain a space');
            return false;
        }

        return true;
    });
});
