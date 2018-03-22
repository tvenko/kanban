import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { MainNavbarComponent } from './shared/main-navbar/main-navbar.component';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AppRoutingModule } from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { UsersComponent } from './users/users.component';
import { GroupsComponent } from './groups/groups.component';
import { BoardComponent } from './board/board.component';
import { DocumentationComponent } from './documentation/documentation.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { ProjectsComponent } from './projects/projects.component';


@NgModule({
  declarations: [
    AppComponent,
    MainNavbarComponent,
    LoginComponent,
    PageNotFoundComponent,
    UsersComponent,
    GroupsComponent,
    BoardComponent,
    DocumentationComponent,
    AnalyticsComponent,
    ProjectsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
