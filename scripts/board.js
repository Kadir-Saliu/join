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
  const ticketsArray = ticket[0];
  document.getElementById("to-do-div").innerHTML = "";
  document.getElementById("in-progress-div").innerHTML = "";
  document.getElementById("await-feedback-div").innerHTML = "";
  Object.entries(ticketsArray).forEach(([index, t]) => {
    if (t) {
      const columnId = `${t.column.replace(" ", "-").toLowerCase()}-div`;


      let description = t.description || "";
      let title = t.title;
      let category = t.category;
      let categoryCss = t.category.replace(" ", "-").toLowerCase();
      let assignedTo = t.assignedTo || [];
      let priority = t.priority || [];
      let subtasks = t.subtask;

      document.getElementById(columnId).innerHTML += ticketTemplate(
        title,
        description,
        category,
        categoryCss,
        assignedTo,
        priority,
        index
      );

      renderSubtaskProgress(index, subtasks);
      toggleNoTaskContainer(columnId);
    }
  });
}

function renderSubtaskProgress(index, subtasks) {
  if(subtasks) {
    document.getElementById(`p-subtask-${index}`).classList.remove("hide")
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
    editTicket(title, description, priority, assignedTo, subtasks, index, mode);
  }
}

function checkEditedValues(ele) {
  let index = ele.dataset.ticketindex;
  let title = "";
  let description = "";
  let date;
  if(document.getElementById("task-title-edit").value) {
    title = document.getElementById("task-title-edit").value;    
  };
  if(document.getElementById("task-description-edit").value) {
    description = document.getElementById("task-description-edit").value;    
  };
  if(document.getElementById("task-date-edit").value) {
    date = document.getElementById("task-date-edit").value;    
  };
  ele.dataset.mode = "view";
  takeOverEditedTicket(ele, index, title, description, date);
}

function takeOverEditedTicket(ele, index, titleEdit, descriptionEdit, dateEdit) {
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
  document.querySelectorAll(".subtask-li").forEach(li => {
    subtaskArray.push({
            text: li.innerText,
            checked: false
        });    
  });
  editedTicket.subtask = subtaskArray;
  saveEditedTaskToFirebase(ele, index, editedTicket);
}

async function saveEditedTaskToFirebase(ele, index, ticketData) {
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
    renderTicketOverlay(ele);
    getTicketData();
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}

function addNewSubtask () {
  document.getElementById("subtask-edit-render").innerHTML += `<li class="subtask-li">${document.getElementById("edit-subtask").value}</li>`
}

async function deleteTicket(index) {
  try {
    await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${index}.json`, {
      method: "DELETE"
    });
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
    subtask: tickets[0][ticketIndex].subtask
  };
  saveEditedTaskToFirebase(input, ticketIndex, partialUpdate);
}