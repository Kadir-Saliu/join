const BASE_URL = "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/";
const BASE_URL_USERS = "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/users.json";
const BASE_URL_TICKETS = "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets.json";
const BASE_URL_CONTACTS = "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || {
  username: "",
  initals: "",
};
let tickets;

/**
 * Initializes the application by loading HTML, clearing user data, and handling animations.
 *
 * This function performs the following steps:
 * 1. Includes HTML content via `includeHTML()`.
 * 2. Removes the current user from localStorage using `removeUserfromLocalStorage()`.
 * 3. Schedules `addDisplayToContent()` to run after a 2.5-second delay.
 * 4. Adds an event listener to the logo element to trigger `addDisplayToContent()` 
 *    when its animation ends.
 *
 * @async
 * @function init
 * @returns {Promise<void>} - Resolves after the HTML is loaded and event listeners are set.
 */
async function init() {
  await includeHTML();
  removeUserfromLocalStorage();
  setTimeout(addDisplayToContent, 2500);
  const logo = document.querySelector(".slide-out-tl");
  logo.addEventListener("animationend", () => {
    addDisplayToContent();
  });
}

/**
 * Initializes the summary page by loading navigation, greeting the user, and rendering tasks.
 *
 * This function calls `loadNavigationAndGreetUser()` to include the navigation HTML,
 * highlight the current page, and greet the user. It then calls `renderTasks()` 
 * to display all tasks on the summary page.
 *
 * @async
 * @function summaryInit
 * @returns {Promise<void>} - Resolves after navigation is loaded and tasks are rendered.
 */
async function summaryInit() {
  loadNavigationAndGreetUser();
  renderTasks();
}

/**
 * Initializes the board page by setting up navigation, loading tickets, and rendering content.
 *
 * This function performs the following steps:
 * 1. Calls `loadNavigationAndSetInitials()` to load the navigation and display user initials.
 * 2. Retrieves ticket data via `getTicketData()`.
 * 3. Updates the visibility of the "no tasks" container using `toggleNoTaskContainer()`.
 * 4. Renders all tickets on the board with `renderTickets()`.
 * 5. Sets the minimum date for relevant date inputs using `minDate()`.
 *
 * @async
 * @function boardInit
 * @returns {Promise<void>} - Resolves after the board is fully initialized and tickets are rendered.
 */
async function boardInit() {
  loadNavigationAndSetInitials();
  getTicketData();
  toggleNoTaskContainer();
  renderTickets();
  minDate();
}

/**
 * Initializes the "Add Task" page by loading navigation and displaying user initials.
 *
 * This function calls `loadNavigationAndSetInitials()` to include the navigation
 * HTML and show the current user's initials.
 *
 * @async
 * @function addTaskInit
 * @returns {Promise<void>} - Resolves after navigation is loaded and initials are set.
 */
async function addTaskInit() {
  loadNavigationAndSetInitials();
}

/**
 * Initializes the contacts page by loading navigation, displaying user initials, and showing contacts.
 *
 * This function performs the following steps:
 * 1. Calls `loadNavigationAndSetInitials()` to include the navigation HTML and display the current user's initials.
 * 2. Calls `showContacts()` to render the list of contacts on the page.
 *
 * @async
 * @function contactsInit
 * @returns {Promise<void>} - Resolves after navigation is loaded and contacts are displayed.
 */
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
    let users = Object.values(responseJson || {}).filter((user) => user !== null);
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
     if (!responseJson.ticket || Object.keys(responseJson.ticket).length === 0) {
      localStorage.setItem("tickets", JSON.stringify([]));
      return {};
     }
    tickets = responseJson.ticket;
    let result = Object.values(tickets);
    localStorage.setItem("tickets", JSON.stringify(result));
    return tickets;
  } catch (error) {
    console.error(error);
  }
}

/**
 * This function gets the contact list of the user.
 *
 * @param {json} user
 * @returns contacts
 */
async function getContactsData(user) {
  try {
    let response = await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/contacts/${user.id}.json`);
    let responseJson = await response.json();
    let contacts = Object.entries(responseJson || {})
      .filter(([, contact]) => contact !== null)
      .map(([firebaseKey, contact]) => ({
        ...contact,
        firebaseKey: firebaseKey,
      }));
    return contacts;
  } catch (error) {
    console.log("Fehler beim Laden der Kontakte: ", error);
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
  document.getElementsByClassName("account-nav-render-div")[0].classList.toggle("hide");
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
function popUpDropDownCategoryInBoard(imgId) {
  document.getElementById("drop-down-category-board").classList.toggle("hide");
  changeDropDownArrow(imgId);
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
    loggedInUser.username === "Guest User"
      ? ((document.getElementById("goodMorning").innerText = "Good morning"), (document.getElementById("username").innerText = ""))
      : ((document.getElementById("goodMorning").innerText = "Good morning,"),
        (document.getElementById("username").innerText = loggedInUser.username));
    document.getElementById("profile").innerText = loggedInUser.initals;
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

/**
 * Loads the navigation HTML, highlights the current page, and greets the user.
 *
 * This function first includes the navigation HTML via `includeHTML()`, then
 * highlights the active page in the navigation using `highlightPageInNav()`,
 * and finally displays a greeting to the user with `greetUser()`.
 *
 * @async
 * @function loadNavigationAndGreetUser
 * @returns {Promise<void>} - Resolves after the navigation is loaded, the page is highlighted, and the user is greeted.
 */
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

/**
 * Redirects the current page to 'board.html' in the same directory.
 */
function goToBoardHtml() {
  location.href = "./board.html";
}

/**
 * Asynchronously retrieves the ID of a user by their name.
 *
 * Fetches the list of users from the BASE_URL_USERS endpoint, filters out null entries,
 * and searches for a user with the specified name. Returns the user's ID if found,
 * otherwise returns 0. Logs an error and returns 0 if the fetch operation fails.
 *
 * @async
 * @param {string} user - The name of the user to search for.
 * @returns {Promise<number>} The ID of the found user, or 0 if not found or on error.
 */
async function getUserDetails(user) {
  try {
    let response = await fetch(BASE_URL_USERS);
    let responseJson = await response.json();
    let users = Object.values(responseJson || {}).filter((u) => u !== null);
    let foundUser = users.find((u) => u.name === user);
    return foundUser ? foundUser.id : 0;
  } catch (error) {
    console.error("error");
    return 0;
  }
}