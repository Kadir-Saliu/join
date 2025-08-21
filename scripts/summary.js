const currentTickets = JSON.parse(localStorage.getItem("tickets")) || {};

const toDos = currentTickets.filter(
  (ticket) => ticket.column == "To do"
).length;

const inProgress = currentTickets.filter(
  (ticket) => ticket.column == "In progress"
).length;
const awaitFeedback = currentTickets.filter(
  (ticket) => ticket.column == "Await feedback"
).length;
const done = currentTickets.filter((ticket) => ticket.column == "done").length;
const urgentTickets = currentTickets.filter(
  (ticket) => ticket.priority == "urgent"
).length;

const sortedTickets = currentTickets.sort(
  (a, b) => new Date(a.date) - new Date(b.date)
);

const now = new Date();
const upcomingTickets = sortedTickets.filter(
  (ticket) => new Date(ticket.date) > now
);

const nextTicket = upcomingTickets[0];

const earliestDate = nextTicket.date;
const earliestDateToDate = new Date(earliestDate)
const earliestDateYear = earliestDate.substring(0, 4);
const earliestDateDay = earliestDate.substring(8, 10);
const earliestDateMonth = earliestDate.substring(5, 7);
const fullMonth = earliestDateToDate.toLocaleDateString("de-DE", { month: "long" });
const deadline = `${fullMonth} ${earliestDateDay}. ${earliestDateYear}`;

function renderTasks() {
  const allTasks = document.querySelector(".all-tasks");
  allTasks.innerHTML = "";
  allTasks.innerHTML = getRenderTasksTemplate();
}
