import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { AboutComponent } from './pages/about/about.component';
import { AnaliseLexicaComponent } from './pages/analise-lexica/analise-lexica.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EditorComponent } from './components/editor/editor.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { ErrorConsoleComponent } from './components/error-console/error-console.component';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UploaderComponent } from './components/uploader/uploader.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TokensComponent } from './components/tokens/tokens.component';
import { DownloaderComponent } from './components/downloader/downloader.component';
import { AnaliseGramaticalComponent } from './pages/analise-gramatical/analise-gramatical.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HomePageComponent,
    AboutComponent,
    AnaliseLexicaComponent,
    EditorComponent,
    ErrorConsoleComponent,
    UploaderComponent,
    TokensComponent,
    DownloaderComponent,
    AnaliseGramaticalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    FormsModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
