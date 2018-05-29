/*global WildRydes _config*/

var WildRydes = window.App || {};
WildRydes.map = WildRydes.map || {};

var token;

WildRydes.authToken
    .then((data) => {token = data})
    .catch((err) => {console.log("Got an error while getting the token  " +err)});

