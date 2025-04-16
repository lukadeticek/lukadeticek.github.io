document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("burger");
  const navLinks = document.querySelector(".nav-links");

  burger.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
});

const navItems = document.querySelectorAll(".nav-links a");

navItems.forEach(item => {
  item.addEventListener("click", () => {
    navLinks.classList.remove("show");
  });
});
