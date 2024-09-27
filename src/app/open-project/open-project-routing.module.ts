import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OpenProjectPage } from './open-project.page';

const routes: Routes = [
  {
    path: '',
    component: OpenProjectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OpenProjectPageRoutingModule {}
