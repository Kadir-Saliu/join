const BASE_URL =
  "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/.json";
const BASE_URL_USERS =
  "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/users.json";
const BASE_URL_TICKETS =
  "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets.json";
const BASE_URL_CONTACTS =
  "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || {
  username: "",
  initals: "",
};
let tickets;

async function init() {
  await includeHTML();
  removeUserfromLocalStorage();
  setTimeout(addDisplayToContent, 2500);
  const logo = document.querySelector(".slide-out-tl");
  logo.addEventListener("animationend", () => {
    addDisplayToContent();
  });
}

async function summaryInit() {
  loadNavigationAndGreetUser();
}

async function boardInit() {
  loadNavigationAndSetInitials();
  getTicketData();
  minDate();
}

async function addTaskInit() {
  loadNavigationAndSetInitials();
}

async function contactsInit() {
  loadNavigationAndSetInitials();
  showContacts();
}

/**
 * get contact data
 * @param {*} event - parameter to prevent Default behaviour
 */
async function getUsersData(event) {
  event.preventDefault();
  try {
    let response = await fetch(BASE_URL_USERS);
    let responseJson = await response.json();
    let users = Object.values(responseJson || {}).filter(
      (user) => user !== null
    );
    checkLoginData({ users });
  } catch (error) {
    console.log("error");
  }
}

/**
 * This function gets all tickets from the database
 *
 * @returns tickets
 */
async function getTicketData() {
  try {
    let response = await fetch(BASE_URL_TICKETS);
    let responseJson = await response.json();
    tickets = responseJson.ticket;
    let result = Object.values(tickets);
    renderTickets(result);
    return tickets;
  } catch (error) {
    console.log("error");
  }
  allTickets.push(tickets);
  toggleNoTaskContainer();
}

/**
 * This function gets the contact list of the user.
 *
 * @param {json} user
 * @returns contacts
 */
async function getContactsData(user) {
  try {
    let response = await fetch(
      `https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/contacts/${user.id}.json`
    );
    let responseJson = await response.json();
    let contacts = Object.values(responseJson || {}).filter(
      (contact) => contact !== null
    );
    return contacts;
  } catch (error) {
    console.log("error");
  }
}

/**
 * Fetches and returns the subtasks data for a given ticket ID from the Firebase Realtime Database.
 *
 * @async
 * @param {string|number} id - The unique identifier of the ticket.
 * @returns {Promise<Array>} A promise that resolves to an array of subtasks associated with the ticket.
 */
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

/**
 * Toggles the visibility of the account navigation panel and its overlay.
 * Adds or removes the "hide" class from the account navigation div and the overlay element.
 */
function popUpAccNav() {
  document
    .getElementsByClassName("account-nav-render-div")[0]
    .classList.toggle("hide");
  document.getElementById("board-overlay-transparent").classList.toggle("hide");
}


/**
 * Toggles the visibility of the category drop-down menu by adding or removing the "hide" class
 * from the element with the ID "drop-down-category".
 */
function popUpDropDownCategory(imgId) {
  document.getElementById("drop-down-category").classList.toggle("hide");
  changeDropDownArrow(imgId);
}

/**
 * Toggles the visibility of the users dropdown menu in the board.
 * Adds or removes the "hide" class from the element with ID "drop-down-users-board".
 */
function popUpDropDownUsersInBoard() {
  document.getElementById("drop-down-users-board").classList.toggle("hide");
}

/**
 *  Toggles the visibility of the users dropdown menu in the board.
 * Adds or removes the "hide" class from the element with ID "drop-down-category-board".
 */
function popUpDropDownCategoryInBoard() {
  document.getElementById("drop-down-category-board").classList.toggle("hide");
}

/**
 * This function removes the username and intitals from the local storage
 */
function removeUserfromLocalStorage() {
  localStorage.removeItem("loggedInUser");
}

/**
 * This function checks if a user is logged in and greets them. If the guest login is used, the greeting contains only "Good morning".
 */
function greetUser() {
  if (loggedInUser.username) {
    document.getElementById("goodMorning").innerText = "Good morning,";
    document.getElementById("username").innerText = loggedInUser.username;
    document.getElementById("profile").innerText = loggedInUser.initals;
  } else {
    document.getElementById("goodMorning").innerText = "Good morning";
    document.getElementById("username").innerText = "";
    document.getElementById("profile").innerText = "G";
  }
}

/**
 * This function is responsible for the background-color change of the nav-item respective to the current page.
 */
function highlightPageInNav() {
  let currentPage = location.pathname.split("/").pop();
  document.querySelectorAll("a.nav-item").forEach((link) => {
    let linkPage = link.getAttribute("href").replace("./", "");
    link.classList.remove("active");
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });
}

async function loadNavigationAndGreetUser() {
  await includeHTML();
  highlightPageInNav();
  greetUser();
}

/**
 * Loads the navigation HTML, highlights the current page in the navigation,
 * and greets the user. This function asynchronously includes the navigation
 * HTML, then updates the navigation UI and displays a greeting.
 *
 * @async
 * @function
 * @returns {Promise<void>} Resolves when navigation is loaded and user is greeted.
 */
async function loadNavigationAndSetInitials() {
  await includeHTML();
  highlightPageInNav();
  setProfileInitials();
}

/**
 * Sets the profile element's text to the logged-in user's initials if available,
 * otherwise sets it to "G".
 *
 * Assumes the existence of a global `loggedInUser` object with `username` and `initals` properties,
 * and an element with the ID "profile" in the DOM.
 */
function setProfileInitials() {
  if (loggedInUser.username) {
    document.getElementById("profile").innerText = loggedInUser.initals;
  } else {
    document.getElementById("profile").innerText = "G";
  }
}
