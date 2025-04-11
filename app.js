// Inicializa Firebase con la configuración
const firebaseConfig = {
  apiKey: "AIzaSyBtf--tWrqRVItAGJGQ6hEk81iggP4I-SU",
  authDomain: "my-humber-project-319815.firebaseapp.com",
  projectId: "my-humber-project-319815",
  storageBucket: "my-humber-project-319815.appspot.com",
  messagingSenderId: "110994378936",
  appId: "1:110994378936:web:60b20c16ce5f40b47e644d",
};

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

// Elementos del DOM
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("send");
const messagesContainer = document.getElementById("messages");

// Enviar mensaje
sendButton.addEventListener("click", async () => {
  const message = messageInput.value;
  if (message) {
    try {
      await db.collection("messages").add({
        message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      messageInput.value = "";
    } catch (e) {
      console.error("Error al enviar el mensaje", e);
    }
  }
});

// Escuchar nuevos mensajes
const q = db.collection("messages").orderBy("timestamp");
q.onSnapshot((snapshot) => {
  messagesContainer.innerHTML = "";
  snapshot.docs.forEach((doc) => {
    const msgData = doc.data();
    const messageElement = document.createElement("div");
    messageElement.textContent = msgData.message;
    messagesContainer.appendChild(messageElement);
  });
});
