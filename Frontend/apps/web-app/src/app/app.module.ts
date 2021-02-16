import { NgModule } from '@angular/core';

// registering german locales for angular locale pipes like |date
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import localeDeAt from '@angular/common/locales/de-AT';
registerLocaleData(localeDe, localeDeExtra);
registerLocaleData(localeDeAt);

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MainModule } from './main/main.module';
import { HttpClientModule } from '@angular/common/http';
import { ComponentLibraryModule } from './component-library/component-library.module';
import { BrowserModule } from '@angular/platform-browser';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent],
  imports: [
    HttpClientModule,
    BrowserAnimationsModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }), // TODO: check howto call withServerTransition in BrowserAnimationsModule
    SharedModule,
    CoreModule,
    AuthModule,
    LayoutModule,
    MainModule,
    ComponentLibraryModule,
    AppRoutingModule,
    environment.production ? [] : AkitaNgDevtools.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
