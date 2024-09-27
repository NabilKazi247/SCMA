import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-api-request-modal',
  templateUrl: './api-request-modal.component.html',
  styleUrls: ['./api-request-modal.component.scss'],
})
export class ApiRequestModalComponent {
  modelKey!: string; // Definite assignment operator
  path!: string;
  method!: string;

  // Object to hold the user input parameters
  parameters: any = {};

  constructor(private modalController: ModalController) {}

  // Close the modal and pass the parameters back to the parent component
  closeModal() {
    this.modalController.dismiss({
      parameters: this.parameters,
    });
  }

  // Cancel modal without passing any data
  cancelModal() {
    this.modalController.dismiss();
  }
  getParameterFields() {
    // Logic for retrieving parameter fields for the form,
    // for example, based on the model, path, and method
    return [
      { name: 'param1', type: 'string', required: true },
      { name: 'param2', type: 'number', required: false },
    ];
  }
}
