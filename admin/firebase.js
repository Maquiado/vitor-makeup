  const firebaseConfig = {
    apiKey: "AIzaSyCeRbnwjdUlkoIAtsET95m00Kds7xadecA",
    authDomain: "vitor-makeup.firebaseapp.com",
    projectId: "vitor-makeup",
    storageBucket: "vitor-makeup.appspot.com",
    messagingSenderId: "968145525660",
    appId: "1:968145525660:web:915f5e605adc86d527c659",
    measurementId: "G-67L0EMY6WS"
  };

firebase.initializeApp(firebaseConfig);

// Isso agora vai funcionar:
const auth = firebase.auth();
const db = firebase.firestore();