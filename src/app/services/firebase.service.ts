import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  Firestore,
  serverTimestamp
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(environment.firebaseConfig);
  public auth: Auth = getAuth(this.app);
  public db: Firestore = getFirestore(this.app);
  
  // Observable de l'état utilisateur (créé manuellement avec onAuthStateChanged)
  user$: Observable<User | null> = new Observable((observer) => {
    // onAuthStateChanged retourne une fonction de désinscription (unsubscribe)
    return onAuthStateChanged(this.auth, 
      (user) => observer.next(user),
      (error) => observer.error(error)
    );
  });

  constructor() {}

  // --- AUTHENTIFICATION ---

  login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  register(email: string, pass: string) {
    return createUserWithEmailAndPassword(this.auth, email, pass);
  }

  logout() {
    return signOut(this.auth);
  }

  // --- FIRESTORE ---

  getHouses(): Observable<any[]> {
    return new Observable((observer) => {
      const colRef = collection(this.db, 'houses');
      const unsubscribe = onSnapshot(colRef, 
        (snapshot) => {
          const houses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          observer.next(houses);
        },
        (error) => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  async addHouse(houseData: any): Promise<any> {
    const colRef = collection(this.db, 'houses');
    return await addDoc(colRef, {
      ...houseData,
      createdAt: serverTimestamp()
    });
  }
}
