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
 * checking if email match password
 * @param {*} data - parameter for the firebase contacts
 * @returns
 */
async function checkLoginData(data) {
  const email = document.getElementById("email-input").value;
  const password = document.getElementById("password-input").value;
  const user = data.users.find((user) => user.Email === email);

  if (user && user.Password === password) {
    saveUserToLocalStorage(user);
    window.location.href = "summary.html";
  } else {
    wrongPassword();
  }
}

/**
 * Saves the given user information to localStorage under the key "loggedInUser".
 * Sets the username and initials properties of the loggedInUser object.
 * Initials are generated from the first letters of the first and second words in the user's name.
 *
 * @param {Object} user - The user object containing user details.
 * @param {string} user.name - The full name of the user (expects at least two words).
 */
function saveUserToLocalStorage(user) {
  loggedInUser.username = user.name;
  loggedInUser.initals = user.name.split(" ")[0][0] + user.name.split(" ")[1][0];
  localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
}

/**
 * function to add wrong password class to the input fields and the icon
 */
function wrongPassword() {
  document.getElementById("lock-icon").classList.add("wrongPassword");
  document.getElementById("password-input").classList.add("wrongPassword");
  document.getElementById("mail-icon").classList.add("wrongPassword");
  document.getElementById("email-input").classList.add("wrongPassword");
  document.getElementById("wrong-password-info").innerText = "Check your email and password.Please try again.";
  document.getElementById("password-input").value = "";
  document.getElementById("wrong-password-info").classList.add("wrongPasswordText");
}

/**
 * check data from the sign up form
 * @param {*} event - parameter to prevent default behaviour
 * @returns
 */
async function checkUserDataInput(event) {
  event.preventDefault();
  if (!document.getElementById("sign-up-div").checkValidity()) {
    document.getElementById("sign-up-div").reportValidity();
    return;
  }
  if (document.getElementById("password-input-sign-up").value !== document.getElementById("confirm-input-sign-up").value) {
    document.getElementById("wrong-password-info-sign-up").innerText = "Your passwords don't match.Please try again.";
    document.getElementById("confirm-input-sign-up").classList.add("wrongPassword");
    document.getElementById("confirm-icon-sign-up").classList.add("wrongPassword");
    return;
  }
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
    };
    loggedInUser.username = newUser.name;
    loggedInUser.initals = newUser.name.split(" ")[0][0] + newUser.name.split(" ")[1][0];
    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
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
    let response = await fetch(BASE_URL_USERS);
    let contacts = await response.json();
    let newId = contacts.length;
    userData.id = newId;
    await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/users/${newId}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    showSuccessAnimationAndRedirect();
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

/**
 * Userfeedback Animation for succesfully Sign Up
 */
function showSuccessAnimationAndRedirect() {
  const overlay = document.getElementById("signup-overlay");
  const message = document.getElementById("signup-message");
  overlay.style.display = "flex";
  overlay.style.animation = "fadeOutOverlay 3.5s forwards";
  message.style.animation = "slideMessage 3.5s forwards";
  setTimeout(() => {
    window.location.href = "summary.html";
  }, 3500);
}

const loginAsGuest = () => {
  loggedInUser = {
    username: "Guest User",
    initals: "G",
  };
  localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
  window.location.href = "summary.html";
};

/*document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name-input-sign-up");
  const emailInput = document.getElementById("email-input-sign-up");
  const passwordInput = document.getElementById("password-input-sign-up");
  const confirmInput = document.getElementById("confirm-input-sign-up");
  const checkbox = document.getElementById("checkbox-input-sign-up");
  const signUpBtn = document.getElementById("sign-up-btn");

  function validateForm() {
    const nameValid = nameInput.value.trim() !== "";
    const emailValid = emailInput.value.trim() !== "";
    const passwordValid = passwordInput.value.trim() !== "";
    const confirmValid = confirmInput.value.trim() !== "";
    const checkboxChecked = checkbox.checked;

    // Button aktivieren, wenn alles passt
    signUpBtn.disabled = !(nameValid && emailValid && passwordValid && confirmValid && checkboxChecked);
  }

  // Event Listener für alle Inputs + Checkbox
  [nameInput, emailInput, passwordInput, confirmInput, checkbox].forEach(el => {
    el.addEventListener("input", validateForm);
    el.addEventListener("change", validateForm);
  });
})*/

function validateForm() {
if(document.getElementById("name-input-sign-up").value.trim()){
  console.log(document.getElementById("sign-up-btn").disabled);
  document.getElementById("sign-up-btn").disabled = true;
  console.log(document.getElementById("sign-up-btn").disabled);
  
  
}
}