import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./routes/home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'room/:id',
    loadComponent: () => import('./routes/room/room.component').then(c => c.RoomComponent)
  },
  {
    path: 'game/:id',
    loadComponent: () => import('./routes/game/game.component').then(c => c.GameComponent)
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
