import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
 
@Injectable()
export class AuthGuard implements CanActivate {
 
    constructor(private router: Router,
        public jwtHelper: JwtHelperService) { }
 
    canActivate() {
        let token = localStorage.getItem('auth_token');
        if (token && !this.jwtHelper.isTokenExpired(token)) {
            return true;
        }
        else {
            // not logged in so redirect to login page
            this.router.navigate(['/login']);
            return false;
        }
    }
}