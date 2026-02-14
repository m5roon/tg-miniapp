// ===== Telegram =====
const statusChip = document.getElementById("statusChip");
const tg = window.Telegram?.WebApp;

if (!tg) {
  statusChip.textContent = "Не Telegram";
} else {
  statusChip.textContent = "Telegram";
  tg.ready();
  tg.expand();
}

// ===== iOS-like calculator state =====
const valueEl = document.getElementById("value");
const exprEl = document.getElementById("expr");
const opBtns = Array.from(document.querySelectorAll(".btn.op"));

let current = "0";     // то, что на экране (строкой)
let stored = null;     // предыдущее число (Number)
let pendingOp = null;  // "add"|"sub"|"mul"|"div"
let justEvaluated = false;

function popValue() {
  valueEl.classList.remove("pop");
  void valueEl.offsetWidth;
  valueEl.classList.add("pop");
}

function formatForDisplay(s) {
  // ограничим длину, чтобы не вылезало
  if (s.length > 12) return s.slice(0, 12);
  return s;
}

function setDisplay(s) {
  current = s;
  valueEl.textContent = formatForDisplay(s);
  popValue();
}

function setExpr(text) {
  exprEl.textContent = text || "";
}

function clearActiveOpHighlight() {
  opBtns.forEach(b => b.classList.remove("active"));
}

function highlightOp(op) {
  clearActiveOpHighlight();
  const btn = opBtns.find(b => b.dataset.op === op);
  if (btn) btn.classList.add("active");
}

function toNumberSafe(s) {
  if (s === "" || s === "-" || s === ".") return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function compute(a, b, op) {
  if (op === "add") return a + b;
  if (op === "sub") return a - b;
  if (op === "mul") return a * b;
  if (op === "div") return b === 0 ? NaN : a / b;
  return b;
}

function inputDigit(d) {
  if (justEvaluated) {
    // после "=" новая цифра начинает новое число
    stored = null;
    pendingOp = null;
    clearActiveOpHighlight();
    setExpr("");
    justEvaluated = false;
    current = "0";
  }

  if (current === "0") {
    setDisplay(d);
    return;
  }
  if (current === "-0") {
    setDisplay("-" + d);
    return;
  }
  setDisplay(current + d);
}

function inputDot() {
  if (justEvaluated) {
    stored = null;
    pendingOp = null;
    clearActiveOpHighlight();
    setExpr("");
    justEvaluated = false;
    current = "0";
  }
  if (current.includes(".")) return;
  setDisplay(current + ".");
}

function toggleSign() {
  if (current === "0") return;
  if (current.startsWith("-")) setDisplay(current.slice(1));
  else setDisplay("-" + current);
}

function percent() {
  const n = toNumberSafe(current);
  setDisplay(String(n / 100));
}

function clearAll() {
  current = "0";
  stored = null;
  pendingOp = null;
  justEvaluated = false;
  clearActiveOpHighlight();
  setExpr("");
  valueEl.textContent = "0";
}

function chooseOp(op) {
  const n = toNumberSafe(current);

  if (stored === null) {
    stored = n;
  } else if (pendingOp && !justEvaluated) {
    // если цепочка 2 + 3 + ...
    const r = compute(stored, n, pendingOp);
    stored = r;
    setDisplay(Number.isFinite(r) ? String(r) : "Error");
  }

  pendingOp = op;
  justEvaluated = false;
  highlightOp(op);
  setExpr(`${stored} ${symbol(op)}`);
  current = "0";
  valueEl.textContent = "0";
}

function symbol(op) {
  if (op === "add") return "+";
  if (op === "sub") return "−";
  if (op === "mul") return "×";
  if (op === "div") return "÷";
  return "";
}

function equals() {
  if (!pendingOp || stored === null) return;

  const a = stored;
  const b = toNumberSafe(current);
  const r = compute(a, b, pendingOp);

  setExpr(`${a} ${symbol(pendingOp)} ${b} =`);

  if (!Number.isFinite(r)) {
    setDisplay("Error");
  } else {
    // убираем .0 для целых
    const out = Number.isInteger(r) ? String(r) : String(r);
    setDisplay(out);
  }

  stored = null;
  pendingOp = null;
  clearActiveOpHighlight();
  justEvaluated = true;
}

// ===== events (Telegram Desktop + Mobile SAFE) =====
function handleButton(btn) {
  if (btn.dataset.digit) {
    inputDigit(btn.dataset.digit);
    return;
  }

  if (btn.dataset.op) {
    chooseOp(btn.dataset.op);
    return;
  }

  const action = btn.dataset.action;
  if (!action) return;

  if (action === "clear") clearAll();
  if (action === "sign") toggleSign();
  if (action === "percent") percent();
  if (action === "dot") inputDot();
  if (action === "equals") equals();
}

const allButtons = Array.from(document.querySelectorAll("button.btn"));

let lastTapAt = 0;

allButtons.forEach((btn) => {
  btn.addEventListener("pointerup", (e) => {
    const now = Date.now();
    if (now - lastTapAt < 120) return; // анти-дабл
    lastTapAt = now;

    e.preventDefault();
    e.stopPropagation();

    handleButton(btn);
  });
});
