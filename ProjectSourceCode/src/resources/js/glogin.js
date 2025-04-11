let handleCredentialResponse = (response) => {
    console.log("Encoded JWT ID token: " + response.credential);
    console.log(response);

    fetch('/glogin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(response)
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