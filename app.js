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
let userColor = "azul"; // Valor por defecto

function startChat() {
  const name = document.getElementById('username').value.trim();
  if (!name) return alert("Escribe tu nombre para entrar");
  
  // Obtener el color seleccionado
  userColor = document.querySelector('input[name="color"]:checked').value;
  
  currentUser = name;
  document.getElementById('login').style.display = 'none';
  document.getElementById('chat').style.display = 'flex';
  listenMessages();
}

function sendMessage() {
  const text = document.getElementById('messageInput').value.trim();
  if (!text) return;
  db.collection("messages").add({
    text,
    user: currentUser,
    color: userColor, // Almacenamos el color junto con el mensaje
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    reactions: {},
  });
  document.getElementById('messageInput').value = "";
}

function listenMessages() {
  db.collection("messages").orderBy("createdAt")
    .onSnapshot(snapshot => {
      const container = document.getElementById("messages");
      container.innerHTML = "";
      snapshot.forEach(doc => {
        const msg = doc.data();
        // Verificación para evitar errores
        if (!msg || !msg.text || !msg.user) return;
        const div = document.createElement("div");
        div.className = `message ${msg.user === currentUser ? 'me' : 'you'} ${msg.color}`; // Añadimos la clase de color
        div.innerHTML = `
          <strong>${msg.user}:</strong> <span contenteditable="false">${msg.text}</span>
          <div class="reactions">${formatReactions(msg.reactions)}</div>
          <div class="actions">
            <button onclick="showReactionPicker(this, '${doc.id}')">😊</button>
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

function showReactionPicker(button, id) {
  let picker = document.getElementById("reaction-template").content.cloneNode(true);
  picker.querySelectorAll('span').forEach(span => {
    span.onclick = (e) => addReaction(e, span.textContent, id);
  });
  button.parentElement.appendChild(picker);
}

function addReaction(event, emoji, id) {
  event.stopPropagation();
  const ref = db.collection("messages").doc(id);
  ref.get().then(doc => {
    const data = doc.data();
    if (!data) return;
    const reactions = data.reactions || {};
    reactions[emoji] = (reactions[emoji] || 0) + 1;
    ref.update({ reactions });
  });
}

function formatReactions(reactions) {
  return Object.entries(reactions || {})
    .map(([emoji, count]) => `<span>${emoji} ${count}</span>`).join(" ");
}

function deleteMessage(id) {
  db.collection("messages").doc(id).delete();
}

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
