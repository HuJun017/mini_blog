import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Aggiunto per ngModel
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // Aggiunto FormsModule
  templateUrl: './post-list.html',
  styleUrls: ['./post-list.css']
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  
  // NUOVE PROPRIETÀ per la ricerca
  searchTerm: string = '';
  searchMode: 'keyword' | 'id' = 'keyword';
  searchResults: Post[] = [];
  isSearchActive: boolean = false;
  selectedCategory: string = '';
  availableCategories: string[] = [];
  availableIds: number[] = [];
  totalPosts: number = 0;
  allPosts: Post[] = []; // Backup di tutti i post

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.postService.getAllPosts().subscribe(posts => {
      this.allPosts = [...posts]; // Salva tutti i post
      this.posts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.totalPosts = this.posts.length;
      
      // Aggiorna le opzioni di ricerca
      this.updateSearchOptions();
    });
  }

  // METODI ESISTENTI
  deletePost(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questo post?')) {
      this.postService.deletePost(id);
    }
  }

  getExcerpt(content: string): string {
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('it-IT');
  }

  // NUOVI METODI per la ricerca

  /**
   * Aggiorna le opzioni disponibili per la ricerca
   */
  updateSearchOptions(): void {
    // Estrai categorie uniche
    this.availableCategories = [...new Set(this.allPosts.map(post => post.category))];
    
    // Estrai ID disponibili (solo quelli validi)
    this.availableIds = this.allPosts
      .map(post => post.id)
      .filter(id => id != null)
      .sort((a, b) => a - b);
  }

  /**
   * Gestisce il cambio di modalità di ricerca
   */
  onSearchModeChange(): void {
    this.searchTerm = '';
    this.clearSearch();
    console.log(`🔄 Modalità ricerca cambiata a: ${this.searchMode}`);
  }

  /**
   * Gestisce il cambio di categoria
   */
  onCategoryChange(): void {
    if (this.searchTerm) {
      this.onSearch(); // Riapplica la ricerca con la nuova categoria
    }
  }

  /**
   * Esegue la ricerca
   */
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.showAllPosts();
      return;
    }

    this.isSearchActive = true;
    
    if (this.searchMode === 'id') {
      this.searchById(Number(this.searchTerm));
    } else {
      this.searchByKeyword(this.searchTerm);
    }

    console.log(`🔍 Ricerca eseguita:`, {
      modalità: this.searchMode,
      termine: this.searchTerm,
      categoria: this.selectedCategory,
      risultati: this.searchResults.length
    });
  }

  /**
   * Ricerca per parola chiave
   */
  searchByKeyword(keyword: string): void {
    const searchTerm = keyword.toLowerCase().trim();
    
    let results = this.allPosts.filter(post => 
      post.title?.toLowerCase().includes(searchTerm) ||
      post.content?.toLowerCase().includes(searchTerm) ||
      post.author?.toLowerCase().includes(searchTerm) ||
      post.category?.toLowerCase().includes(searchTerm)
    );

    // Applica filtro categoria se selezionato
    if (this.selectedCategory) {
      results = results.filter(post => post.category === this.selectedCategory);
    }

    this.searchResults = results;
    this.posts = [...results];
  }

  /**
   * Ricerca per ID
   */
  searchById(id: number): void {
    if (isNaN(id)) {
      this.searchResults = [];
      this.posts = [];
      return;
    }

    let results = this.allPosts.filter(post => post.id === id);

    // Applica filtro categoria se selezionato
    if (this.selectedCategory) {
      results = results.filter(post => post.category === this.selectedCategory);
    }

    this.searchResults = results;
    this.posts = [...results];
    
    // Aggiorna il campo di ricerca se chiamato dai suggerimenti
    if (this.searchTerm !== id.toString()) {
      this.searchTerm = id.toString();
    }
  }

  /**
   * Pulisce la ricerca e mostra tutti i post
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.isSearchActive = false;
    this.searchResults = [];
    this.showAllPosts();
    
    console.log('🧹 Ricerca pulita, mostrati tutti i post');
  }

  /**
   * Mostra tutti i post
   */
  showAllPosts(): void {
    this.posts = [...this.allPosts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    this.isSearchActive = false;
  }

  /**
   * Ottieni placeholder dinamico per il campo di ricerca
   */
  getSearchPlaceholder(): string {
    if (this.searchMode === 'id') {
      return `Inserisci ID post (es: ${this.availableIds[0] || '1'})`;
    } else {
      return 'Cerca per titolo, contenuto, autore o categoria...';
    }
  }

  /**
   * Ricerca rapida per ID dai suggerimenti
   */
  searchByIdSuggestion(id: number): void {
    this.searchTerm = id.toString();
    this.onSearch();
  }

  /**
   * Ottieni statistiche di ricerca
   */
  getSearchStats(): string {
    if (!this.isSearchActive) return '';
    
    const total = this.allPosts.length;
    const found = this.searchResults.length;
    const percentage = total > 0 ? Math.round((found / total) * 100) : 0;
    
    return `${found}/${total} (${percentage}%)`;
  }

  /**
   * Evidenzia il termine di ricerca nel testo (opzionale)
   */
  highlightSearchTerm(text: string): string {
    if (!this.isSearchActive || this.searchMode === 'id' || !this.searchTerm) {
      return text;
    }

    const searchTerm = this.searchTerm;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Verifica se un post corrisponde alla ricerca corrente
   */
  isPostInSearchResults(postId: number): boolean {
    return this.searchResults.some(post => post.id === postId);
  }
}