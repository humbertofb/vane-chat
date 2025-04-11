import { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const firebaseConfig = {
  apiKey: "AIzaSyBtf--tWrqRVItAGJGQ6hEk81iggP4I-SU",
  authDomain: "my-humber-project-319815.firebaseapp.com",
  projectId: "my-humber-project-319815",
  storageBucket: "my-humber-project-319815.appspot.com",
  messagingSenderId: "110994378936",
  appId: "1:110994378936:web:60b20c16ce5f40b47e644d",
};

let app;
let db;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase initialization error", e);
}

export default function RomanticChat() {
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [theme, setTheme] = useState("light");
  const [category, setCategory] = useState("random");

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!user || !message || !db) return;
    try {
      await addDoc(collection(db, "messages"), {
        user,
        message,
        category,
        timestamp: serverTimestamp(),
      });
      setMessage("");
    } catch (e) {
      console.error("Error sending message:", e);
    }
  };

  const handleReaction = (id, emoji) => {
    alert(`Reaccionaste a ${id} con ${emoji}`); // futuro: guardar reacciones
  };

  return (
    <div className={`min-h-screen p-4 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-pink-50 text-black"}`}>
      {!user ? (
        <div className="text-center mt-20">
          <Input
            placeholder="¿Cómo te llamas?"
            onChange={(e) => setUser(e.target.value)}
            className="max-w-xs mx-auto"
          />
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex justify-between">
            <select onChange={(e) => setCategory(e.target.value)} className="rounded p-2">
              <option value="random">Random</option>
              <option value="amor">Amor</option>
              <option value="suenos">Sueños</option>
              <option value="risas">Risas</option>
              <option value="traviesa">Traviesa 😏</option>
            </select>
            <Button variant="outline" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>Modo {theme === "dark" ? "Claro" : "Noche"}</Button>
          </div>

          <Card className="h-[500px] overflow-y-auto bg-white/20 backdrop-blur rounded-2xl p-4">
            <CardContent className="space-y-2">
              {messages.map((msg) => (
                <div key={msg.id} className={`p-2 rounded-xl ${msg.user === user ? "bg-pink-300 ml-auto" : "bg-white mr-auto"} max-w-[75%] relative`}>
                  <p className="text-sm font-semibold">{msg.user}</p>
                  <p>{msg.message}</p>
                  <div className="absolute bottom-0 right-2 flex space-x-1 text-sm">
                    {["❤️", "😂", "🥰", "😳"].map((emoji) => (
                      <button key={emoji} onClick={() => handleReaction(msg.id, emoji)}>{emoji}</button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe una pregunta o mensaje..."
              className="flex-1"
            />
            <Button onClick={sendMessage}>Enviar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
