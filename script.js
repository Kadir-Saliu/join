const BASE_URL = "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/.json";

function init() {
    setTimeout(addDisplayToContent, 2500);
    getData();
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
        if(document.getElementById("email-input").value === data.contacts[i].Email && document.getElementById("password-input").value === data.contacts[i].Password) {
            window.location.href = "summary.html";
            return console.log("success");            
        } else {
            document.getElementById("lock-icon").classList.add("wrongPassword");
            document.getElementById("password-input").classList.add("wrongPassword");
            document.getElementById("mail-icon").classList.add("wrongPassword");
            document.getElementById("email-input").classList.add("wrongPassword");
            document.getElementById("wrong-password-info").innerText = "Check your email and password.Please try again.";
            document.getElementById("password-input").value = "";
            console.log("who are you?");            
        }        
    }
}

/* sign up part */

async function signUpUser(event) {
    event.preventDefault();
  
    if (document.getElementById("password-input-sign-up").value !== document.getElementById("confirm-input-sign-up").value) {
      alert("Passwords do not match!");
      return;
    }
  
    const newUser = {
      name: document.getElementById("name-input-sign-up").value,
      Email: document.getElementById("email-input-sign-up").value,
      Password: document.getElementById("password-input-sign-up").value,
      "phone number": "",
    };
  
    await saveUserToFirebase(newUser);
}


  async function saveUserToFirebase(userData) {
    try {
      let response = await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/contacts.json`);
      let contacts = await response.json();
      let newId = contacts.length
  
      await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/contacts/${newId}.json`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });
      window.location.href = "summary.html";  
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
  }

