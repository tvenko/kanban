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
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UsersService} from './shared/services/users.service';
import {HttpClientModule} from '@angular/common/http';
import { GroupsService } from './shared/services/groups.service';

import { AuthGuard } from './shared/guards/auth.guard';
import { AuthenticationService } from './shared/services/authentication.service';
import { JwtModule } from '@auth0/angular-jwt';
import { HttpModule } from '@angular/http';


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
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: () => {
          return localStorage.getItem('auth_token');
        },
        whitelistedDomains: ['localhost:3000', 'smrpo-backend.herokuapp.com']
      }
    }),
  ],
  providers: [UsersService, GroupsService, AuthGuard, AuthenticationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
