
// ── Error catcher (debug) ───────────────────────────────────────
window.onerror = function(msg, src, line, col, err) {
  console.error('[VagasPro]', msg, 'L'+line, src);
  return false;
};
// ═══════════════════════════════════════════════════════════
// CONFIGURAÇÃO SUPABASE
// Substitua pelas suas credenciais do painel Supabase:
// Settings > API > Project URL e anon public key
// ═══════════════════════════════════════════════════════════
const SUPABASE_URL  = 'https://wsvqzagbulfufyqowwfx.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzdnF6YWdidWxmdWZ5cW93d2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTYwNzgsImV4cCI6MjA5MTA5MjA3OH0.Nat7Ba1pzzYJDM8jZoZqg_D7rg8Kb4v7Cnzq1uU005Q';
let supabase = null;

// Inicializa cliente Supabase (se credenciais configuradas)
function initSupabase(){
  try{
    if(!SUPABASE_URL || !SUPABASE_URL.startsWith('https://') || SUPABASE_URL.includes('SEU-PROJETO')) return;
    supabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false
      }
    });
    if(supabase) console.info('[VagasPro] Supabase conectado:', SUPABASE_URL);
  } catch(e){ console.warn('[VagasPro] Supabase nao configurado — verifique as credenciais'); }
}

// ===== DATA =====
const VAGAS_DB=[
  {id:1,titulo:'Cozinheiro(a)',empresa:'Empório do Lago',setor:'Alimentação',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'R$ 1.800,00',jornada:'Escala 6x1 – 16h às 22h',status:'aberto',destaque:'Venha fazer parte de uma equipe apaixonada por sabores!',requisitos:['Ensino fundamental','Experiência em restaurante','Disposição para aprender','Trabalho em equipe','Pontualidade'],atividades:['Preparar pratos do menu','Manter higiene da cozinha','Controlar estoque'],beneficios:['Vale transporte ou combustível','Refeição na empresa','Seguro de vida','Plano de saúde','Plano odontológico','Prêmio por assiduidade'],whatsapp:'(62) 98459-1750',email:'',logo:'🍳',dias:2,favorito:false,interesse:false,interessados:3,criado_por:'Empório do Lago',max_candidatos:null},
  {id:2,titulo:'Auxiliar de Serviços Gerais',empresa:'Empório do Lago',setor:'Alimentação',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'R$ 1.700,00',jornada:'Escala 6x1 – 09h às 18h',status:'aberto',destaque:'',requisitos:['Ensino fundamental','Noções de limpeza','Trabalho em equipe'],atividades:['Limpeza e organização','Apoio geral'],beneficios:['Vale transporte','Refeição','Seguro de vida','Plano de saúde'],whatsapp:'(62) 98459-1750',email:'',logo:'🧹',dias:2,favorito:false,interesse:false,interessados:1,criado_por:'Empório do Lago',max_candidatos:20},
  {id:3,titulo:'Atendente de Caixa e Recepção',empresa:'Empório do Lago',setor:'Alimentação',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'R$ 1.800 → R$ 2.000',jornada:'Escala 6x1 – 09h às 18h',status:'urgente',destaque:'Crescimento salarial após 90 dias!',requisitos:['Ensino médio','Noções de informática','Boa comunicação'],atividades:['Atendimento ao cliente','Operação do caixa'],beneficios:['Vale transporte','Refeição','Seguro de vida','Plano de saúde'],whatsapp:'(62) 98459-1750',email:'',logo:'🛒',dias:2,favorito:false,interesse:false,interessados:7,criado_por:'Empório do Lago',max_candidatos:10},
  {id:4,titulo:'Supervisor de Funilaria',empresa:'Viação Reunidas',setor:'Manutenção',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'A combinar',jornada:'Disponibilidade de horário',status:'aberto',destaque:'Lidere uma equipe de alta performance!',requisitos:['Experiência com funilaria','Liderança de equipe'],atividades:['Supervisionar funilaria e pintura','Liderar equipe'],beneficios:['VA: R$ 1.146,00','VT: 100%','Plano de saúde'],whatsapp:'',email:'soutalento@viacaoreunidas-go.com.br',logo:'🚌',dias:5,favorito:false,interesse:false,interessados:2,criado_por:'Viação Reunidas',max_candidatos:null},
  {id:5,titulo:'Supervisor de Mecânica',empresa:'Viação Reunidas',setor:'Manutenção',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'A combinar',jornada:'Disponibilidade de horário',status:'aberto',destaque:'',requisitos:['Experiência com veículos pesados','Liderança'],atividades:['Supervisionar manutenção da frota'],beneficios:['VA: R$ 1.146,00','VT: 100%','Plano de saúde'],whatsapp:'',email:'soutalento@viacaoreunidas-go.com.br',logo:'🔧',dias:5,favorito:false,interesse:false,interessados:4,criado_por:'Viação Reunidas',max_candidatos:null},
  {id:6,titulo:'Supervisor de Elétrica Veicular',empresa:'Viação Reunidas',setor:'Manutenção',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'A combinar',jornada:'Disponibilidade de horário',status:'urgente',destaque:'',requisitos:['Experiência com elétrica veicular','Liderança','Diagnóstico elétrico'],atividades:['Supervisionar manutenção elétrica','Diagnóstico de falhas'],beneficios:['VA: R$ 1.146,00','VT: 100%','Plano de saúde'],whatsapp:'',email:'soutalento@viacaoreunidas-go.com.br',logo:'⚡',dias:5,favorito:false,interesse:false,interessados:3,criado_por:'Viação Reunidas',max_candidatos:8},
  {id:7,titulo:'Auxiliar de Produção – Dermato',empresa:'Manipularte Farmácia',setor:'Saúde',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'Salário fixo',jornada:'44 horas semanais',status:'aberto',destaque:'Venha fazer parte do nosso TIME!',requisitos:['Ensino médio completo','Preferencialmente estudante de Farmácia','Atenção aos detalhes'],atividades:['Produção dermatológica','Controle de qualidade'],beneficios:['Plano de saúde','Plano odontológico'],whatsapp:'(62) 9862-0660',email:'rh@manipularte.com.br',logo:'💊',dias:1,favorito:false,interesse:false,interessados:9,criado_por:'Manipularte Farmácia',max_candidatos:10},
  {id:8,titulo:'Assistente de RH',empresa:'Pacto Soluções',setor:'RH',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'R$ 2.500,00',jornada:'08h às 18h – seg a sex',status:'aberto',destaque:'Junte-se a uma empresa que transforma vidas!',requisitos:['Superior em Psicologia ou Administração','Conhecimento em RH','Informática intermediária'],atividades:['Recrutamento e seleção','Desenvolvimento de pessoas'],beneficios:['R$ 2.500,00','Cartão alimentação','Plano de saúde','VT','Wellhub','Day off Aniversário'],whatsapp:'+55629181912085',email:'talentos@pactosolucoes.com.br',logo:'👥',dias:3,favorito:false,interesse:false,interessados:12,criado_por:'Pacto Soluções',max_candidatos:15},
  {id:9,titulo:'Operador de Moagem',empresa:'Apoiar RH – Indústria',setor:'Indústria',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'R$ 2.663,85',jornada:'Escala 12x36 – 19h às 07h',status:'urgente',destaque:'Excelente pacote de benefícios!',requisitos:['Experiência como Operador de Máquinas Industriais'],atividades:['Operação de moagem industrial','Controle de produção'],beneficios:['Assiduidade: R$ 266,00','Cesta de Alimentos','Plano de saúde','VT'],whatsapp:'(62) 99347-2725',email:'rh5@apoiarh.com.br',logo:'⚙️',dias:7,favorito:false,interesse:false,interessados:6,criado_por:'Apoiar RH',max_candidatos:null},
];

const CANDS_MOCK=[
  {nome:'Ana Lima',email:'ana@email.com',whatsapp:'(62) 99111-2222',vaga_id:7,cargo:'Auxiliar de Produção',exp:'1 ano em farmácia de manipulação',dias:1,status:'novo'},
  {nome:'Carlos Souza',email:'carlos@email.com',whatsapp:'(62) 99333-4444',vaga_id:7,cargo:'Estudante de Farmácia',exp:'Sem experiência, cursando 3º período',dias:2,status:'contato'},
  {nome:'Fernanda Rocha',email:'fern@email.com',whatsapp:'(62) 99555-6666',vaga_id:8,cargo:'Estudante de Psicologia',exp:'Estágio em RH por 6 meses',dias:1,status:'entrevista'},
  {nome:'João Melo',email:'joao@email.com',whatsapp:'(62) 99777-8888',vaga_id:3,cargo:'Operador de Caixa',exp:'2 anos em supermercado',dias:3,status:'novo'},
  {nome:'Mariana Costa',email:'mari@email.com',whatsapp:'(62) 99999-0000',vaga_id:1,cargo:'Cozinheira',exp:'3 anos em restaurante italiano',dias:4,status:'contratado'},
];

let vagasLocal=[...VAGAS_DB];
let tagsData={req:[],atv:[],ben:[],cvHabil:[]};
let vagaAtual=null;
let currentUser=null;

let pendingRegister=null;
let cvExps=[];let cvEdus=[];
let cvFotoData=null;

// ===== NAV =====
const PAGE_TITLES={dashboard:'Dashboard',vagas:'Vagas em Aberto',cadastrar:'Cadastrar Nova Vaga',favoritos:'Vagas Favoritas','meus-interesses':'Meus Interesses',curriculo:'Fazer Currículo com IA',interessados:'Candidatos por Vaga','perfil-rec':'Perfil da Empresa',empresas:'Empresas',alertas:'Alertas',usuarios:'Usuários',noticias:'Notícias',configuracoes:'Configurações',supabase:'Banco de Dados'};

function navTo(page,el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const pg=document.getElementById('page-'+page);
  if(pg)pg.classList.add('active');
  if(el)el.classList.add('active');
  else{const ne=document.getElementById('nav-'+page);if(ne)ne.classList.add('active');}
  document.getElementById('topbarTitle').textContent=PAGE_TITLES[page]||page;
  document.getElementById('mainContent').scrollTo(0,0);
  if(page==='vagas')filtrarVagas();
  if(page==='favoritos')renderFavoritos();
  if(page==='meus-interesses')renderInteresses();
  if(page==='noticias')renderNoticias('rh');
  if(page==='supabase')renderSQL();
  if(page==='dashboard')renderDashboard();
  if(page==='interessados')renderInteressados();
  if(page==='usuarios')renderUsuarios();
  if(page==='configuracoes')renderConfig();
  if(page==='curriculo')updateCVPreview();
  if(page==='kanban')renderKanban();
  if(page==='termos')renderTermos();
  if(window.innerWidth<=768){document.getElementById('sidebar').classList.remove('open');document.getElementById('sidebarOverlay').classList.remove('open');}
}
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');document.getElementById('sidebarOverlay').classList.toggle('open');}

// ===== LOGIN =====
function setLoginTab(tab,btn){
  document.querySelectorAll('.login-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  document.getElementById('tab-entrar').style.display=tab==='entrar'?'block':'none';
  document.getElementById('tab-cadastrar').style.display=tab==='cadastrar'?'block':'none';
}

// =====================================================
// AUTENTICAÇÃO — VagasPro · Ciberic.Lab
// Autentica exclusivamente via tabela usuarios no Supabase
// =====================================================

function loginGoogle(){
  if(typeof gapi==='undefined'||!gapi.auth2){
    showToast('Biblioteca Google ainda carregando...','info');
    setTimeout(loginGoogle,1500);
    return;
  }
  gapi.auth2.getAuthInstance().signIn()
    .then(function(googleUser){
      var p=googleUser.getBasicProfile();
      _loginComPerfil(_sanitize(p.getEmail()||''), _sanitize(p.getName()||''), p.getImageUrl()||'');
    })
    .catch(function(err){
      if(err.error==='popup_closed_by_user')return;
      showToast('Erro ao autenticar com Google. Verifique o Client ID configurado.','error');
    });
}

function inicializarGoogle(){
  if(typeof gapi==='undefined')return;
  gapi.load('auth2',function(){
    gapi.auth2.init({
      client_id:'YOUR_CLIENT_ID.apps.googleusercontent.com'
    }).catch(function(){});
  });
}

// Busca perfil real na tabela usuarios e faz login
async function _loginComPerfil(email, nomeGoogle, avatar){
  if(!email){showToast('E-mail não obtido.','error');return;}
  if(supabase){
    try{
      var res=await supabase.from('usuarios')
        .select('id,nome,nivel,status')
        .eq('email',email).eq('status','ativo').maybeSingle();
      if(res.data){
        fazerLogin({id:res.data.id,nome:_sanitize(res.data.nome)||nomeGoogle,
          email:email,nivel:res.data.nivel||'candidato',avatar:avatar});
        return;
      }
    }catch(e){}
  }
  showToast('Conta não encontrada. Cadastre-se primeiro.','error');
}

// Sanitização contra XSS
function _sanitize(s){
  if(typeof s!=='string')return'';
  return s.replace(/[<>"'`&]/g,function(ch){
    return{'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;','`':'&#x60;','&':'&amp;'}[ch];
  });
}

// Validação de e-mail
function _validarEmail(e){
  return/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)&&e.length<=200;
}

// Rate limit — máximo 5 tentativas por 60s
var _rateBucket={};
function _rateLimit(k){
  var now=Date.now();
  if(!_rateBucket[k])_rateBucket[k]=[];
  _rateBucket[k]=_rateBucket[k].filter(function(t){return now-t<60000;});
  if(_rateBucket[k].length>=5)return false;
  _rateBucket[k].push(now);
  return true;
}

function setLoginTab(tab,btn){
  document.querySelectorAll('.login-tab').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  document.getElementById('tab-entrar').style.display=tab==='entrar'?'block':'none';
  document.getElementById('tab-cadastrar').style.display=tab==='cadastrar'?'block':'none';
}

async function doLogin(){
  var emailEl=document.getElementById('loginEmail');
  var senhaEl=document.getElementById('loginSenha');
  if(!emailEl||!senhaEl)return;

  var email=(emailEl.value||'').trim().toLowerCase();
  var senha=(senhaEl.value||'');

  if(!email){showToast('Informe seu e-mail.','error');emailEl.focus();return;}
  if(!_validarEmail(email)){showToast('E-mail inválido.','error');return;}
  if(!senha){showToast('Informe sua senha.','error');senhaEl.focus();return;}
  if(senha.length<6){showToast('Senha deve ter ao menos 6 caracteres.','error');return;}
  if(!_rateLimit('login_'+email)){showToast('Muitas tentativas. Aguarde 1 minuto.','error');return;}

  var btn=document.getElementById('btnEntrar');
  if(btn){btn.disabled=true;btn.textContent='Verificando...';}
  var reBtn=function(){if(btn){btn.disabled=false;btn.textContent='Entrar na plataforma →';}};

  if(!supabase){
    reBtn();
    showToast('Banco de dados não configurado. Verifique as credenciais Supabase.','error');
    return;
  }

  try{
    // Tentativa 1: fn_auth_login (verifica hash bcrypt)
    var rpc=await supabase.rpc('fn_auth_login',{p_email:email,p_senha:senha});
    if(!rpc.error&&rpc.data&&rpc.data.ok){
      reBtn();
      fazerLogin({id:rpc.data.id,nome:_sanitize(rpc.data.nome||''),
        email:_sanitize(rpc.data.email||email),
        nivel:rpc.data.nivel||'candidato',avatar:rpc.data.avatar_url||''});
      return;
    }
    if(!rpc.error&&rpc.data&&!rpc.data.ok){
      reBtn();
      showToast(rpc.data.erro||'E-mail ou senha incorretos.','error');
      return;
    }
    // RPC com erro técnico → tenta busca direta
    var direct=await supabase.from('usuarios')
      .select('id,nome,nivel,status')
      .eq('email',email).eq('status','ativo').maybeSingle();
    if(!direct.error&&direct.data){
      reBtn();
      fazerLogin({id:direct.data.id,nome:_sanitize(direct.data.nome||''),
        email:_sanitize(email),nivel:direct.data.nivel||'candidato',avatar:''});
      return;
    }
  }catch(e){
    console.warn('[doLogin]',e);
  }

  reBtn();
  showToast('E-mail ou senha incorretos.','error');
}

async function doRegister(){
  var aceito=document.getElementById('aceitoTermos');
  if(!aceito||!aceito.checked){showToast('Aceite os Termos de Uso para continuar.','error');return;}

  var nome=_sanitize((document.getElementById('regNome').value||'').trim());
  var email=(document.getElementById('regEmail').value||'').trim().toLowerCase();
  var senha=(document.getElementById('regSenha').value||'');
  var conf=(document.getElementById('regSenhaConf').value||'');
  var nivel=(document.getElementById('regTipo').value||'candidato');

  if(!nome||nome.length<2){showToast('Informe seu nome completo.','error');return;}
  if(!_validarEmail(email)){showToast('E-mail inválido.','error');return;}
  if(senha.length<6){showToast('Senha deve ter ao menos 6 caracteres.','error');return;}
  if(senha!==conf){showToast('As senhas não coincidem.','error');return;}
  if(!['candidato','recrutador'].includes(nivel)){showToast('Tipo de conta inválido.','error');return;}
  if(!_rateLimit('reg_'+email)){showToast('Muitas tentativas. Aguarde 1 minuto.','error');return;}

  var btn=document.getElementById('btnCadastrar');
  if(btn){btn.disabled=true;btn.textContent='Criando conta...';}
  var reBtn=function(){if(btn){btn.disabled=false;btn.textContent='Criar minha conta grátis →';}};

  if(!supabase){
    reBtn();
    showToast('Banco de dados não configurado.','error');
    return;
  }

  try{
    var res=await supabase.rpc('fn_auth_register',{p_nome:nome,p_email:email,p_senha:senha,p_nivel:nivel});
    reBtn();
    if(res.error||!res.data){showToast((res.error&&res.error.message)||'Erro ao criar conta.','error');return;}
    if(!res.data.ok){showToast(res.data.erro||'Não foi possível criar a conta.','error');return;}
    _pendingRegister={nome:nome,email:email,nivel:nivel,id:res.data.id};
    _mostrarVerificacao(res.data.id,email);
  }catch(e){
    reBtn();
    showToast('Erro de conexão. Tente novamente.','error');
  }
}

var _pendingRegister=null;

async function _mostrarVerificacao(userId,email){
  if(supabase&&userId){
    try{await supabase.rpc('fn_gerar_codigo_verificacao',{p_usuario_id:userId});}catch(e){}
  }
  document.getElementById('verifyEmailShow').textContent=email;
  document.getElementById('verifyOverlay').classList.add('open');
  for(var i=0;i<6;i++){
    var ci=document.getElementById('c'+i);
    if(ci){ci.value='';ci.classList.remove('filled');}
  }
  var c0=document.getElementById('c0');
  if(c0)c0.focus();
  showToast('📧 Código enviado para '+email,'info');
}

async function verifyCode(){
  var entered='';
  for(var i=0;i<6;i++){var ci=document.getElementById('c'+i);if(ci)entered+=ci.value;}
  if(entered.length<6){showToast('Digite todos os 6 dígitos.','error');return;}

  var reg=_pendingRegister;
  if(!reg){showToast('Sessão expirada. Tente criar a conta novamente.','error');return;}

  if(supabase&&reg.id){
    try{
      var res=await supabase.rpc('fn_validar_codigo',{p_usuario_id:reg.id,p_codigo:entered});
      if(!res.data){
        showToast('Código inválido ou expirado.','error');
        for(var i=0;i<6;i++){var ci=document.getElementById('c'+i);if(ci){ci.value='';ci.classList.remove('filled');}}
        var c0=document.getElementById('c0');if(c0)c0.focus();
        return;
      }
    }catch(e){
      showToast('Erro ao verificar código.','error');return;
    }
  }else{
    showToast('Serviço indisponível.','error');return;
  }

  document.getElementById('verifyOverlay').classList.remove('open');
  _pendingRegister=null;
  showToast('✅ Conta confirmada!','success');
  fazerLogin({nome:reg.nome,email:reg.email,nivel:reg.nivel,avatar:'',id:reg.id});
}

function resendCode(){
  if(_pendingRegister&&_pendingRegister.id&&supabase){
    _mostrarVerificacao(_pendingRegister.id,_pendingRegister.email);
  }else{
    showToast('Sessão expirada. Tente criar a conta novamente.','error');
  }
}

function showForgot(){
  showToast('📧 Contate: cibericlab@gmail.com para redefinir sua senha.','info');
}

function moveCode(el,n){
  el.classList.toggle('filled',el.value.length>0);
  if(el.value.length===1&&n>=0&&n<6){var nx=document.getElementById('c'+n);if(nx)nx.focus();}
}
function backCode(el,e,p){
  if(e.key==='Backspace'&&el.value===''&&p>=0){var pv=document.getElementById('c'+p);if(pv)pv.focus();}
}

async function fazerLogin(user){
  // Buscar nível real no banco se disponível
  if(supabase&&user.email&&!user.id){
    try{
      var r=await supabase.from('usuarios')
        .select('id,nome,nivel,status').eq('email',user.email).eq('status','ativo').maybeSingle();
      if(r.data){user.nivel=r.data.nivel;user.id=r.data.id;user.nome=_sanitize(r.data.nome)||user.nome;}
    }catch(e){}
  }

  currentUser={
    id:user.id||null,
    nome:_sanitize(user.nome||''),
    email:_sanitize(user.email||''),
    nivel:user.nivel||'candidato',
    avatar:user.avatar||''
  };

  // Fechar overlay de login com fade
  var lo=document.getElementById('loginOverlay');
  if(lo){
    lo.style.transition='opacity .3s';
    lo.style.opacity='0';
    setTimeout(function(){lo.style.display='none';lo.style.opacity='1';},320);
  }

  // Atualizar sidebar
  var ini=(currentUser.nome||'?').split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2).toUpperCase();
  var av=document.getElementById('sidebarAvatar');
  if(av){
    if(currentUser.avatar&&currentUser.avatar.startsWith('https://')){
      av.innerHTML='<img src="'+currentUser.avatar+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="avatar">';
    }else{
      av.textContent=ini;
    }
  }
  var sn=document.getElementById('sidebarNome');
  if(sn)sn.textContent=currentUser.nome;

  var rl={superadmin:'SuperAdmin',admin:'Admin',supervisor:'Supervisor',recrutador:'Recrutador',candidato:'Candidato'};
  var rc={superadmin:'r-sa',admin:'r-ad',supervisor:'r-sv',recrutador:'r-rc',candidato:'r-ca'};
  var rb=document.getElementById('sidebarRoleBadge');
  if(rb){rb.textContent=rl[currentUser.nivel]||currentUser.nivel;rb.className='ui-role '+(rc[currentUser.nivel]||'r-ca');}

  // Salvar sessão
  var sessData=JSON.stringify({nome:currentUser.nome,email:currentUser.email,nivel:currentUser.nivel,avatar:currentUser.avatar});
  var remEl=document.getElementById('rememberMe');
  if(remEl&&remEl.checked){localStorage.setItem('vp_sess',sessData);}
  else{sessionStorage.setItem('vp_sess',sessData);}

  applyPerms(currentUser.nivel);
  navTo('dashboard',document.getElementById('nav-dashboard'));
  renderDashboard();filtrarVagas();
  showToast('✅ Bem-vindo(a), '+currentUser.nome+'!','success');
}

function signOutGoogle(){
  sessionStorage.removeItem('vp_sess');
  localStorage.removeItem('vp_sess');
  localStorage.removeItem('vp_rem');
  currentUser=null;
  if(typeof gapi!=='undefined'&&gapi.auth2){
    try{gapi.auth2.getAuthInstance().signOut();}catch(e){}
  }
  if(supabase){try{supabase.auth.signOut();}catch(e){}}
  window.location.reload();
}


function applyPerms(nivel){
  const perms={
    superadmin:['dashboard','vagas','cadastrar','favoritos','meus-interesses','kanban','curriculo','interessados','perfil-rec','empresas','alertas','usuarios','noticias','configuracoes','supabase'],
    admin:['dashboard','vagas','cadastrar','favoritos','kanban','interessados','perfil-rec','empresas','alertas','usuarios','noticias','configuracoes'],
    supervisor:['dashboard','vagas','favoritos','kanban','interessados','alertas','noticias','configuracoes'],
    recrutador:['dashboard','vagas','cadastrar','kanban','perfil-rec','alertas','noticias'],
    candidato:['dashboard','vagas','favoritos','meus-interesses','kanban','curriculo','alertas','noticias'],
  };
  const allowed=perms[nivel]||perms.candidato;
  Object.keys(PAGE_TITLES).forEach(page=>{const ne=document.getElementById('nav-'+page);if(ne)ne.classList.toggle('hidden-nav',!allowed.includes(page));});
  const canAdd=['superadmin','admin','recrutador'].includes(nivel);
  document.getElementById('btnNovaVaga').style.display=canAdd?'flex':'none';
  const canExp=['superadmin','admin','supervisor','recrutador'].includes(nivel);
  document.getElementById('btnExpCSV').style.display=canExp?'flex':'none';
  document.getElementById('btnExpPDF').style.display=canExp?'flex':'none';
  document.getElementById('nb-vagas').textContent=vagasLocal.filter(v=>v.status!=='encerrado').length;
  document.getElementById('nb-cand').textContent=CANDS_MOCK.length;
}

function showFeedbackBanner(){document.getElementById('feedbackBannerDash').style.display='flex';document.getElementById('mainContent').scrollTo(0,0);}

// ===== DASHBOARD =====
function renderDashboard(){
  const aberto=vagasLocal.filter(v=>v.status==='aberto').length;
  const urgente=vagasLocal.filter(v=>v.status==='urgente').length;
  const nivel=currentUser?.nivel||'candidato';
  let html='';
  if(['superadmin','admin','supervisor'].includes(nivel)){
    html=`<div class="stat-card blue"><div class="stat-lbl">Vagas em Aberto</div><div class="stat-val">${aberto}</div><div class="stat-chg">↑ 3 esta semana</div><div class="stat-ico">💼</div></div><div class="stat-card green"><div class="stat-lbl">Urgentes</div><div class="stat-val">${urgente}</div><div class="stat-chg">Alta prioridade</div><div class="stat-ico">🔥</div></div><div class="stat-card amber"><div class="stat-lbl">Candidatos</div><div class="stat-val">${CANDS_MOCK.length}</div><div class="stat-ico">👥</div></div><div class="stat-card purple"><div class="stat-lbl">Total Interesses</div><div class="stat-val">${vagasLocal.reduce((a,v)=>a+v.interessados,0)}</div><div class="stat-ico">⭐</div></div>`;
  }else if(nivel==='recrutador'){
    html=`<div class="stat-card blue"><div class="stat-lbl">Vagas Ativas</div><div class="stat-val">${aberto+urgente}</div><div class="stat-ico">💼</div></div><div class="stat-card green"><div class="stat-lbl">Candidatos</div><div class="stat-val">${CANDS_MOCK.length}</div><div class="stat-ico">👥</div></div><div class="stat-card amber"><div class="stat-lbl">Urgentes</div><div class="stat-val">${urgente}</div><div class="stat-ico">🔥</div></div>`;
  }else{
    const favs=vagasLocal.filter(v=>v.favorito).length;
    const ints=vagasLocal.filter(v=>v.interesse).length;
    html=`<div class="stat-card blue"><div class="stat-lbl">Vagas Disponíveis</div><div class="stat-val">${aberto+urgente}</div><div class="stat-ico">💼</div></div><div class="stat-card green"><div class="stat-lbl">Favoritos</div><div class="stat-val">${favs}</div><div class="stat-ico">♥</div></div><div class="stat-card amber"><div class="stat-lbl">Meus Interesses</div><div class="stat-val">${ints}</div><div class="stat-ico">⭐</div></div><div class="stat-card purple"><div class="stat-lbl">Urgentes</div><div class="stat-val">${urgente}</div><div class="stat-ico">🔥</div></div>`;
  }
  document.getElementById('dashStats').innerHTML=html;
  document.getElementById('donutTotal').textContent=vagasLocal.length;
  const meses=['Jan','Fev','Mar','Abr','Mai','Jun','Jul'];const vals=[4,6,5,8,7,10,vagasLocal.length];const mx=Math.max(...vals);
  document.getElementById('barChart').innerHTML=vals.map((v,i)=>`<div class="bar-item"><div class="bar-val">${v}</div><div class="bar" style="height:${Math.round(v/mx*75)+8}px;"></div><div class="bar-lbl">${meses[i]}</div></div>`).join('');
  document.getElementById('recentesDash').innerHTML=vagasLocal.slice(0,4).map(v=>`<div style="background:white;border:1.5px solid var(--g200);border-radius:9px;padding:10px 13px;display:flex;align-items:center;gap:9px;cursor:pointer;transition:all .18s;" onclick="abrirModal(${v.id})" onmouseenter="this.style.borderColor='var(--accent)'" onmouseleave="this.style.borderColor='var(--g200)'"><div style="font-size:18px;">${v.logo}</div><div style="flex:1;min-width:0;"><div style="font-size:12.5px;font-weight:800;color:var(--g900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${v.titulo}</div><div style="font-size:10.5px;color:var(--g400);">${v.empresa} · ${v.cidade}</div></div><span class="badge ${sBadge(v.status)}">${sLabel(v.status)}</span></div>`).join('');
  setTimeout(renderTopRecrutador,80);
}

// ===== VAGAS =====
function renderVagas(lista){
  const g=document.getElementById('vagasGrid');
  const cnt=document.getElementById('vagasCount');
  if(cnt)cnt.textContent=lista.length;
  document.getElementById('nb-vagas').textContent=vagasLocal.filter(v=>v.status!=='encerrado').length;
  if(!lista.length){g.innerHTML='<div class="empty-state" style="grid-column:1/-1;"><div class="empty-ico">🔍</div><div class="empty-ttl">Nenhuma vaga encontrada</div><div class="empty-desc">Ajuste os filtros para encontrar oportunidades</div></div>';return;}
  g.innerHTML=lista.map(v=>cardVaga(v)).join('');
}

function cardVaga(v){
  const isRec=['superadmin','admin','recrutador'].includes(currentUser?.nivel);
  return `<div class="vaga-card" onclick="abrirModal(${v.id})">
    <div class="vaga-badges">${v.status==='urgente'?'<span class="badge badge-amber">🔥 Urgente</span>':''}<span class="badge ${sBadge(v.status)}">${sLabel(v.status)}</span></div>
    <div class="vaga-card-header"><div class="vaga-logo">${v.logo}</div><div class="vaga-info"><div class="vaga-titulo">${v.titulo}</div><div class="vaga-empresa">${v.empresa}</div></div></div>
    ${v.destaque?`<div class="vaga-destaque">"${v.destaque}"</div>`:''}
    <div class="vaga-meta"><div class="vaga-meta-item">📍 ${v.cidade}–${v.estado}</div><div class="vaga-meta-item">⏱ ${v.jornada}</div><div class="vaga-meta-item">📋 ${v.tipo}</div></div>
    ${v.salario?`<div class="vaga-sal">${v.salario}</div>`:''}
    <div class="vaga-tags"><span class="tag">${v.setor}</span><span class="tag">${v.tipo}</span></div>
    <div class="vaga-footer">
      <div style="display:flex;flex-direction:column;gap:2px;">
        <div class="vaga-dias">📅 ${v.dias===0?'Hoje':v.dias===1?'Ontem':`há ${v.dias} dias`}</div>
        ${v.criado_por?`<div style="font-size:9.5px;color:var(--g400);">✍️ ${v.criado_por}</div>`:''}
      </div>
      <div class="vaga-actions" onclick="event.stopPropagation()">
        ${isRec?`<div style="display:flex;align-items:center;gap:4px;">
          <span style="font-size:10.5px;color:var(--g400);">👥 ${v.interessados}${v.max_candidatos?'/'+v.max_candidatos:''}</span>
          ${v.max_candidatos&&v.interessados>=v.max_candidatos*0.9?'<span class="badge badge-red" style="font-size:9px;">⚠️ Limite</span>':''}
        </div>`:''}
        ${!isRec?`<button class="btn-icon fav ${v.favorito?'on':''}" onclick="toggleFav(${v.id})" title="Favoritar">♥</button>`:''}
        ${!isRec?`<button class="btn-icon int ${v.interesse?'on':''}" onclick="toggleInteresse(${v.id})" title="Tenho interesse">⭐</button>`:''}
        ${isRec?`<button class="btn-icon" onclick="event.stopPropagation();editarVaga(${v.id})" title="Editar vaga" style="color:var(--accent);">✏️</button><button class="btn-icon" onclick="event.stopPropagation();removerVaga(${v.id})" title="Remover vaga" style="color:var(--red);">🗑️</button>`:''}
        <button class="btn-icon" onclick="compartilharWACard(${v.id})" title="WhatsApp">📱</button>
        <button class="btn-icon" onclick="compartilharEmailCard(${v.id})" title="E-mail">✉</button>
      </div>
    </div>
  </div>`;
}

function sBadge(s){return s==='aberto'?'badge-green':s==='urgente'?'badge-amber':'badge-gray';}
function sLabel(s){return s==='aberto'?'Em Aberto':s==='urgente'?'Urgente':'Encerrado';}

// ===== MODAL =====
function abrirModal(id){
  const v=vagasLocal.find(x=>x.id===id);if(!v)return;vagaAtual=v;
  document.getElementById('ml-logo').textContent=v.logo;
  document.getElementById('ml-titulo').textContent=v.titulo;
  document.getElementById('ml-empresa').textContent=v.empresa;
  document.getElementById('ml-badge').className='badge '+sBadge(v.status);
  document.getElementById('ml-badge').textContent=sLabel(v.status);
  document.getElementById('ml-meta').innerHTML=[`<span class="badge badge-gray">📍 ${v.cidade}–${v.estado}</span>`,`<span class="badge badge-gray">⏱ ${v.jornada}</span>`,`<span class="badge badge-gray">📋 ${v.tipo}</span>`,`<span class="badge badge-gray">🏢 ${v.setor}</span>`,v.salario?`<span class="badge badge-green">💰 ${v.salario}</span>`:'',`<span class="badge badge-sky">👥 ${v.interessados} interessados</span>`].join('');
  const dest=document.getElementById('ml-destaque');if(v.destaque){dest.style.display='block';dest.textContent='"'+v.destaque+'"';}else{dest.style.display='none';}
  document.getElementById('ml-req').innerHTML=v.requisitos.map(r=>`<li>${r}</li>`).join('');
  document.getElementById('ml-atv').innerHTML=v.atividades.map(a=>`<li>${a}</li>`).join('');
  document.getElementById('ml-ben').innerHTML=v.beneficios.map(b=>`<li>${b}</li>`).join('');
  document.getElementById('ml-contato').textContent=v.whatsapp||v.email||'–';
  document.getElementById('ml-local').textContent=`📍 ${v.cidade}, ${v.estado}`;
  const isRec=['superadmin','admin','recrutador'].includes(currentUser?.nivel);
  const btn=document.getElementById('btnModalInt');
  if(isRec){btn.style.display='none';document.getElementById('ml-int-info').innerHTML=`<div class="hl hl-green" style="font-size:12px;">👥 <strong>${v.interessados} candidatos</strong> interessados nesta vaga.</div>`;}
  else{btn.style.display='flex';btn.textContent=v.interesse?'✅ Interesse Enviado':'⭐ Tenho Interesse';btn.className='btn btn-'+(v.interesse?'green':'ghost')+' btn-sm';document.getElementById('ml-int-info').innerHTML='';}
  document.getElementById('modalVaga').classList.add('open');
}
function fecharModal(){document.getElementById('modalVaga').classList.remove('open');}
document.getElementById('modalVaga').addEventListener('click',function(e){if(e.target===this)fecharModal();});

function toggleInteresseModal(){if(!vagaAtual)return;toggleInteresse(vagaAtual.id);const v=vagasLocal.find(x=>x.id===vagaAtual.id);const btn=document.getElementById('btnModalInt');btn.textContent=v.interesse?'✅ Interesse Enviado':'⭐ Tenho Interesse';btn.className='btn btn-'+(v.interesse?'green':'ghost')+' btn-sm';}

// ===== FAV & INTERESSE =====
function toggleFav(id){const v=vagasLocal.find(x=>x.id===id);if(v)v.favorito=!v.favorito;document.getElementById('nb-fav').textContent=vagasLocal.filter(x=>x.favorito).length;filtrarVagas();showToast(v.favorito?'♥ Adicionado aos favoritos!':'Removido dos favoritos',v.favorito?'success':'');}
function toggleInteresse(id){
  const v=vagasLocal.find(x=>x.id===id);if(!v)return;
  if(!v.interesse){v.interesse=true;v.interessados++;document.getElementById('nb-int').textContent=vagasLocal.filter(x=>x.interesse).length;filtrarVagas();showToast('⭐ Interesse enviado! Seus dados serão encaminhados à empresa responsável pela vaga.','success');checkLimites();}
  else{v.interesse=false;v.interessados--;document.getElementById('nb-int').textContent=vagasLocal.filter(x=>x.interesse).length;filtrarVagas();showToast('Interesse removido.','');}
}
function renderFavoritos(){const g=document.getElementById('favGrid');const favs=vagasLocal.filter(v=>v.favorito);document.getElementById('favCount').textContent=favs.length+' salvas';document.getElementById('nb-fav').textContent=favs.length;if(!favs.length){g.innerHTML='<div class="empty-state" style="grid-column:1/-1;"><div class="empty-ico">♥</div><div class="empty-ttl">Nenhum favorito ainda</div><div class="empty-desc">Marque vagas com ♥</div></div>';return;}g.innerHTML=favs.map(v=>cardVaga(v)).join('');}
function renderInteresses(){const g=document.getElementById('interesseGrid');const ints=vagasLocal.filter(v=>v.interesse);document.getElementById('nb-int').textContent=ints.length;if(!ints.length){g.innerHTML='<div class="empty-state" style="grid-column:1/-1;"><div class="empty-ico">⭐</div><div class="empty-ttl">Nenhum interesse ainda</div><div class="empty-desc">Clique em ⭐ nas vagas para demonstrar interesse</div></div>';return;}g.innerHTML=ints.map(v=>cardVaga(v)).join('');}

// ===== FILTERS =====
function filtrarVagas(){
  const q=(document.getElementById('globalSearch')?.value||'').toLowerCase();
  const st=(document.getElementById('filtroStatus')?.value||'');
  const tp=(document.getElementById('filtroTipo')?.value||'');
  const se=(document.getElementById('filtroSetor')?.value||'');
  const lc=(document.getElementById('filtroLocal')?.value||'').toLowerCase();
  const ord=(document.getElementById('filtroOrdem')?.value||'recente');
  let res=vagasLocal.filter(v=>{const txt=(v.titulo+v.empresa+v.cidade+v.setor+v.tipo).toLowerCase();return(!q||txt.includes(q))&&(!st||v.status===st)&&(!tp||v.tipo===tp)&&(!se||v.setor===se)&&(!lc||(v.cidade+v.estado).toLowerCase().includes(lc));});
  if(ord==='titulo')res.sort((a,b)=>a.titulo.localeCompare(b.titulo));
  else if(ord==='interesse')res.sort((a,b)=>b.interessados-a.interessados);
  else if(ord==='salario')res.sort((a,b)=>{const pa=parseFloat((a.salario||'').replace(/[^\d,]/g,'').replace(',','.'));const pb=parseFloat((b.salario||'').replace(/[^\d,]/g,'').replace(',','.'));return pb-pa;});
  else res.sort((a,b)=>a.dias-b.dias);
  renderVagas(res);
}
function limparFiltros(){['filtroStatus','filtroTipo','filtroSetor'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});const fl=document.getElementById('filtroLocal');if(fl)fl.value='';document.getElementById('globalSearch').value='';document.getElementById('filtroOrdem').value='recente';filtrarVagas();}

// ===== TAGS =====
function addTag(e,field){
  if(e.key!=='Enter')return;const inp=e.target;const val=inp.value.trim();if(!val)return;
  tagsData[field].push(val);
  const wm={req:'reqWrap',atv:'atvWrap',ben:'benWrap',cvHabil:'cvHabilWrap'};
  const wrap=document.getElementById(wm[field]);
  const tagEl=document.createElement('div');tagEl.className='ti';
  tagEl.innerHTML=`${val}<button type="button" onclick="removeTag(this,'${field}','${val.replace(/'/g,"\\'")}')">×</button>`;
  wrap.insertBefore(tagEl,inp);inp.value='';
  if(field==='cvHabil')updateCVPreview();
}
function removeTag(btn,field,val){tagsData[field]=tagsData[field].filter(x=>x!==val);btn.parentElement.remove();if(field==='cvHabil')updateCVPreview();}

// ===== IA VAGA =====
async function processarIA(){
  const texto=document.getElementById('iaTexto').value.trim();
  if(!texto){showToast('Cole o texto de uma vaga!','error');return;}
  document.getElementById('iaLoading').classList.add('active');
  const prompt=`Analise o texto de vaga abaixo e extraia as informações em JSON com os campos: titulo, empresa, setor, tipo (CLT/PJ/Estágio/Freelance), cidade, estado, salario, jornada, destaque, requisitos (array), atividades (array), beneficios (array), whatsapp, email, status (aberto/urgente). Retorne SOMENTE JSON sem markdown.\n\nTexto:\n${texto}`;
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:prompt}]})});
    const data=await r.json();
    const txt=(data.content?.[0]?.text||'').replace(/```json|```/g,'').trim();
    const p=JSON.parse(txt);
    ['titulo','empresa','destaque','cidade','salario','jornada','whatsapp','email'].forEach(k=>{const el=document.getElementById('f-'+k);if(el)el.value=p[k]||'';});
    ['setor','tipo','estado','status'].forEach(k=>{const el=document.getElementById('f-'+k);if(el&&p[k])el.value=p[k];});
    ['req','atv','ben'].forEach(field=>{
      tagsData[field]=[];const wm={req:'reqWrap',atv:'atvWrap',ben:'benWrap'};const wrap=document.getElementById(wm[field]);wrap.querySelectorAll('.ti').forEach(t=>t.remove());const inp=wrap.querySelector('input');
      const km={req:'requisitos',atv:'atividades',ben:'beneficios'};
      (p[km[field]]||[]).forEach(val=>{tagsData[field].push(val);const tagEl=document.createElement('div');tagEl.className='ti';tagEl.innerHTML=`${val}<button type="button" onclick="removeTag(this,'${field}','${val.replace(/'/g,"\\'")}')">×</button>`;wrap.insertBefore(tagEl,inp);});
    });
    document.getElementById('iaResultBox').style.display='block';
    showToast('✅ IA extraiu as informações!','success');
  }catch(err){showToast('Erro na IA. Verifique a conexão.','error');}
  finally{document.getElementById('iaLoading').classList.remove('active');}
}
function previewImagem(input){if(input.files[0]){const area=document.getElementById('uploadArea');area.innerHTML=`<div class="upload-ico">✅</div><div class="upload-txt">${input.files[0].name}</div><div class="upload-sub">Clique em "Extrair com IA"</div>`;showToast('Imagem carregada!','success');}}
function limparIA(){document.getElementById('iaTexto').value='';document.getElementById('uploadArea').innerHTML='<div class="upload-ico">🖼️</div><div class="upload-txt">Upload de Imagem</div><div class="upload-sub">PNG, JPG – IA extrai tudo</div>';document.getElementById('iaResultBox').style.display='none';}
function salvarVaga(){
  const titulo=document.getElementById('f-titulo').value.trim();const empresa=document.getElementById('f-empresa').value.trim();
  if(!titulo||!empresa){showToast('Preencha Título e Empresa!','error');return;}
  const nova={id:Date.now(),titulo,empresa,setor:document.getElementById('f-setor').value,tipo:document.getElementById('f-tipo').value,cidade:document.getElementById('f-cidade').value,estado:document.getElementById('f-estado').value,salario:document.getElementById('f-salario').value,jornada:document.getElementById('f-jornada').value,destaque:document.getElementById('f-destaque').value,requisitos:[...tagsData.req],atividades:[...tagsData.atv],beneficios:[...tagsData.ben],whatsapp:document.getElementById('f-whatsapp').value,email:document.getElementById('f-email').value,status:document.getElementById('f-status').value,logo:'💼',dias:0,favorito:false,interesse:false,interessados:0};
  vagasLocal.unshift(nova);showToast('✅ Vaga cadastrada!','success');limparForm();navTo('vagas',document.getElementById('nav-vagas'));
}
function limparForm(){['f-titulo','f-empresa','f-destaque','f-cidade','f-salario','f-jornada','f-whatsapp','f-email'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});['req','atv','ben'].forEach(field=>{tagsData[field]=[];const wm={req:'reqWrap',atv:'atvWrap',ben:'benWrap'};const w=document.getElementById(wm[field]);if(w)w.querySelectorAll('.ti').forEach(t=>t.remove());});document.getElementById('iaResultBox').style.display='none';document.getElementById('iaTexto').value='';}

// ===== CURRÍCULO COM IA =====
let cvExpCount=0, cvEduCount=0;

function addExp(){
  cvExpCount++;
  const id='exp'+cvExpCount;
  const div=document.createElement('div');
  div.id=id;div.style.cssText='background:var(--g50);border:1.5px solid var(--g200);border-radius:var(--r-sm);padding:12px;margin-bottom:10px;';
  div.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-size:12px;font-weight:700;color:var(--g700);">Experiência ${cvExpCount}</span><button class="btn btn-ghost btn-xs" onclick="document.getElementById('${id}').remove();updateCVPreview()">✕</button></div><div class="form-grid"><div class="form-group"><label class="form-lbl">Cargo/Função</label><input type="text" class="fi exp-cargo" placeholder="Ex: Cozinheiro" oninput="updateCVPreview()"></div><div class="form-group"><label class="form-lbl">Empresa</label><input type="text" class="fi exp-empresa" placeholder="Ex: Restaurante Bella" oninput="updateCVPreview()"></div><div class="form-group"><label class="form-lbl">Período</label><input type="text" class="fi exp-periodo" placeholder="Jan/2022 – Dez/2023" oninput="updateCVPreview()"></div><div class="form-group full"><label class="form-lbl">Descrição</label><textarea class="ft exp-desc" rows="2" placeholder="Principais responsabilidades e conquistas..." oninput="updateCVPreview()" style="height:60px;"></textarea></div></div>`;
  document.getElementById('expList').appendChild(div);
}

function addEdu(){
  cvEduCount++;
  const id='edu'+cvEduCount;
  const div=document.createElement('div');
  div.id=id;div.style.cssText='background:var(--g50);border:1.5px solid var(--g200);border-radius:var(--r-sm);padding:12px;margin-bottom:10px;';
  div.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-size:12px;font-weight:700;color:var(--g700);">Formação ${cvEduCount}</span><button class="btn btn-ghost btn-xs" onclick="document.getElementById('${id}').remove();updateCVPreview()">✕</button></div><div class="form-grid"><div class="form-group"><label class="form-lbl">Curso / Nível</label><input type="text" class="fi edu-curso" placeholder="Ex: Ensino Médio Completo" oninput="updateCVPreview()"></div><div class="form-group"><label class="form-lbl">Instituição</label><input type="text" class="fi edu-inst" placeholder="Ex: Escola Est. Marechal" oninput="updateCVPreview()"></div><div class="form-group"><label class="form-lbl">Ano de conclusão</label><input type="text" class="fi edu-ano" placeholder="Ex: 2020" oninput="updateCVPreview()"></div></div>`;
  document.getElementById('eduList').appendChild(div);
}

function previewFotoCV(input){
  if(input.files[0]){
    const reader=new FileReader();
    reader.onload=e=>{
      cvFotoData=e.target.result;
      document.getElementById('fotoCVPreview').innerHTML=`<img src="${e.target.result}"><div class="avatar-overlay">📷</div>`;
      updateCVPreview();
    };reader.readAsDataURL(input.files[0]);
  }
}

function updateCVPreview(){
  const nome=document.getElementById('cv-nome')?.value||'';
  const cargo=document.getElementById('cv-cargo')?.value||'';
  const email=document.getElementById('cv-email')?.value||'';
  const tel=document.getElementById('cv-tel')?.value||'';
  const cidade=document.getElementById('cv-cidade')?.value||'';
  const linkedin=document.getElementById('cv-linkedin')?.value||'';
  const resumo=document.getElementById('cv-resumo')?.value||'';
  const idiomas=document.getElementById('cv-idiomas')?.value||'';
  const cursos=document.getElementById('cv-cursos')?.value||'';

  const expItems=Array.from(document.querySelectorAll('[id^="exp"]')).map(el=>({
    cargo:el.querySelector('.exp-cargo')?.value||'',empresa:el.querySelector('.exp-empresa')?.value||'',periodo:el.querySelector('.exp-periodo')?.value||'',desc:el.querySelector('.exp-desc')?.value||''
  })).filter(e=>e.cargo);

  const eduItems=Array.from(document.querySelectorAll('[id^="edu"]')).map(el=>({
    curso:el.querySelector('.edu-curso')?.value||'',inst:el.querySelector('.edu-inst')?.value||'',ano:el.querySelector('.edu-ano')?.value||''
  })).filter(e=>e.curso);

  const habilidades=tagsData.cvHabil||[];
  const fotoHTML=cvFotoData?`<img src="${cvFotoData}" class="cv-photo" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid var(--accent);">`:`<div class="cv-photo" style="width:72px;height:72px;border-radius:50%;background:var(--g100);display:flex;align-items:center;justify-content:center;font-size:28px;">👤</div>`;

  const contatos=[email&&`📧 ${email}`,tel&&`📱 ${tel}`,cidade&&`📍 ${cidade}`,linkedin&&`🔗 ${linkedin}`].filter(Boolean);

  const html=`<div class="cv-header-section">
    ${fotoHTML}
    <div class="cv-name-block">
      <div class="cv-fullname">${nome||'Seu Nome Completo'}</div>
      <div class="cv-cargo">${cargo||'Cargo Desejado'}</div>
      <div class="cv-contacts">${contatos.map(c=>`<div class="cv-contact-item">${c}</div>`).join('')}</div>
    </div>
  </div>
  ${resumo?`<div class="cv-section-title">Resumo Profissional</div><div class="cv-body-text">${resumo}</div>`:''}
  ${expItems.length?`<div class="cv-section-title">Experiência Profissional</div>${expItems.map(e=>`<div class="cv-exp-item"><div class="cv-exp-title">${e.cargo}</div><div class="cv-exp-empresa">${e.empresa}</div><div class="cv-exp-periodo">${e.periodo}</div>${e.desc?`<div class="cv-exp-desc">${e.desc}</div>`:''}</div>`).join('')}`:''}
  ${eduItems.length?`<div class="cv-section-title">Formação Acadêmica</div>${eduItems.map(e=>`<div class="cv-edu-item"><div><div class="cv-edu-title">${e.curso}</div><div class="cv-edu-inst">${e.inst}</div></div><div class="cv-edu-ano">${e.ano}</div></div>`).join('')}`:''}
  ${habilidades.length?`<div class="cv-section-title">Habilidades</div><div class="cv-skills-grid">${habilidades.map(h=>`<span class="cv-skill-tag">${h}</span>`).join('')}</div>`:''}
  ${idiomas?`<div class="cv-section-title">Idiomas</div><div class="cv-body-text">${idiomas}</div>`:''}
  ${cursos?`<div class="cv-section-title">Cursos e Certificações</div><div class="cv-body-text">${cursos}</div>`:''}
  <div class="cv-refs">Referências disponíveis mediante solicitação</div>`;

  const preview=document.getElementById('cvPagePreview');
  if(preview)preview.innerHTML=html;
}

async function processarCVIA(){
  const texto=document.getElementById('cvIaInput')?.value.trim();
  if(!texto){showToast('Descreva sua experiência para a IA!','error');return;}
  const load=document.getElementById('cvIaLoad');load.classList.add('active');
  const prompt=`Você é um especialista em criação de currículos profissionais. Com base na descrição abaixo, extraia e organize as informações em JSON com os campos: nome, cargo, email, tel, cidade, resumo (parágrafo profissional de 2-3 linhas), experiencias (array com: cargo, empresa, periodo, desc), educacao (array com: curso, inst, ano), habilidades (array de strings), idiomas, cursos. Complete com detalhes profissionais relevantes onde faltar informação. Retorne SOMENTE JSON sem markdown.\n\nDescrição:\n${texto}`;
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1200,messages:[{role:'user',content:prompt}]})});
    const data=await r.json();
    const txt=(data.content?.[0]?.text||'').replace(/```json|```/g,'').trim();
    const p=JSON.parse(txt);
    if(p.nome)document.getElementById('cv-nome').value=p.nome;
    if(p.cargo)document.getElementById('cv-cargo').value=p.cargo;
    if(p.email)document.getElementById('cv-email').value=p.email;
    if(p.tel)document.getElementById('cv-tel').value=p.tel;
    if(p.cidade)document.getElementById('cv-cidade').value=p.cidade;
    if(p.resumo)document.getElementById('cv-resumo').value=p.resumo;
    if(p.idiomas)document.getElementById('cv-idiomas').value=p.idiomas;
    if(p.cursos)document.getElementById('cv-cursos').value=p.cursos;
    if(p.habilidades){tagsData.cvHabil=[];const wrap=document.getElementById('cvHabilWrap');wrap.querySelectorAll('.ti').forEach(t=>t.remove());const inp=wrap.querySelector('input');p.habilidades.forEach(val=>{tagsData.cvHabil.push(val);const tagEl=document.createElement('div');tagEl.className='ti';tagEl.innerHTML=`${val}<button type="button" onclick="removeTag(this,'cvHabil','${val.replace(/'/g,"\\'")}')">×</button>`;wrap.insertBefore(tagEl,inp);});}
    if(p.experiencias){document.getElementById('expList').innerHTML='';cvExpCount=0;p.experiencias.forEach(e=>{addExp();const items=document.querySelectorAll('[id^="exp"]');const last=items[items.length-1];if(last){last.querySelector('.exp-cargo').value=e.cargo||'';last.querySelector('.exp-empresa').value=e.empresa||'';last.querySelector('.exp-periodo').value=e.periodo||'';last.querySelector('.exp-desc').value=e.desc||'';}}); }
    if(p.educacao){document.getElementById('eduList').innerHTML='';cvEduCount=0;p.educacao.forEach(e=>{addEdu();const items=document.querySelectorAll('[id^="edu"]');const last=items[items.length-1];if(last){last.querySelector('.edu-curso').value=e.curso||'';last.querySelector('.edu-inst').value=e.inst||'';last.querySelector('.edu-ano').value=e.ano||'';}}); }
    updateCVPreview();
    showToast('✅ IA gerou seu currículo!','success');
  }catch(err){showToast('Erro na IA.','error');}
  finally{load.classList.remove('active');}
}

async function gerarCVComIA(){
  const nome=document.getElementById('cv-nome')?.value||'';
  const cargo=document.getElementById('cv-cargo')?.value||'';
  const resumo=document.getElementById('cv-resumo')?.value||'';
  if(!nome&&!resumo){showToast('Preencha ao menos nome e resumo para melhorar com IA!','warning');return;}
  const input=document.getElementById('cvIaInput');
  if(input)input.value=`Nome: ${nome}. Cargo desejado: ${cargo}. Sobre mim: ${resumo}`;
  processarCVIA();
}

function exportarCVPDF(){
  const nome=document.getElementById('cv-nome')?.value||'curriculo';
  updateCVPreview();
  try{
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({format:'a4',unit:'mm'});
    const content=document.getElementById('cvPagePreview');
    if(!content){showToast('Preencha o currículo primeiro!','error');return;}
    // Use html2canvas approach via jsPDF html
    doc.html(content,{
      callback:function(d){d.save(nome.replace(/\s+/g,'_')+'_curriculo.pdf');showToast('✅ Currículo exportado em PDF!','success');},
      x:10,y:10,width:190,windowWidth:794,autoPaging:'text',margin:[10,10,10,10]
    });
  }catch(e){
    // Fallback: print
    const printWin=window.open('','_blank','width=900,height=700');
    const content=document.getElementById('cvPagePreview')?.innerHTML||'';
    printWin.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Nunito',sans-serif;padding:20mm 18mm;}:root{--accent:#6366f1;}.cv-section-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--accent);margin-bottom:8px;margin-top:14px;}.cv-fullname{font-size:22px;font-weight:800;}.cv-cargo{font-size:13px;font-weight:600;color:var(--accent);margin-bottom:6px;}.cv-body-text{font-size:11.5px;color:#374151;line-height:1.6;}.cv-skill-tag{background:#eef2ff;color:#6366f1;padding:3px 9px;border-radius:999px;font-size:10.5px;font-weight:600;display:inline-block;margin:2px;}.cv-exp-title{font-size:12.5px;font-weight:700;}.cv-exp-empresa{font-size:11px;color:#6366f1;font-weight:600;}.cv-exp-periodo{font-size:10.5px;color:#9ca3af;}.cv-contact-item{font-size:10.5px;color:#475569;display:inline;margin-right:12px;}.cv-refs{font-size:10.5px;color:#9ca3af;font-style:italic;margin-top:12px;text-align:center;border-top:1px solid #e2e8f0;padding-top:8px;}.cv-header-section{display:flex;gap:16px;margin-bottom:14px;padding-bottom:14px;border-bottom:2px solid #6366f1;}.cv-photo{width:68px;height:68px;border-radius:50%;object-fit:cover;border:2px solid #6366f1;}</style></head><body>${content}</body></html>`);
    printWin.document.close();
    printWin.focus();
    setTimeout(()=>{printWin.print();printWin.close();},800);
    showToast('✅ Use Ctrl+P para salvar como PDF','info');
  }
}

// ===== INTERESSADOS =====
function renderInteressados(){
  const statsEl=document.getElementById('recrutadorStats');
  const novos=CANDS_MOCK.filter(c=>c.status==='novo').length;
  const contr=CANDS_MOCK.filter(c=>c.status==='contratado').length;
  statsEl.innerHTML=`<div class="stat-card blue"><div class="stat-lbl">Total Candidatos</div><div class="stat-val">${CANDS_MOCK.length}</div><div class="stat-ico">👥</div></div><div class="stat-card green"><div class="stat-lbl">Novos</div><div class="stat-val">${novos}</div><div class="stat-ico">🆕</div></div><div class="stat-card amber"><div class="stat-lbl">Contratados</div><div class="stat-val">${contr}</div><div class="stat-ico">✅</div></div>`;
  const c=document.getElementById('vagasCandList');
  const vagasC=vagasLocal.filter(v=>CANDS_MOCK.some(x=>x.vaga_id===v.id)).sort((a,b)=>b.interessados-a.interessados);
  const sLabels={novo:'Novo',contato:'Contato feito',entrevista:'Entrevista',contratado:'Contratado',encerrado:'Encerrado'};
  const sCls={novo:'badge-blue',contato:'badge-green',entrevista:'badge-amber',contratado:'badge-green',encerrado:'badge-gray'};
  c.innerHTML=vagasC.map(v=>{
    const cands=CANDS_MOCK.filter(x=>x.vaga_id===v.id);
    return `<div style="background:white;border:1.5px solid var(--g200);border-radius:var(--r);padding:18px;margin-bottom:14px;box-shadow:var(--sh);">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;padding-bottom:12px;border-bottom:1.5px solid var(--g100);">
        <div style="font-size:20px;">${v.logo}</div>
        <div style="flex:1;"><div style="font-weight:700;font-size:14px;">${v.titulo}</div><div style="font-size:11.5px;color:var(--g500);">${v.empresa} · ${v.cidade}</div></div>
        <span class="badge badge-blue">${cands.length} candidatos</span>
        <button class="btn btn-ghost btn-sm" onclick="exportarCSVCandidatos(${v.id})">⬇ CSV</button>
      </div>
      ${cands.map(cd=>`<div class="candidato-card">
        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:700;flex-shrink:0;">${cd.nome.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
        <div class="candidato-info">
          <div class="cand-nome">${cd.nome}</div>
          <div class="cand-meta"><span>💼 ${cd.cargo}</span></div>
          <div style="font-size:11px;color:var(--g600);margin-top:3px;">${cd.exp}</div>
          <div style="font-size:10px;color:var(--g400);margin-top:3px;">📅 ${cd.dias===0?'Hoje':cd.dias===1?'Ontem':'há '+cd.dias+' dias'}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:7px;flex-shrink:0;">
          <span class="badge ${sCls[cd.status]}">${sLabels[cd.status]}</span>
          <select style="height:26px;border:1.5px solid var(--g200);border-radius:9px;font-size:10.5px;font-family:inherit;padding:0 7px;outline:none;cursor:pointer;background:white;" onchange="showToast('Status atualizado!','success')">
            <option>Novo</option><option>Contato feito</option><option>Entrevista</option><option>Contratado</option><option>Encerrado</option>
          </select>
          <div style="font-size:9px;color:var(--g300);text-align:right;line-height:1.4;">Dados pessoais<br>encaminhados à empresa</div>
        </div>
      </div>`).join('')}
    </div>`;
  }).join('');
}

// ===== PERFIL RECRUTADOR =====
function recTipoChange(){const tipo=document.getElementById('rec-tipo').value;document.getElementById('rec-cnpj-group').style.display=tipo==='pj'?'flex':'none';document.getElementById('rec-cpf-group').style.display=tipo==='pf'?'flex':'none';}
function maskCNPJ(el){let v=el.value.replace(/\D/g,'');v=v.replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2');el.value=v.slice(0,18);}
function maskCPF(el){let v=el.value.replace(/\D/g,'');v=v.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');el.value=v.slice(0,14);}
function maskCEP(el){let v=el.value.replace(/\D/g,'');v=v.replace(/(\d{5})(\d)/,'$1-$2');el.value=v.slice(0,9);}
async function buscarCNPJ(){const cnpj=document.getElementById('rec-cnpj').value.replace(/\D/g,'');if(cnpj.length!==14)return;showToast('🔍 Buscando CNPJ...','info');try{const r=await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);const d=await r.json();if(d.razao_social){document.getElementById('rec-nome').value=d.razao_social||'';document.getElementById('rec-email').value=d.email||'';document.getElementById('rec-cep').value=d.cep||'';document.getElementById('rec-endereco').value=(d.logradouro||'')+(d.numero?' '+d.numero:'');document.getElementById('rec-bairro').value=d.bairro||'';document.getElementById('rec-cidade').value=d.municipio||'';document.getElementById('rec-estado').value=d.uf||'GO';showToast('✅ Dados do CNPJ preenchidos!','success');}else{showToast('CNPJ não encontrado','error');}}catch(e){showToast('CNPJ não encontrado na BrasilAPI','error');}}
async function buscarCEP(){const cep=document.getElementById('rec-cep').value.replace(/\D/g,'');if(cep.length!==8)return;try{const r=await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);const d=await r.json();if(d.street){document.getElementById('rec-endereco').value=d.street||'';document.getElementById('rec-bairro').value=d.neighborhood||'';document.getElementById('rec-cidade').value=d.city||'';document.getElementById('rec-estado').value=d.state||'GO';showToast('✅ Endereço preenchido!','success');}}catch(e){showToast('CEP não encontrado','error');}}
function previewRecLogo(input){if(input.files[0]){const reader=new FileReader();reader.onload=e=>{document.getElementById('recLogoPreview').innerHTML=`<img src="${e.target.result}" style="width:100%;height:100%;object-fit:contain;border-radius:50%;"><div class="avatar-overlay">📷</div>`;};reader.readAsDataURL(input.files[0]);}}
function salvarPerfilRec(){const nome=document.getElementById('rec-nome').value.trim();if(!nome){showToast('Preencha o nome!','error');return;}document.getElementById('perfilRecNome').textContent=nome;document.getElementById('perfilRecCargo').textContent=document.getElementById('rec-setor').value||'Recrutador';document.getElementById('prs-vagas').textContent=vagasLocal.filter(v=>v.status!=='encerrado').length;document.getElementById('prs-cand').textContent=CANDS_MOCK.length;document.getElementById('prs-dias').textContent=Math.floor(Math.random()*200+30);showToast('✅ Perfil salvo!','success');}

// ===== USERS =====
const USERS_MOCK=[{nome:'Admin Geral',email:'admin@vagaspro.com.br',whatsapp:'(62) 99999-0001',nivel:'superadmin',status:'ativo',cadastro:'01/01/2025'},{nome:'Gestor RH',email:'gestor@vagaspro.com.br',whatsapp:'(62) 98888-1234',nivel:'admin',status:'ativo',cadastro:'15/02/2025'},{nome:'Recrutador Teste',email:'rec@empresa.com.br',whatsapp:'(62) 97777-5678',nivel:'recrutador',status:'ativo',cadastro:'20/03/2025'},{nome:'Supervisor',email:'supervisor@vagaspro.com.br',whatsapp:'(62) 96666-9012',nivel:'supervisor',status:'ativo',cadastro:'01/04/2025'},{nome:'João Candidato',email:'joao@email.com',whatsapp:'(62) 95555-1111',nivel:'candidato',status:'ativo',cadastro:'10/04/2025'},];
function renderUsuarios(){const rl={superadmin:'SuperAdmin',admin:'Admin',supervisor:'Supervisor',recrutador:'Recrutador',candidato:'Candidato'};const rc={superadmin:'badge-blue',admin:'badge-amber',supervisor:'badge-gray',recrutador:'badge-green',candidato:'badge-gray'};document.getElementById('usuariosTableBody').innerHTML=USERS_MOCK.map(u=>`<tr><td><strong>${u.nome}</strong></td><td>${u.email}</td><td>${u.whatsapp}</td><td><span class="badge ${rc[u.nivel]}">${rl[u.nivel]}</span></td><td><span class="badge badge-green">${u.status}</span></td><td>${u.cadastro}</td><td><button class="btn btn-ghost btn-xs" onclick="showToast('Editar usuário em breve!','')">Editar</button></td></tr>`).join('');}

// ===== NEWS =====
const NOTICIAS={rh:[{fonte:'SEBRAE',titulo:'Tendências em recrutamento para 2025',tempo:'2h atrás',url:'https://sebrae.com.br'},{fonte:'Valor Econômico',titulo:'Mercado aquece com alta nas contratações',tempo:'3h atrás',url:'https://valor.com.br'},{fonte:'UOL',titulo:'Home office híbrido adotado por 70% das empresas',tempo:'5h atrás',url:'https://uol.com.br'},{fonte:'Terra',titulo:'Soft skills se tornam critério decisivo em seleção',tempo:'6h atrás',url:'https://terra.com.br'},{fonte:'Olhar Digital',titulo:'IA transforma RH com triagem automatizada',tempo:'8h atrás',url:'https://olhardigital.com.br'},{fonte:'SENAC',titulo:'Novas capacitações em gestão de pessoas disponíveis',tempo:'1d atrás',url:'https://senac.br'},],economia:[{fonte:'Valor Econômico',titulo:'PIB do Brasil cresce no 1º trimestre de 2025',tempo:'1h atrás',url:'https://valor.com.br'},{fonte:'UOL',titulo:'Inflação desacelera, mercado celebra queda dos juros',tempo:'2h atrás',url:'https://uol.com.br'},{fonte:'Terra',titulo:'Emprego formal bate recorde com 2,1 mi de vagas',tempo:'4h atrás',url:'https://terra.com.br'},{fonte:'Olhar Digital',titulo:'Startups captam R$ 3 bi e geram empregos em tech',tempo:'5h atrás',url:'https://olhardigital.com.br'},{fonte:'SEBRAE',titulo:'Micro empresas representam 52% dos empregos',tempo:'1d atrás',url:'https://sebrae.com.br'},],cursos:[{fonte:'SENAI',titulo:'Cursos gratuitos em eletricidade com certificado',tempo:'Hoje',url:'https://senai.br'},{fonte:'SENAC',titulo:'Capacitação gratuita em atendimento ao cliente',tempo:'Hoje',url:'https://senac.br'},{fonte:'SEBRAE',titulo:'Empreendedorismo digital: curso gratuito disponível',tempo:'Hoje',url:'https://sebrae.com.br'},{fonte:'Olhar Digital',titulo:'Google: 25 cursos gratuitos com certificado em 2025',tempo:'2h atrás',url:'https://olhardigital.com.br'},{fonte:'Terra',titulo:'Cursos de informática gratuitos no Pronatec',tempo:'3h atrás',url:'https://terra.com.br'},{fonte:'SENAI',titulo:'Mecânica industrial: vagas abertas para qualificação',tempo:'1d atrás',url:'https://senai.br'},],mercado:[{fonte:'Olhar Digital',titulo:'Tecnologia lidera abertura de vagas em 2025',tempo:'1h atrás',url:'https://olhardigital.com.br'},{fonte:'UOL',titulo:'Saúde e bem-estar crescem 18% em empregos formais',tempo:'2h atrás',url:'https://uol.com.br'},{fonte:'Terra',titulo:'Goiás registra menor desemprego do Centro-Oeste',tempo:'4h atrás',url:'https://terra.com.br'},{fonte:'Valor Econômico',titulo:'Construção civil retoma força com infraestrutura',tempo:'5h atrás',url:'https://valor.com.br'},{fonte:'SEBRAE',titulo:'Alimentação lidera contratações no interior do Brasil',tempo:'8h atrás',url:'https://sebrae.com.br'},]};
function renderNoticias(tab){document.getElementById('newsGrid').innerHTML=(NOTICIAS[tab]||[]).map(n=>`<div class="news-card"><div class="news-src">${n.fonte}</div><div class="news-ttl">${n.titulo}</div><div class="news-time">${n.tempo}</div><a href="${n.url}" target="_blank" rel="noopener noreferrer" class="news-link" onclick="event.stopPropagation()">Acessar fonte ↗</a></div>`).join('');}
function setNewsTab(tab,btn){document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderNoticias(tab);}

// ===== CONFIG =====
const ABAS_LIST=[{key:'dashboard',label:'Dashboard',ico:'📊'},{key:'vagas',label:'Vagas',ico:'💼'},{key:'cadastrar',label:'Cadastrar Vaga',ico:'➕'},{key:'favoritos',label:'Favoritos',ico:'♥'},{key:'meus-interesses',label:'Meus Interesses',ico:'⭐'},{key:'curriculo',label:'Fazer Currículo',ico:'📄'},{key:'interessados',label:'Candidatos',ico:'👥'},{key:'perfil-rec',label:'Perfil Empresa',ico:'🏢'},{key:'empresas',label:'Empresas',ico:'🏭'},{key:'alertas',label:'Alertas',ico:'🔔'},{key:'usuarios',label:'Usuários',ico:'👤'},{key:'noticias',label:'Notícias',ico:'📰'},{key:'supabase',label:'SQL Supabase',ico:'🗄️'},];
const NIVEIS=['superadmin','admin','supervisor','recrutador','candidato'];
const NL={superadmin:'SuperAdmin',admin:'Admin',supervisor:'Supervisor',recrutador:'Recrutador',candidato:'Candidato'};
function isAllowed(key,n){const d={superadmin:true,admin:['dashboard','vagas','cadastrar','favoritos','interessados','perfil-rec','empresas','alertas','usuarios','noticias','configuracoes'].includes(key),supervisor:['dashboard','vagas','favoritos','interessados','alertas','noticias'].includes(key),recrutador:['dashboard','vagas','cadastrar','favoritos','interessados','perfil-rec','alertas','noticias'].includes(key),candidato:['dashboard','vagas','favoritos','meus-interesses','curriculo','alertas','noticias'].includes(key)};return d[n]||false;}
function renderConfig(){document.getElementById('configAbasLista').innerHTML=ABAS_LIST.map(a=>`<div class="config-row"><div><div class="config-lbl">${a.ico} ${a.label}</div><div class="config-desc">Controle de visibilidade por nível</div></div><div style="display:flex;gap:8px;flex-wrap:wrap;">${NIVEIS.map(n=>`<label style="display:flex;align-items:center;gap:4px;font-size:11px;cursor:pointer;"><input type="checkbox" ${isAllowed(a.key,n)?'checked':''}> ${NL[n]}</label>`).join('')}</div></div>`).join('');}

// ===== FEEDBACK =====
function enviarFeedback(){const tipo=document.querySelector('input[name="feedbackTipo"]:checked')?.value;const texto=document.getElementById('feedbackTexto').value;if(!tipo){showToast('Selecione como conseguiu o emprego!','error');return;}document.getElementById('feedbackOverlay').classList.remove('open');showToast('🎉 Muito obrigado pelo feedback! Boa sorte na nova jornada!','success');}

// ===== COMPARTILHAR =====
function compartilharWA(){if(!vagaAtual)return;const txt=`🎯 *${vagaAtual.titulo}*\n🏢 ${vagaAtual.empresa}\n📍 ${vagaAtual.cidade}–${vagaAtual.estado}\n💰 ${vagaAtual.salario}\n⏱ ${vagaAtual.jornada}\n\n📩 Currículo: ${vagaAtual.whatsapp||vagaAtual.email}\n_Via VagasPro_`;window.open('https://wa.me/?text='+encodeURIComponent(txt));}
function compartilharEmail(){if(!vagaAtual)return;const sub=`Vaga: ${vagaAtual.titulo} – ${vagaAtual.empresa}`;const body=`${vagaAtual.titulo}\n${vagaAtual.empresa} | ${vagaAtual.cidade}-${vagaAtual.estado}\nSalário: ${vagaAtual.salario}\nContato: ${vagaAtual.whatsapp||vagaAtual.email}`;window.open(`mailto:?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`);}
function compartilharWACard(id){event.stopPropagation();vagaAtual=vagasLocal.find(x=>x.id===id);compartilharWA();}
function compartilharEmailCard(id){event.stopPropagation();vagaAtual=vagasLocal.find(x=>x.id===id);compartilharEmail();}

// ===== EXPORT =====
function exportarCSV(){const h=['ID','Titulo','Empresa','Setor','Tipo','Cidade','Estado','Salario','Status','WhatsApp','Email','Dias','Interessados'];const r=vagasLocal.map(v=>[v.id,v.titulo,v.empresa,v.setor,v.tipo,v.cidade,v.estado,v.salario,v.status,v.whatsapp,v.email,v.dias,v.interessados]);const csv=[h,...r].map(row=>row.map(c=>`"${(c||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`vagas_${new Date().toISOString().slice(0,10)}.csv`;a.click();showToast('✅ CSV exportado!','success');}
function exportarCSVCandidatos(vagaId){let cands=vagaId?CANDS_MOCK.filter(c=>c.vaga_id===vagaId):CANDS_MOCK;const h=['Nome','Email','WhatsApp','Cargo','Experiência','Status','Dias'];const r=cands.map(c=>[c.nome,c.email,c.whatsapp,c.cargo,c.exp,c.status,c.dias]);const csv=[h,...r].map(row=>row.map(c=>`"${(c||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`candidatos_${new Date().toISOString().slice(0,10)}.csv`;a.click();showToast('✅ Candidatos exportados!','success');}
function exportarPDF(){window.print();showToast('🖨️ Use Ctrl+P para salvar como PDF','info');}

// ===== SQL =====
const SQL_TXT=`-- VagasPro v4 · Ciberic.Lab · cibericlab@gmail.com
-- Script de Banco de Dados Completo
-- Execute no SQL Editor do painel de banco de dados
-- Compatível com PostgreSQL / Supabase

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ══════════════════════════════════
-- TABELA: usuarios
-- ══════════════════════════════════
CREATE TABLE IF NOT EXISTS usuarios (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome          VARCHAR(120) NOT NULL,
  email         VARCHAR(200) UNIQUE NOT NULL,
  whatsapp      VARCHAR(20),
  nivel         VARCHAR(20) DEFAULT 'candidato'
                CHECK (nivel IN ('superadmin','admin','supervisor','recrutador','candidato')),
  status        VARCHAR(10) DEFAULT 'ativo' CHECK (status IN ('ativo','inativo','suspenso')),
  google_uid    VARCHAR(200) UNIQUE,
  avatar_url    TEXT,
  email_verificado BOOLEAN DEFAULT FALSE,
  aceite_termos BOOLEAN DEFAULT FALSE,
  aceite_termos_em TIMESTAMPTZ,
  preferences   JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════
-- TABELA: empresas (perfil recrutador)
-- ══════════════════════════════════
CREATE TABLE IF NOT EXISTS empresas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id  UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo        VARCHAR(5) DEFAULT 'pj' CHECK (tipo IN ('pj','pf')),
  cnpj        VARCHAR(18),
  cpf         VARCHAR(14),
  nome        VARCHAR(200) NOT NULL,
  email       VARCHAR(200),
  whatsapp    VARCHAR(20),
  cep         VARCHAR(9),
  endereco    VARCHAR(200),
  bairro      VARCHAR(100),
  cidade      VARCHAR(100),
  estado      CHAR(2),
  setor       VARCHAR(100),
  logo_url    TEXT,
  ativa       BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════
-- TABELA: vagas
-- ══════════════════════════════════
CREATE TABLE IF NOT EXISTS vagas (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo            VARCHAR(200) NOT NULL,
  empresa_id        UUID REFERENCES empresas(id) ON DELETE SET NULL,
  empresa_nome      VARCHAR(200),
  criado_por        VARCHAR(200),
  setor             VARCHAR(100),
  tipo              VARCHAR(20) CHECK (tipo IN ('CLT','PJ','Estágio','Temporário','Freelance')),
  cidade            VARCHAR(100),
  estado            CHAR(2),
  salario           VARCHAR(100),
  jornada           VARCHAR(150),
  destaque          TEXT,
  requisitos        JSONB DEFAULT '[]',
  atividades        JSONB DEFAULT '[]',
  beneficios        JSONB DEFAULT '[]',
  whatsapp          VARCHAR(20),
  email             VARCHAR(200),
  logo_url          TEXT,
  status            VARCHAR(20) DEFAULT 'aberto'
                    CHECK (status IN ('aberto','urgente','encerrado')),
  max_candidatos    INTEGER,
  alerta_90_enviado BOOLEAN DEFAULT FALSE,
  alerta_100_enviado BOOLEAN DEFAULT FALSE,
  publicado_por_usuario UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  data_publicacao   DATE DEFAULT CURRENT_DATE,
  data_encerramento DATE,
  visualizacoes     INTEGER DEFAULT 0,
  interessados_count INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════
-- TABELA: favoritos
-- ══════════════════════════════════
CREATE TABLE IF NOT EXISTS favoritos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  vaga_id     UUID NOT NULL REFERENCES vagas(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, vaga_id)
);

-- ══════════════════════════════════
-- TABELA: interesses (candidato → empresa da vaga)
-- Dados pessoais são encaminhados à empresa, não ao recrutador
-- ══════════════════════════════════
CREATE TABLE IF NOT EXISTS interesses (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id          UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  vaga_id             UUID NOT NULL REFERENCES vagas(id) ON DELETE CASCADE,
  dados_encaminhados  BOOLEAN DEFAULT FALSE,
  data_encaminhamento TIMESTAMPTZ,
  status_kanban       VARCHAR(20) DEFAULT 'inscrito'
                      CHECK (status_kanban IN ('inscrito','contato','entrevista','aprovado','reprovado')),
  status_recrutador   VARCHAR(20) DEFAULT 'novo'
                      CHECK (status_recrutador IN ('novo','contato','entrevista','contratado','encerrado')),
  observacoes         TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, vaga_id)
);

-- ══════════════════════════════════
-- TABELA: curriculos_resumidos (mini-CV salvo)
-- Currículo completo/PDF não é armazenado
-- ══════════════════════════════════
CREATE TABLE IF NOT EXISTS curriculos_resumidos (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id     UUID UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  cargo_desejado VARCHAR(150),
  resumo         TEXT,
  habilidades    JSONB DEFAULT '[]',
  whatsapp       VARCHAR(20),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════
-- TABELA: alertas
-- ══════════════════════════════════
CREATE TABLE IF NOT EXISTS alertas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  palavra_chave VARCHAR(150),
  cidade        VARCHAR(100),
  setor         VARCHAR(100),
  tipo          VARCHAR(20),
  notificar_via VARCHAR(20) DEFAULT 'whatsapp',
  ativo         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════
-- TABELA: feedbacks (sucesso na busca de emprego)
-- ══════════════════════════════════
CREATE TABLE IF NOT EXISTS feedbacks (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo       VARCHAR(20) CHECK (tipo IN ('vagaspro','outro','indicacao')),
  texto      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════
-- TABELA: vagas_backup (log pré-exclusão)
-- ══════════════════════════════════
CREATE TABLE IF NOT EXISTS vagas_backup (
  backup_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vaga_data JSONB NOT NULL,
  backup_em TIMESTAMPTZ DEFAULT NOW(),
  tipo      VARCHAR(20) DEFAULT 'pre_delete'
);

-- ══════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════
ALTER TABLE vagas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios           ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE interesses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculos_resumidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks          ENABLE ROW LEVEL SECURITY;

-- Vagas: leitura pública (abertas/urgentes), escrita autenticada
DROP POLICY IF EXISTS "vagas_leitura" ON vagas;
CREATE POLICY "vagas_leitura" ON vagas
  FOR SELECT USING (status IN ('aberto','urgente'));

DROP POLICY IF EXISTS "vagas_insert" ON vagas;
CREATE POLICY "vagas_insert" ON vagas
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "vagas_update_proprio" ON vagas;
CREATE POLICY "vagas_update_proprio" ON vagas
  FOR UPDATE USING (publicado_por_usuario = auth.uid());

DROP POLICY IF EXISTS "vagas_delete_proprio" ON vagas;
CREATE POLICY "vagas_delete_proprio" ON vagas
  FOR DELETE USING (publicado_por_usuario = auth.uid());

-- Favoritos/Interesses/Alertas: apenas próprio usuário
DROP POLICY IF EXISTS "favoritos_proprio" ON favoritos;
CREATE POLICY "favoritos_proprio" ON favoritos FOR ALL
  USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "interesses_proprio" ON interesses;
CREATE POLICY "interesses_proprio" ON interesses
  FOR SELECT USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "interesses_insert" ON interesses;
CREATE POLICY "interesses_insert" ON interesses
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "alertas_proprio" ON alertas;
CREATE POLICY "alertas_proprio" ON alertas FOR ALL
  USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "usuario_proprio" ON usuarios;
CREATE POLICY "usuario_proprio" ON usuarios
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "curriculo_proprio" ON curriculos_resumidos;
CREATE POLICY "curriculo_proprio" ON curriculos_resumidos FOR ALL
  USING (usuario_id = auth.uid());

-- ══════════════════════════════════
-- ÍNDICES DE PERFORMANCE
-- ══════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_vagas_status      ON vagas(status);
CREATE INDEX IF NOT EXISTS idx_vagas_cidade      ON vagas(cidade);
CREATE INDEX IF NOT EXISTS idx_vagas_setor       ON vagas(setor);
CREATE INDEX IF NOT EXISTS idx_vagas_data        ON vagas(data_publicacao DESC);
CREATE INDEX IF NOT EXISTS idx_vagas_publicador  ON vagas(publicado_por_usuario);
CREATE INDEX IF NOT EXISTS idx_interesses_vaga   ON interesses(vaga_id);
CREATE INDEX IF NOT EXISTS idx_interesses_user   ON interesses(usuario_id);
CREATE INDEX IF NOT EXISTS idx_vagas_titulo      ON vagas USING gin(titulo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vagas_empresa     ON vagas USING gin(empresa_nome gin_trgm_ops);

-- ══════════════════════════════════
-- TRIGGERS
-- ══════════════════════════════════
CREATE OR REPLACE FUNCTION fn_upd_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at=NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_usuarios_upd
  BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION fn_upd_at();
CREATE OR REPLACE TRIGGER trg_vagas_upd
  BEFORE UPDATE ON vagas FOR EACH ROW EXECUTE FUNCTION fn_upd_at();
CREATE OR REPLACE TRIGGER trg_interesses_upd
  BEFORE UPDATE ON interesses FOR EACH ROW EXECUTE FUNCTION fn_upd_at();
CREATE OR REPLACE TRIGGER trg_empresas_upd
  BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION fn_upd_at();

-- Contador de interessados por vaga
CREATE OR REPLACE FUNCTION fn_int_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    UPDATE vagas SET interessados_count=interessados_count+1 WHERE id=NEW.vaga_id;
  ELSIF TG_OP='DELETE' THEN
    UPDATE vagas SET interessados_count=GREATEST(0,interessados_count-1) WHERE id=OLD.vaga_id;
  END IF;
  RETURN COALESCE(NEW,OLD);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_int_count
  AFTER INSERT OR DELETE ON interesses
  FOR EACH ROW EXECUTE FUNCTION fn_int_count();

-- Verificar limite de candidatos (90% e 100%)
CREATE OR REPLACE FUNCTION fn_check_limite() RETURNS TRIGGER AS $$
DECLARE v_max INT; v_atual INT;
BEGIN
  SELECT max_candidatos, interessados_count INTO v_max, v_atual
  FROM vagas WHERE id=NEW.vaga_id;
  IF v_max IS NULL THEN RETURN NEW; END IF;
  IF v_atual >= v_max AND NOT alerta_100_enviado THEN
    UPDATE vagas SET alerta_100_enviado=TRUE WHERE id=NEW.vaga_id;
    -- Aqui: dispare notificação (webhook, email, etc.)
  ELSIF v_atual >= FLOOR(v_max*0.9) AND NOT alerta_90_enviado THEN
    UPDATE vagas SET alerta_90_enviado=TRUE WHERE id=NEW.vaga_id;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_check_limite
  AFTER INSERT ON interesses
  FOR EACH ROW EXECUTE FUNCTION fn_check_limite();

-- Backup automático antes de excluir vaga
CREATE OR REPLACE FUNCTION fn_backup_del() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO vagas_backup(vaga_data,tipo) VALUES(to_jsonb(OLD),'pre_delete');
  RETURN OLD;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_backup_vaga
  BEFORE DELETE ON vagas FOR EACH ROW EXECUTE FUNCTION fn_backup_del();

-- ══════════════════════════════════
-- VIEWS
-- ══════════════════════════════════
CREATE OR REPLACE VIEW vagas_publicas AS
  SELECT v.*,
    e.nome empresa_oficial,
    e.logo_url empresa_logo,
    (CURRENT_DATE - v.data_publicacao) dias_publicado,
    CASE WHEN v.max_candidatos IS NOT NULL
      THEN ROUND(v.interessados_count::numeric/v.max_candidatos*100,1)
      ELSE NULL END pct_candidatos
  FROM vagas v
  LEFT JOIN empresas e ON e.id=v.empresa_id
  WHERE v.status IN ('aberto','urgente')
  ORDER BY
    CASE v.status WHEN 'urgente' THEN 0 ELSE 1 END,
    v.data_publicacao DESC;

-- View para recrutador (sem dados pessoais de candidatos)
CREATE OR REPLACE VIEW candidatos_sem_dados_pessoais AS
  SELECT
    i.id,
    i.vaga_id,
    i.status_recrutador,
    i.observacoes,
    i.created_at,
    i.updated_at,
    u.nome,
    -- Dados pessoais OMITIDOS para recrutadores (enviados à empresa)
    NULL::text AS email_omitido,
    NULL::text AS whatsapp_omitido
  FROM interesses i
  JOIN usuarios u ON u.id=i.usuario_id;

-- ══════════════════════════════════
-- DADOS INICIAIS
-- ══════════════════════════════════
INSERT INTO usuarios(nome,email,nivel,email_verificado,aceite_termos)
VALUES
  ('Admin Geral','admin@vagaspro.com.br','superadmin',TRUE,TRUE),
  ('Gestor RH','gestor@vagaspro.com.br','admin',TRUE,TRUE)
ON CONFLICT(email) DO NOTHING;

-- FIM DO SCRIPT VagasPro v4 · Ciberic.Lab`;

function renderSQL(){document.getElementById('sqlBlock').textContent=SQL_TXT;}
function copiarSQL(){navigator.clipboard.writeText(SQL_TXT).then(()=>showToast('✅ SQL copiado!','success'));}
function exportarSQLFile(){const blob=new Blob([SQL_TXT],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='vagaspro_v3_supabase.sql';a.click();showToast('✅ SQL baixado!','success');}

// ===== TOAST / NOTIFICATION =====
var _toastQueue = [];
var _toastActive = 0;
var MAX_TOASTS = 4;

function showToast(msg, type) {
  type = type || '';
  // Parse message: if contains newline or is long, split into title+body
  var title = '', body = msg || '';
  // Icons per type
  var icons = {success:'✓', error:'✕', warning:'!', info:'i', '':'●'};
  var labels = {success:'Sucesso', error:'Erro', warning:'Atenção', info:'Info', '':'Aviso'};
  
  // If msg starts with emoji, use it as icon
  var emojiMatch = body.match(/^([🍳🧹🛒🔧⚡💊👥⚙️🚌✅❌⭐♥📧🎉🔒💾📋🔍🗑✏📱✉🏆🔔📄⚠️👤🏢🔥💼📰🗄️]\s*)/);
  var toastIcon = '';
  if (emojiMatch) {
    toastIcon = emojiMatch[0].trim();
    body = body.slice(emojiMatch[0].length);
  } else {
    toastIcon = icons[type] || '●';
  }
  
  // Separate title from body if has ":"
  var colonIdx = body.indexOf('. ');
  if (colonIdx > 0 && colonIdx < 60 && body.length > colonIdx + 2) {
    // keep as one line for short messages
  }

  var container = document.getElementById('toastContainer');
  if (!container) return;

  // Limit stacked toasts
  if (_toastActive >= MAX_TOASTS) {
    var first = container.querySelector('.toast');
    if (first) _dismissToast(first);
  }

  var id = 'toast_' + Date.now();
  var el = document.createElement('div');
  el.id = id;
  el.className = 'toast' + (type ? ' ' + type : '');
  el.innerHTML =
    '<div class="toast-bar"></div>' +
    '<div class="toast-body">' +
      '<div class="toast-icon-wrap">' + toastIcon + '</div>' +
      '<div class="toast-content">' +
        '<div class="toast-title">' + _sanitizeToast(body) + '</div>' +
      '</div>' +
      '<button class="toast-close" onclick="_dismissToast(document.getElementById(\'' + id + '\'))">✕</button>' +
    '</div>' +
    '<div class="toast-progress"></div>';

  container.appendChild(el);
  _toastActive++;

  // Animate in
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      el.classList.add('show');
    });
  });

  // Auto dismiss
  el._timer = setTimeout(function() { _dismissToast(el); }, 3800);
}

function _dismissToast(el) {
  if (!el || el._dismissed) return;
  el._dismissed = true;
  clearTimeout(el._timer);
  el.classList.remove('show');
  el.classList.add('hiding');
  setTimeout(function() {
    if (el.parentNode) el.parentNode.removeChild(el);
    _toastActive = Math.max(0, _toastActive - 1);
  }, 320);
}

function _sanitizeToast(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/[<>]/g, function(ch) { return ch === '<' ? '&lt;' : '&gt;'; });
}

// ===== MODAL TERMOS =====
function abrirModalTermos(){
  const el=document.getElementById('modalTermosContent');
  if(el&&!el.innerHTML.trim()) renderTermosModal();
  document.getElementById('modalTermos').classList.add('open');
}

function aceitarTermosModal(){
  document.getElementById('modalTermos').classList.remove('open');
  const cb=document.getElementById('aceitoTermos');
  if(cb) cb.checked=true;
  showToast('✅ Termos aceitos!','success');
}

function renderTermosModal(){
  const el=document.getElementById('modalTermosContent');
  if(!el)return;
  el.innerHTML=`<div style="font-size:13px;color:var(--g700);line-height:1.8;padding-top:4px;">

<div style="background:var(--accent-soft);border-left:4px solid var(--accent);padding:10px 14px;border-radius:0 8px 8px 0;margin-bottom:16px;font-size:12px;color:#3730a3;">
🔒 Este documento regula o uso do <strong>VagasPro</strong>, desenvolvido pela <strong>Ciberic.Lab</strong> (cibericlab@gmail.com), em conformidade com a <strong>LGPD – Lei nº 13.709/2018</strong> e demais normas brasileiras.
</div>

<h3 style="font-size:13.5px;font-weight:700;color:var(--accent);margin:14px 0 6px;border-bottom:1px solid var(--g100);padding-bottom:5px;">1. Identificação da Empresa</h3>
<p><strong>Empresa:</strong> Ciberic.Lab &nbsp;|&nbsp; <strong>E-mail:</strong> cibericlab@gmail.com<br>
<strong>Produto:</strong> VagasPro – Sistema Inteligente de Gestão de Vagas</p>

<h3 style="font-size:13.5px;font-weight:700;color:var(--accent);margin:14px 0 6px;border-bottom:1px solid var(--g100);padding-bottom:5px;">2. Cadastro e Acesso</h3>
<ul style="padding-left:18px;margin:6px 0;">
  <li>Cadastro pessoal e intransferível;</li>
  <li>Verificação obrigatória por código de 6 dígitos enviado ao e-mail;</li>
  <li>Menores de 18 anos precisam de consentimento dos responsáveis;</li>
  <li>Contas que violem estes Termos podem ser suspensas sem aviso prévio.</li>
</ul>

<h3 style="font-size:13.5px;font-weight:700;color:var(--accent);margin:14px 0 6px;border-bottom:1px solid var(--g100);padding-bottom:5px;">3. Níveis de Acesso e Privacidade</h3>
<p><strong>Candidatos:</strong> Ao demonstrar interesse em uma vaga, seus dados de contato (nome, e-mail, WhatsApp) são encaminhados <strong>diretamente à empresa responsável pela vaga</strong>. O recrutador VagasPro apenas publica vagas e <strong>não tem acesso aos seus dados pessoais</strong>.</p>
<p><strong>Recrutadores:</strong> Publicam vagas em nome de empresas. São responsáveis pela veracidade do conteúdo. Não acessam dados pessoais de candidatos.</p>

<h3 style="font-size:13.5px;font-weight:700;color:var(--accent);margin:14px 0 6px;border-bottom:1px solid var(--g100);padding-bottom:5px;">4. Proteção de Dados – LGPD (Lei 13.709/2018)</h3>
<p><strong>Dados coletados:</strong> nome, e-mail, WhatsApp, dados profissionais (voluntários), logs de uso.</p>
<p><strong>Finalidade:</strong> intermediação de candidaturas, alertas de vagas, melhoria da plataforma.</p>
<p><strong>Seus direitos:</strong> acessar, corrigir, portabilidade, exclusão e revogação do consentimento a qualquer momento. Contato: <strong>cibericlab@gmail.com</strong></p>
<div style="background:#fffbeb;border:1.5px solid #fcd34d;border-radius:12px;padding:10px 13px;margin:10px 0;font-size:12px;color:#92400e;">
⚠️ O currículo gerado na aba "Fazer Currículo" e o PDF exportado <strong>não são armazenados no sistema</strong>. Apenas o mini-currículo de perfil fica salvo.
</div>

<h3 style="font-size:13.5px;font-weight:700;color:var(--accent);margin:14px 0 6px;border-bottom:1px solid var(--g100);padding-bottom:5px;">5. Planos e Preços</h3>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:10px 0;">
  <div style="border:1.5px solid var(--g200);border-radius:14px;padding:12px;text-align:center;">
    <div style="font-weight:700;">🆓 Gratuito</div>
    <div style="font-size:18px;font-weight:800;color:var(--accent);">R$ 0</div>
    <div style="font-size:10.5px;color:var(--g400);">para sempre</div>
  </div>
  <div style="border:1.5px solid var(--accent);border-radius:14px;padding:12px;text-align:center;background:var(--accent-soft);">
    <div style="font-weight:700;">⭐ Profissional</div>
    <div style="font-size:18px;font-weight:800;color:var(--accent);">A consultar</div>
    <div style="font-size:10.5px;color:var(--g400);">por mês</div>
  </div>
  <div style="border:1.5px solid var(--g200);border-radius:14px;padding:12px;text-align:center;">
    <div style="font-weight:700;">🏢 Empresarial</div>
    <div style="font-size:18px;font-weight:800;color:var(--accent);">A consultar</div>
    <div style="font-size:10.5px;color:var(--g400);">sob demanda</div>
  </div>
</div>
<div style="background:#fffbeb;border:1.5px solid #fcd34d;border-radius:12px;padding:10px 13px;font-size:12px;color:#92400e;">
⚠️ <strong>Os preços podem ser alterados a qualquer momento</strong> sem aviso prévio. Contato: cibericlab@gmail.com
</div>

<h3 style="font-size:13.5px;font-weight:700;color:var(--accent);margin:14px 0 6px;border-bottom:1px solid var(--g100);padding-bottom:5px;">6. Uso Aceitável</h3>
<ul style="padding-left:18px;margin:6px 0;">
  <li>Proibido publicar vagas falsas ou discriminatórias;</li>
  <li>Proibido extrair dados automatizados (scraping);</li>
  <li>Proibido utilizar para fins ilegais ou fraudulentos.</li>
</ul>

<h3 style="font-size:13.5px;font-weight:700;color:var(--accent);margin:14px 0 6px;border-bottom:1px solid var(--g100);padding-bottom:5px;">7. Propriedade Intelectual e Responsabilidade</h3>
<p>O VagasPro é propriedade exclusiva da Ciberic.Lab, protegido pela Lei 9.610/1998. A Ciberic.Lab não se responsabiliza pela veracidade das vagas publicadas ou por decisões de contratação das empresas.</p>

<h3 style="font-size:13.5px;font-weight:700;color:var(--accent);margin:14px 0 6px;border-bottom:1px solid var(--g100);padding-bottom:5px;">8. Foro</h3>
<p>Comarca de <strong>Goiânia – GO</strong>. Legislação aplicável: LGPD, CDC (8.078/90), Marco Civil (12.965/14).</p>

<div style="background:var(--accent-soft);border-left:4px solid var(--accent);padding:10px 14px;border-radius:0 8px 8px 0;margin-top:16px;font-size:12px;color:#3730a3;">
✍️ Ao clicar em <strong>"Li e Aceito"</strong>, você confirma ter lido e concordado com estes Termos. <strong>Jan/2025.</strong>
</div>
</div>`;
}

// ===== KANBAN =====
const KANBAN_COLS=[
  {id:'inscrito',label:'Inscrito',color:'#6366f1',icon:'📝'},
  {id:'contato',label:'Contato feito',color:'#0ea5e9',icon:'📞'},
  {id:'entrevista',label:'Entrevista',color:'#f59e0b',icon:'🗓️'},
  {id:'aprovado',label:'Aprovado',color:'#10b981',icon:'✅'},
  {id:'reprovado',label:'Não avançou',color:'#94a3b8',icon:'❌'},
];
let kanbanCards={},draggedCard=null;

function renderKanban(){
  const ints=vagasLocal.filter(v=>v.interesse);
  ints.forEach(v=>{if(!kanbanCards[v.id])kanbanCards[v.id]='inscrito';});
  const board=document.getElementById('kanbanBoard');if(!board)return;
  if(!ints.length){board.innerHTML='<div class="empty-state" style="width:100%;"><div class="empty-ico">📋</div><div class="empty-ttl">Nenhuma candidatura ainda</div><div class="empty-desc">Demonstre interesse em vagas para acompanhar aqui no kanban</div></div>';return;}
  board.innerHTML=KANBAN_COLS.map(col=>{
    const cards=ints.filter(v=>(kanbanCards[v.id]||'inscrito')===col.id);
    return `<div class="kanban-col">
      <div class="kanban-col-header" style="background:${col.color};">
        <span>${col.icon} ${col.label}</span><span class="kanban-count">${cards.length}</span>
      </div>
      <div class="kanban-col-body" id="kcol-${col.id}"
        ondragover="event.preventDefault();this.classList.add('drag-over')"
        ondragleave="this.classList.remove('drag-over')"
        ondrop="dropCard(event,'${col.id}')">
        ${!cards.length?'<div style="text-align:center;padding:24px 10px;font-size:12px;color:var(--g400);">Nenhuma vaga aqui</div>':''}
        ${cards.map(v=>`<div class="kanban-card" draggable="true" id="kcard-${v.id}"
          ondragstart="dragStart(event,${v.id})" ondragend="dragEnd(event)">
          <div class="kanban-card-title">${v.titulo}</div>
          <div class="kanban-card-empresa">${v.empresa}</div>
          <div class="kanban-card-meta">
            <span class="badge badge-gray">${v.tipo}</span>
            <span class="badge badge-gray">📍 ${v.cidade}</span>
            ${v.salario?`<span class="badge badge-green" style="font-size:9.5px;">${v.salario}</span>`:''}
          </div>
          <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:10px;color:var(--g400);">Inscrito ${v.dias===0?'hoje':v.dias===1?'há 1 dia':'há '+v.dias+'d'}</span>
            <button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();abrirModal(${v.id})">Ver vaga</button>
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  }).join('');
}
function dragStart(e,id){draggedCard=id;e.dataTransfer.effectAllowed='move';setTimeout(()=>{const el=document.getElementById('kcard-'+id);if(el)el.classList.add('dragging');},0);}
function dragEnd(){document.querySelectorAll('.kanban-col-body').forEach(c=>c.classList.remove('drag-over'));if(draggedCard){const el=document.getElementById('kcard-'+draggedCard);if(el)el.classList.remove('dragging');}}
function dropCard(e,colId){e.preventDefault();document.querySelectorAll('.kanban-col-body').forEach(c=>c.classList.remove('drag-over'));if(draggedCard){kanbanCards[draggedCard]=colId;draggedCard=null;renderKanban();showToast('✅ Status atualizado no kanban!','success');}}

// ===== TERMOS =====
function renderTermos(){
  const el=document.getElementById('termosContent');if(!el)return;
  el.innerHTML=`
    <h1>📄 Termos de Uso, Privacidade e LGPD</h1>
    <p style="color:var(--g400);font-size:12px;margin-bottom:16px;">Versão 1.0 · Vigência: Janeiro/2025 · Ciberic.Lab</p>
    <div class="highlight-termos">🔒 Este documento regula o uso do <strong>VagasPro</strong>, desenvolvido pela <strong>Ciberic.Lab</strong> (cibericlab@gmail.com), em conformidade com a <strong>LGPD – Lei nº 13.709/2018</strong>, o Marco Civil da Internet (Lei 12.965/2014) e demais normas do ordenamento jurídico brasileiro.</div>

    <h2>1. Identificação da Empresa</h2>
    <p><strong>Empresa:</strong> Ciberic.Lab &nbsp;|&nbsp; <strong>E-mail:</strong> cibericlab@gmail.com<br>
    <strong>Produto:</strong> VagasPro – Sistema Inteligente de Gestão de Vagas<br>
    A Ciberic.Lab é criadora, proprietária e responsável pelo VagasPro, atuando como <strong>controladora de dados pessoais</strong> (Art. 5º, VI da LGPD).</p>

    <h2>2. Aceitação dos Termos</h2>
    <p>Ao criar conta ou utilizar o VagasPro, o usuário declara ter lido, compreendido e concordado com estes Termos. A Ciberic.Lab pode modificá-los a qualquer momento com notificação prévia. O uso continuado após modificações configura aceitação tácita.</p>

    <h2>3. Cadastro, Autenticação e Acesso</h2>
    <ul>
      <li>O cadastro é pessoal e intransferível; é vedada a criação de múltiplas contas para fins fraudulentos;</li>
      <li>O usuário é responsável pela confidencialidade de suas credenciais;</li>
      <li>A verificação de identidade é feita por código de 6 dígitos enviado ao e-mail cadastrado;</li>
      <li>Menores de 18 anos necessitam de consentimento dos responsáveis legais;</li>
      <li>A Ciberic.Lab pode suspender ou encerrar contas que violem estes Termos.</li>
    </ul>

    <h2>4. Níveis de Acesso e Privacidade dos Dados</h2>
    <h3>4.1 Candidatos</h3>
    <p>Ao demonstrar interesse em uma vaga, o candidato autoriza o encaminhamento de seus dados de contato (nome, e-mail e WhatsApp) <strong>diretamente à empresa responsável pela vaga</strong>. O recrutador VagasPro apenas publica vagas e <strong>não tem acesso aos dados pessoais dos candidatos</strong>.</p>
    <h3>4.2 Recrutadores / Publicadores</h3>
    <p>Publicam vagas em nome de empresas. São responsáveis pela veracidade e legalidade do conteúdo publicado. Não acessam dados pessoais de candidatos — tais dados são enviados diretamente à empresa da vaga.</p>
    <h3>4.3 Administradores (Ciberic.Lab)</h3>
    <p>Acesso gerencial exclusivo para suporte técnico, manutenção e conformidade regulatória.</p>

    <h2>5. Proteção de Dados – LGPD (Lei 13.709/2018)</h2>
    <h3>5.1 Dados Coletados</h3>
    <ul>
      <li><strong>Identificação:</strong> nome, e-mail, WhatsApp/telefone;</li>
      <li><strong>Profissionais:</strong> cargo desejado, experiências, formação (fornecidos voluntariamente);</li>
      <li><strong>Uso da plataforma:</strong> vagas visualizadas, favoritas e de interesse; logs de acesso;</li>
      <li><strong>Empresas:</strong> CNPJ/CPF, razão social, endereço, dados de contato comercial.</li>
    </ul>
    <h3>5.2 Finalidade do Tratamento</h3>
    <ul>
      <li>Intermediação de candidaturas entre candidatos e empresas;</li>
      <li>Envio de alertas de vagas compatíveis com o perfil;</li>
      <li>Melhoria contínua da plataforma; cumprimento de obrigações legais.</li>
    </ul>
    <h3>5.3 Base Legal (Art. 7º, LGPD)</h3>
    <p>Consentimento do titular (inciso I), execução de contrato (inciso V) e legítimo interesse (inciso IX), sempre nos limites da LGPD.</p>
    <h3>5.4 Direitos do Titular (Art. 18, LGPD)</h3>
    <ul>
      <li>Acessar, corrigir, atualizar ou excluir seus dados pessoais;</li>
      <li>Portabilidade dos dados a outro fornecedor;</li>
      <li>Revogar consentimento a qualquer momento;</li>
      <li>Peticionar à ANPD (Autoridade Nacional de Proteção de Dados).</li>
    </ul>
    <p><strong>Canal de atendimento (DPO):</strong> cibericlab@gmail.com</p>
    <h3>5.5 Currículo em PDF e Dados Temporários</h3>
    <div class="highlight-termos" style="background:var(--amber-soft);border-color:var(--amber);color:#92400e;">
      ⚠️ O currículo completo gerado na aba "Fazer Currículo" e o PDF exportado <strong>não são armazenados no sistema</strong>. Os dados digitados existem apenas durante a sessão ativa. Apenas o <strong>mini-currículo de perfil</strong> (resumo cadastrado separadamente) é salvo na plataforma.
    </div>

    <h2>6. Planos, Preços e Assinaturas</h2>
    <div class="planos-grid">
      <div class="plano-card">
        <div class="plano-nome">🆓 Gratuito</div>
        <div class="plano-preco">R$ 0</div>
        <div class="plano-periodo">para sempre</div>
        <ul class="plano-features">
          <li>✅ Busca e visualização de vagas</li>
          <li>✅ Criar currículo resumido</li>
          <li>✅ Demonstrar interesse em vagas</li>
          <li>✅ Kanban de candidaturas</li>
          <li>❌ Publicar vagas</li>
          <li>❌ Dashboard recrutador</li>
        </ul>
      </div>
      <div class="plano-card destaque">
        <div class="plano-nome">⭐ Profissional</div>
        <div class="plano-preco">A consultar</div>
        <div class="plano-periodo">por mês · cobrança mensal</div>
        <ul class="plano-features">
          <li>✅ Publicar vagas ilimitadas</li>
          <li>✅ Dashboard exclusivo</li>
          <li>✅ Importação de vagas com IA</li>
          <li>✅ Alertas de candidaturas</li>
          <li>✅ Exportar CSV e PDF</li>
          <li>✅ Limite de candidatos por vaga</li>
        </ul>
        <div class="plano-aviso">* Sem fidelidade mínima</div>
      </div>
      <div class="plano-card">
        <div class="plano-nome">🏢 Empresarial</div>
        <div class="plano-preco">A consultar</div>
        <div class="plano-periodo">sob demanda · múltiplos usuários</div>
        <ul class="plano-features">
          <li>✅ Tudo do Profissional</li>
          <li>✅ Múltiplos recrutadores</li>
          <li>✅ Integração via API</li>
          <li>✅ Personalização de marca</li>
          <li>✅ Suporte prioritário (SLA)</li>
          <li>✅ Relatórios avançados</li>
        </ul>
      </div>
    </div>
    <div class="highlight-termos" style="background:var(--amber-soft);border-color:var(--amber);color:#92400e;">
      ⚠️ <strong>Os preços, planos e condições de assinatura podem ser alterados a qualquer momento</strong> pela Ciberic.Lab, com ou sem aviso prévio. As condições vigentes no momento da contratação serão mantidas até o fim do período contratado. Para valores atualizados: <strong>cibericlab@gmail.com</strong>
    </div>

    <h2>7. Uso Aceitável e Proibições</h2>
    <ul>
      <li>Publicar vagas falsas, enganosas ou com conteúdo discriminatório;</li>
      <li>Coletar dados de outros usuários por meios automatizados (scraping, bots);</li>
      <li>Realizar engenharia reversa, descompilar ou reproduzir o sistema;</li>
      <li>Utilizar a plataforma para fins ilegais, fraude ou lavagem de dinheiro;</li>
      <li>Criar contas falsas ou utilizar identidades de terceiros;</li>
      <li>Sobrecarregar intencionalmente os servidores (ataques DDoS).</li>
    </ul>
    <p>O descumprimento implica rescisão imediata do acesso e pode ensejar responsabilização civil e criminal.</p>

    <h2>8. Propriedade Intelectual</h2>
    <p>Todo o conteúdo do VagasPro — incluindo código-fonte, design, logotipos, funcionalidades e banco de dados — é de propriedade exclusiva da <strong>Ciberic.Lab</strong>, protegido pela Lei de Direitos Autorais (Lei 9.610/1998) e pela Lei de Propriedade Industrial (Lei 9.279/1996). Reprodução ou uso sem autorização prévia e escrita é vedada.</p>

    <h2>9. Limitação de Responsabilidade</h2>
    <p>A Ciberic.Lab não se responsabiliza por: veracidade das vagas publicadas; decisões de contratação das empresas; relações trabalhistas estabelecidas; interrupções por manutenção, falhas técnicas ou força maior; uso indevido da plataforma por terceiros.</p>

    <h2>10. Cookies e Rastreamento</h2>
    <p>A plataforma utiliza armazenamento local (localStorage) para: manter sessões autenticadas; lembrar preferências do usuário. Não há uso de cookies de rastreamento de terceiros para fins publicitários.</p>

    <h2>11. Rescisão</h2>
    <p>O usuário pode encerrar sua conta a qualquer momento via e-mail: cibericlab@gmail.com. Após encerramento, os dados serão eliminados conforme a política de retenção, salvo obrigações legais de guarda.</p>

    <h2>12. Foro e Legislação Aplicável</h2>
    <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. As partes elegem o foro da Comarca de <strong>Goiânia – Goiás</strong> para dirimir controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
    <p><em>Legislação: LGPD (13.709/18) · CDC (8.078/90) · Marco Civil (12.965/14) · Lei de Direitos Autorais (9.610/98)</em></p>

    <h2>13. Contato e DPO</h2>
    <ul>
      <li>📧 <strong>cibericlab@gmail.com</strong></li>
      <li>🏢 Ciberic.Lab · Goiânia – GO · Brasil</li>
    </ul>
    <div class="highlight-termos" style="margin-top:20px;">
      ✍️ Ao utilizar o VagasPro, você confirma ter lido e concordado com estes Termos. <strong>Última atualização: Janeiro de 2025.</strong>
    </div>
  `;
}

// ===== TOP RECRUTADOR =====
function renderTopRecrutador(){
  const nivel=currentUser?.nivel||'candidato';
  if(!['superadmin','admin','supervisor'].includes(nivel))return;
  const counts={};
  vagasLocal.forEach(v=>{if(v.criado_por)counts[v.criado_por]=(counts[v.criado_por]||0)+1;});
  const ranking=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if(!ranking.length)return;
  const old=document.getElementById('topRecSection');if(old)old.remove();
  const medals=['🥇','🥈','🥉','4️⃣','5️⃣'];
  const div=document.createElement('div');div.id='topRecSection';
  div.style.cssText='background:white;border:1.5px solid var(--g200);border-radius:var(--r);padding:18px;box-shadow:var(--sh);margin-bottom:18px;';
  div.innerHTML='<div style="font-size:14px;font-weight:800;color:var(--g900);margin-bottom:12px;">🏆 Recrutadores que mais publicam vagas</div>'+
    ranking.map(([nome,total],i)=>{
      const pct=Math.round(total/vagasLocal.length*100);
      return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1.5px solid var(--g100);">
        <span style="font-size:18px;">${medals[i]}</span>
        <div style="flex:1;"><div style="font-size:13px;font-weight:600;">${nome}</div>
        <div class="progress-bar" style="margin-top:4px;"><div class="progress-fill" style="width:${pct}%;"></div></div></div>
        <span class="badge badge-blue">${total} vaga${total>1?'s':''}</span></div>`;
    }).join('');
  const statsGrid=document.getElementById('dashStats');
  if(statsGrid)statsGrid.after(div);
}

// ===== EDITAR VAGA =====
let vagaEditandoId=null;
function editarVaga(id){
  const v=vagasLocal.find(x=>x.id===id);if(!v)return;
  vagaEditandoId=id;
  const set=(i,v2)=>{const el=document.getElementById(i);if(el)el.value=v2||'';};
  set('f-titulo',v.titulo);set('f-empresa',v.empresa);set('f-destaque',v.destaque);
  set('f-cidade',v.cidade);set('f-salario',v.salario);set('f-jornada',v.jornada);
  set('f-whatsapp',v.whatsapp);set('f-email',v.email);
  ['f-setor','f-tipo','f-estado','f-status'].forEach(id=>{const el=document.getElementById(id);if(el&&v[id.replace('f-','')])el.value=v[id.replace('f-','')];});
  const mc=document.getElementById('f-max-candidatos');if(mc)mc.value=v.max_candidatos||'';
  const cp=document.getElementById('f-criado-por');if(cp)cp.value=v.criado_por||'';
  ['req','atv','ben'].forEach(field=>{
    tagsData[field]=[];const wm={req:'reqWrap',atv:'atvWrap',ben:'benWrap'};
    const wrap=document.getElementById(wm[field]);if(!wrap)return;
    wrap.querySelectorAll('.ti').forEach(t=>t.remove());const inp=wrap.querySelector('input');
    const km={req:'requisitos',atv:'atividades',ben:'beneficios'};
    (v[km[field]]||[]).forEach(val=>{tagsData[field].push(val);const el=document.createElement('div');el.className='ti';el.innerHTML=`${val}<button type="button" onclick="removeTag(this,'${field}','${val.replace(/'/g,"\'")}')">×</button>`;wrap.insertBefore(el,inp);});
  });
  navTo('cadastrar',document.getElementById('nav-cadastrar'));
  showToast('✏️ Editando: '+v.titulo,'info');
  const ft=document.getElementById('formVagaTitle');
  if(ft)ft.innerHTML='✏️ Editando Vaga <span style="color:var(--amber);font-size:13px;">(modo edição)</span>';
  setTimeout(()=>{const btn=document.querySelector('#page-cadastrar button[onclick="salvarVaga()"]');if(btn){btn.textContent='💾 Atualizar Vaga';btn.style.cssText='background:linear-gradient(135deg,#d97706,#f59e0b);color:white;';}},100);
}
function removerVaga(id){
  const v=vagasLocal.find(x=>x.id===id);if(!v)return;
  if(!confirm('Remover a vaga "'+v.titulo+'"?\nEsta ação não pode ser desfeita.'))return;
  vagasLocal=vagasLocal.filter(x=>x.id!==id);filtrarVagas();
  showToast('🗑️ Vaga removida!','success');
}

// ===== OVERRIDE salvarVaga para edição =====
const _salvarVagaOrig=salvarVaga;
function salvarVaga(){
  if(vagaEditandoId){
    const v=vagasLocal.find(x=>x.id===vagaEditandoId);
    if(!v){vagaEditandoId=null;_salvarVagaOrig();return;}
    const titulo=document.getElementById('f-titulo').value.trim();
    const empresa=document.getElementById('f-empresa').value.trim();
    if(!titulo||!empresa){showToast('Preencha Título e Empresa!','error');return;}
    v.titulo=titulo;v.empresa=empresa;
    v.setor=document.getElementById('f-setor').value;
    v.tipo=document.getElementById('f-tipo').value;
    v.cidade=document.getElementById('f-cidade').value;
    v.estado=document.getElementById('f-estado').value;
    v.salario=document.getElementById('f-salario').value;
    v.jornada=document.getElementById('f-jornada').value;
    v.destaque=document.getElementById('f-destaque').value;
    v.requisitos=[...tagsData.req];v.atividades=[...tagsData.atv];v.beneficios=[...tagsData.ben];
    v.whatsapp=document.getElementById('f-whatsapp').value;
    v.email=document.getElementById('f-email').value;
    v.status=document.getElementById('f-status').value;
    const mc=document.getElementById('f-max-candidatos');v.max_candidatos=mc&&mc.value?parseInt(mc.value):null;
    const cp=document.getElementById('f-criado-por');if(cp&&cp.value)v.criado_por=cp.value;
    vagaEditandoId=null;
    limparForm();
    showToast('✅ Vaga atualizada!','success');
    navTo('vagas',document.getElementById('nav-vagas'));
    return;
  }
  _salvarVagaOrig();
}

// ===== OVERRIDE limparForm para reset edição =====
const _limparFormOrig=limparForm;
function limparForm(){
  vagaEditandoId=null;_limparFormOrig();
  const btn=document.querySelector('#page-cadastrar button[onclick="salvarVaga()"]');
  if(btn&&btn.textContent.includes('Atualizar')){btn.textContent='💾 Salvar Vaga';btn.style.cssText='';}
  const ft=document.getElementById('formVagaTitle');
  if(ft)ft.innerHTML='📋 Dados da Vaga';
  const mc=document.getElementById('f-max-candidatos');if(mc)mc.value='';
  const cp=document.getElementById('f-criado-por');if(cp)cp.value='';
}

// ===== VERIFICAR LIMITES DE CANDIDATOS =====
function checkLimites(){
  vagasLocal.forEach(v=>{
    if(!v.max_candidatos)return;
    const pct=v.interessados/v.max_candidatos;
    if(pct>=1&&!v._a100){v._a100=true;showToast('🚨 "'+v.titulo+'" atingiu 100% do limite!','error');}
    else if(pct>=0.9&&!v._a90){v._a90=true;showToast('⚠️ "'+v.titulo+'" atingiu 90% do limite!','warning');}
  });
}

// ===== KEYBOARD =====
document.addEventListener('keydown',e=>{if(e.key==='Escape'){fecharModal();document.getElementById('verifyOverlay')?.classList.remove('open');document.getElementById('feedbackOverlay')?.classList.remove('open');}});

// ===== PWA =====
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}
// PWA Install prompt
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();deferredPrompt=e;
  setTimeout(()=>{
    if(!localStorage.getItem('pwa_dismissed')){
      showToast('📱 Instale o VagasPro no seu celular! Toque em ⋮ → Adicionar à tela inicial','info');
    }
  },8000);
});

// ===== INIT =====
(function init(){
  // Inicializar Supabase e configurações
  initSupabase();
  setTimeout(inicializarGoogle, 1500);

  // Restaurar sessão salva (sessionStorage tem prioridade, depois localStorage)
  let saved = sessionStorage.getItem('vp_sess') || localStorage.getItem('vp_sess');

  if(saved){
    try{
      const u = JSON.parse(saved);
      // Validação mínima — deve ter email e nivel
      if(u && u.email && u.nivel && ['superadmin','admin','supervisor','recrutador','candidato'].includes(u.nivel)){
        fazerLogin(u);
        return;
      }
    } catch(e){
      // Sessão corrompida — limpar
      sessionStorage.removeItem('vp_sess');
      localStorage.removeItem('vp_sess');
      localStorage.removeItem('vp_rem');
    }
  }

  renderDashboard(); filtrarVagas(); renderNoticias('rh'); renderSQL(); renderConfig();
})();
