(function () {
  const storageKey = "dentli_site_lang";
  const root = document.documentElement;
  const current = localStorage.getItem(storageKey) || "en";

  function applyLanguage(lang) {
    root.setAttribute("data-lang", lang);
    localStorage.setItem(storageKey, lang);

    document.querySelectorAll("[data-lang-button]").forEach(function (button) {
      const isActive = button.getAttribute("data-lang-button") === lang;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  document.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest("[data-lang-button]");
    if (!button) return;
    applyLanguage(button.getAttribute("data-lang-button") || "en");
  });

  applyLanguage(current);
})();
