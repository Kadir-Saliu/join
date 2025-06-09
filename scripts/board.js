const popup = document.getElementById("add-task-pop-up");
const overlay = document.getElementById("board-overlay");
/**
 * function to open/close the addTask pop-up
 */
function popUpAddTask() {    
    const isHidden = popup.classList.contains("hide");
    if (isHidden) {
        popup.classList.remove("hide", "slide-out");
        popup.classList.add("slide-in", "pop-up");
        overlay.classList.remove("hide");
    } else {
        popup.classList.remove("slide-in");
        popup.classList.add("slide-out");
        setTimeout(() => {
        popup.classList.add("hide");
        overlay.classList.add("hide");
        }, 200);
    }
}