import { Component } from '@angular/core';
import { SwapiService } from '../services/swapi.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  selectedModel: string | undefined;
  modelData: any;
  selectedFields: { [key: string]: boolean } = {};
  showDownloadButton = false;
  modelData2: any;

  constructor(private swapiService: SwapiService) {}

  ngOnInit() {
    this.fetchModelData();
  }

  fetchModelData() {
    this.swapiService.getModel().subscribe(
      (data) => {
        this.modelData = data;
        this.selectedFields = {};
        this.showDownloadButton = false; // Hide download button until model is created
        console.log('dlkdlkxx');
        console.log(data);
      },
      (error) => {
        console.error('Error fetching model data:', error);
        // Handle error as needed
      }
    );
  }

  createModel() {
    const selectedData: { [key: string]: any } = {};
    for (const key in this.selectedFields) {
      if (this.selectedFields[key]) {
        selectedData[key] = this.modelData[key];
      }
    }
    // this.modelData = selectedData;
    this.modelData2 = selectedData;

    for (const key in this.selectedFields) {
      if (this.selectedFields[key]) {
        console.log(selectedData[key]);
        this.swapiService.getModelDetails(selectedData[key]).subscribe(
          (data) => {
            console.log(data);
          },
          (error) => {
            console.error('Error fetching model data:', error);
            // Handle error as needed
          }
        );
      }
    }
    this.showDownloadButton = true; // Show download button after model is created
  }

  createModel2() {
    const selectedData: { [key: string]: any } = {};
    for (const key in this.selectedFields) {
      if (this.selectedFields[key]) {
        selectedData[key] = this.modelData[key];
      }
    }
    // this.modelData = selectedData;
    this.modelData2 = selectedData;

    this.showDownloadButton = true; // Show download button after model is created
  }

  downloadJson() {
    const blob = new Blob([JSON.stringify(this.modelData)], {
      type: 'application/json',
    });
    saveAs(blob, 'model.json');
  }

  // Method to get keys of an object
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
