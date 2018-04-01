import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../shared/services/authentication.service';

@Component({
  selector: 'app-login',
  moduleId: module.id,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	model: any = {};
    loading = false;
    error = null;
 
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService) { }
 
    ngOnInit() {
        // reset login status
        this.authenticationService.logout();
    }
 
    login() {
        this.loading = true;
        this.authenticationService.login(this.model.email, this.model.password)
        
            .subscribe(data => {
                    //this.authenticationService.token = token;
 
                    // store email and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('user_email', this.model.email);
					localStorage.setItem('auth_token', data.token);
					this.router.navigate(['/projects']);
            	},
            	error => {
            		this.error = 'E-naslov ali geslo je napačno.';
                    this.loading = false;
                }
            );
    }

}
