async function showContacts() {
  let user = Object.entries(await (await fetch(BASE_URL_USERS)).json())
    .map(([id, user]) => ({ id, ...user }))
    .find((user) => user.name === loggedInUser.username);

  let contacts = await getContactsData(user);

  document.getElementById("contacts").innerHTML = "";
  contacts.forEach((contact) => {
    let initals = contact.name.split(" ")[0][0] + contact.name.split(" ")[1][0];
    document.getElementById("contacts").innerHTML += /*html*/ `
      <div class="contact">
        <div>${initals}</div>
        <div>
          <div class="contact-list-name">${contact.name}</div>
          <div class="email-color">${contact.email}</div>
        </div>
      </div>
    `;
  });
}
