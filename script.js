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
  <img src="https://drive.google.com/thumbnail?id=1nicJIeUOBfr1c9Chpv117uv9sQq_DfD9" class="login-logo">
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

window.studentClass = data.class;

window.studentMobile = data.mobile;

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
let totalVisibleTests = 0;

  

  showNavButtons();

  Promise.all([
    fetch(`${API}?action=tests`).then(r=>r.json()),
    fetch(`${API}?action=attemptStatus&studentId=${studentId}`).then(r=>r.json())
  ])
  .then(([tests, attempted])=>{

  let html = `

<!-- PREMIUM HERO -->

<div style="
  position:relative;
  overflow:hidden;
  background:
  linear-gradient(135deg,#0f2027,#203a43,#2c5364);
  border-radius:30px;
  padding:26px 22px;
  color:white;
  margin-bottom:22px;
  box-shadow:0 18px 45px rgba(0,0,0,.18);
">

  <!-- glow circles -->

  <div style="
    position:absolute;
    top:-60px;
    right:-60px;
    width:180px;
    height:180px;
    border-radius:50%;
    background:rgba(255,255,255,.08);
  "></div>

  <div style="
    position:absolute;
    bottom:-50px;
    left:-50px;
    width:140px;
    height:140px;
    border-radius:50%;
    background:rgba(0,255,200,.08);
  "></div>

  <!-- top -->

  <div style="
    display:flex;
    justify-content:space-between;
    align-items:center;
    position:relative;
    z-index:2;
  ">

    <div>

      <div style="
        font-size:14px;
        opacity:.85;
        letter-spacing:.5px;
      ">
        👋 Welcome Back
      </div>

      <div style="
        margin-top:6px;
        font-size:30px;
        font-weight:900;
        line-height:1.2;
      ">
        ${window.studentName}
      </div>

      <div style="
        margin-top:10px;
        display:inline-block;
        padding:7px 16px;
        border-radius:50px;
        background:rgba(255,255,255,.12);
        backdrop-filter:blur(10px);
        font-size:13px;
        font-weight:700;
      ">
        🎓 Class ${window.studentClass}
      </div>

    </div>

    <div style="
      width:82px;
      height:82px;
      border-radius:24px;
      background:rgba(255,255,255,.12);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:42px;
      backdrop-filter:blur(14px);
      border:1px solid rgba(255,255,255,.12);
      box-shadow:0 8px 24px rgba(0,0,0,.18);
    ">
      🚀
    </div>

  </div>

  <!-- stats -->

  <div style="
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:14px;
    margin-top:24px;
    position:relative;
    z-index:2;
  ">

    <div style="
      background:rgba(255,255,255,.10);
      border-radius:22px;
      padding:18px;
      backdrop-filter:blur(10px);
      border:1px solid rgba(255,255,255,.08);
    ">

      <div style="
        font-size:13px;
        opacity:.8;
      ">
        📚 Available Tests
      </div>

      <div id="totalTests" style="
        margin-top:8px;
        font-size:34px;
        font-weight:900;
      ">
        0
      </div>

    </div>

    <div style="
      background:rgba(255,255,255,.10);
      border-radius:22px;
      padding:18px;
      backdrop-filter:blur(10px);
      border:1px solid rgba(255,255,255,.08);
    ">

      <div style="
        font-size:13px;
        opacity:.8;
      ">
        ⚡ Learning Status
      </div>

      <div style="
        margin-top:10px;
        display:inline-block;
        padding:8px 14px;
        border-radius:50px;
        background:#00e676;
        color:#111;
        font-weight:800;
        font-size:14px;
      ">
        ACTIVE STUDENT
      </div>

    </div>

  </div>

  <!-- premium strip -->

  <div style="
    margin-top:22px;
    background:linear-gradient(135deg,#FFD700,#FFA000);
    border-radius:20px;
    padding:16px;
    color:#111;
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:10px;
    position:relative;
    z-index:2;
    box-shadow:0 8px 24px rgba(255,193,7,.28);
  ">

    <div>

      <div style="
        font-size:13px;
        font-weight:700;
      ">
        ⭐ PREMIUM MOCK TEST PLAN
      </div>

      <div style="
        margin-top:4px;
        font-size:18px;
        font-weight:900;
      ">
        15 Mock Tests • ₹150
      </div>

    </div>

    <div style="
      background:#111;
      color:white;
      padding:10px 16px;
      border-radius:14px;
      font-size:13px;
      font-weight:800;
      white-space:nowrap;
    ">
      Join Now
    </div>

  </div>

</div>

<!-- SECTION TITLE -->

<div style="
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:16px;
">

  <div>

    <div style="
      font-size:28px;
      font-weight:900;
      color:#111;
    ">
      📚 Tests
    </div>

    <div style="
      margin-top:4px;
      color:#666;
      font-size:14px;
    ">
      Continue your preparation journey
    </div>

  </div>

</div>

`;

  
    for(let i=0;i<tests.length;i++){

  const t = tests[i];

if(
  t.status === "Active" &&
  (
    String(t.class) === String(window.studentClass) ||
    String(t.class).toUpperCase() === "ALL"
  )
){

  totalVisibleTests++;

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

  <div class="test-actions">

    <button class="completed-btn">
      ✅ Completed
    </button>

    <button class="analysis-btn"
      onclick="openAnalysis('${t.testId}')">

      📊 Analysis

    </button>

  </div>

  `;

}else{

  html += `

  <button class="start-btn"

    onclick="showInstructions('${t.testId}',${t.duration})">

    🚀 Start Test

  </button>

  `;

}

        html += `</div>`;
      }
    }

    app.innerHTML = html;
    setTimeout(()=>{

  const totalBox =
    document.getElementById("totalTests");

  if(totalBox){
    totalBox.innerText =
      totalVisibleTests;
  }

},100);
  });
}

function showInstructions(id, dur){

  pushState();

  hideNavButtons();

  currentTest = id;

 

  fetch(`${API}?action=questions&testId=${id}`)

  .then(r=>r.json())

  .then(data=>{

   globalQuestions = Array.isArray(data.questions)
    ? data.questions
     : JSON.parse(data.questions || "[]");
     app.innerHTML = `
     <div class="container">

      <h2>Instructions</h2>

      <div class="card">
        ${data.instructions}
      </div>

      <button class="btn"
        onclick="startTest(${dur})">

        Start Test

      </button>

    </div>`;
  });
}

function startTest(dur){

  pushState();

  hideNavButtons();

  answers = {};

  

  let html = `

  <div class="premium-test-page">

    <!-- FLOATING TIMER -->

    <div class="floating-timer">

      <div class="timer-ring">

        <span class="timer-dot-live"></span>

        <span id="floatingTimerText">
  ${dur}:00
</span>

      </div>

    </div>

    <!-- TOP BAR -->

    <div class="test-topbar">

      <div>

        <div class="test-mini-title">
          🚀 Live Test
        </div>

        <div class="test-main-title">
          ${currentTest}
        </div>

      </div>

      <div class="attempt-box">

        Attempted

        <span id="attemptCount">
          0
        </span>

        / ${globalQuestions.length}

      </div>

    </div>

    <!-- PROGRESS -->
<div class="question-nav">

  ${globalQuestions.map((_,i)=>`

    <div
  id="nav-${i}"
  class="nav-dot"
  onclick="goToQuestion(${i})">

  ${i+1}

</div>

  `).join('')}

</div>
    <div class="progress-wrap">

      <div
        id="progressBar"
        class="premium-progress">

      </div>

    </div>

  `;

  for(let i=0;i<globalQuestions.length;i++){

    const q = globalQuestions[i];

    html += `

   <div
   id="question-${i}"
   class="premium-question-card fade-in">

      <div class="q-top">

        <div class="q-number">
          Question ${i+1}
        </div>

        <div class="q-badge">
          ⭐ ${q.marks || 2} Marks
        </div>

      </div>

      <div class="premium-question-text">

        ${escapeHtml(q.question)}

      </div>

      <div class="premium-options">

    `;

    for(let key in q.options){

      html += `

      <div
        class="premium-option"

        onclick="
          select(
            '${q.qid}',
            '${key}',
            this
          )
        ">

        <div class="option-key">

          ${key}

        </div>

        <div class="option-value">

          ${escapeHtml(
            q.options[key]
          )}

        </div>

      </div>

      `;
    }

    html += `

      </div>

    </div>

    `;
  }

  html += `

    <button
      class="premium-submit-btn"
      onclick="submitTest()">

      🚀 Submit Test

    </button>

  </div>

  `;

  app.innerHTML = html;

  startFloatingTimer(dur);
}

function select(qid, opt, el){

  answers[qid] = opt;

  const parent =
    el.parentNode;

  const opts =
    parent.querySelectorAll(
      '.premium-option'
    );

  opts.forEach(o=>
    o.classList.remove(
      "premium-selected"
    )
  );

  el.classList.add(
    "premium-selected"
  );


const nav =
  document.getElementById(
    `nav-${
      globalQuestions.findIndex(
        q=>q.qid===qid
      )
    }`
  );

if(nav){

  nav.classList.add(
    "nav-completed"
  );

}

  // Progress Update

  const attempted =
    Object.keys(answers).length;

  document.getElementById(
    "attemptCount"
  ).innerText = attempted;

  const progress =
    (attempted /
    globalQuestions.length) * 100;

  document.getElementById(
    "progressBar"
  ).style.width =
    progress + "%";

}



function startFloatingTimer(min){

  let t = min * 60;

  clearInterval(timer);

  const timerBox =
    document.getElementById(
      "floatingTimerText"
    );

  timer = setInterval(()=>{

    const m =
      Math.floor(t / 60);

    const s =
      String(t % 60)
      .padStart(2,'0');

    if(timerBox){

      timerBox.innerText =
        `${m}:${s}`;

    }

    // warning mode

    if(t <= 300){

      document
        .querySelector(
          ".floating-timer"
        )
        ?.classList.add(
          "timer-warning"
        );

    }

    // auto submit

    if(t <= 0){

      clearInterval(timer);

      submitTest();

      return;

    }

    t--;

  },1000);

}

let submitting = false;

async function submitTest() {

  if (submitting) return;

  submitting = true;

  clearInterval(timer);

  const btn = document.querySelector(".btn");

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Submitting...";
  }

  try {
   
const response = await fetch(API, {

  method: "POST",

  redirect: "follow",

  body: JSON.stringify({

    action: "submitTest",

    studentId: studentId,

    testId: currentTest,

    answers: answers
  })

});

const text = await response.text();

const data = JSON.parse(text);

    // already attempted
    if (data.error) {

      app.innerHTML = `
        <div class="container">
          <div class="card" style="text-align:center;">
            <h2>⚠️ ${data.error}</h2>

            <br>

            <button class="btn" onclick="loadTests()">
              Back
            </button>
          </div>
        </div>
      `;

      submitting = false;
      return;
    }

    // success
    app.innerHTML = `
      <div class="container">
        <div class="card" style="text-align:center;">

          <h2>✅ Test Submitted</h2>

          <br>

          <div style="
            font-size:34px;
            font-weight:700;
            color:#2e7d32;
          ">
            ${data.score} / ${data.total}
          </div>

          <br>

          <button class="btn" onclick="loadTests()">
            Back To Dashboard
          </button>

        </div>
      </div>
    `;

} catch (err) {

  console.error(err);

  app.innerHTML = `
    <div class="container">

      <div class="card"
        style="text-align:center;">

        <h2 style="
          color:red;
          font-size:20px;
        ">
          🚫 ERROR
        </h2>

        <br>

        <div style="
          word-break:break-word;
          color:#333;
          font-size:14px;
        ">
          ${err}
        </div>

        <br>

        <button class="btn"
          onclick="submitTest()">

          Retry

        </button>

      </div>

    </div>
  `;
}

  submitting = false;
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

  <!-- HERO CARD -->

  <div style="
    background:linear-gradient(135deg,#1b5e20,#43a047);
    border-radius:28px;
    padding:28px 22px;
    color:white;
    box-shadow:0 14px 40px rgba(0,0,0,0.18);
    position:relative;
    overflow:hidden;
    margin-bottom:18px;
  ">

    <div style="
      position:absolute;
      top:-40px;
      right:-40px;
      width:140px;
      height:140px;
      background:rgba(255,255,255,0.08);
      border-radius:50%;
    "></div>

    <div style="
      display:flex;
      align-items:center;
      gap:16px;
      position:relative;
      z-index:2;
    ">

      <div style="
        width:78px;
        height:78px;
        border-radius:50%;
        background:rgba(255,255,255,0.18);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:38px;
        backdrop-filter:blur(10px);
      ">
        👨‍🎓
      </div>

      <div>

        <div style="
          font-size:26px;
          font-weight:800;
          line-height:1.2;
        ">
          ${window.studentName}
        </div>

        <div style="
          margin-top:6px;
          opacity:.9;
          font-size:14px;
        ">
          Student ID: ${studentId}
        </div>

      </div>

    </div>

    <!-- STATS -->

    <div style="
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:12px;
      margin-top:24px;
      position:relative;
      z-index:2;
    ">

      <div style="
        background:rgba(255,255,255,0.12);
        border-radius:18px;
        padding:16px;
        backdrop-filter:blur(12px);
      ">

        <div style="font-size:13px;opacity:.85;">
          📱 Mobile
        </div>

        <div style="
          margin-top:6px;
          font-size:18px;
          font-weight:700;
        ">
          ${window.studentMobile}
        </div>

      </div>

      <div style="
        background:rgba(255,255,255,0.12);
        border-radius:18px;
        padding:16px;
        backdrop-filter:blur(12px);
      ">

        <div style="font-size:13px;opacity:.85;">
          🎓 Class
        </div>

        <div style="
          margin-top:6px;
          font-size:22px;
          font-weight:800;
        ">
          ${window.studentClass}
        </div>

      </div>

    </div>

    <!-- SCORE -->

    <div style="
      margin-top:24px;
      background:rgba(255,255,255,0.14);
      border-radius:22px;
      padding:20px;
      text-align:center;
      backdrop-filter:blur(14px);
      position:relative;
      z-index:2;
    ">

      <div style="
        font-size:15px;
        opacity:.9;
      ">
        Latest Performance
      </div>

      <div style="
        font-size:42px;
        font-weight:900;
        margin-top:8px;
      ">
        ${d.score || 0}/${d.total || 0}
      </div>

      <div style="
        margin-top:10px;
        display:inline-block;
        padding:8px 18px;
        border-radius:50px;
        background:white;
        color:#1b5e20;
        font-weight:800;
        font-size:14px;
      ">
        🏆 Rank #${d.rank || "-"}
      </div>

      <div style="
        height:10px;
        background:rgba(255,255,255,0.22);
        border-radius:20px;
        overflow:hidden;
        margin-top:18px;
      ">

        <div style="
          width:${percent}%;
          height:100%;
          background:white;
          border-radius:20px;
        "></div>

      </div>

      <div style="
        margin-top:10px;
        font-size:14px;
        opacity:.92;
      ">
        ${percent}% Accuracy
      </div>

    </div>

  </div>

  <!-- LATEST TEST -->

  <div class="glass">

    <div style="
      font-size:18px;
      font-weight:800;
      margin-bottom:14px;
    ">
      📄 Latest Test
    </div>

    <div style="line-height:2;">

      <div>
        <b>Test ID:</b> ${d.testId || "-"}
      </div>

      <div>
        <b>Date:</b> ${formatDate(d.submittedAt)}
      </div>

    </div>

  </div>

<!-- PREMIUM PLAN -->

<div style="
  margin-top:24px;
  background:linear-gradient(135deg,#111,#1f1f1f);
  border-radius:24px;
  padding:22px;
  color:white;
  position:relative;
  overflow:hidden;
  box-shadow:0 12px 35px rgba(0,0,0,.28);
">

  <!-- glow -->

  <div style="
    position:absolute;
    top:-40px;
    right:-40px;
    width:140px;
    height:140px;
    border-radius:50%;
    background:rgba(255,215,0,.12);
  "></div>

  <!-- badge -->

  <div style="
    display:inline-block;
    padding:7px 16px;
    border-radius:50px;
    background:linear-gradient(135deg,#FFD700,#FFA000);
    color:#111;
    font-weight:900;
    font-size:13px;
    letter-spacing:.5px;
    box-shadow:0 4px 14px rgba(255,215,0,.35);
  ">
    ⭐ PREMIUM MOCK TEST PLAN
  </div>

  <!-- headline -->

  <div style="
    margin-top:18px;
    font-size:28px;
    font-weight:900;
    line-height:1.3;
  ">
    Crack Exams With
    <span style="color:#FFD54F;">
      Smart Practice
    </span>
  </div>

  <!-- subtitle -->

  <div style="
    margin-top:10px;
    font-size:14px;
    line-height:1.8;
    color:rgba(255,255,255,.82);
  ">

    Complete preparation package for
    school + competitive level practice.

  </div>

  <!-- features -->

  <div style="
    margin-top:22px;
    display:grid;
    gap:12px;
  ">

    <div style="
      background:rgba(255,255,255,.06);
      padding:14px;
      border-radius:16px;
      backdrop-filter:blur(10px);
    ">
      ✅ 15 Full Mock Tests
    </div>

    <div style="
      background:rgba(255,255,255,.06);
      padding:14px;
      border-radius:16px;
    ">
      📅 Alternate Day Test Schedule
    </div>

    <div style="
      background:rgba(255,255,255,.06);
      padding:14px;
      border-radius:16px;
    ">
      ⏳ 30 Days Validity
    </div>

    <div style="
      background:rgba(255,255,255,.06);
      padding:14px;
      border-radius:16px;
      line-height:1.7;
    ">
      📚 Physics, Chemistry, Biology,
      History, Geography, Polity,
      Economics & Computer Science
    </div>

  </div>

  <!-- price -->

  <div style="
    margin-top:24px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    flex-wrap:wrap;
  ">

    <div>

      <div style="
        font-size:13px;
        opacity:.8;
      ">
        Premium Access Price
      </div>

      <div style="
        font-size:42px;
        font-weight:900;
        color:#FFD54F;
        line-height:1.1;
      ">
        ₹150
      </div>

    </div>

    <div style="
      background:linear-gradient(135deg,#00e676,#00c853);
      padding:14px 20px;
      border-radius:18px;
      font-weight:900;
      font-size:15px;
      color:#fff;
      box-shadow:0 6px 18px rgba(0,230,118,.35);
      animation:pulseBtn 1.6s infinite;
    ">
      Join Premium
    </div>

  </div>

  <!-- urgency -->

  <div style="
    margin-top:18px;
    font-size:13px;
    color:#FFCCBC;
    line-height:1.7;
  ">
    🔥 Limited batch access. Start improving
    your score with structured mock practice.
  </div>

</div>


  <!-- HISTORY -->

  <h3 style="
    margin:18px 0 10px;
    font-size:20px;
  ">
    📊 Previous Tests
  </h3>

  <div id="history"></div>

  <button class="btn" onclick="loadTests()">
    ← Back To Dashboard
  </button>

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

function openAnalysis(testId){

  hideNavButtons();

  app.innerHTML = `

  <div class="analysis-page">

    <div class="analysis-loading">

      <div class="loader"></div>

      <p>Loading Premium Analysis...</p>

    </div>

  </div>

  `;

  fetch(
    `${API}?action=analysis&studentId=${studentId}&testId=${testId}`
  )

  .then(r=>r.json())

  .then(data=>{

    const accuracy =
      Math.max(
        0,
        Math.round((data.score/data.total)*100)
      );

    let html = `

    <div class="analysis-page fade-in">

      <!-- TOP BAR -->

      <div class="analysis-navbar">

        <button
          class="premium-back-btn"
          onclick="loadTests()">

          ← Back

        </button>

        <div class="analysis-heading">

          <div class="analysis-mini">
            PERFORMANCE REPORT
          </div>

          <div class="analysis-big">
            📊 Test Analysis
          </div>

        </div>

      </div>

      <!-- HERO -->

      <div class="premium-score-card">

        <div class="score-glow"></div>

        <div class="score-ring">

          <div class="score-ring-inner">

            <div class="score-main">
              ${data.score}
            </div>

            <div class="score-total">
              / ${data.total}
            </div>

          </div>

        </div>

        <div class="premium-accuracy">

          Accuracy ${accuracy}%

        </div>

        <div class="premium-stats">

          <div class="stat-box">

            <div class="stat-label">
              Questions
            </div>

            <div class="stat-value">
              ${data.questions.length}
            </div>

          </div>

          <div class="stat-box">

            <div class="stat-label">
              Score
            </div>

            <div class="stat-value">
              ${data.score}
            </div>

          </div>

          <div class="stat-box">

            <div class="stat-label">
              Result
            </div>

            <div class="stat-value">

              ${accuracy >= 60
                ? '🔥'
                : '📘'}

            </div>

          </div>

        </div>

      </div>

    `;

    data.questions.forEach((q,index)=>{

      const correct =
        q.studentAnswer === q.correctAnswer;

      html += `

      <div class="
        premium-analysis-card
        ${correct
          ? 'premium-correct'
          : 'premium-wrong'}
      ">

        <!-- TOP -->

        <div class="question-top">

          <div class="
            question-badge
            ${correct
              ? 'badge-correct'
              : 'badge-wrong'}
          ">

            Q${index+1}

          </div>

          <div class="
            status-pill
            ${correct
              ? 'pill-correct'
              : 'pill-wrong'}
          ">

            ${correct
              ? '✅ Correct'
              : '❌ Wrong'}

          </div>

        </div>

        <!-- QUESTION -->

        <div class="premium-question">

          ${escapeHtml(q.question)}

        </div>

        <!-- YOUR ANSWER -->

        <div class="premium-answer-card user-card">

          <div class="answer-title">
            Your Answer
          </div>

          <div class="
            answer-value
            ${correct
              ? 'correct-answer-text'
              : 'wrong-answer-text'}
          ">

            ${q.studentAnswer
              ? `${q.studentAnswer}.
                 ${escapeHtml(
                   q.options[q.studentAnswer]
                 )}`
              : 'Not Attempted'}

          </div>

        </div>

        <!-- CORRECT ANSWER -->

        <div class="
          premium-answer-card
          correct-card-ui
        ">

          <div class="answer-title">
            Correct Answer
          </div>

          <div class="correct-answer-text">

            ${q.correctAnswer}.
            ${escapeHtml(
              q.options[q.correctAnswer]
            )}

          </div>

        </div>

        

        ${!correct ? `

<button
  class="show-exp-btn"
  onclick="toggleExp(${index})">

  📘 Show Explanation

</button>

<div
  id="exp-${index}"
  class="hidden-exp">

  <div class="exp-inner">

    ${q.explanation
      ? escapeHtml(q.explanation)
      : 'No explanation available'}

  </div>

</div>

` : ''}

      </div>

      `;

    });

    html += `</div>`;

    app.innerHTML = html;

  })

  .catch(()=>{

    app.innerHTML = `

    <div class="analysis-error">

      <div class="glass-error">

        <div class="error-icon">
          🚫
        </div>

        <div class="error-title">
          Failed To Load Analysis
        </div>

        <button
          class="btn"
          onclick="loadTests()">

          Back To Dashboard

        </button>

      </div>

    </div>

    `;

  });

}
function toggleExp(id){

  const box =
    document.getElementById(
      `exp-${id}`
    );

  if(box.style.maxHeight){

    box.style.maxHeight = null;

  } else {

    box.style.maxHeight =
      box.scrollHeight + "px";

  }

}

function escapeHtml(text) {

  if (text === null || text === undefined) {
    return "";
  }

  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function goToQuestion(index){

  const q =
    document.getElementById(
      `question-${index}`
    );

  if(q){

    q.scrollIntoView({

      behavior:"smooth",

      block:"start"

    });

  }
}
