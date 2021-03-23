import {Component, OnInit, ViewChild} from '@angular/core';
import { HttpService } from '../http.service';
import { PeriodicElement } from '../../types';
import {tap} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import {MatRadioChange} from '@angular/material/radio';

@Component({
  selector: 'app-prices',
  templateUrl: './prices.component.html',
  styleUrls: ['./prices.component.scss']
})
export class PricesComponent implements OnInit {
  loading = false;
  displayedColumns = ['name', 'price', 'circulating_supply', 'change_24h'];
  dataSource: MatTableDataSource<PeriodicElement>;

  @ViewChild(MatSort) sort: MatSort;

  constructor(private http: HttpService) { }

  ngOnInit(): void {
    this.loading = true;
    this.http.getData().pipe(
      tap(_ => { this.loading = false; }),
    ).subscribe((res: PeriodicElement[]) => {
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = (data: PeriodicElement, filter) => {
        return !filter || data.type === filter;
      };
    });
  }

  applyFilter(event: MatRadioChange): void {
    this.dataSource.filter = event.value;
  }

}
