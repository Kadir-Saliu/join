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
let getTickets = localStorage.getItem('tickets')
let allTickets = JSON.parse(getTickets);

/**
 * function to open/close the addTask pop-up
 */
function popUpAddTask(ele,columnV) {
  columnVal = columnV
  const isHidden = ele.classList.contains("hide");
  if (document.getElementById("board-task-information").className === "hide" && document.getElementById("board-task-edit").className === "") {
    document.getElementById("board-task-information").classList.remove("hide");
    document.getElementById("board-task-edit").classList.add("hide");
  }
  popUpAddTaskAnimation(ele, isHidden);
}

/**
 * Animates the display of a popup element for adding a task.
 *
 * @param {HTMLElement} ele - The popup element to animate.
 * @param {boolean} isHidden - If true, shows the popup with animation; if false, hides it.
 */
function popUpAddTaskAnimation(ele, isHidden) {
  if (isHidden) {
    ele.classList.remove("hide", "slide-out");
    ele.classList.add("slide-in", "pop-up");
    overlay.dataset.target = ele.id;
    overlay.classList.remove("hide");
  } else {
    ele.classList.remove("slide-in");
    ele.classList.add("slide-out");
    setTimeout(() => {
      ele.classList.add("hide");
      overlay.classList.add("hide");
    }, 200);
  }
}

/**
 * Handles closing a popup via its overlay element.
 * Retrieves the target popup element using the overlay's data-target attribute,
 * and calls the popUpAddTask function with the popup element if it exists.
 *
 * @param {HTMLElement} overlayElement - The overlay element that was interacted with.
 */
function closeViaOverlay(overlayElement) {
  const targetId = overlayElement.dataset.target;
  const popupElement = document.getElementById(targetId);
  if (popupElement) {
    popUpAddTask(popupElement);
  }
}

/**
 * Toggles the visibility of the task information and task edit sections on the board,
 * and renders the ticket overlay for the specified element.
 *
 * @param {HTMLElement} ele - The DOM element representing the ticket to be rendered in the overlay.
 */
function switchEditInfoMenu(ele) {
  document.getElementById("board-task-information").classList.toggle("hide");
  document.getElementById("board-task-edit").classList.toggle("hide");
  renderTicketOverlay(ele);
}

/**
 * Sets global edit information variables based on the data attributes of the given element.
 *
 * @param {HTMLElement} ele - The DOM element containing data attributes for ticket index, ticket counter ID, and mode.
 */
function setGlobalEditInformation(ele) {
  dataTicketIndex = ele.dataset.ticketindex;
  dataTicketCounterId = ele.dataset.ticketcounterid;
  dataMode = ele.dataset.mode;
}

/**
 * Renders a list of tickets into their respective board columns.
 *
 * @async
 * @param {Array<Object>} tickets - An array of ticket objects to render. Each ticket should contain properties such as `title`, `description`, `category`, `column`, `assignedTo`, `priority`, and `subtask`.
 * @returns {Promise<void>} Resolves when all tickets have been rendered to the DOM.
 */
async function renderTickets() {
  document.getElementById("to-do-div").innerHTML = "";
  document.getElementById("in-progress-div").innerHTML = "";
  document.getElementById("await-feedback-div").innerHTML = "";
  document.getElementById("done-div").innerHTML = "";  
  await renderAllTickets();
  toggleNoTaskContainer();
}

/**
 * Renders all tickets on the board.
 *
 * Iterates over all stored tickets, prepares their data using 
 * `getVariablesToRenderTickets`, and inserts the tickets into 
 * the corresponding column with `ticketTemplate`. Additionally, 
 * it calculates subtask counters and renders their progress.
 *
 * @async
 * @function renderAllTickets
 * @returns {Promise<void>} - Returns nothing but updates the UI.
 */
async function renderAllTickets() {
  for (const [index, t] of Object.entries(allTickets)) {
    if (t) {
      const { subtasks, columnId, title, description, category, categoryCss, assignedTo, priority, ticketCounterId } = getVariablesToRenderTickets(t);
      calculateSubtaskCounter(subtasks);
      document.getElementById(columnId).innerHTML += await ticketTemplate(title, description, category, categoryCss, assignedTo, priority, index, subtasks, ticketCounterId);
      renderSubtaskProgress(index, subtasks);
    }
  }
}

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
  let description = t.description || "";
  let title = t.title;
  let category = t.category;
  let categoryCss = t.category.replace(" ", "-").toLowerCase();
  let assignedTo = t.assignedTo || [];
  let priority = t.priority || [];
  let subtasks = t.subtask || [];
  let ticketCounterId = t.id;
  return { subtasks, columnId, title, description, category, categoryCss, assignedTo, priority, ticketCounterId };
}

/**
 * Generates an HTML snippet for a ticket , rendering assigned user icons concurrently.
 *
 * @async
 * @param {string} title - The ticket's title.
 * @param {string} description - A brief description of the ticket.
 * @param {string} category - The category or type of the ticket.
 * @param {string} categoryCss - CSS class suffix to style the category badge.
 * @param {string[]} assignedTo - Array of user full names assigned to the ticket.
 * @param {string} priority - Priority level (e.g. "low", "medium", "high").
 * @param {number} index - Zero‑based index of the ticket in a list.
 * @param {Array<object>} subtasks - An array of subtask objects, each with its own properties.
 * @returns {Promise<string[]>} A promise that resolves to an array of HTML `<span>` strings containing rendered user icons.
 *
 */
async function ticketTemplate(title, description, category, categoryCss, assignedTo, priority, index, subtasks, ticketCounterId) {
  let userSpansArray = await Promise.all(
    assignedTo.map(async (user, i) => {
      let renderedUserBgIndex = await getUserDetails(user);
      let safeIndex = ((renderedUserBgIndex - 1) % 15) + 1;
      let initials = user.split(" ").map((n) => n[0]).join("").toUpperCase();
      return `<span class="user-icon-rendered User-bc-${safeIndex}">${initials}</span>`;
    })
  );
  let userSpans = userSpansArray.join("");
  return getTicketTemplate(index, title, description, category, categoryCss, priority, subtasks, ticketCounterId, userSpans);
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
 * Displays the subtask progress element for a given index if there is at least one subtask.
 *
 * @param {number} index - The index used to identify the subtask progress element.
 * @param {Array} subtasks - An array of subtasks to check for existence.
 */
function renderSubtaskProgress(index, subtasks) {
  if (subtasks[0]) {
    document.getElementById(`p-subtask-${index}`).classList.remove("hide");
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

/**
 * Moves the currently dragged ticket to the specified category (column).
 *
 * @param {string} category - The target category (column) to move the ticket to.
 */
function moveTo(category) {
  allTickets[currentDraggedElement]["column"] = category;
  saveChangedTicketInFirbase();
  renderTickets();
}

/**
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
    localStorage.setItem("tickets", JSON.stringify(allTickets));
    getTicketData();
    renderTickets();
  } catch (error) {
    console.error("Error saving ticket:", error);
  }
}

/**
 * Toggles the visibility of "no tasks" containers for each board column
 * ("To do", "In progress", "Await feedback", "done") based on whether
 * there are any tickets in each column. Uses the helper function
 * `checkTicketsForToggle` to show or hide the corresponding container.
 *
 * Assumes the existence of a global `allTickets` array and a
 * `checkTicketsForToggle` function.
 */
function toggleNoTaskContainer() {
  let allTicketsToDo = allTickets.filter((obj) => obj.column == "To do");
  let allTicketsProgress = allTickets.filter((obj) => obj.column == "In progress");
  let allTicketsFeedback = allTickets.filter((obj) => obj.column == "Await feedback");
  let allTicketsDone = allTickets.filter((obj) => obj.column == "done");
  checkTicketsForToggle(allTicketsToDo, "noTasksToDo");
  checkTicketsForToggle(allTicketsProgress, "noTasksProgress");
  checkTicketsForToggle(allTicketsFeedback, "noTasksFeedback");
  checkTicketsForToggle(allTicketsDone, "noTasksDone");
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
 */
function filterTickets() {
  let searchInput = document.getElementById("searchbar").value.toLowerCase();
  const tickets = JSON.parse(localStorage.getItem("tickets")) || [];
  if (searchInput) {
    let filteredTickets = tickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(searchInput) ||
        ticket.description.toLowerCase().includes(searchInput)
    );
    renderTickets(filteredTickets);
  } else {
    renderTickets(tickets);
  }
}

/**
 * Asynchronously fetches ticket data and renders the ticket overlay for the selected element.
 *
 * @async
 * @function renderTicketOverlay
 * @param {HTMLElement} ele - The DOM element that triggered the overlay, containing `data-ticketindex` and `data-mode` attributes.
 * @returns {Promise<void>} Resolves when the ticket overlay has been rendered.
 */
async function renderTicketOverlay(ele) {
  try {
    let response = await fetch(BASE_URL_TICKETS);
    let responseJson = await response.json();
    let tickets = responseJson.ticket;
    let result = Object.values(tickets);
    let index = ele.dataset.ticketindex;
    let mode = ele.dataset.mode;
    let ticketCounterId = ele.dataset.ticketcounterid;
    defineTicketDetailVariables(result, mode, index, ticketCounterId);
  } catch (error) {
    console.log(error);
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
  if (mode === "view") renderTicketDetails(category, categoryColor, title, description, formattedDate, priority, assignedTo, subtasks, index, ticketCounterId);
  else if (mode === "edit") editTicket(title, description, dateForEditOverlay, priority, assignedTo, subtasks, index, mode, ticketCounterId);  
}

/**
 * Generates an array of HTML `<span>` snippets representing users assigned to a ticket in edit mode.
 * Fetches user-specific styling information concurrently and renders each user's initials with styling.
 *
 * @async
 * @param {string} title - The ticket title.
 * @param {string} description - A description of the ticket.
 * @param {string} priority - Priority level (e.g. "low", "medium", "high").
 * @param {string[]} assignedTo - Array of full names of users assigned to the ticket.
 * @param {Array<object>} subtasks - Array of subtask objects related to the ticket.
 * @param {number} index - Zero-based index of the ticket in the list or UI.
 * @param {string} mode - Mode identifier indicating how the ticket is being edited.
 * @returns {Promise<string[]>} A promise resolving to an array of `<span>` HTML strings,
 * each showing a user's initials, styled dynamically, and with a data-name attribute.
 * @throws {Error} If any call to `getUserDetails(user)` fails.
 */
async function editTicket(title, description, dateForEditOverlay, priority, assignedTo, subtasks, index, mode, ticketCounterId) {
  let userSpansArray = await Promise.all(
    iterateThroughUsersForVisualization(assignedTo)
  );
  let userSpans = userSpansArray.join("");
  let subtaskEle = subtasks
    .map((subtask, i) => {
      return getEditTicketSubtaskEleTemplate(subtask, i, dataTicketIndex, dataTicketCounterId, dataMode);
    })
    .join("");
  subtaskEditArray = [];
  subtasks.forEach((subtask) => subtaskEditArray.push(subtask.text));
  renderHTMLElementsForEditing(title, description, dateForEditOverlay, userSpans, subtaskEle, index, ticketCounterId, mode, priority);
}

/**
 * Renders the HTML elements required for editing a ticket.
 *
 * Clears existing subtasks and replaces the edit form content with the
 * corresponding ticket template. It also highlights the currently selected
 * priority button based on the given priority value.
 *
 * @function renderHTMLElementsForEditing
 * @param {string} title - The title of the ticket.
 * @param {string} description - The description of the ticket.
 * @param {string} dateForEditOverlay - The due date to be displayed in the edit overlay.
 * @param {HTMLElement[]} userSpans - The list of user span elements assigned to the ticket.
 * @param {HTMLElement[]} subtaskEle - The list of subtask elements to render.
 * @param {number|string} index - The index or identifier of the ticket in the list.
 * @param {string|number} ticketCounterId - The unique ticket ID.
 * @param {string} mode - The current mode of the editor (e.g., "edit" or "view").
 * @param {string} priority - The ticket priority (e.g., "urgent", "medium", "low").
 * @returns {void}
 */
function renderHTMLElementsForEditing(title, description, dateForEditOverlay, userSpans, subtaskEle, index, ticketCounterId, mode, priority) {
  document.getElementById("subtask-render-div").innerHTML = "";
  document.getElementById("board-task-edit").innerHTML = getEditTicketTemplate(title, description, dateForEditOverlay, userSpans, subtaskEle, index, ticketCounterId, mode);
  document.querySelectorAll(".set-priority").forEach((ele) => {
    if (ele.innerText.toLowerCase().trim() === priority) {
      ele.classList.add(priority);
      buttonPriority = priority;
    } else ele.classList.remove(ele.innerText.toLowerCase().trim());
  });
}

/**
 * Iterates through the assigned users and generates visualization elements.
 *
 * For each user, their details are retrieved using `getUserDetails`, a safe
 * background index is calculated, and their initials are extracted. These values
 * are then used to generate user span elements via
 * `getEditTicketUserSpansArrayTemplate`.
 *
 * @async
 * @function iterateThroughUsersForVisualization
 * @param {string[]} assignedTo - A list of users assigned to the ticket.
 * @returns {Promise<HTMLElement[]>} A promise that resolves to an array of
 *                                   rendered user span elements for visualization.
 */
function iterateThroughUsersForVisualization(assignedTo) {
  return assignedTo.map(async (user, i) => {
    let renderedUserBgIndex = await getUserDetails(user);
    let safeIndex = ((renderedUserBgIndex - 1) % 15) + 1;
    let initials = user.split(" ").map((n) => n[0]).join("").toUpperCase();
    return getEditTicketUserSpansArrayTemplate(user, safeIndex, initials);
  });
}

/**
 * Builds and returns an array of HTML snippets representing assigned users for a ticket detail view.
 * Each user is rendered with an icon (initials) styled dynamically based on user-specific details.
 *
 * @async
 * @param {string} category - The ticket's category or type.
 * @param {string} categoryColor - CSS class or color indicator for styling the category.
 * @param {string} title - Title of the ticket.
 * @param {string} description - Description text for the ticket.
 * @param {string|Date} date - Date associated with ticket (e.g. creation or due date).
 * @param {string} priority - Priority level (e.g. "low", "medium", "high").
 * @param {string[]} assignedTo - Array of full names of users assigned to the ticket.
 * @param {Array<object>} subtasks - Array of subtask objects related to the ticket.
 * @param {number} index - Zero-based index of the ticket in a list or collection.
 * @returns {Promise<string[]>} Promise resolving to an array of HTML `<div>` strings,
 * each containing user initials and name inside styled elements.
 * @throws {Error} If fetching details via `getUserDetails(user)` fails for any user.
 */
async function renderTicketDetails(category, categoryColor, title, description, date, priority, assignedTo, subtasks, index, ticketCounterId) {
  let userSpansArray = await Promise.all(
    assignedTo.map(async (user, i) => {
      let renderedUserBgIndex = await getUserDetails(user);
      let safeIndex = ((renderedUserBgIndex - 1) % 15) + 1;
      let initials = user.split(" ").map((n) => n[0]).join("").toUpperCase();
      return getRenderTicketDetailsUserSpansArrayTemplate(safeIndex, initials, user);
    })
  );
  let userSpans = userSpansArray.join("");
  let subtaskEle = subtasks
    .map((subtask, i) => {return getRenderTicketDetailsSubtaskEleTemplate(i, subtask, index, ticketCounterId);}).join("");
  document.getElementById("board-task-information").innerHTML = getRenderTicketDetailsTemplate(category, categoryColor, title, description, date, priority, index, ticketCounterId, userSpans, subtaskEle);
}

/**
 * Checks and retrieves edited values from input fields for a ticket,
 * then updates the ticket with the new values.
 *
 * @param {HTMLElement} ele - The element representing the ticket being edited.
 *                            Must have a `dataset.ticketindex` property.
 */
async function checkEditedValues(ele) {
  let index = ele.dataset.ticketindex;
  let title = "";
  let description = "";
  let date;
  let ticketCounterId = ele.dataset.ticketcounterid;
  if (document.getElementById("task-title-edit").value) title = document.getElementById("task-title-edit").value;  
  if (document.getElementById("task-description-edit").value) description = document.getElementById("task-description-edit").value;
  if (document.getElementById("task-date-edit").value) date = document.getElementById("task-date-edit").value;
  ele.dataset.mode = "view";
  return takeOverEditedTicket(ele, index, title, description, date, ticketCounterId);
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
function takeOverEditedTicket(ele, index, titleEdit, descriptionEdit, dateEdit, ticketCounterId) {
  let editedTicket = {};
  checkNewEditedValues(titleEdit, editedTicket, descriptionEdit, dateEdit);
  editedTicket.priority = buttonPriority;
  let selectedUsers = getSelectedUsers();
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
    subtaskArray.push({ text, checked: isChecked, });
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
    let response = await fetch(
      `https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${ticketCounterId}.json`
    );
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
  await fetch(
    `https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${ticketCounterId}.json`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTicket),
    }
  );
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
}

/**
 * Removes a subtask from the editable subtask array and updates the UI.
 *
 * If the `subtaskEditArray` contains items, this function removes the subtask
 * at the index specified in the element's `data-index` attribute. Afterwards,
 * it checks the edited values and re-renders the ticket overlay to reflect the changes.
 *
 * @async
 * @function spliceEditSubArray
 * @param {HTMLElement} ele - The DOM element representing the subtask to remove, which should have a `data-index` attribute.
 * @returns {Promise<void>} - Resolves after updating the subtask array and re-rendering the overlay.
 */
async function spliceEditSubArray(ele) {
  if (subtaskEditArray.length > 0) {
    subtaskEditArray.splice(ele.dataset.index, 1);
    await checkEditedValues(ele);
    renderTicketOverlay(ele);
  }
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
    await fetch(
      `https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${index}.json`,
      {
        method: "DELETE",
      }
    );
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
  delete allTickets[index]; // entfernt das Ticket aus dem Objekt
  allTickets = allTickets.filter((t) => t.id !== index);
  localStorage.setItem("tickets", JSON.stringify(allTickets));
  renderTickets();
}

/**
 * Toggles the checked state of a subtask for a given ticket and saves the update to Firebase.
 *
 * @param {HTMLInputElement} input - The input element representing the subtask checkbox.
 *   Must have `data-index` (subtask index) and `data-ticketindex` (ticket index) attributes.
 */
function toggleSubtask(input) {
  let subIndex = input.dataset.index;
  let ticketIndex = input.dataset.ticketindex;
  let ticketCounterIndex = input.dataset.ticketcounterid;
  let currentChecked = tickets[ticketCounterIndex].subtask[subIndex].checked;
  tickets[ticketCounterIndex].subtask[subIndex].checked = !currentChecked;
  let partialUpdate = {
    subtask: tickets[ticketCounterIndex].subtask,
  };
  saveEditedTaskToFirebase(input, ticketIndex, partialUpdate, ticketCounterIndex);
}

/**
 * Sets the minimum selectable date for the input element with the ID "task-date".
 * The minimum date is specified by the variable `today`, which should be defined elsewhere in the code.
 */
function minDate() {
  const dateInput = document.getElementById("task-date");
  dateInput.setAttribute("min", today);
}
