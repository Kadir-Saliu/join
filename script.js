const BASE_URL = "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/.json";

function init() {
  setTimeout(addDisplayToContent, 2500);
  const logo = document.querySelector(".slide-out-tl");
  const wrapper = document.getElementById("logo-wrapper");
  logo.addEventListener("animationend", () => {
    document.getElementById("header-div").classList.remove("animation-hide");
    document.getElementById("login-div").classList.remove("animation-hide");
    document.getElementById("footer").classList.remove("animation-hide");
  });
}

/**
 * shows start content, after the start animation finished
 */
function addDisplayToContent() {
  document.getElementById("header-div").classList.remove("animation-hide");
  document.getElementById("login-div").classList.remove("animation-hide");
  document.getElementById("footer").classList.remove("animation-hide");
}

/**
 * switching from-log in menu to sign-up menu and vice versa
 */
function toogleInputMenu() {
  document.getElementById("header-div").classList.toggle("animation-hide");
  document.getElementById("login-div").classList.toggle("animation-hide");
  document.getElementById("sign-up-div").classList.toggle("animation-hide");
}

/**
 * get contact data
 * @param {*} event - parameter to prevent Default behaviour
 */
async function getFirebaseData(event) {
  event.preventDefault();
  try {
    let response = await fetch(BASE_URL);
    let responseJson = await response.json();
    checkLoginData(responseJson);
    console.log(responseJson);
  } catch (error) {
    console.log("error");
  }
}

/**
 * checking if email match password
 * @param {*} data - parameter for the firebase contacts
 * @returns
 */
async function checkLoginData(data) {
  for (let i = 0; i < data.contacts.length; i++) {
    if (!data.contacts[i]) continue;
    if (
      document.getElementById("email-input").value === data.contacts[i].Email &&
      document.getElementById("password-input").value === data.contacts[i].Password
    ) {
      return (window.location.href = "summary.html");
    } else {
      document.getElementById("lock-icon").classList.add("wrongPassword");
      document.getElementById("password-input").classList.add("wrongPassword");
      document.getElementById("mail-icon").classList.add("wrongPassword");
      document.getElementById("email-input").classList.add("wrongPassword");
      document.getElementById("wrong-password-info").innerText = "Check your email and password.Please try again.";
      document.getElementById("password-input").value = "";
    }
  }
}

/**
 * check data from the sign up form
 * @param {*} event - parameter to prevent default behaviour
 * @returns
 */
async function checkUserDataInput(event) {
  event.preventDefault();
  if (document.getElementById("password-input-sign-up").value !== document.getElementById("confirm-input-sign-up").value) {
    document.getElementById("wrong-password-info-sign-up").innerText = "Your passwords don't match.Please try again.";
    document.getElementById("confirm-input-sign-up").classList.add("wrongPassword");
    document.getElementById("confirm-icon-sign-up").classList.add("wrongPassword");
    return;
  await signUpUser();
}

/**
 * check privacy policy confirmation and sign up user
 * @returns
 */
async function signUpUser() {
  let newUser;
  if (document.getElementById("checkbox-input-sign-up").checked) {
    newUser = {
      name: document.getElementById("name-input-sign-up").value,
      Email: document.getElementById("email-input-sign-up").value,
      Password: document.getElementById("password-input-sign-up").value,
      "phone number": "",
    };
  } else {
    document.getElementById("missing-checkbox-info-sign-up").innerText = "You need to accept the Privacy policy to continue.";
    return;
  }
  await saveUserToFirebase(newUser);
}

/**
 * function to put data to firebase
 * @param {*} userData - parameter from function sigUpUser - Data from input.value
 */
async function saveUserToFirebase(userData) {
  try {
    let response = await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/contacts.json`);
    let contacts = await response.json();
    let newId = contacts.length;
    await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/contacts/${newId}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    window.location.href = "summary.html";
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}

/**
 * switch icon and cursor if password input has a value
 * @param {*} el - this attribut from oninput element
 */
function switchPasswordIcon(el) {
  el.nextElementSibling.src = "./assets/icon/eye_slash_grey.svg";
  el.nextElementSibling.style.cursor = "pointer";
}

/**
 * switch icon and password visibility, if password icon is clicked
 * @param {*} element - this attribut from onclick element
 * @returns
 */
function switchPasswordVisibility(element) {
  if (element.src.includes("/assets/icon/eye_slash_grey.svg")) {
    element.previousElementSibling.type = "text";
    return (element.src = "./assets/icon/eye_grey.svg");
  } else if (element.src.includes("/assets/icon/eye_grey.svg")) {
    element.previousElementSibling.type = "password";
    element.src = "./assets/icon/eye_slash_grey.svg";
  }
}

async function includeHTML() {
  let includeElements = document.querySelectorAll("[template]");
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    file = element.getAttribute("template");
    let resp = await fetch(file);
    if (resp.ok) {
      element.innerHTML = await resp.text();
    } else {
      element.innerHTML = "Page not found";
    }
  }
}
