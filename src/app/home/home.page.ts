import { Component, OnInit } from '@angular/core';
import { SwapiService } from '../services/swapi.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  characterId: number | undefined;
  characterData: any;
  selectedFields: { [key: string]: boolean } = {};
  modelData: any;
  characterCount: number | undefined;

  constructor(private swapiService: SwapiService) {}

  ngOnInit() {
    this.fetchCharacterCount();
  }

  fetchCharacterData() {
    if (this.characterId) {
      this.swapiService.getCharacter(this.characterId).subscribe(
        (data) => {
          this.characterData = data;
          this.selectedFields = {};
        },
        (error) => {
          console.error('Error fetching character data', error);
        }
      );
    } else {
      alert('Please enter a character ID.');
    }
  }

  fetchCharacterCount() {
    this.swapiService.getCharacterCount().subscribe(
      (data) => {
        this.characterCount = data.count + 1;
      },
      (error) => {
        console.error('Error fetching character count', error);
      }
    );
  }

  createModel() {
    const selectedData: { [key: string]: any } = {}; // Explicitly type selectedData
    for (const key in this.selectedFields) {
      if (this.selectedFields[key]) {
        selectedData[key] = this.characterData[key];
      }
    }
    this.modelData = selectedData;
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
