// Fidelidade
async function buscarBocas() {
  const tel = document.getElementById("telefoneBusca").value.trim();
  const bocasEl = document.getElementById("areaBocas");
  const mensagemEl = document.getElementById("mensagemBonus");
  bocasEl.innerHTML = "";
  mensagemEl.textContent = "";

  if (!tel) {
    alert("Por favor, digite seu telefone.");
    return;
  }

  try {
    const snap = await db.collection("clientes").where("telefone", "==", tel).get();

    if (snap.empty) {
      bocasEl.innerHTML = "<p class='text-red-600'>Cliente não encontrado.</p>";
      return;
    }

    const cliente = snap.docs[0].data();
    const bocas = cliente.estrelas || 0;

    for (let i = 1; i <= 5; i++) {
      const img = document.createElement("img");
      img.src = i <= bocas ? "img/bocavermelha.png" : "img/bocavazia.png";
      img.className = "icone-boca";
      bocasEl.appendChild(img);
    }

    if (bocas >= 5) {
      mensagemEl.textContent = "🎉 Parabéns! Você ganhou uma Maquiagem Express!";
      mensagemEl.classList.add("texto-bonus");
    }

  } catch (err) {
    console.error("Erro ao buscar bocas:", err);
    bocasEl.innerHTML = "<p class='text-red-600'>Erro ao buscar dados.</p>";
  }
}

function registrarCliente(telefone, nome) {
  const docRef = db.collection("clientes").doc(telefone);

  docRef.get().then((doc) => {
    if (!doc.exists) {
      docRef.set({ nome, telefone, estrelas: 1 });
    } else {
      docRef.update({ estrelas: firebase.firestore.FieldValue.increment(1) });
    }
  });
}

// Slider
let current = 0;
const slides = document.querySelectorAll('.slide');
setInterval(() => {
  slides[current].classList.remove('active');
  current = (current + 1) % slides.length;
  slides[current].classList.add('active');
}, 4000);

// Lightbox
const imagens = document.querySelectorAll('.gallery img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

imagens.forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.classList.add('show');
  });
});

function fecharLightbox() {
  lightbox.classList.remove('show');
}