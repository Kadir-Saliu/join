const BASE_URL = "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/.json";
const BASE_URL_USERS = "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/users.json";
const BASE_URL_TICKETS = "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets.json";
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || {
  username: "",
  initals: "",
};

function init() {
  includeHTML();
  removeUserfromLocalStorage();
  setTimeout(addDisplayToContent, 2500);
  const logo = document.querySelector(".slide-out-tl");
  logo.addEventListener("animationend", () => {
    addDisplayToContent();
  });
}

function summaryInit() {
  includeHTML();
  greetUser();
}

/**
 * get contact data
 * @param {*} event - parameter to prevent Default behaviour
 */
async function getContactsData(event) {
  event.preventDefault();
  try {
    let response = await fetch(BASE_URL_USERS);
    let responseJson = await response.json();
    let users = Object.values(responseJson || {}).filter((contact) => contact !== null);
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
    let tickets = Object.values(responseJson || {}).filter((ticket) => ticket !== null);
    return tickets;
  } catch (error) {
    console.log("error");
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

function popUpAccNav() {
  document.getElementsByClassName("account-nav-render-div")[0].classList.toggle("hide");
  document.getElementById("board-overlay-transparent").classList.toggle("hide");
}

function popUpDropDownUsers() {
  document.getElementById("drop-down-users").classList.toggle("hide");
}

function popUpDropDownCategory() {
  document.getElementById("drop-down-category").classList.toggle("hide");
}

function popUpDropDownUsersInEdit() {
  document.getElementById("drop-down-users-edit").classList.toggle("hide");
}

function popUpDropDownUsersInBoard() {
  document.getElementById("drop-down-users-board").classList.toggle("hide");
}

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
  }
}
