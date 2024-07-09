# **SCMA**

Welcome to SCMA App, an Ionic Angular application for dynamic JSON data handling and download.

## **Prerequisites**
Before you begin, ensure you have the following installed:

- Node.js (v14.x or later)
- Npm (Node Package Manager, comes with Node.js)
- Ionic CLI

To install Ionic CLI globally, use npm:

```
npm install -g @ionic/cli
```

## **Getting Started**
Follow these steps to set up and run the SCMA App locally:

### **Clone the Repository**
```
git clone [https://github.com/your-username/scma-app.git](https://github.com/NabilKazi247/SCMA.git && cd SCMA
```

### **Install Dependencies:**
```
npm install
```
### **Run the Development Server**

```
ionic serve
```
This command starts a local development server and opens your default web browser to preview the app.

## **Usage:**
### **Fetch Data**
1. Enter a Character ID (1-83) in the input field.
2. Click Fetch Data to retrieve information about the character from the Star Wars API (SWAPI).

### **Create Model**
1. Select specific data fields you want to include in the model.
2. Click Create Model to generate the JSON model based on your selections.

### **Download JSON**
Once the model is created, the Download JSON button will appear.
Click it to download the JSON data as a file (model.json).

## **Technologies Used**
- Ionic Framework
- Angular
- TypeScript
- SWAPI (Star Wars API)
- FileSaver.js

