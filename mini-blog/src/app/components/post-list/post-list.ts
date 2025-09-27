import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-list.html',
  styleUrls: ['./post-list.css']
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.postService.getAllPosts().subscribe(posts => {
      this.posts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }

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
}