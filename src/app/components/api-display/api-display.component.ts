import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { GenderApiService } from '../../services/gender-api.service';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-api-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './api-display.component.html',
  styleUrl: './api-display.component.css'
})
export class ApiDisplayComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  newsList: any[] = [];
  chart: Chart | null = null;
  chartData: { country: string, percentage: number }[] = [];
  isChartDataLoaded = false;

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
      },
      error: (error) => {
        console.error('News API error:', error);
      }
    });
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

    // Sort by percentage descending
    this.chartData.sort((a, b) => b.percentage - a.percentage);
    this.isChartDataLoaded = true;
    
    // Create chart if view is already initialized
    if (this.chartCanvas && this.chartData.length > 0) {
      setTimeout(() => this.createChart(), 100); // Small delay to ensure DOM is ready
    }
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
          y: {
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
          x: {
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
