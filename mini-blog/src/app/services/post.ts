import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Post[] = [
    {
      id: 1,
      title: 'Introduzione ad Angular',
      content: 'Angular è un framework potente per lo sviluppo di applicazioni web moderne. Offre una struttura robusta e molte funzionalità integrate.',
      author: 'Marco Rossi',
      date: new Date('2024-01-15'),
      category: 'Tecnologia'
    },
    {
      id: 2,
      title: 'TypeScript: Il Futuro di JavaScript',
      content: 'TypeScript aggiunge tipizzazione statica a JavaScript, rendendo il codice più robusto e manutenibile. È diventato lo standard per progetti enterprise.',
      author: 'Laura Bianchi',
      date: new Date('2024-02-10'),
      category: 'Programmazione'
    },
    {
      id: 3,
      title: 'Responsive Design con Bootstrap',
      content: 'Bootstrap semplifica la creazione di layout responsive. Con il suo sistema di griglia e componenti predefiniti, sviluppare interfacce moderne è più veloce.',
      author: 'Giuseppe Verde',
      date: new Date('2024-02-20'),
      category: 'Design'
    },
    {
      id: 4,
      title: 'RxJS e Programmazione Reattiva',
      content: 'RxJS permette di gestire flussi di dati asincroni in modo elegante. Gli Observable sono uno strumento fondamentale in Angular.',
      author: 'Anna Neri',
      date: new Date('2024-03-05'),
      category: 'Tecnologia'
    },
    {
      id: 5,
      title: 'Testing in Angular',
      content: 'I test sono essenziali per garantire la qualità del codice. Angular fornisce ottimi strumenti per unit test e test di integrazione.',
      author: 'Federico Blu',
      date: new Date('2024-03-15'),
      category: 'Qualità'
    }
  ];

  private postsSubject = new BehaviorSubject<Post[]>(this.posts);
  posts$ = this.postsSubject.asObservable();

  constructor() {}

  getAllPosts(): Observable<Post[]> {
    return this.posts$;
  }

  getPostById(id: number): Post | undefined {
    return this.posts.find(post => post.id === id);
  }

  addPost(post: Omit<Post, 'id'>): void {
    const newId = Math.max(...this.posts.map(p => p.id)) + 1;
    const newPost: Post = { ...post, id: newId };
    this.posts.push(newPost);
    this.postsSubject.next([...this.posts]);
  }

  updatePost(updatedPost: Post): void {
    const index = this.posts.findIndex(post => post.id === updatedPost.id);
    if (index !== -1) {
      this.posts[index] = updatedPost;
      this.postsSubject.next([...this.posts]);
    }
  }

  deletePost(id: number): void {
    this.posts = this.posts.filter(post => post.id !== id);
    this.postsSubject.next([...this.posts]);
  }
}