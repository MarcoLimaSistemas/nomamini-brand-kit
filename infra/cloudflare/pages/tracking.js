// ============================================================================
// Tracking da LP Noma Mini — pixel + GA4 + beacon /collect, com consentimento.
// Princípios:
//  - event_id = click_id  -> deduplica pixel (browser) × CAPI (servidor).
//  - pixel/GA4 só inicializam APÓS consentimento (LGPD).
//  - CTA sempre aponta pro Worker /go (que faz o redirect rastreado pro Shopee).
// ============================================================================
(function () {
  var C = window.NOMA;
  var qs = new URLSearchParams(location.search);

  // ---- contexto vindo do anúncio (UTMs, canal, cupom, fbclid) ----
  var ctx = {
    channel: qs.get("ch") || qs.get("canal") || "",
    coupon: qs.get("cupom") || qs.get("coupon") || "",
    utm_source: qs.get("utm_source") || "",
    utm_medium: qs.get("utm_medium") || "",
    utm_campaign: qs.get("utm_campaign") || "",
    utm_content: qs.get("utm_content") || "",
    fbclid: qs.get("fbclid") || "",
  };

  // ---- click_id first-party: persiste e vira event_id em todo evento ----
  var clickId = getCookie("nm_cid") || rid();
  setCookie("nm_cid", clickId, 90);

  // mostra o cupom na página (sem hardcode)
  if (ctx.coupon) document.getElementById("cupom").textContent = ctx.coupon;

  // ---- CTA -> Worker /go (redirect rastreado) ----
  var goUrl = buildGoUrl();
  ["cta", "cta2"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.setAttribute("href", goUrl);
    el.addEventListener("click", function () {
      track("Lead"); // clique de saída — dedupado pelo /go com mesmo event_id
    });
  });

  // ---- consentimento ----
  var consent = getCookie("nm_consent"); // "1" aceito, "0" recusado
  if (consent === "1") boot(true);
  else if (consent === "0") boot(false);
  else document.getElementById("consent").style.display = "block";

  document.getElementById("consent-ok").onclick = function () {
    setCookie("nm_consent", "1", 180); hideConsent(); boot(true);
  };
  document.getElementById("consent-no").onclick = function () {
    setCookie("nm_consent", "0", 180); hideConsent(); boot(false);
  };

  // ---- inicializa medição conforme consentimento ----
  function boot(allowed) {
    if (allowed) {
      initPixel();
      initGa4();
    }
    // PageView sempre logamos server-side (medição própria); só mandamos PII se consentido
    track("PageView");
    track("ViewContent");
  }

  function initPixel() {
    if (!C.PIXEL_ID || C.PIXEL_ID.indexOf("SEU_") === 0) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', C.PIXEL_ID);
  }

  function initGa4() {
    if (!C.GA4_ID) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + C.GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", C.GA4_ID);
  }

  // ---- dispara um evento no pixel (se ligado) + beacon server-side com mesmo event_id ----
  function track(name) {
    var consented = getCookie("nm_consent") === "1";
    if (consented && window.fbq) {
      fbq("track", name, { content_category: ctx.channel }, { eventID: clickId });
    }
    var body = {
      click_id: clickId, event_id: clickId, event_name: name,
      channel: ctx.channel, coupon: ctx.coupon, page: location.href,
      fbp: getCookie("_fbp"), fbc: getCookie("_fbc") || fbcFromClid(),
      ga_client_id: gaClientId(), consent: consented,
    };
    navigator.sendBeacon
      ? navigator.sendBeacon(C.TRACKER + "/collect", blob(body))
      : fetch(C.TRACKER + "/collect", { method: "POST", body: JSON.stringify(body), keepalive: true });
  }

  function buildGoUrl() {
    var u = new URL(C.TRACKER + "/go");
    u.searchParams.set("u", C.SHOPEE_URL);
    if (ctx.channel) u.searchParams.set("ch", ctx.channel);
    if (ctx.coupon) u.searchParams.set("cupom", ctx.coupon);
    ["utm_source","utm_medium","utm_campaign","utm_content"].forEach(function(k){
      if (ctx[k]) u.searchParams.set(k, ctx[k]);
    });
    if (ctx.fbclid) u.searchParams.set("fbclid", ctx.fbclid);
    var fbp = getCookie("_fbp"); if (fbp) u.searchParams.set("fbp", fbp);
    var cid = gaClientId(); if (cid) u.searchParams.set("ga_client_id", cid);
    return u.toString();
  }

  // ---- helpers ----
  function rid(){var b=new Uint8Array(12);crypto.getRandomValues(b);return Array.from(b,function(x){return x.toString(36).padStart(2,"0")}).join("").slice(0,16);}
  function fbcFromClid(){return ctx.fbclid?("fb.1."+Date.now()+"."+ctx.fbclid):"";}
  function gaClientId(){var m=document.cookie.match(/_ga=GA\d\.\d\.(\d+\.\d+)/);return m?m[1]:"";}
  function getCookie(n){var m=document.cookie.match("(^|;)\\s*"+n+"\\s*=\\s*([^;]+)");return m?decodeURIComponent(m.pop()):"";}
  function setCookie(n,v,days){var d=new Date();d.setTime(d.getTime()+days*864e5);document.cookie=n+"="+encodeURIComponent(v)+";expires="+d.toUTCString()+";path=/;SameSite=Lax;Secure";}
  function hideConsent(){document.getElementById("consent").style.display="none";}
  function blob(o){return new Blob([JSON.stringify(o)],{type:"application/json"});}
})();
