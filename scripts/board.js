const popup = document.getElementById("add-task-pop-up");
const popuptask = document.getElementById("board-task-pop-up");
const overlay = document.getElementById("board-overlay");
let currentDraggedElement;
const currentDate = new Date();
const year = currentDate.getFullYear();
const month = currentDate.getMonth() + 1;
const day = currentDate.getDate();
const today = `${year}-${month.length === 2 ? month : "0" + month}-${day}`;
let subtaskCount = 0;
let subtaskWidth = 0;
let subtaskEditArray = [];
let dataTicketIndex;
let dataTicketCounterId;
let dataMode;
let getTickets = localStorage.getItem("tickets");
let allTickets = JSON.parse(getTickets);

/**
 * Extracts and prepares all necessary variables from a ticket object
 * to be used for rendering in the board UI.
 *
 * Formats the column name for DOM usage, ensures optional fields
 * have default values, and returns a structured object containing
 * all relevant ticket data.
 *
 * @function getVariablesToRenderTickets
 * @param {Object} t - The ticket object.
 * @param {string} t.column - The board column where the ticket belongs.
 * @param {string} [t.description=""] - Optional description of the ticket.
 * @param {string} t.title - The ticket title.
 * @param {string} t.category - The ticket category.
 * @param {string[]} [t.assignedTo=[]] - List of assigned users.
 * @param {string[]} [t.priority=[]] - Ticket priority.
 * @param {Array} [t.subtask=[]] - List of subtasks.
 * @param {string|number} t.id - Unique ticket ID.
 *
 * @returns {Object} An object with prepared ticket variables.
 * @returns {Array} return.subtasks - The ticket subtasks.
 * @returns {string} return.columnId - The formatted DOM column ID.
 * @returns {string} return.title - The ticket title.
 * @returns {string} return.description - The ticket description.
 * @returns {string} return.category - The ticket category.
 * @returns {string} return.categoryCss - Category formatted for CSS usage.
 * @returns {string[]} return.assignedTo - Assigned users.
 * @returns {string[]} return.priority - Ticket priority.
 * @returns {string|number} return.ticketCounterId - Unique ticket ID.
 */
function getVariablesToRenderTickets(t) {
  const columnId = `${t.column.replace(" ", "-").toLowerCase()}-div`;
  let columnValue = t.column;
  let description = t.description || "";
  let title = t.title;
  let category = t.category;
  let categoryCss = t.category.replace(" ", "-").toLowerCase();
  let assignedTo = t.assignedTo || [];
  let priority = t.priority || [];
  let subtasks = t.subtask || [];
  let ticketCounterId = t.id;
  return {subtasks, columnId, title, description, category, categoryCss, assignedTo, priority, ticketCounterId, columnValue};
}

/**
 * Initiates the dragging process for a task at the specified index.
 * Sets the current dragged element and toggles the visibility of the "no task" container.
 *
 * @param {number} index - The index of the task to start dragging.
 */
function startDragging(index) {
  currentDraggedElement = index;
  toggleNoTaskContainer();
}

/**
 * Calculates the number of checked subtasks and the completion percentage.
 * Updates the global variables `subtaskCount` and `subtaskWidth` accordingly.
 *
 * @param {Array<{checked: boolean}>} subtasks - An array of subtask objects, each with a `checked` property.
 */
function calculateSubtaskCounter(subtasks) {
  subtaskCount = 0;
  subtaskWidth = 0;
  if (subtasks[0]) {
    subtasks.forEach((ele) => {
      if (ele.checked) {
        subtaskCount++;
      }
    });
    subtaskWidth = (subtaskCount / subtasks.length) * 100;
  }
}

/**
 * Enables an element to accept drop events by preventing the default handling of the dragover event.
 *
 * @param {DragEvent} ev - The drag event object.
 */
function allowDrop(ev) {
  ev.preventDefault();
}

 * Saves the currently modified ticket to Firebase.
 *
 * Updates the corresponding ticket entry in the Firebase Realtime Database
 * using a PUT request. After saving, the updated tickets are also stored in
 * localStorage, and the UI is refreshed by calling `getTicketData()` and
 * `renderTickets()`.
 *
 * @async
 * @function saveChangedTicketInFirbase
 * @returns {Promise<void>} - Returns nothing but updates the database,
 *                            local storage, and re-renders the UI.
 */
async function saveChangedTicketInFirbase() {
  try {
    await fetch(
      `https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${allTickets[currentDraggedElement].id}.json`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(allTickets[currentDraggedElement]),
      }
    );
    await getTicketData();
    allTickets = JSON.parse(localStorage.getItem("tickets"));
  } catch (error) {
    console.error("Error saving ticket:", error);
  }
}

/**
 * Toggles the display of an HTML element based on the length of the provided column value.
 *
 * If the column value is empty, the element with the specified ID will be shown (display set to "block").
 * Otherwise, the element will be hidden (display set to "none").
 *
 * @param {string} column - The value to check for toggling the display.
 * @param {string|number} id - The ID of the HTML element to show or hide.
 */
function checkTicketsForToggle(column, id) {
  if (`${column}`.length == 0) {
    document.getElementById(`${id}`).style.display = "block";
  } else {
    document.getElementById(`${id}`).style.display = "none";
  }
}

/**
 * This function filters the tickets based on the search input
 * Only triggers rendering when at least 3 characters are typed
 * or when clearing the search (going from 3+ chars to less than 3)
 */
function filterTickets() {
  const searchInput = document.getElementById("searchbar").value.toLowerCase();
  const tickets = JSON.parse(localStorage.getItem("tickets")) || [];
  if (!filterTickets.previousLength) filterTickets.previousLength = 0;
  if (searchInput.length >= 3) {
    let filteredTickets = tickets.filter(
      (ticket) => ticket.title.toLowerCase().includes(searchInput) || ticket.description.toLowerCase().includes(searchInput)
    );
    renderTickets(filteredTickets);
    filterTickets.previousLength = searchInput.length;
  } else if (filterTickets.previousLength >= 3) {
    renderTickets(tickets);
    filterTickets.previousLength = searchInput.length;
  } else {
    filterTickets.previousLength = searchInput.length;
  }
}

/**
 * Defines and prepares ticket detail variables for viewing or editing a ticket.
 *
 * @async
 * @param {Array<Object>} ticket - Array of ticket objects.
 * @param {string} mode - The mode of operation, either "view" or "edit".
 * @param {number} index - The index of the ticket to process in the ticket array.
 * @returns {Promise<void>} Resolves when the operation is complete.
 */
async function defineTicketDetailVariables(ticket, mode, index, ticketCounterId) {
  let category = ticket[index].category;
  let categoryColor = ticket[index].category.toLowerCase().replace(" ", "-");
  let title = ticket[index].title;
  let description = ticket[index].description || [];
  let dateForEditOverlay = ticket[index].date;
  let date = ticket[index].date.split("-");
  let formattedDate = `${date[2]}/${date[1]}/${date[0]}`;
  let priority = ticket[index].priority || "-";
  let assignedTo = ticket[index].assignedTo || [];
  let subtasks = ticket[index].subtask || [];
  if (mode === "view")
    renderTicketDetails(category, categoryColor, title, description, formattedDate, priority, assignedTo, subtasks, index, ticketCounterId);
  else if (mode === "edit")
    editTicket(title, description, dateForEditOverlay, priority, assignedTo, subtasks, index, mode, ticketCounterId);
}

/**
 * Checks and retrieves edited values from input fields for a ticket,
 * then updates the ticket with the new values.
 *
 * @param {HTMLElement} ele - The element representing the ticket being edited.
 *                            Must have a `dataset.ticketindex` property.
 */
async function checkEditedValues(ele, className) {
  let index = ele.dataset.ticketindex;
  let title = "";
  let description = "";
  let date;
  let ticketCounterId = ele.dataset.ticketcounterid;
  if (document.getElementById("task-title-edit").value) title = document.getElementById("task-title-edit").value;
  if (document.getElementById("task-description-edit").value) description = document.getElementById("task-description-edit").value;
  if (document.getElementById("task-date-edit").value) date = document.getElementById("task-date-edit").value;
  ele.dataset.mode = "view";
  return takeOverEditedTicket(ele, index, title, description, date, ticketCounterId, className);
}

/**
 * Updates a ticket with edited values and saves it to Firebase.
 *
 * @param {HTMLElement} ele - The DOM element representing the ticket.
 * @param {number} index - The index of the ticket to edit.
 * @param {string} [titleEdit] - The new title for the ticket (optional).
 * @param {string} [descriptionEdit] - The new description for the ticket (optional).
 * @param {string} [dateEdit] - The new due date for the ticket (optional).
 *
 * @returns {void}
 */
function takeOverEditedTicket(ele, index, titleEdit, descriptionEdit, dateEdit, ticketCounterId, className) {
  let editedTicket = {};
  checkNewEditedValues(titleEdit, editedTicket, descriptionEdit, dateEdit);
  editedTicket.priority = buttonPriority;
  let selectedUsers = getSelectedUsers(className);
  editedTicket.assignedTo = selectedUsers;
  let originalTicket = allTickets[index];
  let originalSubtasks = originalTicket?.subtask || [];
  subtaskArray = [];
  queryThroughListElements(originalSubtasks);
  editedTicket.subtask = subtaskArray;
  return saveEditedTaskToFirebase(ele, index, editedTicket, ticketCounterId);
}

/**
 * Collects all subtask list items from the DOM and updates the subtask array.
 *
 * Iterates through elements with the class `.subtask-li`, extracts their text,
 * checks whether they already exist in the provided original subtasks, and
 * determines their checked state. Each subtask is then pushed into the global
 * `subtaskArray`.
 *
 * @function queryThroughListElements
 * @param {Array<{text: string, checked: boolean}>} originalSubtasks -
 *        The original list of subtasks with their checked states.
 * @returns {void}
 */
function queryThroughListElements(originalSubtasks) {
  document.querySelectorAll(".subtask-li").forEach((li) => {
    let text = li.innerText.trim();
    let existing = originalSubtasks.find((s) => s.text === text);
    let isChecked = existing ? existing.checked : false;
    subtaskArray.push({ text, checked: isChecked });
  });
}

/**
 * Updates the properties of a ticket object with new edited values.
 *
 * Only updates the ticket fields if the corresponding edited values are provided.
 *
 * @function checkNewEditedValues
 * @param {string} titleEdit - The new title for the ticket (if provided).
 * @param {Object} editedTicket - The ticket object to update.
 * @param {string} descriptionEdit - The new description for the ticket (if provided).
 * @param {string} dateEdit - The new date for the ticket (if provided).
 * @returns {void}
 */
function checkNewEditedValues(titleEdit, editedTicket, descriptionEdit, dateEdit) {
  if (titleEdit) editedTicket.title = titleEdit;
  if (descriptionEdit) editedTicket.description = descriptionEdit;
  if (dateEdit) editedTicket.date = dateEdit;
}

/**
 * Updates a ticket in Firebase with the provided edited data and re-renders the ticket overlay.
 *
 * @async
 * @param {HTMLElement} ele - The DOM element associated with the ticket being edited.
 * @param {number|string} index - The unique identifier or index of the ticket to update.
 * @param {Object} ticketData - The updated ticket data to be saved to Firebase.
 * @returns {Promise<void>} Resolves when the ticket is successfully updated and UI is refreshed.
 */
async function saveEditedTaskToFirebase(ele, index, ticketData, ticketCounterId) {
  try {
    let response = await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${ticketCounterId}.json`);
    let updatedTicket = await updateTicketParameters(response, ticketData);
    await putEditedTaskToFirebase(ticketCounterId, updatedTicket);
    renderTicketOverlay(ele);
    getTicketData();
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}

/**
 * Updates a specific ticket in Firebase with the provided edited data.
 *
 * Sends a PUT request to the Firebase Realtime Database to overwrite
 * the ticket identified by `ticketCounterId` with the `updatedTicket` object.
 *
 * @async
 * @function putEditedTaskToFirebase
 * @param {string|number} ticketCounterId - The unique ID of the ticket to update.
 * @param {Object} updatedTicket - The ticket object containing updated values.
 * @returns {Promise<void>} - Resolves when the ticket has been successfully updated.
 */
async function putEditedTaskToFirebase(ticketCounterId, updatedTicket) {
  await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${ticketCounterId}.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedTicket),
  });
}

/**
 * Merges existing ticket data from a fetch response with new ticket updates.
 *
 * Retrieves the ticket object from the provided response, then creates
 * a new object combining the existing ticket properties with the updated
 * values from `ticketData`. Returns the merged ticket object.
 *
 * @async
 * @function updateTicketParameters
 * @param {Response} response - The fetch response containing the current ticket data in JSON format.
 * @param {Object} ticketData - An object containing updated ticket properties.
 * @returns {Promise<Object>} A promise that resolves to the updated ticket object.
 */
async function updateTicketParameters(response, ticketData) {
  let ticket = await response.json();
  let updatedTicket = {
    ...ticket,
    ...ticketData,
  };
  return updatedTicket;
}

/**
 * Adds a new subtask to the subtask list by appending a new <li> element
 * containing the value from the input field with id "edit-subtask" to the
 * element with id "subtask-edit-render".
 */
function addNewSubtask() {
  subtaskEditArray.push(document.getElementById("edit-subtask").value);
  if (document.getElementById("edit-subtask").value.trim() !== "") {
    document.getElementById("subtask-render-div").innerHTML += addNewSubtaskRender();
  }
  document.getElementById("edit-subtask").value = "";
}

/**
 * Deletes a ticket from the Firebase database by its index and updates the UI.
 *
 * @async
 * @function
 * @param {number|string} index - The index or ID of the ticket to delete.
 * @returns {Promise<void>} Resolves when the ticket is deleted and the UI is updated.
 * @throws Will log an error to the console if the deletion fails.
 */
async function deleteTicket(index) {
  try {
    await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${index}.json`, {
      method: "DELETE",
    });
    updateUIAfterDelete(index);
  } catch (error) {
    console.error("Fehler beim Löschen des Tickets:", error);
  }
}

/**
 * Updates the UI and data after deleting a ticket at the specified index.
 * Hides relevant overlays and pop-ups, removes the ticket from the data structure,
 * updates local storage, and re-renders the tickets.
 *
 * @param {number} index - The index or ID of the ticket to delete.
 */
function updateUIAfterDelete(index) {
  overlay.classList.add("hide");
  document.getElementById("board-task-pop-up").classList.add("hide");
  delete allTickets[index];
  allTickets = allTickets.filter((t) => t.id !== index);
  localStorage.setItem("tickets", JSON.stringify(allTickets));
  renderTickets();
}
