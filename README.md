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

# Project Changelog

## Version 1.5.0
### 🚀 Major Features
- **Selective Synchronization**: Implemented selective synchronization for user-defined model and API elements.
- **Bidirectional Synchronization**: Developed bidirectional synchronization mechanism for propagating changes between the model and the API structure.
- **Automatic Synchronization Triggers**:
  - **Instant Trigger**: Every change is propagated immediately.
  - **Scheduled Trigger**: Automatically syncs every hour.
  - **Delayed Trigger**: Waits 15 minutes after a change.
- **Manual Synchronization**: Added manual triggers for user-initiated sync.

### 🛠️ Enhancements
- Enhanced **API Method Customization** allowing users to selectively sync `GET`, `POST`, `PUT`, and `DELETE` methods.
- Refined **Model Extraction Process** to support complex types such as nested schemas and custom API parameters.
- Improved **Model Representation in Neo4j** for better querying and relationship management.
- Enhanced the **User Interface** for easier property selection and model visualization.
- Integrated **Path Information Visualization** within Step 3 of the workflow.

### ✅ Bug Fixes
- Fixed the issue with **Execute Button** remaining disabled despite valid property selection.
- Resolved inconsistencies in **Bidirectional Updates** when modifying nodes with multiple relationships.
- Corrected **Synchronization Logic** to prevent infinite loops when models are interdependent.

### 🎨 UI/UX Improvements
- Added **Color-Coded Method Labels** for `GET` (blue), `POST` (green), `PUT` (orange), and `DELETE` (red) methods.
- Updated the layout in **Step 3 - Select API Requests** for a more streamlined user experience.
- Introduced **Missing Property Highlighting** with gray-out effects and text indicators.

---

## Version 1.4.0
### ✨ Major Changes
- Introduced **User-Driven Model Customization** with the ability to modify selected fields in a model.
- Added **UML Diagram Visualization** for representing model structures graphically.

### 🛠️ Enhancements
- Refined **Model Creation Workflow** with a multi-step approach:
  - **Step 1**: Select Models.
  - **Step 2**: Select Related Models and Properties.
  - **Step 3**: Define API Requests.
  - **Step 4**: Execute and View Results.

### ✅ Bug Fixes
- Resolved path synchronization errors in **Neo4j Graph Update Module**.
- Fixed validation issues in **API Parameter Parsing**.

---

## Version 1.3.0
### 🌟 New Features
- Initial implementation of **OpenAPI-to-Model Synchronization** with basic CRUD operations.
- Integration of **Neo4j Service** for storing API paths and relationships.
- Created **Basic API Visualization** using PlantUML for diagrammatic representations.

### 🛠️ Enhancements
- Added **Model Relationships Mapping** for handling interdependencies between API elements.
- Enabled **Custom Property Selection** within models.

### ✅ Bug Fixes
- Fixed minor UI glitches in **Model Selection Screen**.
- Addressed inconsistencies in **Path Method Handling** during model sync.

---

## Version 1.2.0
### 📦 Major Updates
- Implemented **Initial Model Creation** from OpenAPI specifications.
- Integrated **Neo4j** for storing model graphs.

### ✅ Bug Fixes
- Fixed data-type mismatches between API parameters and Neo4j properties.

---

## Version 1.1.0
### 🛠️ Initial Release
- Core functionality for **OpenAPI Specification Parsing**.
- Basic **Model Creation** for primary schemas.

---

## **Changelog Format Key**
- 🚀 **Major Features**
- 🔄 **Synchronization Features**
- ✨ **UI/UX Improvements**
- 🐞 **Bug Fixes**
- 🛠️ **Enhancements**
- 📊 **Visual Features**
