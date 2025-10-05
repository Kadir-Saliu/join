/**
 * Sets the priority for a task and updates the UI to reflect the selected priority.
 *
 * @param {string} prio - The priority level to set (e.g., "urgent", "medium", "low").
 * @param {HTMLElement} clickedButton - The button element that was clicked to select the priority.
 */
function setPriority(prio, clickedButton) {
  buttonPriority = prio;
  let buttons = document.querySelectorAll(".priority-button");
  buttons.forEach((btn) => btn.classList.remove("urgent", "medium", "low"));
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
  document.getElementById(idButton).innerHTML = `${buttonCategory}
                                                    <img src="./assets/imgs/arrow_down.png" id="category-button-img" alt="">
                                                    `;
  document.getElementById(idDropDown).classList.add("hide");
}

/**
 * Toggles the source image of a dropdown arrow between "arrow_down" and "arrow_up".
 *
 * @param {string} id - The ID of the image element whose source should be toggled.
 */
async function changeDropDownArrow(id) {
  if (document.getElementById(id).src.includes("arrow_down")) {
    document.getElementById(id).src = "./assets/imgs/arrow_up.png";
  } else if (document.getElementById(id).src.includes("arrow_up")) {
    document.getElementById(id).src = "./assets/imgs/arrow_down.png";
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
async function createNewTicket(columnValue, className) {
  let selectedUsers = getSelectedUsers(className);
  let counterResponse = await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticketCounter.json`);
  let ticketCounter = await counterResponse.json();
  if (ticketCounter === null) {
    ticketCounter = 0;
  }
  ticketCounter++;
  let newTicket = buildTicket(ticketCounter, columnValue, selectedUsers);
  await saveTaskToFirebase(newTicket, ticketCounter);
}

/**
 * Builds a ticket object with the provided details.
 *
 * @param {number} ticketCounter - Unique identifier for the ticket.
 * @param {string} columnValue - The column/category the ticket belongs to.
 * @param {Array<string>} selectedUsers - Array of users assigned to the ticket.
 * @returns {Object} The constructed ticket object containing title, description, date, priority, assigned users, category, subtasks, column, and id.
 */
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
    id: ticketCounter,
  };
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
  if (subtask.value) {
    subtaskArray.push({
      text: subtask.value,
      checked: subtask.checked,
    });
    document.getElementById("subtask-render-div").innerHTML += addSubtaskRenderDiv(subtask.value, subtaskCounter);
    subtaskCounter++;
    subtask.value = "";
    document.getElementById("subtask-clear-button").classList.add("hide");
    document.getElementById("subtask-button-div-divider").classList.add("hide");
  }
}

/**
 * Enables editing mode for a subtask element by updating its attributes and rendering the edit UI.
 *
 * @param {HTMLElement} ele - The element that triggered the edit action, typically an edit button within the subtask.
 */
function editSubtask(ele) {
  let liVal = ele.parentElement.parentElement.innerText;
  ele.parentElement.parentElement.removeAttribute("onmouseenter");
  ele.parentElement.parentElement.removeAttribute("onmouseleave");
  ele.parentElement.parentElement.setAttribute("id", `${liVal}-${ele.dataset.index}`);
  ele.parentElement.parentElement.innerHTML = editSubtaskRender(liVal, ele.dataset.index);
  document.getElementById(`${liVal}-${ele.dataset.index}`).classList.add("edit-div");
}

/**
 * Edits a subtask in the edit menu by updating its DOM element.
 * Removes mouse event attributes, sets a new ID, replaces its inner HTML with an edit form,
 * and adds the "edit-div" class for styling.
 *
 * @param {HTMLElement} ele - The element that triggered the edit, typically an edit button within the subtask.
 */
function editSubtaskInEditMenu(ele) {
  let liVal = ele.parentElement.parentElement.innerText;
  ele.parentElement.parentElement.removeAttribute("onmouseenter");
  ele.parentElement.parentElement.removeAttribute("onmouseleave");
  ele.parentElement.parentElement.setAttribute("id", `${liVal}-${ele.dataset.index}`);
  ele.parentElement.parentElement.innerHTML = editSubtaskInEditMenuRender(liVal, ele.dataset.index);
  document.getElementById(`${liVal}-${ele.dataset.index}`).classList.add("edit-div");
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
 * Shows or hides the subtask clear button and divider based on the input element's value.
 * If the input is not empty, removes the "hide" class to display the elements.
 * If the input is empty, adds the "hide" class to hide the elements.
 *
 * @param {HTMLInputElement} inputElement - The input element to check for a non-empty value.
 */
function removeHideOnInput(inputElement) {
  if (inputElement.value.trim() !== "") {
    document.getElementById("subtask-clear-button").classList.remove("hide");
    document.getElementById("subtask-button-div-divider").classList.remove("hide");
  } else {
    document.getElementById("subtask-clear-button").classList.add("hide");
    document.getElementById("subtask-button-div-divider").classList.add("hide");
  }
}

/**
 * Clears the value of the subtask input field and hides related UI elements.
 *
 * @param {string} subtaskId - The ID of the subtask input element to clear.
 */
function clearSubtaskValue(subtaskId) {
  document.getElementById(subtaskId).value = "";
  document.getElementById("subtask-clear-button").classList.add("hide");
  document.getElementById("subtask-button-div-divider").classList.add("hide");
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
  uncheckAllUserIcons();
  clearValidationFeedback();
}

/**
 * Unchecks all checkbox inputs within elements that have the "user-icon" class.
 * This function selects all checkboxes inside elements with the class "user-icon"
 * and sets their checked property to false.
 */
function uncheckAllUserIcons() {
  document.querySelectorAll(".user-icon input[type='checkbox']").forEach((checkbox) => {
    checkbox.checked = false;
  });
}

/**
 * Clears validation feedback from the task creation form.
 * Hides missing field info messages and resets input borders for title, date, and category fields.
 */
function clearValidationFeedback() {
  document.getElementById("missing-title-info").classList.add("hide");
  taskTitle.style.border = "";
  document.getElementById("missing-date-info").classList.add("hide");
  taskDate.style.border = "";
  document.getElementById("missing-category-info").classList.add("hide");
  document.getElementById("category-button").style.border = "";
}

/**
 * Resets the priority selection by clearing the buttonPriority variable
 * and removing all priority-related CSS classes ("urgent", "medium", "low")
 * from elements with the "priority-button" class.
 */
function resetPriority() {
  buttonPriority = "medium";
  let buttons = document.querySelectorAll(".priority-button");
  buttons.forEach((btn) => btn.classList.remove("urgent", "medium", "low"));
  document.getElementById("medium-priority-button").classList.add("medium");
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
    if (ele.parentElement.parentElement.innerText === subtaskArray[index].text && ele.dataset.index == index) {
      subtaskArray.splice(index, 1);
    }
  }
  subtaskCounter--;
  ele.parentElement.parentElement.remove();
}

/**
 * Saves a task to Firebase by storing ticket data and updating the ticket counter.
 * Calls a pass-along function after successful operations.
 *
 * @async
 * @function
 * @param {Object} ticketData - The data of the ticket to be saved.
 * @param {number} ticketCounter - The current ticket counter value.
 * @returns {Promise<void>} Resolves when the task is saved and counter updated.
 */
async function saveTaskToFirebase(ticketData, ticketCounter) {
  try {
    await saveTicketData(ticketData, ticketCounter);
    await updateTicketCounter(ticketCounter);
    saveTaskToFirebasePassalong();
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}

/**
 * Saves ticket data to the Firebase Realtime Database at the specified ticket counter.
 *
 * @async
 * @param {Object} ticketData - The data of the ticket to be saved.
 * @param {number|string} ticketCounter - The unique identifier for the ticket.
 * @returns {Promise<void>} A promise that resolves when the ticket data has been saved.
 */
async function saveTicketData(ticketData, ticketCounter) {
  await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${ticketCounter}.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketData),
  });
}

/**
 * Handles the UI feedback and navigation after saving a task to Firebase.
 * Shows a feedback message, updates browser history, retrieves ticket data,
 * and redirects to the board page after a delay. Also hides popup and overlay elements if present.
 */
async function saveTaskToFirebasePassalong() {
  addedUserfeedback.classList.remove("hide");
  addedUserfeedback.classList.add("show");
  history.pushState(null, "");
  await getTicketData();
  setTimeout(async () => {
    addedUserfeedback.classList.add("hide");
    addedUserfeedback.classList.remove("show");
    window.location.href.includes("pages/board.html") ? (await getTicketData(), renderTickets()) : (window.location.href = "pages/board.html");
  }, 3000);
  if (addTaskPopUp) addTaskPopUp.classList.add("hide");
  if (bordOverlay) bordOverlay.classList.add("hide");
}

/**
 * Updates the ticket counter value in the Firebase Realtime Database.
 *
 * Sends a PUT request to the specified Firebase endpoint to update the ticketCounter value.
 *
 * @async
 * @param {number} ticketCounter - The new value for the ticket counter to be stored in the database.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
async function updateTicketCounter(ticketCounter) {
  await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticketCounter.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketCounter),
  });
}

document.getElementById("task-date").setAttribute("min", new Date().toISOString().split("T")[0]);
