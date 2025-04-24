let poem = [
  ["The", "candle", "burns", "beside", "the", "page,"],
  ["A", "flicker", "dancing", "with", "my", "doubt."],
  ["Each", "word,", "a", "thread", "I", "dare", "to", "tug—"],
  ["Will", "it", "unravel", "me,", "or", "wrap", "me", "up?"],
];

const replacementMap = {
  candle: [
    "taper",
    "lamp",
    "lantern",
    "light",
    "candlelight",
    "flare",
    "torch",
    "chandler",
  ],
  burns: [
    "ignites",
    "scorches",
    "sears",
    "flames",
    "char",
    "incinerates",
    "blazes",
    "smolders",
  ],
  page: [
    "sheet",
    "leaf",
    "folio",
    "scroll",
    "paper",
    "parchment",
    "document",
    "manuscript",
  ],
  flicker: [
    "flutter",
    "sparkle",
    "twinkle",
    "glimmer",
    "waver",
    "blink",
    "shimmer",
    "flame",
  ],
  doubt: [
    "uncertainty",
    "skepticism",
    "mistrust",
    "suspicion",
    "hesitation",
    "qualm",
    "incredulity",
    "misgiving",
  ],
  word: [
    "term",
    "expression",
    "utterance",
    "phrase",
    "locution",
    "vocable",
    "designation",
    "saying",
  ],
  thread: [
    "strand",
    "fiber",
    "filament",
    "string",
    "yarn",
    "twine",
    "suture",
    "cord",
  ],
  tug: [
    "pull", 
    "yank", 
    "drag", 
    "jerk", 
    "wrench", 
    "tug", 
    "hoist", 
    "heave"
  ],
  unravel: [
    "disentangle",
    "untangle",
    "unscramble",
    "resolve",
    "disperse",
    "dissolve",
    "unwind",
    "extricate",
  ],
  wrap: [
    "envelop",
    "encase",
    "enfold",
    "swathe",
    "shroud",
    "cover",
    "clothe",
    "bind",
  ],
};

const finalizePrompts = [
  "Do you really want to end here?",
  "You could do better, you know.",
  "Seriously? Finalize this!?",
  'What happened to the "great" artist?',
  "You're sure you want to turn in this mess?",
];
let promptIndex = 0;
let lastEdit = { li: -1, wi: -1 };

let grainLevel = 0;

document
  .getElementById("promptYes")
  .addEventListener("click", () => handlePrompt(true));
document
  .getElementById("promptNo")
  .addEventListener("click", () => handlePrompt(false));

function beginDraft() {
  document.getElementById("beginBtn").style.display = "none";
  setTimeout(() => {
    document.getElementById("poem").style.display = "block";
    typeFullPoem(() => {
      document.getElementById("controls").style.display = "flex";
    });
  }, 1500);
}

function typeFullPoem(cb) {
  const c = document.getElementById("poem");
  c.innerHTML = "";
  const text = poem.map((l) => l.join(" ")).join("\n");
  let i = 0;
  function t() {
    if (i < text.length) {
      c.innerHTML += text[i] === "\n" ? "<br>" : text[i];
      document.getElementById("typeSound").currentTime = 0;
      document.getElementById("typeSound").play();
      i++;
      if (i == text.length) {
        document.getElementById("typeSound").pause();
      }
      setTimeout(t, 50);
    } else if (cb) cb();
  }
  t();
}

function displayPoem() {
  const html = poem
    .map((line, li) =>
      line
        .map((word, wi) =>
          typeof word === "string"
            ? word
            : word
                .map((w, idx) =>
                  idx < word.length - 1
                    ? li === lastEdit.li &&
                      wi === lastEdit.wi &&
                      idx === word.length - 2
                      ? `<span class="scribble-animate">${w}</span>`
                      : `<span class="scribble-static">${w}</span>`
                    : li === lastEdit.li && wi === lastEdit.wi
                    ? `<span class="new-word-animate">${w}</span>`
                    : `<span class="new-word-static">${w}</span>`
                )
                .join(" ")
        )
        .join(" ")
    )
    .join("<br>");
  document.getElementById("poem").innerHTML = html;
}

function editDraft() {
  let typeSound = document.getElementById("typeSound");
  typeSound.currentTime = 0;
  typeSound.play();

  let c = [];
  poem.forEach((l, li) =>
    l.forEach((w, wi) => {
      let k =
        typeof w === "string"
          ? w.replace(/[^a-zA-Z]/g, "").toLowerCase()
          : w[0].replace(/[^a-zA-Z]/g, "").toLowerCase();
      if (replacementMap[k]) c.push({ li, wi, key: k });
    })
  );
  if (!c.length) return;
  let { li, wi, key } = c[Math.floor(Math.random() * c.length)];
  let e = poem[li][wi];
  if (typeof e === "string") e = [e];
  let syns = replacementMap[key],
    n = (e.length - 1) % syns.length;
  e.push(syns[n]);
  poem[li][wi] = e;
  lastEdit = { li, wi };
  displayPoem();
}

function finalizeDraft() {
  promptIndex = 0;
  document.getElementById("promptContainer").style.display = "flex";
  showPrompt();
}

function showPrompt() {
  document.getElementById("promptText").textContent =
    finalizePrompts[promptIndex];
}

function updateBackground() {
  const maxRedOpacity = 0.5;
  const overlay = document.getElementById("globalOverlay");
  overlay.style.opacity =
    grainLevel > 0 ? Math.min(grainLevel * 1.5, maxRedOpacity) : 0;
  const container = document.getElementById("container");
  const centerOpacity = grainLevel > 0 ? Math.min(grainLevel * 0.3, 0.3) : 0;
  const edgeOpacity =
    grainLevel > 0 ? Math.min(grainLevel * 1.5, maxRedOpacity) : 0;
  container.style.background =
    edgeOpacity > 0
      ? `radial-gradient(circle at center, rgba(255,0,0,${centerOpacity}) 40%, rgba(255,0,0,${edgeOpacity}) 100%), url('https://www.transparenttextures.com/patterns/asfalt-dark.png') white`
      : "white";
}

function fadeOutGrain() {
  const fadeDuration = 500;
  const steps = 20;
  const stepTime = fadeDuration / steps;
  let initial = grainLevel;
  let currentStep = 0;
  const fadeInterval = setInterval(() => {
    currentStep++;
    grainLevel = initial * (1 - currentStep / steps);
    updateBackground();
    if (currentStep >= steps) {
      clearInterval(fadeInterval);
      grainLevel = 0;
      updateBackground();
      document.getElementById("promptContainer").style.display = "none";
    }
  }, stepTime);
}

function handlePrompt(isYes) {
  if (!isYes) {
    fadeOutGrain();
    return;
  }

  grainLevel = Math.min(grainLevel + 0.2, 1);
  updateBackground();

  promptIndex++;
  if (promptIndex < finalizePrompts.length) {
    showPrompt();
  } else {
    document.getElementById("promptContainer").style.display = "none";
    let msg = document.getElementById("endMessage");
    msg.textContent = "There is no end.";
    msg.style.color = "black";
    msg.style.fontSize = "2em";
    msg.style.whiteSpace = "nowrap";
    msg.style.textAlign = "center";
    msg.style.position = "absolute";
    msg.style.top = "50%";
    msg.style.left = "50%";
    msg.style.transform = "translate(-50%, -50%)";
    document.getElementById("finalizeDraft").style.display = "none";
  }
}
