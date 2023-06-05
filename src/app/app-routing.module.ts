import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameStatusGuard, HomeGuard, QueryParamsGuard, RoomConnectionGuard, UsernameGuard } from '@guards/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./routes/home/home.component').then(c => c.HomeComponent),
    canActivate: [HomeGuard]
  },
  {
    path: 'room-list',
    loadComponent: () => import('./routes/room-list/room-list.component').then(c => c.RoomListComponent),
    canActivate: [UsernameGuard]
  },
  {
    path: 'room',
    loadComponent: () => import('./routes/room/room.component').then(c => c.RoomComponent),
    canActivate: [QueryParamsGuard, UsernameGuard, GameStatusGuard, RoomConnectionGuard]
  },
  {
    path: 'game',
    loadComponent: () => import('./routes/game/game.component').then(c => c.GameComponent),
    canActivate: [QueryParamsGuard, UsernameGuard, GameStatusGuard, RoomConnectionGuard]
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
