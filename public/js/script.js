const hamBurger = document.querySelector(".toggle-btn");
const mainTextCenter = document.getElementById("main-text-center");
const mainContent = document.getElementById("mainContent");

hamBurger.addEventListener("click", function () {
  document.querySelector("#sidebar").classList.toggle("expand");
});