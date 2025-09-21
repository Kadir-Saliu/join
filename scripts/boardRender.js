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
 * Renders a list of tickets into their respective board columns.
 *
 * @async
 * @param {Array<Object>} tickets - An array of ticket objects to render. Each ticket should contain properties such as `title`, `description`, `category`, `column`, `assignedTo`, `priority`, and `subtask`.
 * @returns {Promise<void>} Resolves when all tickets have been rendered to the DOM.
 */
async function renderTickets(tickets = allTickets) {
  document.getElementById("to-do-div").innerHTML = "";
  document.getElementById("in-progress-div").innerHTML = "";
  document.getElementById("await-feedback-div").innerHTML = "";
  document.getElementById("done-div").innerHTML = "";
  await renderAllTickets(tickets);
  toggleNoTaskContainer(tickets);
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
 * @param {Array<Object>} tickets - The tickets to render. Defaults to allTickets if not provided.
 * @returns {Promise<void>} - Returns nothing but updates the UI.
 */
async function renderAllTickets(tickets = allTickets) {
  for (const [index, t] of Object.entries(tickets)) {
    if (t) {
      const {subtasks, columnId, title, description, category, categoryCss, assignedTo, priority, ticketCounterId,} = getVariablesToRenderTickets(t);
      calculateSubtaskCounter(subtasks);
      document.getElementById(columnId).innerHTML += await ticketTemplate(title, description, category, categoryCss, assignedTo, priority, index, subtasks, ticketCounterId);
      renderSubtaskProgress(index, subtasks);
    }
  }
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
      let initials = user?.split(" ").map((n) => n[0]).join("").toUpperCase();
      return `<span class="user-icon-rendered User-bc-${safeIndex}">${initials}</span>`;
    })
  );
  let userSpans = userSpansArray.join("");
  return getTicketTemplate(index, title, description, category, categoryCss, priority, subtasks, ticketCounterId, userSpans);
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
 * Toggles the visibility of "no tasks" containers for each board column
 * ("To do", "In progress", "Await feedback", "done") based on whether
 * there are any tickets in each column. Uses the helper function
 * `checkTicketsForToggle` to show or hide the corresponding container.
 *
 * @param {Array<Object>} tickets - The tickets to check. Defaults to allTickets if not provided.
 */
function toggleNoTaskContainer(tickets = allTickets) {
  let allTicketsToDo = tickets.filter((obj) => obj.column == "To do");
  let allTicketsProgress = tickets.filter((obj) => obj.column == "In progress");
  let allTicketsFeedback = tickets.filter((obj) => obj.column == "Await feedback");
  let allTicketsDone = tickets.filter((obj) => obj.column == "done");
  checkTicketsForToggle(allTicketsToDo, "noTasksToDo");
  checkTicketsForToggle(allTicketsProgress, "noTasksProgress");
  checkTicketsForToggle(allTicketsFeedback, "noTasksFeedback");
  checkTicketsForToggle(allTicketsDone, "noTasksDone");
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
  let subtaskEle = subtasks.map((subtask, i) => {
      return getRenderTicketDetailsSubtaskEleTemplate(i, subtask, index, ticketCounterId);
    }).join("");
  document.getElementById("board-task-information").innerHTML = getRenderTicketDetailsTemplate(category, categoryColor, title, description, date, priority, index, ticketCounterId, userSpans, subtaskEle);
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
  let userSpansArray = await Promise.all(iterateThroughUsersForVisualization(assignedTo));
  let userSpans = userSpansArray.join("");
  let subtaskEle = subtasks.map((subtask, i) => {
      return getEditTicketSubtaskEleTemplate(subtask, i, dataTicketIndex, dataTicketCounterId, dataMode);
    }).join("");
  subtaskEditArray = [];
  subtasks.forEach((subtask) => subtaskEditArray.push(subtask.text));
  renderHTMLElementsForEditing(title, description, dateForEditOverlay, userSpans, subtaskEle, index, ticketCounterId, mode, priority);
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
 * Retrieves the value of the "greetingShown" flag from sessionStorage.
 * Indicates whether the greeting has already been displayed in the current session.
 * @type {string|null} "true" if the greeting was shown, otherwise null if not set.
 */
document.addEventListener("DOMContentLoaded", () => {
  const greetingShown = sessionStorage.getItem("greetingShown");
  if (!greetingShown) {
    const greeting = document.querySelector(".greeting");
    if (greeting) {
      greeting.addEventListener("animationend", () => {
        greeting.style.display = "none";
      });
      sessionStorage.setItem("greetingShown", "true");
    }
  } else {
    const greeting = document.querySelector(".greeting");
    if (greeting) {
      greeting.style.display = "none";
    }
  }
});
