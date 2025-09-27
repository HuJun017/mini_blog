import { Routes } from '@angular/router';
import { PostListComponent } from './components/post-list/post-list';
import { PostDetailComponent } from './components/post-detail/post-detail';
import { NewPostFormComponent } from './components/new-post-form/new-post-form';

export const routes: Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full' },
  { path: 'posts', component: PostListComponent },
  { path: 'post/:id', component: PostDetailComponent },
  { path: 'new-post', component: NewPostFormComponent },
  { path: 'edit-post/:id', component: NewPostFormComponent },
  { path: '**', redirectTo: '/posts' }
];