import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post';

@Component({
  selector: 'app-new-post-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-post-form.html',
  styleUrls: ['./new-post-form.css']
})
export class NewPostFormComponent implements OnInit {
  formPost: Omit<Post, 'id'> = {
    title: '',
    content: '',
    author: '',
    date: new Date(),
    category: ''
  };

  formDateString: string = '';
  isEditMode: boolean = false;
  editingPostId: number | null = null;

  constructor(
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.editingPostId = Number(id);
      const existingPost = this.postService.getPostById(this.editingPostId);
      
      if (existingPost) {
        this.formPost = { ...existingPost };
        this.formDateString = this.formatDateForInput(existingPost.date);
      } else {
        this.router.navigate(['/posts']);
      }
    } else {
      this.formDateString = this.formatDateForInput(new Date());
    }
  }

  onSubmit(): void {
    this.formPost.date = new Date(this.formDateString);

    if (this.isEditMode && this.editingPostId) {
      const updatedPost: Post = { ...this.formPost, id: this.editingPostId };
      this.postService.updatePost(updatedPost);
    } else {
      this.postService.addPost(this.formPost);
    }

    this.router.navigate(['/posts']);
  }

  goBack(): void {
    this.location.back();
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }
}