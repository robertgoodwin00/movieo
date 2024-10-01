import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private watchedKey = 'movie_watched_status';
  private ownedKey = 'movie_owned_status';
  private likedKey = 'movie_liked';

  constructor() {}

  saveWatchedStatus(movieId: number, watched: boolean) {
    const watchStatus = this.getWatchedStatus();
    watchStatus[movieId] = watched;
    localStorage.setItem(this.watchedKey, JSON.stringify(watchStatus));
  }

  getWatchedStatus(): { [key: number]: boolean } {
    const watchedStatus = localStorage.getItem(this.watchedKey);
    return watchedStatus ? JSON.parse(watchedStatus) : {};
  }

  saveOwnedStatus(movieId: number, owned: boolean) {
    const ownedStatus = this.getOwnedStatus();
    ownedStatus[movieId] = owned;
    localStorage.setItem(this.ownedKey, JSON.stringify(ownedStatus));
  }

  getOwnedStatus(): { [key: number]: boolean } {
    const ownedStatus = localStorage.getItem(this.ownedKey);
    return ownedStatus ? JSON.parse(ownedStatus) : {};
  }


  saveLikedStatus(movieId: number, value: number) {
    const likedStatus = this.getLikedStatus();
    likedStatus[movieId] = value;
    localStorage.setItem(this.likedKey, JSON.stringify(likedStatus));
  }

  getLikedStatus(): { [key: number]: number } {
    const likedStatus = localStorage.getItem(this.likedKey);
    return likedStatus ? JSON.parse(likedStatus) : {};
  }



}