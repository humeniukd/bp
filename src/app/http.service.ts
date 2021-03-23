import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { MessageService } from './message.service';
import { map, tap, catchError } from 'rxjs/operators';
import {PeriodicElement} from '../types';

type Item = {
  attributes: PeriodicElement
};

type Response = {
  data: {
    attributes: {
      commodities: Item[],
      cryptocoins: Item[],
      indexes: Item[],
      fiats: Item[],
    }
  }
};

@Injectable()
export class HttpService {
  private baseUrl = 'https://api.bitpanda.com/v1/masterdata';

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  getData(): Observable<PeriodicElement[]> {
    return this.http.get<Response>(this.baseUrl)
      .pipe(
        map(res => {
          const resp: PeriodicElement[] = [];
          for (const type of ['commodities', 'cryptocoins', 'indexes', 'fiats']) {
            resp.push(...res.data.attributes[type].map(({ attributes }) => ({
              ...attributes,
              type,
              price: Number(attributes.avg_price || attributes.to_eur_rate).toFixed(4),
            })));
          }
          return resp;
        }),
        tap(_ => this.log('fetched data')),
        catchError(this.handleError<PeriodicElement[]>('getData', []))
      );
  }

  private log(message: string): void {
    this.messageService.add(`HttpService: ${message}`);
  }

  private handleError<T>(operation = 'operation', result?: T): (error: any) => Observable<T> {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
