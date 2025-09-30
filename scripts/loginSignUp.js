/**
 * shows start content, after the start animation finished
 */
function addDisplayToContent() {
  document.getElementById("header-div").classList.remove("animation-hide");
  document.getElementById("login-div").classList.remove("animation-hide");
  document.getElementById("footer").classList.remove("animation-hide");
}

window.addEventListener("DOMContentLoaded", () => {
  /**
   * Represents the "Sign Up" button element in the DOM. Used to avoid conflicts with the login Div.
   * Used to handle user interactions for signing up.
   * @type {HTMLButtonElement}
   */
  const btn = document.getElementById("sign-up-btn");
  setTimeout(() => {
    btn.removeAttribute("disabled");
  }, 2500);
});

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
  const parts = user.name.trim().split(" ");
  loggedInUser.initals = parts[0][0];
  if (parts.length > 1) {
    loggedInUser.initals += parts[1][0];
  }
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
  document.getElementById("wrong-password-info").innerText =
    "Check your email and password.Please try again.";
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
  if (!checkValidEmail()) return;
  if (
    document.getElementById("password-input-sign-up").value !==
    document.getElementById("confirm-input-sign-up").value
  ) {
    document.getElementById("wrong-password-info-sign-up").innerText =
      "Your passwords don't match.Please try again.";
    document.getElementById("confirm-input-sign-up").classList.add("wrongPassword");
    document.getElementById("confirm-icon-sign-up").classList.add("wrongPassword");
    return;
  }
  await signUpUser();
}

/**
 * Validates the email input field in the sign-up form.
 * Checks if the entered email matches a standard email format.
 * If invalid, displays an error message and applies error styling to the input and icon.
 * If valid, removes error message and styling.
 *
 * @returns {void}
 */
function checkValidEmail() {
  const emailInput = document.getElementById("email-input-sign-up");
  const emailValue = emailInput.value.trim();
  const emailError = document.getElementById("wrong-email-info-sign-up");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailValue)) {
    emailError.innerText = "Please enter a valid email address.";
    emailInput.classList.add("wrongPassword");
    document.getElementById("mail-icon-sign-up").classList.add("wrongPassword");
    return false;
  } else {
    emailError.innerText = "";
    emailInput.classList.remove("wrongPassword");
    document.getElementById("mail-icon-sign-up").classList.remove("wrongPassword");
    return true;
  }
}

/**
 * Handles the user sign-up process.
 * Checks if the privacy policy checkbox is accepted before proceeding.
 * If accepted, retrieves new user data and saves it to Firebase.
 * Displays an error message if the checkbox is not checked.
 *
 * @async
 * @function signUpUser
 * @returns {Promise<void>} Resolves when the user is saved or the process is halted due to missing checkbox acceptance.
 */
async function signUpUser() {
  if (!document.getElementById("checkbox-input-sign-up").checked) {
    document.getElementById("missing-checkbox-info-sign-up").innerText =
      "You need to accept the Privacy policy to continue.";
    return;
  }
  const newUser = getNewUserData();
  await saveUserToFirebase(newUser);
}

/**
 * Retrieves new user data from sign-up input fields, updates the `loggedInUser` object with the username and initials,
 * stores it in localStorage, and returns the new user data.
 *
 * @returns {Object} An object containing the new user's name, email, and password.
 */
function getNewUserData() {
  const newUser = {
    name: document.getElementById("name-input-sign-up").value.trim(),
    Email: document.getElementById("email-input-sign-up").value.trim(),
    Password: document.getElementById("password-input-sign-up").value.trim(),
  };
  loggedInUser.username = newUser.name;
  const nameParts = newUser.name.split(" ");
  if (nameParts.length >= 2) loggedInUser.initals = nameParts[0][0] + nameParts[1][0];
  else loggedInUser.initals = nameParts[0][0];
  localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
  return newUser;
}

/**
 * function to put data to firebase
 * @param {*} userData - parameter from function sigUpUser - Data from input.value
 */
async function saveUserToFirebase(userData) {
  try {
    const response = await fetch(BASE_URL_USERS);
    const contacts = await response.json();
    const newId = Object.keys(contacts || {}).length;
    await fetch(
      `https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/users/${newId}.json`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, id: newId }),
      }
    );
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
    window.location.href = "index.html";
  }, 3500);
}

/**
 * Logs in the user as a guest by setting a default user object,
 * storing it in localStorage, and redirecting to the summary page.
 *
 * @function
 */
const loginAsGuest = () => {
  loggedInUser = {
    username: "Guest User",
    initals: "G",
  };
  localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
  window.location.href = "summary.html";
};

/**
 * Validates the sign-up form input fields and enables or disables the sign-up button accordingly.
 * Button is only enabled when all fields are filled, email is valid, passwords match, and checkbox is checked.
 */
function checkSignUpValues() {
  const nameInput = document.getElementById("name-input-sign-up").value.trim();
  const emailInput = document.getElementById("email-input-sign-up").value.trim();
  const passwordInput = document.getElementById("password-input-sign-up").value.trim();
  const confirmInput = document.getElementById("confirm-input-sign-up").value.trim();
  const checkbox = document.getElementById("checkbox-input-sign-up").checked;
  const btn = document.getElementById("btn-sign-up");
  const allFieldsFilled = nameInput && emailInput && passwordInput && confirmInput && checkbox;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);
  const passwordsMatch = passwordInput === confirmInput;
  btn.toggleAttribute("disabled", !(allFieldsFilled && emailValid && passwordsMatch));
}

/**
 * Checks the values of the email and password input fields.
 * Disables the login button if either field is empty, otherwise enables it.
 *
 * @function
 */
function checkLoginValues() {
  const emailInput = document.getElementById("email-input").value.trim();
  const passwordInput = document.getElementById("password-input").value.trim();
  const btn = document.getElementById("btn-login-div").querySelector(".grey-btn");
  if (emailInput === "" || passwordInput === "") {
    btn.setAttribute("disabled", "disabled");
  } else {
    btn.removeAttribute("disabled");
  }
}

/**
 * Validates the email input in the sign-up form.
 *
 * This function checks whether the entered email address matches a valid format
 * using a regular expression. If the email is invalid, an error message is displayed
 * below the input field, and the input as well as the associated icon are styled with
 * an error class. If the email is valid, the error message and error styles are removed.
 *
 * @function checkEmail
 * @returns {void} This function does not return a value.
 */
function checkEmail() {
  const emailInput = document.getElementById("email-input-sign-up");
  const emailValue = emailInput.value.trim();
  const emailError = document.getElementById("wrong-email-info-sign-up");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailValue)) {
    emailError.innerText = "Please enter a valid email address.";
    emailInput.classList.add("wrongPassword");
    document.getElementById("mail-icon-sign-up").classList.add("wrongPassword");
  } else {
    emailError.innerText = "";
    emailInput.classList.remove("wrongPassword");
    document.getElementById("mail-icon-sign-up").classList.remove("wrongPassword");
  }
  checkSignUpValues();
}

/**
 * Validates the sign-up name input field.
 * If the input is empty, displays an error message and adds error styling.
 * Otherwise, clears the error message and removes error styling.
 */
function messageMissingName() {
  if (document.getElementById("name-input-sign-up").value.trim() === "") {
    document.getElementById("wrong-name-info-sign-up").innerText = "Please enter your name.";
    document.getElementById("name-input-sign-up").classList.add("wrongPassword");
    document.getElementById("user-icon-sign-up").classList.add("wrongPassword");
  } else {
    document.getElementById("wrong-name-info-sign-up").innerText = "";
    document.getElementById("name-input-sign-up").classList.remove("wrongPassword");
    document.getElementById("user-icon-sign-up").classList.remove("wrongPassword");
  }
  checkSignUpValues();
}

/**
 * Checks if the sign-up password input field is empty.
 * If empty, displays an error message and applies error styling to the input and lock icon.
 * If not empty, clears the error message and removes error styling.
 */
function messageMissingPassword() {
  if (document.getElementById("password-input-sign-up").value.trim() === "") {
    document.getElementById("wrong-password-info-sign-up").innerText =
      "Please enter your password.";
    document.getElementById("password-input-sign-up").classList.add("wrongPassword");
    document.getElementById("lock-icon-sign-up").classList.add("wrongPassword");
  } else {
    document.getElementById("wrong-password-info-sign-up").innerText = "";
    document.getElementById("password-input-sign-up").classList.remove("wrongPassword");
    document.getElementById("lock-icon-sign-up").classList.remove("wrongPassword");
  }
  checkSignUpValues();
}

/**
 * Displays a message and applies styling if the confirm password input is empty.
 * Removes the message and styling if the input is not empty.
 *
 * Checks the value of the confirm password input field. If empty, sets an error message
 * and adds a CSS class to indicate an error. If not empty, clears the error message and removes the CSS class.
 */
function messageMissingConfirmPassword() {
  if (document.getElementById("confirm-input-sign-up").value.trim() === "") {
    document.getElementById("wrong-confirm-password-info-sign-up").innerText =
      "Please enter your confirm password.";
    document.getElementById("confirm-input-sign-up").classList.add("wrongPassword");
    document.getElementById("confirm-icon-sign-up").classList.add("wrongPassword");
  } else {
    document.getElementById("wrong-confirm-password-info-sign-up").innerText = "";
    document.getElementById("confirm-input-sign-up").classList.remove("wrongPassword");
    document.getElementById("confirm-icon-sign-up").classList.remove("wrongPassword");
  }
  checkSignUpValues();
}
