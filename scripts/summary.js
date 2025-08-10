const currentTickets = JSON.parse(localStorage.getItem("tickets")) || {};
console.log(currentTickets);

const toDos = currentTickets.filter(
  (ticket) => ticket.column == "To do"
).length;
console.log(toDos);

const inProgress = currentTickets.filter(
  (ticket) => ticket.column == "In progress"
).length;
const awaitFeedback = currentTickets.filter(
  (ticket) => ticket.column == "Await feedback"
).length;
const done = currentTickets.filter((ticket) => ticket.column == "done").length;
const urgentTickets = currentTickets.filter((ticket) => ticket.priority == "urgent").length;
function renderTasks() {
  const allTasks = document.querySelector(".all-tasks");
  allTasks.innerHTML = "";
  allTasks.innerHTML = getRenderTasksTemplate();
}


