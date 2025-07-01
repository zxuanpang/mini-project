import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenderApiService {

  constructor(private http: HttpClient) { }

  getGenderStats(): Observable<any> {
    return this.http.get('https://api.worldbank.org/v2/country/MY/indicator/SG.GEN.PARL.ZS?format=json');
  }

  // Get data for multiple countries
  getMultipleCountriesGenderStats(): Observable<any[]> {
    const countries = ['MY', 'US', 'GB', 'DE', 'FR', 'JP', 'AU', 'CA', 'SE', 'NO'];
    const requests = countries.map(country => 
      this.http.get(`https://api.worldbank.org/v2/country/${country}/indicator/SG.GEN.PARL.ZS?format=json&date=2020:2023&per_page=1`)
    );
    
    return forkJoin(requests);
  }

  getNews(): Observable<any> {
    const apiKey = 'cc361ab4ef7f4159adf85d92850b82ce';
    const query = `"gender equality" OR "female education" OR "women empowerment" OR "female politician" OR "equal pay" OR "women in leadership" OR "gender pay gap"`;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=relevancy&pageSize=20&apiKey=${apiKey}`;

    return this.http.get(url);
  }

  getYouTubeVideos(): Observable<any> {
    const apiKey = 'AIzaSyB7JI786ngpkYjGxsfVGD1-js2luqxoZ-4';
    const query = 'gender equality';
    const maxResults = 6;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(query)}&key=${apiKey}`;

    return this.http.get(url);
  }

  getGenderImages(): Observable<any> {
  const accessKey = 'B4_NAEcBzDemKypYOLxOc7sbtNGX4LA3-YMX9uWTWOo';
  const query = 'gender equality OR feminism OR women empowerment OR men equality';
  const url = `https://api.unsplash.com/search/photos?query=${query}&client_id=${accessKey}&per_page=5`;

  return this.http.get(url);
}


}
