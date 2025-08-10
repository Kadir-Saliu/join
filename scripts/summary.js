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

function getRenderTasksTemplate() {
  return `
             <div class="toDo-and-done">
              <div class="to-do">
                <a href=""
                  ><svg xmlns="http://www.w3.org/2000/svg" width="69" height="70" viewBox="0 0 69 70" fill="none">
                    <circle class="change-circle-color" cx="34.5" cy="35" r="34.5" fill="#2A3647" />
                    <mask
                      id="mask0_319113_6282"
                      style="mask-type: alpha"
                      maskUnits="userSpaceOnUse"
                      x="18"
                      y="19"
                      width="33"
                      height="32"
                    >
                      <rect x="18.5" y="19" width="32" height="32" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_319113_6282)">
                      <path
                        class="change-contents-color"
                        d="M25.1667 44.3332H27.0333L38.5333 32.8332L36.6667 30.9665L25.1667 42.4665V44.3332ZM44.2333 30.8998L38.5667 25.2998L40.4333 23.4332C40.9444 22.9221 41.5722 22.6665 42.3167 22.6665C43.0611 22.6665 43.6889 22.9221 44.2 23.4332L46.0667 25.2998C46.5778 25.8109 46.8444 26.4276 46.8667 27.1498C46.8889 27.8721 46.6444 28.4887 46.1333 28.9998L44.2333 30.8998ZM42.3 32.8665L28.1667 46.9998H22.5V41.3332L36.6333 27.1998L42.3 32.8665Z"
                        fill="white"
                      />
                    </g></svg
                ></a>
                <div class="center">
                  <h3>${toDos}</h3>
                  <p>To-do</p>
                </div>
              </div>
              <div class="done">
                <a href=""
                  ><svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70" fill="none">
                    <circle class="change-circle-color" cx="35" cy="35" r="34.5" fill="#2A3647" />
                    <path
                      class="change-contents-color"
                      d="M20.0283 35.0001L31.2571 46.0662L49.9717 23.9341"
                      stroke="white"
                      stroke-width="7"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    /></svg
                ></a>
                <div class="center">
                  <h3>${done}</h3>
                  <p>Done</p>
                </div>
              </div>
            </div>
            <div class="urgent-and-date">
              <div class="urgent">
                <a href=""><img src="./assets/icon/urgent-orange-icon.svg" alt="" /></a>
                <div>
                  <h3>${urgentTickets}</h3>
                  <p>Urgent</p>
                </div>
              </div>
              <img src="./assets/icon/hyphen.svg" alt="" />
              <div class="deadline">
                <h4>Mai 19. 2025</h4>
                <p>Upcoming Deadline</p>
              </div>
            </div>
            <div class="tasks-in-editing">
              <div class="tasks-in-board">
                <h3>${currentTickets.length}</h3>
                <p>
                  Tasks in <br />
                  Board
                </p>
              </div>
              <div class="tasks-in-progress">
                <h3>${inProgress}</h3>
                <p>
                  Tasks in <br />
                  Progress
                </p>
              </div>
              <div class="awaiting-feedback">
                <h3>${awaitFeedback}</h3>
                <p>
                  Awaiting <br />
                  Feedback
                </p>
              </div>
            </div>
    
    `;
}
