// Localizes the simple static pages and shares the language selected on the app page.
import { i18n, getText } from "./i18n.js";

const pageCopy = {
  about: {
    en: ["About", "Prompt Token Keyword Optimizer is a static serverless web app for turning one-shot prompts into structured keyword maps.", "It runs keyword extraction and token estimation in the browser, then saves a session to Firestore only when requested.", "The first version avoids external AI APIs so it can deploy easily to Cloudflare Pages."],
    ko: ["소개", "Prompt Token Keyword Optimizer는 원샷 프롬프트를 구조화된 키워드 맵으로 바꾸는 정적 서버리스 웹앱입니다.", "키워드 추출과 토큰 추정은 브라우저에서 실행되며, 사용자가 요청한 경우에만 Firestore에 저장합니다.", "초기 버전은 외부 AI API 없이 Cloudflare Pages에 쉽게 배포되도록 설계했습니다."],
    ja: ["紹介", "Prompt Token Keyword Optimizerは、プロンプトを構造化されたキーワードマップに変換する静的Webアプリです。", "抽出と推定はブラウザで行い、ユーザーが保存を選んだ場合のみFirestoreに保存します。", "初期版は外部AI APIなしでCloudflare Pagesへ簡単にデプロイできます。"],
    "zh-CN": ["关于", "Prompt Token Keyword Optimizer 是将一次性提示词转换为结构化关键词图的静态网页应用。", "关键词提取和令牌估算在浏览器中完成，只有用户主动保存时才写入 Firestore。", "初始版本不依赖外部 AI API，便于部署到 Cloudflare Pages。"],
    "zh-TW": ["關於", "Prompt Token Keyword Optimizer 是將一次性提示詞轉為結構化關鍵字圖的靜態網頁應用。", "關鍵字擷取與 Token 估算在瀏覽器完成，只有使用者主動儲存時才寫入 Firestore。", "初始版本不依賴外部 AI API，方便部署到 Cloudflare Pages。"],
    ru: ["О сервисе", "Prompt Token Keyword Optimizer превращает промпты в структурированные карты ключевых слов.", "Извлечение и оценка токенов выполняются в браузере, а сохранение в Firestore происходит только по запросу.", "Первая версия не использует внешние AI API и подходит для Cloudflare Pages."],
    fr: ["À propos", "Prompt Token Keyword Optimizer transforme un prompt en carte structurée de mots-clés.", "L'extraction et l'estimation des tokens se font dans le navigateur; Firestore n'est utilisé qu'après demande.", "La première version évite les API IA externes pour rester simple sur Cloudflare Pages."],
    de: ["Über", "Prompt Token Keyword Optimizer wandelt Prompts in strukturierte Keyword-Karten um.", "Extraktion und Token-Schätzung laufen im Browser; Firestore wird nur nach Nutzeraktion genutzt.", "Die erste Version nutzt keine externen KI-APIs und passt zu Cloudflare Pages."],
    es: ["Acerca de", "Prompt Token Keyword Optimizer convierte prompts en mapas estructurados de palabras clave.", "La extracción y estimación de tokens ocurren en el navegador; Firestore se usa solo al guardar.", "La primera versión evita APIs externas de IA para desplegarse fácilmente en Cloudflare Pages."],
    sv: ["Om", "Prompt Token Keyword Optimizer gör prompts till strukturerade nyckelordskartor.", "Extraktion och tokenberäkning sker i webbläsaren; Firestore används bara när du sparar.", "Första versionen undviker externa AI-API:er och passar Cloudflare Pages."],
    nl: ["Over", "Prompt Token Keyword Optimizer maakt gestructureerde trefwoordkaarten van prompts.", "Extractie en tokenschatting gebeuren in de browser; Firestore wordt alleen gebruikt bij opslaan.", "De eerste versie gebruikt geen externe AI-API's en past bij Cloudflare Pages."],
    no: ["Om", "Prompt Token Keyword Optimizer gjør prompter om til strukturerte nøkkelordkart.", "Uttrekk og tokenestimat skjer i nettleseren; Firestore brukes bare når du lagrer.", "Første versjon bruker ikke eksterne AI-API-er og passer Cloudflare Pages."],
    ar: ["حول", "يحوّل Prompt Token Keyword Optimizer المطالبات إلى خرائط كلمات منظمة.", "يتم الاستخراج وتقدير الرموز في المتصفح، ولا يتم الحفظ في Firestore إلا بطلب المستخدم.", "يتجنب الإصدار الأول واجهات AI خارجية ليسهل نشره على Cloudflare Pages."]
  },
  terms: {
    en: ["Terms of Use", "This tool is provided for prompt drafting and keyword exploration. Token counts are estimates.", "You are responsible for prompts, saved content, and any output based on this tool.", "The service may change or become unavailable without notice."],
    ko: ["이용약관", "이 도구는 프롬프트 초안 작성과 키워드 탐색을 위해 제공되며 토큰 수는 추정치입니다.", "프롬프트, 저장 내용, 이 도구를 기반으로 한 결과물의 책임은 사용자에게 있습니다.", "서비스는 사전 안내 없이 변경되거나 중단될 수 있습니다."],
    ja: ["利用規約", "このツールはプロンプト作成とキーワード探索のために提供され、トークン数は推定です。", "プロンプト、保存内容、出力結果に対する責任はユーザーにあります。", "サービスは予告なく変更または停止される場合があります。"],
    "zh-CN": ["条款", "本工具用于提示词草拟和关键词探索，令牌数量为估算值。", "用户需对提示词、保存内容以及基于本工具的结果负责。", "服务可能会在不另行通知的情况下变更或不可用。"],
    "zh-TW": ["條款", "本工具用於提示詞草擬與關鍵字探索，Token 數為估算值。", "使用者需對提示詞、儲存內容以及基於本工具的結果負責。", "服務可能在未通知的情況下變更或停止。"],
    ru: ["Условия", "Инструмент предназначен для черновиков промптов и поиска ключевых слов; токены оцениваются приблизительно.", "Вы отвечаете за промпты, сохраненные данные и результаты использования.", "Сервис может измениться или стать недоступным без уведомления."],
    fr: ["Conditions", "Cet outil sert à rédiger des prompts et explorer des mots-clés; les tokens sont estimés.", "Vous êtes responsable des prompts, contenus sauvegardés et résultats obtenus.", "Le service peut changer ou devenir indisponible sans préavis."],
    de: ["Bedingungen", "Dieses Tool dient dem Prompt-Entwurf und der Keyword-Suche; Tokenzahlen sind Schätzungen.", "Sie sind für Prompts, gespeicherte Inhalte und Ergebnisse verantwortlich.", "Der Dienst kann sich ohne Hinweis ändern oder ausfallen."],
    es: ["Términos", "Esta herramienta sirve para redactar prompts y explorar palabras clave; los tokens son estimados.", "Eres responsable de los prompts, contenido guardado y resultados.", "El servicio puede cambiar o dejar de estar disponible sin aviso."],
    sv: ["Villkor", "Verktyget används för promptutkast och nyckelordsutforskning; tokens är uppskattningar.", "Du ansvarar för prompter, sparat innehåll och resultat.", "Tjänsten kan ändras eller bli otillgänglig utan förvarning."],
    nl: ["Voorwaarden", "Deze tool is voor promptschetsen en trefwoordonderzoek; tokens zijn schattingen.", "Je bent verantwoordelijk voor prompts, opgeslagen inhoud en resultaten.", "De dienst kan zonder bericht wijzigen of onbeschikbaar zijn."],
    no: ["Vilkår", "Verktøyet brukes til promptutkast og nøkkelordutforsking; tokens er estimater.", "Du er ansvarlig for prompter, lagret innhold og resultater.", "Tjenesten kan endres eller bli utilgjengelig uten varsel."],
    ar: ["الشروط", "تُستخدم هذه الأداة لصياغة المطالبات واستكشاف الكلمات، وعدد الرموز تقديري.", "أنت مسؤول عن المطالبات والمحتوى المحفوظ والنتائج.", "قد تتغير الخدمة أو تتوقف دون إشعار."]
  },
  contact: {
    en: ["Contact", "For questions, feedback, or removal requests, contact the site operator.", "Email placeholder: contact@example.com", "Replace this address before production launch."],
    ko: ["문의", "질문, 피드백, 삭제 요청은 사이트 운영자에게 문의하세요.", "이메일 placeholder: contact@example.com", "정식 공개 전 실제 문의 주소로 교체하세요."],
    ja: ["お問い合わせ", "質問、フィードバック、削除依頼はサイト運営者へご連絡ください。", "メール placeholder: contact@example.com", "公開前に実際の連絡先へ変更してください。"],
    "zh-CN": ["联系", "如有问题、反馈或删除请求，请联系网站运营者。", "邮箱占位符: contact@example.com", "正式上线前请替换为真实地址。"],
    "zh-TW": ["聯絡", "如有問題、回饋或刪除請求，請聯絡網站營運者。", "信箱 placeholder: contact@example.com", "正式上線前請替換為真實地址。"],
    ru: ["Контакты", "По вопросам, отзывам или запросам на удаление свяжитесь с оператором сайта.", "Email placeholder: contact@example.com", "Замените адрес перед запуском."],
    fr: ["Contact", "Pour toute question, retour ou demande de suppression, contactez l'opérateur du site.", "E-mail placeholder: contact@example.com", "Remplacez cette adresse avant la mise en production."],
    de: ["Kontakt", "Für Fragen, Feedback oder Löschanfragen kontaktieren Sie den Betreiber.", "E-Mail placeholder: contact@example.com", "Ersetzen Sie diese Adresse vor dem Start."],
    es: ["Contacto", "Para preguntas, comentarios o solicitudes de eliminación, contacta al operador del sitio.", "Correo placeholder: contact@example.com", "Sustituye esta dirección antes del lanzamiento."],
    sv: ["Kontakt", "Kontakta webbplatsens operatör för frågor, feedback eller borttagningsbegäran.", "E-post placeholder: contact@example.com", "Byt adress före lansering."],
    nl: ["Contact", "Neem contact op met de beheerder voor vragen, feedback of verwijderverzoeken.", "E-mail placeholder: contact@example.com", "Vervang dit adres voor productie."],
    no: ["Kontakt", "Kontakt nettstedets ansvarlige for spørsmål, tilbakemelding eller sletting.", "E-post placeholder: contact@example.com", "Bytt adresse før lansering."],
    ar: ["اتصال", "للأسئلة أو الملاحظات أو طلبات الحذف، تواصل مع مشغل الموقع.", "بريد placeholder: contact@example.com", "استبدل العنوان قبل الإطلاق."]
  }
};

const languageSelect = document.getElementById("languageSelect");
const pageKey = document.body.dataset.page;

function applyStaticLanguage(language) {
  const safeLanguage = i18n[language] ? language : "en";
  localStorage.setItem("promptOptimizerLanguage", safeLanguage);
  document.documentElement.lang = safeLanguage;
  document.documentElement.dir = safeLanguage === "ar" ? "rtl" : "ltr";
  if (languageSelect) languageSelect.value = safeLanguage;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = getText(safeLanguage, el.dataset.i18n);
  });

  const copy = (pageCopy[pageKey] && (pageCopy[pageKey][safeLanguage] || pageCopy[pageKey].en)) || [];
  const title = document.getElementById("pageTitle");
  const body = document.getElementById("pageBody");
  if (title && copy[0]) title.textContent = copy[0];
  if (body) {
    body.innerHTML = "";
    copy.slice(1).forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      body.appendChild(p);
    });
  }
}

const initialLanguage = localStorage.getItem("promptOptimizerLanguage") || "en";
applyStaticLanguage(initialLanguage);
if (languageSelect) {
  languageSelect.addEventListener("change", () => applyStaticLanguage(languageSelect.value));
}
