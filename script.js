// ====== Firebase Setup ======
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  onChildChanged,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";

// ====== Firebase Configuration ======
const firebaseConfig = {
  apiKey: "AIzaSyCsZ6mjf3qPWqhyiZNfZH-5OA0AcLbSy-8",
  authDomain: "real-time-database-9a7e1.firebaseapp.com",
  projectId: "real-time-database-9a7e1",
  storageBucket: "real-time-database-9a7e1.firebasestorage.app",
  messagingSenderId: "1026502043481",
  appId: "1:1026502043481:web:aa4474d4d80c46441c8e48",
  measurementId: "G-RR3K38WN6N",
};

// ====== Initialize Firebase ======
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ====== Authentication ======
document.getElementById("signup")?.addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("SignUp Successfully");
      window.location.href = "user.html";
    })
    .catch((error) => alert(error.message));
});

document.getElementById("login")?.addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login Successfully");
      window.location.href = "user.html";
    })
    .catch((error) => alert(error.message));
});

document.getElementById("google-btn")?.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(() => {
      alert("Login Successfully");
      window.location.href = "user.html";
    })
    .catch((error) => alert(error.message));
});

document.getElementById("logout")?.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("Log Out Successfully");
      window.location.href = "index.html";
    })
    .catch((error) => alert(error.message));
});

// ====== Username Page ======
document.getElementById("user-btn")?.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  if (!username) return alert("Must enter your username!");
  localStorage.setItem("anyName", username);
  window.location.href = "chat.html";
});

// ====== Chat Page Functions ======
window.sendMessage = function () {
  const username = localStorage.getItem("anyName");
  const message = document.getElementById("message").value.trim();

  if (!username || !message) return;

  push(ref(db, "messages"), {
    name: username,
    text: message,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  document.getElementById("message").value = "";
};

// ====== Show Messages ======
onChildAdded(ref(db, "messages"), (snapshot) => {
  const data = snapshot.val();
  const id = snapshot.key;

  const msgDiv = document.createElement("div");
  msgDiv.id = id;
  msgDiv.className = "message";
  msgDiv.innerHTML = `
    <p><b>${data.name}:</b> ${data.text}</p>
    <span class="time">${data.time || ""}</span>
    <div class="actions">
      <button onclick="editMessage('${id}', '${data.text}')">Edit</button>
      <button onclick="deleteMessage('${id}')">Delete</button>
    </div>
  `;

  document.getElementById("messages").appendChild(msgDiv);
});
// ====== Edit Messages ======
onChildChanged(ref(db, "messages"), (snapshot) => {
  const data = snapshot.val();
  const id = snapshot.key;
  const msgDiv = document.getElementById(id);

  if (msgDiv) {
    msgDiv.querySelector("p").innerHTML = `<b>${data.name}:</b> ${data.text} <span style="color:gray; font-size:12px;">(edited)</span>`;
    msgDiv.querySelector(".time").textContent = data.time || "";
  }
});

window.editMessage = function (id, oldText) {
  const newText = prompt("Edit your message:", oldText);
  if (newText && newText.trim() !== "") {
    const username = localStorage.getItem("anyName");
    const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    update(ref(db, "messages/" + id), {
      text: newText,
      time: newTime
    });

    const msgDiv = document.getElementById(id);
    msgDiv.querySelector("p").innerHTML = `<b>${username}:</b> ${newText} <span style="color:gray; font-size:12px;">(edited)</span>`;
    msgDiv.querySelector(".time").textContent = newTime;
  }
};

// ====== Delete Messages ======
window.deleteMessage = function (id) {
  if (confirm("Are you sure you want to delete this message?")) {
    remove(ref(db, "messages/" + id));
    document.getElementById(id)?.remove();
  }
};

// ====== Theme Toggle (for all pages) ======
const checkbox = document.getElementById("toggle-checkbox");
const containers = ["container1", "container2", "container3"];

if (checkbox) {
  checkbox.addEventListener("change", () => {
    containers.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle("dark-theme");
    });
  });
}
