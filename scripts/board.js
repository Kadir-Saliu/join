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

function closeViaOverlay(overlayElement) {
  const targetId = overlayElement.dataset.target;
  const popupElement = document.getElementById(targetId);
  if (popupElement) {
    popUpAddTask(popupElement);
  }
}

function switchEditInfoMenu(ele) {
  document.getElementById("board-task-information").classList.toggle("hide");
  document.getElementById("board-task-edit").classList.toggle("hide");
  renderTicketOverlay(ele);
}

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
      let ticketCounterId = t.id;

      calculateSubtaskCounter(subtasks);

      document.getElementById(columnId).innerHTML += await ticketTemplate(
        title,
        description,
        category,
        categoryCss,
        assignedTo,
        priority,
        index,
        subtasks,
        ticketCounterId
      );
    renderSubtaskProgress(index, subtasks);
    }
  }
  toggleNoTaskContainer();
}

function startDragging(index) {
  currentDraggedElement = index;
  toggleNoTaskContainer();
}

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

function renderSubtaskProgress(index, subtasks) {
  if (subtasks[0]) {
    document.getElementById(`p-subtask-${index}`).classList.remove("hide");
  }
}

function allowDrop(ev) {
  ev.preventDefault();
}

function moveTo(category) {
  console.log(category);
  allTickets[currentDraggedElement]["column"] = category;
  renderTickets(allTickets);
}

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
    console.log("error");
  }
}

async function defineTicketDetailVariables(ticket, mode, index, ticketCounterId) {
  console.log(ticketCounterId);
  
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
      index,
      ticketCounterId
    );
  } else if (mode === "edit") {
    console.log(ticketCounterId);
    
    editTicket(title, description, priority, assignedTo, subtasks, index, mode, ticketCounterId);
  }
}

function checkEditedValues(ele) {
  let index = ele.dataset.ticketindex;
  let title = "";
  let description = "";
  let date;
  let ticketCounterId = ele.dataset.ticketcounterid;
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
  takeOverEditedTicket(ele, index, title, description, date, ticketCounterId);
}

function takeOverEditedTicket(
  ele,
  index,
  titleEdit,
  descriptionEdit,
  dateEdit,
  ticketCounterId
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
  saveEditedTaskToFirebase(ele, index, editedTicket, ticketCounterId);
}

async function saveEditedTaskToFirebase(ele, index, ticketData, ticketCounterId) {
  try {
    let response = await fetch(
      `https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${ticketCounterId}.json`
    );
    let ticket = await response.json();
    let updatedTicket = {
      ...ticket,
      ...ticketData,
    };
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
    renderTicketOverlay(ele);
    getTicketData();
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}

function addNewSubtask() {
  document.getElementById(
    "subtask-edit-render"
  ).innerHTML += `<li class="subtask-li">${
    document.getElementById("edit-subtask").value
  }</li>`;
}

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
