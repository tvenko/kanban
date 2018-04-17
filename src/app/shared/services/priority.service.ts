import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Config} from '../config/env.config';
import {Priority} from '../models/priority.interface';

@Injectable()
export class PriorityService {
    constructor(private http: HttpClient){}

    getProrities(){
        return this.http.get(Config.API + '/card_priority/');
    }
}