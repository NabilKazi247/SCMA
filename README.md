# **SCMA**

Welcome to SCMA App, an Ionic Angular application.

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

## **Usage**
### **Fetch Models**
Automatically fetches Models from the provided OpenAPI endpoint.

### **Select Models**
Select specific Models you want to include in the UML and Neo4j Graph model.

### **Create UML, Neo4j Graph Model and Cypher**
1. Click 'Create Graph Model' to generate the UML, Neo4j Graph model and Cypher code based on your selection.
2. Using different logic/approaches from OpenApi Specification such as:
   - find related models from selected models properties.
   - find related paths.
   - find related model from the related path and create relationship between the related model and selected model.
   - checks which properties of the model are required.
3. Following the above logic the UML, Neo4j Graph model and Cypher code are created..
4. Cypher code can be edited and executed which then will create the Graph Model in the connect Neo4j Database.

### **~~Download JSON~~**
~~Once the model is created, the Download JSON button will appear.
Click it to download the JSON data as a file (model.json).~~

## **Technologies Used**
- Ionic Framework
- Angular
- TypeScript
- Docker (For OpenProject)
- Neo4j Desktop
- ~~SWAPI (Star Wars API)~~
- OpenProject OpenAPI
- PetStore OpenAPI
- FileSaver.js
