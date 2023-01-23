import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { AnaliseGramaticalComponent } from './pages/analise-gramatical/analise-gramatical.component';
import { AnaliseLexicaComponent } from './pages/analise-lexica/analise-lexica.component';
import { AnaliseSemanticaComponent } from './pages/analise-semantica/analise-semantica.component';
import { HomePageComponent } from './pages/home-page/home-page.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'calculator', component: HomeComponent },
  { path: 'sobre', component: AboutComponent },
  { path: 'analiseLexica', component: AnaliseLexicaComponent },
  { path: 'analiseGramatical', component: AnaliseGramaticalComponent },
  { path: 'analiseSemantica', component: AnaliseSemanticaComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
