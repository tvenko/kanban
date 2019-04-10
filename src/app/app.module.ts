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
import {BoardsListComponent} from './boards-list/boards-list.component';

import { AuthGuard } from './shared/guards/auth.guard';
import { AuthenticationService } from './shared/services/authentication.service';
import { JwtModule } from '@auth0/angular-jwt';
import { HttpModule } from '@angular/http';
import {BoardsService} from './shared/services/boards.service';
import {BoardsListService} from './shared/services/boards-list.service';

import {CalendarModule} from 'primeng/calendar';
import { ProjectsService } from './shared/services/projects.service';
import {MessageService} from './shared/services/message.service';
import { CardsComponent } from './board/cards/cards.component';
import { PriorityService } from './shared/services/priority.service';
import { CardsService } from './shared/services/cards.service';
import { DeleteReasonsService } from './shared/services/deleteReasons.service';

import { AnalyticsService } from './shared/services/analytics.service';
import { ChartsModule } from 'ng2-charts';

export function tokenGetterFunc() {
  return localStorage.getItem('auth_token');
}


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
    ProjectsComponent,
    BoardsListComponent,
    CardsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    CalendarModule,
    ChartsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetterFunc,
        whitelistedDomains: ['localhost:3000', 'smrpo-backend.herokuapp.com']
      }
    }),
  ],
  providers: [
    UsersService,
    GroupsService,
    AuthGuard,
    AuthenticationService,
    BoardsService,
    ProjectsService,
    BoardsListService,
    MessageService,
    PriorityService,
    CardsService,
    AnalyticsService,
    DeleteReasonsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
