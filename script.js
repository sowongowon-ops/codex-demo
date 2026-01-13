const greetButton = document.getElementById("greetButton");
const message = document.getElementById("message");
const incrementButton = document.getElementById("incrementCounter");
const resetButton = document.getElementById("resetCounter");
const counterValue = document.getElementById("counterValue");

const greetings = [
  "Hello! You just ran your first script.",
  "Nice work! Try editing this message in script.js.",
  "Keep going! Small steps lead to big progress.",
];

greetButton.addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * greetings.length);
  message.textContent = greetings[randomIndex];
});

let count = 0;

const updateCounter = () => {
  counterValue.textContent = count.toString();
};

incrementButton.addEventListener("click", () => {
  count += 1;
  updateCounter();
});

resetButton.addEventListener("click", () => {
  count = 0;
  updateCounter();
});
