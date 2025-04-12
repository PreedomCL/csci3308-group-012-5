let handleCredentialResponse = (response) => {
    console.log("Encoded JWT ID token: " + response.credential);
    console.log(response);

    // send the Google login info to the server
    fetch('/glogin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(response)
    }).then(async response => {
        if(response.ok) {
            data = await response.json();
            // redirect to either /profile or /gregister
            window.location.href = data.redirect;
        }
    });
};

window.onload = () => {
    google.accounts.id.initialize({
        client_id: "1070951263088-sp0gkgou33au2ufhhfmbtivduhd0tn3b.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("gbutton"),
        { theme: "outline", size: "large" }  // customization attributes
    );
    google.accounts.id.prompt(); // also display the One Tap dialog
};