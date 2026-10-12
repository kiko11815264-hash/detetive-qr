
const SUPABASE_URL = "https://wyesyofdpybhorhnbzcq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mi5SoiP-_AUMN6KdH9lcYA_S-wrcvUa";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
const suspects=[
 {id:"S01",name:"Augusto Vale"},{id:"S02",name:"Helena Duarte"},{id:"S03",name:"Dr. Otávio Nunes"},
 {id:"S04",name:"Clara Monteiro"},{id:"S05",name:"Bento Farias"},{id:"S06",name:"Miguel Sampaio"}];
const objects=[
 {id:"O01",name:"Castiçal antigo"},{id:"O02",name:"Chave de bronze"},{id:"O03",name:"Carta lacrada"},
 {id:"O04",name:"Cálice de cristal"},{id:"O05",name:"Relógio de bolso"},{id:"O06",name:"Estatueta de mármore"}];
const locations=[
 {id:"L01",name:"Biblioteca"},{id:"L02",name:"Salão principal"},{id:"L03",name:"Cozinha"},
 {id:"L04",name:"Escritório"},{id:"L05",name:"Jardim de inverno"},{id:"L06",name:"Adega"},
 {id:"L07",name:"Galeria de retratos"},{id:"L08",name:"Quarto de hóspedes"},{id:"L09",name:"Estufa"}];
const clueNames={
 P01:"Pegadas misteriosas",P02:"Cera encontrada",P03:"A chave desaparecida",P04:"Correspondência secreta",
 P05:"O horário suspeito",P06:"Impressões no cristal",P07:"Poeira deslocada",P08:"Álibi incompleto",
 P09:"Testemunha silenciosa",P10:"Porta entreaberta",P11:"Contradição no relato",P12:"Último registro"};
const clueTemplates={
 P01:"Um registro de manutenção indica passagem por um corredor próximo a uma área investigada. Compare esta informação com os álibis.",
 P02:"Foi encontrada cera em um ponto que merece inspeção. Isso é uma pista de contexto, não uma confirmação isolada do objeto usado.",
 P03:"O livro de chaves apresenta uma movimentação incompleta. Verifique quem tinha acesso aos cômodos.",
 P04:"Uma correspondência foi mencionada por uma testemunha, mas seu conteúdo ainda precisa ser comparado com os motivos dos suspeitos.",
 P05:"Um relógio estava atrasado. Ao menos um horário relatado precisa ser verificado antes de tirar conclusões.",
 P06:"Um cálice foi manuseado durante a reunião. A informação, sozinha, não prova quem esteve no local do crime.",
 P07:"A poeira foi deslocada perto de um objeto decorativo. Considere também a possibilidade de movimentação anterior ao crime.",
 P08:"Um dos convidados não teve seu álibi confirmado por completo. Isso não significa necessariamente culpa.",
 P09:"Uma testemunha ouviu algo, mas não conseguiu identificar a pessoa. Cruze a informação com outros depoimentos.",
 P10:"Uma porta foi encontrada entreaberta. O registro não determina, sozinho, quando ou por quem ela foi aberta.",
 P11:"Dois relatos apresentam uma diferença de horário. Anote a contradição e procure outra fonte de confirmação.",
 P12:"Um registro final liga duas evidências já mencionadas. Revise suas anotações antes de acusar."
};
const $=id=>document.getElementById(id);
let state=null, scanner=null;
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function fillSelect(id,items){$(id).innerHTML=items.map(x=>`<option value="${x.id}">${x.name}</option>`).join("")}
fillSelect("suspect",suspects);fillSelect("object",objects);fillSelect("location",locations);
$("demoBtn").onclick=()=>{$("playerName").value="Marina";$("names").value="Marina\nRafael\nJoão\nAna";$("playerCount").value="4"};
$("createBtn").onclick=()=>{
 const n=Number($("playerCount").value);
 let names=$("names").value.split(/\n|,/).map(x=>x.trim()).filter(Boolean);
 if(names.length!==n){alert(`Digite exatamente ${n} nomes, um por linha.`);return}
 const solution={suspect:pick(suspects),object:pick(objects),location:pick(locations)};
 const all=[...suspects.map(x=>({...x,type:"suspect"})),...objects.map(x=>({...x,type:"object"})),...locations.map(x=>({...x,type:"location"}))];
 const solutionIds=new Set([solution.suspect.id,solution.object.id,solution.location.id]);
 const dealt=shuffle(all.filter(x=>!solutionIds.has(x.id)));
 const hands=names.map(()=>[]);
 dealt.forEach((card,i)=>hands[i%names.length].push(card));
 state={names,solution,hands,turn:0,usedClues:[],history:[],eliminated:[],playerIndex:0};
 $("welcome").classList.add("hidden");$("game").classList.remove("hidden");
 $("gameTitle").textContent="Mansão Vale Sombrio";render();
};
function render(){
 if(!state)return;
 $("turnText").textContent=`Vez de: ${state.names[state.turn]} • Jogador ${state.turn+1} de ${state.names.length}`;
 $("handCount").textContent=state.hands[state.turn].length;
 $("handList").innerHTML=state.hands[state.turn].map(c=>`<li><strong>${c.id}</strong> — ${c.name}</li>`).join("")||"<li>Nenhuma carta na mão.</li>";
 $("history").innerHTML=state.history.slice(-12).map(x=>`<li>${escapeHtml(x)}</li>`).join("")||"<li>Nenhuma ação registrada.</li>";
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("nextBtn").onclick=()=>{state.turn=(state.turn+1)%state.names.length;$("status").textContent="Turno passado. Entregue o celular ao próximo jogador neste protótipo local.";render()};
$("restartBtn").onclick=()=>{stopScanner();state=null;$("game").classList.add("hidden");$("welcome").classList.remove("hidden");$("result").classList.add("hidden");$("cluePanel").classList.add("hidden");$("status").textContent="Partida criada."};
$("scanBtn").onclick=async()=>{
 $("scannerPanel").classList.remove("hidden");
 if(!window.Html5Qrcode){$("status").textContent="A biblioteca de leitura não carregou. Verifique a conexão com a internet.";return}
 if(scanner)return;
 scanner=new Html5Qrcode("reader");
 try{await scanner.start({facingMode:"environment"},{fps:10,qrbox:{width:220,height:220}},decoded=>{handleQR(decoded);stopScanner()})}
 catch(e){$("status").textContent="Não foi possível abrir a câmera. Verifique a permissão e abra por HTTPS ou localhost.";scanner=null}
};
async function stopScanner(){if(scanner){try{await scanner.stop();await scanner.clear()}catch(e){}scanner=null}$("scannerPanel").classList.add("hidden")}
$("stopScanBtn").onclick=stopScanner;
function handleQR(raw){
 const parts=raw.split("|");
 if(parts.length!==3||parts[0]!=="DQR"||parts[1]!=="v1"){ $("status").textContent="QR não reconhecido. Use um QR do conjunto Detetive QR.";return}
 const id=parts[2];
 if(!clueNames[id]){$("status").textContent=`Carta ${id} reconhecida. Apenas cartas P01–P12 revelam pistas neste protótipo.`;return}
 if(state.usedClues.includes(id)){$("status").textContent="Esta carta de pista já foi usada nesta partida.";return}
 state.usedClues.push(id);
 $("clueText").textContent=`${id} — ${clueNames[id]}\n\n${clueTemplates[id]}`;
 $("cluePanel").classList.remove("hidden");
 state.history.push(`${state.names[state.turn]} revelou a carta de pista ${id} (${clueNames[id]}). O conteúdo foi mostrado neste aparelho.`);
 $("status").textContent="Pista demonstrativa revelada neste aparelho.";
 render();
}
function selected(id,items){return items.find(x=>x.id===$(id).value)}
$("hypothesisBtn").onclick=()=>{
 const s=selected("suspect",suspects),o=selected("object",objects),l=selected("location",locations);
 state.history.push(`${state.names[state.turn]} formulou hipótese: ${s.name} + ${o.name} + ${l.name}.`);
 $("status").textContent="Hipótese registrada no histórico local. Este protótipo ainda não implementa refutação privada entre celulares.";
 render();
};
$("accuseBtn").onclick=()=>{
 const s=selected("suspect",suspects),o=selected("object",objects),l=selected("location",locations);
 const correct=s.id===state.solution.suspect.id&&o.id===state.solution.object.id&&l.id===state.solution.location.id;
 const msg=correct?`ACERTOU! ${state.names[state.turn]} resolveu o caso.`:`Acusação incorreta. Solução: ${state.solution.suspect.name} + ${state.solution.object.name} + ${state.solution.location.name}.`;
 $("result").textContent=msg;$("result").classList.remove("hidden");
 state.history.push(`${state.names[state.turn]} fez uma acusação final: ${correct?"CORRETA":"INCORRETA"}.`);
 $("status").textContent=correct?"Mistério resolvido!":"Acusação incorreta; solução revelada no protótipo local.";
 render();
};
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}

async function entrarComoJogador() {
  const { data, error } =
    await supabaseClient.auth.signInAnonymously();

  if (error) {
    console.error("Erro no login:", error.message);
    return null;
  }

  console.log("Jogador autenticado com sucesso.");
  console.log("ID do jogador:", data.user.id);

  return data.user;
}

window.entrarComoJogador = entrarComoJogador;
