import React, { useEffect, useMemo, useState } from 'react';
import { initialTutors, initialRequests, subjectOptions, levelOptions } from './data.js';

const readStore = (key, fallback) => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
};
const writeStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const initials = (name='學') => name.slice(0,1);
const goTop = () => window.scrollTo({ top:0, behavior:'smooth' });

function App() {
  const [page, setPage] = useState(() => location.hash.replace('#','') || 'home');
  const [tutors, setTutors] = useState(() => readStore('xh_tutors', initialTutors));
  const [requests, setRequests] = useState(() => readStore('xh_requests', initialRequests));
  const [user, setUser] = useState(() => readStore('xh_user', null));
  const [connections, setConnections] = useState(() => readStore('xh_connections', []));
  const [toast, setToast] = useState('');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('全部階段');
  const [subject, setSubject] = useState('全部科目');

  useEffect(() => { const onHash=()=>{setPage(location.hash.replace('#','')||'home'); goTop();}; window.addEventListener('hashchange',onHash); return()=>window.removeEventListener('hashchange',onHash); },[]);
  useEffect(() => writeStore('xh_tutors',tutors),[tutors]);
  useEffect(() => writeStore('xh_requests',requests),[requests]);
  useEffect(() => writeStore('xh_user',user),[user]);
  useEffect(() => writeStore('xh_connections',connections),[connections]);
  useEffect(() => { if(!toast)return; const timer=setTimeout(()=>setToast(''),3000); return()=>clearTimeout(timer); },[toast]);

  const navigate = (target) => { location.hash=target; setPage(target); if(target!=='detail') setSelected(null); goTop(); };
  const notify = (message) => setToast(message);
  const login = (role, name) => { const next={id:`${role}-${Date.now()}`,role,name}; setUser(next); navigate('dashboard'); notify('已進入展示帳號！'); };
  const logout = () => { setUser(null); navigate('home'); notify('已登出展示帳號'); };
  const connect = (targetId, targetType) => {
    if(!user){ notify('請先登入，再提出聯繫申請'); navigate('login'); return; }
    if((targetType==='tutor' && user.role!=='student') || (targetType==='student' && user.role!=='teacher')) { notify(targetType==='tutor'?'請使用學生身分聯繫老師':'請使用教師身分聯繫學生'); return; }
    if(connections.some(c=>c.from===user.id && c.targetId===targetId && c.status!=='rejected')) { notify('你已經提出過這筆聯繫申請'); return; }
    setConnections(prev=>[{id:`c-${Date.now()}`,from:user.id,fromName:user.name,fromRole:user.role,targetId,targetType,status:'pending',message:'您好，我對您的資訊有興趣，希望能進一步討論教學需求。',createdAt:new Date().toLocaleDateString('zh-TW')} ,...prev]);
    notify('聯繫申請已送出，等待對方確認');
  };
  const respond = (id,status) => { setConnections(prev=>prev.map(c=>c.id===id?{...c,status}:c)); notify(status==='accepted'?'已接受聯繫，雙方可查看聯繫後資訊':'已拒絕聯繫申請'); };
  const filteredTutors = useMemo(()=>tutors.filter(t=>(t.name+t.intro+t.subjects.join(' ')).toLowerCase().includes(search.toLowerCase())&&(level==='全部階段'||t.levels.includes(level))&&(subject==='全部科目'||t.subjects.includes(subject))),[tutors,search,level,subject]);
  const filteredRequests = useMemo(()=>requests.filter(r=>r.status==='招募中'&&(r.displayName+r.need+r.subjects.join(' ')).toLowerCase().includes(search.toLowerCase())&&(level==='全部階段'||r.level===level)&&(subject==='全部科目'||r.subjects.includes(subject))),[requests,search,level,subject]);

  return <div className="app-shell">
    <Header page={page} user={user} navigate={navigate} logout={logout}/>
    <main>
      {page==='home' && <Home navigate={navigate} tutors={tutors} requests={requests} onSelect={(item,type)=>{setSelected({item,type});navigate('detail')}}/>}
      {page==='tutors' && <Directory title="找到適合你的老師" subtitle="每位老師都有自己的教學方式，慢慢找到最適合你的那一位。" items={filteredTutors} search={search} setSearch={setSearch} level={level} setLevel={setLevel} subject={subject} setSubject={setSubject} type="tutor" onSelect={setSelected}/>}
      {page==='requests' && <Directory title="看看誰正在尋找老師" subtitle="瀏覽學生的學習需求，也許下一位適合的學生就在這裡。" items={filteredRequests} search={search} setSearch={setSearch} level={level} setLevel={setLevel} subject={subject} setSubject={setSubject} type="request" onSelect={setSelected}/>}
      {page==='detail' && selected && <Detail item={selected.item} type={selected.type} user={user} connections={connections} onConnect={connect} onBack={()=>navigate(selected.type==='tutor'?'tutors':'requests')}/>}
      {page==='login' && <Login onLogin={login}/>}
      {page==='dashboard' && <Dashboard user={user} tutors={tutors} setTutors={setTutors} requests={requests} setRequests={setRequests} connections={connections} respond={respond} onConnect={connect} notify={notify} navigate={navigate}/>}
      {page==='about' && <About navigate={navigate}/>}
    </main>
    <Footer navigate={navigate}/>
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}

function Header({page,user,navigate,logout}) {
  return <header className="topbar"><div className="nav-wrap">
    <button className="brand" onClick={()=>navigate('home')}><span className="brand-mark">學</span><span>學匯<small>讓學習匯聚，讓每個人都能學會</small></span></button>
    <nav className="desktop-nav">
      <button className={page==='tutors'?'active':''} onClick={()=>navigate('tutors')}>找老師</button>
      <button className={page==='requests'?'active':''} onClick={()=>navigate('requests')}>找學生</button>
      <button className={page==='about'?'active':''} onClick={()=>navigate('about')}>關於學匯</button>
    </nav>
    <div className="nav-actions">{user?<><button className="nav-user" onClick={()=>navigate('dashboard')}>{user.name} 的專區</button><button className="btn btn-outline btn-small" onClick={logout}>登出</button></>:<><button className="text-button" onClick={()=>navigate('login')}>登入</button><button className="btn btn-primary btn-small" onClick={()=>navigate('login')}>加入學匯</button></>}</div>
  </div></header>;
}

function Home({navigate,tutors,requests,onSelect}) {
  return <><section className="hero"><div className="hero-inner"><div className="hero-copy"><span className="eyebrow"><i/> 一起找到適合自己的學習方式</span><h1>學習的路上，<br/><em>總有適合你的</em>陪伴。</h1><p>不論你想找一位好老師，或正在尋找需要你的學生，<b>學匯</b>讓每一次相遇，都成為學習的好開始。</p><div className="hero-actions"><button className="btn btn-primary" onClick={()=>navigate('tutors')}>我想找老師 <span>→</span></button><button className="btn btn-soft" onClick={()=>navigate('requests')}>我想找學生 <span>→</span></button></div><div className="hero-note"><span>✦</span> 國小・國中・高中・大學・社會人士皆適用</div></div><div className="hero-art"><div className="art-sun"></div><div className="art-card card-one"><span className="art-icon">✎</span><b>找到適合的老師</b><small>從理解開始，慢慢進步</small></div><div className="art-card card-two"><span className="art-icon mint">♡</span><b>讓教學被看見</b><small>分享你的專業與熱情</small></div><div className="art-book"><div className="book-line"></div><div className="book-line short"></div><div className="book-line"></div><div className="book-spark">✦</div></div><span className="floating f1">✦</span><span className="floating f2">✿</span></div></div></section>
    <section className="quick-section wrap"><div className="section-heading"><div><span className="eyebrow">START HERE</span><h2>今天，想從哪裡開始？</h2><p>不管你是學生還是老師，都能在學匯找到自己的位置。</p></div></div><div className="choice-grid"><button className="choice-card peach-card" onClick={()=>navigate('tutors')}><span className="choice-icon">⌕</span><span className="choice-tag">FOR LEARNERS</span><h3>我想找老師</h3><p>依照科目、學習階段與上課方式，尋找適合自己的家教。</p><b>瀏覽教師 <span>↗</span></b></button><button className="choice-card green-card" onClick={()=>navigate('requests')}><span className="choice-icon">✎</span><span className="choice-tag">FOR TUTORS</span><h3>我想找學生</h3><p>看看有哪些學習需求，讓你的教學專長有機會被看見。</p><b>瀏覽學生需求 <span>↗</span></b></button></div></section>
    <section className="featured-section"><div className="wrap"><div className="section-heading row-heading"><div><span className="eyebrow">MEET OUR TUTORS</span><h2>認識幾位教學夥伴</h2><p>每位老師都有不同的專長與教學理念。</p></div><button className="link-button" onClick={()=>navigate('tutors')}>查看全部老師 →</button></div><div className="tutor-grid">{tutors.slice(0,3).map(t=><TutorCard key={t.id} tutor={t} onOpen={()=>onSelect(t,'tutor')}/>)}</div></div></section>
    <section className="latest-section wrap"><div className="section-heading row-heading"><div><span className="eyebrow">LEARNING WISHES</span><h2>最新學習需求</h2><p>每一份需求，都是一段學習故事的開始。</p></div><button className="link-button" onClick={()=>navigate('requests')}>查看全部需求 →</button></div><div className="request-preview-grid">{requests.filter(r=>r.status==='招募中').slice(0,2).map(r=><RequestCard key={r.id} request={r} onOpen={()=>onSelect(r,'request')}/>)}</div></section>
    <section className="bottom-cta wrap"><div><span className="eyebrow">YOUR NEXT CHAPTER</span><h2>讓適合的相遇，<br/>成為學習的起點。</h2><p>加入學匯，開始你的下一段學習旅程。</p></div><button className="btn btn-light" onClick={()=>navigate('login')}>立即加入學匯 <span>→</span></button><div className="cta-flower">✿</div></section>
  </>;
}

function TutorCard({tutor,onOpen}) {
  return <article className="person-card" onClick={onOpen} role="button" tabIndex="0" onKeyDown={e=>e.key==='Enter'&&onOpen?.()}><div className="person-top"><div className={`avatar ${tutor.color||'peach'}`}>{tutor.avatar||initials(tutor.name)}</div><span className="verified">✦ 教學夥伴</span></div><h3>{tutor.name}</h3><p className="muted small">{tutor.education||'教學背景由老師自行填寫'}</p><div className="tag-row">{(tutor.subjects||[]).slice(0,3).map(s=><span className="tag" key={s}>{s}</span>)}</div><p className="card-description">{tutor.philosophy||tutor.intro}</p><div className="card-meta"><span>⌖ {tutor.location}</span><span>◷ {tutor.mode}</span></div><div className="card-bottom"><span>查看教師介紹</span><b>↗</b></div></article>;
}
function RequestCard({request,onOpen}) {
  return <article className="request-card" onClick={onOpen} role="button" tabIndex="0" onKeyDown={e=>e.key==='Enter'&&onOpen?.()}><div className="request-head"><div className="avatar small-avatar yellow">{initials(request.displayName)}</div><div><b>{request.displayName}</b><small>{request.level}・{request.updated||'近期更新'}</small></div><span className="status-pill">招募中</span></div><h3>尋找{request.subjects.join('、')}家教</h3><p>{request.need}</p><div className="tag-row">{request.subjects.map(s=><span className="tag" key={s}>{s}</span>)}<span className="tag neutral">{request.mode}</span></div><div className="card-meta"><span>⌖ {request.location}</span><span>學習階段：{request.level}</span></div><div className="card-bottom"><span>查看需求詳情</span><b>↗</b></div></article>;
}

function Directory({title,subtitle,items,search,setSearch,level,setLevel,subject,setSubject,type,onSelect}) {
  return <section className="directory wrap"><div className="page-intro"><span className="eyebrow">{type==='tutor'?'TUTOR DIRECTORY':'STUDENT REQUESTS'}</span><h1>{title}</h1><p>{subtitle}</p></div><div className="filter-panel"><div className="search-box"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={type==='tutor'?'搜尋老師名稱、科目或關鍵字':'搜尋需求內容、科目或關鍵字'}/></div><select value={level} onChange={e=>setLevel(e.target.value)}><option>全部階段</option>{levelOptions.map(x=><option key={x}>{x}</option>)}</select><select value={subject} onChange={e=>setSubject(e.target.value)}><option>全部科目</option>{subjectOptions.map(x=><option key={x}>{x}</option>)}</select></div><div className="result-line">找到 <b>{items.length}</b> 筆{type==='tutor'?'教師資料':'學習需求'}<button className="clear-filter" onClick={()=>{setSearch('');setLevel('全部階段');setSubject('全部科目')}}>清除篩選</button></div>{items.length?<div className={type==='tutor'?'tutor-grid':'request-grid'}>{items.map(item=>type==='tutor'?<TutorCard key={item.id} tutor={item} onOpen={()=>onSelect({item,type})}/>:<RequestCard key={item.id} request={item} onOpen={()=>onSelect({item,type})}/>)}</div>:<div className="empty-state"><span>⌕</span><h3>目前沒有符合條件的資料</h3><p>試試其他關鍵字或調整篩選條件吧！</p></div>}</section>;
}

function Detail({item,type,user,connections,onConnect,onBack}) {
  const isTutor=type==='tutor';
  const connected=connections.some(c=>c.status==='accepted'&&c.targetId===item.id);
  return <section className="detail-page wrap"><button className="back-link" onClick={onBack}>← 返回列表</button><div className="detail-layout"><div className="detail-main"><div className="detail-hero"><div className={`avatar large-avatar ${item.color||'peach'}`}>{item.avatar||initials(item.displayName)}</div><div><span className="eyebrow">{isTutor?'教師介紹':'學生學習需求'}</span><h1>{isTutor?item.name:item.displayName}</h1><p>{isTutor?item.education:`${item.level}・${item.updated||'近期更新'}`}</p></div></div><section className="detail-section"><h2>{isTutor?'教學理念':'學習需求'}</h2><p>{isTutor?item.philosophy:item.need}</p>{isTutor&&<p>{item.intro}</p>}</section><section className="detail-section"><h2>{isTutor?'教學資訊':'需求資訊'}</h2><div className="info-grid"><Info label="科目" value={item.subjects?.join('、')}/><Info label={isTutor?'適合階段':'學習階段'} value={(item.levels||[item.level]).join('、')}/><Info label="授課方式" value={item.mode}/><Info label="地區" value={item.location}/>{isTutor&&<Info label="教學經驗" value={item.experience}/>}</div></section><section className="privacy-note"><span>🔒</span><div><b>保護彼此的個人資訊</b><p>真實姓名、聯絡方式及其他私人資訊不會公開顯示。提出聯繫申請並經對方同意後，才會開放雙方設定為聯繫後可見的資料。</p></div></section>{connected&&<div className="unlocked-panel"><b>✓ 已建立聯繫</b><p>雙方已同意聯繫。這是展示資料，實際聯絡資訊需由使用者自行提供。</p></div>}</div><aside className="detail-aside"><div className="aside-card"><span className="status-pill">{isTutor?'教師資料公開中':item.status}</span><h3>{isTutor?'對這位老師有興趣嗎？':'你能協助這份需求嗎？'}</h3><p>送出聯繫申請，對方同意後即可進一步了解彼此。</p><button className="btn btn-primary full" onClick={()=>onConnect(item.id,isTutor?'tutor':'student')}>提出聯繫申請</button><small>※ 本平台僅提供媒合，不代收費用。</small></div></aside></div></section>;
}
function Info({label,value}) { return <div className="info-item"><small>{label}</small><b>{value||'尚未提供'}</b></div>; }

function Login({onLogin}) {
  const [role,setRole]=useState('student'); const [name,setName]=useState('小方');
  return <section className="login-page wrap"><div className="login-card"><div className="login-mark">學</div><span className="eyebrow">WELCOME TO XUEHUI</span><h1>加入學匯，開始一段新相遇。</h1><p>目前為課程展示版本，使用虛構帳號體驗網站功能。</p><div className="role-switch"><button className={role==='student'?'selected':''} onClick={()=>setRole('student')}>我是學生／家長</button><button className={role==='teacher'?'selected':''} onClick={()=>setRole('teacher')}>我是家教老師</button></div><label className="field-label">展示名稱</label><input className="form-input" value={name} onChange={e=>setName(e.target.value)} placeholder="輸入你想顯示的名稱"/><button className="btn btn-primary full" disabled={!name.trim()} onClick={()=>onLogin(role,name.trim())}>以展示帳號登入 →</button><div className="demo-warning">ⓘ 此為模擬登入，不會建立真實帳號，也不會驗證密碼。</div></div></section>;
}

function Dashboard({user,tutors,setTutors,requests,setRequests,connections,respond,onConnect,notify,navigate}) {
  const [tab,setTab]=useState('profile');
  const [form,setForm]=useState({name:user?.name||'',subjects:'數學',level:'高中',mode:'線上／實體',location:'新竹市',need:'希望加強課程觀念，建立穩定的學習基礎。',philosophy:'先理解，再熟練。',intro:'期待用適合自己的方式一起學習。'});
  if(!user) return <section className="wrap empty-state"><h2>請先登入</h2><button className="btn btn-primary" onClick={()=>navigate('login')}>前往登入</button></section>;
  const mineRequests=requests.filter(r=>r.owner===user.id);
  const incoming=connections.filter(c=>c.status==='pending'&&(user.role==='teacher'?c.targetType==='student':c.targetType==='tutor'));
  const mineConnections=connections.filter(c=>c.from===user.id);
  const saveProfile=()=>notify('展示資料已更新（目前儲存在此瀏覽器）');
  const publish=()=>{
    if(user.role!=='student'){notify('教師帳號可以在教師資料管理中更新介紹');return;}
    const newReq={id:`r-${Date.now()}`,owner:user.id,displayName:form.name||user.name,level:form.level,subjects:form.subjects.split(/[、,，]/).map(s=>s.trim()).filter(Boolean),mode:form.mode,location:form.location,need:form.need,status:'招募中',updated:'剛剛',privateInfo:{contact:'展示資料，未提供真實聯絡方式'}};
    setRequests(prev=>[newReq,...prev]); notify('需求已發布！'); setTab('myrequests');
  };
  const saveTutor=()=>{
    if(user.role!=='teacher'){notify('目前僅教師帳號可編輯教師介紹');return;}
    const existing=tutors.find(t=>t.owner===user.id);
    const data={id:existing?.id||`t-${user.id}`,owner:user.id,name:form.name||user.name,avatar:initials(form.name||user.name),color:'peach',education:'教師自行填寫',subjects:form.subjects.split(/[、,，]/).map(s=>s.trim()).filter(Boolean),levels:[form.level],philosophy:form.philosophy,style:'依學生需求調整',mode:form.mode,location:form.location,intro:form.intro,experience:'教學經驗由教師填寫'};
    setTutors(prev=>existing?prev.map(t=>t.id===existing.id?data:t):[data,...prev]); notify('教師介紹已儲存'); setTab('profile');
  };
  const updateRequestStatus=(id,status)=>{setRequests(prev=>prev.map(r=>r.id===id?{...r,status}:r));notify('需求狀態已更新');};
  return <section className="dashboard wrap"><div className="dashboard-heading"><div><span className="eyebrow">MY XUEHUI</span><h1>嗨，{user.name}！</h1><p>管理你的學習資料，讓適合的相遇發生。</p></div><span className="role-label">{user.role==='teacher'?'家教老師':'學生／家長'}帳號</span></div><div className="dashboard-layout"><aside className="dash-nav"><button className={tab==='profile'?'selected':''} onClick={()=>setTab('profile')}>個人資料</button>{user.role==='student'&&<button className={tab==='publish'?'selected':''} onClick={()=>setTab('publish')}>發布需求</button>}{user.role==='student'&&<button className={tab==='myrequests'?'selected':''} onClick={()=>setTab('myrequests')}>我的需求</button>}<button className={tab==='contacts'?'selected':''} onClick={()=>setTab('contacts')}>聯繫管理 <span>{incoming.length||''}</span></button><button className={tab==='outgoing'?'selected':''} onClick={()=>setTab('outgoing')}>我提出的申請</button></aside><div className="dash-content">
    {tab==='profile'&&<div className="panel"><h2>{user.role==='teacher'?'教師資料管理':'個人資料'}</h2><p className="muted">以下是展示版本的資料欄位，請勿填入真實個資。</p><label className="field-label">公開顯示名稱</label><input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><label className="field-label">主要科目（可用頓號分隔）</label><input className="form-input" value={form.subjects} onChange={e=>setForm({...form,subjects:e.target.value})}/><label className="field-label">學習階段／適合階段</label><select className="form-input" value={form.level} onChange={e=>setForm({...form,level:e.target.value})}>{levelOptions.map(x=><option key={x}>{x}</option>)}</select><label className="field-label">偏好授課方式</label><select className="form-input" value={form.mode} onChange={e=>setForm({...form,mode:e.target.value})}><option>線上／實體</option><option>線上</option><option>實體</option></select><label className="field-label">地區</label><input className="form-input" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/>{user.role==='teacher'&&<><label className="field-label">教學理念（公開）</label><textarea className="form-input" value={form.philosophy} onChange={e=>setForm({...form,philosophy:e.target.value})}/><label className="field-label">個人介紹</label><textarea className="form-input" value={form.intro} onChange={e=>setForm({...form,intro:e.target.value})}/></>}<div className="form-actions"><button className="btn btn-primary" onClick={user.role==='teacher'?saveTutor:saveProfile}>儲存資料</button></div></div>}
    {tab==='publish'&&<div className="panel"><h2>發布家教需求</h2><p className="muted">讓老師了解你的學習目標。請勿填寫真實姓名、電話或學校。</p><label className="field-label">公開顯示名稱</label><input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><label className="field-label">學習階段</label><select className="form-input" value={form.level} onChange={e=>setForm({...form,level:e.target.value})}>{levelOptions.map(x=><option key={x}>{x}</option>)}</select><label className="field-label">需求科目（可用頓號分隔）</label><input className="form-input" value={form.subjects} onChange={e=>setForm({...form,subjects:e.target.value})}/><label className="field-label">授課方式</label><select className="form-input" value={form.mode} onChange={e=>setForm({...form,mode:e.target.value})}><option>線上／實體</option><option>線上</option><option>實體</option></select><label className="field-label">地區</label><input className="form-input" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/><label className="field-label">學習需求</label><textarea className="form-input" rows="4" value={form.need} onChange={e=>setForm({...form,need:e.target.value})}/><button className="btn btn-primary" onClick={publish}>發布需求</button></div>}
    {tab==='myrequests'&&<div className="panel"><h2>我的需求</h2>{mineRequests.length?mineRequests.map(r=><div className="manage-row" key={r.id}><div><b>尋找{r.subjects.join('、')}家教</b><small>{r.level}・{r.location}・{r.status}</small></div><div className="row-actions"><select value={r.status} onChange={e=>updateRequestStatus(r.id,e.target.value)}><option>招募中</option><option>已找到老師</option><option>暫停中</option><option>已下架</option></select><button className="icon-button" onClick={()=>{setRequests(prev=>prev.filter(x=>x.id!==r.id));notify('需求已刪除')}}>刪除</button></div></div>):<div className="empty-inline">你還沒有發布需求。</div>}</div>}
    {tab==='contacts'&&<div className="panel"><h2>收到的聯繫申請</h2>{incoming.length?incoming.map(c=><div className="manage-row" key={c.id}><div><b>{c.fromName}</b><small>{c.message}</small></div><div className="row-actions"><button className="btn btn-primary btn-small" onClick={()=>respond(c.id,'accepted')}>接受</button><button className="btn btn-outline btn-small" onClick={()=>respond(c.id,'rejected')}>拒絕</button></div></div>):<div className="empty-inline">目前沒有待處理的申請。</div>}</div>}
    {tab==='outgoing'&&<div className="panel"><h2>我提出的申請</h2>{mineConnections.length?mineConnections.map(c=><div className="manage-row" key={c.id}><div><b>{c.targetType==='tutor'?'教師':'學生'}聯繫申請</b><small>{c.createdAt}・{c.status==='pending'?'等待回覆':c.status==='accepted'?'已接受':'未通過'}</small></div>{c.status==='pending'&&<button className="icon-button" onClick={()=>respond(c.id,'rejected')}>取消申請</button>}</div>):<div className="empty-inline">你還沒有提出聯繫申請。</div>}</div>}
  </div></div><div className="demo-warning wide">ⓘ 展示版資料儲存在目前瀏覽器的 localStorage。清除瀏覽器資料後，展示資料可能重設；不同裝置或瀏覽器之間不會同步。</div></section>;
}

function About({navigate}) { return <section className="about-page wrap"><div className="page-intro"><span className="eyebrow">ABOUT XUEHUI</span><h1>學匯，讓學習匯聚。</h1><p>每個人都有想學習的事，也有人有能力陪伴他人學習。</p></div><div className="about-card"><h2>一個雙向的家教媒合平台</h2><p>學匯希望讓學生能主動刊登需求，也讓老師能分享自己的教學專長。透過公開的基本資訊，雙方可以先認識彼此；當一方提出聯繫申請、另一方同意後，再進一步交換聯繫後可見的資訊。</p><div className="about-points"><div><b>01｜自由探索</b><span>依照科目、階段與授課方式尋找合適對象。</span></div><div><b>02｜雙向媒合</b><span>學生找老師，老師也能主動尋找學生。</span></div><div><b>03｜尊重隱私</b><span>私人資訊不預設公開，由使用者決定分享範圍。</span></div></div><button className="btn btn-primary" onClick={()=>navigate('tutors')}>開始探索 →</button></div><p className="muted tiny center">學匯目前為課程專案展示網站，所有人物及需求均為虛構資料。</p></section>; }
function Footer({navigate}) { return <footer className="footer"><div className="wrap footer-inner"><div><div className="footer-brand">學匯 <span>讓學習匯聚，讓每個人都能學會</span></div><p>找到適合的老師，也讓教學專長被看見。</p></div><div className="footer-links"><button onClick={()=>navigate('tutors')}>找老師</button><button onClick={()=>navigate('requests')}>找學生</button><button onClick={()=>navigate('about')}>關於學匯</button></div></div><div className="wrap footer-bottom">© 2026 學匯｜課程專案展示網站・人物與需求資料皆為虛構</div></footer>; }

export default App;
