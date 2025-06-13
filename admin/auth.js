firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    // Se não está logado, redireciona para login.html na pasta anterior
    window.location.href = "../logincliente.html";
  }
});

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "../logincliente.html";
  });
}