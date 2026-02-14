// Берём элементы со страницы по id
const statusEl = document.getElementById("status");
const userEl = document.getElementById("user");
const initDataEl = document.getElementById("initData");
const btn = document.getElementById("btn");

// Пытаемся получить Telegram WebApp API
const tg = window.Telegram?.WebApp;

// Если страница открыта НЕ в Telegram
if (!tg) {
  statusEl.textContent = "Статус: открыто не в Telegram";
  btn.disabled = true;

// Если страница открыта ВНУТРИ Telegram
} else {
  statusEl.textContent = "Статус: открыто в Telegram";

  // Сообщаем Telegram, что приложение готово
  tg.ready();

  // Просим развернуть WebView на весь экран
  tg.expand();

  // Берём данные пользователя (НЕ доверять без сервера)
  const user = tg.initDataUnsafe?.user ?? null;

  // Показываем пользователя на странице
  userEl.textContent = JSON.stringify(user, null, 2);

  // По клику показываем initData
  btn.addEventListener("click", () => {
    initDataEl.textContent = tg.initData || "initData пустой";
  });
}
