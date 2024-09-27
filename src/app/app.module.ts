import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { OpenapiService } from './services/openapi.service';
import { TabsComponent } from './tabs/tabs.component';
import { SafeUrlPipe } from 'safe-url.pipe'; // Import the pipe

@NgModule({
  declarations: [AppComponent, SafeUrlPipe, TabsComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    OpenapiService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
