// seed_courses.js - Poblar colecciones de cursos en PocketBase
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

async function seedCourses() {
  try {
    console.log('📚 Iniciando seed de Cursos...');
    
    const authData = await apiRequest('/api/collections/_superusers/auth-with-password', 'POST', {
      identity: ADMIN_EMAIL, password: ADMIN_PASSWORD
    });
    const token = authData.token;
    console.log('✅ Autenticado');

    // Crear colecciones
    console.log('\n📋 Creando colecciones...');
    const collections = [
      { name: 'courses_list', fields: ['title','description','price','discount','thumbnail','educator_id','educator_name','educator_avatar','is_published','total_duration','category','level','requirements','what_you_will_learn','enrolled_count','avg_rating','ratings_count','chapters_count'] },
      { name: 'course_chapters', fields: ['course_id','chapter_title','order_index'] },
      { name: 'course_lectures', fields: ['course_id','chapter_id','title','video_url','duration','order_index','is_preview'] },
      { name: 'course_enrollments', fields: ['course_id','course_title','student_name','student_email','price_paid','progress_percent','enrolled_date','completed_date'] },
    ];

    for (const def of collections) {
      let existing = await fetch(PB_URL+'/api/collections/'+def.name, { headers:{'Authorization':token} }).then(r=>r.json());
      if (existing.code !== 404 && existing.id) {
        await fetch(PB_URL+'/api/collections/'+existing.id, { method:'DELETE', headers:{'Authorization':token} });
      }
      const create = await fetch(PB_URL+'/api/collections', {
        method:'POST', headers:{'Content-Type':'application/json','Authorization':token},
        body:JSON.stringify({
          name: def.name, type: 'base',
          listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
          schema: def.fields.map(f => ({ name: f, type: 'text', required: false })),
        })
      }).then(r=>r.json());
      console.log(`  ✅ ${def.name} (${create.id})`);
    }

    // Datos demo
    console.log('\n📦 Creando cursos...');
    const courseData = [
      { title: 'React 18 - Kompletny kurs od podstaw', description: 'Naucz się React od zera do eksperta. Hooks, Context API, Redux, Next.js.', price: 19999, discount: 50, total_duration: 480, category: 'frontend', level: 'beginner', is_published: true,
        requirements: ['Podstawowa znajomość HTML/CSS','Podstawy JavaScript'], what_you_will_learn: ['Tworzenie aplikacji React','React Hooks','Redux Toolkit','Next.js','Testowanie aplikacji'], educator_name: 'Anna Kowalska' },
      { title: 'Node.js i Express - Backend Pro', description: 'REST API, autoryzacja, MongoDB, websockety, deploy na VPS.', price: 24999, discount: 30, total_duration: 600, category: 'backend', level: 'intermediate', is_published: true,
        requirements: ['JavaScript średniozaawansowany','Podstawy HTTP'], what_you_will_learn: ['REST API design','JWT Authentication','MongoDB','WebSockety','Deploy na VPS'], educator_name: 'Piotr Nowak' },
      { title: 'TypeScript w praktyce', description: 'Typowanie zaawansowane, generyki, utility types, wzorce projektowe.', price: 14999, discount: 0, total_duration: 240, category: 'frontend', level: 'intermediate', is_published: true,
        requirements: ['JavaScript','Podstawy programowania'], what_you_will_learn: ['Zaawansowane typy','Generyki','Utility Types','Wzorce projektowe'], educator_name: 'Anna Kowalska' },
      { title: 'Python dla Data Science', description: 'NumPy, Pandas, Matplotlib, scikit-learn - od zera do pierwszego modelu ML.', price: 29999, discount: 40, total_duration: 720, category: 'data', level: 'beginner', is_published: true,
        requirements: [], what_you_will_learn: ['Python','NumPy','Pandas','Matplotlib','scikit-learn'], educator_name: 'Karolina Wiśniewska' },
      { title: 'Docker i Kubernetes', description: 'Konteneryzacja, docker-compose, k8s, CI/CD pipelines.', price: 39999, discount: 25, total_duration: 360, category: 'devops', level: 'advanced', is_published: true, educator_name: 'Michał Dąbrowski',
        requirements: ['Linux podstawy','Git'], what_you_will_learn: ['Docker','Docker Compose','Kubernetes','CI/CD'] },
      { title: 'UX/UI Design - kurs praktyczny', description: 'Figma, research, prototypowanie, testy użyteczności.', price: 12999, discount: 20, total_duration: 300, category: 'design', level: 'all', is_published: false, educator_name: 'Aleksandra L.',
        requirements: [], what_you_will_learn: ['Figma','User Research','Prototypowanie','Testowanie'] },
    ];

    const courseIds = [];
    for (const c of courseData) {
      const record = await apiRequest('/api/collections/courses_list/records', 'POST', {
        ...c, website_id: WEBSITE_ID, educator_id: 'demo_educator', educator_avatar: '',
        thumbnail: '', enrolled_count: Math.floor(Math.random()*200), avg_rating: 3.5 + Math.random()*1.5,
        ratings_count: Math.floor(Math.random()*50), chapters_count: Math.floor(Math.random()*6)+2,
      }, token);
      courseIds.push(record.id);
      console.log(`  ✅ ${c.title}`);
    }

    // Capítulos y lecciones
    console.log('\n📖 Creando capítulos y lecciones...');
    for (const courseId of courseIds) {
      const chapters = [
        { title: 'Wprowadzenie', lectures: ['Witaj w kursie','Instalacja środowiska','Pierwsze kroki'] },
        { title: 'Podstawy', lectures: ['Teoria','Ćwiczenia praktyczne','Quiz sprawdzający'] },
        { title: 'Zaawansowane', lectures: ['Zaawansowane techniki','Projekt końcowy'] },
      ];
      let chOrder = 0;
      for (const ch of chapters) {
        chOrder++;
        const chRecord = await apiRequest('/api/collections/course_chapters/records', 'POST', {
          course_id: courseId, chapter_title: ch.title, order_index: chOrder, website_id: WEBSITE_ID,
        }, token);
        let leOrder = 0;
        for (const leTitle of ch.lectures) {
          leOrder++;
          await apiRequest('/api/collections/course_lectures/records', 'POST', {
            course_id: courseId, chapter_id: chRecord.id, title: leTitle,
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: `${5+Math.floor(Math.random()*25)}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
            order_index: leOrder, is_preview: chOrder === 1 && leOrder === 1, website_id: WEBSITE_ID,
          }, token);
        }
      }
    }
    console.log('  ✅ Capítulos y lecciones creados');

    console.log('\n' + '='.repeat(50));
    console.log('🎉 ¡CURSOS SEED COMPLETADO!');
    console.log(`📚 ${courseData.length} cursos con capítulos y lecciones`);
    console.log(`🔗 Panel: ${PB_URL}/panel/courses`);
    console.log('='.repeat(50));
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

seedCourses();
