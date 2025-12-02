#!/usr/bin/env node

// Utilisation de 'require' pour une exécution directe avec Node.js sans configuration "module"
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");

// 1. Configuration Firebase (Celle de ton projet)
const firebaseConfig = {
  apiKey: "AIzaSyDll32rZOyn9kan59MUaaYUONYBB5eNXk0",
  authDomain: "elyes-2e850.firebaseapp.com",
  projectId: "elyes-2e850",
  storageBucket: "elyes-2e850.firebasestorage.app",
  messagingSenderId: "516472898770",
  appId: "1:516472898770:web:ec880b8404688be135d90b",
  measurementId: "G-7L01JCJPEQ"
};

// 2. Initialisation
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. Données à insérer (Respectant ta structure stricte)
const houses = [
  {
    title: "Villa de Luxe Hammamet",
    price: 3500,
    location: "Hammamet Nord",
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    description: "Magnifique villa avec piscine, vue mer, 5 chambres. Quartier calme et sécurisé.",
    bedrooms: 5,
    ownerPhone: "+216 215 415 425",
    ownerEmail: "elyes@gmail.com",
    createdAt: new Date()
  },
  {
    title: "Appartement S+2 La Marsa",
    price: 1800,
    location: "La Marsa",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    description: "Appartement haut standing, proche plage et commerces. Idéal pour couple ou petite famille.",
    bedrooms: 2,
    ownerPhone: "+216 215 415 425",
    ownerEmail: "elyes@gmail.com",
    createdAt: new Date()
  },
  {
    title: "Duplex Moderne Sousse",
    price: 1200,
    location: "Sousse Kantaoui",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    description: "Duplex spacieux dans résidence avec ascenseur. Place de parking incluse.",
    bedrooms: 3,
    ownerPhone: "+216 215 415 425",
    ownerEmail: "elyes@gmail.com",
    createdAt: new Date()
  }
];

// 4. Fonction d'insertion
async function seedDatabase() {
  console.log("🌱 Démarrage du seeding Firestore...");
  // Référence à la collection 'houses'
  const colRef = collection(db, "houses");

  try {
    for (const house of houses) {
      const docRef = await addDoc(colRef, house);
      console.log(`✅ Annonce ajoutée : ${house.title} (ID: ${docRef.id})`);
    }
    console.log("🎉 Base de données peuplée avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors du seeding :", error);
    process.exit(1);
  }
}

seedDatabase();