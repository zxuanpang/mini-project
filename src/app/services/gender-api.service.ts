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
    const query = `"female politician" OR "women leaders" OR "female president" OR "Kamala Harris" OR "Sanna Marin" OR "Angela Merkel"`;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=relevancy&domains=cnn.com,bbc.com,nytimes.com&apiKey=${apiKey}`;

    return this.http.get(url);
  }
}
