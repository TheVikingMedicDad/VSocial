import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';
import { TranslationModuleServer } from './translation/translation.server.module';

@NgModule({
  imports: [AppModule, ServerModule, ModuleMapLoaderModule, TranslationModuleServer],
  bootstrap: [AppComponent],
  exports: [TranslationModuleServer],
})
export class AppServerModule {}
