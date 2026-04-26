let app;
const API = "https://script.google.com/macros/s/AKfycbz8g8EOToM5_mPjadVaxaWKph9ZvJ8T6jBAKaLhLmPLVlPTrs6U_ikKoekJ_LTKZdGDOQ/exec";

let studentId = "";
let currentTest = "";
let answers = {};
let timer;
let globalQuestions = [];

window.addEventListener("DOMContentLoaded", () => {
  app = document.getElementById("app");
  showLogin();
});

function pushState(){
  history.pushState({page: "app"}, "", "");
}

window.onpopstate = () => loadTests();

function showNavButtons(){
  const nav = document.getElementById("navBtns");
nav.innerHTML = `
  <button class="back-btn" id="profileBtn">👤</button>
  <button class="logout-btn" id="logoutBtn">Logout</button>
`;
  document.getElementById("profileBtn").onclick = showProfile;
  document.getElementById("logoutBtn").onclick = logout;
}

function hideNavButtons(){
  const nav = document.getElementById("navBtns");
  if(nav) nav.innerHTML = "";
}

function logout(){
  studentId = "";
  currentTest = "";
  answers = {};
  clearInterval(timer);
  showLogin();
}

function showLogin(){
  hideNavButtons();
  app.innerHTML = `
  <div class="login-card">
   <div class="logo">
  <img src="https://drive.google.com/thumbnail?id=1zza_SsoDx5nSzQW-UZRmPzdtUlB6TfLU" class="login-logo">
</div>
    <div class="title">Welcome Back</div>
    <div class="subtitle">Login to continue</div>

    <div class="input-box">
      📱 <input id="m" placeholder="Mobile / Student ID">
    </div>

    <div class="input-box">
      🔒 <input id="p" type="password" placeholder="Password">
    </div>

    <button class="btn" onclick="login()">Login</button>
     <div id="loginStatus" class="status-box default">
      Enter your credentials to login
    </div>
  </div>`;
}

function login(){
  const id = document.getElementById("m").value.trim();
  const pass = document.getElementById("p").value.trim();
  const btn = document.querySelector("button");

  if(!id || !pass){
    setStatus("⚠️ Enter credentials", "error");
    return;
  }

  setStatus("⏳ Loading dashboard...", "loading");
  btn.disabled = true;
  btn.innerText = "Please wait...";

  fetch(API + "?action=login&mobile=" + id + "&password=" + pass)
    .then(res => res.json())
    .then(data => {

      if(data.status === "success"){
        studentId = data.studentId;
        window.studentName = data.name;

        setStatus("✅ Login successful", "success");

        setTimeout(()=>{
          loadTests();
        },1000);

      } else if(data.status === "wrong_password"){
        setStatus("❌ Incorrect Password", "error");

      } else if(data.status === "user_not_found"){
        setStatus("❌ User not found", "error");

      } else {
        setStatus("⚠️ Unexpected error", "error");
      }

    })
    .catch(()=>{
      setStatus("🚫 Server error. Try again later", "error");
    })
    .finally(()=>{
      btn.disabled = false;
      btn.innerText = "Login";
    });
}

function setStatus(message, type){
  const box = document.getElementById("loginStatus");
  if(!box) return;
  box.className = "status-box " + type;
  box.innerText = message;
}


function loadTests(){
  pushState();
  showNavButtons();

  Promise.all([
    fetch(`${API}?action=tests`).then(r=>r.json()),
    fetch(`${API}?action=attemptStatus&studentId=${studentId}`).then(r=>r.json())
  ])
  .then(([tests, attempted])=>{

    let html = `
    <div class="dash-header">
      <h2>📚 Tests</h2>
      <p>Select a test to start</p>
    </div>`;

    for(let i=0;i<tests.length;i++){
      const t = tests[i];

      if(t.status==="Active"){

        const isDone = attempted[t.testId];

        html += `
        <div class="test-card">
          <div class="test-name">${t.testName}</div>
          <div class="meta">
            <span>🎓 Class ${t.class}</span>
            <span>⏱ ${t.duration} min</span>
          </div>
        `;

        if(isDone){
          html += `
          <button class="start-btn" style="background:#999;cursor:not-allowed;">
            ✅ Completed
          </button>`;
        } else {
          html += `
          <button class="start-btn" onclick="showInstructions('${t.testId}',${t.duration})">
            Start Test
          </button>`;
        }

        html += `</div>`;
      }
    }

    app.innerHTML = html;
  });
}

function showInstructions(id, dur){
  pushState();
  hideNavButtons();
  currentTest = id;

  fetch(`${API}?action=questions&testId=${id}`)
  .then(r=>r.json())
  .then(data=>{
    globalQuestions = data.questions;

    app.innerHTML = `
    <div class="container">
      <h2>Instructions</h2>
      <div class="card">${data.instructions}</div>
      <button class="btn" onclick="startTest(${dur})">Start Test</button>
    </div>`;
  });
}

function startTest(dur){
  pushState();
  hideNavButtons();
  answers = {};

  let html = `<div class="container"><div class="timer" id="time"></div>`;

  for(let i=0;i<globalQuestions.length;i++){
    const q = globalQuestions[i];
    html += `<div class="card"><b>${i+1}. ${q.question}</b>`;

    for(let key in q.options){
      html += `
      <div class="option" onclick="select('${q.qid}','${key}',this)">
        ${key}. ${q.options[key]}
      </div>`;
    }

    html += `</div>`;
  }

  html += `<button class="btn" onclick="submitTest()">Submit</button></div>`;
  app.innerHTML = html;

  startTimer(dur);
}

function select(qid, opt, el){
  answers[qid] = opt;

  const parent = el.parentNode;
  const opts = parent.querySelectorAll('.option');
  for(let i=0;i<opts.length;i++) opts[i].classList.remove("selected");
  el.classList.add("selected");
}

function startTimer(min){
  let t = min * 60;

  timer = setInterval(()=>{
    const m = Math.floor(t/60);
    const s = (t % 60).toString().padStart(2, '0');

    const timeEl = document.getElementById("time");
    if(timeEl) timeEl.innerText = `Time: ${m}:${s}`;

    if(--t <= 0){
      clearInterval(timer);
      submitTest();
    }
  },1000);
}

function submitTest(data) {
  const { studentId, testId, answers } = data;

  const sheet = getSheet(SHEETS.RESPONSES);
  const rows = sheet.getDataRange().getValues();

  // ❌ already attempted check
  for (let i = 1; i < rows.length; i++) {
    if (
      String(rows[i][1]) === String(studentId) &&
      String(rows[i][2]) === String(testId)
    ) {
      return { error: "Already attempted" };
    }
  }

  const correctMap = getCorrectAnswerMap(testId);

  let score = 0;
  const total = Object.keys(correctMap).length;

  for (let qid in correctMap) {
    if (answers[qid] === correctMap[qid]) {
      score++;
    }
  }

  sheet.appendRow([
    Date.now(),
    studentId,
    testId,
    JSON.stringify(answers),
    score,
    total,
    new Date()
  ]);

  return {
    submitted: true,
    score,
    total
  };
}

function showResult(){
  hideNavButtons();

  fetch(`${API}?action=result&studentId=${studentId}&testId=${currentTest}`)
  .then(r=>r.json())
  .then(d=>{
    app.innerHTML = `
    <div class="container">
      <h2>Result</h2>
      <div class="card">
        Score: <b>${d.score} / ${d.total}</b><br>
        Submitted: ${d.submittedAt || ""}
      </div>
      <button class="btn" onclick="loadTests()">Back</button>
    </div>`;
  });
}

function formatDate(dateStr){
  if(!dateStr) return "-";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2,'0');
  const month = String(d.getMonth()+1).padStart(2,'0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function showProfile(){
  hideNavButtons();

  fetch(`${API}?action=latestResult&studentId=${studentId}`)
  .then(r=>r.json())
  .then(d=>{

    const percent = d.total ? Math.round((d.score/d.total)*100) : 0;

    app.innerHTML = `
    <div class="container fade-in">

      <!-- HERO -->
      <div class="hero">
        <div style="font-size:40px;">👤</div>
        <h2>${window.studentName || ""}</h2>
        <small>ID: ${studentId}</small><br>

        <div style="font-size:28px;font-weight:700;margin-top:6px;">
          ${d.score || 0}/${d.total || 0}
        </div>

        <div class="badge">Rank #${d.rank || "-"}</div>

        <div class="progress">
          <div class="progress-bar" style="width:${percent}%"></div>
        </div>
        <small>${percent}% Score</small>
      </div>

      <!-- LAST TEST -->
      <div class="glass">
        <b>📄 Latest Test</b><br><br>
        Test ID: ${d.testId || "-"}<br>
        Date: ${formatDate(d.submittedAt)}
      </div>

      <!-- HISTORY -->
      <h3 style="margin:8px 0;">📊 Previous Tests</h3>
      <div id="history"></div>

      <button class="btn" onclick="loadTests()">Back</button>

    </div>
    `;

    loadHistory();
  });
}

let showCount = 4;

function loadHistory(){
  fetch(`${API}?action=allResults&studentId=${studentId}`)
  .then(r=>r.json())
  .then(list=>{

    let html = "";

    for(let i=0;i<Math.min(showCount,list.length);i++){
      const t = list[i];

      html += `
      <div class="glass fade-in">
        <b>${t.testId}</b>
        <div style="float:right;font-weight:600;">
          ${t.score}/${t.total}
        </div>
        <br>
        <small style="color:#777;">
          ${formatDate(t.submittedAt)}
        </small>
      </div>`;
    }

    if(list.length > showCount){
      html += `<button class="btn" onclick="showMore()">Show More</button>`;
    } 
    else if(showCount > 4){
      html += `<button class="btn" onclick="showLess()">Show Less</button>`;
    }

    document.getElementById("history").innerHTML = html;
  });
}

function showMore(){
  showCount += 5;
  loadHistory();
}

function showLess(){
  showCount = 4;
  loadHistory();
  }
