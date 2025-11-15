document.addEventListener("DOMContentLoaded", () => {
  // Year in footer
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Tabs for projects
  const tabButtons = document.querySelectorAll(".tab-btn");
  const cards = document.querySelectorAll(".project-card");

  function applyTab(tab) {
    cards.forEach((card) => {
      const category = card.getAttribute("data-category");

      if (tab === "all" || tab === category) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");

      // set active button
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // apply filter by tab
      applyTab(tab);
    });
  });

  // default: "all"
  applyTab("all");
});
