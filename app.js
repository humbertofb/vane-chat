// Inicializa Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBtf--tWrqRVItAGJGQ6hEk81iggP4I-SU",
  authDomain: "my-humber-project-319815.firebaseapp.com",
  projectId: "my-humber-project-319815",
  storageBucket: "my-humber-project-319815.appspot.com",
  messagingSenderId: "110994378936",
  appId: "1:110994378936:web:60b20c16ce5f40b47e644d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elementos del DOM
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("send");
const messagesContainer = document.getElementById("messages");

// Enviar mensaje
sendButton.addEventListener("click", async () => {
  const message = messageInput.value;
  if (message) {
    try {
      await addDoc(collection(db, "messages"), {
        message,
        timestamp: serverTimestamp(),
      });
      messageInput.value = "";
    } catch (e) {
      console.error("Error al enviar el mensaje", e);
    }
  }
});

// Escuchar nuevos mensajes
const q = query(collection(db, "messages"), orderBy("timestamp"));
onSnapshot(q, (snapshot) => {
  messagesContainer.innerHTML = "";
  snapshot.docs.forEach((doc) => {
    const msgData = doc.data();
    const messageElement = document.createElement("div");
    messageElement.textContent = msgData.message;
    messagesContainer.appendChild(messageElement);
  });
});
