/**
 * Toggles popup visibility with animation.
 * @param {HTMLElement} ele - Popup element to animate.
 * @param {string} [columnV] - Optional column value.
 */
function popUpAddTask(ele, columnV) {
  if (columnV) columnVal = columnV;
  const isHidden = ele.classList.contains("hide");
  if (ele.id === "board-task-pop-up") {
    const taskInfo = document.getElementById("board-task-information");
    const taskEdit = document.getElementById("board-task-edit");
    if (taskInfo && taskEdit) {
      if (isHidden) {
        taskInfo.classList.remove("hide");
        taskEdit.classList.add("hide");
      }
    }
  }
  isHidden ? showPopUp(ele) : hidePopUp(ele);
}

/**
 * Shows popup with slide-in animation and disables scrolling.
 * @param {HTMLElement} ele - Popup element.
 */
function showPopUp(ele) {
  ele.classList.remove("hide", "slide-out");
  ele.classList.add("slide-in", "pop-up");
  document.body.classList.add("disable-scrolling");
  document.documentElement.classList.add("disable-scrolling");
  overlay.dataset.target = ele.id;
  overlay.classList.remove("hide");
}

/**
 * Hides popup with slide-out animation and enables scrolling.
 * @param {HTMLElement} ele - Popup element.
 */
function hidePopUp(ele) {
  ele.classList.remove("slide-in");
  ele.classList.add("slide-out");
  document.body.classList.remove("disable-scrolling");
  document.documentElement.classList.remove("disable-scrolling");
  setTimeout(() => {
    ele.classList.add("hide");
    overlay.classList.add("hide");
  }, 200);
}

/**
 * Closes popup via overlay click and refreshes the board with latest data.
 * @param {HTMLElement} overlayElement - Overlay element.
 */
async function closeViaOverlay(overlayElement) {
  const targetId = overlayElement.dataset.target;
  const popupElement = document.getElementById(targetId);
  if (popupElement) {
    popUpAddTask(popupElement);
    if (targetId === "add-task-pop-up" || popupElement.id === "board-task-pop-up") {
      await getTicketData();
      renderTickets();
    }
  }
}

/**
 * Closes the ticket popup and refreshes the board with latest data.
 * This function ensures that any changes made to tickets are properly
 * reflected on the board after closing the popup.
 *
 * @async
 * @function closeTicketAndRefresh
 * @returns {Promise<void>} - Resolves after the popup is closed and board is refreshed.
 */
async function closeTicketAndRefresh() {
  popUpAddTask(popuptask);
  await getTicketData();
  renderTickets();
}

/**
 * Toggles between task info and edit views.
 * @param {HTMLElement} ele - Ticket element.
 */
function switchEditInfoMenu(ele) {
  setGlobalEditInformation(ele);
  document.getElementById("board-task-information").classList.toggle("hide");
  document.getElementById("board-task-edit").classList.toggle("hide");
  renderTicketOverlay(ele);
}

/**
 * Renders tickets to board columns.
 * @param {Array<Object>} [tickets] - Ticket objects (defaults to localStorage).
 */
async function renderTickets(tickets) {
  document.getElementById("to-do-div").innerHTML = "";
  document.getElementById("in-progress-div").innerHTML = "";
  document.getElementById("await-feedback-div").innerHTML = "";
  document.getElementById("done-div").innerHTML = "";
  const ticketsToRender = tickets || JSON.parse(localStorage.getItem("tickets") || "[]");
  await renderAllTickets(ticketsToRender);
  toggleNoTaskContainer(ticketsToRender);
}

/**
 * Renders all tickets to their respective columns.
 * @param {Array<Object>} tickets - Tickets to render.
 */
async function renderAllTickets(tickets = allTickets) {
  for (const [index, t] of Object.entries(tickets)) {
    if (t) {
      const { subtasks, columnId, title, description, category, categoryCss, assignedTo, priority, ticketCounterId, columnValue } = getVariablesToRenderTickets(t);
      calculateSubtaskCounter(subtasks);
      document.getElementById(columnId).innerHTML += await ticketTemplate(title, description, category, categoryCss, assignedTo, priority, index, subtasks, ticketCounterId, columnValue);
      renderSubtaskProgress(index, subtasks);
    }
  }
}

/**
 * Generates HTML for a ticket with user icons.
 * @param {string} title - Ticket title.
 * @param {string} description - Ticket description.
 * @param {string} category - Ticket category.
 * @param {string} categoryCss - Category CSS class.
 * @param {string[]} assignedTo - Assigned user names.
 * @param {string} priority - Priority level.
 * @param {number} index - Ticket index.
 * @param {Array<object>} subtasks - Subtask objects.
 * @param {string} ticketCounterId - Ticket ID.
 * @param {string} columnValue - Column value.
 * @returns {Promise<string>} HTML string.
 */
async function ticketTemplate(title, description, category, categoryCss, assignedTo, priority, index, subtasks, ticketCounterId, columnValue) {
  let userSpans = await getUserspans(assignedTo);
  let checkedSubtask = false;
  let { upBtn, downBtn } = getColumnValue(columnValue, index);
  if (subtasks[0]) {
    subtasks.forEach((subtask) => {
      if (subtask.checked) checkedSubtask = true;
    });
  }
  return getTicketTemplate(index, title, description, category, categoryCss, priority, subtasks, ticketCounterId, userSpans, checkedSubtask, upBtn, downBtn);
}

/**
 * Generates user icon spans (max 5, shows +X for overflow).
 * @param {string[]} assignedTo - User names.
 * @returns {Promise<string>} HTML string with user icons.
 */
async function getUserspans(assignedTo) {
  let userSpansArray = await Promise.all(
    assignedTo.slice(0, 5).map(async (user) => {
      let renderedUserBgIndex = await getUserDetails(user);
      let safeIndex = ((renderedUserBgIndex - 1) % 15) + 1;
      let initials = user
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      return `<span class="user-icon-rendered User-bc-${safeIndex}">${initials}</span>`;
    })
  );
  if (assignedTo.length > 5) {
    let hiddenCount = assignedTo.length - 5;
    userSpansArray.push(`<span class="user-icon-rendered User-bc-14" id="hidden-users">+${hiddenCount}</span>`);
  }
  let userSpans = userSpansArray.join("");
  return userSpans;
}

/**
 * Shows subtask progress if subtasks exist.
 * @param {number} index - Element index.
 * @param {Array} subtasks - Subtasks array.
 */
function renderSubtaskProgress(index, subtasks) {
  if (subtasks[0]) {
    document.getElementById(`p-subtask-${index}`).classList.remove("hide");
  }
}

/**
 * Toggles "no tasks" containers based on column content.
 * @param {Array<Object>} tickets - Tickets to check.
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
 * Fetches and renders ticket overlay.
 * @param {HTMLElement} ele - Element with ticket data attributes.
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
 * Renders ticket edit form and sets priority.
 * @param {string} title - Ticket title.
 * @param {string} description - Ticket description.
 * @param {string} dateForEditOverlay - Due date.
 * @param {string} userSpans - User HTML.
 * @param {string} subtaskEle - Subtask HTML.
 * @param {string} index - Ticket index.
 * @param {string} ticketCounterId - Ticket ID.
 * @param {string} mode - Edit mode.
 * @param {string} priority - Priority level.
 */
function renderHTMLElementsForEditing(title, description, dateForEditOverlay, userSpans, subtaskEle, index, ticketCounterId, mode, priority) {
  document.getElementById("board-task-edit").innerHTML = getEditTicketTemplate(title, description, dateForEditOverlay, userSpans, subtaskEle, index, ticketCounterId, mode);
  document.querySelectorAll(".set-priority").forEach((ele) => {
    if (ele.innerText.toLowerCase().trim() === priority) {
      ele.classList.add(priority);
      buttonPriority = priority;
    } else ele.classList.remove(ele.innerText.toLowerCase().trim());
  });
}

/**
 * Renders ticket detail view with users and subtasks.
 * @param {string} category - Ticket category.
 * @param {string} categoryColor - Category color class.
 * @param {string} title - Ticket title.
 * @param {string} description - Ticket description.
 * @param {string} date - Date string.
 * @param {string} priority - Priority level.
 * @param {string[]} assignedTo - Assigned users.
 * @param {Array<object>} subtasks - Subtasks.
 * @param {number} index - Ticket index.
 * @param {string} ticketCounterId - Ticket ID.
 */
async function renderTicketDetails(category, categoryColor, title, description, date, priority, assignedTo, subtasks, index, ticketCounterId) {
  let userSpansArray = await Promise.all(
    assignedTo.map(async (user, i) => {
      let renderedUserBgIndex = await getUserDetails(user);
      let safeIndex = ((renderedUserBgIndex - 1) % 15) + 1;
      let initials = user
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      return getRenderTicketDetailsUserSpansArrayTemplate(safeIndex, initials, user);
    })
  );
  let userSpans = userSpansArray.join("");
  let subtaskEle = subtasks.map((subtask, i) => getRenderTicketDetailsSubtaskEleTemplate(i, subtask, index, ticketCounterId)).join("");
  document.getElementById("board-task-information").innerHTML = getRenderTicketDetailsTemplate(category, categoryColor, title, description, date, priority, index, ticketCounterId, userSpans, subtaskEle);
}

/**
 * Removes subtask from edit array and re-renders.
 * @param {HTMLElement} ele - Element with data-index.
 */
async function spliceEditSubArray(ele) {
  if (subtaskEditArray.length > 0) {
    subtaskEditArray.splice(ele.dataset.index, 1);
    await checkEditedValues(ele);
    renderTicketOverlay(ele);
  }
}

/**
 * Toggles subtask checked state and saves to Firebase.
 * @param {HTMLInputElement} input - Checkbox with data attributes.
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
 * Sets minimum date for task date input.
 */
function minDate() {
  const dateInput = document.getElementById("task-date");
  dateInput.setAttribute("min", today);
}

/**
 * Prepares and renders ticket edit form.
 * @param {string} title - Ticket title.
 * @param {string} description - Description.
 * @param {string} dateForEditOverlay - Date.
 * @param {string} priority - Priority.
 * @param {string[]} assignedTo - Assigned users.
 * @param {Array<object>} subtasks - Subtasks.
 * @param {number} index - Index.
 * @param {string} mode - Mode.
 * @param {string} ticketCounterId - Ticket ID.
 */
async function editTicket(title, description, dateForEditOverlay, priority, assignedTo, subtasks, index, mode, ticketCounterId) {
  let userSpansArray = await iterateThroughUsersForVisualization(assignedTo);
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
 * Creates user visualization elements (max 5 + overflow indicator).
 * @param {string[]} assignedTo - Assigned users.
 * @returns {Promise<string[]>} User icon HTML array.
 */
async function iterateThroughUsersForVisualization(assignedTo) {
  let userSpansArray = await createUserIcons(assignedTo);
  if (assignedTo.length > 5) {
    let hiddenCount = assignedTo.length - 5;
    userSpansArray.push(`
      <span class="user-icon-rendered User-bc-14" id="hidden-users">+${hiddenCount}</span>
    `);
  }
  return userSpansArray;
}

/**
 * Generates user icon HTML for up to 5 users.
 * @param {string[]} assignedTo - User names.
 * @returns {Promise<string[]>} User icon HTML array.
 */
async function createUserIcons(assignedTo) {
  return await Promise.all(
    assignedTo.slice(0, 5).map(async (user) => {
      let renderedUserBgIndex = await getUserDetails(user);
      let safeIndex = ((renderedUserBgIndex - 1) % 15) + 1;
      let initials = user
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      return getEditTicketUserSpansArrayTemplate(user, safeIndex, initials);
    })
  );
}

/**
 * Sets global edit variables from element data attributes.
 * @param {HTMLElement} ele - Element with data attributes.
 */
function setGlobalEditInformation(ele) {
  dataTicketIndex = ele.dataset.ticketindex;
  dataTicketCounterId = ele.dataset.ticketcounterid;
  dataMode = ele.dataset.mode;
}

/**
 * Handles greeting animation on page load.
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
