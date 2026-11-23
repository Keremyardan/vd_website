import './style.css';
import copy from './data.js';
import { createExperience } from './scene.js';

const t = copy.locales.en;
const languages = [
  { code: 'en', country: 'gb', name: 'English' },
  { code: 'es', country: 'es', name: 'Español' },
  { code: 'ar', country: 'sa', name: 'العربية' },
  { code: 'ru', country: 'ru', name: 'Русский' },
  { code: 'tr', country: 'tr', name: 'Türkçe' }
];
const flagPath = language => `/assets/flags/${language.country}.svg`;
const picture = (name, id, alt, className='', extension='png') => `<img class="${className}" id="${id}" src="/assets/${name}.${extension}" alt="${alt}" width="1024" height="1024">`;
const documentArtwork = {
  mooddrake: { name: 'MoodDrake', extension: 'png' },
  tasknest: { name: 'LetItBe!', extension: 'png' },
  cocinova: { name: 'Cocinova', extension: 'jpg' }
};
const applications = Object.entries(copy.apps).map(([slug, app]) => `
  <section class="chapter application ${slug}" id="${slug}" aria-labelledby="${slug}-title">
    <div class="application-copy">
      <div class="application-heading" id="${slug}-icon-mobile"><h2 id="${slug}-title">${app.name}</h2></div>
      <p id="${slug}-desc" data-copy="apps.${slug}.desc">${app.description}</p>
      <div class="store-actions">${app.stores.map((store,index)=>`<a href="${store.url}" target="_blank" rel="noopener noreferrer">${store.icon}<span data-copy="apps.${index===0?'appStore':'playStore'}">${index===0?'App Store':'Play Store'}</span></a>`).join('')}</div>
      <div class="application-links">${app.legal.map(link=>`<a href="#${link.to}">${link.html.replaceAll('data-i18n','data-copy')}</a>`).join('')}</div>
    </div>
    <div class="fallback-artwork">${picture(slug,slug+'-icon',app.name+' Icon')}</div>
  </section>`).join('');

const cocinovaApplication = `
  <section class="chapter application cocinova" id="cocinova" aria-labelledby="cocinova-title">
    <div class="application-copy">
      <div class="application-heading" id="cocinova-icon-mobile"><h2 id="cocinova-title">Cocinova</h2></div>
      <p id="cocinova-desc" data-copy="apps.cocinova.desc">${t.apps.cocinova.desc}</p>
      <div class="application-links">
        <a href="#privacy-cocinova"><span data-copy="apps.privacyPolicy">${t.apps.privacyPolicy}</span> →</a>
        <a href="#support-cocinova"><span data-copy="apps.support">${t.apps.support}</span> →</a>
      </div>
    </div>
    <div class="fallback-artwork">${picture('cocinova','cocinova-icon','Cocinova Icon','','jpg')}</div>
  </section>`;

document.getElementById('app').innerHTML = `
  <header class="navigation-shell">
    <nav class="navigation-links" aria-label="Navigation"><a href="#hero" data-copy="nav.home">${t.nav.home}</a><a href="#mooddrake">MoodDrake</a><a href="#tasknest">LetItBe!</a><a href="#cocinova">Cocinova</a><a href="#contact" data-copy="nav.contact">${t.nav.contact}</a></nav>
    <div class="navigation-tools">
      <button class="motion-control" type="button" aria-label="Pause animation" aria-pressed="false"><svg class="pause-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10" stroke="currentColor" stroke-width="2"/></svg><svg class="play-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="m5.5 4 9 6-9 6Z" fill="currentColor"/></svg></button>
      <div class="language-control"><button class="language-button" type="button" aria-label="Language" aria-expanded="false" aria-controls="lang-dropdown"><img class="language-flag" id="current-lang-flag" src="${flagPath(languages[0])}" alt="" width="24" height="18"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor"/></svg></button><div class="language-options" id="lang-dropdown" hidden>${languages.map(language=>`<button type="button" data-locale="${language.code}"><img class="language-flag" src="${flagPath(language)}" alt="" width="24" height="18"><span lang="${language.code}">${language.name}</span></button>`).join('')}</div></div>
    </div>
  </header>
  <main>
    <div class="view" id="home">
      <section class="chapter introduction" id="hero" aria-labelledby="hero-title"><div class="hero-copy"><div id="hero-company-logo">${picture('company','company-logo','Company Logo','hero-company-logo')}</div><h1 id="hero-title" data-copy="hero.title">${t.hero.title}</h1><p id="hero-subtitle" data-copy="hero.subtitle">${t.hero.subtitle}</p></div><a class="scroll-arrow" href="#mooddrake" aria-label="MoodDrake"><svg viewBox="0 0 24 36" aria-hidden="true"><path d="M12 2v29M4 24l8 8 8-8" fill="none" stroke="currentColor"/></svg></a></section>
      ${applications}
      ${cocinovaApplication}
      <section class="chapter contact" id="contact"><h2 data-copy="contact.title">${t.contact.title}</h2><p data-copy="contact.subtitle">${t.contact.subtitle}</p><div class="contact-email">${copy.contactLinks[0]}</div><div class="social-links">${copy.contactLinks.slice(1).join('')}</div></section>
      <footer><p data-copy="footer.copyright">${t.footer.copyright}</p></footer>
    </div>
    ${copy.documents.map(doc=>{
      const slug = doc.id.split('-').at(-1);
      const artwork = documentArtwork[slug];
      return `<article class="view document" id="${doc.id}" hidden><a class="document-back" href="#home"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7" fill="none" stroke="currentColor"/></svg><span data-copy="common.backToHome">${t.common.backToHome}</span></a><header>${picture(slug,doc.id+'-icon',artwork.name+' Icon','',artwork.extension)}<h1${doc.titleKey?` data-copy="${doc.titleKey}"`:''}>${doc.title}</h1></header><div class="document-content">${doc.body.replaceAll('data-i18n','data-copy')}</div></article>`;
    }).join('')}
  </main>`;

const state = { language: 'en', route: 'home', paused: false };
const views = [...document.querySelectorAll('.view')];
const navLinks = [...document.querySelectorAll('.navigation-links a')];
const languageMenu = document.getElementById('lang-dropdown');
const languageButton = document.querySelector('.language-button');
const languageChoices = [...languageMenu.querySelectorAll('[data-locale]')];
const chapters = [...document.querySelectorAll('#home > .chapter')];
const fadeTargets = [...document.querySelectorAll('#home .hero-copy, #home .application-heading, #home .fallback-artwork img, #home .application-copy > p, #home .store-actions, #home .application-links, #home .contact > h2, #home .contact > p, #home .contact-email, #home .social-links')];
fadeTargets.forEach(element=>element.classList.add('scroll-fade'));
let scene;
let scrollFrame = 0;
let languageRequest = 0;
const languageFonts = new Map();
const fadeValues = new Map(fadeTargets.map(element=>[element,1]));
const fadeApplications = new Map(fadeTargets.map(element=>[element,element.closest('.application')]));
let fadeTime = 0;
let lastRenderedScroll = scrollY;

function prepareLanguageFont(language) {
  if (!languageFonts.has(language)) {
    const family = language === 'ar' ? 'Noto Sans Arabic' : ['tr', 'ru'].includes(language) ? 'Noto Sans' : 'Manrope';
    const content = copy.locales[language];
    const sample = `${content.hero.title} ${content.hero.subtitle} ${content.apps.mooddrake.desc}`;
    languageFonts.set(language, Promise.all([400, 500, 600, 700].map(weight => document.fonts.load(`${weight} 16px "${family}"`, sample))).catch(() => {}));
  }
  return languageFonts.get(language);
}

function captureReadingPosition() {
  const view = views.find(element => !element.hidden);
  if (!view) return null;
  const line = document.querySelector('.navigation-shell').getBoundingClientRect().bottom + 20;
  const candidates = [...view.querySelectorAll('h1,h2,.application-copy > p,.hero-copy > p,.contact > p,.fallback-artwork,.document-content p,.document-content li')];
  let anchor = view, score = Infinity;
  for (const element of candidates) {
    const rect = element.getBoundingClientRect();
    if (!rect.height || rect.bottom <= line || rect.top >= innerHeight) continue;
    const distance = rect.top <= line ? 0 : rect.top - line;
    if (distance < score) { score = distance; anchor = element; }
  }
  return { element: anchor, top: anchor.getBoundingClientRect().top };
}

function dismissLanguage(returnFocus=false) {
  languageMenu.hidden=true;
  languageButton.setAttribute('aria-expanded','false');
  if(returnFocus)languageButton.focus();
}
async function applyLanguage(language) {
  if(!Object.hasOwn(copy.locales,language))language='en';
  const request = ++languageRequest;
  dismissLanguage();
  await prepareLanguageFont(language);
  if (request !== languageRequest) return false;
  const anchor = captureReadingPosition();
  const keepContactAtBottom = ['#contact','#contacts'].includes(location.hash) && document.documentElement.scrollHeight-innerHeight-scrollY < 2;
  document.documentElement.classList.add('changing-language');
  state.language=language;
  document.documentElement.lang=language;
  document.documentElement.dir=language==='ar'?'rtl':'ltr';
  document.querySelectorAll('[data-copy]').forEach(element=>{
    const text=element.dataset.copy.split('.').reduce((value,key)=>value?.[key],copy.locales[language]);
    if(typeof text==='string')element.textContent=text;
  });
  const selectedLanguage = languages.find(option=>option.code===language);
  document.getElementById('current-lang-flag').src=flagPath(selectedLanguage);
  languageButton.setAttribute('aria-label',`Language: ${selectedLanguage.name}`);
  languageChoices.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.locale===language)));
  try{localStorage.setItem('language',language);}catch{}
  dismissLanguage();
  if (anchor?.element.isConnected) {
    const difference = anchor.element.getBoundingClientRect().top - anchor.top;
    if (Math.abs(difference) > .1) window.scrollBy({ top: difference, behavior: 'instant' });
  }
  if (keepContactAtBottom) window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'});
  scene?.resize();
  refreshScroll(performance.now(),true);
  requestAnimationFrame(() => {
    if (request === languageRequest) document.documentElement.classList.remove('changing-language');
  });
  return true;
}
function markNavigation(id) {
  navLinks.forEach(link=>{
    if(link.hash==='#'+id)link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
}
function refreshScroll(now=performance.now(),immediate=false) {
  if(scrollFrame)cancelAnimationFrame(scrollFrame);
  scrollFrame=0;
  if(document.getElementById('home').hidden)return;
  const viewportHeight=innerHeight;
  const maximumScroll=Math.max(0,document.documentElement.scrollHeight-viewportHeight);
  const scrollPosition=Math.max(0,Math.min(scrollY,maximumScroll));
  const topEdge=document.querySelector('.navigation-shell').getBoundingClientRect().bottom;
  const scrollPadding=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||topEdge;
  const positions=chapters.map(element=>({element,rect:element.getBoundingClientRect()}));
  const contentPositions=fadeTargets.map(element=>({element,rect:element.getBoundingClientRect()}));
  const remainingScroll=maximumScroll-scrollPosition;
  const smooth=value=>{const p=Math.max(0,Math.min(1,value));return p*p*(3-2*p);};
  const fading=scrollPosition>1;
  const applicationFades=new Map();
  for(let index=0;index<positions.length-1;index++){
    const {element,rect}=positions[index];
    if(!element.classList.contains('application'))continue;
    const ownAnchor=Math.max(0,Math.min(maximumScroll,rect.top+scrollPosition-scrollPadding));
    const nextAnchor=Math.max(0,Math.min(maximumScroll,positions[index+1].rect.top+scrollPosition-scrollPadding));
    const distance=Math.min(Math.max(180,viewportHeight*.35),Math.max(1,nextAnchor-ownAnchor));
    // The preceding app is fully faded when the following section's anchor is reached.
    applicationFades.set(element,smooth((nextAnchor-scrollPosition)/distance));
  }
  const delta=fadeTime?Math.min((now-fadeTime)/1000,.1):1/60;
  const blend=1-Math.exp(-delta*16);
  fadeTime=now;
  let settling=false;
  let current='hero';
  for(const {element,rect} of positions){
    if(rect.top<=viewportHeight*.45)current=element.id;
  }
  if(fading&&remainingScroll<=1)current=chapters.at(-1).id;
  for(const {element,rect} of contentPositions){
    const anticipation=40;
    const normalEntryDistance=Math.min(280,Math.max(180,viewportHeight*.28+anticipation));
    const visibleAtPageEnd=Math.max(1,viewportHeight+anticipation-rect.top+remainingScroll);
    const entryDistance=Math.min(normalEntryDistance,visibleAtPageEnd);
    const center=rect.top+Math.min(rect.height,viewportHeight*.7)/2;
    const outside=rect.bottom<=topEdge || rect.top>=viewportHeight;
    const documentTop=rect.top+scrollPosition;
    const visibleAtPageStart=documentTop<viewportHeight && documentTop+rect.height>topEdge;
    const initialCenter=documentTop+Math.min(rect.height,viewportHeight*.7)/2;
    const exitStart=visibleAtPageStart?Math.min(topEdge+viewportHeight*.32,initialCenter):topEdge+viewportHeight*.32;
    const exitEnd=Math.min(topEdge-Math.min(rect.height*.5,viewportHeight*.1),exitStart-1);
    const entering=visibleAtPageStart?1:smooth((viewportHeight+anticipation-rect.top)/entryDistance);
    const application=fadeApplications.get(element);
    const leaving=application
      ? smooth((rect.bottom-topEdge)/Math.min(100,Math.max(40,rect.height*.5)))*(applicationFades.get(application)??1)
      : smooth((center-exitEnd)/Math.max(1,exitStart-exitEnd));
    const target=fading?(outside?0:entering*leaving):1;
    const currentOpacity=lastRenderedScroll<=1&&fading&&!visibleAtPageStart?0:fadeValues.get(element);
    const change=(target-currentOpacity)*blend;
    const maximumChange=Math.min(.2,delta*5);
    // Clear only fully offscreen content so a quick reversal cannot reveal stale opacity.
    let opacity=immediate||fading&&outside?target:currentOpacity+Math.max(-maximumChange,Math.min(maximumChange,change));
    if(Math.abs(opacity-target)<.0008)opacity=target;
    else settling=true;
    fadeValues.set(element,opacity);
    element.style.setProperty('--content-opacity',opacity.toFixed(4));
  }
  lastRenderedScroll=scrollPosition;
  markNavigation(current);
  scene?.invalidate();
  if(settling)scheduleScroll();
}
function scheduleScroll(){if(!scrollFrame){if(performance.now()-fadeTime>120)fadeTime=0;scrollFrame=requestAnimationFrame(refreshScroll);}}
function resolveRoute(id,{animate=false,focus=false}={}) {
  const destination=document.getElementById(id==='contacts'?'contact':id);
  const view=destination?.closest('.view');
  if(!view)return false;
  views.forEach(element=>{element.hidden=element!==view;});
  state.route=view.id;
  scene?.setVisible(view.id==='home');
  scene?.resize();
  requestAnimationFrame(()=>{
    const behavior=animate&&!matchMedia('(prefers-reduced-motion:reduce)').matches?'smooth':'instant';
    if(destination===view)window.scrollTo({top:0,behavior});
    else destination.scrollIntoView({block:'start',behavior});
    if(focus){const heading=destination.matches('h1,h2,h3')?destination:destination.querySelector('h1,h2,h3');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
    refreshScroll(performance.now(),!animate);
    scene?.invalidate(true);
  });
  return true;
}
function routeFromAddress(){let id='home';try{id=decodeURIComponent(location.hash.slice(1))||id;}catch{}if(!resolveRoute(id))resolveRoute('home');dismissLanguage();}
document.addEventListener('click',event=>{
  const anchor=event.target.closest('a[href^="#"]');
  if(anchor&&event.button===0&&!event.defaultPrevented&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){let id;try{id=decodeURIComponent(anchor.hash.slice(1));}catch{return;}if(resolveRoute(id,{animate:true,focus:true})){event.preventDefault();if(location.hash!==anchor.hash)history.pushState(null,'',anchor.hash);dismissLanguage();}}
  if(!event.target.closest('.language-control'))dismissLanguage();
});
languageButton.addEventListener('click',()=>{languageMenu.hidden=!languageMenu.hidden;languageButton.setAttribute('aria-expanded',String(!languageMenu.hidden));if(!languageMenu.hidden)(languageChoices.find(button=>button.dataset.locale===state.language)||languageChoices[0]).focus();});
languageChoices.forEach(button=>button.addEventListener('click',async()=>{if(await applyLanguage(button.dataset.locale))languageButton.focus({preventScroll:true});}));
document.addEventListener('keydown',event=>{
  if(languageMenu.hidden)return;
  if(event.key==='Escape')dismissLanguage(true);
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();const index=languageChoices.indexOf(document.activeElement);languageChoices[(index+(event.key==='ArrowDown'?1:-1)+languageChoices.length)%languageChoices.length].focus();}
});
document.querySelector('.motion-control').addEventListener('click',event=>{
  state.paused=!state.paused;
  event.currentTarget.setAttribute('aria-pressed',String(state.paused));
  event.currentTarget.setAttribute('aria-label',state.paused?'Play animation':'Pause animation');
  scene?.setPaused(state.paused);
  scheduleScroll();
});
window.addEventListener('scroll',scheduleScroll,{passive:true});
window.addEventListener('resize',()=>{scene?.resize();scheduleScroll();},{passive:true});
window.addEventListener('hashchange',routeFromAddress);
window.addEventListener('popstate',routeFromAddress);
window.addEventListener('pageshow',routeFromAddress);
if('scrollRestoration'in history)history.scrollRestoration='manual';
let language='en';try{language=localStorage.getItem('language')||language;}catch{}
applyLanguage(language);
routeFromAddress();
scene=createExperience(document.getElementById('three-scene'),chapters);
scene?.setVisible(state.route==='home');
document.fonts.ready.then(()=>{scene?.resize();scheduleScroll();});
if(import.meta.hot)import.meta.hot.dispose(()=>scene?.dispose());
