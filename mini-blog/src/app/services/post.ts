import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Post } from '../models/post.model';
// AGGIUNGI questa riga dopo gli altri import
import postsData from '../../assets/data/post.json';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly STORAGE_KEY = 'mini-blog-posts';
  
  // Post iniziali di default
private defaultPosts: Post[] = postsData.map(post => ({
  ...post,
  date: new Date(post.date)
}));

  private posts: Post[] = [];
  private postsSubject = new BehaviorSubject<Post[]>([]);
  posts$ = this.postsSubject.asObservable();

  constructor() {
    this.loadPostsFromStorage();
  }

  /**
   * Carica i post dal localStorage o inizializza con i post di default
   */
  private loadPostsFromStorage(): void {
    try {
      const storedPosts = localStorage.getItem(this.STORAGE_KEY);
      
      if (storedPosts) {
        // Se ci sono post salvati, caricali
        const parsedPosts = JSON.parse(storedPosts);
        // Converti le stringhe date in oggetti Date
        this.posts = parsedPosts.map((post: any) => ({
          ...post,
          date: new Date(post.date)
        }));
        
        console.log(`✅ Caricati ${this.posts.length} post dal localStorage`);
      } else {
        // Se non ci sono post salvati, usa quelli di default
        this.posts = [...this.defaultPosts];
        this.savePostsToStorage();
        
        console.log(`✅ Inizializzati ${this.posts.length} post di default`);
      }
      
      this.postsSubject.next([...this.posts]);
    } catch (error) {
      console.error('❌ Errore nel caricamento dei post dal localStorage:', error);
      // In caso di errore, usa i post di default
      this.posts = [...this.defaultPosts];
      this.postsSubject.next([...this.posts]);
    }
  }

  /**
   * Salva i post nel localStorage
   */
  private savePostsToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.posts));
      console.log(`💾 Salvati ${this.posts.length} post nel localStorage`);
    } catch (error) {
      console.error('❌ Errore nel salvataggio dei post nel localStorage:', error);
    }
  }

  /**
   * Ottieni tutti i post
   */
  getAllPosts(): Observable<Post[]> {
    return this.posts$;
  }

  /**
   * Ottieni un post per ID
   */
  getPostById(id: number): Post | undefined {
    return this.posts.find(post => post.id === id);
  }

  /**
   * Aggiungi un nuovo post
   */
  addPost(post: Omit<Post, 'id'>): void {
    // Genera ID semplice
    const newId = this.posts.length > 0 ? Math.max(...this.posts.map(p => p.id)) + 1 : 1;
    
    // Crea il nuovo post
    const newPost: Post = { 
      id: newId,
      title: post.title,
      content: post.content,
      author: post.author,
      category: post.category,
      date: new Date(post.date)
    };
    
    // Aggiungi, salva e notifica
    this.posts.unshift(newPost);
    this.savePostsToStorage();
    this.postsSubject.next([...this.posts]);
    this.updateJsonFile();
  }

  /**
   * Aggiorna un post esistente
   */
  updatePost(updatedPost: Post): void {
    try {
      const index = this.posts.findIndex(post => post.id === updatedPost.id);
      
      if (index !== -1) {
        // Assicurati che la data sia un oggetto Date
        this.posts[index] = {
          ...updatedPost,
          date: new Date(updatedPost.date)
        };
        
        // Salva nel localStorage
        this.savePostsToStorage();
        
        // Notifica i subscriber
        this.postsSubject.next([...this.posts]);
        this.updateJsonFile();
        
        console.log(`✅ Post aggiornato: "${updatedPost.title}" (ID: ${updatedPost.id})`);
      } else {
        console.warn(`⚠️ Post con ID ${updatedPost.id} non trovato per l'aggiornamento`);
      }
    } catch (error) {
      console.error('❌ Errore nell\'aggiornamento del post:', error);
    }
  }

  /**
   * Elimina un post
   */
  deletePost(id: number): void {
    try {
      const postToDelete = this.posts.find(post => post.id === id);
      
      if (postToDelete) {
        this.posts = this.posts.filter(post => post.id !== id);
        
        // Salva nel localStorage
        this.savePostsToStorage();
        
        // Notifica i subscriber
        this.postsSubject.next([...this.posts]);
        this.updateJsonFile();
        
        console.log(`✅ Post eliminato: "${postToDelete.title}" (ID: ${id})`);
      } else {
        console.warn(`⚠️ Post con ID ${id} non trovato per l'eliminazione`);
      }
    } catch (error) {
      console.error('❌ Errore nell\'eliminazione del post:', error);
    }
  }

  /**
   * Ripristina i post di default (utile per testing)
   */
  resetToDefault(): void {
    try {
      this.posts = [...this.defaultPosts];
      this.savePostsToStorage();
      this.postsSubject.next([...this.posts]);
      
      console.log('🔄 Post ripristinati ai valori di default');
    } catch (error) {
      console.error('❌ Errore nel ripristino dei post:', error);
    }
  }

  /**
   * Pulisci tutti i post (utile per testing)
   */
  clearAllPosts(): void {
    try {
      this.posts = [];
      this.savePostsToStorage();
      this.postsSubject.next([]);
      
      console.log('🗑️ Tutti i post sono stati eliminati');
    } catch (error) {
      console.error('❌ Errore nella pulizia dei post:', error);
    }
  }

  /**
   * Ottieni statistiche sui post
   */
  getPostsStats(): { total: number; categories: string[]; authors: string[] } {
    const categories = [...new Set(this.posts.map(post => post.category))];
    const authors = [...new Set(this.posts.map(post => post.author))];
    
    return {
      total: this.posts.length,
      categories,
      authors
    };
  }

  /**
   * Cerca post per titolo o contenuto
   */
  searchPosts(query: string): Post[] {
    if (!query.trim()) {
      return [...this.posts];
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    return this.posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.author.toLowerCase().includes(searchTerm) ||
      post.category.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Filtra post per categoria
   */
  getPostsByCategory(category: string): Post[] {
    return this.posts.filter(post => 
      post.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Ottieni post per autore
   */
  getPostsByAuthor(author: string): Post[] {
    return this.posts.filter(post => 
      post.author.toLowerCase() === author.toLowerCase()
    );
  }
  // AGGIUNGI questi metodi
exportToJsonFile(): void {
  const dataStr = JSON.stringify(this.posts, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'posts.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log('📁 File posts.json scaricato!');
}

private updateJsonFile(): void {
  console.log('📝 Copia questo in src/assets/data/posts.json:');
  console.log(JSON.stringify(this.posts, null, 2));
}
}