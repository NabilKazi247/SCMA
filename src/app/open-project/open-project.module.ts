import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OpenProjectPageRoutingModule } from './open-project-routing.module';

import { OpenProjectPage } from './open-project.page';
import { ApiRequestModalComponent } from '../api-request-modal/api-request-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OpenProjectPageRoutingModule,
  ],
  declarations: [OpenProjectPage, ApiRequestModalComponent],
})
export class OpenProjectPageModule {}
