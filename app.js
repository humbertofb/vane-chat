const firebaseConfig = {
  apiKey: "AIzaSyBtf--tWrqRVItAGJGQ6hEk81iggP4I-SU",
  authDomain: "my-humber-project-319815.firebaseapp.com",
  projectId: "my-humber-project-319815",
  storageBucket: "my-humber-project-319815.firebasestorage.app",
  messagingSenderId: "110994378936",
  appId: "1:110994378936:web:60b20c16ce5f40b47e644d"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = "";
let currentColor = "blue";  // Default color
let reactionPickerVisible = false;

// Initialize user data from localStorage
window.onload = () => {
  const savedName = localStorage.getItem('name');
  const savedColor = localStorage.getItem('color');
  if (savedName && savedColor) {
    currentUser = savedName;
    currentColor = savedColor;
    document.getElementById('login').style.display = 'none';
    document.getElementById('chat').style.display = 'flex';
    document.body.style.backgroundColor = currentColor === "blue" ? "#cce5ff" : "#f8d7da";  // Set background color based on choice
  }
};

// Set color profile
function setColor(color) {
  currentColor = color;
  document.body.style.backgroundColor = color === "blue" ? "#cce5ff" : "#f8d7da";
  localStorage.setItem('color', color);
}

// Start chat
function startChat() {
  const name = document.getElementById('username').value.trim();
  if (!name) return alert("Escribe tu nombre para entrar");
  currentUser = name;
  localStorage.setItem('name', name);  // Save name to localStorage
  document.getElementById('login').style.display = 'none';
  document.getElementById('chat').style.display = 'flex';
  listenMessages();
}

// Send message
function sendMessage() {
  const text = document.getElementById('messageInput').value.trim();
  if (!text) return;
  db.collection("messages").add({
    text,
    user: currentUser,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    reactions: {},
  });
  document.getElementById('messageInput').value = "";
}

// Listen for messages
function listenMessages() {
  db.collection("messages").orderBy("createdAt")
    .onSnapshot(snapshot => {
      const container = document.getElementById("messages");
      container.innerHTML = "";
      snapshot.forEach(doc => {
        const msg = doc.data();
        if (!msg || !msg.text || !msg.user) return;
        const div = document.createElement("div");
        div.className = `message ${msg.user === currentUser ? 'me' : 'you'}`;
        div.innerHTML = `
          <strong>${msg.user}:</strong> <span contenteditable="false">${msg.text}</span>
          <div class="reactions">${formatReactions(msg.reactions)}</div>
          <div class="actions">
            <button onclick="toggleReactionPicker(this, '${doc.id}')">😊</button>
            ${msg.user === currentUser ? `<button onclick="editMessage('${doc.id}', this)">✏️</button>
            <button onclick="deleteMessage('${doc.id}')">🗑️</button>` : ''}
          </div>
        `;
        container.appendChild(div);
      });
      container.scrollTop = container.scrollHeight;
    }, error => {
      console.error("Error en snapshot listener:", error);
    });
}

// Toggle reaction picker visibility
function toggleReactionPicker(button, id) {
  const picker = button.parentElement.querySelector(".reaction-picker");
  if (picker) {
    picker.remove();
  } else {
    let picker = document.getElementById("reaction-template").content.cloneNode(true);
    picker.querySelectorAll('span').forEach(span => {
      span.onclick = (e) => toggleReaction(e, span.textContent, id);
    });
    button.parentElement.appendChild(picker);
  }
}

// Add or remove reaction from message
function toggleReaction(event, emoji, id) {
  const ref = db.collection("messages").doc(id);
  ref.get().then(doc => {
    const data = doc.data();
    if (!data) return;
    const reactions = data.reactions || {};
    if (reactions[emoji]) {
      reactions[emoji]--;
      if (reactions[emoji] === 0) delete reactions[emoji];
    } else {
      reactions[emoji] = 1;
    }
    ref.update({ reactions });
  });
}

// Edit message
function editMessage(id, button) {
  const span = button.parentElement.parentElement.querySelector('span');
  span.contentEditable = true;
  span.focus();
  span.onblur = () => {
    const newText = span.textContent;
    db.collection("messages").doc(id).update({ text: newText });
    span.contentEditable = false;
  };
}

// Delete message
function deleteMessage(id) {
  db.collection("messages").doc(id).delete();
}

// Go back to login screen
function goBackToLogin() {
  document.getElementById('chat').style.display = 'none';
  document.getElementById('login').style.display = 'flex';
  localStorage.removeItem('name');
  localStorage.removeItem('color');
  currentUser = '';
  currentColor = 'blue';
}
