const popup = document.getElementById("add-task-pop-up");
const popuptask = document.getElementById("board-task-pop-up");
const overlay = document.getElementById("board-overlay");
/**
 * function to open/close the addTask pop-up
 */
function popUpAddTask(ele) {    
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