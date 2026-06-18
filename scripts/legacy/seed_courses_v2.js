// seed_courses_v2.js - Poblar colecciones PocketBase con datos completos LMS
const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';
const WEBSITE_ID = 'dktsle4yev6syo4';

async function apiRequest(endpoint, method, body, token = null) {
  const url = `${PB_URL}${endpoint}`;
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (token) options.headers['Authorization'] = token;
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(`Error ${response.status}: ${JSON.stringify(data)}`);
  return data;
}

function uuid() { return 'xxxxxxxx_xxxx_xxxx_xxxx_xxxxxxxxxxxx'.replace(/x/g, () => Math.floor(Math.random()*16).toString(16)); }

async function seedCoursesV2() {
  try {
    console.log('📚 LMS - Seed completo de cursos...');
    const auth = await apiRequest('/api/collections/_superusers/auth-with-password', 'POST', {
      identity: ADMIN_EMAIL, password: ADMIN_PASSWORD
    });
    const token = auth.token;
    console.log('✅ Auth');

    // Crear colecciones
    console.log('\n📋 Colecciones...');
    const cols = [
      { name: 'courses_list', keys: ['title','description','price','discount','thumbnail','educator_id','educator_name','educator_avatar','is_published','category','level','language','estimated_duration','requirements','what_you_will_learn','tags','ratings','enrolled_count','avg_rating','ratings_count','total_duration','chapters_count'] },
      { name: 'course_chapters', keys: ['course_id','chapter_title','order_index'] },
      { name: 'course_lectures', keys: ['course_id','chapter_id','title','video_url','duration','order_index','is_preview'] },
      { name: 'course_enrollments', keys: ['course_id','course_title','student_name','student_email','student_avatar','price_paid','progress_percent','enrolled_date','completed_date'] },
    ];
    for (const c of cols) {
      let ex = await fetch(PB_URL+'/api/collections/'+c.name,{headers:{'Authorization':token}}).then(r=>r.json());
      if (ex.code!==404&&ex.id) await fetch(PB_URL+'/api/collections/'+ex.id,{method:'DELETE',headers:{'Authorization':token}});
      const cr = await fetch(PB_URL+'/api/collections',{method:'POST',headers:{'Content-Type':'application/json','Authorization':token},body:JSON.stringify({name:c.name,type:'base',listRule:null,viewRule:null,createRule:null,updateRule:null,deleteRule:null,schema:c.keys.map(k=>({name:k,type:'text',required:false}))})}).then(r=>r.json());
      console.log(`  ✅ ${c.name}`);
    }

    // Cursos demo - 8 cursos reales
    console.log('\n📦 Cursos...');
    const coursesDef = [
      { title:'React 18 - Kompletny kurs od podstaw', desc:'Opanuj React od zera do eksperta. Hooks, Context API, Redux Toolkit, Next.js 14, TypeScript z React, testowanie aplikacji i deploy na Vercel.', price:19999, disc:50, dur:2880, cat:'frontend', lvl:'beginner', lang:'Polski', tags:['React','JavaScript','Frontend','Next.js'], wyl:['Tworzenie aplikacji React od zera','React Hooks (useState, useEffect, useContext)','Redux Toolkit i zarządzanie stanem','Next.js 14 i Server Components','Testowanie z Jest i React Testing Library','Deploy na Vercel'], req:['Podstawowa znajomość HTML i CSS','Podstawy JavaScript (zmienne, funkcje, async/await)'], edu:'Michał Dąbrowski' },
      { title:'Node.js i Express - Backend Pro', desc:'Kompletny kurs backendu. REST API, autoryzacja JWT/OAuth, MongoDB/Mongoose, WebSockety, testy, CI/CD i deploy na VPS.', price:24999, disc:30, dur:3600, cat:'backend', lvl:'intermediate', lang:'Polski', tags:['Node.js','Express','MongoDB','API'], wyl:['Projektowanie REST API','JWT Authentication i OAuth2','MongoDB + Mongoose','WebSockety z Socket.io','Testy jednostkowe i integracyjne','Docker i CI/CD'], req:['JavaScript średniozaawansowany','Podstawy HTTP i baz danych'], edu:'Anna Kowalska' },
      { title:'TypeScript w praktyce', desc:'Zaawansowane typowanie, generyki, utility types, wzorce projektowe. TypeScript od podstaw do poziomu eksperta.', price:14999, disc:0, dur:1440, cat:'frontend', lvl:'intermediate', lang:'Polski', tags:['TypeScript','JavaScript','Typowanie'], wyl:['Zaawansowane typy i generyki','Utility Types w praktyce','Wzorce projektowe w TS','Integracja z React i Node.js','Konfiguracja monorepo'], req:['JavaScript podstawy'], edu:'Piotr Nowak' },
      { title:'Python dla Data Science', desc:'NumPy, Pandas, Matplotlib, scikit-learn, TensorFlow. Od zera do pierwszego modelu Machine Learning.', price:29999, disc:40, dur:4200, cat:'data', lvl:'beginner', lang:'Polski', tags:['Python','Data Science','ML','AI'], wyl:['Python i Jupyter Notebooks','NumPy i Pandas','Wizualizacja danych (Matplotlib, Seaborn)','scikit-learn i modele ML','TensorFlow i Keras'], req:[], edu:'Karolina Wiśniewska' },
      { title:'Docker i Kubernetes', desc:'Konteneryzacja, docker-compose, Kubernetes, Helm, CI/CD pipelines. Uruchom swoje aplikacje w produkcji.', price:39999, disc:25, dur:2160, cat:'devops', lvl:'advanced', lang:'Polski', tags:['Docker','Kubernetes','DevOps','CI/CD'], wyl:['Docker i Docker Compose','Kubernetes - Pods, Services, Deployments','Helm Charts','CI/CD z GitHub Actions','Monitoring i logowanie'], req:['Linux podstawy','Git','Znajomość jednego języka programowania'], edu:'Aleksandra Lewandowska' },
      { title:'UX/UI Design - Kurs kompletny', desc:'Figma, research użytkownika, prototypowanie, testy użyteczności, design systems. Portfolio gotowe do pracy.', price:12999, disc:20, dur:1800, cat:'design', lvl:'all', lang:'Polski', tags:['UX','UI','Figma','Design'], wyl:['Figma od podstaw do eksperta','User Research i Persony','Wireframing i Prototypowanie','Testy użyteczności','Design Systems','Portfolio 3 projekty'], req:[], edu:'Aleksandra Lewandowska' },
      { title:'Flutter Mobile Development', desc:'Twórz aplikacje na iOS i Android z jednym kodem. Dart, Widgets, State Management, Firebase, deploy w App Store i Google Play.', price:21999, disc:35, dur:2400, cat:'mobile', lvl:'beginner', lang:'Polski', tags:['Flutter','Dart','Mobile','iOS','Android'], wyl:['Dart i Flutter','Widgets i Layouts','State Management (Riverpod)','Firebase Integration','Deploy na App Store i Google Play'], req:[], edu:'Michał Dąbrowski' },
      { title:'Marketing Cyfrowy - Mistrz', desc:'SEO, Google Ads, Meta Ads, Email Marketing, Analytics. Zdobądź klientów i rozwijaj biznes.', price:16999, disc:15, dur:1500, cat:'marketing', lvl:'all', lang:'Polski', tags:['Marketing','SEO','Ads','Analityka'], wyl:['SEO on-page i off-page','Google Ads i Meta Ads','Email Marketing','Google Analytics 4','Content Marketing'], req:[], edu:'Piotr Nowak' },
    ];

    const courseIds = [];
    for (const c of coursesDef) {
      const r = await apiRequest('/api/collections/courses_list/records','POST',{
        ...c, website_id:WEBSITE_ID, educator_id:'edu_001', educator_avatar:'',
        thumbnail:'', is_published:true, estimated_duration:c.dur,
        requirements:c.req, what_you_will_learn:c.wyl,
        ratings:[], enrolled_count:Math.floor(Math.random()*300)+20,
        avg_rating:3.5+Math.random()*1.5, ratings_count:Math.floor(Math.random()*80)+5,
        total_duration:c.dur, chapters_count:0,
      },token);
      courseIds.push(r.id);
      console.log(`  ✅ ${c.title} (${(c.price/100).toFixed(0)} PLN, -${c.disc}%)`);
    }

    // Capítulos y lecciones para cada curso
    console.log('\n📖 Capítulos i lekcje...');
    for (let ci=0; ci<courseIds.length; ci++) {
      const chDefs = [
        { t: 'Wprowadzenie', le: ['Witaj w kursie','Instalacja środowiska','Przegląd narzędzi','Jak się uczyć efektywnie'] },
        { t: 'Podstawy teoretyczne', le: ['Teoria - część 1','Teoria - część 2','Ćwiczenia praktyczne','Quiz wiedzy'] },
        { t: 'Praktyka', le: ['Projekt - etap 1','Projekt - etap 2','Code Review','Debugowanie'] },
        { t: 'Zaawansowane techniki', le: ['Zaawansowane koncepcje','Optymalizacja','Bezpieczeństwo i dobre praktyki','Integracje'] },
        { t: 'Projekt końcowy', le: ['Planowanie projektu','Implementacja','Testowanie','Wdrożenie','Podsumowanie kursu'] },
      ];
      let chOrder=0;
      for (const ch of chDefs) {
        chOrder++;
        const chR = await apiRequest('/api/collections/course_chapters/records','POST',{
          course_id:courseIds[ci], chapter_title:ch.t, order_index:chOrder, website_id:WEBSITE_ID
        },token);
        let leOrder=0;
        for (const lt of ch.le) {
          leOrder++;
          const min=4+Math.floor(Math.random()*18); const sec=Math.floor(Math.random()*60);
          await apiRequest('/api/collections/course_lectures/records','POST',{
            course_id:courseIds[ci], chapter_id:chR.id, title:lt,
            video_url:'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration:`${min}:${String(sec).padStart(2,'0')}`,
            order_index:leOrder, is_preview:chOrder===1&&leOrder===1,
            website_id:WEBSITE_ID
          },token);
        }
      }
      // Update chapters count
      await apiRequest(`/api/collections/courses_list/records/${courseIds[ci]}`,'PATCH',{chapters_count:chDefs.length},token);
      console.log(`  ✅ ${coursesDef[ci].title.substring(0,25)}... → ${chDefs.length} rozdz., ${chDefs.reduce((s,ch)=>s+ch.le.length,0)} lekcji`);
    }

    // Enrollments
    console.log('\n👥 Studenci...');
    const students = [
      'Jan Kowalski','Zofia Nowak','Tomasz Wiśniewski','Ewa Dąbrowska','Krzysztof Lewandowski',
      'Magdalena Kamińska','Adam Zieliński','Barbara Szymańska','Rafał Woźniak','Natalia Kwiatkowska',
      'Dawid Piotrowski','Agata Michalak','Marcin Pawlak','Justyna Krawczyk','Piotr Borkowski',
    ];
    for (const sn of students) {
      const email = sn.toLowerCase().replace(/\s/g,'.')+'@email.pl';
      const courseIdx = Math.floor(Math.random()*8);
      await apiRequest('/api/collections/course_enrollments/records','POST',{
        course_id:courseIds[courseIdx], course_title:coursesDef[courseIdx].title,
        student_name:sn, student_email:email, student_avatar:'',
        price_paid:coursesDef[courseIdx].price*(1-coursesDef[courseIdx].disc/100),
        progress_percent:Math.floor(Math.random()*100),
        enrolled_date:new Date(2025,0,1+Math.floor(Math.random()*150)).toISOString(),
        completed_date:Math.random()>0.5?new Date(2025,0,60+Math.floor(Math.random()*150)).toISOString():null,
        website_id:WEBSITE_ID
      },token);
      console.log(`  ✅ ${sn} → ${coursesDef[courseIdx].title.substring(0,30)}...`);
    }

    console.log('\n'+'='.repeat(50));
    console.log('🎉 LMS SEED COMPLETO');
    console.log(`📚 ${coursesDef.length} kursów`);
    console.log('📖 5 rozdziałów × 4-5 lekcji każdy');
    console.log(`👥 ${students.length} studentów`);
    console.log(`🔗 ${PB_URL}/panel/courses`);
  } catch(e) { console.error('❌',e.message); process.exit(1); }
}
seedCoursesV2();
