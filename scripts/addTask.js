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
let addTaskPopUp = document.getElementById("add-task-pop-up");
let bordOverlay = document.getElementById("board-overlay");
let subtaskValue = [];

document.getElementById("create-task-button").onclick = function () {
    checkRequiredInput(columnVal, true);
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
    document.getElementById(idButton).innerHTML =   `${buttonCategory}
                                                    <img src="./assets/imgs/arrow_down.png" id="category-button-img" alt="">
                                                    `; 
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
async function dropDownUsers(id, renderId, imgId) {
    try {
        let response = await fetch(BASE_URL_USERS);
        let data = await response.json();
        let responseJson = Object.values(data)
        changeDropDownArrow(imgId);
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
async function filterUsers(id, renderId, inputId) {
    try {
        let response = await fetch(BASE_URL_USERS);
        let responseJson = await response.json();
        iterateUsers(responseJson, id, renderId, inputId);
    } catch (error) {
        console.log(error);
    }
}

function iterateUsers(users, dropDownId, renderId, inputId) {
    let name;
    let initials;
    let id;
    document.getElementById(dropDownId).innerHTML = "";
    users.forEach(user => {
        if(user?.name.toLowerCase().includes(document.getElementById(inputId).value.toLowerCase())) {
            name = user?.name;
            id= user?.id;
            initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
            document.getElementById(dropDownId).innerHTML += userDropDownTemplate(name, initials, id, renderId); 
        }  
    });
}

async function iterateContacts(responseJson, id, renderId) {
    document.getElementById(id).classList.toggle("hide");
    document.getElementById(id).innerHTML = "";
    let backgroundIndex = 0;
    for (let index = 0; index < responseJson.length; index++) {
        let name = responseJson[index]?.name;        
        if (!name) continue;
        if(backgroundIndex > 14) backgroundIndex = 1;
        else backgroundIndex ++;
        let initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
        document.getElementById(id).innerHTML += userDropDownTemplate(name, initials, backgroundIndex, renderId);   
    }
}

async function changeDropDownArrow(id) {
    if(document.getElementById(id).src.includes("arrow_down")) {
        document.getElementById(id).src = "./assets/imgs/arrow_up.png"
    } else if (document.getElementById(id).src.includes("arrow_up")) {
        document.getElementById(id).src = "./assets/imgs/arrow_down.png"
    }
};

function checkRequiredInput(columnValue, validation) {
    let hasError = false;
    checkRequiredInputTaskTitle();
    checkRequiredInputTaskDate();
    checkRequiredInputCategory();
    if (!hasError && validation) {
        createNewTicket(columnValue);
    }
}

function checkRequiredInputTaskTitle() {
    if (!taskTitle.value) {
        document.getElementById("missing-title-info").classList.remove("hide");
        taskTitle.style.border = "1px solid red";
        hasError = true;
    } else {
        document.getElementById("missing-title-info").classList.add("hide");
        taskTitle.style.border = "";
    }
}

function checkRequiredInputTaskDate() {
    if (!taskDate.value) {
        document.getElementById("missing-date-info").classList.remove("hide");
        taskDate.style.border = "1px solid red";
        hasError = true;
    } else {
        document.getElementById("missing-date-info").classList.add("hide");
        taskDate.style.border = "";
    }
}

function checkRequiredInputCategory() {
    if (document.getElementById("category-button").innerText === "Select task category") {
        document.getElementById("missing-category-info").classList.remove("hide");
        document.getElementById("category-button").style.border = "1px solid red";
        hasError = true;
    } else {
        document.getElementById("missing-category-info").classList.add("hide");
        document.getElementById("category-button").style.border = "";
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
    let newTicket = buildTicket(ticketCounter, columnValue, selectedUsers);
    await saveTaskToFirebase(newTicket, ticketCounter);
}

function buildTicket(ticketCounter, columnValue, selectedUsers) {
  return {
    title: taskTitle.value,
    description: taskDescription.value,
    date: taskDate.value,
    priority: buttonPriority,
    assignedTo: selectedUsers,
    category: buttonCategory,
    subtask: subtaskArray,
    column: columnValue,
    id: ticketCounter
  };
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
                if(spanClass.innerText === initials) userIconColor = spanClass.dataset.bcindex; 
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
    subtaskValue.push(subtask.value);
    if(subtask.value) {
        subtaskArray.push({
            text: subtask.value,
            checked: subtask.checked
        });
        document.getElementById("subtask-render-div").innerHTML += addSubtaskRenderDiv(subtask.value, subtaskCounter);
        subtaskCounter++;
        subtask.value = "";
        document.getElementById("subtask-clear-button").classList.add("hide");
        document.getElementById("subtask-button-div-divider").classList.add("hide");
    }
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
 * Hides the first child element of the given element by adding the "hide" class.
 *
 * @param {HTMLElement} ele - The parent element whose first child will be hidden.
 */
function removeHoverButtons(ele) {
    ele.firstElementChild.classList.add("hide");
}



/**
 * Clears all input fields and resets the task creation form to its default state.
 * - Empties the task title, description, and date fields.
 * - Resets the priority selection.
 * - Clears the selected users display.
 * - Sets the category to the default value.
 * - Empties the subtask array and clears the subtask display.
 */
function clearTask(userSpans, category, idButton, idDropDown, subtaskList) {
    taskTitle.value = "";
    taskDescription.value = "";
    taskDate.value = "";
    resetPriority();
    document.getElementById(userSpans).innerHTML = "";
    setCategory(category, idButton, idDropDown);
    subtaskArray = [];
    document.getElementById(subtaskList).innerHTML = "";
    document.getElementById("subtask").value = "";
}



/**
 * Resets the priority selection by clearing the buttonPriority variable
 * and removing all priority-related CSS classes ("urgent", "medium", "low")
 * from elements with the "priority-button" class.
 */
function resetPriority() {   
    buttonPriority = "";
    let buttons = document.querySelectorAll(".priority-button");
    buttons.forEach(btn => btn.classList.remove("urgent", "medium", "low"));
}



/**
 * Deletes a subtask from the subtask array and removes its corresponding DOM element.
 *
 * @param {HTMLElement} ele - The element that triggered the delete action, typically a button within the subtask.
 */
function deleteSubtask(ele, liVal) {
    let index = subtaskValue.indexOf(liVal);
    subtaskValue.splice(index, 1);
    
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
    await saveTicketData(ticketData, ticketCounter);
    await updateTicketCounter(ticketCounter);
    saveTaskToFirebasePassalong();
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}

async function saveTicketData(ticketData, ticketCounter) {
  await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${ticketCounter}.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketData),
  });
}

async function updateTicketCounter(ticketCounter) {
  await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticketCounter.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketCounter),
  });
}

function saveTaskToFirebasePassalong() {    
    addedUserfeedback.classList.remove("hide");
    addedUserfeedback.classList.add("show");
    history.pushState(null, "");
    getTicketData();
    setTimeout(() => {
    addedUserfeedback.classList.add("hide");
    addedUserfeedback.classList.remove("show"); 
    window.location.href = "board.html";   
    }, 3000);    
    if(addTaskPopUp) addTaskPopUp.classList.add("hide");
    if(bordOverlay) bordOverlay.classList.add("hide");
}

function clearSubtaskValue(subtaskId) {
    document.getElementById(subtaskId).value = "";
    document.getElementById("subtask-clear-button").classList.add("hide");
    document.getElementById("subtask-button-div-divider").classList.add("hide");
}

function removeHideOnInput(inputElement) {
  if (inputElement.value.trim() !== "") {
    document.getElementById("subtask-clear-button").classList.remove("hide");
    document.getElementById("subtask-button-div-divider").classList.remove("hide");
  } else {
    document.getElementById("subtask-clear-button").classList.add("hide");
    document.getElementById("subtask-button-div-divider").classList.add("hide");
  }
}

function editSubtask(ele) {
    let liVal = ele.parentElement.parentElement.innerText;
    ele.parentElement.parentElement.removeAttribute("onmouseenter");
    ele.parentElement.parentElement.removeAttribute("onmouseleave");
    ele.parentElement.parentElement.setAttribute("id", `${liVal}-${ele.dataset.index}`);    
    ele.parentElement.parentElement.innerHTML = editSubtaskRender(liVal, ele.dataset.index);
    document.getElementById(`${liVal}-${ele.dataset.index}`).classList.add("edit-div");   
}

function editSubtaskInEditMenu(ele) {
    let liVal = ele.parentElement.parentElement.innerText;
    ele.parentElement.parentElement.removeAttribute("onmouseenter");
    ele.parentElement.parentElement.removeAttribute("onmouseleave");
    ele.parentElement.parentElement.setAttribute("id", `${liVal}-${ele.dataset.index}`);    
    ele.parentElement.parentElement.innerHTML = editSubtaskInEditMenuRender(liVal, ele.dataset.index);
    document.getElementById(`${liVal}-${ele.dataset.index}`).classList.add("edit-div"); 
}

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

function confirmEditedSubtaskInEditMenu(ele, liVal, inputId, liId) {
    let inputText = document.getElementById(inputId).value;
    document.getElementById(inputId).remove();
    document.getElementById(liId).innerHTML =  confirmEditedSubtaskInEditMenuRender(inputText, liId, ele.dataset.index);
    document.getElementById(liId).setAttribute("onmouseenter", "hoverButtons(this)");
    document.getElementById(liId).setAttribute("onmouseleave", "removeHoverButtons(this)");
    document.getElementById(`${liVal}-${ele.dataset.index}`).classList.remove("edit-div");
}
