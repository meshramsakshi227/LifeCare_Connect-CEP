const DEFAULT_USERS = [
  {id:"admin-1", role:"admin", email:"adm", password:"123", name:"Admin", status:"Active"},
  {id:"staff-1", role:"staff", email:"stf", password:"123", name:"Caretaker Staff", status:"Active"},
  {id:"family-1", role:"family", email:"fam", password:"123", name:"Authorized Family", status:"Approved"}
];

const ROLE_NAMES = {
  admin:"Administrator", staff:"Caretaker / Staff", family:"Family Member",
  visitor:"Visitor / Student"
};

let role = "admin";
let currentUser = null;
let loginAttempts = {};
let lockUntil = {};
let lockTimer = null;

const seedResidents = [
{id:1,name:"Anita Sharma",age:74,gender:"Female",disease:"Type 2 Diabetes",medicine:"Metformin",time:"08:00 AM",overDate:"2026-09-20",qty:18,need:"No",phone:"9000000001"},
{id:2,name:"Meena Joshi",age:81,gender:"Female",disease:"Hypertension",medicine:"Amlodipine",time:"09:00 AM",overDate:"2026-09-18",qty:12,need:"No",phone:"9000000002"},
{id:3,name:"Sunita Verma",age:69,gender:"Female",disease:"Arthritis",medicine:"Paracetamol",time:"08:30 PM",overDate:"2026-09-12",qty:8,need:"Yes",phone:"9000000003"},
{id:4,name:"Kamla Rao",age:77,gender:"Female",disease:"Asthma",medicine:"Inhaler",time:"07:30 AM",overDate:"2026-09-25",qty:6,need:"Yes",phone:"9000000004"},
{id:5,name:"Ramesh Patil",age:72,gender:"Male",disease:"Osteoporosis",medicine:"Calcium + Vitamin D",time:"10:00 AM",overDate:"2026-10-02",qty:25,need:"No",phone:"9000000005"},
{id:6,name:"Mohan Kulkarni",age:85,gender:"Male",disease:"High Cholesterol",medicine:"Atorvastatin",time:"09:00 PM",overDate:"2026-09-28",qty:20,need:"No",phone:"9000000006"},
{id:7,name:"Vijay More",age:67,gender:"Male",disease:"Hypothyroidism",medicine:"Levothyroxine",time:"06:30 AM",overDate:"2026-09-30",qty:30,need:"No",phone:"9000000007"},
{id:8,name:"Shankar Deshmukh",age:79,gender:"Male",disease:"Knee Pain",medicine:"Pain relief",time:"08:00 PM",overDate:"2026-09-15",qty:7,need:"Yes",phone:"9000000008"},
{id:9,name:"Dattatray Borkar",age:83,gender:"Male",disease:"Diabetes",medicine:"Metformin",time:"08:00 AM",overDate:"2026-10-05",qty:22,need:"No",phone:"9000000009"},
{id:10,name:"Arun Nair",age:71,gender:"Other",disease:"Hypertension",medicine:"Telmisartan",time:"09:30 AM",overDate:"2026-09-22",qty:14,need:"No",phone:"9000000010"}
];

function getData(key, fallback=[]){
  const x = localStorage.getItem("mc_"+key);
  return x ? JSON.parse(x) : fallback;
}
function setData(key,val){localStorage.setItem("mc_"+key,JSON.stringify(val))}
if(localStorage.getItem("lc_version")!=="8"){
  localStorage.setItem("lc_version","8");
  localStorage.removeItem("mc_users");
  localStorage.removeItem("mc_familyRequests");
  localStorage.removeItem("mc_familyAccess");
}
if(!localStorage.getItem("lc_users")) setData("users",DEFAULT_USERS);
if(!localStorage.getItem("mc_familyRequests")) setData("familyRequests",[]);
if(!localStorage.getItem("mc_familyAccess")) setData("familyAccess",[]);
if(!localStorage.getItem("lc_residents")) setData("residents",seedResidents);
if(!localStorage.getItem("lc_alerts")) setData("alerts",[]);

const seedSurveys = [
{id:1001,resident:"Anita Sharma",date:"2026-10-02",doctor:"Dr. Amit Patil",bp:"138/86",sugar:"168",sugarType:"Fasting",temperature:"98.2",pulse:"78",weight:"62",symptoms:"Increased thirst, frequent urination, mild fatigue",remarks:"Type 2 diabetes. Continue prescribed treatment and monitor fasting blood sugar regularly.",status:"Completed"},
{id:1002,resident:"Meena Joshi",date:"2026-10-02",doctor:"Dr. Neha Deshmukh",bp:"154/92",sugar:"102",sugarType:"Fasting",temperature:"98.1",pulse:"82",weight:"64",symptoms:"Occasional headache, dizziness",remarks:"Hypertension noted. Continue prescribed treatment and monitor blood pressure regularly.",status:"Completed"},
{id:1003,resident:"Sunita Verma",date:"2026-10-02",doctor:"Dr. Rahul Kulkarni",bp:"132/84",sugar:"105",sugarType:"Fasting",temperature:"98.4",pulse:"76",weight:"60",symptoms:"Joint pain, stiffness, difficulty walking",remarks:"Arthritis symptoms noted. Continue prescribed treatment and gentle activity as tolerated.",status:"Completed"},
{id:1004,resident:"Kamla Rao",date:"2026-10-02",doctor:"Dr. Priya Joshi",bp:"128/82",sugar:"98",sugarType:"Fasting",temperature:"98.0",pulse:"80",weight:"58",symptoms:"Occasional breathlessness, wheezing",remarks:"Asthma symptoms noted. Continue inhaler as prescribed and monitor breathing difficulty.",status:"Completed"},
{id:1005,resident:"Ramesh Patil",date:"2026-10-02",doctor:"Dr. Amit Patil",bp:"130/84",sugar:"100",sugarType:"Fasting",temperature:"98.2",pulse:"74",weight:"70",symptoms:"Bone and joint discomfort, mild weakness",remarks:"Osteoporosis management ongoing. Continue prescribed treatment and fall precautions.",status:"Completed"},
{id:1006,resident:"Mohan Kulkarni",date:"2026-10-02",doctor:"Dr. Neha Deshmukh",bp:"136/86",sugar:"104",sugarType:"Fasting",temperature:"98.3",pulse:"72",weight:"68",symptoms:"Occasional fatigue, no major symptoms",remarks:"High cholesterol under treatment. Continue prescribed treatment and heart-healthy diet.",status:"Completed"},
{id:1007,resident:"Vijay More",date:"2026-10-02",doctor:"Dr. Rahul Kulkarni",bp:"126/80",sugar:"99",sugarType:"Fasting",temperature:"98.1",pulse:"70",weight:"65",symptoms:"Fatigue, sensitivity to cold",remarks:"Hypothyroidism under treatment. Continue prescribed treatment and regular follow-up.",status:"Completed"},
{id:1008,resident:"Shankar Deshmukh",date:"2026-10-02",doctor:"Dr. Priya Joshi",bp:"134/84",sugar:"101",sugarType:"Fasting",temperature:"98.2",pulse:"78",weight:"72",symptoms:"Knee pain, difficulty climbing stairs",remarks:"Knee pain reported. Continue prescribed treatment and avoid excessive strain.",status:"Completed"},
{id:1009,resident:"Dattatray Borkar",date:"2026-10-02",doctor:"Dr. Amit Patil",bp:"140/88",sugar:"182",sugarType:"Fasting",temperature:"98.5",pulse:"80",weight:"74",symptoms:"Increased thirst, fatigue",remarks:"Diabetes requires regular monitoring. Continue prescribed treatment and monitor fasting blood sugar.",status:"Completed"},
{id:1010,resident:"Arun Nair",date:"2026-10-02",doctor:"Dr. Neha Deshmukh",bp:"150/90",sugar:"106",sugarType:"Fasting",temperature:"98.2",pulse:"84",weight:"67",symptoms:"Occasional headache, dizziness",remarks:"Hypertension noted. Continue prescribed treatment and monitor blood pressure regularly.",status:"Completed"}
];
const savedSurveys = localStorage.getItem("lc_surveys");
if(!savedSurveys || !Array.isArray(JSON.parse(savedSurveys)) || JSON.parse(savedSurveys).length===0) setData("surveys",seedSurveys);
if(!localStorage.getItem("lc_checkups")) setData("checkups",[]);
if(!localStorage.getItem("lc_visits")) setData("visits",[]);
if(!localStorage.getItem("mc_orders")) setData("orders",[]);
if(!localStorage.getItem("lc_seminars")) setData("seminars",[
  {id:1,title:"Monthly Health Checkup Seminar",date:"2026-09-28",time:"10:00 AM",topic:"Healthy ageing, medicines and nutrition"},
  {id:2,title:"Wellness & Exercise Session",date:"2026-10-20",time:"11:00 AM",topic:"Safe exercise for senior citizens"}
]);
if(!localStorage.getItem("lc_timetable")) setData("timetable",[
  {time:"06:00 AM",activity:"Wake up & freshen up"},
  {time:"06:30 AM",activity:"Walking / light exercise"},
  {time:"08:00 AM",activity:"Breakfast + morning medicines"},
  {time:"10:00 AM",activity:"Rest / reading / hobbies"},
  {time:"01:00 PM",activity:"Lunch"},
  {time:"04:00 PM",activity:"Tea + recreation"},
  {time:"06:00 PM",activity:"Prayer / music / social time"},
  {time:"08:00 PM",activity:"Dinner + night medicines"},
  {time:"10:00 PM",activity:"Rest / sleep"}
]);

const nav = {
admin:[ ["dashboard","🏠","Dashboard"],["emergency","🚨","Emergency Support"],["residents","👵","Resident Management"],["alerts","💊","Medicine Alerts"],["surveys","📋","Medical Surveys"],["history","📚","Disease History"],["visitors","🧑","Visitor Booking"],["seminars","🎓","Monthly Seminars"],["timetable","🕐","Timetable"],["reports","📊","Reports & Analysis"],["notifications","🔔","Notifications"],["users","👥","User & Access Management"] ],
staff:[ ["dashboard","🏠","Dashboard"],["emergency","🚨","Emergency Support"],["residents","👵","Residents"],["alerts","💊","Medicine Alerts"],["surveys","📋","Medical Surveys"],["history","📚","Disease History"],["seminars","🎓","Monthly Seminars"],["timetable","🕐","Timetable"],["reports","📊","Reports & Analysis"],["notifications","🔔","Notifications"] ],
family:[ ["dashboard","🏠","Dashboard"],["residents","👤","Permitted Resident"],["seminars","🎓","Monthly Seminars"],["timetable","🕐","Timetable"],["notifications","🔔","Notifications"] ],
visitor:[ ["dashboard","🏠","Ashram Information"],["visits","📅","Book Visit"],["seminars","🎓","Monthly Seminars"],["timetable","🕐","Timetable"],["notifications","🔔","Booking Notifications"] ]
};

document.querySelectorAll(".role-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".role-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    role=btn.dataset.role;
    updateLoginForm();
  });
});

function updateLoginForm(){
  const visitor = role==="visitor";
  document.getElementById("passwordBox").classList.toggle("hidden",visitor);
  document.getElementById("familyConsentBox").classList.toggle("hidden",role!=="family");
  document.getElementById("loginEmail").placeholder = visitor ? "yourname@example.com" : "Enter email address";
  document.getElementById("loginPassword").required = !visitor;
  document.getElementById("loginMessage").textContent="";
}
updateLoginForm();

document.getElementById("loginForm").addEventListener("submit",e=>{
  e.preventDefault();
  const email=document.getElementById("loginEmail").value.trim().toLowerCase();
  const pass=document.getElementById("loginPassword").value;
  const now=Date.now();

  if(lockUntil[role] && now<lockUntil[role]){
    startLoginLockCountdown();
    return;
  }

  if(role==="visitor"){
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setLoginMessage("Please enter a valid visitor email address."); return;
    }
    currentUser={email,name:email.split("@")[0],role};
    openApp(); return;
  }

  if(role==="family" && !document.getElementById("familyConsent").checked){
    setLoginMessage("Please confirm family authorization before login."); return;
  }

  const user=getData("users",DEFAULT_USERS).find(u=>u.role===role && u.email.toLowerCase()===email);
  if(user && pass===user.password && (user.status||"Active")!=="Revoked"){
    if(role==="family" && user.status!=="Approved"){
      setLoginMessage("Family access is awaiting Admin approval in Notifications."); return;
    }
    loginAttempts[role]=0;
    currentUser={email,name:user.name,role,userId:user.id};
    openApp();
  }else{
    loginAttempts[role]=(loginAttempts[role]||0)+1;
    const remaining=3-loginAttempts[role];
    if(remaining<=0){
      lockUntil[role]=Date.now()+60000;
      loginAttempts[role]=0;
      startLoginLockCountdown();
    }else setLoginMessage(`Incorrect email or password. ${remaining} attempt(s) remaining.`);
  }
});

function setLoginMessage(msg){document.getElementById("loginMessage").textContent=msg}

function startLoginLockCountdown(){
  // Start and update the countdown automatically; no click/focus is required.
  if(lockTimer) clearInterval(lockTimer);
  const lockedRole=role;
  const endTime=lockUntil[lockedRole]||0;
  const update=()=>{
    const remainingMs=endTime-Date.now();
    if(remainingMs<=0){
      clearInterval(lockTimer);
      lockTimer=null;
      lockUntil[lockedRole]=0;
      setLoginMessage("You can try logging in again.");
      return;
    }
    const seconds=Math.max(1,Math.ceil(remainingMs/1000));
    setLoginMessage(`3 incorrect attempts. Login locked for ${seconds} seconds.`);
  };
  // Update immediately, then refresh every second automatically.
  update();
  lockTimer=setInterval(update,1000);
}
function openApp(){
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("appPage").classList.remove("hidden");
  document.getElementById("sideUserName").textContent=currentUser.name;
  document.getElementById("sideRole").textContent=ROLE_NAMES[role];
  document.getElementById("sideAvatar").textContent=currentUser.name.charAt(0).toUpperCase();
  document.getElementById("today").textContent=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
  buildNav();
  showSection("dashboard");
  updateNotificationCount();
}

document.getElementById("logoutBtn").onclick=()=>{
  currentUser=null;
  document.getElementById("appPage").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("loginForm").reset();
  document.querySelectorAll(".role-btn").forEach(b=>b.classList.remove("active"));
  document.querySelector('[data-role="admin"]').classList.add("active");
  role="admin"; updateLoginForm();
};

function buildNav(){
  document.getElementById("sideNav").innerHTML=nav[role].map(([id,icon,name])=>
    `<button class="nav-item" data-section="${id}" onclick="showSection('${id}')">${icon} &nbsp; ${name}</button>`
  ).join("");
}

function showSection(section){
  document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.section===section));
  const titles={dashboard:"Dashboard",residents:"Resident Management",alerts:"Medicine Alerts",surveys:"Medical Surveys",history:"Disease History",visitors:"Visitor Bookings",seminars:"Monthly Seminars",timetable:"Ashram Timetable",reports:"Health Reports & Analytics",notifications:"Notifications",medicines:"Medicines Needed",visits:"Book Visit Slot",interests:"Resident Interests",users:"User & Access Management",emergency:"Emergency Support"};
  document.getElementById("pageTitle").textContent=titles[section]||"Dashboard";
  document.getElementById("content").innerHTML=renderSection(section);
  bindDynamicForms();
}

function residents(){return getData("residents",seedResidents)}
function alerts(){return getData("alerts",[])}
function surveys(){return getData("surveys",[])}
function checkups(){return getData("checkups",[])}
function visits(){return getData("visits",[])}
function orders(){return getData("orders",[])}
function emergencyRecords(){return getData("emergencies",[])}
function saveEmergencyRecords(rows){setData("emergencies",rows)}
if(!localStorage.getItem("mc_emergencies")) setData("emergencies",[]);
if(!localStorage.getItem("mc_emergencyMessages")) setData("emergencyMessages",[]);

const ASHRAM_LOCATION = {
  name:"Shree Gadge Maharaj Vrudhashram",
  city:"Amravati",
  address:"Shree Gadge Maharaj Vrudhashram, Amravati"
};
const EMERGENCY_MESSAGE_FROM = "meshramsakshi227@gmail.com";
const EMERGENCY_MESSAGE_TO = "siddhithakare2007@gmail.com";
const EMERGENCY_DOCTOR_TO = "siddhithakare2007@gmail.com";
let selectedEmergencyResidentId = null;

function statsHTML(){
 const r=residents();
 const female=r.filter(x=>x.gender==="Female").length, male=r.length-female;
 const avg=r.length?(r.reduce((a,b)=>a+Number(b.age),0)/r.length).toFixed(1):0;
 return `<div class="stats">
  <div class="stat"><div class="icon">👵</div><b>${r.length}</b><span>Total Residents</span></div>
  <div class="stat"><div class="icon">👩</div><b>${female}</b><span>Female Residents</span></div>
  <div class="stat"><div class="icon">👨</div><b>${male}</b><span>Male Residents</span></div>
  <div class="stat"><div class="icon">📈</div><b>${avg}</b><span>Average Age</span></div>
 </div>`;
}

function dashboard(){
 if(role==="visitor") return visitorHome();
 if(role==="family") return familyHome();
 const pendingA=alerts().filter(x=>x.status==="Pending").length;
 const pendingS=surveys().filter(x=>x.status==="Pending").length;
 return `<div class="hero"><h3>Welcome to LifeCare Connect 👋</h3><p>Centralized care, medicine alerts, health surveys and visitor coordination for Shree Gadge Maharaj Vrudhashram, Amravati.</p></div>
 ${statsHTML()}
 <div class="grid-3">
  <div class="feature-card"><h4>💊 Medicine Alerts</h4><p>${pendingA} pending medicine alert(s). Caretaker, in-charge and authorized family members can be informed.</p><button class="btn" onclick="showSection('alerts')">Open Alerts</button></div>
  <div class="feature-card"><h4>📋 Medical Surveys</h4><p>${pendingS} pending survey(s). Record BP, sugar, temperature, pulse, weight, symptoms and doctor's remarks.</p><button class="btn" onclick="showSection('surveys')">Open Surveys</button></div>
 </div>
 <div class="section"><h3>📍 Ashram Location</h3>
  <p><b>${ASHRAM_LOCATION.name}</b></p><p class="small">${ASHRAM_LOCATION.address}</p>
  <a class="btn" href="https://www.google.com/maps/search/?api=1&query=Shree%20Gadge%20Maharaj%20Vrudhashram%2C%20Amravati" target="_blank" rel="noopener">📍 Open Location in Maps</a>
 </div>
 <div class="section"><h3>Today's Care Priorities</h3>
  <div class="kpi-line"><span>Medicine requests pending</span><b>${pendingA}</b></div>
  <div class="kpi-line"><span>Health surveys pending</span><b>${pendingS}</b></div>
  <div class="kpi-line"><span>Upcoming visitor bookings</span><b>${visits().filter(v=>v.status==="Pending").length}</b></div>
 </div>`;
}

function visitorHome(){
 const r=residents();
 const f=r.filter(x=>x.gender==="Female").length,m=r.length-f;
 return `<div class="hero"><h3>Welcome, ${escapeHTML(currentUser.name)} 👋</h3><p>Visitor / Student access — public ashram information only. Resident names and private medical data are not displayed.</p></div>
 <div class="stats">
  <div class="stat"><div class="icon">👵</div><b>${r.length}</b><span>Total residents</span></div>
  <div class="stat"><div class="icon">👩</div><b>${f}</b><span>Female residents</span></div>
  <div class="stat"><div class="icon">👨</div><b>${m}</b><span>Male residents</span></div>
  <div class="stat"><div class="icon">🏠</div><b>Open</b><span>Visitor information</span></div>
 </div>
 <div class="grid-2">
  <div class="section"><h3>📍 Ashram Location</h3><p><b>${ASHRAM_LOCATION.name}</b></p><p class="small">${ASHRAM_LOCATION.address}</p><a class="btn" href="https://www.google.com/maps/search/?api=1&query=Shree%20Gadge%20Maharaj%20Vrudhashram%2C%20Amravati" target="_blank" rel="noopener">📍 Open Location in Maps</a></div>
  <div class="section"><h3>🏠 Ashram Information</h3><p><b>Shree Gadge Maharaj Vrudhashram, Amravati</b></p><p class="small">A senior-care home providing accommodation, daily care, meals, medicine support, recreation and health monitoring for elderly residents.</p><p><b>Visitor / Student Slots:</b> 11:00 AM – 1:00 PM and 3:00 PM – 5:00 PM. These slots are separate from the residents' daily timetable.</p><button class="btn" onclick="showSection('visits')">Book a Visit</button></div>
  <div class="section"><h3>📞 Contact</h3><div class="kpi-line"><span>Administrator</span><b>+91 90000 00101</b></div><div class="kpi-line"><span>Caretaker / In-charge</span><b>+91 90000 00102</b></div><p class="small">Prototype contact numbers — replace them with the old age home's verified numbers before deployment.</p></div>
 </div>`;
}

function familyHome(){
 return `<div class="hero"><h3>Family Information Portal</h3><p>Authorized family members can view medicine needs, medical survey results, disease history and reports.</p></div>
 ${statsHTML()}
 <div class="notice">🔒 Family access is shown only after the family authorization confirmation during login.</div>
 <div class="grid-3">
  <div class="feature-card"><h4>💊 Medicines Needed</h4><p>See medicines that need ordering or replenishment.</p><button class="btn" onclick="showSection('medicines')">View Medicines</button></div>
  <div class="feature-card"><h4>📊 Health Reports</h4><p>Review survey trends and resident health records available to the family.</p><button class="btn" onclick="showSection('reports')">View Reports</button></div>
 </div>`;
}

function renderSection(section){
 switch(section){
  case"dashboard":return dashboard();
  case"residents":return residentSection();
  case"alerts":return alertSection();
  case"surveys":return surveySection();
  case"history":return historySection();
  case"visitors":return visitorAdminSection();
  case"seminars":return seminarSection();
  case"timetable":return timetableSection();
  case"reports":return reportsSection();
  case"notifications":return notificationSection();
  case"medicines":return medicineSection();
  case"visits":return visitBookingSection();
  case"users":return userManagementSection();
  
  default:return dashboard();
 }
}

function residentSection(){if(role==="family"){const r=visibleResidents()[0];return r?`<div class="section"><h3>Permitted Resident</h3><div class="notice">Only the resident approved by Admin is visible.</div><div class="table-wrap"><table><thead><tr><th>Name</th><th>Age</th><th>Disease</th><th>Medicine</th><th>Medicine Time</th><th>Need Order</th></tr></thead><tbody><tr><td><b>${escapeHTML(r.name)}</b></td><td>${r.age}</td><td>${escapeHTML(r.disease)}</td><td>${escapeHTML(r.medicine)}</td><td>${escapeHTML(r.time)}</td><td>${r.need}</td></tr></tbody></table></div></div>`:`<div class="section"><div class="empty">No resident has been approved yet.</div></div>`}const r=residents(),canEdit=role==="admin";return `<div class="section"><div class="section-head"><div><h3>Resident Management</h3><span class="small">Admin and Staff can view all registered residents.</span></div>${canEdit?`<button class="btn" onclick="openResidentModal()">+ Add Resident</button>`:""}</div><div class="table-wrap"><table><thead><tr><th>Name</th><th>Age / Gender</th><th>Disease</th><th>Medicine & Time</th><th>Medicine Over</th><th>Qty.</th><th>Need Order</th>${canEdit?"<th>Action</th>":""}</tr></thead><tbody>${r.map(x=>`<tr><td><b>${escapeHTML(x.name)}</b></td><td>${x.age} / ${x.gender}</td><td>${escapeHTML(x.disease)}</td><td>${escapeHTML(x.medicine)}<br>${x.time}</td><td>${x.overDate}</td><td>${x.qty}</td><td>${x.need}</td>${canEdit?`<td><button class="btn danger" onclick="deleteResident(${x.id})">Delete</button></td>`:""}</tr>`).join("")}</tbody></table></div></div>`}


function alertSection(){
 let a=alerts();
 const canSend=role==="admin"||role==="staff";
 return `${canSend?`<div class="section"><h3>💊 Send One-Click Medicine Alert</h3><form id="alertForm" class="form-grid">
 <div><label>Resident's Name</label><select name="resident" required>${residents().map(x=>`<option>${escapeHTML(x.name)}</option>`).join("")}</select></div>
 <div><label>Medicine Required</label><input name="medicine" required></div>
 <div><label>Quantity</label><input name="quantity" type="number" min="1" required></div>
 <div><label>Urgency</label><select name="urgency"><option>High</option><option>Medium</option><option>Low</option></select></div>
 <div><label>Contact Number</label><input name="contact" required></div>
 <div><label>Old Age Home Location</label><input name="location" value="Shree Gadge Maharaj Vrudhashram, Amravati" required></div>
 <div class="full"><label>Message</label><textarea name="message" placeholder="Any additional medicine requirement..."></textarea></div>
 <div class="full"><button class="btn" type="submit">📨 Send Alert</button></div></form></div>`:""}
 <div class="section"><div class="section-head"><h3>Medicine Alerts</h3><span class="small">Sent to caretaker / in-charge and authorized family workflow.</span></div>
 <div class="table-wrap"><table><thead><tr><th>Date</th><th>Resident</th><th>Medicine</th><th>Qty</th><th>Urgency</th><th>Status</th><th>Actions</th></tr></thead><tbody>
 ${a.length?a.map(x=>`<tr><td>${x.date}</td><td>${escapeHTML(x.resident)}</td><td>${escapeHTML(x.medicine)}</td><td>${x.quantity}</td><td><span class="badge ${x.urgency.toLowerCase()}">${x.urgency}</span></td><td><span class="badge ${x.status==="Completed"?"completed":"pending"}">${x.status}</span></td><td>${x.status==="Pending"&&role!=="family"&&role!=="visitor"?`<button class="btn success" onclick="completeAlert(${x.id})">Complete</button>`:""}</td></tr>`).join(""):`<tr><td colspan="7"><div class="empty">No medicine alerts yet.</div></td></tr>`}
 </tbody></table></div></div>`;
}

function surveySection(){
 const s=surveys().slice().sort((a,b)=>(b.date||"").localeCompare(a.date||""));
 const canAdd=role==="admin"||role==="staff";
 const monthMap={};
 s.forEach(x=>{const month=(x.date||"").slice(0,7)||"Unknown"; if(!monthMap[month]) monthMap[month]=new Set(); if(x.doctor) monthMap[month].add(x.doctor);});
 const monthRows=Object.entries(monthMap).sort((a,b)=>b[0].localeCompare(a[0])).map(([m,docs])=>`<tr><td>${m}</td><td>${Array.from(docs).map(escapeHTML).join(", ")||"Not recorded"}</td><td>${s.filter(x=>(x.date||"").slice(0,7)===m).length}</td></tr>`).join("");
 return `${canAdd?`<div class="section"><h3>📋 Monthly Medical Survey</h3><form id="surveyForm" class="form-grid">
 <div><label>Resident</label><select name="resident" required>${residents().map(x=>`<option>${escapeHTML(x.name)}</option>`).join("")}</select></div>
 <div><label>Survey Date</label><input name="date" type="date" required></div>
 <div><label>Doctor Who Checked the Resident</label><input name="doctor" placeholder="Doctor name" required></div>
 <div><label>Blood Pressure</label><input name="bp" placeholder="e.g. 120/80"></div>
 <div><label>Fasting Sugar Level</label><input name="sugar" placeholder="mg/dL"><span class="small">Before eating / fasting reading</span></div>
 <div><label>Temperature</label><input name="temperature" placeholder="°F"></div>
 <div><label>Pulse Rate</label><input name="pulse" placeholder="BPM"></div>
 <div><label>Weight</label><input name="weight" placeholder="kg"></div>
 <div><label>Symptoms</label><input name="symptoms"></div>
 <div class="full"><label>Doctor's Remarks</label><textarea name="remarks"></textarea></div>
 <div class="full"><button class="btn" type="submit">Submit Survey</button></div></form></div>`:""}
 <div class="section"><h3>🩺 Doctor Checkup & Medical Survey — Monthwise Record</h3><div class="table-wrap"><table><thead><tr><th>Month</th><th>Doctor(s)</th><th>Survey Count</th></tr></thead><tbody>${monthRows||`<tr><td colspan="3"><div class="empty">No monthly doctor records yet.</div></td></tr>`}</tbody></table></div></div>
 <div class="section"><h3>Medical Survey Records</h3><div class="table-wrap"><table><thead><tr><th>Date</th><th>Month</th><th>Resident</th><th>Doctor Who Checked</th><th>BP</th><th>Fasting Sugar</th><th>Temp</th><th>Pulse</th><th>Weight</th><th>Symptoms</th><th>Remarks</th><th>Status</th></tr></thead><tbody>
 ${s.length?s.map(x=>`<tr><td>${x.date}</td><td>${(x.date||"").slice(0,7)}</td><td>${escapeHTML(x.resident)}</td><td>${escapeHTML(x.doctor||"Not recorded")}</td><td>${escapeHTML(x.bp)}</td><td>${escapeHTML(x.sugar)}${x.sugarType?` (${escapeHTML(x.sugarType)})`:""}</td><td>${escapeHTML(x.temperature)}</td><td>${escapeHTML(x.pulse)}</td><td>${escapeHTML(x.weight)}</td><td>${escapeHTML(x.symptoms)}</td><td>${escapeHTML(x.remarks)}</td><td><span class="badge completed">${x.status}</span></td></tr>`).join(""):`<tr><td colspan="12"><div class="empty">No medical surveys recorded.</div></td></tr>`}
 </tbody></table></div></div>`;
}


function historySection(){
 return `<div class="section"><h3>📚 Sickness & Disease History</h3><div class="table-wrap"><table><thead><tr><th>Resident</th><th>Disease</th><th>Current Medicine</th><th>Medicine Time</th><th>Recent Checkup</th><th>Result</th></tr></thead><tbody>
 ${residents().map(r=>{const c=surveys().filter(x=>x.resident===r.name).sort((a,b)=>(b.date||"").localeCompare(a.date||""))[0];return `<tr><td>${escapeHTML(r.name)}</td><td>${escapeHTML(r.disease)}</td><td>${escapeHTML(r.medicine)}</td><td>${r.time}</td><td>${c?`${escapeHTML(c.doctor||"Not recorded")} / ${(c.date||"").slice(0,7)}`:"—"}</td><td>${c?escapeHTML(c.remarks||c.symptoms||"Recorded"):"No recent result"}</td></tr>`}).join("")}
 </tbody></table></div></div>`;
}

function medicineSection(){
 const needed=residents().filter(x=>x.need==="Yes"||Number(x.qty)<=10);
 return `<div class="section"><h3>💊 Medicines Needed / Reorder</h3><p class="small">Family members see medicine needs rather than private internal alert workflow.</p><div class="table-wrap"><table><thead><tr><th>Resident</th><th>Medicine</th><th>Quantity Left</th><th>Medicine Over</th><th>Need Order</th></tr></thead><tbody>
 ${needed.length?needed.map(x=>`<tr><td>${escapeHTML(x.name)}</td><td>${escapeHTML(x.medicine)}</td><td>${x.qty}</td><td>${x.overDate}</td><td><span class="badge high">Order Required</span></td></tr>`).join(""):`<tr><td colspan="5"><div class="empty">No medicines currently marked for reorder.</div></td></tr>`}
 </tbody></table></div></div>`;
}

function visitorAdminSection(){
 if(role==="visitor") return visitBookingSection();
 return `<div class="section"><h3>🧑 Visitor / Student Requests</h3><div class="notice">Visitor/student access is scheduled separately from the daily resident timetable.</div><div class="table-wrap"><table><thead><tr><th>Visitor Email</th><th>Date</th><th>Time Slot</th><th>Purpose</th><th>Status</th><th>Action</th></tr></thead><tbody>
 ${visits().length?visits().map(v=>`<tr><td>${escapeHTML(v.email)}</td><td>${v.date}</td><td>${v.time}</td><td>${escapeHTML(v.purpose)}</td><td><span class="badge ${v.status==="Completed"?"completed":"pending"}">${v.status}</span></td><td>${v.status==="Pending"?`<button class="btn success" onclick="completeVisit(${v.id})">Mark Completed</button>`:""}</td></tr>`).join(""):`<tr><td colspan="6"><div class="empty">No visitor bookings.</div></td></tr>`}
 </tbody></table></div></div>`;
}

function visitBookingSection(){
 if(role!=="visitor") return visitorAdminSection();
 return `<div class="section"><h3>📅 Book a Visitor / Student Slot</h3><div class="notice">Available visitor/student slots: <b>11:00 AM–1:00 PM</b> and <b>3:00 PM–5:00 PM</b>. These are not part of the residents' daily timetable.</div>
 <form id="visitForm" class="form-grid"><div><label>Visitor Email</label><input value="${escapeHTML(currentUser.email)}" readonly></div><div><label>Visit Date</label><input name="date" type="date" required></div><div><label>Time Slot</label><select name="time"><option>11:00 AM - 12:00 PM</option><option>12:00 PM - 01:00 PM</option><option>03:00 PM - 04:00 PM</option><option>04:00 PM - 05:00 PM</option></select></div><div><label>Purpose</label><input name="purpose" placeholder="Visit / Student activity / Volunteer" required></div><div class="full"><button class="btn" type="submit">Book Visit</button></div></form></div>
 <div class="section"><h3>My Visit Requests</h3><div class="table-wrap"><table><thead><tr><th>Date</th><th>Slot</th><th>Purpose</th><th>Status</th></tr></thead><tbody>${visits().filter(v=>v.email===currentUser.email).map(v=>`<tr><td>${v.date}</td><td>${v.time}</td><td>${escapeHTML(v.purpose)}</td><td><span class="badge ${v.status==="Completed"?"completed":"pending"}">${v.status}</span></td></tr>`).join("")||`<tr><td colspan="4"><div class="empty">No bookings yet.</div></td></tr>`}</tbody></table></div></div>`;
}

function seminarSection(){
 return `<div class="section"><div class="section-head"><h3>🎓 Monthly Checkup / Health Seminars</h3>${(role==="admin"||role==="staff")?`<button class="btn" onclick="openSeminarModal()">+ Schedule Seminar</button>`:""}</div>
 <div class="grid-2">${getData("seminars",[]).map(s=>`<div class="feature-card"><h4>${escapeHTML(s.title)}</h4><p><b>${s.date}</b> at <b>${s.time}</b></p><p>${escapeHTML(s.topic)}</p><span class="badge low">Open for eligible participants</span></div>`).join("")}</div></div>`;
}

function timetableSection(){
 return `<div class="section"><h3>🕐 Daily Ashram Timetable</h3><div class="timeline">${getData("timetable",[]).map(x=>`<div class="time-row"><b>${x.time}</b><span>${escapeHTML(x.activity)}</span></div>`).join("")}</div>
 <div class="notice">Visitor / student slots are intentionally separate and are shown under <b>Book Visit Slot</b>.</div></div>`;
}

function interestsSection(){
 return `<div class="section"><h3>❤ Resident Interests for Meaningful Visits</h3><p class="small">Visitor view shows interests only — no names, diseases, medicines or private health information.</p><div class="grid-3">${residents().map((r,i)=>`<div class="feature-card"><h4>Resident ${i+1}</h4><p>Interests: <b>${escapeHTML(r.interest)}</b></p><p>Ideas: talk about hobbies, play simple games, listen to music, help with gardening or bring suitable activity material.</p></div>`).join("")}</div></div>`;
}

function reportsSection(){
 const s=surveys(), r=residents();
 return `<div class="section"><h3>📊 Health Reports & Analytics</h3><div class="grid-3">
 <div class="feature-card"><h4>Residents</h4><b>${r.length}</b><p>Total registered residents</p></div>
 <div class="feature-card"><h4>Surveys</h4><b>${s.length}</b><p>Total recorded surveys</p></div>
 <div class="feature-card"><h4>Doctor Records</h4><b>${s.filter(x=>x.doctor).length}</b><p>Doctor checkups recorded in surveys</p></div>
 </div><br><h3>Age Distribution</h3>${r.map(x=>`<div class="kpi-line"><span>${escapeHTML(x.name)} — ${x.age} years</span><span>${x.gender}</span></div>`).join("")}
 <br><button class="btn" onclick="window.print()">🖨 Generate / Print Report</button></div>`;
}

function notificationSection(){
 const a=alerts().filter(x=>x.status==="Pending").length;
 const v=visits().filter(x=>x.status==="Pending").length;
 const requests=getData("familyRequests",[]);
 const users=getData("users",DEFAULT_USERS);
 const pending=requests.filter(x=>x.status==="Pending");
 const permissionBlock=role==="admin"?`<div class="section"><h3>🔐 Family Website Access Permissions</h3><p class="small">Family access requests are handled here instead of a separate Family Permissions dashboard option.</p><div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Resident / Reason</th><th>Status</th><th>Action</th></tr></thead><tbody>${requests.length?requests.map(x=>`<tr><td>${escapeHTML(x.name)}</td><td>${escapeHTML(x.email)}</td><td>${escapeHTML(x.reason||"Family access")}</td><td>${escapeHTML(x.status)}</td><td>${x.status==="Pending"?`<button class="btn success" onclick="approveFamily(${x.id})">Approve</button> <button class="btn danger" onclick="denyFamily(${x.id})">Deny</button>`:"—"}</td></tr>`).join(""):`<tr><td colspan="5"><div class="empty">No family permission requests.</div></td></tr>`}</tbody></table></div></div>`:"";
 return `<div class="section"><h3>🔔 Notifications</h3>
 <div class="alert">💊 ${a} pending medicine alert(s).</div>
 <div class="notice">🧑 ${v} pending visitor booking(s).</div>
 ${role==="admin"?`<div class="notice">🔐 ${pending.length} pending family access request(s).</div>`:""}
 <div class="notice">📨 Family website permissions are approved or denied here by Admin.</div>
 </div>${permissionBlock}`;
}


function userManagementSection(){
 if(role!=="admin") return `<div class="section"><div class="empty">Admin access only.</div></div>`;
 const users=getData("users",DEFAULT_USERS);
 const staffFamily=users.filter(u=>u.role==="admin"||u.role==="staff"||u.role==="family");
 return `<div class="section"><div class="section-head"><div><h3>👥 User & Access Management</h3><span class="small">Admin can manage caretaker/staff and family accounts.</span></div></div>
 <div class="grid-2">
  <div class="section"><h3>🔑 Change Admin Password</h3><form id="adminPasswordForm"><label>Current Password</label><input name="current" type="password" required><label>New Password</label><input name="newpass" type="password" minlength="3" required><label>Confirm New Password</label><input name="confirm" type="password" minlength="3" required><button class="btn" type="submit">Change Password</button></form></div>
  <div class="section"><h3>➕ Add Staff / Family Email</h3><form id="userAddForm" class="form-grid"><div><label>Name</label><input name="name" required></div><div><label>Role</label><select name="role"><option value="staff">Caretaker / Staff</option><option value="family">Family</option></select></div><div><label>Email</label><input name="email" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" required></div><div><label>Password</label><input name="password" type="password" autocomplete="off" data-lpignore="true" data-1p-ignore="true" minlength="3" required></div><div class="full"><div class="notice">Staff can view all residents and their medical information. Family members request access to one specific resident from the Family portal after login.</div></div><div class="full"><button class="btn" type="submit">Add User</button></div></form></div>
 </div>
 <div class="section"><h3>📋 Website Users</h3><div class="table-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Access Status</th><th>Action</th></tr></thead><tbody>${staffFamily.length?staffFamily.map(u=>`<tr><td>${escapeHTML(u.name)}</td><td>${ROLE_NAMES[u.role]}</td><td>${escapeHTML(u.email)}</td><td>${escapeHTML(u.status||"Active")}</td><td><button class="btn danger" onclick="removeUser('${u.id}')">Remove</button></td></tr>`).join(""):`<tr><td colspan="5"><div class="empty">No staff or family users added.</div></td></tr>`}</tbody></table></div></div></div>`;
}

function bindDynamicForms(){
 const af=document.getElementById("alertForm");
 if(af) af.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(af));let a=alerts();a.push({id:Date.now(),...d,status:"Pending",date:new Date().toLocaleDateString("en-IN")});setData("alerts",a);showToast("Medicine alert sent successfully.");showSection("alerts");updateNotificationCount()};
 const sf=document.getElementById("surveyForm");
 if(sf) sf.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(sf));let s=surveys();s.push({id:Date.now(),...d,status:"Completed"});setData("surveys",s);showToast("Medical survey saved securely in this prototype.");showSection("surveys")};
 const cf=document.getElementById("checkupForm");
 if(cf) cf.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(cf));let c=checkups();c.push({id:Date.now(),...d,status:"Completed"});setData("checkups",c);showToast("Doctor checkup result saved.");showSection("checkups")};
 const vf=document.getElementById("visitForm");
 if(vf) vf.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(vf));let v=visits();v.push({id:Date.now(),email:currentUser.email,...d,status:"Pending"});setData("visits",v);showToast("Visit request submitted.");showSection("visits");updateNotificationCount()};
 const up=document.getElementById("adminPasswordForm");
 if(up) up.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(up));let users=getData("users",DEFAULT_USERS);const admin=users.find(u=>u.role==="admin"&&u.id===currentUser.userId);if(!admin||admin.password!==d.current){showToast("Current password is incorrect.");return;}if(d.newpass!==d.confirm){showToast("New passwords do not match.");return;}admin.password=d.newpass;setData("users",users);showToast("Admin password changed successfully.");e.target.reset();};
 const uf=document.getElementById("userAddForm");
 if(uf) uf.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(uf));let users=getData("users",DEFAULT_USERS);if(users.some(u=>u.email.toLowerCase()===d.email.toLowerCase())){showToast("That email is already registered.");return;}const user={id:Date.now().toString(),role:d.role,email:d.email.toLowerCase(),password:d.password,name:d.name,status:d.role==="family"?"Pending":"Active"};users.push(user);setData("users",users);if(user.role==="family"){let req=getData("familyRequests",[]);req.push({id:Date.now(),name:user.name,email:user.email,status:"Pending",userId:user.id,type:"accountAccess"});setData("familyRequests",req);showToast("Family account added. Admin must approve the account, then the family member can request one resident.");}else showToast("Staff account added successfully.");showSection("users");};
}

function openResidentModal(){
 const modal=document.createElement("div");modal.className="modal";modal.id="activeModal";
 modal.innerHTML=`<div class="modal-card"><div class="modal-head"><h3>+ Add Resident</h3><button class="close" onclick="closeModal()">×</button></div>
 <form id="residentForm" class="form-grid">
 <div><label>Name</label><input name="name" required></div><div><label>Age</label><input name="age" type="number" required></div>
 <div><label>Gender</label><select name="gender"><option>Female</option><option>Male</option><option>Other</option></select></div>
 <div><label>Disease</label><input name="disease"></div><div><label>Medicine</label><input name="medicine"></div>
 <div><label>Medicine Time</label><input name="time" placeholder="08:00 AM"></div><div><label>Last Date Medicine Will Run Out</label><input name="overDate" type="date"></div>
 <div><label>Quantity Remaining</label><input name="qty" type="number" min="0"></div><div><label>Need to Order?</label><select name="need"><option>Yes</option><option>No</option></select></div>
 <div><label>Contact Number</label><input name="phone"></div><div><label>Interests</label><input name="interest" placeholder="Music, gardening..."></div>
 <div class="full"><button class="btn" type="submit">Save Resident</button></div></form></div>`;
 document.body.appendChild(modal);
 document.getElementById("residentForm").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.id=Date.now();d.age=Number(d.age);d.qty=Number(d.qty||0);let r=residents();r.push(d);setData("residents",r);closeModal();showToast("Resident added.");showSection("residents")};
}
function openSeminarModal(){
 const modal=document.createElement("div");modal.className="modal";modal.id="activeModal";
 modal.innerHTML=`<div class="modal-card"><div class="modal-head"><h3>Schedule Seminar</h3><button class="close" onclick="closeModal()">×</button></div><form id="seminarForm">
 <label>Title</label><input name="title" value="Monthly Health Checkup Seminar" required>
 <label>Date</label><input name="date" type="date" required><label>Time</label><input name="time" required><label>Topic</label><textarea name="topic" required></textarea>
 <button class="btn" type="submit">Schedule</button></form></div>`;
 document.body.appendChild(modal);
 document.getElementById("seminarForm").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.id=Date.now();let s=getData("seminars",[]);s.push(d);setData("seminars",s);closeModal();showToast("Seminar scheduled.");showSection("seminars")};
}
function approveFamily(id){
 let req=getData("familyRequests",[]); const r=req.find(x=>x.id===id); if(!r)return; r.status="Approved"; setData("familyRequests",req);
 let users=getData("users",DEFAULT_USERS); const u=users.find(x=>x.id===r.userId||x.email===r.email); if(u)u.status="Approved"; setData("users",users); showToast("Family access approved."); showSection("notifications");
}
function denyFamily(id){
 let req=getData("familyRequests",[]); const r=req.find(x=>x.id===id); if(!r)return; r.status="Denied"; setData("familyRequests",req);
 let users=getData("users",DEFAULT_USERS); const u=users.find(x=>x.id===r.userId||x.email===r.email); if(u)u.status="Revoked"; setData("users",users); showToast("Family access denied."); showSection("notifications");
}
function removeUser(id){
 if(!confirm("Remove this staff/family account?"))return; setData("users",getData("users",DEFAULT_USERS).filter(u=>u.id!==id)); setData("familyRequests",getData("familyRequests",[]).filter(r=>r.userId!==id)); showToast("User removed."); showSection("users");
}

function closeModal(){document.getElementById("activeModal")?.remove()}
function deleteResident(id){if(!confirm("Delete this resident record?"))return;setData("residents",residents().filter(x=>x.id!==id));showToast("Resident removed.");showSection("residents")}
function completeAlert(id){setData("alerts",alerts().map(x=>x.id===id?{...x,status:"Completed"}:x));showToast("Alert marked completed.");showSection("alerts");updateNotificationCount()}
function completeVisit(id){setData("visits",visits().map(x=>x.id===id?{...x,status:"Completed"}:x));showToast("Visit marked completed.");showSection("visitors");updateNotificationCount()}
function updateNotificationCount(){document.getElementById("notificationCount").textContent=alerts().filter(x=>x.status==="Pending").length+visits().filter(x=>x.status==="Pending").length+(role==="admin"?getData("familyRequests",[]).filter(x=>x.type==="residentAccess"&&x.status==="Pending").length:0)}
function showToast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2500)}
function escapeHTML(str=""){return String(str).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}


/* =========================================================
   FAMILY-SPECIFIC RESIDENT PERMISSION WORKFLOW (v6)
   - Family never receives a resident list.
   - Family types the complete resident name to request access.
   - Admin approves/denies from Notifications.
   - Only one resident's private information is visible at a time.
   ========================================================= */
function familyAccessRecords(){ return getData("familyAccess",[]); }
function familyRequests(){ return getData("familyRequests",[]); }
function familyPendingRequest(){
  if(role!=="family" || !currentUser) return null;
  return familyRequests().find(x=>x.type==="residentAccess" && x.userId===currentUser.userId && x.status==="Pending") || null;
}
function selectedFamilyAccess(){
  if(role!=="family" || !currentUser) return null;
  const rows=familyAccessRecords().filter(x=>x.userId===currentUser.userId && x.status==="Approved");
  if(!rows.length) return null;
  return rows.sort((a,b)=>Number(b.approvedAt||b.id)-Number(a.approvedAt||a.id))[0];
}
function selectedFamilyResident(){
  const a=selectedFamilyAccess();
  if(!a) return null;
  return residents().find(r=>r.name===a.residentName) || null;
}
function familyHasResidentAccess(){ return !!selectedFamilyResident() && !familyPendingRequest(); }
function familyPrivateNotice(){
  const p=familyPendingRequest();
  if(p) return `<div class="notice">⏳ Your request to view <b>${escapeHTML(p.residentName)}</b> is waiting for Admin approval. Private resident information is hidden until approval.</div>`;
  const r=selectedFamilyResident();
  if(r) return `<div class="notice">🔐 You are currently viewing private information for <b>${escapeHTML(r.name)}</b>. To view another resident, send a new request and wait for Admin approval.</div>`;
  return `<div class="notice">🔒 No resident information is currently available. Use <b>Permitted Resident</b> to request access from Admin by entering the resident's complete name.</div>`;
}

function familyHome(){
 const access=selectedFamilyAccess();
 const r=selectedFamilyResident();
 const pending=familyPendingRequest();
 return `<div class="hero"><h3>Authorized Family Dashboard</h3>
 <p>View ashram information, monthly seminars, timetable, booking notifications and only the resident information approved by Admin.</p></div>
 <div class="section"><h3>📍 Ashram Information</h3><p><b>${ASHRAM_LOCATION.name}</b></p><p class="small">${ASHRAM_LOCATION.address}</p>
 <a class="btn" href="https://www.google.com/maps/search/?api=1&query=Shree%20Gadge%20Maharaj%20Vrudhashram%2C%20Amravati" target="_blank" rel="noopener">📍 Open Location in Maps</a></div>
 ${familyPrivateNotice()}
 <div class="grid-3">
   <div class="feature-card"><h4>🎓 Monthly Seminar</h4><p>View scheduled ashram seminars.</p><button class="btn" onclick="showSection('seminars')">View Seminars</button></div>
   <div class="feature-card"><h4>🕐 Timetable</h4><p>View the ashram timetable.</p><button class="btn" onclick="showSection('timetable')">View Timetable</button></div>
   <div class="feature-card"><h4>🔔 Notifications</h4><p>View booking and permission notifications.</p><button class="btn" onclick="showSection('notifications')">View Notifications</button></div>
 </div>
 <div class="section"><h3>👤 ${r?`Currently Permitted: ${escapeHTML(r.name)}`:"Permitted Resident"}</h3>
 <p class="small">${pending?"Your latest resident request is awaiting Admin approval.":"Request permission for one resident at a time from the Permitted Resident section."}</p>
 <button class="btn" onclick="showSection('residents')">🔐 ${r?"View / Request Resident Permission":"Request Resident Permission"}</button>
 </div>`;
}

function familyResidentSection(){
 const pending=familyPendingRequest();
 const access=selectedFamilyAccess();
 const r=selectedFamilyResident();
 const requests=familyRequests().filter(x=>x.type==="residentAccess"&&x.userId===currentUser?.userId);
 let html=`<div class="section"><h3>🔐 Permitted Resident</h3>
 <div class="notice">For privacy, the complete list of residents is never shown to Family. Type the <b>complete name</b> of the resident whose information you need. Admin must approve each resident separately.</div>
 <form id="familyPermissionForm" class="form-grid">
   <div class="full"><label>Resident Full Name</label><input name="residentName" placeholder="Example: Sunita Verma" autocomplete="off" required></div>
   <div class="full"><button class="btn" type="submit">📨 Request Permission from Admin</button></div>
 </form></div>`;
 if(pending) html+=`<div class="section"><div class="notice">⏳ Request pending for <b>${escapeHTML(pending.residentName)}</b>. You cannot view that resident's private information until Admin approves it.</div></div>`;
 if(r){
   html+=`<div class="section"><h3>👤 Viewing: <b>${escapeHTML(r.name)}</b></h3>
   <div class="notice">🔒 This is the only resident currently permitted for your account. To view another resident, submit a new request and wait for Admin approval.</div>
   <div class="grid-3">
    <div class="feature-card"><h4>💊 Medical Needed</h4><p>${escapeHTML(r.medicine||"Not recorded")} · ${escapeHTML(r.time||"Time not recorded")} · Qty ${r.qty}</p><p class="small">Need Order: ${escapeHTML(r.need||"No")}</p></div>
    <div class="feature-card"><h4>🩺 Disease History</h4><p>${escapeHTML(r.disease||"Not recorded")}</p></div>
    <div class="feature-card"><h4>📄 Report Analysis</h4><p>${surveys().filter(x=>x.resident===r.name).length} medical report(s) available.</p></div>
   </div>
   <div class="section"><h3>💊 Medical Needed</h3><div class="kpi-line"><span>Medicine</span><b>${escapeHTML(r.medicine||"Not recorded")}</b></div><div class="kpi-line"><span>Medicine Time</span><b>${escapeHTML(r.time||"Not recorded")}</b></div><div class="kpi-line"><span>Quantity</span><b>${r.qty}</b></div><div class="kpi-line"><span>Medicine Over</span><b>${escapeHTML(r.overDate||"Not recorded")}</b></div><div class="kpi-line"><span>Need Order</span><b>${escapeHTML(r.need||"No")}</b></div></div>
   ${familySurveyDetails(r)}
   ${familyBookingDetails()}
   </div>`;
 } else if(!pending) html+=`<div class="section"><div class="empty">No resident has been approved for this family account. Submit a permission request above.</div></div>`;
 html+=`<div class="section"><h3>📋 My Permission Requests</h3><div class="table-wrap"><table><thead><tr><th>Resident Requested</th><th>Status</th><th>Requested</th></tr></thead><tbody>${requests.length?requests.slice().reverse().map(x=>`<tr><td>${escapeHTML(x.residentName)}</td><td><span class="badge ${x.status==="Approved"?"completed":x.status==="Denied"?"high":"medium"}">${escapeHTML(x.status)}</span></td><td>${new Date(x.requestedAt||Date.now()).toLocaleString("en-IN")}</td></tr>`).join(""):`<tr><td colspan="3"><div class="empty">No permission requests yet.</div></td></tr>`}</tbody></table></div></div>`;
 return html;
}

function familySurveyDetails(r){
 const rows=surveys().filter(x=>x.resident===r.name).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
 return `<div class="section"><h3>📊 Results & Report Analysis — ${escapeHTML(r.name)}</h3><div class="table-wrap"><table><thead><tr><th>Date</th><th>Doctor</th><th>BP</th><th>Fasting Sugar</th><th>Temp</th><th>Pulse</th><th>Weight</th><th>Symptoms</th><th>Remarks</th></tr></thead><tbody>${rows.length?rows.map(x=>`<tr><td>${escapeHTML(x.date)}</td><td>${escapeHTML(x.doctor||"—")}</td><td>${escapeHTML(x.bp||"—")}</td><td>${escapeHTML(x.sugar||"—")}</td><td>${escapeHTML(x.temperature||"—")}</td><td>${escapeHTML(x.pulse||"—")}</td><td>${escapeHTML(x.weight||"—")}</td><td>${escapeHTML(x.symptoms||"—")}</td><td>${escapeHTML(x.remarks||"—")}</td></tr>`).join(""):`<tr><td colspan="9"><div class="empty">No report records for this resident.</div></td></tr>`}</tbody></table></div></div>`;
}

function familyBookingDetails(){
 const rows=visits();
 return `<div class="section"><h3>🧑 Who Booked / Booking Information</h3><div class="table-wrap"><table><thead><tr><th>Visitor</th><th>Date</th><th>Time</th><th>Purpose</th><th>Status</th></tr></thead><tbody>${rows.length?rows.map(x=>`<tr><td>${escapeHTML(x.email||"—")}</td><td>${escapeHTML(x.date||"—")}</td><td>${escapeHTML(x.time||"—")}</td><td>${escapeHTML(x.purpose||"—")}</td><td>${escapeHTML(x.status||"—")}</td></tr>`).join(""):`<tr><td colspan="5"><div class="empty">No booking records yet.</div></td></tr>`}</tbody></table></div></div>`;
}

function familyNotificationSection(){
 const pending=familyPendingRequest();
 const bookings=visits();
 return `<div class="section"><h3>🔔 Notifications</h3>
 <div class="notice">📅 ${bookings.filter(x=>x.status==="Pending").length} pending booking notification(s).</div>
 ${pending?`<div class="notice">⏳ Permission request pending for <b>${escapeHTML(pending.residentName)}</b>.</div>`:""}
 ${selectedFamilyResident()?`<div class="notice">🔐 You currently have permission to view <b>${escapeHTML(selectedFamilyResident().name)}</b> only.</div>`:"<div class=\"notice\">🔒 No resident information is currently permitted.</div>"}
 </div>${selectedFamilyResident()?familyBookingDetails():""}`;
}

function familyMedicineSection(){ return familyResidentSection(); }
function familySurveySection(){ return familyResidentSection(); }
function familyHistorySection(){ return familyResidentSection(); }
function familyReportsSection(){ return familyResidentSection(); }
function familyWhoBookedSection(){ return familyResidentSection(); }

function renderSection(section){
  if(role==="family"){
    if(section==="dashboard") return dashboard();
    if(section==="residents") return familyResidentSection();
    if(section==="medicines") return familyMedicineSection();
    if(section==="surveys") return familySurveySection();
    if(section==="history") return familyHistorySection();
    if(section==="reports") return familyReportsSection();
    if(section==="visitors") return familyWhoBookedSection();
    if(section==="seminars") return seminarSection();
    if(section==="timetable") return timetableSection();
    if(section==="notifications") return familyNotificationSection();
    return dashboard();
  }
  switch(section){
    case"dashboard":return dashboard();
    case"emergency":return (role==="admin"||role==="staff")?emergencySection():dashboard(); case"residents":return residentSection(); case"alerts":return alertSection(); case"surveys":return surveySection(); case"history":return historySection(); case"visitors":return visitorAdminSection(); case"seminars":return seminarSection(); case"timetable":return timetableSection(); case"reports":return reportsSection(); case"notifications":return notificationSection(); case"medicines":return medicineSection(); case"visits":return visitBookingSection(); case"users":return userManagementSection(); default:return dashboard();
  }
}

function emergencySection(){
  if(role!=="admin" && role!=="staff") return dashboard();
  const r=residents();
  const query=(document.getElementById("emergencySearch")?.value||"").trim().toLowerCase();
  const matches=query?r.filter(x=>x.name.toLowerCase().includes(query)||String(x.phone||"").includes(query)):[];
  const selected=selectedEmergencyResidentId ? r.find(x=>Number(x.id)===Number(selectedEmergencyResidentId)) : null;
  const records=emergencyRecords();
  const active=selected?records.find(x=>Number(x.residentId)===Number(selected.id)&&["Active","Responding"].includes(x.status)):null;
  const surveysFor=selected?surveys().filter(x=>x.resident===selected.name).sort((a,b)=>(b.date||"").localeCompare(a.date||"")):[];
  return `<div class="emergency-page">
    <div class="emergency-banner"><div><span class="emergency-icon">🚨</span><div><h3>Emergency Support</h3><p>Emergency response workspace for Admin and Staff. Search a resident, review their available data, contact support and record the emergency.</p></div></div>${active?`<span class="badge emergency-status-${active.status.toLowerCase()}">${active.status}</span>`:`<span class="badge low">Ready</span>`}</div>
    <div class="section">
      <div class="section-head"><div><h3>👤 Select Resident</h3><span class="small">Search the resident dataset by name or phone number.</span></div></div>
      <div class="emergency-search"><input id="emergencySearch" type="search" placeholder="Search resident name or phone..." value="${escapeHTML(query)}" oninput="renderEmergencySearch()"><button class="btn" onclick="renderEmergencySearch()">🔎 Search</button></div>
      <div id="emergencySearchResults">${emergencySearchResultsHTML(matches,selected)}</div>
    </div>
    ${selected?`<div class="grid-2">
      <div class="section"><h3>🚨 Emergency Alert</h3><div class="notice">Selected resident: <b>${escapeHTML(selected.name)}</b></div>
        <div class="actions"><button class="btn danger" onclick="startEmergency(${selected.id})">🚨 ${active?"Update / Keep Active":"Start Emergency Alert"}</button>
        <button class="btn secondary" onclick="messageEmergencyContact(${selected.id})">📨 Message Emergency Contact</button><button class="btn secondary" onclick="messageAmbulance(${selected.id})">🚑 Message / Call Ambulance</button><button class="btn secondary" onclick="messageDoctor(${selected.id})">👨‍⚕️ Message Doctor</button></div>
        <div class="emergency-status-row"><span>🔴 Status</span><select id="emergencyStatus" onchange="updateEmergencyStatus(this.value)" ${active?"":"disabled"}><option ${active?.status==="Active"?"selected":""}>Active</option><option ${active?.status==="Responding"?"selected":""}>Responding</option><option ${active?.status==="Resolved"?"selected":""}>Resolved</option></select></div>
      </div>
      <div class="section"><h3>📋 View Medical Summary</h3>
        <div class="kpi-line"><span>Age / Gender</span><b>${selected.age} / ${escapeHTML(selected.gender)}</b></div><div class="kpi-line"><span>Disease</span><b>${escapeHTML(selected.disease)}</b></div><div class="kpi-line"><span>Medicine</span><b>${escapeHTML(selected.medicine)} — ${escapeHTML(selected.time)}</b></div><div class="kpi-line"><span>Medicine Over / Qty</span><b>${escapeHTML(selected.overDate)} / ${selected.qty}</b></div><div class="kpi-line"><span>Need Order</span><b>${escapeHTML(selected.need)}</b></div><div class="kpi-line"><span>Emergency Contact</span><b>${escapeHTML(selected.phone||"Not recorded")}</b></div>
        ${surveysFor.length?`<p class="small"><b>Latest medical survey:</b> ${escapeHTML(surveysFor[0].date||"")} · ${escapeHTML(surveysFor[0].doctor||"Not recorded")} · BP ${escapeHTML(surveysFor[0].bp||"—")} · Sugar ${escapeHTML(surveysFor[0].sugar||"—")} · Pulse ${escapeHTML(surveysFor[0].pulse||"—")} · Temp ${escapeHTML(surveysFor[0].temperature||"—")}</p>`:`<p class="small">No medical survey found for this resident.</p>`}
      </div>
    </div>
    <div class="section"><h3>🩺 Resident Medical Data</h3><div class="table-wrap"><table><thead><tr><th>Date</th><th>Doctor</th><th>BP</th><th>Fasting Sugar</th><th>Temp</th><th>Pulse</th><th>Weight</th><th>Symptoms</th><th>Remarks</th></tr></thead><tbody>${surveysFor.length?surveysFor.map(x=>`<tr><td>${escapeHTML(x.date)}</td><td>${escapeHTML(x.doctor||"—")}</td><td>${escapeHTML(x.bp||"—")}</td><td>${escapeHTML(x.sugar||"—")} ${x.sugarType?`(${escapeHTML(x.sugarType)})`:""}</td><td>${escapeHTML(x.temperature||"—")}</td><td>${escapeHTML(x.pulse||"—")}</td><td>${escapeHTML(x.weight||"—")}</td><td>${escapeHTML(x.symptoms||"—")}</td><td>${escapeHTML(x.remarks||"—")}</td></tr>`).join(""):`<tr><td colspan="9"><div class="empty">No medical records found.</div></td></tr>`}</tbody></table></div></div>
    <div class="section"><h3>📝 Save Emergency Report</h3><form id="emergencyReportForm" class="form-grid"><div class="full"><label>Emergency Notes / Action Taken</label><textarea name="report" placeholder="Describe the emergency, action taken, doctor/ambulance response, and outcome..." required>${escapeHTML(active?.report||"")}</textarea></div><div><label>Final Status</label><select name="status"><option ${active?.status==="Active"?"selected":""}>Active</option><option ${active?.status==="Responding"?"selected":""}>Responding</option><option ${active?.status==="Resolved"?"selected":""}>Resolved</option></select></div><div class="full"><button class="btn" type="submit">📝 Save Emergency Report</button></div></form></div>`:`<div class="section"><div class="empty">Search and select a resident to open the emergency support workspace.</div></div>`}
    <div class="section"><h3>📜 Emergency History</h3><div class="table-wrap"><table><thead><tr><th>Date / Time</th><th>Resident</th><th>Status</th><th>Report</th><th>Handled By</th></tr></thead><tbody>${records.slice().sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0)).map(x=>`<tr><td>${escapeHTML(x.dateTime||"")}</td><td><b>${escapeHTML(x.residentName||"")}</b></td><td><span class="badge ${x.status==="Resolved"?"completed":x.status==="Responding"?"medium":"high"}">${escapeHTML(x.status)}</span></td><td>${escapeHTML(x.report||"—")}</td><td>${escapeHTML(x.handledBy||"—")}</td></tr>`).join("")||`<tr><td colspan="5"><div class="empty">No emergency history recorded.</div></td></tr>`}</tbody></table></div></div>
  </div>`;
}

function emergencySearchResultsHTML(matches,selected){
  if(!((document.getElementById("emergencySearch")?.value||"").trim())) return `<div class="small emergency-hint">Start typing a resident name or phone number to search.</div>`;
  if(!matches.length) return `<div class="empty">No resident found. Check the spelling or phone number.</div>`;
  return `<div class="emergency-results">${matches.map(x=>`<button class="emergency-result ${selected&&Number(selected.id)===Number(x.id)?"selected":""}" onclick="selectEmergencyResident(${x.id})"><span>👤 <b>${escapeHTML(x.name)}</b></span><span>${x.age} yrs · ${escapeHTML(x.gender)} · ${escapeHTML(x.disease)}</span></button>`).join("")}</div>`;
}
function renderEmergencySearch(){
  const box=document.getElementById("emergencySearchResults"); if(!box) return;
  const q=(document.getElementById("emergencySearch")?.value||"").trim().toLowerCase();
  const matches=q?residents().filter(x=>x.name.toLowerCase().includes(q)||String(x.phone||"").includes(q)):[];
  box.innerHTML=emergencySearchResultsHTML(matches,selectedEmergencyResidentId?residents().find(x=>Number(x.id)===Number(selectedEmergencyResidentId)):null);
}
function selectEmergencyResident(id){ selectedEmergencyResidentId=id; showSection("emergency"); }
function emergencyMessageRecords(){ return getData("emergencyMessages",[]); }
function saveEmergencyMessage(record){ const rows=emergencyMessageRecords(); rows.push(record); setData("emergencyMessages",rows); }
function openEmergencyMail(to,subject,body,residentName,messageType){
  const mailto=`mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  saveEmergencyMessage({id:Date.now(),residentName,messageType,from:EMERGENCY_MESSAGE_FROM,to,subject,status:"Email compose opened",createdAt:Date.now(),dateTime:new Date().toLocaleString("en-IN")});
  window.location.href=mailto;
}
function getEmergencyResident(residentId){ return residents().find(x=>Number(x.id)===Number(residentId)) || null; }
function sendFamilyEmergencyAlert(r){
  const access=familyAccessRecords().find(x=>x.status==="Approved" && x.residentName===r.name);
  if(!access || !access.email) return false;
  const subject=`🚨 Emergency Alert - ${r.name} - LifeCare Connect`;
  const body=`Emergency alert for ${r.name} at Shree Gadge Maharaj Vrudhashram, Amravati.

Resident: ${r.name}
Age/Gender: ${r.age} / ${r.gender}
Disease: ${r.disease || "Not recorded"}
Medicine: ${r.medicine || "Not recorded"}

Started by: ${currentUser?.name || ROLE_NAMES[role]} (${role})
Message initiated from: ${EMERGENCY_MESSAGE_FROM}`;
  openEmergencyMail(access.email,subject,body,r.name,"Family Emergency Alert");
  return true;
}
function messageEmergencyContact(residentId){
  if(role!=="admin"&&role!=="staff") return; const r=getEmergencyResident(residentId); if(!r) return;
  const subject=`🚨 Emergency Contact Message - ${r.name}`;
  const body=`Emergency assistance is required for ${r.name} at Shree Gadge Maharaj Vrudhashram, Amravati.

Started by: ${currentUser?.name || ROLE_NAMES[role]} (${role})
Resident phone: ${r.phone || "Not recorded"}

Please respond immediately.

Message initiated from: ${EMERGENCY_MESSAGE_FROM}`;
  openEmergencyMail(EMERGENCY_MESSAGE_TO,subject,body,r.name,"Emergency Contact"); showToast(`Emergency contact message prepared for ${EMERGENCY_MESSAGE_TO}.`);
}
function messageAmbulance(residentId){
  if(role!=="admin"&&role!=="staff") return; const r=getEmergencyResident(residentId); if(!r) return;
  const subject=`🚑 Ambulance Request - ${r.name}`;
  const body=`AMBULANCE REQUEST

Please arrange emergency ambulance support for ${r.name} at Shree Gadge Maharaj Vrudhashram, Amravati.

Resident condition: ${r.disease || "Emergency condition - see medical summary"}
Started by: ${currentUser?.name || ROLE_NAMES[role]} (${role})

Message initiated from: ${EMERGENCY_MESSAGE_FROM}.`;
  openEmergencyMail(EMERGENCY_MESSAGE_TO,subject,body,r.name,"Ambulance Request"); showToast(`Ambulance message prepared for ${EMERGENCY_MESSAGE_TO}.`);
}
function messageDoctor(residentId){
  if(role!=="admin"&&role!=="staff") return; const r=getEmergencyResident(residentId); if(!r) return;
  const subject=`👨‍⚕️ Doctor Emergency Message - ${r.name}`;
  const body=`Doctor assistance is requested for ${r.name} at Shree Gadge Maharaj Vrudhashram, Amravati.

Disease: ${r.disease || "Not recorded"}
Medicine: ${r.medicine || "Not recorded"}
Started by: ${currentUser?.name || ROLE_NAMES[role]} (${role})

Please review the resident medical summary in LifeCare Connect.

Message initiated from: ${EMERGENCY_MESSAGE_FROM}.`;
  openEmergencyMail(EMERGENCY_DOCTOR_TO,subject,body,r.name,"Doctor Emergency Message"); showToast(`Doctor message prepared for ${EMERGENCY_DOCTOR_TO}.`);
}
function startEmergency(residentId){
  if(role!=="admin"&&role!=="staff") return; selectedEmergencyResidentId=residentId; const r=getEmergencyResident(residentId); if(!r) return;
  let rows=emergencyRecords(); const existing=rows.find(x=>Number(x.residentId)===Number(r.id)&&["Active","Responding"].includes(x.status));
  if(existing){ existing.updatedAt=Date.now(); existing.handledBy=currentUser?.name||ROLE_NAMES[role]; }
  else rows.push({id:Date.now(),residentId:r.id,residentName:r.name,status:"Active",report:"",handledBy:currentUser?.name||ROLE_NAMES[role],createdAt:Date.now(),dateTime:new Date().toLocaleString("en-IN")});
  saveEmergencyRecords(rows);
  const familyAccess=familyAccessRecords().find(x=>x.status==="Approved" && x.residentName===r.name);
  if(familyAccess && familyAccess.email){ sendFamilyEmergencyAlert(r); }
  else { showToast(`Emergency alert opened for ${r.name}. No approved family permission found for this resident.`); showSection("emergency"); }
}
function updateEmergencyStatus(status){
  const r=residents().find(x=>Number(x.id)===Number(selectedEmergencyResidentId)); if(!r) return;
  let rows=emergencyRecords(); const e=rows.find(x=>Number(x.residentId)===Number(r.id)&&["Active","Responding"].includes(x.status)); if(!e) return;
  e.status=status; e.updatedAt=Date.now(); e.handledBy=currentUser?.name||ROLE_NAMES[role]; saveEmergencyRecords(rows); showToast(`Emergency status changed to ${status}.`); showSection("emergency");
}

function requestResidentAccess(){
  const form=document.getElementById("familyPermissionForm"); if(!form) return;
  form.addEventListener("submit",function(e){
    e.preventDefault();
    const name=new FormData(form).get("residentName").trim().replace(/\s+/g," ");
    if(!name){showToast("Please type the resident's complete name.");return;}
    if(familyPendingRequest()){showToast("A resident access request is already pending.");return;}
    const r=residents().find(x=>x.name.toLowerCase()===name.toLowerCase());
    if(!r){showToast("No matching resident was found. Check the complete name and try again.");return;}
    const active=selectedFamilyAccess();
    if(active && active.residentName.toLowerCase()===r.name.toLowerCase()){showToast("You already have permission for this resident.");return;}
    let req=familyRequests();
    if(req.some(x=>x.type==="residentAccess"&&x.userId===currentUser.userId&&x.residentName.toLowerCase()===r.name.toLowerCase()&&x.status==="Pending")){showToast("This request is already pending.");return;}
    const id=Date.now();
    req.push({id,type:"residentAccess",name:currentUser.name,email:currentUser.email,userId:currentUser.userId,residentName:r.name,status:"Pending",requestedAt:id});
    setData("familyRequests",req); showToast("Permission request sent to Admin Notifications."); showSection("residents"); updateNotificationCount();
  });
}

function bindDynamicForms(){
  const af=document.getElementById("alertForm"); if(af) af.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(af));let a=alerts();a.push({id:Date.now(),...d,status:"Pending",date:new Date().toLocaleDateString("en-IN")});setData("alerts",a);showToast("Medicine alert sent successfully.");showSection("alerts");updateNotificationCount()};
  const sf=document.getElementById("surveyForm"); if(sf) sf.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(sf));let s=surveys();s.push({id:Date.now(),...d,status:"Completed"});setData("surveys",s);showToast("Medical survey saved securely in this prototype.");showSection("surveys")};
  const vf=document.getElementById("visitForm"); if(vf) vf.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(vf));let v=visits();v.push({id:Date.now(),email:currentUser.email,...d,status:"Pending"});setData("visits",v);showToast("Visit request submitted.");showSection("visits");updateNotificationCount()};
  const up=document.getElementById("adminPasswordForm"); if(up) up.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(up));let users=getData("users",DEFAULT_USERS);const admin=users.find(u=>u.role==="admin"&&u.id===currentUser.userId);if(!admin||admin.password!==d.current){showToast("Current password is incorrect.");return;}if(d.newpass!==d.confirm){showToast("New passwords do not match.");return;}admin.password=d.newpass;setData("users",users);showToast("Admin password changed successfully.");e.target.reset();};
  const er=document.getElementById("emergencyReportForm"); if(er) er.onsubmit=e=>{e.preventDefault(); if(role!=="admin"&&role!=="staff") return; const d=Object.fromEntries(new FormData(er)); const r=residents().find(x=>Number(x.id)===Number(selectedEmergencyResidentId)); if(!r)return; let rows=emergencyRecords(); let rec=rows.find(x=>Number(x.residentId)===Number(r.id)&&["Active","Responding"].includes(x.status)); if(!rec){rec={id:Date.now(),residentId:r.id,residentName:r.name,status:d.status,createdAt:Date.now(),dateTime:new Date().toLocaleString("en-IN")};rows.push(rec);} rec.report=d.report; rec.status=d.status; rec.handledBy=currentUser?.name||ROLE_NAMES[role]; rec.updatedAt=Date.now(); saveEmergencyRecords(rows); showToast("Emergency report saved."); showSection("emergency");};
  const uf=document.getElementById("userAddForm"); if(uf) uf.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(uf));let users=getData("users",DEFAULT_USERS);if(users.some(u=>u.email.toLowerCase()===d.email.toLowerCase())){showToast("That email is already registered.");return;}const user={id:Date.now().toString(),role:d.role,email:d.email.toLowerCase(),password:d.password,name:d.name,status:d.role==="family"?"Approved":"Active"};users.push(user);setData("users",users);showToast(user.role==="family"?"Family account added. The family member must request permission for one specific resident.":"Staff account added successfully.");showSection("users");};
  requestResidentAccess();
}

function approveFamily(id){
  let req=familyRequests(); const r=req.find(x=>x.id===id); if(!r)return;
  r.status="Approved"; r.approvedAt=Date.now(); setData("familyRequests",req);
  if(r.type==="residentAccess"){
    let access=familyAccessRecords().filter(x=>!(x.userId===r.userId&&x.status==="Approved"));
    access.push({id:r.id,userId:r.userId,email:r.email,residentName:r.residentName,status:"Approved",approvedAt:r.approvedAt});
    setData("familyAccess",access);
    showToast(`Access approved for ${r.residentName}.`);
  }else{
    let users=getData("users",DEFAULT_USERS); const u=users.find(x=>x.id===r.userId||x.email===r.email); if(u)u.status="Approved"; setData("users",users); showToast("Family access approved.");
  }
  showSection("notifications"); updateNotificationCount();
}
function denyFamily(id){
  let req=familyRequests(); const r=req.find(x=>x.id===id); if(!r)return;
  r.status="Denied"; r.deniedAt=Date.now(); setData("familyRequests",req);
  if(r.type!=="residentAccess"){
    let users=getData("users",DEFAULT_USERS); const u=users.find(x=>x.id===r.userId||x.email===r.email); if(u)u.status="Revoked"; setData("users",users);
  }
  showToast("Request denied."); showSection("notifications"); updateNotificationCount();
}

function notificationSection(){
  const a=alerts().filter(x=>x.status==="Pending").length, v=visits().filter(x=>x.status==="Pending").length;
  const req=familyRequests().filter(x=>x.type==="residentAccess"&&x.status==="Pending");
  if(role!=="admin") return `<div class="section"><h3>🔔 Notifications</h3><div class="notice">📨 Admin notifications control family resident-information permissions.</div></div>`;
  return `<div class="section"><h3>🔔 Notifications</h3><div class="alert">💊 ${a} pending medicine alert(s).</div><div class="notice">🧑 ${v} pending visitor booking(s).</div><div class="notice">🔐 ${req.length} pending family resident request(s).</div></div>
  <div class="section"><h3>🔐 Family Resident Access Requests</h3><p class="small">Families do not receive a resident list. Each request contains the complete resident name entered by the family member. Approve only the requested resident.</p><div class="table-wrap"><table><thead><tr><th>Family Member</th><th>Email</th><th>Requested Resident</th><th>Status</th><th>Action</th></tr></thead><tbody>${familyRequests().filter(x=>x.type==="residentAccess").map(x=>`<tr><td>${escapeHTML(x.name)}</td><td>${escapeHTML(x.email)}</td><td><b>${escapeHTML(x.residentName)}</b></td><td>${escapeHTML(x.status)}</td><td>${x.status==="Pending"?`<button class="btn success" onclick="approveFamily(${x.id})">Approve</button> <button class="btn danger" onclick="denyFamily(${x.id})">Deny</button>`:`—`}</td></tr>`).join("")||`<tr><td colspan="5"><div class="empty">No resident-information requests.</div></td></tr>`}</tbody></table></div></div>`;
}

// Family account requests are intentionally not shown in Admin Notifications.
// Keep resident-access requests only; existing family accounts remain available.
try {
  const fr=getData("familyRequests",[]);
  const cleaned=fr.filter(x=>x.type==="residentAccess");
  if(cleaned.length!==fr.length) setData("familyRequests",cleaned);
} catch(e) {}
