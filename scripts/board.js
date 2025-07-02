const popup = document.getElementById("add-task-pop-up");
const popuptask = document.getElementById("board-task-pop-up");
const overlay = document.getElementById("board-overlay");
/**
 * function to open/close the addTask pop-up
 */
function popUpAddTask(ele, columnV) {
  columnVal = columnV;
  const isHidden = ele.classList.contains("hide");
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

function switchEditInfoMenu() {
  document.getElementById("board-task-information").classList.toggle("hide");
  document.getElementById("board-task-edit").classList.toggle("hide");
}

async function renderTickets(ticket) {
  console.log(ticket[0][1].column.replace(" ", "-").toLowerCase());
  //document.getElementById(`${ticket[0][1].column.replace(" ", "-").toLowerCase()}-div`).innerHTML = ticketTemplate();
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
      priority
    );
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
    (ticket) => ticket.title.toLowerCase().includes(searchInput) || ticket.description.toLowerCase().includes(searchInput)
  );
  renderTickets(filteredTickets);
}
