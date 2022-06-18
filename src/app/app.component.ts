import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, debounceTime, distinctUntilChanged, interval, map, Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  intervalValue = 5;

  interval$ = new BehaviorSubject<number>(5);

  word$ = new BehaviorSubject<string>('loading...');

  wordList: string[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchWordList().subscribe((words) => {
      this.wordList = words;
      this.generateWord().subscribe(word => this.word$.next(word));
      this.interval$.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((intervalInSeconds: number) => interval(intervalInSeconds * 1000)),
        switchMap(() => this.generateWord())
      ).subscribe((word) => this.word$.next(word));
    })
  }

  onIntervalChange($event: number): void {
    this.interval$.next($event);
  }

  // private generateWord(): Observable<string> {
  //   return this.http.get<string[]>('https://random-word-form.herokuapp.com/random/noun').pipe(map(response => response[0]));
  // }

  private fetchWordList(): Observable<string[]> {
    return this.http.get<string[]>('/assets/words.json');
  }

  private generateWord(): Observable<string> {
    return new Observable(subscriber => {
      const i = Math.floor((Math.random() * this.wordList.length));
      subscriber.next(this.wordList[i]);
      subscriber.complete();
    });
    // return this.http.get<string[]>('/assets/words.json').pipe(map(response => {
    //   const l = response.length;
    //   const i = Math.floor((Math.random() * l - 1) + 0);
    //   return response[i];
    // }))
  }
}
