// ═══════════════════════════════════════════════════════════
// VagasPro · app.js · Ciberic.Lab
// Sistema Inteligente de Vagas de Emprego — Goiás e região
// ═══════════════════════════════════════════════════════════
/* jshint esversion:6 */
'use strict';


// ── Error catcher (debug) ───────────────────────────────────────
window.onerror = function(msg, src, line, col, err) {
  console.error('[VagasPro]', msg, 'L'+line, src);
  return false;
};
// ══════════════════════════════════════════════════════
// RESEND — Envio de E-mails Transacionais
// Configure sua API Key em Configurações → IA e Integrações
// ══════════════════════════════════════════════════════
var RESEND_API_KEY = localStorage.getItem('vp_resend_key') || '';
var RESEND_FROM    = localStorage.getItem('vp_resend_from') || 'VagasPro <noreply\u0040seudominio.com>';
var ADMIN_EMAIL    = localStorage.getItem('vp_admin_email') || '';

async function _enviarEmailResend(para, assunto, htmlBody){
  // Envia via Supabase Edge Function — a API Key do Resend fica segura no servidor
  // NÃO envia a key pelo front-end
  console.info('[Email] Enviando via Edge Function para:', para);
  try{
    var resp = await fetch('https://wsvqzagbulfufyqowwfx.supabase.co/functions/v1/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': '{}'.replace('{}', window.__SUPA_ANON__ || '')
      },
      body: JSON.stringify({ _direct: true, para: para, assunto: assunto, html: htmlBody })
    });
    var data = await resp.json();
    if(resp.ok){ return { ok: true, id: data.id }; }
    else{ console.warn('[Email] Erro:', data); return { ok: false, erro: data }; }
  }catch(e){
    console.warn('[Email] Falha:', e);
    return { ok: false, erro: e.message };
  }
}

// Função central de email — chama Cloudflare Worker (key segura no servidor)
async function _notificarEmail(tipo, dados){
  // Worker URL — configure após fazer deploy no Cloudflare
  var workerUrl = localStorage.getItem('vp_worker_url') || 'https://send-email.SEU-USUARIO.workers.dev';

  if(!workerUrl || workerUrl.includes('SEU-USUARIO')){
    console.info('[Email] Worker URL não configurada — configure em Configurações.');
    return { ok: false, motivo: 'sem_url' };
  }

  try{
    var payload = Object.assign({ tipo: tipo }, dados);
    var resp = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    var data = await resp.json();
    if(resp.ok){
      console.info('[Email] Enviado via Worker:', tipo, '| id:', data.id);
      return { ok: true };
    }
    console.warn('[Email] Worker erro:', data);
    return { ok: false, erro: data };
  }catch(e){
    console.warn('[Email] Falha Worker:', e.message);
    return { ok: false, erro: e.message };
  }
}


// ═══════════════════════════════════════════════════════════
// CONFIGURAÇÃO DO BANCO DE DADOS
// Substitua pelas suas credenciais do painel:
// ═══════════════════════════════════════════════════════════
const SUPABASE_URL  = 'https://wsvqzagbulfufyqowwfx.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzdnF6YWdidWxmdWZ5cW93d2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTYwNzgsImV4cCI6MjA5MTA5MjA3OH0.Nat7Ba1pzzYJDM8jZoZqg_D7rg8Kb4v7Cnzq1uU005Q';
let _sb = null;

// Inicializa cliente Supabase (se credenciais configuradas)
function initDB(){
  try{
    if(!SUPABASE_URL || !SUPABASE_URL.startsWith('https://') || SUPABASE_URL.includes('SEU-PROJETO')) return;
    _sb = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false
      }
    });
    if(_sb) console.info('[VagasPro] Banco conectado:', SUPABASE_URL);
  } catch(e){ console.warn('[VagasPro] Banco nao configurado — verifique as credenciais'); }
}

// ===== DATA =====
const VAGAS_DB=[
  {id:1,titulo:'Cozinheiro(a)',empresa:'Empório do Lago',setor:'Alimentação',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'R$ 1.800,00',jornada:'Escala 6x1 – 16h às 22h',status:'aberto',destaque:'Venha fazer parte de uma equipe apaixonada por sabores!',requisitos:['Ensino fundamental','Experiência em restaurante','Disposição para aprender','Trabalho em equipe','Pontualidade'],atividades:['Preparar pratos do menu','Manter higiene da cozinha','Controlar estoque'],beneficios:['Vale transporte ou combustível','Refeição na empresa','Seguro de vida','Plano de saúde','Plano odontológico','Prêmio por assiduidade'],whatsapp:'(62) 98459-1750',email:'',logo:'🍳',dias:2,favorito:false,interesse:false,interessados:3,criado_por:'Empório do Lago',max_candidatos:null},
  {id:2,titulo:'Auxiliar de Serviços Gerais',empresa:'Empório do Lago',setor:'Alimentação',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'R$ 1.700,00',jornada:'Escala 6x1 – 09h às 18h',status:'aberto',destaque:'',requisitos:['Ensino fundamental','Noções de limpeza','Trabalho em equipe'],atividades:['Limpeza e organização','Apoio geral'],beneficios:['Vale transporte','Refeição','Seguro de vida','Plano de saúde'],whatsapp:'(62) 98459-1750',email:'',logo:'🧹',dias:2,favorito:false,interesse:false,interessados:1,criado_por:'Empório do Lago',max_candidatos:20},
  {id:3,titulo:'Atendente de Caixa e Recepção',empresa:'Empório do Lago',setor:'Alimentação',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'R$ 1.800 → R$ 2.000',jornada:'Escala 6x1 – 09h às 18h',status:'urgente',destaque:'Crescimento salarial após 90 dias!',requisitos:['Ensino médio','Noções de informática','Boa comunicação'],atividades:['Atendimento ao cliente','Operação do caixa'],beneficios:['Vale transporte','Refeição','Seguro de vida','Plano de saúde'],whatsapp:'(62) 98459-1750',email:'',logo:'🛒',dias:2,favorito:false,interesse:false,interessados:7,criado_por:'Empório do Lago',max_candidatos:10},
  {id:4,titulo:'Supervisor de Funilaria',empresa:'Viação Reunidas',setor:'Manutenção',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'A combinar',jornada:'Disponibilidade de horário',status:'aberto',destaque:'Lidere uma equipe de alta performance!',requisitos:['Experiência com funilaria','Liderança de equipe'],atividades:['Supervisionar funilaria e pintura','Liderar equipe'],beneficios:['VA: R$ 1.146,00','VT: 100%','Plano de saúde'],whatsapp:'',email:'soutalento'+'@'+'viacaoreunidas-go.com.br',logo:'🚌',dias:5,favorito:false,interesse:false,interessados:2,criado_por:'Viação Reunidas',max_candidatos:null},
  {id:5,titulo:'Supervisor de Mecânica',empresa:'Viação Reunidas',setor:'Manutenção',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'A combinar',jornada:'Disponibilidade de horário',status:'aberto',destaque:'',requisitos:['Experiência com veículos pesados','Liderança'],atividades:['Supervisionar manutenção da frota'],beneficios:['VA: R$ 1.146,00','VT: 100%','Plano de saúde'],whatsapp:'',email:'soutalento'+'@'+'viacaoreunidas-go.com.br',logo:'🔧',dias:5,favorito:false,interesse:false,interessados:4,criado_por:'Viação Reunidas',max_candidatos:null},
  {id:6,titulo:'Supervisor de Elétrica Veicular',empresa:'Viação Reunidas',setor:'Manutenção',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'A combinar',jornada:'Disponibilidade de horário',status:'urgente',destaque:'',requisitos:['Experiência com elétrica veicular','Liderança','Diagnóstico elétrico'],atividades:['Supervisionar manutenção elétrica','Diagnóstico de falhas'],beneficios:['VA: R$ 1.146,00','VT: 100%','Plano de saúde'],whatsapp:'',email:'soutalento'+'@'+'viacaoreunidas-go.com.br',logo:'⚡',dias:5,favorito:false,interesse:false,interessados:3,criado_por:'Viação Reunidas',max_candidatos:8},
  {id:7,titulo:'Auxiliar de Produção – Dermato',empresa:'Manipularte Farmácia',setor:'Saúde',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'Salário fixo',jornada:'44 horas semanais',status:'aberto',destaque:'Venha fazer parte do nosso TIME!',requisitos:['Ensino médio completo','Preferencialmente estudante de Farmácia','Atenção aos detalhes'],atividades:['Produção dermatológica','Controle de qualidade'],beneficios:['Plano de saúde','Plano odontológico'],whatsapp:'(62) 9862-0660',email:'rh'+'@'+'manipularte.com.br',logo:'💊',dias:1,favorito:false,interesse:false,interessados:9,criado_por:'Manipularte Farmácia',max_candidatos:10},
  {id:8,titulo:'Assistente de RH',empresa:'Pacto Soluções',setor:'RH',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'R$ 2.500,00',jornada:'08h às 18h – seg a sex',status:'aberto',destaque:'Junte-se a uma empresa que transforma vidas!',requisitos:['Superior em Psicologia ou Administração','Conhecimento em RH','Informática intermediária'],atividades:['Recrutamento e seleção','Desenvolvimento de pessoas'],beneficios:['R$ 2.500,00','Cartão alimentação','Plano de saúde','VT','Wellhub','Day off Aniversário'],whatsapp:'+55629181912085',email:'talentos'+'@'+'pactosolucoes.com.br',logo:'👥',dias:3,favorito:false,interesse:false,interessados:12,criado_por:'Pacto Soluções',max_candidatos:15},
  {id:9,titulo:'Operador de Moagem',empresa:'Apoiar RH – Indústria',setor:'Indústria',tipo:'CLT',cidade:'Goiânia',estado:'GO',salario:'R$ 2.663,85',jornada:'Escala 12x36 – 19h às 07h',status:'urgente',destaque:'Excelente pacote de benefícios!',requisitos:['Experiência como Operador de Máquinas Industriais'],atividades:['Operação de moagem industrial','Controle de produção'],beneficios:['Assiduidade: R$ 266,00','Cesta de Alimentos','Plano de saúde','VT'],whatsapp:'(62) 99347-2725',email:'rh5'+'@'+'apoiarh.com.br',logo:'⚙️',dias:7,favorito:false,interesse:false,interessados:6,criado_por:'Apoiar RH',max_candidatos:null},
];

const CANDS_MOCK=[
  {nome:'Ana Lima',email:'ana'+'@'+'email.com',whatsapp:'(62) 99111-2222',vaga_id:7,cargo:'Auxiliar de Produção',exp:'1 ano em farmácia de manipulação',dias:1,status:'novo'},
  {nome:'Carlos Souza',email:'carlos'+'@'+'email.com',whatsapp:'(62) 99333-4444',vaga_id:7,cargo:'Estudante de Farmácia',exp:'Sem experiência, cursando 3º período',dias:2,status:'contato'},
  {nome:'Fernanda Rocha',email:'fern'+'@'+'email.com',whatsapp:'(62) 99555-6666',vaga_id:8,cargo:'Estudante de Psicologia',exp:'Estágio em RH por 6 meses',dias:1,status:'entrevista'},
  {nome:'João Melo',email:'joao'+'@'+'email.com',whatsapp:'(62) 99777-8888',vaga_id:3,cargo:'Operador de Caixa',exp:'2 anos em supermercado',dias:3,status:'novo'},
  {nome:'Mariana Costa',email:'mari'+'@'+'email.com',whatsapp:'(62) 99999-0000',vaga_id:1,cargo:'Cozinheira',exp:'3 anos em restaurante italiano',dias:4,status:'contratado'},
];

let vagasLocal=[...VAGAS_DB];
let tagsData={req:[],atv:[],ben:[],cvHabil:[]};
let vagaAtual=null;
let currentUser=null;

let pendingRegister=null;
let cvExps=[];let cvEdus=[];
let cvFotoData=null;

// ===== NAV =====
const PAGE_TITLES={dashboard:'Dashboard',vagas:'Vagas em Aberto',cadastrar:'Cadastrar Nova Vaga',favoritos:'Vagas Favoritas','meus-interesses':'Meus Interesses',curriculo:'Fazer Currículo com IA',interessados:'Candidatos por Vaga','perfil-rec':'Perfil da Empresa',empresas:'Empresas',alertas:'Alertas',usuarios:'Usuários',noticias:'Links Importantes',configuracoes:'Configurações',_sb:'Banco de Dados'};

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
  if(page==='cadastrar')_preencherPublicadoPor();
  if(page==='favoritos')renderFavoritos();
  if(page==='meus-interesses')renderInteresses();
  // Links Importantes — página estática, sem renderização JS necessária
  if(page==='_sb')renderSQL();
  if(page==='dashboard')renderDashboard();
  if(page==='interessados')renderInteressados();
  if(page==='usuarios')carregarUsuarios();
  if(page==='configuracoes')renderConfig();
  if(page==='curriculo')updateCVPreview();
  if(page==='kanban')renderKanban();
  if(page==='interessados')renderInteressados();
  if(page==='meu-perfil')renderMeuPerfil();
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
// Autentica exclusivamente via tabela usuarios
// =====================================================

function loginGoogle(){
  var clientId = '1092598675813-dkvnuhurr4aphkfv89pptg6utf63r026.apps.googleusercontent.com';
  // Tentar Google Identity Services (nova API)
  if(typeof google !== 'undefined' && google.accounts && google.accounts.oauth2){
    var client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'email profile openid',
      callback: function(resp){
        if(resp.error){ showToast('Erro Google: '+resp.error,'error'); return; }
        // Buscar perfil com o access_token
        fetch('https://www.googleapis.com/oauth2/v3/userinfo',{
          headers:{ Authorization: 'Bearer '+resp.access_token }
        }).then(function(r){return r.json();})
          .then(function(p){
            _loginComPerfil(_sanitize(p.email||''), _sanitize(p.name||''), p.picture||'');
          }).catch(function(){ showToast('Erro ao obter perfil Google.','error'); });
      }
    });
    client.requestAccessToken();
    return;
  }
  // Fallback: gapi legado
  if(typeof gapi !== 'undefined' && gapi.auth2){
    gapi.auth2.getAuthInstance().signIn()
      .then(function(googleUser){
        var p=googleUser.getBasicProfile();
        _loginComPerfil(_sanitize(p.getEmail()||''), _sanitize(p.getName()||''), p.getImageUrl()||'');
      })
      .catch(function(err){
        if(err.error==='popup_closed_by_user')return;
        showToast('Erro ao autenticar com Google.','error');
      });
    return;
  }
  showToast('Biblioteca Google carregando... tente em instantes.','info');
  setTimeout(loginGoogle, 2000);
}

function inicializarGoogle(){
  // Google Identity Services (nova API) - não precisa de init
  // gapi legado como fallback
  if(typeof gapi !== 'undefined'){
    try{
      gapi.load('auth2',function(){
        gapi.auth2.init({ client_id:'1092598675813-dkvnuhurr4aphkfv89pptg6utf63r026.apps.googleusercontent.com' }).catch(function(){});
      });
    }catch(e){}
  }
}

// Busca perfil real na tabela usuarios e faz login
async function _loginComPerfil(email, nomeGoogle, avatar){
  if(!email){showToast('E-mail não obtido.','error');return;}
  if(!_sb){showToast('Banco não configurado.','error');return;}
  try{
    // Usar RPC fn_buscar_usuario_google (SECURITY DEFINER — bypassa RLS)
    // Se a função não existir, tenta .from() direto como fallback
    var uid = null, nome = null, nivel = null, status = null;

    // Tentativa 1: RPC específica para Google (bypassa RLS)
    try{
      var rpc = await _sb.rpc('fn_buscar_usuario_google', { p_email: email });
      if(!rpc.error && rpc.data){
        uid    = rpc.data.id;
        nome   = rpc.data.nome;
        nivel  = rpc.data.nivel;
        status = rpc.data.status;
      }
    }catch(e){ /* RPC não existe ainda — tentar fallback */ }

    // Tentativa 2: query direta (funciona sem RLS ou com policy permissiva)
    if(!uid){
      var res = await _sb.from('usuarios')
        .select('id,nome,nivel,status')
        .eq('email', email).maybeSingle();
      if(!res.error && res.data){
        uid    = res.data.id;
        nome   = res.data.nome;
        nivel  = res.data.nivel;
        status = res.data.status;
      }
    }

    // Tentativa 3: fn_auth_login com senha inválida → se retornar erro de senha (não de "não existe") a conta existe
    if(!uid){
      try{
        var rpc2 = await _sb.rpc('fn_auth_login', { p_email: email, p_senha: '__GOOGLE_AUTH__' });
        if(!rpc2.error && rpc2.data){
          // ok:false mas com id = conta existe, senha só é diferente
          if(rpc2.data.id){
            uid    = rpc2.data.id;
            nome   = rpc2.data.nome;
            nivel  = rpc2.data.nivel;
            status = rpc2.data.status || 'ativo';
          }
        }
      }catch(e){}
    }

    if(uid){
      if(status === 'suspenso'){
        showToast('Conta suspensa. Entre em contato com o suporte.','error');
        return;
      }
      // Atualizar avatar Google
      try{ await _sb.rpc('fn_atualizar_usuario',{p_id:uid, p_avatar_url:avatar||null}); }catch(e){}
      fazerLogin({
        id: uid,
        nome: _sanitize(nome) || nomeGoogle,
        email: email,
        nivel: nivel || 'candidato',
        avatar: avatar
      });
      return;
    }

    // Conta realmente não existe — mostrar modal de cadastro
    _mostrarModalCadastroGoogle(email, nomeGoogle, avatar);

  }catch(e){
    console.warn('[_loginComPerfil]',e);
    showToast('Erro ao verificar conta. Tente novamente.','error');
  }
}

// Modal para novo usuário Google escolher tipo de conta
function _mostrarModalCadastroGoogle(email, nome, avatar){
  var modal = document.getElementById('googleRegModal');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'googleRegModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,58,.7);z-index:3500;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px);';
    modal.innerHTML = `
      <div style="background:white;border-radius:24px;padding:36px 32px;max-width:420px;width:100%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.2);animation:fadeUp .22s ease;">
        <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#a78bfa);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;overflow:hidden;">
          <img id="gRegAvatar" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">
        </div>
        <div style="font-size:20px;font-weight:900;color:var(--g900);margin-bottom:6px;">Bem-vindo(a)!</div>
        <div style="font-size:13.5px;color:var(--g500);margin-bottom:4px;font-weight:600;" id="gRegNome"></div>
        <div style="font-size:12px;color:var(--accent);font-weight:700;margin-bottom:22px;" id="gRegEmail"></div>
        <div style="font-size:14px;font-weight:800;color:var(--g800);margin-bottom:14px;">Como deseja usar o VagasPro?</div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:22px;">
          <button onclick="_concluirCadastroGoogle('candidato')" style="display:flex;align-items:center;gap:14px;padding:14px 18px;border:2px solid var(--g200);border-radius:var(--r-sm);background:white;cursor:pointer;transition:all .18s;font-family:inherit;text-align:left;width:100%;"
            onmouseenter="this.style.borderColor='var(--accent)';this.style.background='var(--accent-soft)'"
            onmouseleave="this.style.borderColor='var(--g200)';this.style.background='white'">
            <span style="font-size:28px;">👤</span>
            <div>
              <div style="font-size:14px;font-weight:800;color:var(--g900);">Candidato</div>
              <div style="font-size:12px;color:var(--g500);font-weight:600;">Estou buscando emprego</div>
            </div>
          </button>
          <button onclick="_concluirCadastroGoogle('recrutador')" style="display:flex;align-items:center;gap:14px;padding:14px 18px;border:2px solid var(--g200);border-radius:var(--r-sm);background:white;cursor:pointer;transition:all .18s;font-family:inherit;text-align:left;width:100%;"
            onmouseenter="this.style.borderColor='var(--green2)';this.style.background='var(--green-soft)'"
            onmouseleave="this.style.borderColor='var(--g200)';this.style.background='white'">
            <span style="font-size:28px;">🏢</span>
            <div>
              <div style="font-size:14px;font-weight:800;color:var(--g900);">Recrutador</div>
              <div style="font-size:12px;color:var(--g500);font-weight:600;">Publico vagas e contrato pessoas</div>
            </div>
          </button>
        </div>
        <div style="font-size:11px;color:var(--g400);line-height:1.6;">
          Ao continuar, você aceita os
          <span onclick="abrirModalTermos()" style="color:var(--accent);cursor:pointer;font-weight:700;text-decoration:underline;">Termos de Uso e Privacidade</span>
          da Ciberic.Lab.
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  // Preencher dados
  var avatarEl = document.getElementById('gRegAvatar');
  if(avatarEl && avatar) avatarEl.src = avatar;
  var nomeEl = document.getElementById('gRegNome');
  if(nomeEl) nomeEl.textContent = nome || '';
  var emailEl = document.getElementById('gRegEmail');
  if(emailEl) emailEl.textContent = email || '';
  // Guardar dados temporários
  modal._gEmail = email;
  modal._gNome  = nome;
  modal._gAvatar = avatar;
  modal.style.display = 'flex';
}

async function _concluirCadastroGoogle(nivel){
  var modal = document.getElementById('googleRegModal');
  if(!modal) return;
  var email  = modal._gEmail;
  var nome   = modal._gNome;
  var avatar = modal._gAvatar;
  modal.style.display = 'none';

  if(!_sb){ showToast('Banco não configurado.','error'); return; }
  showToast('⏳ Criando sua conta...','info');

  try{
    // Recrutador → cadastrar como "pendente" aguardando aprovação admin
    var nivelReal = nivel === 'recrutador' ? 'candidato' : nivel; // começa como candidato
    var senhaTmp = 'G_' + Math.random().toString(36).slice(2,10) + '_' + Date.now();
    var res = await _sb.rpc('fn_auth_register',{
      p_nome:   nome,
      p_email:  email,
      p_senha:  senhaTmp,
      p_nivel:  nivelReal
    });
    if(!res.data || !res.data.ok){
      showToast((res.data&&res.data.erro)||'Erro ao criar conta.','error');
      return;
    }
    var uid = res.data.id;

    if(nivel === 'recrutador' && uid){
      // Salvar solicitação via RPC (bypassa RLS)
      try{
        var solRes = await _sb.rpc('fn_criar_solicitacao_recrutador',{
          p_usuario_id: uid,
          p_nome: nome,
          p_email: email,
          p_avatar_url: avatar||null,
          p_origem: 'google'
        });
        if(solRes.error) throw solRes.error;
        console.info('[VagasPro] Solicitação recrutador criada:', uid);
      }catch(e){
        // Fallback: insert direto
        try{
          await _sb.from('solicitacoes_recrutador').insert({
            usuario_id:uid, nome:nome, email:email,
            avatar_url:avatar||null, status:'pendente',
            origem:'google', created_at:new Date().toISOString()
          });
        }catch(e2){ console.warn('[solicitacao_rec fallback]',e2); }
      }
      // Notificar admins
      try{
        await _sb.rpc('fn_notificar_admin',{
          p_tipo: 'solicitacao_recrutador',
          p_titulo: 'Novo recrutador aguarda aprovacao',
          p_mensagem: nome+' solicitou acesso como recrutador via Google.',
          p_dados: JSON.stringify({usuario_id:uid,nome:nome,email:email})
        });
      }catch(e){
        try{
          await _sb.from('notificacoes_admin').insert({
            tipo:'solicitacao_recrutador',
            titulo:'Novo recrutador aguarda aprovacao',
            mensagem:nome+' ('+email+') solicitou acesso como recrutador via Google.',
            dados:JSON.stringify({usuario_id:uid,nome:nome,email:email}),
            lida:false, created_at:new Date().toISOString()
          });
        }catch(e2){}
      }
      // Notificar admin por email (Edge Function — key segura no servidor)
      _notificarEmail('nova_solicitacao_admin', { nome: nome, email: email });
      // Mostrar tela de aguardando aprovação
      modal.style.display = 'none';
      _mostrarTelaAguardandoAprovacao(nome, email);
      return;
    }
    // Marcar e-mail como verificado (Google já verificou) e salvar avatar
    var uid = res.data.id;
    if(uid){
      try{
        await _sb.rpc('fn_atualizar_usuario',{
          p_id: uid,
          p_avatar_url: avatar||null
        });
        await _sb.from('usuarios').update({
          email_verificado: true,
          aceite_termos: true,
          aceite_termos_em: new Date().toISOString()
        }).eq('id', uid);
      }catch(e){}
    }
    showToast('✅ Conta criada com Google!','success');
    fazerLogin({id:uid, nome:_sanitize(nome), email:_sanitize(email), nivel:nivel, avatar:avatar||''});
  }catch(e){
    showToast('Erro ao criar conta. Tente novamente.','error');
    console.warn('[_concluirCadastroGoogle]',e);
  }
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

  if(!_sb){
    reBtn();
    showToast('Banco de dados não configurado. Verifique as credenciais.','error');
    return;
  }

  try{
    // Tentativa 1: fn_auth_login (verifica hash bcrypt)
    var rpc=await _sb.rpc('fn_auth_login',{p_email:email,p_senha:senha});
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
    var direct=await _sb.from('usuarios')
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

  if(!_sb){
    reBtn();
    showToast('Serviço temporariamente indisponível.','error');
    return;
  }

  try{
    var res=await _sb.rpc('fn_auth_register',{p_nome:nome,p_email:email,p_senha:senha,p_nivel:nivel});
    reBtn();
    if(res.error||!res.data){showToast((res.error&&res.error.message)||'Erro ao criar conta.','error');return;}
    if(!res.data.ok){showToast(res.data.erro||'Não foi possível criar a conta.','error');return;}
    if(nivel==='recrutador'){var uid2=res.data.id;try{await _sb.from('solicitacoes_recrutador').insert({usuario_id:uid2,nome:nome,email:email,avatar_url:null,status:'pendente',origem:'email',created_at:new Date().toISOString()});await _sb.from('notificacoes_admin').insert({tipo:'solicitacao_recrutador',titulo:'Novo recrutador aguarda aprovacao',mensagem:nome+' ('+email+') solicitou acesso como recrutador.',dados:JSON.stringify({usuario_id:uid2,nome:nome,email:email}),lida:false,created_at:new Date().toISOString()});}catch(e){}reBtn();_mostrarTelaAguardandoAprovacao(nome,email);return;}_pendingRegister={nome:nome,email:email,nivel:nivel,id:res.data.id};
    _mostrarVerificacao(res.data.id,email);
  }catch(e){
    reBtn();
    showToast('Erro de conexão. Tente novamente.','error');
  }
}

var _pendingRegister=null;

async function _mostrarVerificacao(userId,email){
  if(_sb&&userId){
    try{await _sb.rpc('fn_gerar_codigo_verificacao',{p_usuario_id:userId});}catch(e){}
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

  if(_sb&&reg.id){
    try{
      var res=await _sb.rpc('fn_validar_codigo',{p_usuario_id:reg.id,p_codigo:entered});
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
  if(_pendingRegister&&_pendingRegister.id&&_sb){
    _mostrarVerificacao(_pendingRegister.id,_pendingRegister.email);
  }else{
    showToast('Sessão expirada. Tente criar a conta novamente.','error');
  }
}

function toggleSenha(inputId, btn) {
  var inp = document.getElementById(inputId);
  if (!inp) return;
  var isPassword = inp.type === 'password';
  inp.type = isPassword ? 'text' : 'password';
  var svg = document.getElementById('eyeIcon_' + inputId);
  if (svg) {
    // Eye-off icon when showing password, eye icon when hiding
    svg.innerHTML = isPassword
      ? '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
      : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
  btn.style.color = isPassword ? 'var(--accent)' : 'var(--g400)';
  inp.focus();
}

function showForgot(){
  showToast('📧 Contate: cibericlab'+'@'+'gmail.com para redefinir sua senha.','info');
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
  if(_sb&&user.email&&!user.id){
    try{
      var r=await _sb.from('usuarios')
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
  if(_sb){try{_sb.auth.signOut();}catch(e){}}
  window.location.reload();
}


function _preencherPublicadoPor(){
  var inp=document.getElementById('f-criado-por');
  var info=document.getElementById('f-criado-info');
  if(!inp||!currentUser)return;
  var now=new Date();
  var data=now.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'});
  var hora=now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  inp.value=currentUser.nome||currentUser.email||'';
  if(info)info.textContent='📅 '+data+' às '+hora+' · '+(_nivelLabel(currentUser.nivel)||'');
}
function _nivelLabel(n){
  return{superadmin:'SuperAdmin',admin:'Admin',supervisor:'Supervisor',
    recrutador:'Recrutador',candidato:'Candidato'}[n]||n||'';
}

function showLogoutModal(){
  var m=document.getElementById('logoutModal');
  if(m){m.classList.add('open');m.style.display='flex';}
}
function fecharLogoutModal(){
  var m=document.getElementById('logoutModal');
  if(m){m.classList.remove('open');m.style.display='';}
}
function confirmarLogout(){
  fecharLogoutModal();
  signOutGoogle();
}

function applyPerms(nivel){
  const perms={
    superadmin:['dashboard','vagas','cadastrar','favoritos','meus-interesses','kanban','curriculo','interessados','perfil-rec','empresas','alertas','usuarios','noticias','configuracoes','_sb'],
    admin:['dashboard','vagas','cadastrar','favoritos','kanban','interessados','perfil-rec','empresas','alertas','usuarios','noticias','configuracoes'],
    supervisor:['dashboard','vagas','favoritos','kanban','interessados','alertas','noticias','configuracoes'],
    recrutador:['dashboard','vagas','cadastrar','kanban','interessados','perfil-rec','alertas','noticias'],
    candidato:['dashboard','vagas','favoritos','meus-interesses','kanban','curriculo','alertas','noticias','meu-perfil'],
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

  // ── Visibilidade das seções do menu ──────────────────────────
  var isCand  = nivel==='candidato';
  var isRec   = nivel==='recrutador';
  var isAdmin = ['superadmin','admin'].includes(nivel);

  // Seção "Recrutador" — oculta para candidatos
  var secRec=document.getElementById('navSectionRecrutador');
  if(secRec) secRec.style.display=isCand?'none':'';

  // Seção "Gestão" — oculta para candidatos e recrutadores
  var secGest=document.getElementById('navSectionGestao');
  if(secGest) secGest.style.display=(isCand||isRec)?'none':'';

  // nav-perfil-rec — visível para recrutador e admin, oculto para candidatos
  var navPerfilRec=document.getElementById('nav-perfil-rec');
  if(navPerfilRec) navPerfilRec.style.display=(isAdmin||isRec)?'flex':'none';

  // nav meu-perfil — oculto para recrutador, visível para candidatos e admins
  var navMeuPerfil=document.getElementById('nav-meu-perfil');
  if(navMeuPerfil) navMeuPerfil.style.display=isRec?'none':'flex';

  // nav curriculo — oculto para recrutador
  var navCurriculo=document.getElementById('nav-curriculo');
  if(navCurriculo) navCurriculo.style.display=isRec?'none':'flex';

  // nav meus-interesses — oculto para recrutador
  var navMeusInt=document.getElementById('nav-meus-interesses');
  if(navMeusInt) navMeusInt.style.display=isRec?'none':'flex';
}

function showFeedbackBanner(){document.getElementById('feedbackBannerDash').style.display='flex';document.getElementById('mainContent').scrollTo(0,0);}


// ===== DASHBOARD =====


// ===== DASHBOARD =====
function renderDashboard(){
  var aberto  = vagasLocal.filter(function(v){return v.status==='aberto';}).length;
  var urgente = vagasLocal.filter(function(v){return v.status==='urgente';}).length;
  var nivel   = currentUser ? currentUser.nivel : 'candidato';
  var html    = '';
  if(['superadmin','admin','supervisor'].includes(nivel)){
    html = '<div class="stat-card blue"><div class="stat-lbl">Vagas em Aberto</div><div class="stat-val">'+aberto+'</div><div class="stat-chg">&#8593; 3 esta semana</div><div class="stat-ico">&#x1F4BC;</div></div>'
         + '<div class="stat-card green"><div class="stat-lbl">Urgentes</div><div class="stat-val">'+urgente+'</div><div class="stat-chg">Alta prioridade</div><div class="stat-ico">&#x1F525;</div></div>'
         + '<div class="stat-card amber"><div class="stat-lbl">Candidatos</div><div class="stat-val">'+CANDS_MOCK.length+'</div><div class="stat-ico">&#x1F465;</div></div>'
         + '<div class="stat-card purple"><div class="stat-lbl">Total Interesses</div><div class="stat-val">'+vagasLocal.reduce(function(a,v){return a+v.interessados;},0)+'</div><div class="stat-ico">&#11088;</div></div>';
  } else if(nivel === 'recrutador'){
    var mv=vagasLocal.filter(function(v){return !currentUser||!v.criado_por||v.criado_por.includes(currentUser.nome);});
    var ab=mv.filter(function(v){return v.status==='aberto';}).length;
    var ur=mv.filter(function(v){return v.status==='urgente';}).length;
    var en=mv.filter(function(v){return v.status==='encerrado';}).length;
    var ra=mv.filter(function(v){return v.status==='rascunho';}).length;
    var ag=mv.filter(function(v){return v.status==='agendado';}).length;
    var it=mv.reduce(function(a,v){return a+(v.interessados||0);},0);
    html = '<div class="stat-card blue" style="cursor:pointer" data-nav="vagas"><div class="stat-lbl">Total de Vagas</div><div class="stat-val">'+mv.length+'</div><div class="stat-chg">todas as minhas vagas</div><div class="stat-ico">&#x1F4BC;</div></div>'
         + '<div class="stat-card green" style="cursor:pointer" data-nav="vagas"><div class="stat-lbl">Vagas Ativas</div><div class="stat-val">'+(ab+ur)+'</div><div class="stat-chg">abertas + urgentes</div><div class="stat-ico">&#x2705;</div></div>'
         + '<div class="stat-card amber" style="cursor:pointer" data-nav="vagas"><div class="stat-lbl">Urgentes</div><div class="stat-val">'+ur+'</div><div class="stat-chg">alta prioridade</div><div class="stat-ico">&#x1F525;</div></div>'
         + '<div class="stat-card purple" style="cursor:pointer" data-nav="interessados"><div class="stat-lbl">Total Candidatos</div><div class="stat-val">'+it+'</div><div class="stat-chg">interesses recebidos</div><div class="stat-ico">&#x1F465;</div></div>'
         + '<div class="stat-card" style="background:var(--g50);border:1.5px solid var(--g200);cursor:pointer" data-nav="vagas"><div class="stat-lbl" style="color:var(--g500)">Encerradas</div><div class="stat-val" style="color:var(--g600)">'+en+'</div><div class="stat-ico" style="color:var(--g400)">&#x1F512;</div></div>'
         + (ra>0 ? '<div class="stat-card" style="background:#f8fafc;border:1.5px solid #cbd5e1;cursor:pointer" data-nav="vagas"><div class="stat-lbl" style="color:#64748b">Rascunhos</div><div class="stat-val" style="color:#475569">'+ra+'</div><div class="stat-ico" style="color:#94a3b8">&#x1F4DD;</div></div>' : '')
         + (ag>0 ? '<div class="stat-card" style="background:#f0fdf4;border:1.5px solid #86efac;cursor:pointer" data-nav="vagas"><div class="stat-lbl" style="color:#15803d">Agendadas</div><div class="stat-val" style="color:#16a34a">'+ag+'</div><div class="stat-ico" style="color:#22c55e">&#x1F4C5;</div></div>' : '');
  } else {
    var favs=vagasLocal.filter(function(v){return v.favorito;}).length;
    var ints=vagasLocal.filter(function(v){return v.interesse;}).length;
    html = '<div class="stat-card blue"><div class="stat-lbl">Vagas Dispon&#237;veis</div><div class="stat-val">'+(aberto+urgente)+'</div><div class="stat-ico">&#x1F4BC;</div></div>'
         + '<div class="stat-card green"><div class="stat-lbl">Favoritos</div><div class="stat-val">'+favs+'</div><div class="stat-ico">&#x2665;</div></div>'
         + '<div class="stat-card amber"><div class="stat-lbl">Meus Interesses</div><div class="stat-val">'+ints+'</div><div class="stat-ico">&#11088;</div></div>'
         + '<div class="stat-card purple"><div class="stat-lbl">Urgentes</div><div class="stat-val">'+urgente+'</div><div class="stat-ico">&#x1F525;</div></div>';
  }
  document.getElementById('dashStats').innerHTML = html;
  document.querySelectorAll('#dashStats [data-nav]').forEach(function(el){
    el.addEventListener('click',function(){var pg=this.dataset.nav;navTo(pg,document.getElementById('nav-'+pg));});
  });
  document.getElementById('donutTotal').textContent=vagasLocal.length;
  var meses=['Jan','Fev','Mar','Abr','Mai','Jun','Jul'];
  var vals=[4,6,5,8,7,10,vagasLocal.length];
  var mx=Math.max.apply(null,vals);
  document.getElementById('barChart').innerHTML=vals.map(function(v,i){return '<div class="bar-item"><div class="bar-val">'+v+'</div><div class="bar" style="height:'+(Math.round(v/mx*75)+8)+'px;"></div><div class="bar-lbl">'+meses[i]+'</div></div>';}).join('');
  // recentesDash - use a function to avoid quote issues
  var recHTML = '';
  vagasLocal.slice(0,4).forEach(function(v){
    recHTML += '<div style="background:white;border:1.5px solid var(--g200);border-radius:9px;padding:10px 13px;display:flex;align-items:center;gap:9px;cursor:pointer;transition:all .18s;" onclick="abrirModal('+v.id+')">';
    recHTML += '<div style="font-size:18px;">'+v.logo+'</div>';
    recHTML += '<div style="flex:1;min-width:0;">';
    recHTML += '<div style="font-size:12.5px;font-weight:800;color:var(--g900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+v.titulo+'</div>';
    recHTML += '<div style="font-size:10.5px;color:var(--g400);">'+v.empresa+' &middot; '+v.cidade+'</div>';
    recHTML += '</div>';
    recHTML += '<span class="badge '+sBadge(v.status)+'">'+sLabel(v.status)+'</span>';
    recHTML += '</div>';
  });
  document.getElementById('recentesDash').innerHTML = recHTML;
  setTimeout(renderTopRecrutador,80);
}


// ── Tela de aguardando aprovação (recrutador) ──────────────────────
function _mostrarTelaAguardandoAprovacao(nome, email){
  var lo = document.getElementById('loginOverlay');
  if(lo) lo.style.display = 'none';

  var existing = document.getElementById('aprovacaoOverlay');
  if(existing) existing.remove();

  var div = document.createElement('div');
  div.id = 'aprovacaoOverlay';
  div.style.cssText = 'position:fixed;inset:0;background:linear-gradient(155deg,#1a1f3a,#1e1b4b,#312e81);z-index:4000;display:flex;align-items:center;justify-content:center;padding:20px;';
  div.innerHTML = `
    <div style="background:white;border-radius:24px;padding:40px 36px;max-width:480px;width:100%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.3);">
      <div style="width:80px;height:80px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:24px;display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 20px;">⏳</div>
      <div style="font-size:22px;font-weight:900;color:var(--g900);margin-bottom:8px;letter-spacing:-.5px;">Solicitação enviada!</div>
      <div style="font-size:14px;color:var(--g500);margin-bottom:6px;font-weight:600;">Olá, <strong style="color:var(--g800);">${nome}</strong>!</div>
      <div style="font-size:13px;color:var(--g500);margin-bottom:24px;line-height:1.7;">
        Sua solicitação de acesso como <strong>Recrutador</strong> foi recebida e está em análise.<br>
        Você receberá uma notificação em <strong style="color:var(--accent);">${email}</strong> assim que for aprovado(a).
      </div>

      <!-- Status visual -->
      <div style="background:var(--amber-soft);border:1.5px solid #fcd34d;border-radius:var(--r-md);padding:16px;margin-bottom:24px;text-align:left;">
        <div style="font-size:12px;font-weight:800;color:#92400e;margin-bottom:10px;text-transform:uppercase;letter-spacing:.6px;">Status da solicitação</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:28px;height:28px;border-radius:50%;background:#22c55e;display:flex;align-items:center;justify-content:center;color:white;font-size:13px;flex-shrink:0;">✓</div>
            <div>
              <div style="font-size:12.5px;font-weight:700;color:var(--g800);">Cadastro realizado</div>
              <div style="font-size:11px;color:var(--g500);">Conta criada com sucesso</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:28px;height:28px;border-radius:50%;background:#f59e0b;display:flex;align-items:center;justify-content:center;color:white;font-size:13px;flex-shrink:0;animation:spin .7s linear infinite;">⏳</div>
            <div>
              <div style="font-size:12.5px;font-weight:700;color:var(--g800);">Aguardando aprovação</div>
              <div style="font-size:11px;color:var(--g500);">Admin analisando sua solicitação</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;opacity:.4;">
            <div style="width:28px;height:28px;border-radius:50%;background:var(--g300);display:flex;align-items:center;justify-content:center;color:white;font-size:13px;flex-shrink:0;">🏢</div>
            <div>
              <div style="font-size:12.5px;font-weight:700;color:var(--g800);">Acesso liberado</div>
              <div style="font-size:11px;color:var(--g500);">Você receberá e-mail de confirmação</div>
            </div>
          </div>
        </div>
      </div>

      <div style="font-size:12px;color:var(--g400);margin-bottom:20px;line-height:1.6;">
        ⏱️ O prazo médio de análise é de <strong>até 24 horas</strong>.<br>
        Em caso de dúvidas: <a href="mailto:cibericlab\u0040gmail.com" style="color:var(--accent);">cibericlab\u0040gmail.com</a>
      </div>

      <button onclick="document.getElementById('aprovacaoOverlay').remove();document.getElementById('loginOverlay').style.display='flex';"
        style="width:100%;height:46px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:white;border:none;border-radius:var(--r-pill);font-size:14px;font-weight:800;font-family:inherit;cursor:pointer;box-shadow:0 4px 18px rgba(91,106,240,.35);">
        Entendido → Ir para o login
      </button>
    </div>
  `;
  document.body.appendChild(div);
}

// ── Aprovar/Reprovar recrutador (chamado pelo admin no painel) ──
async function aprovarRecrutador(usuarioId, nome, email, aprovar){
  if(!_sb){ showToast('Sem conexão.','error'); return; }
  var novoNivel  = aprovar ? 'recrutador' : 'candidato';
  var novoStatus = aprovar ? 'ativo'      : 'ativo';
  try{
    // Atualizar nível do usuário
    await _sb.rpc('fn_atualizar_usuario',{
      p_id: usuarioId,
      p_nivel: novoNivel,
      p_status: novoStatus
    });
    // Atualizar status da solicitação
    await _sb.from('solicitacoes_recrutador')
      .update({ status: aprovar ? 'aprovado' : 'reprovado', respondido_em: new Date().toISOString() })
      .eq('usuario_id', usuarioId);
    // Registrar notificação para o próprio usuário
    await _sb.from('notificacoes_usuario').insert({
      usuario_id: usuarioId,
      tipo: aprovar ? 'aprovado_recrutador' : 'reprovado_recrutador',
      titulo: aprovar ? '✅ Acesso de Recrutador aprovado!' : '❌ Solicitação não aprovada',
      mensagem: aprovar
        ? 'Parabéns, '+nome+'! Seu acesso como Recrutador foi aprovado. Faça login para começar a publicar vagas.'
        : 'Olá, '+nome+'. Sua solicitação de acesso como Recrutador não foi aprovada desta vez. Entre em contato: cibericlab\u0040gmail.com',
      lida: false,
      created_at: new Date().toISOString()
    });
    showToast(aprovar ? '✅ Recrutador '+nome+' aprovado!' : '❌ Solicitação de '+nome+' reprovada.', aprovar ? 'success' : 'warning');
    // Enviar email de resultado ao candidato
    if(email){
      _enviarEmailResend(
        email,
        aprovar ? '✅ Acesso de Recrutador aprovado — VagasPro' : 'Atualização sobre sua solicitação — VagasPro',
        _emailAprovacaoRecrutador(nome, aprovar)
      ).then(function(r){
        if(r.ok) showToast('📧 E-mail enviado para '+email,'info');
      });
    }
    // Recarregar painel de solicitações se estiver aberto
    if(typeof renderSolicitacoesRecrutador === 'function') renderSolicitacoesRecrutador();
  }catch(e){
    showToast('Erro ao processar: '+e.message,'error');
    console.warn('[aprovarRecrutador]',e);
  }
}
// ────────────────────────────────────────────────────────────────


// ── Configurações Resend (chamado pelo painel de config) ──────────
function salvarConfigResend(){
  var url = (document.getElementById('workerUrl')||{}).value||'';
  if(!url || url.includes('SEU-USUARIO')){
    showToast('Informe a URL do seu Cloudflare Worker.','error');
    return;
  }
  // Só a URL pública do worker é salva — a key do Resend fica no Cloudflare
  localStorage.setItem('vp_worker_url', url.trim());
  showToast('✅ URL do Worker salva!','success');
  var st = document.getElementById('resendStatus');
  if(st) st.textContent = '✅ Worker configurado';
}

async function testarEmailResend(){
  var url = localStorage.getItem('vp_worker_url')||'';
  if(!url || url.includes('SEU-USUARIO')){
    showToast('⚙️ Configure a URL do Worker em Configurações antes de testar.','warning');
    return;
  }
  showToast('📧 Enviando e-mail de teste...','info');
  var r = await _notificarEmail('teste', {});
  if(r.ok) showToast('✅ E-mail de teste enviado! Verifique a caixa de entrada.','success');
  else showToast('❌ Falha: verifique se o Worker está deployado e as Secrets configuradas no Cloudflare.','error');
}
// ─────────────────────────────────────────────────────────────────


// ── Painel de solicitações de recrutador (admin) ─────────────────
async function renderSolicitacoesRecrutador(){
  var painel = document.getElementById('painelSolicitacoes');
  if(painel) painel.style.display = 'block';
  var lista = document.getElementById('listaSolicitacoes');
  if(!lista) return;
  lista.innerHTML = '<div style="text-align:center;padding:24px;color:var(--g400);">Carregando...</div>';
  if(!_sb){ lista.innerHTML = '<div style="color:var(--red);padding:12px;">Sem conexão com banco.</div>'; return; }
  try{
    // Tentar RPC primeiro (bypassa RLS), fallback para .from()
    var solics = [];
    try{
      var rpcRes = await _sb.rpc('fn_listar_solicitacoes_recrutador');
      if(!rpcRes.error && Array.isArray(rpcRes.data)) solics = rpcRes.data;
      else throw rpcRes.error || new Error('sem dados');
    }catch(e){
      var res = await _sb.from('solicitacoes_recrutador')
        .select('*').eq('status','pendente').order('created_at',{ascending:false});
      solics = res.data || [];
    }
    // Atualizar badge
    var nb = document.getElementById('nbSolicitacoes');
    if(nb) nb.textContent = solics.length > 0 ? solics.length : '';
    if(!solics.length){
      lista.innerHTML = '<div style="text-align:center;padding:20px;color:var(--g500);font-weight:600;">✅ Nenhuma solicitação pendente.</div>';
      return;
    }
    lista.innerHTML = solics.map(function(s){
      var dt = s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '';
      var origem = s.origem === 'google' ? '🟢 Google' : '📧 E-mail';
      return '<div style="background:white;border:1.5px solid var(--g200);border-radius:var(--r-md);padding:16px 18px;margin-bottom:10px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">'
        + '<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#a78bfa);display:flex;align-items:center;justify-content:center;color:white;font-size:15px;font-weight:800;flex-shrink:0;">'+(s.nome||'?').slice(0,2).toUpperCase()+'</div>'
        + '<div style="flex:1;min-width:160px;">'
          + '<div style="font-size:14px;font-weight:800;color:var(--g900);">'+(s.nome||'–')+'</div>'
          + '<div style="font-size:12px;color:var(--accent);font-weight:600;">'+(s.email||'–')+'</div>'
          + '<div style="font-size:11px;color:var(--g400);margin-top:3px;">'+origem+' · '+dt+'</div>'
        + '</div>'
        + '<div style="display:flex;gap:8px;flex-wrap:wrap;">'
          + '<button class="btn btn-green btn-sm" onclick="aprovarRecrutador(this.dataset.id,this.dataset.nome,this.dataset.email,true)" data-id="'+s.usuario_id+'" data-nome="'+s.nome+'" data-email="'+s.email+'">&#x2705; Aprovar</button>'
          + '<button class="btn btn-red btn-sm" onclick="aprovarRecrutador(this.dataset.id,this.dataset.nome,this.dataset.email,false)" data-id="'+s.usuario_id+'" data-nome="'+s.nome+'" data-email="'+s.email+'">&#x274C; Reprovar</button>'
        + '</div>'
      + '</div>';
    }).join('');
  }catch(e){
    lista.innerHTML = '<div style="color:var(--red);padding:12px;">Erro ao carregar solicitações: '+e.message+'</div>';
  }
}

// Verificar badge de solicitações ao carregar usuários
async function _verificarBadgeSolicitacoes(){
  if(!_sb) return;
  var nivel = currentUser ? currentUser.nivel : '';
  if(!['superadmin','admin'].includes(nivel)) return;
  try{
    var res = await _sb.from('solicitacoes_recrutador').select('id',{count:'exact'}).eq('status','pendente');
    var nb = document.getElementById('nbSolicitacoes');
    var count = res.count || 0;
    if(nb){ nb.textContent = count > 0 ? count : ''; nb.style.display = count > 0 ? 'inline' : 'none'; }
    if(count > 0) showToast('🏢 '+count+' solicitação(ões) de recrutador aguardando aprovação.','warning');
  }catch(e){}
}
// ────────────────────────────────────────────────────────────────


// ===== VAGAS RENDER =====
function renderVagas(lista){
  var g=document.getElementById('vagasGrid');
  var cnt=document.getElementById('vagasCount');
  if(cnt)cnt.textContent=lista.length;
  document.getElementById('nb-vagas').textContent=vagasLocal.filter(function(v){return v.status!=='encerrado';}).length;
  if(!lista.length){g.innerHTML='<div class="empty-state" style="grid-column:1/-1;"><div class="empty-ico">🔍</div><div class="empty-ttl">Nenhuma vaga encontrada</div><div class="empty-desc">Ajuste os filtros para encontrar oportunidades</div></div>';return;}
  g.innerHTML=lista.map(function(v){return cardVaga(v);}).join('');
}

function cardVaga(v){
  var nivel=currentUser?currentUser.nivel:'candidato';
  var isRec=['superadmin','admin','recrutador'].includes(nivel);
  var isCand=['candidato','supervisor'].includes(nivel)||!isRec;
  return '<div class="vaga-card" onclick="abrirModal('+v.id+')">'
    +'<div class="vaga-badges">'+(v.status==='urgente'?'<span class="badge badge-amber">🔥 Urgente</span>':'')+'<span class="badge '+sBadge(v.status)+'">'+sLabel(v.status)+'</span></div>'
    +'<div class="vaga-card-header"><div class="vaga-logo">'+v.logo+'</div><div class="vaga-info"><div class="vaga-titulo">'+v.titulo+'</div><div class="vaga-empresa">'+v.empresa+'</div></div></div>'
    +(v.destaque?'<div class="vaga-destaque">"'+v.destaque+'"</div>':'')
    +'<div class="vaga-meta"><div class="vaga-meta-item">📍 '+v.cidade+'–'+v.estado+'</div><div class="vaga-meta-item">⏱ '+v.jornada+'</div><div class="vaga-meta-item">📋 '+v.tipo+'</div></div>'
    +(v.salario?'<div class="vaga-sal">'+v.salario+'</div>':'')
    +'<div class="vaga-tags"><span class="tag">'+v.setor+'</span><span class="tag">'+v.tipo+'</span></div>'
    +'<div class="vaga-footer">'
      +'<div style="display:flex;flex-direction:column;gap:2px;">'
        +'<div class="vaga-dias">📅 '+(v.dias===0?'Hoje':v.dias===1?'Ontem':'há '+v.dias+' dias')+'</div>'
        +(v.criado_por?'<div style="font-size:9.5px;color:var(--g400);">✍️ '+v.criado_por+'</div>':'')
        +(v.status==='agendado'&&v.data_inicio?'<div style="font-size:9.5px;color:#15803d;font-weight:700;">🕒 Publica: '+new Date(v.data_inicio).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'</div>':'')
        +(v.status==='rascunho'?'<span style="font-size:9px;background:#f3f4f6;color:#64748b;padding:2px 6px;border-radius:999px;font-weight:700;">RASCUNHO</span>':'')
        +(v.data_fim&&v.status!=='encerrado'?'<div style="font-size:9.5px;color:var(--amber2);font-weight:700;">⏰ Encerra: '+new Date(v.data_fim).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'</div>':'')
      +'</div>'
      +'<div class="vaga-actions" onclick="event.stopPropagation()">'
        +(isRec?'<div style="display:flex;align-items:center;gap:4px;"><span style="font-size:10.5px;color:var(--g400);">👥 '+v.interessados+(v.max_candidatos?'/'+v.max_candidatos:'')+'</span>'+(v.max_candidatos&&v.interessados>=v.max_candidatos*0.9?'<span class="badge badge-red" style="font-size:9px;">⚠️ Limite</span>':'')+'</div>':'')
        +(isCand?'<button class="btn-icon fav '+(v.favorito?'on':'')+'" onclick="toggleFav('+v.id+')" title="Favoritar">♥</button>':'')
        +(isCand?'<button class="btn-icon int '+(v.interesse?'on':'')+'" onclick="toggleInteresse('+v.id+')" title="Tenho interesse">⭐</button>':'')
        +(isRec?'<button class="btn-icon" onclick="event.stopPropagation();editarVaga('+v.id+')" title="Editar vaga" style="color:var(--accent);">✏️</button><button class="btn-icon" onclick="event.stopPropagation();removerVaga('+v.id+')" title="Remover vaga" style="color:var(--red);">🗑️</button>':'')
        +'<button class="btn-icon" onclick="compartilharWACard('+v.id+')" title="WhatsApp">📱</button>'
        +'<button class="btn-icon" onclick="compartilharEmailCard('+v.id+')" title="E-mail">✉</button>'
      +'</div>'
    +'</div>'
  +'</div>';
}

function sBadge(s){return s==='aberto'?'badge-green':s==='urgente'?'badge-amber':s==='agendado'?'badge-blue':s==='rascunho'?'badge-gray':'badge-gray';}
function sLabel(s){return s==='aberto'?'Em Aberto':s==='urgente'?'Urgente':s==='agendado'?'⏳ Agendado':s==='rascunho'?'📝 Rascunho':'Encerrado';}

// ===== MODAL VAGA =====
function abrirModal(id){
  var v=vagasLocal.find(function(x){return x.id===id;});if(!v)return;vagaAtual=v;
  document.getElementById('ml-logo').textContent=v.logo;
  document.getElementById('ml-titulo').textContent=v.titulo;
  document.getElementById('ml-empresa').textContent=v.empresa;
  document.getElementById('ml-badge').className='badge '+sBadge(v.status);
  document.getElementById('ml-badge').textContent=sLabel(v.status);
  document.getElementById('ml-meta').innerHTML=['<span class="badge badge-gray">📍 '+v.cidade+'–'+v.estado+'</span>','<span class="badge badge-gray">⏱ '+v.jornada+'</span>','<span class="badge badge-gray">📋 '+v.tipo+'</span>','<span class="badge badge-gray">🏢 '+v.setor+'</span>',v.salario?'<span class="badge badge-green">💰 '+v.salario+'</span>':'','<span class="badge badge-sky">👥 '+v.interessados+' interessados</span>'].join('');
  var dest=document.getElementById('ml-destaque');
  if(v.destaque){dest.style.display='block';dest.textContent='"'+v.destaque+'"';}else{dest.style.display='none';}
  document.getElementById('ml-req').innerHTML=v.requisitos.map(function(r){return '<li>'+r+'</li>';}).join('');
  document.getElementById('ml-atv').innerHTML=v.atividades.map(function(a){return '<li>'+a+'</li>';}).join('');
  document.getElementById('ml-ben').innerHTML=v.beneficios.map(function(b){return '<li>'+b+'</li>';}).join('');
  document.getElementById('ml-contato').textContent=v.whatsapp||v.email||'–';
  document.getElementById('ml-local').textContent='📍 '+v.cidade+', '+v.estado;
  var nv=currentUser?currentUser.nivel:'candidato';
  var isRec=['superadmin','admin','recrutador'].includes(nv);
  var btn=document.getElementById('btnModalInt');
  var btnFav=document.getElementById('btnModalFav');
  if(isRec){
    btn.style.display='none';
    if(btnFav)btnFav.style.display='none';
    document.getElementById('ml-int-info').innerHTML='<div class="hl hl-green" style="font-size:12px;">👥 <strong>'+v.interessados+' candidatos</strong> interessados nesta vaga.</div>';
  }else{
    btn.style.display='flex';
    btn.textContent=v.interesse?'✅ Interesse Enviado':'⭐ Tenho Interesse';
    btn.className='btn btn-'+(v.interesse?'green':'ghost')+' btn-sm';
    if(btnFav){btnFav.style.display='flex';btnFav.textContent=v.favorito?'♥ Favorito':'♡ Favoritar';btnFav.className='btn btn-'+(v.favorito?'red':'ghost')+' btn-sm';}
    document.getElementById('ml-int-info').innerHTML='';
  }
  document.getElementById('modalVaga').classList.add('open');
}
function fecharModal(){document.getElementById('modalVaga').classList.remove('open');}
document.getElementById('modalVaga').addEventListener('click',function(e){if(e.target===this)fecharModal();});

function toggleFavModal(){
  if(!vagaAtual)return;toggleFav(vagaAtual.id);
  var v=vagasLocal.find(function(x){return x.id===vagaAtual.id;});
  var btn=document.getElementById('btnModalFav');
  if(btn){btn.textContent=v.favorito?'♥ Favorito':'♡ Favoritar';btn.className='btn btn-'+(v.favorito?'red':'ghost')+' btn-sm';}
}
function toggleInteresseModal(){
  if(!vagaAtual)return;toggleInteresse(vagaAtual.id);
  var v=vagasLocal.find(function(x){return x.id===vagaAtual.id;});
  var btn=document.getElementById('btnModalInt');
  btn.textContent=v.interesse?'✅ Interesse Enviado':'⭐ Tenho Interesse';
  btn.className='btn btn-'+(v.interesse?'green':'ghost')+' btn-sm';
}

// ===== FAV & INTERESSE =====
function toggleFav(id){
  var v=vagasLocal.find(function(x){return x.id===id;});if(!v)return;
  v.favorito=!v.favorito;
  if(!v.favoritos_count)v.favoritos_count=0;
  v.favoritos_count=v.favorito?v.favoritos_count+1:Math.max(0,v.favoritos_count-1);
  document.getElementById('nb-fav').textContent=vagasLocal.filter(function(x){return x.favorito;}).length;
  filtrarVagas();
  showToast(v.favorito?'♥ Adicionado aos favoritos!':'Removido dos favoritos',v.favorito?'success':'');
}
function toggleInteresse(id){
  var v=vagasLocal.find(function(x){return x.id===id;});if(!v)return;
  if(!v.interesse){v.interesse=true;v.interessados++;document.getElementById('nb-int').textContent=vagasLocal.filter(function(x){return x.interesse;}).length;filtrarVagas();showToast('⭐ Interesse enviado! Seus dados serão encaminhados à empresa responsável pela vaga.','success');checkLimites();}
  else{v.interesse=false;v.interessados--;document.getElementById('nb-int').textContent=vagasLocal.filter(function(x){return x.interesse;}).length;filtrarVagas();showToast('Interesse removido.','');}
}
function renderFavoritos(){
  var g=document.getElementById('favGrid');var favs=vagasLocal.filter(function(v){return v.favorito;});
  document.getElementById('favCount').textContent=favs.length+' salvas';
  document.getElementById('nb-fav').textContent=favs.length;
  if(!favs.length){g.innerHTML='<div class="empty-state" style="grid-column:1/-1;"><div class="empty-ico">♥</div><div class="empty-ttl">Nenhum favorito ainda</div><div class="empty-desc">Marque vagas com ♥</div></div>';return;}
  g.innerHTML=favs.map(function(v){return cardVaga(v);}).join('');
}
function renderInteresses(){
  var g=document.getElementById('interesseGrid');var ints=vagasLocal.filter(function(v){return v.interesse;});
  document.getElementById('nb-int').textContent=ints.length;
  if(!ints.length){g.innerHTML='<div class="empty-state" style="grid-column:1/-1;"><div class="empty-ico">⭐</div><div class="empty-ttl">Nenhum interesse ainda</div><div class="empty-desc">Clique em ⭐ nas vagas para demonstrar interesse</div></div>';return;}
  g.innerHTML=ints.map(function(v){return cardVaga(v);}).join('');
}

// ===== FILTERS =====
function filtrarVagas(){
  var q=(document.getElementById('globalSearch')?document.getElementById('globalSearch').value:'').toLowerCase();
  var st=(document.getElementById('filtroStatus')?document.getElementById('filtroStatus').value:'');
  var tp=(document.getElementById('filtroTipo')?document.getElementById('filtroTipo').value:'');
  var se=(document.getElementById('filtroSetor')?document.getElementById('filtroSetor').value:'');
  var lc=(document.getElementById('filtroLocal')?document.getElementById('filtroLocal').value:'').toLowerCase();
  var ord=(document.getElementById('filtroOrdem')?document.getElementById('filtroOrdem').value:'recente');
  var nv=currentUser?currentUser.nivel:'candidato';
  var isRec=['superadmin','admin','recrutador'].includes(nv);
  var res=vagasLocal.filter(function(v){
    if(!isRec&&(v.status==='rascunho'||v.status==='agendado'))return false;
    var txt=(v.titulo+v.empresa+v.cidade+v.setor+v.tipo).toLowerCase();
    return(!q||txt.includes(q))&&(!st||v.status===st)&&(!tp||v.tipo===tp)&&(!se||v.setor===se)&&(!lc||(v.cidade+v.estado).toLowerCase().includes(lc));
  });
  if(ord==='titulo')res.sort(function(a,b){return a.titulo.localeCompare(b.titulo);});
  else if(ord==='interesse')res.sort(function(a,b){return b.interessados-a.interessados;});
  else if(ord==='salario')res.sort(function(a,b){var pa=parseFloat((a.salario||'').replace(/[^\d,]/g,'').replace(',','.'));var pb=parseFloat((b.salario||'').replace(/[^\d,]/g,'').replace(',','.'));return pb-pa;});
  else res.sort(function(a,b){return a.dias-b.dias;});
  renderVagas(res);
}
function limparFiltros(){
  ['filtroStatus','filtroTipo','filtroSetor'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  var fl=document.getElementById('filtroLocal');if(fl)fl.value='';
  document.getElementById('globalSearch').value='';
  document.getElementById('filtroOrdem').value='recente';
  filtrarVagas();
}

// ===== TAGS =====
function addTag(e,field){
  if(e.key!=='Enter')return;var inp=e.target;var val=inp.value.trim();if(!val)return;
  tagsData[field].push(val);
  var wm={req:'reqWrap',atv:'atvWrap',ben:'benWrap',cvHabil:'cvHabilWrap'};
  var wrap=document.getElementById(wm[field]);
  var tagEl=document.createElement('div');tagEl.className='ti';
  tagEl.innerHTML=val+'<button type="button" onclick="removeTag(this,\''+field+'\',\''+val.replace(/'/g,"\\'")+'\')">\xd7</button>';
  wrap.insertBefore(tagEl,inp);inp.value='';
  if(field==='cvHabil')updateCVPreview();
}
function removeTag(btn,field,val){tagsData[field]=tagsData[field].filter(function(x){return x!==val;});btn.parentElement.remove();if(field==='cvHabil')updateCVPreview();}

// ===== CV BUILDER =====
let cvExpCount=0,cvEduCount=0;
function addExp(){
  cvExpCount++;var id='exp'+cvExpCount;var div=document.createElement('div');
  div.id=id;div.style.cssText='background:var(--g50);border:1.5px solid var(--g200);border-radius:var(--r-sm);padding:12px;margin-bottom:10px;';
  div.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-size:12px;font-weight:700;color:var(--g700);">Experiência '+cvExpCount+'</span><button class="btn btn-ghost btn-xs" onclick="document.getElementById(\''+id+'\').remove();updateCVPreview()">✕</button></div><div class="form-grid"><div class="form-group"><label class="form-lbl">Cargo/Função</label><input type="text" class="fi exp-cargo" placeholder="Ex: Cozinheiro" oninput="updateCVPreview()"></div><div class="form-group"><label class="form-lbl">Empresa</label><input type="text" class="fi exp-empresa" placeholder="Ex: Restaurante Bella" oninput="updateCVPreview()"></div><div class="form-group"><label class="form-lbl">Período</label><input type="text" class="fi exp-periodo" placeholder="Jan/2022 – Dez/2023" oninput="updateCVPreview()"></div><div class="form-group full"><label class="form-lbl">Descrição</label><textarea class="ft exp-desc" rows="2" placeholder="Responsabilidades e conquistas..." oninput="updateCVPreview()" style="height:60px;"></textarea></div></div>';
  document.getElementById('expList').appendChild(div);
}
function addEdu(){
  cvEduCount++;var id='edu'+cvEduCount;var div=document.createElement('div');
  div.id=id;div.style.cssText='background:var(--g50);border:1.5px solid var(--g200);border-radius:var(--r-sm);padding:12px;margin-bottom:10px;';
  div.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-size:12px;font-weight:700;color:var(--g700);">Formação '+cvEduCount+'</span><button class="btn btn-ghost btn-xs" onclick="document.getElementById(\''+id+'\').remove();updateCVPreview()">✕</button></div><div class="form-grid"><div class="form-group"><label class="form-lbl">Curso / Nível</label><input type="text" class="fi edu-curso" placeholder="Ex: Ensino Médio Completo" oninput="updateCVPreview()"></div><div class="form-group"><label class="form-lbl">Instituição</label><input type="text" class="fi edu-inst" placeholder="Ex: Escola Est. Marechal" oninput="updateCVPreview()"></div><div class="form-group"><label class="form-lbl">Ano de conclusão</label><input type="text" class="fi edu-ano" placeholder="Ex: 2020" oninput="updateCVPreview()"></div></div>';
  document.getElementById('eduList').appendChild(div);
}
function previewFotoCV(input){
  if(input.files[0]){var reader=new FileReader();reader.onload=function(e){cvFotoData=e.target.result;document.getElementById('fotoCVPreview').innerHTML='<img src="'+e.target.result+'"><div class="avatar-overlay">📷</div>';updateCVPreview();};reader.readAsDataURL(input.files[0]);}
}
function updateCVPreview(){
  var nome=document.getElementById('cv-nome')?document.getElementById('cv-nome').value:'';
  var cargo=document.getElementById('cv-cargo')?document.getElementById('cv-cargo').value:'';
  var email=document.getElementById('cv-email')?document.getElementById('cv-email').value:'';
  var tel=document.getElementById('cv-tel')?document.getElementById('cv-tel').value:'';
  var cidade=document.getElementById('cv-cidade')?document.getElementById('cv-cidade').value:'';
  var linkedin=document.getElementById('cv-linkedin')?document.getElementById('cv-linkedin').value:'';
  var resumo=document.getElementById('cv-resumo')?document.getElementById('cv-resumo').value:'';
  var idiomas=document.getElementById('cv-idiomas')?document.getElementById('cv-idiomas').value:'';
  var cursos=document.getElementById('cv-cursos')?document.getElementById('cv-cursos').value:'';
  var expItems=Array.from(document.querySelectorAll('[id^="exp"]')).map(function(el){return{cargo:el.querySelector('.exp-cargo')?el.querySelector('.exp-cargo').value:'',empresa:el.querySelector('.exp-empresa')?el.querySelector('.exp-empresa').value:'',periodo:el.querySelector('.exp-periodo')?el.querySelector('.exp-periodo').value:'',desc:el.querySelector('.exp-desc')?el.querySelector('.exp-desc').value:''};}).filter(function(e){return e.cargo;});
  var eduItems=Array.from(document.querySelectorAll('[id^="edu"]')).map(function(el){return{curso:el.querySelector('.edu-curso')?el.querySelector('.edu-curso').value:'',inst:el.querySelector('.edu-inst')?el.querySelector('.edu-inst').value:'',ano:el.querySelector('.edu-ano')?el.querySelector('.edu-ano').value:''};}).filter(function(e){return e.curso;});
  var habilidades=tagsData.cvHabil||[];
  var fotoHTML=cvFotoData?'<img src="'+cvFotoData+'" class="cv-photo" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid var(--accent);">':'<div class="cv-photo" style="width:72px;height:72px;border-radius:50%;background:var(--g100);display:flex;align-items:center;justify-content:center;font-size:28px;">👤</div>';
  var contatos=[email&&'📧 '+email,tel&&'📱 '+tel,cidade&&'📍 '+cidade,linkedin&&'🔗 '+linkedin].filter(Boolean);
  var html='<div class="cv-header-section">'+fotoHTML+'<div class="cv-name-block"><div class="cv-fullname">'+(nome||'Seu Nome Completo')+'</div><div class="cv-cargo">'+(cargo||'Cargo Desejado')+'</div><div class="cv-contacts">'+contatos.map(function(ct){return'<div class="cv-contact-item">'+ct+'</div>';}).join('')+'</div></div></div>'
    +(resumo?'<div class="cv-section-title">Resumo Profissional</div><div class="cv-body-text">'+resumo+'</div>':'')
    +(expItems.length?'<div class="cv-section-title">Experiência Profissional</div>'+expItems.map(function(e){return'<div class="cv-exp-item"><div class="cv-exp-title">'+e.cargo+'</div><div class="cv-exp-empresa">'+e.empresa+'</div><div class="cv-exp-periodo">'+e.periodo+'</div>'+(e.desc?'<div class="cv-exp-desc">'+e.desc+'</div>':'')+'</div>';}).join(''):'')
    +(eduItems.length?'<div class="cv-section-title">Formação Acadêmica</div>'+eduItems.map(function(e){return'<div class="cv-edu-item"><div><div class="cv-edu-title">'+e.curso+'</div><div class="cv-edu-inst">'+e.inst+'</div></div><div class="cv-edu-ano">'+e.ano+'</div></div>';}).join(''):'')
    +(habilidades.length?'<div class="cv-section-title">Habilidades</div><div class="cv-skills-grid">'+habilidades.map(function(h){return'<span class="cv-skill-tag">'+h+'</span>';}).join('')+'</div>':'')
    +(idiomas?'<div class="cv-section-title">Idiomas</div><div class="cv-body-text">'+idiomas+'</div>':'')
    +(cursos?'<div class="cv-section-title">Cursos e Certificações</div><div class="cv-body-text">'+cursos+'</div>':'')
    +'<div class="cv-refs">Referências disponíveis mediante solicitação</div>';
  var preview=document.getElementById('cvPagePreview');if(preview)preview.innerHTML=html;
}

// ===== CV PREVIEW MODAL =====
var _cvZoomLevel=1.0;
function abrirPreviewCV(){
  updateCVPreview();
  var src=document.getElementById('cvPagePreview');var dst=document.getElementById('cvModalPage');
  if(src&&dst){dst.innerHTML=src.innerHTML;dst.style.position='relative';dst.style.left='';dst.style.top='';dst.style.transform='scale('+_cvZoomLevel+')';dst.style.transformOrigin='top center';}
  _cvZoomLabel();var modal=document.getElementById('cvPreviewModal');if(modal){modal.classList.add('open');modal.scrollTop=0;}
}
function fecharPreviewCV(){var modal=document.getElementById('cvPreviewModal');if(modal)modal.classList.remove('open');}
function cvZoom(delta){
  _cvZoomLevel=Math.min(1.6,Math.max(0.4,_cvZoomLevel+delta));
  var page=document.getElementById('cvModalPage');
  if(page){page.style.transform='scale('+_cvZoomLevel+')';page.style.transformOrigin='top center';var h=page.offsetHeight*_cvZoomLevel;page.style.marginBottom=(h-page.offsetHeight)+'px';}
  _cvZoomLabel();
}
function _cvZoomLabel(){var lbl=document.getElementById('cvZoomLabel');if(lbl)lbl.textContent=Math.round(_cvZoomLevel*100)+'%';}

function exportarCVPDF(){
  var nome=document.getElementById('cv-nome')?document.getElementById('cv-nome').value:'curriculo';
  updateCVPreview();
  try{
    var jsPDF=window.jspdf.jsPDF;
    var doc=new jsPDF({format:'a4',unit:'mm'});
    var content=document.getElementById('cvPagePreview');
    if(!content){showToast('Preencha o currículo primeiro!','error');return;}
    doc.html(content,{callback:function(d){d.save(nome.replace(/\s+/g,'_')+'_curriculo.pdf');showToast('✅ Currículo exportado em PDF!','success');},x:10,y:10,width:190,windowWidth:794,autoPaging:'text',margin:[10,10,10,10]});
  }catch(e){
    var printWin=window.open('','_blank','width=900,height=700');
    var content2=document.getElementById('cvPagePreview')?document.getElementById('cvPagePreview').innerHTML:'';
    printWin.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:sans-serif;padding:20mm 18mm;}:root{--accent:#6366f1;}.cv-section-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--accent);margin-bottom:8px;margin-top:14px;}.cv-fullname{font-size:22px;font-weight:800;}.cv-cargo{font-size:13px;font-weight:600;color:var(--accent);margin-bottom:6px;}.cv-body-text{font-size:11.5px;color:#374151;line-height:1.6;}.cv-skill-tag{background:#eef2ff;color:#6366f1;padding:3px 9px;border-radius:999px;font-size:10.5px;font-weight:600;display:inline-block;margin:2px;}.cv-header-section{display:flex;gap:16px;margin-bottom:14px;padding-bottom:14px;border-bottom:2px solid #6366f1;}.cv-photo{width:68px;height:68px;border-radius:50%;object-fit:cover;border:2px solid #6366f1;}</style></head><body>'+content2+'</body></html>');
    printWin.document.close();printWin.focus();
    setTimeout(function(){printWin.print();printWin.close();},800);
    showToast('✅ Use Ctrl+P para salvar como PDF','info');
  }
}


function renderInteressados(){
  var nivel = currentUser?.nivel || 'candidato';
  var isRec = ['superadmin','admin','recrutador'].includes(nivel);

  // Stats gerais no topo
  var statsEl = document.getElementById('recrutadorStats');
  // Vagas do recrutador logado (ou todas para admin/superadmin)
  var minhasVagas = vagasLocal.filter(function(v){
    if(['superadmin','admin'].includes(nivel)) return true;
    return v.criado_por && currentUser && v.criado_por.includes(currentUser.nome);
  });

  var totalFav  = minhasVagas.reduce(function(a,v){ return a + (v.favoritos_count||0); }, 0);
  var totalInt  = minhasVagas.reduce(function(a,v){ return a + (v.interessados||0); }, 0);
  var totalVagas = minhasVagas.length;

  // Kanban agregado
  var kanbanCounts = {inscrito:0, contato:0, entrevista:0, aprovado:0, nao_avancou:0, rascunho:0};
  Object.values(kanbanRec).forEach(function(vagaKan){
    Object.values(vagaKan).forEach(function(etapa){
      if(kanbanCounts[etapa]!==undefined) kanbanCounts[etapa]++;
    });
  });

  statsEl.innerHTML = [
    '<div class="stat-card blue"><div class="stat-lbl">Vagas Publicadas</div><div class="stat-val">'+totalVagas+'</div><div class="stat-ico">💼</div></div>',
    '<div class="stat-card green"><div class="stat-lbl">Total Interesses</div><div class="stat-val">'+totalInt+'</div><div class="stat-ico">⭐</div></div>',
    '<div class="stat-card amber"><div class="stat-lbl">Total Favoritos</div><div class="stat-val">'+totalFav+'</div><div class="stat-ico">♥</div></div>',
    '<div class="stat-card purple"><div class="stat-lbl">Aprovados</div><div class="stat-val">'+kanbanCounts.aprovado+'</div><div class="stat-ico">✅</div></div>',
  ].join('');

  // Análise funil
  var totalKan = Object.values(kanbanCounts).reduce(function(a,b){return a+b;},0);

  var c = document.getElementById('vagasCandList');
  if(!minhasVagas.length){
    c.innerHTML = '<div class="empty-state"><div class="empty-ico">📋</div><div class="empty-ttl">Nenhuma vaga publicada ainda</div><div class="empty-desc">Cadastre vagas para acompanhar os candidatos aqui</div></div>';
    return;
  }

  // Ordenar por mais interessados
  var vagasOrdenadas = minhasVagas.slice().sort(function(a,b){ return (b.interessados||0)-(a.interessados||0); });

  // Funil geral (se houver kanban preenchido)
  var funilHTML = '';
  if(totalKan > 0){
    var etapas = [
      {key:'inscrito',    label:'Inscritos',    color:'#6366f1', icon:'📝'},
      {key:'contato',     label:'Contato Feito',color:'#0ea5e9', icon:'📞'},
      {key:'entrevista',  label:'Entrevista',   color:'#f59e0b', icon:'🗓️'},
      {key:'aprovado',    label:'Aprovados',    color:'#10b981', icon:'✅'},
      {key:'nao_avancou', label:'Não Avançou',  color:'#94a3b8', icon:'❌'},
      {key:'rascunho',    label:'Rascunho',     color:'#64748b', icon:'📝'},
    ];
    funilHTML = '<div style="background:white;border:1.5px solid var(--g150);border-radius:var(--r);padding:20px;margin-bottom:16px;box-shadow:var(--sh-xs);">' +
      '<div style="font-size:14px;font-weight:800;color:var(--g900);margin-bottom:14px;">📊 Funil de Candidatos (Kanban consolidado)</div>' +
      '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;">' +
      etapas.map(function(e){
        var n = kanbanCounts[e.key]||0;
        var pct = totalKan > 0 ? Math.round(n/totalKan*100) : 0;
        return '<div style="text-align:center;background:var(--g50);border-radius:var(--r-sm);padding:12px 8px;">' +
          '<div style="font-size:20px;margin-bottom:4px;">'+e.icon+'</div>' +
          '<div style="font-size:22px;font-weight:900;color:'+e.color+';">'+n+'</div>' +
          '<div style="font-size:10.5px;font-weight:700;color:var(--g600);margin-top:2px;">'+e.label+'</div>' +
          '<div style="font-size:10px;color:var(--g400);">'+pct+'%</div>' +
        '</div>';
      }).join('') +
      '</div></div>';
  }

  c.innerHTML = funilHTML + vagasOrdenadas.map(function(v){
    var intCount  = v.interessados    || 0;
    var favCount  = v.favoritos_count || 0;
    var maxCand   = v.max_candidatos;
    var pctInt    = maxCand ? Math.min(100,Math.round(intCount/maxCand*100)) : null;
    var vagaKan   = kanbanRec[v.id] || {};
    var kanCount  = Object.keys(vagaKan).length;
    var collapseId = 'kan-'+v.id;

    // Mini kanban desta vaga
    var ETAPAS = [
      {key:'inscrito',    label:'Inscrito',     color:'#6366f1'},
      {key:'contato',     label:'Contato Feito',color:'#0ea5e9'},
      {key:'entrevista',  label:'Entrevista',   color:'#f59e0b'},
      {key:'aprovado',    label:'Aprovado',     color:'#10b981'},
      {key:'nao_avancou', label:'Não Avançou',  color:'#94a3b8'},
      {key:'rascunho',    label:'Rascunho',     color:'#64748b'},
    ];

    // Gerar candidatos anônimos baseados em interessados
    var pseudoAnon = [];
    for(var i=0;i<intCount;i++){
      var etapaAtual = vagaKan[i] || 'inscrito';
      pseudoAnon.push({idx:i, etapa:etapaAtual});
    }

    var kanbanHTML = '';
    if(intCount > 0){
      kanbanHTML =
        '<div id="'+collapseId+'" style="display:none;margin-top:14px;border-top:1.5px solid var(--g100);padding-top:14px;">' +
          '<div style="font-size:12px;font-weight:700;color:var(--g600);margin-bottom:10px;">📋 Kanban de Candidatos <span style="color:var(--g400);font-weight:400;">(opcional · arraste para mover)</span></div>' +
          '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;">' +
          ETAPAS.map(function(col){
            var cands = pseudoAnon.filter(function(c){ return c.etapa===col.key; });
            return '<div style="background:var(--g50);border-radius:var(--r-sm);min-height:80px;">' +
              '<div style="background:'+col.color+';color:white;font-size:10px;font-weight:800;padding:6px 8px;border-radius:var(--r-sm) var(--r-sm) 0 0;text-align:center;">'+col.label+' <span style="opacity:.8;">('+cands.length+')</span></div>' +
              '<div style="padding:6px;" id="rkan-'+v.id+'-'+col.key+'"' +
                ' ondragover="event.preventDefault()"' +
                ' ondrop="dropRecKanEl(event,this)">' +
              (cands.length === 0
                ? '<div style="text-align:center;padding:10px 4px;font-size:10px;color:var(--g400);">–</div>'
                : cands.map(function(cd){
                    return '<div draggable="true"' +
                      ' ondragstart="dragRecKan(event,'+v.id+','+cd.idx+')"' +
                      ' style="background:white;border:1.5px solid var(--g200);border-radius:6px;padding:6px 8px;margin-bottom:5px;cursor:grab;font-size:10.5px;">' +
                      '<div style="font-weight:700;color:var(--g700);">👤 Candidato #'+(cd.idx+1)+'</div>' +
                      '<div style="color:var(--g400);font-size:9.5px;margin-top:2px;">⭐ Demonstrou interesse</div>' +
                    '</div>';
                  }).join('')
              ) +
              '</div></div>';
          }).join('') +
          '</div>' +
          '<div style="font-size:10.5px;color:var(--g400);margin-top:8px;">🔒 Por privacidade (LGPD), os nomes dos candidatos não são exibidos. Dados pessoais são encaminhados diretamente pela empresa.</div>' +
        '</div>';
    }

    return '<div style="background:white;border:1.5px solid var(--g200);border-radius:var(--r);padding:18px;margin-bottom:14px;box-shadow:var(--sh-xs);">' +
      // Cabeçalho da vaga
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">' +
        '<div style="font-size:22px;">'+v.logo+'</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-weight:800;font-size:14px;color:var(--g900);">'+v.titulo+'</div>' +
          '<div style="font-size:11.5px;color:var(--g500);">'+v.empresa+' · '+v.cidade+' · '+v.jornada+'</div>' +
          '<div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap;">' +
            '<span class="badge '+( v.status==='urgente'?'badge-amber':v.status==='encerrado'?'badge-gray':'badge-green' )+'">'+v.status+'</span>' +
            (v.dias===0?'<span class="badge badge-gray">Publicada hoje</span>':'<span class="badge badge-gray">há '+v.dias+'d</span>') +
          '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">' +
          '<button class="btn btn-ghost btn-xs" onclick="editarVaga('+v.id+')">✏️ Editar</button>' +
          (intCount>0?'<button class="btn btn-ghost btn-xs" onclick="exportarCSVCandidatos('+v.id+')">⬇ CSV</button>':'') +
        '</div>' +
      '</div>' +
      // Métricas
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px;">' +
        '<div style="background:var(--accent-soft);border-radius:var(--r-sm);padding:12px;text-align:center;">' +
          '<div style="font-size:24px;font-weight:900;color:var(--accent);">'+intCount+'</div>' +
          '<div style="font-size:11px;font-weight:700;color:var(--g600);">⭐ Interesses</div>' +
          (maxCand?'<div style="font-size:10px;color:var(--g400);">de '+maxCand+' vagas · '+pctInt+'%</div>':'') +
        '</div>' +
        '<div style="background:#fff7ed;border-radius:var(--r-sm);padding:12px;text-align:center;">' +
          '<div style="font-size:24px;font-weight:900;color:#ea580c;">'+favCount+'</div>' +
          '<div style="font-size:11px;font-weight:700;color:var(--g600);">♥ Favoritos</div>' +
        '</div>' +
        '<div style="background:var(--green-soft);border-radius:var(--r-sm);padding:12px;text-align:center;">' +
          '<div style="font-size:24px;font-weight:900;color:var(--green2);">'+kanCount+'</div>' +
          '<div style="font-size:11px;font-weight:700;color:var(--g600);">📋 No Kanban</div>' +
        '</div>' +
      '</div>' +
      // Barra de progresso do limite
      (maxCand?
        '<div style="margin-bottom:10px;">' +
          '<div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--g500);margin-bottom:4px;">' +
            '<span>Candidatos: '+intCount+'/'+maxCand+'</span><span>'+pctInt+'%</span>' +
          '</div>' +
          '<div style="height:6px;background:var(--g100);border-radius:999px;overflow:hidden;">' +
            '<div style="height:100%;width:'+Math.min(100,pctInt)+'%;background:'+(pctInt>=100?'var(--red)':pctInt>=90?'var(--amber)':'var(--accent)')+';border-radius:999px;transition:width .4s;"></div>' +
          '</div>' +
        '</div>'
      : '') +
      // Toggle kanban
      (intCount>0?
        '<button class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;font-size:11.5px;" onclick="toggleKanbanRec(this)" data-target="'+collapseId+'">' +
          '📋 Ver Kanban (' +intCount+ ' candidatos)' +
        '</button>'
      : '<div style="text-align:center;padding:10px;font-size:12px;color:var(--g400);">Nenhum candidato ainda</div>') +
      kanbanHTML +
    '</div>';
  }).join('');
}

function toggleKanbanRec(btnOrId, legacyBtn){
  var id = (typeof btnOrId === 'string') ? btnOrId
         : (btnOrId && btnOrId.dataset && btnOrId.dataset.target) ? btnOrId.dataset.target
         : legacyBtn;
  var btn = (typeof btnOrId === 'object') ? btnOrId : legacyBtn;
  var el = document.getElementById(id);
  if(!el) return;
  var open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  if(btn) btn.textContent = open
    ? btn.textContent.replace('▲','▼').replace('Fechar','Ver')
    : btn.textContent.replace('▼','▲').replace('Ver','Fechar');
}

var _dragRecKanVaga = null, _dragRecKanIdx = null;

function dropRecKanEl(e, el){
  e.preventDefault();
  var parts = el.id.split('-'); // rkan-vagaId-etapa
  var vagaId = parseInt(parts[1]);
  var etapa  = parts.slice(2).join('-');
  dropRecKan(e, vagaId, etapa);
}
function dragRecKan(e, vagaId, idx){
  _dragRecKanVaga = vagaId;
  _dragRecKanIdx  = idx;
  e.dataTransfer.effectAllowed = 'move';
}
function dropRecKan(e, vagaId, etapa){
  e.preventDefault();
  if(_dragRecKanVaga !== vagaId || _dragRecKanIdx === null) return;
  if(!kanbanRec[vagaId]) kanbanRec[vagaId] = {};
  kanbanRec[vagaId][_dragRecKanIdx] = etapa;
  _dragRecKanVaga = null; _dragRecKanIdx = null;
  renderInteressados();
  showToast('✅ Candidato movido para '+etapa+'!','success');
}

// ===== PERFIL RECRUTADOR =====
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
const USERS_MOCK=[
  // Usuários reais carregados do banco via carregarUsuarios()
  // Os dados abaixo são apenas placeholders iniciais
  {nome:'Admin Geral',email:'admin'+'@'+'vagaspro.com.br',whatsapp:'(62) 99999-0001',nivel:'superadmin',status:'ativo',cadastro:'01/01/2025'},
];
function renderUsuarios(){
  const rl={superadmin:'SuperAdmin',admin:'Admin',supervisor:'Supervisor',recrutador:'Recrutador',candidato:'Candidato'};
  const rc={superadmin:'badge-blue',admin:'badge-amber',supervisor:'badge-gray',recrutador:'badge-green',candidato:'badge-gray'};
  const sc={ativo:'badge-green',inativo:'badge-gray',suspenso:'badge-red'};
  document.getElementById('usuariosTableBody').innerHTML=USERS_MOCK.map((u,i)=>`
    <tr>
      <td><div style="display:flex;align-items:center;gap:9px;">
        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:800;flex-shrink:0;">${u.nome.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
        <strong>${u.nome}</strong>
      </div></td>
      <td style="color:var(--g500);">${u.email}</td>
      <td>${u.whatsapp||'–'}</td>
      <td><span class="badge ${rc[u.nivel]}">${rl[u.nivel]}</span></td>
      <td><span class="badge ${sc[u.status]||'badge-gray'}">${u.status}</span></td>
      <td style="color:var(--g400);">${u.cadastro}</td>
      <td>
        <div style="display:flex;gap:5px;flex-wrap:wrap;">
          <button class="btn btn-ghost btn-xs" onclick="abrirEditarUsuario(${i})" title="Editar">✏️ Editar</button>
          <button class="btn btn-xs" onclick="toggleStatusUsuario(${i})" title="Ativar/Suspender"
            style="background:${u.status==='ativo'?'var(--red-soft)':'var(--green-soft)'};color:${u.status==='ativo'?'var(--red2)':'var(--green2)'};border:1.5px solid ${u.status==='ativo'?'#fca5a5':'#86efac'};">
            ${u.status==='ativo'?'🔴 Suspender':'🟢 Ativar'}
          </button>
          <button class="btn btn-xs" onclick="confirmarRemoverUsuario(${i})" title="Remover usuário"
            style="background:var(--red-soft);color:var(--red2);border:1.5px solid #fca5a5;">
            🗑️ Remover
          </button>
        </div>
      </td>
    </tr>`).join('');
}

// ══════════════════════════════════════════════════════
// MEU PERFIL — funções
// ══════════════════════════════════════════════════════
var _cvPdfData = null; // {nome, size, data (base64), savedAt}

function renderMeuPerfil(){
  if(!currentUser) return;
  var nl={superadmin:'SuperAdmin',admin:'Admin',supervisor:'Supervisor',recrutador:'Recrutador',candidato:'Candidato'};
  var nc={superadmin:'r-sa',admin:'r-ad',supervisor:'r-sv',recrutador:'r-rc',candidato:'r-ca'};

  // Header
  var el=function(id){return document.getElementById(id);};
  if(el('perfilNomeDisplay'))  el('perfilNomeDisplay').textContent  = currentUser.nome  || '–';
  if(el('perfilEmailDisplay')) el('perfilEmailDisplay').textContent = currentUser.email || '–';
  if(el('perfilNivelDisplay')){
    el('perfilNivelDisplay').textContent = nl[currentUser.nivel]||currentUser.nivel;
    el('perfilNivelDisplay').className   = 'ui-role '+(nc[currentUser.nivel]||'r-ca');
  }

  // Avatar
  var av = el('perfilAvatar');
  if(av){
    var savedAvatar = localStorage.getItem('vp_avatar_'+currentUser.email);
    if(savedAvatar){
      av.innerHTML = '<img src="'+savedAvatar+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"><div class="avatar-overlay">📷</div>';
    } else if(currentUser.avatar){
      av.innerHTML = '<img src="'+currentUser.avatar+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"><div class="avatar-overlay">📷</div>';
    } else {
      var ini=(currentUser.nome||'?').split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2).toUpperCase();
      av.innerHTML = ini + '<div class="avatar-overlay">📷</div>';
    }
  }

  // Data cadastro
  var cadStr = currentUser.cadastro || '';
  if(!cadStr){
    var saved = sessionStorage.getItem('vp_sess')||localStorage.getItem('vp_sess');
    if(saved){try{var s=JSON.parse(saved);cadStr=s.cadastro||'';}catch(e){}}
  }
  if(!cadStr) cadStr = new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  if(el('perfilCadastroDisplay')) el('perfilCadastroDisplay').textContent = '📅 Desde '+cadStr;

  // Stats
  if(el('perfilStatFav'))  el('perfilStatFav').textContent  = vagasLocal.filter(function(v){return v.favorito;}).length;
  if(el('perfilStatInt'))  el('perfilStatInt').textContent  = vagasLocal.filter(function(v){return v.interesse;}).length;
  if(el('perfilStatKan'))  el('perfilStatKan').textContent  = Object.values(kanbanCards||{}).filter(function(s){return s!=='reprovado';}).length;

  // Dados da conta
  if(el('perfilDadosNome'))     el('perfilDadosNome').textContent     = currentUser.nome  || '–';
  if(el('perfilDadosEmail'))    el('perfilDadosEmail').textContent    = currentUser.email || '–';
  if(el('perfilDadosNivel'))    el('perfilDadosNivel').textContent    = nl[currentUser.nivel]||currentUser.nivel;
  if(el('perfilDadosCadastro')) el('perfilDadosCadastro').textContent = cadStr;

  // Carregar PDF salvo
  _carregarCVPdfSalvo();
}

// ── Foto do perfil ─────────────────────────────────────
function previewPerfilFoto(input){
  if(!input.files[0]||!currentUser) return;
  var reader = new FileReader();
  reader.onload = function(e){
    var data = e.target.result;
    // Salvar no localStorage
    try{ localStorage.setItem('vp_avatar_'+currentUser.email, data); }catch(ex){}
    currentUser.avatar = data;
    // Atualizar avatar no sidebar também
    var sav = document.getElementById('sidebarAvatar');
    if(sav) sav.innerHTML = '<img src="'+data+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="avatar">';
    renderMeuPerfil();
    showToast('✅ Foto atualizada!','success');
  };
  reader.readAsDataURL(input.files[0]);
}

// ── Editar dados pessoais (reutiliza modal de editar usuário) ──
function abrirEditarPerfil(){
  if(!currentUser) return;
  // Pré-preencher com dados do usuário atual
  _isNovoUsuario = false;
  _editUserIdx   = null;
  var el = function(id){return document.getElementById(id);};
  if(el('eu-nome'))   el('eu-nome').value   = currentUser.nome  || '';
  if(el('eu-email'))  el('eu-email').value  = currentUser.email || '';
  if(el('eu-whatsapp')) el('eu-whatsapp').value = currentUser.whatsapp || '';
  if(el('eu-nivel'))  el('eu-nivel').value  = currentUser.nivel || 'candidato';
  if(el('eu-status')) el('eu-status').value = 'ativo';
  // Desabilitar campos de nível/status para o próprio usuário
  if(el('eu-nivel'))  el('eu-nivel').disabled  = (currentUser.nivel!=='superadmin');
  if(el('eu-status')) el('eu-status').disabled = true;
  ['eu-senha','eu-senha-conf'].forEach(function(id){
    var f=el(id);if(f){f.value='';f.type='password';}
  });
  var t=el('editUserTitle');    if(t) t.textContent='✏️ Meus Dados';
  var s=el('editUserSubtitle'); if(s) s.textContent='Atualize suas informações pessoais';
  var h=el('editUserHint');
  if(h){h.className='hl';h.innerHTML='💡 Deixe a senha em branco para mantê-la. Nível e status só podem ser alterados por administradores.';}
  var b=el('editUserSaveBtn');  if(b) b.textContent='💾 Salvar alterações';
  // Override do salvar para atualizar currentUser depois
  _editingOwnProfile = true;
  var modal=document.getElementById('editUserModal');
  if(modal) modal.classList.add('open');
}
var _editingOwnProfile = false;

// ── Trocar senha ───────────────────────────────────────
function abrirTrocarSenha(){
  ['ts-atual','ts-nova','ts-conf'].forEach(function(id){
    var el=document.getElementById(id);
    if(el){el.value='';el.type='password';}
    var ico=document.getElementById('eyeIcon_'+id);
    if(ico) ico.innerHTML='<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  });
  var modal=document.getElementById('trocarSenhaModal');
  if(modal) modal.classList.add('open');
}

function fecharTrocarSenha(){
  var modal=document.getElementById('trocarSenhaModal');
  if(modal) modal.classList.remove('open');
}

async function salvarTrocarSenha(){
  var atual = (document.getElementById('ts-atual').value||'');
  var nova  = (document.getElementById('ts-nova').value||'');
  var conf  = (document.getElementById('ts-conf').value||'');
  if(!atual){showToast('Informe a senha atual.','error');return;}
  if(!nova||nova.length<6){showToast('Nova senha deve ter ao menos 6 caracteres.','error');return;}
  if(nova!==conf){showToast('As senhas não coincidem.','error');return;}

  var btn=document.getElementById('btnSalvarSenha');
  if(btn){btn.disabled=true;btn.textContent='Salvando...';}
  var reBtn=function(){if(btn){btn.disabled=false;btn.textContent='🔐 Salvar nova senha';}};

  if(!_sb||!currentUser){showToast('Sem conexão com o banco.','error');reBtn();return;}
  try{
    var res=await _sb.rpc('fn_trocar_senha',{
      p_email:currentUser.email, p_senha_atual:atual, p_nova_senha:nova
    });
    if(res.error||!res.data||!res.data.ok){
      showToast((res.data&&res.data.erro)||'Erro ao trocar senha.','error');reBtn();return;
    }
    fecharTrocarSenha();
    showToast('✅ Senha atualizada com sucesso!','success');
  }catch(e){
    showToast('Erro de conexão.','error');reBtn();
  }
}

// ── PDF do Currículo ───────────────────────────────────
function uploadCVPdf(input){
  if(!input.files[0]||!currentUser) return;
  var file = input.files[0];
  if(file.type!=='application/pdf'){showToast('Selecione um arquivo PDF.','error');return;}
  if(file.size>5*1024*1024){showToast('PDF muito grande (máximo 5MB).','error');return;}
  var reader=new FileReader();
  reader.onload=function(e){
    _cvPdfData={
      nome:file.name,
      size:(file.size/1024).toFixed(1)+' KB',
      data:e.target.result,
      savedAt:new Date().toLocaleString('pt-BR')
    };
    try{ localStorage.setItem('vp_cv_pdf_'+currentUser.email, JSON.stringify(_cvPdfData)); }catch(ex){
      showToast('Armazenamento cheio. Reduza o tamanho do PDF.','error');return;
    }
    _atualizarCVPdfUI();
    showToast('✅ Currículo salvo no navegador!','success');
  };
  reader.readAsDataURL(file);
}

function _carregarCVPdfSalvo(){
  if(!currentUser) return;
  try{
    var raw=localStorage.getItem('vp_cv_pdf_'+currentUser.email);
    if(raw) _cvPdfData=JSON.parse(raw);
    else    _cvPdfData=null;
  }catch(e){ _cvPdfData=null; }
  _atualizarCVPdfUI();
}

function _atualizarCVPdfUI(){
  var empty  = document.getElementById('cvPdfEmpty');
  var loaded = document.getElementById('cvPdfLoaded');
  var nome   = document.getElementById('cvPdfNome');
  var info   = document.getElementById('cvPdfInfo');
  if(!empty||!loaded) return;
  if(_cvPdfData){
    empty.style.display  = 'none';
    loaded.style.display = 'block';
    if(nome) nome.textContent = _cvPdfData.nome   || 'curriculo.pdf';
    if(info) info.textContent = _cvPdfData.size   ? _cvPdfData.size+' · Salvo em: '+_cvPdfData.savedAt : '';
  }else{
    empty.style.display  = 'block';
    loaded.style.display = 'none';
  }
}

function baixarCVPdf(){
  if(!_cvPdfData||!_cvPdfData.data){showToast('Nenhum PDF salvo.','error');return;}
  var a=document.createElement('a');
  a.href=_cvPdfData.data;
  a.download=_cvPdfData.nome||'curriculo.pdf';
  a.click();
  showToast('⬇ Download iniciado!','success');
}

function removerCVPdf(){
  if(!currentUser) return;
  _cvPdfData=null;
  try{ localStorage.removeItem('vp_cv_pdf_'+currentUser.email); }catch(e){}
  _atualizarCVPdfUI();
  showToast('🗑️ Currículo removido.','success');
}

function compartilharCVWA(){
  if(!_cvPdfData){showToast('Nenhum currículo salvo.','error');return;}
  // Baixar primeiro e orientar usuário a enviar
  baixarCVPdf();
  setTimeout(function(){
    var msg='Ol\u00e1! Segue meu curr\u00edculo em anexo.\n\nBaixei o arquivo "'+(_cvPdfData&&_cvPdfData.nome||'curriculo.pdf')+'" \u2014 vou enviar em seguida.\n\n_Enviado via VagasPro_';
    window.open('https://wa.me/?text='+encodeURIComponent(msg));
  }, 800);
}

function compartilharCVEmail(){
  if(!_cvPdfData){showToast('Nenhum currículo salvo.','error');return;}
  baixarCVPdf();
  setTimeout(function(){
    var sub='Currículo — '+(currentUser&&currentUser.nome||'Candidato');
    var body='Prezado(a),\n\nSegue meu curr\u00edculo em anexo.\n\nAtenciosamente,\n'+(currentUser&&currentUser.nome||'');
    window.open('mailto:?subject='+encodeURIComponent(sub)+'&body='+encodeURIComponent(body));
  }, 800);
}

function gerarESalvarCVPDF(){
  // Gerar o PDF via jsPDF e depois salvar no perfil
  navTo('curriculo', document.getElementById('nav-curriculo'));
  showToast('📄 Preencha o currículo e clique em "Exportar PDF" — depois faça o upload aqui.','info');
}

// ── GESTÃO DE USUÁRIOS ────────────────────────────────
async function carregarUsuarios(){
  if(!_sb){renderUsuarios();return;}
  try{
    var res=await _sb.rpc('fn_admin_listar_usuarios');
    if(!res.error&&res.data&&Array.isArray(res.data)&&res.data.length>0){
      // Mapear dados do banco para o formato do mock
      USERS_MOCK.length=0;
      res.data.forEach(function(u){
        USERS_MOCK.push({
          id:u.id,
          nome:u.nome||'',
          email:u.email||'',
          whatsapp:u.whatsapp||'',
          nivel:u.nivel||'candidato',
          status:u.status||'ativo',
          email_verificado:u.email_verificado,
          cadastro:u.created_at?new Date(u.created_at).toLocaleDateString('pt-BR'):''
        });
      });
    }
  }catch(e){
    console.warn('[Usuários] Erro ao carregar:',e);
  }
  renderUsuarios();
}

// ── GESTÃO DE USUÁRIOS ────────────────────────────────
var _editUserIdx = null;
var _isNovoUsuario = false;

function abrirNovoUsuario(){
  _editUserIdx = null;
  _isNovoUsuario = true;
  // Reset all fields
  ['eu-nome','eu-email','eu-whatsapp','eu-senha','eu-senha-conf'].forEach(function(id){
    var el=document.getElementById(id);
    if(el){el.value='';el.type=el.type||'text';}
  });
  var lvl=document.getElementById('eu-nivel');if(lvl)lvl.value='candidato';
  var st=document.getElementById('eu-status');if(st)st.value='ativo';
  // Update modal title/hint for "new" mode
  var t=document.getElementById('editUserTitle');if(t)t.textContent='👤 Novo Usuário';
  var s=document.getElementById('editUserSubtitle');if(s)s.textContent='Preencha os dados do novo usuário';
  var h=document.getElementById('editUserHint');
  if(h){h.className='hl hl-green';h.innerHTML='✅ O usuário receberá acesso imediato após o cadastro.';}
  var lbl=document.getElementById('eu-senha-lbl');
  if(lbl)lbl.innerHTML='Senha <span class="form-req">*</span>';
  var btn=document.getElementById('editUserSaveBtn');if(btn)btn.textContent='➕ Criar Usuário';
  var modal=document.getElementById('editUserModal');
  if(modal)modal.classList.add('open');
}

function abrirEditarUsuario(idx){
  const u=USERS_MOCK[idx];
  if(!u)return;
  _editUserIdx=idx;
  _isNovoUsuario=false;
  document.getElementById('eu-nome').value=u.nome||'';
  document.getElementById('eu-email').value=u.email||'';
  document.getElementById('eu-whatsapp').value=u.whatsapp||'';
  document.getElementById('eu-nivel').value=u.nivel||'candidato';
  document.getElementById('eu-status').value=u.status||'ativo';
  // Clear password fields
  var s=document.getElementById('eu-senha');if(s){s.value='';s.type='password';}
  var sc=document.getElementById('eu-senha-conf');if(sc){sc.value='';sc.type='password';}
  // Reset eye icons
  ['eu-senha','eu-senha-conf'].forEach(function(id){
    var ico=document.getElementById('eyeIcon_'+id);
    if(ico)ico.innerHTML='<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  });
  // Update modal title for "edit" mode
  var t=document.getElementById('editUserTitle');if(t)t.textContent='✏️ Editar Usuário';
  var sub=document.getElementById('editUserSubtitle');if(sub)sub.textContent='Altere os dados de '+u.nome;
  var h=document.getElementById('editUserHint');
  if(h){h.className='hl hl-amber';h.innerHTML='⚠️ Alterações no nível de acesso têm efeito imediato no próximo login. Deixe a senha em branco para mantê-la.';}
  var lbl=document.getElementById('eu-senha-lbl');
  if(lbl)lbl.innerHTML='Nova Senha <span style="color:var(--g400);font-weight:400;">(opcional)</span>';
  var btn=document.getElementById('editUserSaveBtn');if(btn)btn.textContent='💾 Salvar Alterações';
  var modal=document.getElementById('editUserModal');
  if(modal)modal.classList.add('open');
}

function fecharEditarUsuario(){
  const modal=document.getElementById('editUserModal');
  if(modal)modal.classList.remove('open');
  _editUserIdx=null;
  _isNovoUsuario=false;
}

async function salvarEditarUsuario(){
  var nome=(document.getElementById('eu-nome').value||'').trim();
  var email=(document.getElementById('eu-email').value||'').trim().toLowerCase();
  var whatsapp=(document.getElementById('eu-whatsapp').value||'').trim();
  var nivel=document.getElementById('eu-nivel').value;
  var status=document.getElementById('eu-status').value;
  var senha=(document.getElementById('eu-senha').value||'');
  var senhaConf=(document.getElementById('eu-senha-conf').value||'');

  // Validação básica
  if(!nome){showToast('Informe o nome completo.','error');return;}
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){showToast('E-mail inválido.','error');return;}
  if(senha&&senha.length<6){showToast('Senha deve ter ao menos 6 caracteres.','error');return;}
  if(senha&&senha!==senhaConf){showToast('As senhas não coincidem.','error');return;}

  var btn=document.getElementById('editUserSaveBtn');
  if(btn){btn.disabled=true;btn.textContent='Salvando...';}
  var reBtn=function(){if(btn){btn.disabled=false;btn.textContent=_isNovoUsuario?'➕ Criar Usuário':'💾 Salvar Alterações';}};

  // ── NOVO USUÁRIO ────────────────────────────────────────────────
  if(_isNovoUsuario){
    if(!senha){showToast('Informe uma senha para o novo usuário.','error');reBtn();return;}
    if(!_sb){showToast('Sem conexão com o banco de dados.','error');reBtn();return;}
    try{
      var res=await _sb.rpc('fn_auth_register',{p_nome:nome,p_email:email,p_senha:senha,p_nivel:nivel});
      if(res.error||!res.data){
        showToast((res.error&&res.error.message)||'Erro ao criar usuário.','error');
        reBtn();return;
      }
      if(!res.data.ok){showToast(res.data.erro||'Erro ao criar usuário.','error');reBtn();return;}
      // Atualizar whatsapp e status se necessário
      if(res.data.id&&(whatsapp||status!=='ativo')){
        await _sb.rpc('fn_atualizar_usuario',{
          p_id:res.data.id,p_whatsapp:whatsapp||null,p_status:status,p_nivel:nivel
        });
      }
      // Adicionar ao mock local para refletir na tela
      var now=new Date();
      USERS_MOCK.push({
        id:res.data.id||'',
        nome:nome,email:email,whatsapp:whatsapp,
        nivel:nivel,status:status,
        cadastro:now.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'})
      });
      fecharEditarUsuario();
      renderUsuarios();
      showToast('✅ Usuário '+nome+' criado com sucesso!','success');
    }catch(e){
      showToast('Erro de conexão ao criar usuário.','error');
      reBtn();
    }
    return;
  }

  // ── EDIÇÃO ──────────────────────────────────────────────────────
  if(_editUserIdx===null){reBtn();return;}
  var u=USERS_MOCK[_editUserIdx];
  var userId=u.id||null;

  if(!_sb){
    // Sem banco: atualizar só o mock (modo offline)
    u.nome=nome;u.email=email;u.whatsapp=whatsapp;u.nivel=nivel;u.status=status;
    fecharEditarUsuario();renderUsuarios();
    showToast('⚠️ Salvo localmente — sem conexão com banco.','warning');
    reBtn();return;
  }

  if(!userId){
    // Sem ID real: tenta buscar no banco pelo e-mail
    try{
      var found=await _sb.from('usuarios').select('id').eq('email',email).maybeSingle();
      if(found.data)userId=found.data.id;
    }catch(e){}
  }

  if(!userId){
    showToast('Usuário não encontrado no banco. Verifique o e-mail.','error');
    reBtn();return;
  }

  try{
    // 1. Atualizar dados do usuário
    var updRes=await _sb.rpc('fn_atualizar_usuario',{
      p_id:userId,
      p_nome:nome,
      p_whatsapp:whatsapp||null,
      p_nivel:nivel,
      p_status:status,
      p_nova_senha:senha||null
    });

    if(updRes.error){
      showToast('Erro ao salvar: '+(updRes.error.message||'verifique as permissões.'),'error');
      reBtn();return;
    }
    if(updRes.data&&!updRes.data.ok){
      showToast(updRes.data.erro||'Erro ao atualizar usuário.','error');
      reBtn();return;
    }

    // 2. Atualizar mock local para refletir na tela imediatamente
    u.id=userId;
    u.nome=nome;
    u.email=email;
    u.whatsapp=whatsapp;
    u.nivel=nivel;
    u.status=status;

    fecharEditarUsuario();
    renderUsuarios();
    showToast('✅ Usuário '+nome+' atualizado'+(senha?' — nova senha salva!':' com sucesso!'),'success');
  }catch(e){
    showToast('Erro de conexão ao salvar.','error');
    reBtn();
  }
}

var _removeUserIdx = null;

function confirmarRemoverUsuario(idx){
  var u = USERS_MOCK[idx];
  if(!u) return;
  // Proteção: não pode remover a si mesmo
  if(currentUser && u.email === currentUser.email){
    showToast('Você não pode remover sua própria conta.','error');
    return;
  }
  _removeUserIdx = idx;
  var nameEl  = document.getElementById('removeUserName');
  var emailEl = document.getElementById('removeUserEmail');
  if(nameEl)  nameEl.textContent  = u.nome  || '–';
  if(emailEl) emailEl.textContent = u.email || '–';
  var modal = document.getElementById('removeUserModal');
  if(modal) modal.classList.add('open');
}

function fecharRemoverUsuario(){
  var modal = document.getElementById('removeUserModal');
  if(modal) modal.classList.remove('open');
  _removeUserIdx = null;
}

async function executarRemoverUsuario(){
  if(_removeUserIdx === null) return;
  var u = USERS_MOCK[_removeUserIdx];
  if(!u) return;

  var btn = document.getElementById('btnConfirmRemoveUser');
  if(btn){ btn.disabled = true; btn.textContent = 'Removendo...'; }
  var reBtn = function(){ if(btn){ btn.disabled = false; btn.textContent = 'Remover'; } };

  // Tentar remover do banco
  if(_sb && u.id){
    try{
      // Marcar como inativo/suspenso primeiro (soft delete)
      var res = await _sb.rpc('fn_atualizar_usuario',{
        p_id: u.id,
        p_status: 'inativo'
      });
      if(res.error){
        // Se falhou, tenta hard delete direto
        var del = await _sb.from('usuarios').delete().eq('id', u.id);
        if(del.error){
          showToast('Erro ao remover: ' + (del.error.message || 'sem permissão.'), 'error');
          reBtn(); return;
        }
      }
    }catch(e){
      showToast('Erro de conexão ao remover usuário.', 'error');
      reBtn(); return;
    }
  } else if(_sb && !u.id){
    // Sem ID: tenta buscar e deletar pelo email
    try{
      var found = await _sb.from('usuarios').select('id').eq('email', u.email).maybeSingle();
      if(found.data){
        await _sb.from('usuarios').delete().eq('id', found.data.id);
      }
    }catch(e){}
  }

  // Remover do mock local
  USERS_MOCK.splice(_removeUserIdx, 1);
  fecharRemoverUsuario();
  renderUsuarios();
  showToast('🗑️ Usuário ' + (u.nome || u.email) + ' removido.', 'success');
}

async function toggleStatusUsuario(idx){
  const u=USERS_MOCK[idx];
  if(!u)return;
  const novoStatus=u.status==='ativo'?'suspenso':'ativo';
  // Tentar gravar no banco
  if(_sb&&u.id){
    try{
      await _sb.rpc('fn_atualizar_usuario',{p_id:u.id,p_status:novoStatus});
    }catch(e){}
  }
  u.status=novoStatus;
  renderUsuarios();
  showToast(novoStatus==='ativo'?'🟢 Usuário ativado!':'🔴 Usuário suspenso!',novoStatus==='ativo'?'success':'warning');
}
// ─────────────────────────────────────────────────────

// ===== NEWS =====
const NOTICIAS={rh:[{fonte:'SEBRAE',titulo:'Tendências em recrutamento para 2025',tempo:'2h atrás',url:'https://sebrae.com.br'},{fonte:'Valor Econômico',titulo:'Mercado aquece com alta nas contratações',tempo:'3h atrás',url:'https://valor.com.br'},{fonte:'UOL',titulo:'Home office híbrido adotado por 70% das empresas',tempo:'5h atrás',url:'https://uol.com.br'},{fonte:'Terra',titulo:'Soft skills se tornam critério decisivo em seleção',tempo:'6h atrás',url:'https://terra.com.br'},{fonte:'Olhar Digital',titulo:'IA transforma RH com triagem automatizada',tempo:'8h atrás',url:'https://olhardigital.com.br'},{fonte:'SENAC',titulo:'Novas capacitações em gestão de pessoas disponíveis',tempo:'1d atrás',url:'https://senac.br'},],economia:[{fonte:'Valor Econômico',titulo:'PIB do Brasil cresce no 1º trimestre de 2025',tempo:'1h atrás',url:'https://valor.com.br'},{fonte:'UOL',titulo:'Inflação desacelera, mercado celebra queda dos juros',tempo:'2h atrás',url:'https://uol.com.br'},{fonte:'Terra',titulo:'Emprego formal bate recorde com 2,1 mi de vagas',tempo:'4h atrás',url:'https://terra.com.br'},{fonte:'Olhar Digital',titulo:'Startups captam R$ 3 bi e geram empregos em tech',tempo:'5h atrás',url:'https://olhardigital.com.br'},{fonte:'SEBRAE',titulo:'Micro empresas representam 52% dos empregos',tempo:'1d atrás',url:'https://sebrae.com.br'},],cursos:[{fonte:'SENAI',titulo:'Cursos gratuitos em eletricidade com certificado',tempo:'Hoje',url:'https://senai.br'},{fonte:'SENAC',titulo:'Capacitação gratuita em atendimento ao cliente',tempo:'Hoje',url:'https://senac.br'},{fonte:'SEBRAE',titulo:'Empreendedorismo digital: curso gratuito disponível',tempo:'Hoje',url:'https://sebrae.com.br'},{fonte:'Olhar Digital',titulo:'Google: 25 cursos gratuitos com certificado em 2025',tempo:'2h atrás',url:'https://olhardigital.com.br'},{fonte:'Terra',titulo:'Cursos de informática gratuitos no Pronatec',tempo:'3h atrás',url:'https://terra.com.br'},{fonte:'SENAI',titulo:'Mecânica industrial: vagas abertas para qualificação',tempo:'1d atrás',url:'https://senai.br'},],mercado:[{fonte:'Olhar Digital',titulo:'Tecnologia lidera abertura de vagas em 2025',tempo:'1h atrás',url:'https://olhardigital.com.br'},{fonte:'UOL',titulo:'Saúde e bem-estar crescem 18% em empregos formais',tempo:'2h atrás',url:'https://uol.com.br'},{fonte:'Terra',titulo:'Goiás registra menor desemprego do Centro-Oeste',tempo:'4h atrás',url:'https://terra.com.br'},{fonte:'Valor Econômico',titulo:'Construção civil retoma força com infraestrutura',tempo:'5h atrás',url:'https://valor.com.br'},{fonte:'SEBRAE',titulo:'Alimentação lidera contratações no interior do Brasil',tempo:'8h atrás',url:'https://sebrae.com.br'},]};
function renderNoticias(tab){document.getElementById('newsGrid').innerHTML=(NOTICIAS[tab]||[]).map(n=>`<div class="news-card"><div class="news-src">${n.fonte}</div><div class="news-ttl">${n.titulo}</div><div class="news-time">${n.tempo}</div><a href="${n.url}" target="_blank" rel="noopener noreferrer" class="news-link" onclick="event.stopPropagation()">Acessar fonte ↗</a></div>`).join('');}
function setNewsTab(tab,btn){document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderNoticias(tab);}

// ===== CONFIG =====
const ABAS_LIST=[{key:'dashboard',label:'Dashboard',ico:'📊'},{key:'vagas',label:'Vagas',ico:'💼'},{key:'cadastrar',label:'Cadastrar Vaga',ico:'➕'},{key:'favoritos',label:'Favoritos',ico:'♥'},{key:'meus-interesses',label:'Meus Interesses',ico:'⭐'},{key:'curriculo',label:'Fazer Currículo',ico:'📄'},{key:'interessados',label:'Candidatos',ico:'👥'},{key:'perfil-rec',label:'Perfil Empresa',ico:'🏢'},{key:'empresas',label:'Empresas',ico:'🏭'},{key:'alertas',label:'Alertas',ico:'🔔'},{key:'usuarios',label:'Usuários',ico:'👤'},{key:'noticias',label:'Notícias',ico:'📰'},{key:'_sb',label:'SQL Supabase',ico:'🗄️'},];
const NIVEIS=['superadmin','admin','supervisor','recrutador','candidato'];
const NL={superadmin:'SuperAdmin',admin:'Admin',supervisor:'Supervisor',recrutador:'Recrutador',candidato:'Candidato'};
function isAllowed(key,n){const d={superadmin:true,admin:['dashboard','vagas','cadastrar','favoritos','interessados','perfil-rec','empresas','alertas','usuarios','noticias','configuracoes'].includes(key),supervisor:['dashboard','vagas','favoritos','interessados','alertas','noticias'].includes(key),recrutador:['dashboard','vagas','cadastrar','favoritos','interessados','perfil-rec','alertas','noticias'].includes(key),candidato:['dashboard','vagas','favoritos','meus-interesses','curriculo','alertas','noticias'].includes(key)};return d[n]||false;}
function renderConfig(){
  // Load IA settings when config page opens
  setTimeout(_carregarConfigIA, 50);
  // Carregar valores Resend
  setTimeout(function(){
    var wu = document.getElementById('workerUrl');
    if(wu) wu.value = localStorage.getItem('vp_worker_url')||'';
    var st = document.getElementById('resendStatus');
    if(st){
      var savedUrl = localStorage.getItem('vp_worker_url')||'';
      st.textContent = (savedUrl && !savedUrl.includes('SEU-USUARIO'))
        ? '\u2705 Worker configurado'
        : '\u26A0\uFE0F Worker URL n\u00e3o configurada';
    }
  }, 80);
  document.getElementById('configAbasLista').innerHTML=ABAS_LIST.map(a=>`<div class="config-row"><div><div class="config-lbl">${a.ico} ${a.label}</div><div class="config-desc">Controle de visibilidade por nível</div></div><div style="display:flex;gap:8px;flex-wrap:wrap;">${NIVEIS.map(n=>`<label style="display:flex;align-items:center;gap:4px;font-size:11px;cursor:pointer;"><input type="checkbox" ${isAllowed(a.key,n)?'checked':''}> ${NL[n]}</label>`).join('')}</div></div>`).join('');}

// ===== FEEDBACK =====
function enviarFeedback(){const tipo=document.querySelector('input[name="feedbackTipo"]:checked')?.value;const texto=document.getElementById('feedbackTexto').value;if(!tipo){showToast('Selecione como conseguiu o emprego!','error');return;}document.getElementById('feedbackOverlay').classList.remove('open');showToast('🎉 Muito obrigado pelo feedback! Boa sorte na nova jornada!','success');}

// ===== COMPARTILHAR =====
function compartilharWA(){if(!vagaAtual)return;const txt=`🎯 *${vagaAtual.titulo}*\n🏢 ${vagaAtual.empresa}\n📍 ${vagaAtual.cidade}–${vagaAtual.estado}\n💰 ${vagaAtual.salario}\n⏱ ${vagaAtual.jornada}\n\n📩 Currículo: ${vagaAtual.whatsapp||vagaAtual.email}\n_Via VagasPro_`;window.open('https://wa.me/?text='+encodeURIComponent(txt));}
function compartilharEmail(){if(!vagaAtual)return;const sub=`Vaga: ${vagaAtual.titulo} – ${vagaAtual.empresa}`;const body=`${vagaAtual.titulo}\n${vagaAtual.empresa} | ${vagaAtual.cidade}-${vagaAtual.estado}\nSalário: ${vagaAtual.salario}\nContato: ${vagaAtual.whatsapp||vagaAtual.email}`;window.open(`mailto:?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`);}
function compartilharWACard(id){event.stopPropagation();vagaAtual=vagasLocal.find(x=>x.id===id);compartilharWA();}
function compartilharEmailCard(id){event.stopPropagation();vagaAtual=vagasLocal.find(x=>x.id===id);compartilharEmail();}

// ===== EXPORT =====
function exportarCSV(){const h=['ID','Titulo','Empresa','Setor','Tipo','Cidade','Estado','Salario','Status','WhatsApp','Email','Dias','Interessados'];const r=vagasLocal.map(v=>[v.id,v.titulo,v.empresa,v.setor,v.tipo,v.cidade,v.estado,v.salario,v.status,v.whatsapp,v.email,v.dias,v.interessados]);const csv=[h,...r].map(row=>row.map(c=>`"${(c||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`vagas_${new Date().toISOString().slice(0,10)}.csv`;a.click();showToast('✅ CSV exportado!','success');}
function exportarCSVCandidatos(vagaId){
  var nivel = currentUser?.nivel||'candidato';
  var isRec = ['recrutador'].includes(nivel);
  // Para recrutadores: exportar dados anônimos (sem nome/email/whatsapp)
  if(isRec){
    var v = vagasLocal.find(function(x){return x.id===vagaId;});
    var intCount = v ? (v.interessados||0) : 0;
    var vagaKan  = kanbanRec[vagaId]||{};
    var rows = [];
    for(var i=0;i<intCount;i++){
      rows.push(['Candidato #'+(i+1), '–', '–', vagaKan[i]||'inscrito', '–']);
    }
    var h=['Identificador','E-mail','WhatsApp','Etapa Kanban','Observações'];
    var csv=[h,...rows].map(function(row){return row.map(function(c2){return '"'+String(c2||'').replace(/"/g,'""')+'"';}).join(',');}).join('\n');
    var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
    var a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download='candidatos_anonimos_'+(vagaId||'')+'_'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
    showToast('✅ CSV exportado (dados anônimos — LGPD)!','success');
    return;
  }
  var cands=vagaId?CANDS_MOCK.filter(function(cx){return cx.vaga_id===vagaId;}):CANDS_MOCK;var csvH=['Nome','Email','WhatsApp','Cargo','Experiência','Status','Dias'];var csvR=cands.map(function(cx){return[cx.nome,cx.email,cx.whatsapp,cx.cargo,cx.exp,cx.status,cx.dias];});var csv=[csvH,...csvR].map(function(row){return row.map(function(cell){return'"'+String(cell||'').replace(/"/g,'""')+'"';}).join(',');}).join('\n');var blobCsv=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});var aCsv=document.createElement('a');aCsv.href=URL.createObjectURL(blobCsv);aCsv.download='candidatos_'+new Date().toISOString().slice(0,10)+'.csv';aCsv.click();showToast('✅ Candidatos exportados!','success');}
function exportarPDF(){window.print();showToast('🖨️ Use Ctrl+P para salvar como PDF','info');}

// ===== CONFIG IA (Anthropic + Groq) =====

function trocarProvedorIA(){
  var prov = document.querySelector('input[name="cfg-ai-provedor"]:checked')?.value || 'anthropic';
  localStorage.setItem('vp_ai_provedor', prov);
  var blocoAnt  = document.getElementById('cfg-bloco-anthropic');
  var blocoGroq = document.getElementById('cfg-bloco-groq');
  if(blocoAnt)  blocoAnt.style.display  = prov === 'anthropic' ? '' : 'none';
  if(blocoGroq) blocoGroq.style.display = prov === 'groq'      ? '' : 'none';
  _atualizarStatusIA(!!_getTokenAtual());
}

function _getProvedorAtual(){
  return localStorage.getItem('vp_ai_provedor') || 'anthropic';
}

function _getTokenAtual(){
  var prov = _getProvedorAtual();
  return prov === 'groq'
    ? (localStorage.getItem('vp_groq_token') || '')
    : (localStorage.getItem('vp_ai_token')   || '');
}

function _getIAConfig(){
  var prov    = _getProvedorAtual();
  var isGroq  = prov === 'groq';
  var token   = isGroq
    ? (localStorage.getItem('vp_groq_token')   || '')
    : (localStorage.getItem('vp_ai_token')      || '');
  var modelo  = isGroq
    ? (localStorage.getItem('vp_groq_modelo')  || 'llama-3.3-70b-versatile')
    : (localStorage.getItem('vp_ai_modelo')     || 'claude-sonnet-4-6');
  var tokens  = parseInt(isGroq
    ? (localStorage.getItem('vp_groq_tokens')  || '1000')
    : (localStorage.getItem('vp_ai_tokens')     || '1000'));
  return {provedor: prov, token, modelo, tokens, isGroq};
}

function salvarConfigIA(){
  var prov = _getProvedorAtual();
  // Anthropic
  var antToken  = (document.getElementById('cfg-ai-token')?.value    || '').trim();
  var antModelo = document.getElementById('cfg-ai-modelo')?.value    || 'claude-sonnet-4-6';
  var antTokens = document.getElementById('cfg-ai-tokens')?.value    || '1000';
  if(antToken) localStorage.setItem('vp_ai_token',  antToken);
  else         localStorage.removeItem('vp_ai_token');
  localStorage.setItem('vp_ai_modelo', antModelo);
  localStorage.setItem('vp_ai_tokens', antTokens);
  // Groq
  var groqToken  = (document.getElementById('cfg-groq-token')?.value  || '').trim();
  var groqModelo = document.getElementById('cfg-groq-modelo')?.value  || 'llama-3.3-70b-versatile';
  var groqTokens = document.getElementById('cfg-groq-tokens')?.value  || '1000';
  if(groqToken) localStorage.setItem('vp_groq_token',  groqToken);
  else          localStorage.removeItem('vp_groq_token');
  localStorage.setItem('vp_groq_modelo', groqModelo);
  localStorage.setItem('vp_groq_tokens', groqTokens);
  _atualizarStatusIA(!!_getTokenAtual());
}

function limparConfigIA(){
  localStorage.removeItem('vp_ai_token');
  localStorage.removeItem('vp_groq_token');
  var e1 = document.getElementById('cfg-ai-token');   if(e1) e1.value = '';
  var e2 = document.getElementById('cfg-groq-token'); if(e2) e2.value = '';
  _atualizarStatusIA(false);
  showToast('🗑️ Tokens removidos.', 'success');
}

function _atualizarStatusIA(ok){
  var st = document.getElementById('cfg-ai-status');
  if(!st) return;
  if(ok){
    var prov = _getProvedorAtual();
    var cfg  = _getIAConfig();
    st.textContent = '✅ '+(prov === 'groq' ? 'Groq' : 'Anthropic')+' — '+cfg.modelo;
    st.style.color = 'var(--green2)';
  } else {
    st.textContent = '● Não configurado';
    st.style.color = 'var(--g400)';
  }
}

function _carregarConfigIA(){
  var prov = _getProvedorAtual();
  // Marcar radio correto
  var radAnt  = document.getElementById('cfg-prov-anthropic');
  var radGroq = document.getElementById('cfg-prov-groq');
  if(radAnt)  radAnt.checked  = (prov === 'anthropic');
  if(radGroq) radGroq.checked = (prov === 'groq');
  // Mostrar bloco correto
  var blocoAnt  = document.getElementById('cfg-bloco-anthropic');
  var blocoGroq = document.getElementById('cfg-bloco-groq');
  if(blocoAnt)  blocoAnt.style.display  = prov === 'anthropic' ? '' : 'none';
  if(blocoGroq) blocoGroq.style.display = prov === 'groq'      ? '' : 'none';
  // Anthropic
  var antToken  = localStorage.getItem('vp_ai_token')   || '';
  var antModelo = localStorage.getItem('vp_ai_modelo')  || 'claude-sonnet-4-6';
  var antTokens = localStorage.getItem('vp_ai_tokens')  || '1000';
  var e1 = document.getElementById('cfg-ai-token');   if(e1 && antToken)  e1.value = antToken;
  var e2 = document.getElementById('cfg-ai-modelo');  if(e2) e2.value = antModelo;
  var e3 = document.getElementById('cfg-ai-tokens');  if(e3) e3.value = antTokens;
  // Groq
  var groqToken  = localStorage.getItem('vp_groq_token')  || '';
  var groqModelo = localStorage.getItem('vp_groq_modelo') || 'llama-3.3-70b-versatile';
  var groqTokens = localStorage.getItem('vp_groq_tokens') || '1000';
  var g1 = document.getElementById('cfg-groq-token');  if(g1 && groqToken)  g1.value = groqToken;
  var g2 = document.getElementById('cfg-groq-modelo'); if(g2) g2.value = groqModelo;
  var g3 = document.getElementById('cfg-groq-tokens'); if(g3) g3.value = groqTokens;
  _atualizarStatusIA(!!_getTokenAtual());
}

async function testarIA(){
  var cfg = _getIAConfig();
  if(!cfg.token){
    showToast('Configure o token do provedor selecionado primeiro.','error');
    return;
  }
  var st = document.getElementById('cfg-ai-status');
  if(st){ st.textContent = '⏳ Testando '+cfg.provedor+'...'; st.style.color = 'var(--amber)'; }
  try{
    var data;
    if(cfg.isGroq){
      var r = await fetch('https://api.groq.com/openai/v1/chat/completions',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+cfg.token},
        body:JSON.stringify({model:cfg.modelo, max_completion_tokens:20, messages:[{role:'user',content:'Responda só: OK'}]})
      });
      data = await r.json();
      if(data.choices && data.choices[0]){
        showToast('✅ Groq conectado! Modelo: '+cfg.modelo,'success');
        _atualizarStatusIA(true);
      } else {
        showToast('Erro Groq: '+((data.error&&data.error.message)||'token inválido'),'error');
        _atualizarStatusIA(false);
      }
    } else {
      var r = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json','x-api-key':cfg.token,'anthropic-version':'2023-06-01'},
        body:JSON.stringify({model:cfg.modelo, max_tokens:20, messages:[{role:'user',content:'Responda só: OK'}]})
      });
      data = await r.json();
      if(data.content && data.content[0]){
        showToast('✅ Anthropic conectado! Modelo: '+cfg.modelo,'success');
        _atualizarStatusIA(true);
      } else {
        showToast('Erro Anthropic: '+((data.error&&data.error.message)||'token inválido'),'error');
        _atualizarStatusIA(false);
      }
    }
  }catch(e){
    showToast('Erro de conexão com a API '+cfg.provedor+'.','error');
    _atualizarStatusIA(false);
  }
}

async function _chamarIA(prompt, maxTokens){
  var cfg = _getIAConfig();
  if(!cfg.token){
    showToast('⚠️ Configure o token da IA em Configurações → IA.','warning');
    navTo('configuracoes', document.getElementById('nav-configuracoes'));
    return null;
  }
  if(cfg.isGroq){
    // Groq — OpenAI-compatible
    var r = await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+cfg.token},
      body:JSON.stringify({
        model: cfg.modelo,
        max_completion_tokens: maxTokens || cfg.tokens,
        messages:[{role:'user', content:prompt}]
      })
    });
    var data = await r.json();
    if(data.error) return data; // propagar erro
    // Normalizar resposta para o mesmo formato que Anthropic
    var text = data.choices?.[0]?.message?.content || '';
    return {content:[{text}], _groq:true};
  } else {
    // Anthropic
    var r = await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':cfg.token,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({
        model: cfg.modelo,
        max_tokens: maxTokens || cfg.tokens,
        messages:[{role:'user', content:prompt}]
      })
    });
    return await r.json();
  }
}

// ===== IA VAGA =====
async function processarIA(){
  var texto = document.getElementById('iaTexto').value.trim();
  if(!texto){ showToast('Cole o texto de uma vaga!','error'); return; }
  document.getElementById('iaLoading').classList.add('active');
  var prompt = 'Analise o texto de vaga abaixo e extraia as informações em JSON com os campos: titulo, empresa, setor, tipo (CLT/PJ/Estágio/Freelance), cidade, estado, salario, jornada, destaque, requisitos (array), atividades (array), beneficios (array), whatsapp, email, status (aberto/urgente). Retorne SOMENTE JSON sem markdown.\n\nTexto:\n' + texto;
  try{
    var data = await _chamarIA(prompt, 1000);
    if(!data){ return; }
    if(data.error){ showToast('Erro da IA: '+(data.error.message||'verifique o token'),'error'); return; }
    var txt = (data.content?.[0]?.text||'').replace(/```json|```/g,'').trim();
    var p = JSON.parse(txt);
    ['titulo','empresa','destaque','cidade','salario','jornada','whatsapp','email'].forEach(k=>{
      var el=document.getElementById('f-'+k); if(el) el.value=p[k]||'';
    });
    ['setor','tipo','estado','status'].forEach(k=>{
      var el=document.getElementById('f-'+k); if(el&&p[k]) el.value=p[k];
    });
    ['req','atv','ben'].forEach(field=>{
      tagsData[field]=[];
      var wm={req:'reqWrap',atv:'atvWrap',ben:'benWrap'};
      var wrap=document.getElementById(wm[field]);
      wrap.querySelectorAll('.ti').forEach(t=>t.remove());
      var inp=wrap.querySelector('input');
      var km={req:'requisitos',atv:'atividades',ben:'beneficios'};
      (p[km[field]]||[]).forEach(val=>{
        tagsData[field].push(val);
        var tagEl=document.createElement('div'); tagEl.className='ti';
        tagEl.innerHTML=val+'<button type="button" onclick="removeTag(this,\''+field+'\',\''+val.replace(/'/g,"\'")+'\')">×</button>';
        wrap.insertBefore(tagEl,inp);
      });
    });
    document.getElementById('iaResultBox').style.display='block';
    showToast('✅ IA extraiu as informações!','success');
  }catch(err){
    showToast('Erro ao processar. Verifique o token em Configurações.','error');
    console.error('[processarIA]',err);
  }finally{
    document.getElementById('iaLoading').classList.remove('active');
  }
}

function previewImagem(input){
  if(input.files[0]){
    var area=document.getElementById('uploadArea');
    area.innerHTML='<div class="upload-ico">✅</div><div class="upload-txt">'+input.files[0].name+'</div><div class="upload-sub">Clique em "Extrair com IA"</div>';
    showToast('Imagem carregada!','success');
  }
}

function limparIA(){
  document.getElementById('iaTexto').value='';
  document.getElementById('uploadArea').innerHTML='<div class="upload-ico">🖼️</div><div class="upload-txt">Upload de Imagem</div><div class="upload-sub">PNG, JPG – IA extrai tudo</div>';
  document.getElementById('iaResultBox').style.display='none';
}

// ===== IA CURRÍCULO =====
async function processarCVIA(){
  var texto=document.getElementById('cvIaInput')?.value.trim();
  if(!texto){ showToast('Descreva sua experiência para a IA!','error'); return; }
  var load=document.getElementById('cvIaLoad'); load.classList.add('active');
  var prompt='Você é especialista em currículos profissionais. Com base na descrição abaixo, extraia e organize em JSON: nome, cargo, email, tel, cidade, resumo (2-3 linhas profissionais), experiencias (array: cargo, empresa, periodo, desc), educacao (array: curso, inst, ano), habilidades (array strings), idiomas, cursos. Retorne SOMENTE JSON sem markdown.\n\nDescrição:\n'+texto;
  try{
    var data = await _chamarIA(prompt, 1200);
    if(!data){ return; }
    if(data.error){ showToast('Erro da IA: '+(data.error.message||'verifique o token'),'error'); return; }
    var txt=(data.content?.[0]?.text||'').replace(/```json|```/g,'').trim();
    var p=JSON.parse(txt);
    if(p.nome)   document.getElementById('cv-nome').value=p.nome;
    if(p.cargo)  document.getElementById('cv-cargo').value=p.cargo;
    if(p.email)  document.getElementById('cv-email').value=p.email;
    if(p.tel)    document.getElementById('cv-tel').value=p.tel;
    if(p.cidade) document.getElementById('cv-cidade').value=p.cidade;
    if(p.resumo) document.getElementById('cv-resumo').value=p.resumo;
    if(p.idiomas)document.getElementById('cv-idiomas').value=p.idiomas;
    if(p.cursos) document.getElementById('cv-cursos').value=p.cursos;
    if(p.habilidades){
      tagsData.cvHabil=[];
      var wrap=document.getElementById('cvHabilWrap');
      wrap.querySelectorAll('.ti').forEach(t=>t.remove());
      var inp=wrap.querySelector('input');
      p.habilidades.forEach(val=>{
        tagsData.cvHabil.push(val);
        var tagEl=document.createElement('div'); tagEl.className='ti';
        tagEl.innerHTML=val+'<button type="button" onclick="removeTag(this,\'cvHabil\',\''+val.replace(/'/g,"\'")+'\')">×</button>';
        wrap.insertBefore(tagEl,inp);
      });
    }
    if(p.experiencias){
      document.getElementById('expList').innerHTML=''; cvExpCount=0;
      p.experiencias.forEach(e=>{
        addExp();
        var items=document.querySelectorAll('[id^="exp"]');
        var last=items[items.length-1];
        if(last){
          last.querySelector('.exp-cargo').value=e.cargo||'';
          last.querySelector('.exp-empresa').value=e.empresa||'';
          last.querySelector('.exp-periodo').value=e.periodo||'';
          last.querySelector('.exp-desc').value=e.desc||'';
        }
      });
    }
    if(p.educacao){
      document.getElementById('eduList').innerHTML=''; cvEduCount=0;
      p.educacao.forEach(e=>{
        addEdu();
        var items=document.querySelectorAll('[id^="edu"]');
        var last=items[items.length-1];
        if(last){
          last.querySelector('.edu-curso').value=e.curso||'';
          last.querySelector('.edu-inst').value=e.inst||'';
          last.querySelector('.edu-ano').value=e.ano||'';
        }
      });
    }
    updateCVPreview();
    showToast('✅ IA gerou seu currículo!','success');
  }catch(err){
    showToast('Erro ao processar. Verifique o token em Configurações.','error');
    console.error('[processarCVIA]',err);
  }finally{ load.classList.remove('active'); }
}

async function gerarCVComIA(){
  var nome=document.getElementById('cv-nome')?.value||'';
  var cargo=document.getElementById('cv-cargo')?.value||'';
  var resumo=document.getElementById('cv-resumo')?.value||'';
  if(!nome&&!resumo){ showToast('Preencha ao menos nome e resumo!','warning'); return; }
  var input=document.getElementById('cvIaInput');
  if(input) input.value='Nome: '+nome+'. Cargo desejado: '+cargo+'. Sobre mim: '+resumo;
  processarCVIA();
}


// ===== SQL =====
const SQL_TXT=`-- VagasPro v4 · Ciberic.Lab'+'@'+'gmail.com
-- Script de Banco de Dados Completo
-- Execute no SQL Editor do painel de banco de dados
-- Compatível com PostgreSQL

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
  ('Admin Geral','admin'+'@'+'vagaspro.com.br','superadmin',TRUE,TRUE),
  ('Gestor RH','gestor'+'@'+'vagaspro.com.br','admin',TRUE,TRUE)
ON CONFLICT(email) DO NOTHING;

-- FIM DO SCRIPT VagasPro v4 · Ciberic.Lab`;

function renderSQL(){document.getElementById('sqlBlock').textContent=SQL_TXT;}
function copiarSQL(){navigator.clipboard.writeText(SQL_TXT).then(()=>showToast('✅ SQL copiado!','success'));}
function exportarSQLFile(){const blob=new Blob([SQL_TXT],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='vagaspro_banco.sql';a.click();showToast('✅ SQL baixado!','success');}

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
🔒 Este documento regula o uso do <strong>VagasPro</strong>, desenvolvido pela <strong>Ciberic.Lab</strong> (cibericlab'+'@'+'gmail.com), em conformidade com a <strong>LGPD – Lei nº 13.709/2018</strong> e demais normas brasileiras.
</div>

<h3 style="font-size:13.5px;font-weight:700;color:var(--accent);margin:14px 0 6px;border-bottom:1px solid var(--g100);padding-bottom:5px;">1. Identificação da Empresa</h3>
<p><strong>Empresa:</strong> Ciberic.Lab &nbsp;|&nbsp; <strong>E-mail:</strong> cibericlab'+'@'+'gmail.com<br>
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
<p><strong>Seus direitos:</strong> acessar, corrigir, portabilidade, exclusão e revogação do consentimento a qualquer momento. Contato: <strong>cibericlab'+'@'+'gmail.com</strong></p>
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
⚠️ <strong>Os preços podem ser alterados a qualquer momento</strong> sem aviso prévio. Contato: cibericlab'+'@'+'gmail.com
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
    <div class="highlight-termos">🔒 Este documento regula o uso do <strong>VagasPro</strong>, desenvolvido pela <strong>Ciberic.Lab</strong> (cibericlab'+'@'+'gmail.com), em conformidade com a <strong>LGPD – Lei nº 13.709/2018</strong>, o Marco Civil da Internet (Lei 12.965/2014) e demais normas do ordenamento jurídico brasileiro.</div>

    <h2>1. Identificação da Empresa</h2>
    <p><strong>Empresa:</strong> Ciberic.Lab &nbsp;|&nbsp; <strong>E-mail:</strong> cibericlab'+'@'+'gmail.com<br>
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
    <p><strong>Canal de atendimento (DPO):</strong> cibericlab'+'@'+'gmail.com</p>
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
      ⚠️ <strong>Os preços, planos e condições de assinatura podem ser alterados a qualquer momento</strong> pela Ciberic.Lab, com ou sem aviso prévio. As condições vigentes no momento da contratação serão mantidas até o fim do período contratado. Para valores atualizados: <strong>cibericlab'+'@'+'gmail.com</strong>
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
    <p>O usuário pode encerrar sua conta a qualquer momento via e-mail: cibericlab'+'@'+'gmail.com. Após encerramento, os dados serão eliminados conforme a política de retenção, salvo obrigações legais de guarda.</p>

    <h2>12. Foro e Legislação Aplicável</h2>
    <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. As partes elegem o foro da Comarca de <strong>Goiânia – Goiás</strong> para dirimir controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
    <p><em>Legislação: LGPD (13.709/18) · CDC (8.078/90) · Marco Civil (12.965/14) · Lei de Direitos Autorais (9.610/98)</em></p>

    <h2>13. Contato e DPO</h2>
    <ul>
      <li>📧 <strong>cibericlab'+'@'+'gmail.com</strong></li>
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
  // Populate scheduling fields if vaga has scheduling
  if(v._agendamento||v.data_inicio){
    var cb=document.getElementById('f-agendar');
    if(cb){cb.checked=true;toggleAgendamento();}
    var di=document.getElementById('f-data-inicio');
    var df=document.getElementById('f-data-fim');
    var pt=document.getElementById('f-publicacao-tipo');
    if(di&&v.data_inicio)di.value=v.data_inicio.slice(0,16);
    if(df&&v.data_fim)df.value=v.data_fim.slice(0,16);
    if(pt&&v._agendamento)pt.value=v._agendamento.tipo||'imediata';
  }
  // Update info display for editing
  var _info=document.getElementById('f-criado-info');
  if(_info&&v.criado_por){
    var _now=new Date();
    _info.textContent='✏️ Editando vaga de: '+v.criado_por;
  }
  showToast('✏️ Editando: '+v.titulo,'info');
  const ft=document.getElementById('formVagaTitle');
  if(ft)ft.innerHTML='✏️ Editando Vaga <span style="color:var(--amber);font-size:13px;">(modo edição)</span>';
  setTimeout(()=>{const btn=document.querySelector('#page-cadastrar button[onclick="salvarVaga()"]');if(btn){btn.textContent='💾 Atualizar Vaga';btn.style.cssText='background:linear-gradient(135deg,#d97706,#f59e0b);color:white;';}},100);
}
function removerVaga(id){
  const v=vagasLocal.find(x=>x.id===id);if(!v)return;
  _vagaRemoverId=id;
  var modal=document.getElementById('removeVagaModal');
  var lbl=document.getElementById('removeVagaLabel');
  if(lbl)lbl.textContent=v.titulo;
  if(modal){modal.classList.add('open');modal.style.display='flex';}
}
var _vagaRemoverId=null;
function confirmarRemoverVaga(){
  var modal=document.getElementById('removeVagaModal');
  if(modal){modal.classList.remove('open');modal.style.display='';}
  if(_vagaRemoverId===null)return;
  vagasLocal=vagasLocal.filter(x=>x.id!==_vagaRemoverId);
  _vagaRemoverId=null;
  filtrarVagas();
  showToast('🗑️ Vaga removida!','success');
}
function fecharRemoverModal(){
  var modal=document.getElementById('removeVagaModal');
  if(modal){modal.classList.remove('open');modal.style.display='';}
  _vagaRemoverId=null;
}

// ===== OVERRIDE salvarVaga para edição =====
const _salvarVagaOrig=salvarVaga;
// ── AGENDAMENTO ────────────────────────────────────────
function toggleAgendamento(){
  var cb=document.getElementById('f-agendar');
  var campos=document.getElementById('agendamento-campos');
  if(!campos)return;
  if(cb&&cb.checked){
    campos.style.display='grid';
    var now=new Date();
    var start=new Date(now.getTime()+3600000);
    var end=new Date(now.getTime()+30*86400000);
    var toLocal=function(d){return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,16);};
    var si=document.getElementById('f-data-inicio');
    var sf=document.getElementById('f-data-fim');
    if(si&&!si.value)si.value=toLocal(start);
    if(sf&&!sf.value)sf.value=toLocal(end);
  }else{
    campos.style.display='none';
  }
}

function _getAgendamento(){
  var cb=document.getElementById('f-agendar');
  if(!cb||!cb.checked)return null;
  return{
    dataInicio:document.getElementById('f-data-inicio')?.value||null,
    dataFim:document.getElementById('f-data-fim')?.value||null,
    tipo:document.getElementById('f-publicacao-tipo')?.value||'imediata'
  };
}

function _checkVagasAgendadas(){
  var now=new Date();
  var changed=false;
  vagasLocal.forEach(function(v){
    if(v._agendamento&&v._agendamento.tipo==='agendada'&&v._agendamento.dataInicio){
      var inicio=new Date(v._agendamento.dataInicio);
      if(now>=inicio&&v.status==='rascunho'){
        v.status='aberto';changed=true;
        showToast('📅 Vaga "'+v.titulo+'" publicada automaticamente!','success');
      }
    }
    if(v._agendamento&&v._agendamento.dataFim){
      var fim=new Date(v._agendamento.dataFim);
      if(now>fim&&v.status!=='encerrado'){v.status='encerrado';changed=true;}
    }
  });
  if(changed)filtrarVagas();
}
setInterval(_checkVagasAgendadas,60000);
// ─────────────────────────────────────────────────────


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
  // Reset agendamento
  var cb=document.getElementById('f-agendar');if(cb)cb.checked=false;
  var campos=document.getElementById('agendamento-campos');if(campos)campos.style.display='none';
  var di=document.getElementById('f-data-inicio');if(di)di.value='';
  var df=document.getElementById('f-data-fim');if(df)df.value='';
  var pt=document.getElementById('f-publicacao-tipo');if(pt)pt.value='imediata';
  setTimeout(_preencherPublicadoPor,50);
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
document.addEventListener('keydown',e=>{if(e.key==='Escape'){fecharModal();fecharPreviewCV();fecharLogoutModal();fecharRemoverModal();fecharEditarUsuario();fecharRemoverUsuario();fecharTrocarSenha();document.getElementById('verifyOverlay')?.classList.remove('open');document.getElementById('feedbackOverlay')?.classList.remove('open');}});

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
  // Inicializar banco e configurações
  initDB();
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

  renderDashboard(); filtrarVagas(); renderSQL(); renderConfig();
})();
