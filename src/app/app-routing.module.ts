import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {AdminDashboardComponent} from './admin/admin-dashboard/admin-dashboard.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {NgModule} from '@angular/core';


const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'not-found', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
