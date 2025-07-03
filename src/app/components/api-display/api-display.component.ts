import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { GenderApiService } from '../../services/gender-api.service';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { SafePipe } from '../../safe.pipe';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-api-display',
  standalone: true,
  imports: [CommonModule, SafePipe],
  templateUrl: './api-display.component.html',
  styleUrls: ['./api-display.component.css']
})
export class ApiDisplayComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  newsList: any[] = [];
  youtubeVideos: any[] = [];
  chart: Chart | null = null;
  chartData: { country: string, percentage: number }[] = [];
  isChartDataLoaded = false;
  initialDisplayCount = 5;
  displayCount = this.initialDisplayCount;
  slides: { src: string, title: string }[] = [];
  currentSlide = 0;

  nextSlide() {
  this.currentSlide = (this.currentSlide + 1) % this.slides.length;
}

prevSlide() {
  this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
}

  // Country code to name mapping
  private countryNames: { [key: string]: string } = {
    'MY': 'Malaysia',
    'US': 'United States',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'JP': 'Japan',
    'AU': 'Australia',
    'CA': 'Canada',
    'SE': 'Sweden',
    'NO': 'Norway'
  };

  constructor(private genderApi: GenderApiService) {}

  loadMore(): void {
    this.displayCount += 5;
  }
  
  showLess(): void {
    this.displayCount = this.initialDisplayCount;
  }


  ngOnInit(): void {

    // Get multiple countries data for chart
    this.genderApi.getMultipleCountriesGenderStats().subscribe({
      next: (responses) => {
        console.log('API Responses:', responses); // Debug log
        this.processChartData(responses);
      },
      error: (error) => {
        console.error('Error fetching chart data:', error);
        // Set a flag to show error message
        this.isChartDataLoaded = true; // This will hide loading message
      }
    });

    // Get news data
    this.genderApi.getNews().subscribe({
      next: (data) => {
        this.newsList = data.articles || [];
        this.newsList = this.filterAndTagNews(this.newsList);
      },
      error: (error) => {
        console.error('News API error:', error);
      }
    });

    this.genderApi.getYouTubeVideos().subscribe({
      next: (response) => {
        this.youtubeVideos = response.items.filter((video: any) =>
          video.snippet.title.toLowerCase().includes('gender') &&
          !video.snippet.title.toLowerCase().includes('troll') &&
          !video.snippet.title.toLowerCase().includes('edit') &&
          !video.snippet.channelTitle.toLowerCase().includes('shorts') &&
          !video.snippet.channelTitle.toLowerCase().includes('comedy') &&
          !video.snippet.channelTitle.toLowerCase().includes('funny')
        );
      },
      error: (error) => {
        console.error('YouTube API error:', error);
      }
    });

    this.genderApi.getGenderImages().subscribe({
  next: (response) => {
    this.slides = response.results.map((img: any) => ({
      src: img.urls.regular,
      title: img.alt_description || 'Feminist'
    }));
  }
});

  }

  private filterAndTagNews(newsList: any[]): any[] {
  const relevantPhrases = [
    'gender equality', 'equal pay', 'pay equity',
    'gender gap', 'women rights', 'female empowerment',
    'women in leadership', 'female president', 'gender policy',
    'sexual harassment', 'gender-based violence', 'feminism',
    'gender discrimination', 'gender justice', 'gender roles',
    'women protest', 'gender segregation', 'working women',
    'women in politics', 'education for girls', 'education access',
    'girls in school', 'educational inequality', 'female education'
  ];

  return newsList.map((article) => {
    const text = ((article.title || '') + ' ' + (article.description || '')).toLowerCase();
    const matches = relevantPhrases.filter(phrase => text.includes(phrase));

    let topicTag = '';
    if (text.includes('equal pay') || text.includes('pay equity') || text.includes('wage gap') || text.includes('pay gap')) {
      topicTag = 'Workplace Equality';
    } else if (text.includes('leadership') || text.includes('female president') || text.includes('women in leadership')) {
      topicTag = 'Women in Leadership';
    } else if (text.includes('harassment') || text.includes('violence') || text.includes('gender-based violence')) {
      topicTag = 'Gender-Based Violence';
    } else if (
      text.includes('feminism') || text.includes('rights') || 
      text.includes('reproductive rights') || text.includes('gender justice') || 
      text.includes('gender equality')) {
      topicTag = 'Women\'s Rights';
    } else if (
      text.includes('gender gap') || text.includes('segregation') || 
      text.includes('gender disparity')) {
      topicTag = 'Gender Disparity';
    } else if (text.includes('politics') || text.includes('parliament') || text.includes('women in politics')) {
      topicTag = 'Women in Politics';
    } else if (
      text.includes('education') || text.includes('education for girls') || 
      text.includes('girls in school') || text.includes('educational inequality') || 
      text.includes('female education') || text.includes('education access')) {
      topicTag = 'Education & Access';
    }

    return {
      ...article,
      isRelevant: matches.length >= 1,
      topicTag: topicTag || 'General Gender Topic'
    };
  }).filter(article => article.isRelevant);
}



  ngAfterViewInit(): void {
    // Chart will be created after data is loaded
    if (this.isChartDataLoaded && this.chartData.length > 0) {
      this.createChart();
    }
  }

  private processChartData(responses: any[]): void {
  this.chartData = [];

  responses.forEach((response, index) => {
    const countryCode = Object.keys(this.countryNames)[index];
    const countryName = this.countryNames[countryCode];

    if (response && response[1] && response[1].length > 0) {
      const latestData = response[1][0];
      if (latestData && latestData.value !== null) {
        this.chartData.push({
          country: countryName,
          percentage: parseFloat(latestData.value)
        });
      }
    }
  });

  this.chartData.sort((a, b) => b.percentage - a.percentage);

  this.isChartDataLoaded = true;

  setTimeout(() => {
    if (this.chartCanvas?.nativeElement && this.chartData.length > 0) {
      this.createChart();
    } else {
      console.warn('⚠️ Canvas not ready or no data!');
    }
  }, 100);
}


  private createChart(): void {
    if (!this.chartCanvas || this.chartData.length === 0) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: this.chartData.map(item => item.country),
        datasets: [{
          label: 'Women in Parliament (%)',
          data: this.chartData.map(item => item.percentage),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
            '#4BC0C0', '#FF6384'
          ],
          borderColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
            '#4BC0C0', '#FF6384'
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        // 👇 Add this line to make the bar chart horizontal
        // indexAxis: 'y',
        
        plugins: {
          title: {
            display: true,
            text: 'Women in Parliament by Country (%)',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {  // x
            beginAtZero: true,
            max: 60,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            },
            title: {
              display: true,
              text: 'Percentage (%)'
            }
          },
          x: {  // y
            title: {
              display: true,
              text: 'Countries'
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
    console.log('Chart created successfully');
  }
}
