import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const colRef = collection(db, 'applications');

// DOM
const appForm = document.getElementById('appForm');
const cards = document.getElementById('cards');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

function formatDate(d){
  if(!d) return '';
  try{ const dt = new Date(d); return dt.toLocaleDateString(); }catch(e){return String(d)}
}

function statusClass(status){
  if(!status) return 'sent';
  const s = status.toLowerCase();
  if(s.includes('sent')) return 'sent';
  if(s.includes('follow')) return 'follow';
  if(s.includes('under') || s.includes('process')) return 'processing';
  if(s.includes('reject')) return 'rejected';
  if(s.includes('accept')) return 'accepted';
  return 'sent';
}

function renderList(items){
  cards.innerHTML = '';
  items.forEach(item=>{
    const c = document.createElement('div');
    c.className = 'card';
    c.dataset.id = item.id;
    c.innerHTML = `
      <div>
        <h3>${escapeHtml(item.company || '')}</h3>
        <div class="meta">
          <span class="muted">${escapeHtml(item.position || '')}</span>
          <span class="muted">${formatDate(item.emailDate)}</span>
        </div>
      </div>
      <div class="actions">
        <div class="status ${statusClass(item.status)}">${escapeHtml(item.status || '')}</div>
        <select class="quick-status" data-id="${item.id}">
          <option value="sent">Sent</option>
          <option value="follow up">Follow Up</option>
          <option value="under process">Under Process</option>
          <option value="rejected">Rejected</option>
          <option value="accepted">Accepted</option>
        </select>
      </div>
    `;

    // set select current value
    const sel = c.querySelector('.quick-status');
    if(sel) sel.value = item.status || 'sent';

    // clicking card opens modal
    c.addEventListener('click',()=>openModal(item));

    // prevent select bubbling
    sel.addEventListener('click',e=>e.stopPropagation());
    sel.addEventListener('change', async (e)=>{
      e.stopPropagation();
      const id = e.target.dataset.id;
      const newStatus = e.target.value;
      try{
        await updateDoc(doc(db,'applications',id),{status:newStatus});
      }catch(err){console.error('update status',err)}
    });

    cards.appendChild(c);
  });
}

function openModal(item){
  modalBody.innerHTML = `
    <h2>${escapeHtml(item.company || '')}</h2>
    <p><strong>Position:</strong> ${escapeHtml(item.position || '')}</p>
    <p><strong>Company type:</strong> ${escapeHtml(item.companyType || '')}</p>
    <p><strong>Approach:</strong> ${escapeHtml(item.approach || '')}</p>
    <p><strong>Status:</strong> ${escapeHtml(item.status || '')}</p>
    <p><strong>Email date:</strong> ${formatDate(item.emailDate)}</p>
    <p><strong>Resume:</strong> ${escapeHtml(item.resumeVersion || '')}</p>
    <p><strong>Notes:</strong><br>${escapeHtml(item.notes || '')}</p>
  `;
  modal.classList.remove('hidden');
}

closeModal.addEventListener('click',()=>modal.classList.add('hidden'));
modal.addEventListener('click',(e)=>{if(e.target===modal) modal.classList.add('hidden')});

appForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const f = new FormData(appForm);
  const data = {
    company: f.get('company') || '',
    companyType: f.get('companyType') || '',
    position: f.get('position') || '',
    approach: f.get('approach') || '',
    status: f.get('status') || 'sent',
    emailDate: f.get('emailDate') ? new Date(f.get('emailDate')) : null,
    resumeVersion: f.get('resumeVersion') || '',
    notes: f.get('notes') || '',
    createdAt: serverTimestamp()
  };
  try{
    await addDoc(colRef, data);
    appForm.reset();
  }catch(err){console.error('add doc',err)}
});

// realtime listener
const q = query(colRef, orderBy('createdAt','desc'));
onSnapshot(q, snapshot=>{
  const items = [];
  snapshot.forEach(docSnap=>{
    const d = docSnap.data();
    items.push({id:docSnap.id,...d});
  });
  renderList(items);
});

function escapeHtml(str){
  if(!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}
