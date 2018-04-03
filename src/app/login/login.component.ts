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
    maxLoginAttempts = 3;
    lockTime = 30 * 1000; // 30 seconds
    unlockCountdownNumber = null;
    unlockCountdownTimer = null;
 
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService) { }
 
    ngOnInit() {
        // reset login status
        this.authenticationService.logout();

 		// check if the user was previously blocked
 		let loginAttempts = localStorage.getItem('loginAttempts');
 		if (loginAttempts == undefined) {
        	localStorage.setItem('loginAttempts', String(1));
        }
        else {
        	if (parseInt(loginAttempts) >= this.maxLoginAttempts) {
        		// if lockTime still hasn't passed
        		let remainingLockTime = parseInt(localStorage.getItem('blockedUntil')) - Date.now();
        		if (remainingLockTime > 0) {
        			this.unlockCountdownNumber = Math.round(remainingLockTime / 1000);
        			this.unlocked = false;
        			this.runUnlockTimeout(remainingLockTime);
        			this.runCountdownTimer();
        		}
        		else {
        			localStorage.setItem('loginAttempts', String(1));
        		}

        	}
        }
    }
 
    login() {
        this.loading = true;
        this.authenticationService.login(this.model.email, this.model.password)
                .subscribe(data => {
                    // store email and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('userEmail', this.model.email);
					localStorage.setItem('authToken', data.token);
					localStorage.removeItem('loginAttempts');
					this.router.navigate(['/projects']);
            	},
            	error => {
            		let loginAttempts = localStorage.getItem('loginAttempts');

			    	if (parseInt(loginAttempts) >= this.maxLoginAttempts) {
			    		localStorage.setItem('blockedUntil', String(Date.now() + this.lockTime));
			    		this.unlockCountdownNumber = this.lockTime / 1000;
			    		this.runUnlockTimeout(this.lockTime);
			    		this.unlocked = false;
			    		this.runCountdownTimer();
			    	}
			    	else {
			    		localStorage.setItem('loginAttempts', String(parseInt(loginAttempts) + 1));
			    	}
            		this.error = 'E-naslov ali geslo je napačno.';
                    this.loading = false;
                }
            );
    }

    runCountdownTimer() {
    	this.unlockCountdownTimer = setInterval(() => {
											this.unlockCountdownNumber -= 1;
										}, 1000);
    }

    stopCountdownTimer() {
    	clearInterval(this.unlockCountdownTimer);
    }

    runUnlockTimeout(lockTime) {
    	setTimeout(() => {
					localStorage.setItem('loginAttempts', String(1));
					this.unlocked = true;
					this.stopCountdownTimer();
				}, lockTime);
    }

}
