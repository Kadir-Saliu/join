const BASE_URL = "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/";
function init() {
    setTimeout(addDisplayToContent, 2500);
}

/**
 * shows start content, after the start animation finished
 */
function addDisplayToContent() {
    document.getElementById("header-div").classList.remove("animation-hide");
    document.getElementById("login-div").classList.remove("animation-hide");
    document.getElementById("footer").classList.remove("animation-hide");
};
