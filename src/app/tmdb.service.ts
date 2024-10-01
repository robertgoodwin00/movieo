import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, forkJoin, map, Observable, of } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TMDBService {
  private apiKey: string = '05c55e7abc6ba71fb7c72ac21b72331e'; // Replace with your TMDB API key
  private apiUrl: string = 'https://api.themoviedb.org/3';

  constructor(private http: HttpClient, private storageService: StorageService) {}

  searchMovies(query: string): Observable<any> {
    const url = `${this.apiUrl}/search/movie?api_key=${this.apiKey}&query=${query}`;
    return this.http.get(url);
  }



  getMovieCredits(movieId: number): Observable<any> {
    const url = `${this.apiUrl}/movie/${movieId}/credits?api_key=${this.apiKey}`;
    return this.http.get(url).pipe(
      map((credits: any) => {
        const director = credits.crew.find((member: any) => member.job === 'Director');
        const producer = credits.crew.find((member: any) => member.job === 'Producer');
        return {
          cast: credits.cast,
          director: director ? director.name : 'Unknown',
          producer: producer ? producer.name : 'Unknown'
        };
      })
    );
  }

  getMovieDetails(movieId: number): Observable<any> {
    const url = `${this.apiUrl}/movie/${movieId}?api_key=${this.apiKey}`;
    return this.http.get(url).pipe(
      map((movie: any) => {
        return {
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path,
          runtime: movie.runtime,
          watched: false,
          owned: false
        };
      })
    );
  }


  getMoviesByStorage(watchedChecked: boolean, ownedChecked: boolean): Observable<any[]> {
    
    
    const watched = this.storageService.getWatchedStatus();
    const owned = this.storageService.getOwnedStatus();
  
    console.log('watchChecked=' + watchedChecked.toString());
    console.log(watched.toString());
    console.log(Object.keys(watched).toString());
    

    const watchedMovieIds = Object.keys(watched).filter((id) => (watched[Number(id)] && watchedChecked) || !watchedChecked);
    const ownedMovieIds = Object.keys(owned).filter((id) => (owned[Number(id)] && ownedChecked) || !ownedChecked);
  
    let matchingMovieIds = watchedMovieIds.concat(ownedMovieIds);
    let uniqueMatchingMovieIds = [...new Set(matchingMovieIds)];

    /*matchingMovieIds.push("109428");
    matchingMovieIds.push("703731");
    matchingMovieIds.push("766");
    matchingMovieIds.push("28");*/

    if (!uniqueMatchingMovieIds.length) {
      console.log('none');
      return of([]);
    }
  
    return forkJoin(
      uniqueMatchingMovieIds.map((movieId) => {
        return combineLatest([
          this.getMovieDetails(parseInt(movieId)),
          this.getMovieCredits(parseInt(movieId)),
        ]);
      })
    ).pipe(
      map((results) => {
        return results.map(([movieDetails, movieCredits]) => ({
          ...movieDetails,
          ...movieCredits,
          
        }));
      })
    );
  }


}