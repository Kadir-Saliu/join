const popup = document.getElementById("add-task-pop-up");
const popuptask = document.getElementById("board-task-pop-up");
const overlay = document.getElementById("board-overlay");
/**
 * function to open/close the addTask pop-up
 */
function popUpAddTask(ele, columnV) {
  columnVal = columnV;
  const isHidden = ele.classList.contains("hide");
  if (document.getElementById("board-task-information").className === "hide" && document.getElementById("board-task-edit").className === "") {
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

async function renderTickets(ticket) {
  for (let index = 0; index < ticket[0].length; index++) {
    let description = ticket[0][index].description || "";
    let title = ticket[0][index].title;
    let category = ticket[0][index].category;
    let categoryCss = ticket[0][index].category.replace(" ", "-").toLowerCase();
    let assignedTo = ticket[0][index].assignedTo || [];
    let priority = ticket[0][index].priority || [];
    document.getElementById(`${ticket[0][index].column.replace(" ", "-").toLowerCase()}-div`).innerHTML += ticketTemplate(
      title,
      description,
      category,
      categoryCss,
      assignedTo,
      priority,
      index
    );
    toggleNoTaskContainer(`${ticket[0][index].column.replace(" ", "-").toLowerCase()}-div`);
  }
}

function toggleNoTaskContainer(taskDiv) {
  let currentContainer = document.getElementById(taskDiv);
 
  if (currentContainer.innerHTML !== "" && currentContainer === document.getElementById("to-do-div")) {
    document.getElementById("noTasksToDo").style.display = "none";
  }

   if (currentContainer.innerHTML !== "" && currentContainer === document.getElementById("in-progress-div")) {
    document.getElementById("noTasksProgress").style.display = "none";
  }

   if (currentContainer.innerHTML !== "" && currentContainer === document.getElementById("await-feedback-div")) {
    document.getElementById("noTasksFeedback").style.display = "none";
  }

   if (currentContainer.innerHTML !== "" && currentContainer === document.getElementById("done-div")) {
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
    let tickets = Object.values(responseJson || {}).filter((ticket) => ticket !== null);
    let index = ele.dataset.ticketindex;
    let mode = ele.dataset.mode;    
    defineTicketDetailVariables(tickets[0][index], mode, index);
  } catch (error) {
    console.log("error");
  }  
}

async function defineTicketDetailVariables(ticket, mode, index) {
  let category = ticket.category;
  let categoryColor = ticket.category.toLowerCase().replace(" ", "-");
  let title = ticket.title;
  let description = ticket.description || [];
  let date = ticket.date.split("-");
  let formattedDate = `${date[2]}/${date[1]}/${date[0]}`;
  let priority = ticket.priority || "-";
  let assignedTo = ticket.assignedTo || [];
  let subtasks = ticket.subtask || [];
  if(mode === "view") {  
    renderTicketDetails(category, categoryColor, title, description, formattedDate, priority, assignedTo, subtasks, index);
  } else if (mode === "edit") {
    editTicket(title, description, priority, assignedTo, subtasks, index);
  }
}

function checkEditedValues(ele) {
  let index = ele.dataset.index;
  let title = "";
  let description = "";
  if(document.getElementById("task-title-edit").value) {
    title = document.getElementById("task-title-edit").value;    
  };
  if(document.getElementById("task-description-edit").value) {
    description = document.getElementById("task-description-edit").value;    
  };
  takeOverEditedTicket(index, title, description);
}

function takeOverEditedTicket(index, titleEdit, descriptionEdit) {
  let editedTicket = {
    title: titleEdit,
    description: descriptionEdit
  }
  saveEditedTaskToFirebase(index, editedTicket);
}

async function saveEditedTaskToFirebase(index, ticketData) {
  try {
    let response = await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${index}.json`);
    let ticket = await response.json();
    let updatedTicket = {
      ...ticket,
      ...ticketData
    };
    await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${index}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTicket),
    });
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}