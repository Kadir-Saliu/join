const currentTickets = JSON.parse(localStorage.getItem("tickets")) || {};

/**
 * The number of tickets currently in the "To do" column.
 * @type {number}
 */
const toDos = currentTickets.filter(
  (ticket) => ticket.column == "To do"
).length;

/**
 * The number of tickets currently in the "In progress" column.
 * @type {number}
 */
const inProgress = currentTickets.filter(
  (ticket) => ticket.column == "In progress"
).length;

/**
 * The number of tickets currently in the "Await feedback" column.
 * @type {number}
 */
const awaitFeedback = currentTickets.filter(
  (ticket) => ticket.column == "Await feedback"
).length;

/**
 * The number of tickets that are in the "done" column.
 * @type {number}
 */
const done = currentTickets.filter((ticket) => ticket.column == "done").length;

/**
 * The number of tickets with "urgent" priority in the currentTickets array.
 * @type {number}
 */
const urgentTickets = currentTickets.filter(
  (ticket) => ticket.priority == "urgent"
).length;

/**
 * An array of ticket objects sorted in ascending order by their date property.
 * Each ticket object should have a 'date' property that can be parsed by the Date constructor.
 * @type {Array<{date: string, [key: string]: any}>}
 */
const sortedTickets = currentTickets.sort(
  (a, b) => new Date(a.date) - new Date(b.date)
);

const now = new Date();

/**
 * Filters and returns tickets with a date in the future.
 *
 * @constant
 * @type {Array<Object>}
 * @property {string} date - The date of the ticket in a format parseable by `Date`.
 * @description
 * Contains all tickets from `sortedTickets` whose `date` property is later than the current time (`now`).
 */
const upcomingTickets = sortedTickets.filter(
  (ticket) => new Date(ticket.date) > now
);

const nextTicket = upcomingTickets[0];
let deadline = "Keine Deadline verfügbar";
if (upcomingTickets.length === 0) {
  console.warn("Keine kommenden Tickets vorhanden.");
} else {
    const nextTicket = upcomingTickets[0];
  const earliestDate = nextTicket.date;
  const earliestDateToDate = new Date(earliestDate);
  const earliestDateYear = earliestDate.substring(0, 4);
  const earliestDateDay = earliestDate.substring(8, 10);
  const earliestDateMonth = earliestDate.substring(5, 7);
  const fullMonth = earliestDateToDate.toLocaleDateString("de-DE", {month: "long",});
  deadline = `${fullMonth} ${earliestDateDay}. ${earliestDateYear}`;
}

/**
 * Renders the list of tasks by updating the inner HTML of the element
 * with the class "all-tasks" using the template returned by getRenderTasksTemplate().
 * Clears any existing content before rendering.
 */
function renderTasks() {
  const allTasks = document.querySelector(".all-tasks");
  allTasks.innerHTML = "";
  allTasks.innerHTML = getRenderTasksTemplate();
}
