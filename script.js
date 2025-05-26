const BASE_URL = "https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/.json";

function init() {
  includeHTML();
  setTimeout(addDisplayToContent, 2500);
  const logo = document.querySelector(".slide-out-tl");
  const wrapper = document.getElementById("logo-wrapper");
  logo.addEventListener("animationend", () => {
    document.getElementById("header-div").classList.remove("animation-hide");
    document.getElementById("login-div").classList.remove("animation-hide");
    document.getElementById("footer").classList.remove("animation-hide");
  });
}

/**
 * get contact data
 * @param {*} event - parameter to prevent Default behaviour
 */
async function getFirebaseData(event) {
  event.preventDefault();
  try {
    let response = await fetch(BASE_URL);
    let responseJson = await response.json();
    checkLoginData(responseJson);
    console.log(responseJson);
  } catch (error) {
    console.log("error");
  }
}

async function includeHTML() {
  let includeElements = document.querySelectorAll("[template]");
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    file = element.getAttribute("template");
    let resp = await fetch(file);
    if (resp.ok) {
      element.innerHTML = await resp.text();
    } else {
      element.innerHTML = "Page not found";
    }
  }
}
