const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
//Get Userame and rom from URL

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

//Join ChatRoom

socket.emit("joinRoom", { username, room });

//get room and users

socket.on("roomUsers", ({ room, users }) => {
  ouputRoomName(room);
  ouputUsers(users);
});

socket.on("message", (message) => {
  outputMessage(message);

  //Scroll down

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit("chatMessage", msg);

  e.target.elements.msg.value = "";

  e.target.elements.msg.focus();
});

// Ouput message to domss
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username}<span> ${message.time} </span></p>
  <p class="text">
    ${message.text}
  </p>`;

  document.querySelector(".chat-messages").appendChild(div);
}

function ouputRoomName(room) {
  roomName.innerText = room;
}

function ouputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
    `;
}
