import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Config} from '../config/env.config';
import {DeleteReason} from '../models/deleteReason.interface';

@Injectable()
export class DeleteReasonsService {
    constructor(private http: HttpClient){}

    getReasons(){
        return this.http.get(Config.API + '/card_delete_reason/');
    }
}