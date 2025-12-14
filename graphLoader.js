import { graph1 } from "./mapaPT.js";
import { graph2 } from "./graficoGBO.js";
 

graph1();

const target = document.querySelector("#grafLinhasReceitas");
let lineGraphLoaded = false;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !lineGraphLoaded) {
        graph2();
        lineGraphLoaded = true;
        observer.disconnect(); // load once only
      }
    });
  },
  {
    root: null,
    threshold: 0.3
  }
);

observer.observe(target);
/*
document.addEventListener("DOMContentLoaded", () => {
  graph1();
  graph2();
});
*/