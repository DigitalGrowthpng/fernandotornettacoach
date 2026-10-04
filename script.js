window.addEventListener("DOMContentLoaded", () => {
  /* ─── NAV: fondo al scrollear + scroll suave a las secciones ─── */
  const navbar = document.getElementById("navbar");
  if (navbar) {
    const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    navbar.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const hash = link.getAttribute("href");
        if (!hash || hash === "#") return;

        const target = document.querySelector(hash);
        if (!target) return;

        e.preventDefault();
        history.pushState(null, "", hash);

        const top = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: "smooth" });
      });
    });
  }

  /* ─── FORMULARIO: envío por email con Web3Forms ─── */
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("form-status");
  const btn = form.querySelector(".btn-submit");
  const label = btn.querySelector("span");
  const defaultLabel = label.textContent;

  const setStatus = (msg, type = "") => {
    status.textContent = msg;
    status.className = "form-status" + (type ? " " + type : "");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(form);
    if (data.get("botcheck")) return; // anti-spam (honeypot)

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !email || !message) {
      setStatus("Por favor completá todos los campos.", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("El email no parece válido. Revisalo, por favor.", "error");
      return;
    }

    btn.disabled = true;
    label.textContent = "Enviando...";
    setStatus("");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        form.reset();
        setStatus("¡Gracias! Tu mensaje fue enviado. Te respondo a la brevedad.", "success");
      } else {
        throw new Error(json.message || "Error al enviar");
      }
    } catch (err) {
      setStatus(
        "No se pudo enviar el mensaje. Probá de nuevo o escribime a fernandotornetta@gmail.com.",
        "error"
      );
    } finally {
      btn.disabled = false;
      label.textContent = defaultLabel;
    }
  });
});