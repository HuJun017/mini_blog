import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.css']
})
export class PostDetailComponent implements OnInit {
  post: Post | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.post = this.postService.getPostById(id);
  }

  deletePost(): void {
    if (this.post && confirm('Sei sicuro di voler eliminare questo post?')) {
      this.postService.deletePost(this.post.id);
      this.router.navigate(['/posts']);
    }
  }

  goBack(): void {
    this.location.back();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('it-IT');
  }
}