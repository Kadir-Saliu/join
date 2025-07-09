/**
 * This function finds the current logged in user, fetches the respective contact list and renders it after the list is sorted
 */
async function showContacts() {
  let user = Object.entries(await (await fetch(BASE_URL_USERS)).json())
    .map(([id, user]) => ({ id, ...user }))
    .find((user) => user.name === loggedInUser.username);
  let contacts = await getContactsData(user);
  contacts.sort((a, b) => a.name.localeCompare(b.name));
  let sortedContacts = {};
  contacts.forEach((contact) => {
    sortContactByInitials(contact, sortedContacts);
  });
  let contactsRef = document.getElementById("contacts");
  contactsRef.innerHTML = "";
  renderContacts(sortedContacts, contactsRef);
}

/**
 * This function takes a sorted array and saves them in an object which has the respective letters as keys
 *
 * @param {string} contact - a contact that gets sorted into respective key value in object
 * @param {Object} sortedContacts - object to save the values in
 */
function sortContactByInitials(contact, sortedContacts) {
  let inital = contact.name.charAt(0).toUpperCase();
  if (!sortedContacts[inital]) {
    sortedContacts[inital] = [];
  }
  sortedContacts[inital].push(contact);
}

/**
 * This function renders the contact list after it has been sorted.
 *
 * @param {object} sortedContacts - object that contains the sorted contacts list
 * @param {Element} contactsRef - the element where the contacts list will be rendered
 */
function renderContacts(sortedContacts, contactsRef) {
  Object.keys(sortedContacts).forEach((inital) => {
    contactsRef.innerHTML += getInitialTemplate(inital);
    sortedContacts[inital].forEach((contact) => {
      let initials = contact.name.split(" ")[0][0] + contact.name.split(" ")[1][0];
      contactsRef.innerHTML += getContactTemplate(contact, initials);
    });
  });
}
