const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskDate = document.getElementById("task-date");
let buttonPriority = "medium";
let buttonCategory;
const subtask = document.getElementById("subtask");
let subtaskArray = [];
let progressColumn;
let ticketID = 0;
const addedUserfeedback = document.getElementById("added-userfeedback");
let subtaskCounter = 0;
let columnVal = 'To do';
let ticketCounter = 0;
let addTaskPopUp = document.getElementById("add-task-pop-up");
let bordOverlay = document.getElementById("board-overlay");
let subtaskValue = [];
let renderBol = false;

document.getElementById("create-task-button").onclick = function () {
    checkRequiredInput(columnVal, true);
};

/**
 * Fetches user data from the server and populates a dropdown menu with the retrieved contacts.
 * Also updates the dropdown arrow UI.
 *
 * @async
 * @function dropDownUsers
 * @param {string} id - The ID of the dropdown element to populate.
 * @param {string} renderId - The ID of the element where the contacts should be rendered.
 * @returns {Promise<void>} Resolves when the dropdown is populated or logs an error if the fetch fails.
 */
async function dropDownUsers(id, renderId, imgId, inputId) {
    try {
        let response = await fetch(BASE_URL_USERS);
        let data = await response.json();
        let responseJson = Object.values(data);
        iterateContacts(responseJson, id, renderId, imgId, inputId);
    } catch (error) {
        console.log(error);
    }
}

/**
 * Iterates over a list of contact objects and renders each contact's name and initials
 * into a specified DOM element using a template function. The background index cycles
 * through a set range for styling purposes.
 *
 * @async
 * @param {Array<Object>} responseJson - Array of contact objects, each expected to have a 'name' property.
 * @param {string} id - The ID of the DOM element where the contacts will be rendered.
 * @param {string} renderId - An identifier passed to the template function for rendering.
 */
async function filterUsers(id, renderId, inputId) {
    try {
        let response = await fetch(BASE_URL_USERS);
        let responseJson = await response.json();
        let responseJsonValues = Object.values(responseJson);
        iterateUsers(responseJsonValues, id, renderId, inputId);
    } catch (error) {
        console.log(error);
    }
}

/**
 * Iterates over a list of users and updates a dropdown element with users whose names match the input value.
 *
 * @param {Array<Object>} users - Array of user objects, each containing at least a 'name' and 'id' property.
 * @param {string} dropDownId - The ID of the dropdown element to update.
 * @param {string} renderId - The ID used for rendering user templates.
 * @param {string} inputId - The ID of the input element used for filtering users by name.
 */
function iterateUsers(users, dropDownId, renderId, inputId) {
    let name;
    let initials;
    let id;
    document.getElementById(dropDownId).innerHTML = "";
    if (document.getElementById(dropDownId).classList.contains("hide")) document.getElementById(dropDownId).classList.remove("hide");
    users.forEach(user => {
        if(user?.name.toLowerCase().includes(document.getElementById(inputId).value.toLowerCase())) {
            name = user?.name;
            id= user?.id;
            initials = name.split(" ").map(n => n[0]).join("").toUpperCase();  
            let isSelected = !!document.querySelector(`.user-icon-selected[data-name="${name}"]`);
            document.getElementById(dropDownId).innerHTML += userDropDownTemplate(name, initials, id, renderId, isSelected); 
        }  
    });
}

/**
 * Iterates over a list of contacts and renders each contact into a specified DOM element.
 * Each contact is displayed using a template with their name, initials, and a background index.
 * 
 * @param {Array<Object>} responseJson - Array of contact objects, each containing at least a 'name' property.
 * @param {string} id - The ID of the DOM element to render the contacts into.
 * @param {string} renderId - An identifier passed to the userDropDownTemplate for rendering purposes.
 */

async function iterateContacts(responseJson, id, renderId, imgId, inputId) {
  if (!renderBol) {
    document.getElementById(id).classList.remove("hide");    
    changeDropDownArrow(imgId);
    renderBol = true;
  } else {
    document.getElementById(id).classList.add("hide");
    changeDropDownArrow(imgId);
    renderBol = false;
    return;
  }
  document.getElementById(id).innerHTML = "";
  let backgroundIndex = 0;
  for (let index = 0; index < responseJson.length; index++) {
    let name = responseJson[index]?.name;
    if (!name) continue;
    backgroundIndex = backgroundIndex > 14 ? 1 : backgroundIndex + 1;
    let initials = name.split(" ").map((n) => n[0]).join("").toUpperCase();
    let isSelected = !!document.querySelector(`.user-icon-selected[data-name="${name}"]`);
    document.getElementById(id).innerHTML += userDropDownTemplate(name, initials, backgroundIndex, renderId, isSelected);
  }
  document.addEventListener("click", function handler(event) {
    if (!document.getElementById(id).contains(event.target) && event.target.id !== inputId) {
      document.getElementById(id).classList.add("hide");
      if(renderBol) changeDropDownArrow(imgId);
      renderBol = false;
      document.removeEventListener("click", handler);
    }
  });
}

/**
 * Checks if all required input fields for a task are valid.
 * If all required fields are valid and validation is true, creates a new ticket.
 *
 * @param {*} columnValue - The value to be used when creating a new ticket.
 * @param {boolean} validation - Flag indicating whether to proceed with ticket creation if inputs are valid.
 */
function checkRequiredInput(columnValue, validation) {
    let hasError = false;
    if (checkRequiredInputTaskTitle()) hasError = true;
    if (checkRequiredInputTaskDate()) hasError = true;
    if (checkRequiredInputCategory()) hasError = true;
    if (!hasError && validation) {
        createNewTicket(columnValue);
    }
}

/**
 * Checks if the task title input is empty and updates the UI accordingly.
 * Displays a warning message and highlights the input field if the title is missing.
 *
 * @returns {boolean} Returns true if the task title is missing, otherwise false.
 */
function checkRequiredInputTaskTitle() {
    if (!taskTitle.value) {
        document.getElementById("missing-title-info").classList.remove("hide");
        taskTitle.style.border = "1px solid red";
        return true;
    } else {
        document.getElementById("missing-title-info").classList.add("hide");
        taskTitle.style.border = "";
        return false;
    }
}

/**
 * Checks if the task date input is provided.
 * If not, displays a missing date info message and highlights the input border in red.
 * If provided, hides the missing date info message and resets the input border.
 *
 * @returns {boolean} Returns true if the task date input is missing, otherwise false.
 */
function checkRequiredInputTaskDate() {
    if (!taskDate.value) {
        document.getElementById("missing-date-info").classList.remove("hide");
        taskDate.style.border = "1px solid red";
        return true;
    } else {
        document.getElementById("missing-date-info").classList.add("hide");
        taskDate.style.border = "";
        return false;
    }
}

/**
 * Checks if the required task category input has been selected.
 * If not selected, displays a warning and highlights the category button.
 * If selected, hides the warning and removes the highlight.
 *
 * @returns {boolean} Returns true if the category is missing, false otherwise.
 */
function checkRequiredInputCategory() {
    if (document.getElementById("category-button").innerText === "Select task category") {
        document.getElementById("missing-category-info").classList.remove("hide");
        document.getElementById("category-button").style.border = "1px solid red";
        return true;
    } else {
        document.getElementById("missing-category-info").classList.add("hide");
        document.getElementById("category-button").style.border = "";
        return false;
    }
}

/**
 * Retrieves the names of users currently selected in the UI.
 *
 * @returns {string[]} An array of selected user names extracted from elements with the class "user-icon-selected".
 */
function getSelectedUsers() {
    let userIcons = document.querySelectorAll(".user-icon-selected");
    let selectedUsers = [];
    userIcons.forEach(uI => {
            selectedUsers.push(uI.dataset.name);
        }
    );
    return selectedUsers;
}

/**
 * Renders the selected users' icons into the specified element by ID.
 * For each checked user checkbox, finds the corresponding user icon color,
 * generates the user's initials, and appends a styled span element to the target container.
 *
 * @param {string} id - The ID of the DOM element where the selected user icons will be rendered.
 */
function renderSelectedUsers(id) {
    let checkboxes = document.querySelectorAll(".user-checkbox");
    let userIconClasses = document.querySelectorAll(".user-icon");
    document.getElementById(id).innerHTML = "";     
    let checkCounter = 0;   
    checkboxes.forEach(cb => {
        checkCounter = renderIcons(cb, checkCounter, userIconClasses, id);
    });
}

/**
 * Renders user icons based on the checkbox state and updates the icon container.
 *
 * @param {HTMLInputElement} cb - The checkbox input element representing a user.
 * @param {number} checkCounter - The current count of checked users.
 * @param {NodeListOf<HTMLElement>} userIconClasses - A list of span elements representing user icons with color data.
 * @param {string} id - The ID of the container element where icons are rendered.
 * @returns {number} The updated count of checked users.
 */
function renderIcons(cb, checkCounter, userIconClasses, id) {
    if (cb.checked) {
        checkCounter++;
        let userIconColor = "";
        let initials = cb.value.split(" ").map(n => n[0]).join("").toUpperCase();
        userIconClasses.forEach(spanClass => {
            if (spanClass.innerText === initials) userIconColor = spanClass.dataset.bcindex;
        });
        if (checkCounter < 6) document.getElementById(id).innerHTML += `<span class="user-icon-selected User-bc-${userIconColor}" data-bcindex="${userIconColor}" data-name="${cb.value}">${initials}</span>`;
        else if (checkCounter === 6) document.getElementById(id).innerHTML += `<span class="user-icon-selected User-bc-14" id="hidden-users">+${checkCounter - 5}</span>`;
        else document.getElementById("hidden-users").innerText = `+${checkCounter - 5}`;
    }
    return checkCounter;
}

/**
 * Reveals the first child element of the given element by removing the "hide" class.
 * Typically used to show buttons or controls when hovering over an element.
 *
 * @param {HTMLElement} ele - The DOM element whose first child will be revealed.
 */
function hoverButtons(ele) {
    ele.firstElementChild.classList.remove("hide");
}

/**
 * Confirms the editing of a subtask, updates its value in the arrays, 
 * removes the input element, and re-renders the subtask list item.
 *
 * @param {HTMLElement} ele - The element that triggered the edit confirmation, containing dataset info.
 * @param {string} liVal - The current value of the subtask list item.
 * @param {string} inputId - The ID of the input element used for editing.
 * @param {string} liId - The ID of the list item element to update.
 */
function confirmEditedSubtask(ele, liVal, inputId, liId) {
    let index = subtaskValue.indexOf(liVal);
    subtaskArray[index].text = document.getElementById(inputId).value;
    subtaskValue[index] = subtaskArray[index].text;    
    document.getElementById(inputId).remove();
    document.getElementById(liId).innerHTML = "";
    document.getElementById(liId).innerHTML =  confirmEditedSubtaskRender(subtaskArray[index].text, liId, ele.dataset.index);
    document.getElementById(liId).setAttribute("onmouseenter", "hoverButtons(this)");
    document.getElementById(liId).setAttribute("onmouseleave", "removeHoverButtons(this)");
    document.getElementById(`${liVal}-${ele.dataset.index}`).classList.remove("edit-div"); 
}

/**
 * Confirms the editing of a subtask in the edit menu by updating the DOM elements accordingly.
 *
 * @param {HTMLElement} ele - The element representing the subtask being edited, containing a dataset index.
 * @param {string} liVal - The base value or identifier for the list item.
 * @param {string} inputId - The ID of the input element containing the edited subtask text.
 * @param {string} liId - The ID of the list item element to update.
 */
function confirmEditedSubtaskInEditMenu(ele, liVal, inputId, liId) {
    let inputText = document.getElementById(inputId).value;
    document.getElementById(inputId).remove();
    document.getElementById(liId).innerHTML =  confirmEditedSubtaskInEditMenuRender(inputText, liId, ele.dataset.index);
    document.getElementById(liId).setAttribute("onmouseenter", "hoverButtons(this)");
    document.getElementById(liId).setAttribute("onmouseleave", "removeHoverButtons(this)");
    document.getElementById(`${liVal}-${ele.dataset.index}`).classList.remove("edit-div");
}
