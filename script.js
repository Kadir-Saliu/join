const BASE_URL = "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/.json";

function init() {
    setTimeout(addDisplayToContent, 2500);
}

/**
 * shows start content, after the start animation finished
 */
function addDisplayToContent() {
    document.getElementById("header-div").classList.remove("animation-hide");
    document.getElementById("login-div").classList.remove("animation-hide");
    document.getElementById("footer").classList.remove("animation-hide");
};

/**
 * switching from-log in menu to sign-up menu and vice versa
 */
function toogleInputMenu() {
    document.getElementById("header-div").classList.toggle("animation-hide");
    document.getElementById("login-div").classList.toggle("animation-hide");
    document.getElementById("sign-up-div").classList.toggle("animation-hide");
}

async function getFirebaseData(event) {
    event.preventDefault();
    try {
    let response = await fetch(BASE_URL);
    let responseJson = await response.json();
    checkLoginData(responseJson);
    console.log(responseJson);
    
  } catch (error) {
    console.log("error")
  };
}

async function checkLoginData(data) {
    for (let i = 0; i < data.contacts.length; i++) {
        if(!data.contacts[i]) continue;
        if(document.getElementById("email-input").value === data.contacts[i].Email) {
            return console.log("success");            
        } else {
            console.log("who are you?");            
        }        
    }
}
