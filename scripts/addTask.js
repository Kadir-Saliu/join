const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskDate = document.getElementById("task-date");
let buttonPriority;
const subtask = document.getElementById("subtask");
let subtaskArray = [];
let progressColumn;


async function setPriority(prio) {
    try {
        let response = await fetch(BASE_URL_CONTACTS);
        let responseJson = await response.json();
        console.log(responseJson);
        iterateContacts(responseJson);
    } catch (error) {
        console.log("error");
    }
    
    buttonPriority = prio;   
}

async function iterateContacts(responseJson) {
    for (let index = 0; index < responseJson.length; index++) {
        let element = responseJson[index]?.name
        if (!element) {
            continue;
        }
        console.log(element, index);        
    }
}