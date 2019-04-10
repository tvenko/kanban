import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Config} from '../config/env.config';

@Injectable()
export class AnalyticsService {

  constructor(private http: HttpClient) { }

  postAverageLeadTime(data) {
    return this.http.post(Config.API + '/card_time/', data);
  }

  postComulative(data) {
    return this.http.post(Config.API + '/card_time2/', data);
  }

}
