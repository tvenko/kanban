import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {Config} from '../config/env.config';
import {HttpClient} from '@angular/common/http';

 
@Injectable()
export class AuthenticationService {
 
    constructor(private http: HttpClient) {
    }
 
    login(email: string, password: string): Observable<any> {
		return this.http.post(Config.API + '/api-token-auth/', { email: email, password: password });
    }

	verifyToken(token) {
		return this.http.post(Config.API + '/api-token-verify/', { token: token });
	}

	// refreshToken(token) {
	// 	return this.http.post(Config.API + '/api-token-refresh/', { token: token });
	// }

	// handleError(error: Response) {
	// 	return Observable.throw(false);
	// }
 
    logout(): void {
        // clear token remove user from local storage to log user out
        localStorage.removeItem('user');
		localStorage.removeItem('auth_token');
    }
}