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
    unlocked = true;
    max_login_attempts = 3;
 
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService) { }
 
    ngOnInit() {
        // reset login status
        this.authenticationService.logout();

 		// check if the user was previously blocked
 		let login_attempts = localStorage.getItem('login_attempts');
 		if (login_attempts == undefined) {
        	localStorage.setItem('login_attempts', String(1));
        }
        else {
        	if (parseInt(login_attempts) >= this.max_login_attempts) {
        		this.unlocked = false;
        	}
        }
    }
 
    login() {
        this.loading = true;
        this.authenticationService.login(this.model.email, this.model.password)
            	.subscribe(data => {
                    //this.authenticationService.token = token;
 
                    // store email and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('user_email', this.model.email);
					localStorage.setItem('auth_token', data.token);
					localStorage.removeItem('login_attempts');
					this.router.navigate(['/projects']);
            	},
            	error => {
            		let login_attempts = localStorage.getItem('login_attempts');

			    	if (parseInt(login_attempts) >= this.max_login_attempts) {
			    		this.unlocked = false;
			    		return;
			    	}
			    	else {
			    		localStorage.setItem('login_attempts', String(parseInt(login_attempts) + 1));
			    	}
            		this.error = 'E-naslov ali geslo je napačno.';
                    this.loading = false;
                }
            );
    }

}
