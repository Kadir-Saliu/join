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
 * Saves user information to localStorage with username and initials.
 * @param {Object} user - The user object containing user details.
 * @param {string} user.name - The full name of the user.
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
 * Validates email format in sign-up form and updates UI accordingly.
 * @returns {boolean} True if email is valid, false otherwise.
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
 * Handles user sign-up process after privacy policy validation.
 * @async
 * @returns {Promise<void>}
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
 * Retrieves user data from sign-up form and updates localStorage.
 * @returns {Object} User object with name, email, and password.
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
 * Logs in user as guest and redirects to summary page.
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
 * Validates if a name contains exactly two words (first name and surname).
 * @param {string} name - The name to validate.
 * @returns {boolean} True if the name has exactly two words, false otherwise.
 */
function validateFullName(name) {
  const trimmedName = name.trim();
  const words = trimmedName.split(/\s+/);
  return words.length === 2 && words.every((word) => word.length > 0);
}

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
  const nameValid = validateFullName(nameInput);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);
  const passwordsMatch = passwordInput === confirmInput;
  btn.toggleAttribute("disabled", !(allFieldsFilled && nameValid && emailValid && passwordsMatch));
}

/**
 * Enables/disables login button based on email and password input.
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
 * Validates email format in sign-up form and applies styling.
 * @returns {void}
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
 * Checks if name is empty or doesn't contain exactly two words (first name and surname).
 * Displays appropriate error messages and styling.
 */
function messageMissingName() {
  const nameValue = document.getElementById("name-input-sign-up").value.trim();
  const nameError = document.getElementById("wrong-name-info-sign-up");
  const nameInput = document.getElementById("name-input-sign-up");
  const userIcon = document.getElementById("user-icon-sign-up");
  if (nameValue === "") {
    setNameError(nameError, nameInput, userIcon, "Please enter your name.");
  } else if (!validateFullName(nameValue)) {
    setNameError(nameError, nameInput, userIcon, "Please enter your first and last name.");
  } else {
    removeNameErrorMessage(nameError, nameInput, userIcon);
  }
  checkSignUpValues();
}

/**
 * Sets error styling and message for name input validation.
 * @param {HTMLElement} nameError - Error message element
 * @param {HTMLElement} nameInput - Name input field element
 * @param {HTMLElement} userIcon - User icon element
 * @param {string} errorMessage - Error message text
 */
const setNameError = (nameError, nameInput, userIcon, errorMessage) => {
  nameError.innerText = errorMessage;
  nameInput.classList.add("wrongPassword");
  userIcon.classList.add("wrongPassword");
};

/**
 * Removes error styling and message from name input validation.
 * @param {HTMLElement} nameError - Error message element
 * @param {HTMLElement} nameInput - Name input field element
 * @param {HTMLElement} userIcon - User icon element
 */
const removeNameErrorMessage = (nameError, nameInput, userIcon) => {
  nameError.innerText = "";
  nameInput.classList.remove("wrongPassword");
  userIcon.classList.remove("wrongPassword");
};

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
 * Validates confirm password field and applies styling.
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
