let allTickets = [];
const popup = document.getElementById("add-task-pop-up");
const popuptask = document.getElementById("board-task-pop-up");
const overlay = document.getElementById("board-overlay");
let currentDraggedElement;

console.log(currentDraggedElement);

let subtaskCount = 0;
let subtaskWidth = 0;

/**
 * function to open/close the addTask pop-up
 */
function popUpAddTask(ele, columnV) {
  columnVal = columnV;
  const isHidden = ele.classList.contains("hide");
  if (
    document.getElementById("board-task-information").className === "hide" &&
    document.getElementById("board-task-edit").className === ""
  ) {
    document.getElementById("board-task-information").classList.remove("hide");
    document.getElementById("board-task-edit").classList.add("hide");
  }
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
 * Renders a list of tickets into their respective board columns.
 * 
 * @async
 * @param {Array<Object>} tickets - An array of ticket objects to render. Each ticket should contain properties such as `title`, `description`, `category`, `column`, `assignedTo`, `priority`, and `subtask`.
 * @returns {Promise<void>} Resolves when all tickets have been rendered to the DOM.
 */
async function renderTickets(tickets) {
  allTickets = tickets;
  document.getElementById("to-do-div").innerHTML = "";
  document.getElementById("in-progress-div").innerHTML = "";
  document.getElementById("await-feedback-div").innerHTML = "";
  document.getElementById("done-div").innerHTML = "";

  for (const [index, t] of Object.entries(allTickets)) {
    if (t) {
      const columnId = `${t.column.replace(" ", "-").toLowerCase()}-div`;
      let description = t.description || "";
      let title = t.title;
      let category = t.category;
      let categoryCss = t.category.replace(" ", "-").toLowerCase();
      let assignedTo = t.assignedTo || [];
      let priority = t.priority || [];
      let subtasks = t.subtask || [];

      calculateSubtaskCounter(subtasks);

      document.getElementById(columnId).innerHTML += await ticketTemplate(
        title,
        description,
        category,
        categoryCss,
        assignedTo,
        priority,
        index,
        subtasks
      );
    }
  }
  console.log(allTickets);
  toggleNoTaskContainer();
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
  console.log(category);
  allTickets[currentDraggedElement]["column"] = category;
  renderTickets(allTickets);
}

/**
 * Toggles the visibility of "no tasks" containers for each board column
 * ("To do", "In progress", "Await feedback", "done") based on the presence
 * of tickets in each column. If a column has no tickets, its corresponding
 * "no tasks" container is shown; otherwise, it is hidden.
 *
 * Assumes the existence of global `allTickets` array and HTML elements with
 * IDs: "noTasksToDo", "noTasksProgress", "noTasksFeedback", "noTasksDone".
 */
function toggleNoTaskContainer() {
  let allTicketsToDo = allTickets.filter((obj) => obj.column == "To do");
  let allTicketsProgress = allTickets.filter(
    (obj) => obj.column == "In progress"
  );
  let allTicketsFeedback = allTickets.filter(
    (obj) => obj.column == "Await feedback"
  );
  let allTicketsDone = allTickets.filter((obj) => obj.column == "done");

  if (allTicketsToDo.length == 0) {
    document.getElementById("noTasksToDo").style.display = "block";
  } else {
    document.getElementById("noTasksToDo").style.display = "none";
  }

  if (allTicketsProgress.length == 0) {
    document.getElementById("noTasksProgress").style.display = "block";
  } else {
    document.getElementById("noTasksProgress").style.display = "none";
  }

  if (allTicketsFeedback.length == 0) {
    document.getElementById("noTasksFeedback").style.display = "block";
  } else {
    document.getElementById("noTasksFeedback").style.display = "none";
  }

  if (allTicketsDone.length == 0) {
    document.getElementById("noTasksDone").style.display = "block";
  } else {
    document.getElementById("noTasksDone").style.display = "none";
  }
}

/**
 * This function filters the tickets based on the search input
 *
 * @param {*} tickets tickets from the database to filter
 */
function filterTickets(tickets) {
  let searchInput = document.getElementById("searchbar").value.toLowerCase();
  let filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(searchInput) ||
      ticket.description.toLowerCase().includes(searchInput)
  );
  renderTickets(filteredTickets);
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

    defineTicketDetailVariables(result, mode, index);
  } catch (error) {
    console.log("error");
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
async function defineTicketDetailVariables(ticket, mode, index) {
  let category = ticket[index].category;
  let categoryColor = ticket[index].category.toLowerCase().replace(" ", "-");
  let title = ticket[index].title;
  let description = ticket[index].description || [];
  let date = ticket[index].date.split("-");
  let formattedDate = `${date[2]}/${date[1]}/${date[0]}`;
  let priority = ticket[index].priority || "-";
  let assignedTo = ticket[index].assignedTo || [];
  let subtasks = ticket[index].subtask || [];
  if (mode === "view") {
    renderTicketDetails(
      category,
      categoryColor,
      title,
      description,
      formattedDate,
      priority,
      assignedTo,
      subtasks,
      index
    );
  } else if (mode === "edit") {
    editTicket(title, description, priority, assignedTo, subtasks, index, mode);
  }
}

/**
 * Checks and retrieves edited values from input fields for a ticket,
 * then updates the ticket with the new values.
 *
 * @param {HTMLElement} ele - The element representing the ticket being edited. 
 *                            Must have a `dataset.ticketindex` property.
 */
function checkEditedValues(ele) {
  let index = ele.dataset.ticketindex;
  let title = "";
  let description = "";
  let date;
  if (document.getElementById("task-title-edit").value) {
    title = document.getElementById("task-title-edit").value;
  }
  if (document.getElementById("task-description-edit").value) {
    description = document.getElementById("task-description-edit").value;
  }
  if (document.getElementById("task-date-edit").value) {
    date = document.getElementById("task-date-edit").value;
  }
  ele.dataset.mode = "view";
  takeOverEditedTicket(ele, index, title, description, date);
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
function takeOverEditedTicket(
  ele,
  index,
  titleEdit,
  descriptionEdit,
  dateEdit
) {
  let editedTicket = {};

  if (titleEdit) {
    editedTicket.title = titleEdit;
  }
  if (descriptionEdit) {
    editedTicket.description = descriptionEdit;
  }
  if (dateEdit) {
    editedTicket.date = dateEdit;
  }
  editedTicket.priority = buttonPriority;
  let selectedUsers = getSelectedUsers();
  editedTicket.assignedTo = selectedUsers;
  subtaskArray = [];
  document.querySelectorAll(".subtask-li").forEach((li) => {
    subtaskArray.push({
      text: li.innerText,
      checked: false,
    });
  });
  editedTicket.subtask = subtaskArray;
  saveEditedTaskToFirebase(ele, index, editedTicket);
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
async function saveEditedTaskToFirebase(ele, index, ticketData) {
  try {
    let response = await fetch(
      `https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${index}.json`
    );
    let ticket = await response.json();
    let updatedTicket = {
      ...ticket,
      ...ticketData,
    };
    await fetch(
      `https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${index}.json`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTicket),
      }
    );
    renderTicketOverlay(ele);
    getTicketData();
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}

/**
 * Adds a new subtask to the subtask list by appending a new <li> element
 * containing the value from the input field with id "edit-subtask" to the
 * element with id "subtask-edit-render".
 */
function addNewSubtask() {
  document.getElementById(
    "subtask-edit-render"
  ).innerHTML += `<li class="subtask-li">${
    document.getElementById("edit-subtask").value
  }</li>`;
}

/**
 * Deletes a ticket from the Firebase database by its index.
 *
 * Sends a DELETE request to the specified ticket endpoint, hides the overlay and pop-up,
 * and refreshes the ticket data. Logs an error to the console if the operation fails.
 *
 * @async
 * @function
 * @param {number|string} index - The index or ID of the ticket to delete.
 * @returns {Promise<void>} Resolves when the ticket is deleted and UI is updated.
 */
async function deleteTicket(index) {
  try {
    await fetch(
      `https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${index}.json`,
      {
        method: "DELETE",
      }
    );
    overlay.classList.add("hide");
    document.getElementById("board-task-pop-up").classList.add("hide");
    getTicketData();
  } catch (error) {
    console.error("Fehler beim Löschen des Tickets:", error);
  }
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
  let currentChecked = tickets[0][ticketIndex].subtask[subIndex].checked;
  tickets[0][ticketIndex].subtask[subIndex].checked = !currentChecked;
  let partialUpdate = {
    subtask: tickets[0][ticketIndex].subtask,
  };
  saveEditedTaskToFirebase(input, ticketIndex, partialUpdate);
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
