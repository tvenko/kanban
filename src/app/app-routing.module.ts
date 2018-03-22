import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {NgModule} from '@angular/core';
import {BoardComponent} from './board/board.component';
import {AnalyticsComponent} from './analytics/analytics.component';
import {DocumentationComponent} from './documentation/documentation.component';
import {GroupsComponent} from './groups/groups.component';
import {ProjectsComponent} from './projects/projects.component';
import {UsersComponent} from './users/users.component';


const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'users', component: UsersComponent },
  { path: 'board', component: BoardComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'documentation', component: DocumentationComponent },
  { path: 'groups', component: GroupsComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'not-found', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
