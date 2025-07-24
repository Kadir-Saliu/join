const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskDate = document.getElementById("task-date");
let buttonPriority;
let buttonCategory;
const subtask = document.getElementById("subtask");
let subtaskArray = [];
let progressColumn;
let ticketID = 0;
const addedUserfeedback = document.getElementById("added-userfeedback");
let subtaskCounter = 0;
let columnVal = 'To do';
let ticketCounter = 0;

document.getElementById("create-task-button").onclick = function () {
    checkRequiredInput(columnVal);
};

/**
 * Sets the priority for a task and updates the UI to reflect the selected priority.
 *
 * @param {string} prio - The priority level to set (e.g., "urgent", "medium", "low").
 * @param {HTMLElement} clickedButton - The button element that was clicked to select the priority.
 */
function setPriority(prio, clickedButton) {   
    buttonPriority = prio;
    let buttons = document.querySelectorAll(".priority-button");
    buttons.forEach(btn => btn.classList.remove("urgent", "medium", "low"));
    clickedButton.classList.add(clickedButton.innerText.toLowerCase().trim());
}

/**
 * Sets the selected category, updates the button text, and hides the dropdown menu.
 *
 * @param {string} category - The category to set as selected.
 * @param {string} idButton - The ID of the button element to update.
 * @param {string} idDropDown - The ID of the dropdown element to hide.
 */
function setCategory(category, idButton, idDropDown) {   
    buttonCategory = category;  
    document.getElementById(idButton).innerText = buttonCategory; 
    document.getElementById(idDropDown).classList.add("hide");
}


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
async function dropDownUsers(id, renderId) {
    try {
        let response = await fetch(BASE_URL_USERS);
        let responseJson = await response.json();
        changeDropDownArrow();
        iterateContacts(responseJson, id, renderId);
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
async function iterateContacts(responseJson, id, renderId) {
    document.getElementById(id).classList.toggle("hide");
    document.getElementById(id).innerHTML = "";
    let backgroundIndex = 0;
    for (let index = 0; index < responseJson.length; index++) {
        let name = responseJson[index]?.name
        if (!name) {
            continue;
        }
        if(backgroundIndex > 14) {
            backgroundIndex = 1;
        } else {
            backgroundIndex ++;
        }
        let initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
        document.getElementById(id).innerHTML += userDropDownTemplate(name, initials, backgroundIndex, renderId);   
    }
}

/**
 * Toggles the dropdown arrow icon for the users input board between "arrow_down" and "arrow_up".
 * Changes the image source of the element with ID "drop-down-users-input-board"
 * depending on its current state.
 */
function changeDropDownArrow() {
    if(document.getElementById("drop-down-users-input-board").src.includes("arrow_down")) {
        document.getElementById("drop-down-users-input-board").src = "./assets/imgs/arrow_up.png"
    } else if (document.getElementById("drop-down-users-input-board").src.includes("arrow_up")) {
        document.getElementById("drop-down-users-input-board").src = "./assets/imgs/arrow_down.png"
    }
};

/**
 * Validates required input fields for creating a new task.
 * Checks if the task title, date, and category are provided.
 * If any required field is missing, displays corresponding error messages and highlights the fields.
 * If all required fields are present, proceeds to create a new ticket.
 *
 * @param {string} columnValue - The value representing the column or category where the new ticket will be added.
 */
function checkRequiredInput(columnValue) {
    let hasError = false;
    if (!taskTitle.value) {
        document.getElementById("missing-title-info").classList.remove("hide");
        taskTitle.style.border = "1px solid red";
        hasError = true;
    } else {
        document.getElementById("missing-title-info").classList.add("hide");
        taskTitle.style.border = "";
    }
    if (!taskDate.value) {
        document.getElementById("missing-date-info").classList.remove("hide");
        taskDate.style.border = "1px solid red";
        hasError = true;
    } else {
        document.getElementById("missing-date-info").classList.add("hide");
        taskDate.style.border = "";
    }
    if (document.getElementById("category-button").innerText === "Select task category") {
        document.getElementById("missing-category-info").classList.remove("hide");
        document.getElementById("category-button").style.border = "1px solid red";
        hasError = true;
    } else {
        document.getElementById("missing-category-info").classList.add("hide");
        document.getElementById("category-button").style.border = "";
    }
    if (!hasError) {
        createNewTicket(columnValue);
    }
}

/**
 * Creates a new ticket with the provided column value and saves it to Firebase.
 * Increments the ticket counter, gathers form input values, and assigns selected users.
 *
 * @async
 * @param {string} columnValue - The column to which the new ticket will be assigned.
 * @returns {Promise<void>} Resolves when the ticket has been saved to Firebase.
 */
async function createNewTicket(columnValue) {
    let selectedUsers = getSelectedUsers();
    let counterResponse = await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticketCounter.json`);
    let ticketCounter = await counterResponse.json();

    if (ticketCounter === null) {
      ticketCounter = 0;
    }
    ticketCounter++;

    let newTicket = {
        title: taskTitle.value,
        description: taskDescription.value,
        date: taskDate.value,
        priority: buttonPriority,
        assignedTo: selectedUsers,
        category: buttonCategory,
        subtask: subtaskArray,
        column: columnValue,
        id: ticketCounter
    }
    await saveTaskToFirebase(newTicket, ticketCounter);
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
    checkboxes.forEach(cb => {
        if (cb.checked) {
            let userIconColor = "";            
            let initials = cb.value.split(" ").map(n => n[0]).join("").toUpperCase();
            userIconClasses.forEach(spanClass => {
                if(spanClass.innerText === initials) {
                    userIconColor = spanClass.dataset.bcindex;
                } 
            });
            document.getElementById(id).innerHTML += `<span class="user-icon-selected User-bc-${userIconColor}" data-bcindex="${userIconColor}" data-name="${cb.value}">${initials}</span>`
        }
    }); 
}

/**
 * Adds a new subtask to the subtask array and updates the DOM to display it.
 * If the subtask input has a value, it creates a subtask object with its text and checked state,
 * appends it to the subtask array, renders the subtask in the subtask list, and resets the input.
 * Increments the subtask counter after adding.
 *
 * Assumes the existence of global variables: subtask, subtaskArray, subtaskCounter.
 * Also assumes an element with ID "subtask-render-div" exists in the DOM.
 */
function addSubtask() {
    if(subtask.value) {
        subtaskArray.push({
            text: subtask.value,
            checked: subtask.checked
        });
        document.getElementById("subtask-render-div").innerHTML +=`<li onmouseenter="hoverButtons(this)" onmouseleave="removeHoverButtons(this)">
                                                                        ${subtask.value} 
                                                                        <div class="li-buttons hide">
                                                                            <button>
                                                                                <img src="./assets/icon/pencil.svg">
                                                                            </button>
                                                                            <div class="add-task-form-divider"></div>
                                                                            <button data-index="${subtaskCounter}" onclick="deleteSubtask(this)">
                                                                                <img src="./assets/icon/bin.svg">
                                                                            </button>
                                                                        </div>
                                                                    </li>`;
        subtaskCounter++;
        subtask.value = "";
    }
}

function hoverButtons(ele) {
    console.log(ele.firstElementChild);
    ele.firstElementChild.classList.remove("hide");
}

function removeHoverButtons(ele) {
    ele.firstElementChild.classList.add("hide");
}

function clearTask() {
    taskTitle.value = "";
    taskDescription.value = "";
    taskDate.value = "";
    resetPriority();
    document.getElementById("render-selected-users").innerHTML = "";
    setCategory("Select task category");
    subtaskArray = [];
    document.getElementById("subtask-render-div").innerHTML = "";
}

function resetPriority() {   
    buttonPriority = "";
    let buttons = document.querySelectorAll(".priority-button");
    buttons.forEach(btn => btn.classList.remove("urgent", "medium", "low"));
}

function deleteSubtask(ele) {
    for (let index = 0; index < subtaskArray.length; index++) {
        if(ele.parentElement.parentElement.innerText === subtaskArray[index].text && ele.dataset.index == index) {
            subtaskArray.splice(index, 1);         
        }
    }
    subtaskCounter--;
    ele.parentElement.parentElement.remove();
}

async function saveTaskToFirebase(ticketData, ticketCounter) {
  try {
    
    await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${ticketCounter}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticketData),
    });
    await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticketCounter.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticketCounter)
    });
    addedUserfeedback.classList.remove("hide");
    addedUserfeedback.classList.add("show");
    setTimeout(() => {
      window.location.href = "board.html";
    }, 1000);
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}