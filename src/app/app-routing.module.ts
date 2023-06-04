import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, UsernameGuard } from '@guards/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./routes/home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'room-list',
    loadComponent: () => import('./routes/room-list/room-list.component').then(c => c.RoomListComponent),
    canActivate: [UsernameGuard]
  },
  {
    path: 'room',
    loadComponent: () => import('./routes/room/room.component').then(c => c.RoomComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'game',
    loadComponent: () => import('./routes/game/game.component').then(c => c.GameComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
