import { Component, OnInit } from '@angular/core';
import { TMDBService } from '../tmdb.service';
import { StorageService } from '../storage.service';
import { MatRadioChange } from '@angular/material/radio';


@Component({
  selector: 'app-movie-search',
  templateUrl: './movie-search.component.html',
  styleUrls: ['./movie-search.component.scss']
})
export class MovieSearchComponent implements OnInit {
  searchTerm: string = '';
  movies: any[] = [];
  watchedChecked = false;
  ownedChecked = false;

  constructor(private tmdbService: TMDBService, private storageService: StorageService) {}

  ngOnInit(): void {}

  searchMovies() {
    if (!this.searchTerm && !this.watchedChecked && !this.ownedChecked) {
        return;
    }

    if (this.searchTerm) {
      this.tmdbService.searchMovies(this.searchTerm).subscribe((data: any) => {
        this.movies = data.results;
        this.filterMovies();
      });
    } else {
      this.tmdbService.getMoviesByStorage(this.watchedChecked, this.ownedChecked).subscribe((movies) => {
        this.movies = movies;
        console.log('got ' + this.movies.length.toString() + ' movies');
        
        const watched = this.storageService.getWatchedStatus();
        const owned = this.storageService.getOwnedStatus();
        const liked = this.storageService.getLikedStatus();

        this.movies.forEach(async (movie) => {
          this.filterMovies();

          
        });

      });
    }
    
  }


  filterMovies(skipApiCalls: Boolean = false) {
    const watched = this.storageService.getWatchedStatus();
    const owned = this.storageService.getOwnedStatus();
    const liked = this.storageService.getLikedStatus();

    if (this.movies.length == 0) {
      console.log('no movies');
      return;
    } else {
      this.movies = this.movies.filter(movie => {
        const matchesSearch = this.searchTerm ? movie.title.toLowerCase().includes(this.searchTerm.toLowerCase()) : true;
        const matchesWatched = this.watchedChecked ? watched[movie.id] : true;
        const matchesOwned = this.ownedChecked ? owned[movie.id] : true;
        return matchesSearch && matchesWatched && matchesOwned;
      });
    }


    if (skipApiCalls) {
      this.movies.forEach((movie) => {
        movie.watched = watched[movie.id];
        movie.owned = owned[movie.id];
        movie.liked = liked[movie.id] || 3;
      });
      return;
    }
    

    this.movies.forEach(async (movie) => {
        const credits = await this.tmdbService.getMovieCredits(movie.id).toPromise();
        const details = await this.tmdbService.getMovieDetails(movie.id).toPromise();
        

        movie.title = details.title;
        movie.release_date = details.release_date;
        movie.cast = credits.cast;
        movie.director = credits.director;
        movie.producer = credits.producer;
        movie.runtime = details.runtime;
        movie.watched = watched[movie.id];
        movie.owned = owned[movie.id];
        movie.liked = liked[movie.id] || 3;

        
    });
  }


  toggleWatchedFilter() {
    this.watchedChecked = !this.watchedChecked;
    this.searchMovies();
  }

  toggleOwnedFilter() {
    this.ownedChecked = !this.ownedChecked;
    this.searchMovies();
  }

  getPosterUrl(posterPath: string): string {
    if (!posterPath) return '';
    const baseURL = 'https://image.tmdb.org/t/p/';
    const size = 'w500';
    return `${baseURL}${size}${posterPath}`;
  }

  toggleWatched(movieId: number) {
    const watched = this.storageService.getWatchedStatus()[movieId];
    this.storageService.saveWatchedStatus(movieId, !watched);
    if (watched) {
        this.storageService.saveLikedStatus(movieId, 3); // Default to "No opinion"
    }
    this.filterMovies(true);

  }

  toggleOwned(movieId: number) {
    const owned = this.storageService.getOwnedStatus()[movieId];
    this.storageService.saveOwnedStatus(movieId, !owned);

    
  }

  setLiked(event: MatRadioChange, movieId: number) {
    this.storageService.saveLikedStatus(movieId, event.value);
  }
}