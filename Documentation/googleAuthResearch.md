# Google Auth2.0 Implementation Research

## Useful pages

<https://medium.com/@thomashellstrom/use-google-as-login-in-your-web-app-with-oauth2-352f6c7f10e6>
<https://developers.google.com/identity/sign-in/web/sign-in?source=post_page-----352f6c7f10e6--------------------------------------->
<https://developers.google.com/identity/gsi/web/guides/display-button#html_1>

Verify JWT: <https://developers.google.com/identity/gsi/web/guides/verify-google-id-token>

After decoding the JWT credential:
payload
{
  "iss": "https://accounts.google.com", // The JWT's issuer
  "nbf":  161803398874,
  "aud": "314159265-pi.apps.googleusercontent.com", // Your server's client ID
  "sub": "3141592653589793238", // The unique ID of the user's Google Account
  "hd": "gmail.com", // If present, the host domain of the user's GSuite email address
  "email": "elisa.g.beckett@gmail.com", // The user's email address
  "email_verified": true, // true, if Google has verified the email address
  "azp": "314159265-pi.apps.googleusercontent.com",
  "name": "Elisa Beckett",
                            // If present, a URL to user's profile picture
  "picture": "https://lh3.googleusercontent.com/a-/e2718281828459045235360uler",
  "given_name": "Elisa",
  "family_name": "Beckett",
  "iat": 1596474000, // Unix timestamp of the assertion's creation time
  "exp": 1596477600, // Unix timestamp of the assertion's expiration time
  "jti": "abc161803398874def"
}
