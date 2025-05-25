const buildBtn = document.querySelector(".build-box");
const buildWrapper = document.querySelector(".builds");
const one = document.querySelector(".one");
const tow = document.querySelector(".tow");
const thre = document.querySelector(".thre");
const infoWrapper = document.querySelector(".pro-card");
const stepOne = document.querySelector(".step-one");
const stepTow = document.querySelector(".step-tow");
const stepThre = document.querySelector(".step-thre");
const product = document.querySelectorAll(".main-proa");
const lastStep = document.querySelector(".summery");

let step = 1;

let selectedData = {
  barId: null,
  bites: null,
  collection: null,
};

buildBtn.addEventListener("click", (e) => {
  e.preventDefault();

  infoWrapper.classList.add("hidden");
  buildWrapper.style.display = "flex";
});

buildWrapper.addEventListener("click", (eo) => {
  eo.preventDefault();
  if (eo.target.classList.contains("svg-close")) {
    buildWrapper.style.display = "none";
    infoWrapper.classList.remove("hidden");
  }
});

let isEditMode = null;
product.forEach((el) => {
  el.addEventListener("click", (e) => {
    const selected = {
      id: el.getAttribute("data-pro"),
      title: el.getAttribute("data-title"),
      image: el.getAttribute("data-image"),
      price: el.getAttribute("data-price"),
    };

    if (isEditMode) {
      selectedData[isEditMode] = selected;
      isEditMode = null;
      stepOne.classList.add("ghost");
      stepTow.classList.add("ghost");
      stepThre.classList.add("ghost");
      renderLastStep();
      return;
    }

    if (step === 1) {
      selectedData.barId = selected;
      stepOne.classList.add("ghost");
      stepTow.classList.remove("ghost");
      one.classList.remove("active");
      tow.classList.add("active");
      step = 2;
    } else if (step === 2) {
      selectedData.bites = selected;
      stepTow.classList.add("ghost");
      tow.classList.remove("active");
      thre.classList.add("active");
      stepThre.classList.remove("ghost");
      step = 3;
    } else if (step === 3) {
      selectedData.collection = selected;
      one.classList.add("active");
      tow.classList.add("active");
      thre.classList.add("active");
      stepThre.classList.add("ghost");
      lastStep.classList.remove("ghost");
      renderLastStep();
    }
  });
});

function renderLastStep() {
  const total =
    parseFloat(selectedData.barId.price.replace(/[^0-9.]/g, "")) +
    parseFloat(selectedData.bites.price.replace(/[^0-9.]/g, "")) +
    parseFloat(selectedData.collection.price.replace(/[^0-9.]/g, ""));

  const totalFormatted = `$${total.toFixed(2)}`;

  lastStep.innerHTML = `
      <h1>Your Set Includes:</h1>
      <div class="sum">
           <div class="last">
           <div class="edit ">
             <p class="e-bar">Edite</p>
           </div>
          <div class="build-card">
              <img src="${selectedData.barId.image}" alt="">
              <h1>${selectedData.barId.title}</h1>
              <h2>${selectedData.barId.price}</h2>
          </div>
        </div>
        <div class="last">
        <div class="edit e-bites">
             <p>Edite</p>
           </div>
          <div class="build-card">
              <img src="${selectedData.bites.image}" alt="">
              <h1>${selectedData.bites.title}</h1>
                    <h2>${selectedData.bites.price}</h2>
          </div>
        </div>
        <div class="last">
        <div class="edit e-collection">
             <p>Edite</p>
           </div>
          <div class="build-card">
              <img src="${selectedData.collection.image}" alt="">
              <h1>${selectedData.collection.title}</h1>
                    <h2>${selectedData.collection.price}</h2>
          </div>
        </div>
      
      </div>
        <div class="set-footer">
         <h1>Totol: ${totalFormatted}</h1>
         <button class="add-set">Add To Card</button>
        </div>
    `;
  lastStep.classList.remove("ghost");
  const EditBar = document.querySelector(".e-bar");
  const EditBites = document.querySelector(".e-bites");
  const EditCollection = document.querySelector(".e-collection");
  const addSet = document.querySelector(".add-set");
  addSet.addEventListener("click", (e) => {
    e.preventDefault();
    console.log(selectedData);
    addToSet();
  });

  EditBar.addEventListener("click", (e) => {
    isEditMode = "barId";

    stepOne.classList.remove("ghost");
    lastStep.classList.add("ghost");
  });

  EditBites.addEventListener("click", (e) => {
    isEditMode = "bites";
    stepTow.classList.remove("ghost");
    lastStep.classList.add("ghost");
  });

  EditCollection.addEventListener("click", (e) => {
    isEditMode = "collection";
    stepThre.classList.remove("ghost");
    lastStep.classList.add("ghost");
  });
}

function addToSet() {
  fetch("/cart/add.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          id: selectedData.barId.id,
          quantity: 1,
        },
        {
          id: selectedData.bites.id,
          quantity: 1,
        },
        {
          id: selectedData.collection.id,
          quantity: 1,
        },
      ],
    }),
  }).then((res) => res.json());
}
