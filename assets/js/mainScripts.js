document.addEventListener("DOMContentLoaded", () => {
  const caseList = document.getElementById("caseList");
  const storedCases = JSON.parse(localStorage.getItem("medicalCases")) || [];

  if (storedCases.length === 0) {
    caseList.innerHTML = "<p>No cases found. Add a new one!</p>";
  } else {
    storedCases.forEach((c, i) => {
      const card = document.createElement("div");
      card.classList.add("caseCard");
      card.innerHTML = `
        <h3>${c.title}</h3>
        <p>${c.summary}</p>
        <a href="pages/viewCase.html?id=${i}">View</a>
      `;
      caseList.appendChild(card);
    });
  }
});
