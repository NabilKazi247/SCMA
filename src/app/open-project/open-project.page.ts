import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  ɵsetAlternateWeakRefImpl,
} from '@angular/core';
import { OpenapiService } from '../services/openapi.service';
import * as plantumlEncoder from 'plantuml-encoder';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlertController } from '@ionic/angular';
import { flatGroup, path } from 'd3';
import { Neo4jService } from '../services/neo4j.service';
@Component({
  selector: 'app-open-project',
  templateUrl: 'open-project.page.html',
  styleUrls: ['open-project.page.scss'],
})
export class OpenProjectPage implements OnInit {
  @ViewChild('missingTextDiv') missingTextDiv!: ElementRef;
  allModels: any;
  checkedModels: { [key: string]: boolean } = {};
  allRelatedModels: { [key: string]: any } = {};
  selectedModels: { [key: string]: boolean } = {}; // Holds the selected models after 'Create Model' is pressed
  executedModel!: string;
  showDownloadButton = false;
  cypherCode: string | undefined; // This will hold the generated Cypher code
  cypherCode2: string | undefined;
  umlUrl: SafeResourceUrl | undefined;
  issecl: boolean = false;
  issecl2: boolean = false;
  isCreateModelDisabled = true;
  pathsAvailable: boolean = false;
  params: any = {};
  customizedOutput: any;
  umlText = '@startuml\n';
  query: string | undefined;

  constructor(
    private openapiService: OpenapiService,
    private alertController: AlertController,
    private sanitizer: DomSanitizer,
    private neo4jService: Neo4jService
  ) {}

  ngOnInit() {
    this.fetchModels();
    const query = 'MATCH (n) RETURN n'; // Example query: tracks all nodes in the database
    this.neo4jService.startTrackingChanges(query);
    // this.openapiService
    //   .makeApiRequest('/pet', 'get', { limit: 10 })
    //   .subscribe((response) => {
    //     console.log('API Response:', response);
    //   });
  }

  //-------------------------------------------------STEP 1-----------------------------------------------------------------------------
  // Fetch models from API
  fetchModels() {
    this.openapiService.getProjects().subscribe(
      (data) => {
        console.log(data);
        this.allModels = Object.entries(data.components.schemas).map(
          ([key, value]: any) => {
            return { key, value };
          }
        );
      },
      (error) => {
        console.error('Error fetching Models:', error);
      }
    );
  }

  // Handle model selection change
  onModelSelectionChange() {
    this.isCreateModelDisabled = !Object.values(this.checkedModels).some(
      (selected) => selected
    );
  }

  //-------------------------------------------------STEP 2-----------------------------------------------------------------------------
  createProjectModel() {
    this.selectedModels = { ...this.checkedModels }; // Copy checkedModels to selectedModels
    this.generateUMLFromOpenAPI(this.selectedModels); // Use selectedModels for further processing

    for (const modelKey in this.selectedModels) {
      if (this.selectedModels[modelKey]) {
        const model = this.allModels.find((m: any) => m.key === modelKey);
        this.addRelatedModels(model.key, model.value);
      }
    }
  }

  addRelatedModels(modelKey: string, modelSchema: any) {
    const properties = modelSchema.properties || {};
    const relatedModels = [];

    for (const property in properties) {
      const prop = properties[property];

      const isRequired = (modelSchema.required || []).includes(property);

      if (prop.$ref) {
        const relatedModelKey = this.getRefType(prop.$ref);

        if (!this.allRelatedModels[relatedModelKey]) {
          const relatedModel = this.allModels.find(
            (m: any) => m.key === relatedModelKey
          );
          this.allRelatedModels[relatedModelKey] = {
            properties: relatedModel.value.properties || {},
            required: relatedModel.value.required || [],
            selectedFields: {},
          };
        }

        relatedModels.push({ [relatedModelKey]: property });
      } else if (prop.items && prop.items.$ref) {
        const relatedModelKey = this.getRefType(prop.items.$ref);
        if (!this.allRelatedModels[relatedModelKey]) {
          const relatedModel = this.allModels.find(
            (m: any) => m.key === relatedModelKey
          );
          this.allRelatedModels[relatedModelKey] = {
            properties: relatedModel.value.properties || {},
            required: relatedModel.value.required || [],
            selectedFields: {},
          };
        }
        relatedModels.push({ [relatedModelKey]: property });
      } else if (
        property.toLowerCase().includes('id') &&
        property.toLowerCase() !== 'id'
      ) {
        let temp = property.toLowerCase().replace('id', '');

        temp = this.capitalizeFirstLetter(temp);

        const relatedModelKey = temp;
        if (!this.allRelatedModels[relatedModelKey]) {
          const relatedModel = this.allModels.find(
            (m: any) => m.key === relatedModelKey
          );
          this.allRelatedModels[relatedModelKey] = {
            properties: relatedModel.value.properties || {},
            required: relatedModel.value.required || [],
            selectedFields: {},
          };
        }
        relatedModels.push({ [relatedModelKey]: property });
      }

      if (!this.allRelatedModels[modelKey]) {
        this.allRelatedModels[modelKey] = {
          properties: properties,
          required: modelSchema.required || [],
          selectedFields: {},
        };
      }
      this.allRelatedModels[modelKey].selectedFields[property] = isRequired;
    }

    this.allRelatedModels[modelKey] = {
      properties: modelSchema.properties || {},
      required: modelSchema.required || [],
      relatedModels: relatedModels,
      selectedFields: this.allRelatedModels[modelKey].selectedFields || {},
    };
  }

  showAvailablePaths() {
    this.pathsAvailable = true;
    console.log('Updated allRelatedModels with paths:', this.allRelatedModels);
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  generateUMLFromOpenAPI(openAPISpec: any) {
    const nodes: any[] = [];
    this.umlText = '@startuml\n';
    //let cypherStatements = [];

    let rel = '';
    this.openapiService.getProjects().subscribe(
      (data) => {
        const schemas = data.components.schemas;

        for (const schemaName in openAPISpec) {
          this.umlText += `class "${schemaName}"  {\n`;
          let properties = schemas[schemaName]?.properties;
          const requiredProperties = schemas[schemaName]?.required || [];

          nodes.push({ id: schemaName, label: schemaName, properties });

          // cypherStatements.push(
          //   `MERGE (${schemaName}:${schemaName} {id: "${schemaName}", label: "${schemaName}"})`
          // );

          if (!properties && schemas[schemaName].allOf) {
            for (const item of schemas[schemaName].allOf) {
              properties = item.properties;
            }
          }

          for (const property in properties) {
            let temp = property.toLowerCase().replace('id', '');

            temp = this.capitalizeFirstLetter(temp);

            if (
              schemas[temp] &&
              property.toLowerCase().includes('id') &&
              property.toLowerCase() !== 'id' &&
              !this.checkedModels[temp]
            ) {
              openAPISpec[temp] = true;
              this.addRelatedModels(temp, schemas[temp]);
            }

            const isRequired = requiredProperties.includes(property);
            this.umlText += `  +${property}: ${properties[property].type}${
              isRequired ? ' (required)' : ''
            }\n`;
          }
          this.umlText += '}\n';
        }

        this.umlText += this.findRelatedPaths(data.paths, openAPISpec, schemas);
        this.umlText += this.findModelRelationships(schemas, openAPISpec);

        this.umlText += `@enduml`;

        console.log(this.umlText);

        const encodedUml = plantumlEncoder.encode(this.umlText);
        const umlDiagramUrl = `http://www.plantuml.com/plantuml/svg/${encodedUml}`;
        this.umlUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(umlDiagramUrl);
        console.log(umlDiagramUrl);

        //this.generateNeo4jGraph(nodes, relationships);

        // this.cypherCode = cypherStatements.join('\n');
      },
      (error) => {
        console.error('Error fetching projects:', error);
      }
    );
  }

  private getRefType(ref: string | undefined): string {
    return ref?.split('/').pop() ?? '';
  }

  private findRelatedPaths(
    paths: any,
    selectedSchemas: any,
    schemas: any
  ): string {
    let relatedPaths = '';
    const existingArrows = new Set<string>();

    for (const schemaName in selectedSchemas) {
      for (const path in paths) {
        const methods = paths[path];
        let pathClassContent = `class "${path}" #LightBlue {\n`;
        let pathHasMethods = false;
        const relatedModels = new Set<string>();

        const capitalizedPart = this.capitalizeFirstLetter(path.split('/')[1]);
        const modelExists = selectedSchemas.hasOwnProperty(capitalizedPart);

        for (const method in methods) {
          const methodSpec = methods[method];
          if (methodSpec.responses) {
            for (const responseCode in methodSpec.responses) {
              const response = methodSpec.responses[responseCode];
              let refType: string | undefined = '';

              if (response.content) {
                if (response.content['application/json']) {
                  refType = this.getRefType(
                    response.content['application/json'].schema?.$ref
                  );
                  if (
                    !refType &&
                    response.content['application/json'].schema?.items
                  ) {
                    refType = this.getRefType(
                      response.content['application/json'].schema?.items.$ref
                    );
                  }
                } else if (response.content['application/hal+json']) {
                  refType = this.getRefType(
                    response.content['application/hal+json'].schema?.$ref
                  );
                  if (
                    !refType &&
                    response.content['application/hal+json'].schema?.items
                  ) {
                    refType = this.getRefType(
                      response.content['application/hal+json'].schema?.items
                        .$ref
                    );
                  }
                } else if (response.content['application/xml']) {
                  refType = this.getRefType(
                    response.content['application/xml'].schema?.$ref
                  );
                  if (
                    !refType &&
                    response.content['application/xml'].schema?.items
                  ) {
                    refType = this.getRefType(
                      response.content['application/xml'].schema?.items.$ref
                    );
                  }
                }

                if (refType) {
                  if (
                    refType === schemaName &&
                    capitalizedPart === schemaName
                  ) {
                    pathClassContent += `  +${method.toUpperCase()}()\n`;
                    pathHasMethods = true;
                    const arrow = `"${path}" <-- "${schemaName}" : uses`;

                    if (!existingArrows.has(arrow)) {
                      if (!this.allRelatedModels[schemaName].paths) {
                        this.allRelatedModels[schemaName].paths = [];
                      }
                      this.allRelatedModels[schemaName].paths.push({
                        method: methods,
                        path: path,
                      });
                      relatedPaths += `${arrow}\n`;
                      existingArrows.add(arrow);
                    }
                    relatedModels.add(refType);
                  } else if (
                    refType !== schemaName &&
                    capitalizedPart === schemaName
                  ) {
                    pathClassContent += `  +${method.toUpperCase()}()\n`;
                    pathHasMethods = true;

                    const arrow = `"${path}" <-- "${schemaName}" : uses`;

                    if (!existingArrows.has(arrow)) {
                      if (!this.allRelatedModels[schemaName].paths) {
                        this.allRelatedModels[schemaName].paths = [];
                      }
                      this.allRelatedModels[schemaName].paths.push({
                        method: methods,
                        path: path,
                      });
                      relatedPaths += `${arrow}\n`;
                      existingArrows.add(arrow);
                    }
                    relatedModels.add(refType);
                  } else if (
                    refType === schemaName &&
                    capitalizedPart !== schemaName
                  ) {
                    const arrow = `"${path}" <-- "${schemaName}" : uses`;

                    pathClassContent += `  +${method.toUpperCase()}()\n`;
                    pathHasMethods = true;
                    if (!existingArrows.has(arrow)) {
                      if (!this.allRelatedModels[schemaName].paths) {
                        this.allRelatedModels[schemaName].paths = [];
                      }
                      this.allRelatedModels[schemaName].paths.push({
                        method: methods,
                        path: path,
                      });
                      relatedPaths += `${arrow}\n`;
                      existingArrows.add(arrow);
                    }
                    relatedModels.add(refType);
                  }
                }
              }
            }
          }
        }

        if (modelExists) {
          let arrow = `"${path}" <-- "${capitalizedPart}" : uses`;

          if (!existingArrows.has(arrow)) {
            relatedPaths += `${arrow}\n`;
            existingArrows.add(arrow);
            if (!this.allRelatedModels[capitalizedPart].paths) {
              this.allRelatedModels[capitalizedPart].paths = [];
            }
            this.allRelatedModels[capitalizedPart].paths.push({
              method: methods,
              path: path,
            });
          }

          relatedModels.add(capitalizedPart);
        }

        if (pathHasMethods) {
          pathClassContent += '}\n';
          relatedPaths += pathClassContent;
        }

        if (relatedModels.size > 1) {
          const modelsArray = Array.from(relatedModels);

          for (let i = 0; i < modelsArray.length; i++) {
            for (let j = i + 1; j < modelsArray.length; j++) {
              for (const checkselschema in selectedSchemas) {
                if (modelsArray[i] === checkselschema) {
                  this.issecl = true;
                }
              }
              if (this.issecl == false) {
                relatedPaths += `class "${modelsArray[i]}" #Red/Yellow  {\n`;

                const model = this.allModels.find(
                  (m: any) => m.key === modelsArray[i]
                );
                this.addRelatedModels(model.key, model.value);
                // this.generateNeo4jGraph(nodes, relationships);
                const properties = schemas[modelsArray[i]]?.properties || {};

                for (const property in properties) {
                  relatedPaths += `  +${property}: ${properties[property].type}\n`;
                }
                relatedPaths += '}\n';
                let arrow = `"${path}" <-- "${modelsArray[i]}" : uses`;

                if (!existingArrows.has(arrow)) {
                  if (!this.allRelatedModels[modelsArray[i]].paths) {
                    this.allRelatedModels[modelsArray[i]].paths = [];
                  }
                  this.allRelatedModels[modelsArray[i]].paths.push({
                    method: methods,
                    path: path,
                  });
                  relatedPaths += `${arrow}\n`;
                  existingArrows.add(arrow);
                }
              }
              relatedPaths += `class "${modelsArray[i]}" #Red/Yellow {\n`;
              relatedPaths += '}\n';
              const arrow = `"${modelsArray[i]}" <-- "${modelsArray[j]}" : required`;

              if (!existingArrows.has(arrow)) {
                relatedPaths += `${arrow}\n`;

                existingArrows.add(arrow);
              }
            }
          }
        }
      }
    }

    return relatedPaths;
  }

  private findModelRelationships(schemas: any, selectedSchemas: any): string {
    let relationships = '';

    for (const schemaName in selectedSchemas) {
      let schema = schemas[schemaName];
      let properties = schema.properties || {};

      if (schema.allOf) {
        console.log('alloff');
        relationships += this.handleComposition(
          schema,
          'allOf',
          schemas,
          schemaName
        );
      }

      if (schema.oneOf || schema.anyOf) {
        console.log('oneanyoff');
        relationships += this.handleComposition(
          schema,
          schema.oneOf ? 'oneOf' : 'anyOf',
          schemas,
          schemaName
        );
      }

      relationships += this.handleProperties(properties, schemas, schemaName);
    }

    return relationships;
  }

  private handleComposition(
    schema: any,
    compositionType: string,
    schemas: any,
    schemaName: string
  ): string {
    let relationships = '';

    schema[compositionType].forEach((composedSchema: any) => {
      const refType = this.getRefType(composedSchema.$ref);
      if (refType && schemas[refType]) {
        relationships += `class "${refType}" #LightGreen {\n`;
        const refProperties = schemas[refType]?.properties || {};
        const requiredProperties = schemas[refType]?.required || [];

        for (const refProp in refProperties) {
          const isRequired = requiredProperties.includes(refProp);
          relationships += `  +${refProp}: ${refProperties[refProp].type}${
            isRequired ? ' (required)' : ''
          }\n`;
        }
        relationships += `}\n`;
        relationships += `${schemaName} --|> ${refType} : ${compositionType}\n`;
      }
    });
    return relationships;
  }

  private handleProperties(
    properties: any,
    schemas: any,
    schemaName: string
  ): string {
    let relationships = '';
    const seenProperties = new Set<string>();
    const requiredProperties = schemas[schemaName]?.required || [];

    for (const property in properties) {
      if (seenProperties.has(property)) continue;
      let temp = property.toLowerCase().replace('id', '');

      temp = this.capitalizeFirstLetter(temp);
      let refType: string | undefined;
      seenProperties.add(property);

      if (properties[property].$ref) {
        refType = this.getRefType(properties[property].$ref);
        if (refType && schemas[refType]) {
          relationships += this.addPropertyRelationship(
            schemaName,
            refType,
            schemas,
            false,
            requiredProperties.includes(property)
          );
        }
      } else if (
        properties[property].items &&
        properties[property].items.$ref
      ) {
        refType = this.getRefType(properties[property].items.$ref);
        if (refType && schemas[refType]) {
          relationships += this.addPropertyRelationship(
            schemaName,
            refType,
            schemas,
            true,
            requiredProperties.includes(property)
          );
        }
      } else if (schemas[temp]) {
        relationships += this.addPropertyRelationship(
          schemaName,
          temp,
          schemas
        );
      }
    }
    return relationships;
  }

  private addPropertyRelationship(
    schemaName: string,
    refType: string,
    schemas: any,
    isArray: boolean = false,
    isRequired: boolean = false
  ): string {
    let relationships = '';

    this.issecl2 = false;
    relationships += `class "${refType}" #LightGreen {\n`;

    for (const sch in this.checkedModels) {
      if (refType == sch) {
        this.issecl2 = true;
      }
    }

    if (this.issecl2 == false) {
      const refProperties = schemas[refType]?.properties || {};
      const requiredProperties = schemas[refType]?.required || [];

      for (const refProp in refProperties) {
        const isPropRequired = requiredProperties.includes(refProp);
        relationships += `  +${refProp}: ${refProperties[refProp].type}${
          isPropRequired ? ' (required)' : ''
        }\n`;
      }
    }
    relationships += `}\n`;
    relationships += `${schemaName} --> ${refType} : ${
      isArray ? 'has many' : 'has'
    }${isRequired ? ' (required)' : ''}\n`;

    return relationships;
  }

  showRelatedPaths() {
    let relatedPaths = '';
    const selectedModels = this.getSelectedModelsAndProperties();

    this.openapiService.getProjects().subscribe(
      (data) => {
        const paths = data.paths;
        const matchingPaths = [];
        for (const path in paths) {
          const pathMethods = paths[path];
          let pathHasMatch = false;
          let pathDetails = `Path: ${path}\nMethods:\n`;

          for (const method in pathMethods) {
            const methodDetails = pathMethods[method];
            const methodResponses = methodDetails.responses || {};

            for (const responseCode in methodResponses) {
              const response = methodResponses[responseCode];
              const responseSchemaRef =
                response?.content?.['application/json']?.schema?.$ref;

              if (responseSchemaRef) {
                const refModel = this.getRefType(responseSchemaRef);
                if (selectedModels.includes(refModel)) {
                  pathHasMatch = true;
                  pathDetails += `  - ${method.toUpperCase()} (related to ${refModel})\n`;
                }
              }
            }
          }

          if (pathHasMatch) {
            matchingPaths.push(pathDetails);
          }
        }

        relatedPaths = matchingPaths.join('\n');
        alert(relatedPaths);
      },
      (error) => {
        console.error('Error fetching paths:', error);
      }
    );
  }

  getSelectedModelsAndProperties(): string[] {
    const selectedModels = [];

    for (const modelKey in this.allRelatedModels) {
      const selectedFields = this.allRelatedModels[modelKey].selectedFields;

      if (Object.values(selectedFields).some((field) => field === true)) {
        selectedModels.push(modelKey);
      }
    }

    return selectedModels;
  }

  //-------------------------------------------------STEP 3-----------------------------------------------------------------------------

  isExecuteEnabled(modelKey: string, pathInfo: any, method: string): boolean {
    const selectedFields = this.allRelatedModels[modelKey]?.selectedFields;
    if (!selectedFields) {
      return false;
    }

    const isSelected = Object.values(selectedFields).some((field) => field);

    if (!isSelected) {
      return false;
    }

    const requestBody = pathInfo.method[method]?.requestBody;
    if (requestBody) {
      const jsonRef = requestBody.content?.['application/json']?.schema?.$ref;
      const xmlRef = requestBody.content?.['application/xml']?.schema?.$ref;
      const formUrlEncodedRef =
        requestBody.content?.['application/x-www-form-urlencoded']?.schema
          ?.$ref;

      const modelName =
        this.getRefType(jsonRef) ||
        this.getRefType(xmlRef) ||
        this.getRefType(formUrlEncodedRef);

      if (modelName === modelKey && isSelected) {
        return true;
      }
    }

    const parameters = pathInfo.method[method]?.parameters || [];

    for (const param of parameters) {
      let temp = param.name.toLowerCase();
      const temp2 = temp;

      temp = temp.replace('id', '');

      temp = this.capitalizeFirstLetter(temp);

      if (temp === modelKey && temp2.includes('id') && temp2 !== 'id') {
        if (
          selectedFields['id'] &&
          (param.required ||
            param.schema?.default ||
            param.schema?.items?.type === 'string')
        ) {
          return true;
        }
      }
      if (
        selectedFields[param.name] &&
        (param.required ||
          param.schema?.default ||
          param.schema?.items?.type === 'string')
      ) {
        return true;
      }
    }

    return false;
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async openParameterPopup(
    modelKey: string,
    path: string,
    method: string,
    parameters: any
  ) {
    // Ensure that parameters is an array, or use an empty array if undefined
    const inputs = (Array.isArray(parameters) ? parameters : []).map(
      (param: { name: string | number; required: any }) => ({
        name: param.name.toString(), // Ensure name is a string
        type: 'text' as const, // Correct typing for 'text'
        placeholder: `${param.name} (${
          param.required ? 'required' : 'optional'
        })`,
        value: this.params[param.name] || '', // Existing value if available
      })
    );

    // Create the alert dialog
    const alert = await this.alertController.create({
      header: `Enter parameters for ${method.toUpperCase()} ${path}`,
      inputs,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Make Request',
          handler: (data) => {
            this.params = data; // Store input parameters
            const resolvedPath = this.resolvePathParams(path, data); // Replace path params
            this.executeApiRequest(modelKey, resolvedPath, method, data);
          },
        },
      ],
    });

    await alert.present();
  }

  resolvePathParams(path: string, params: any): string {
    return path.replace(/{(\w+)}/g, (_, paramName) => {
      return params[paramName] || `{${paramName}}`; // Replace with actual input or keep the placeholder
    });
  }

  // Method to execute the API request and generate Neo4j Cypher code based on Customized Output
  executeApiRequest(
    modelKey: string,
    path: string,
    method: string,
    params: any
  ) {
    this.executedModel = modelKey; // Store the model key when the Execute button is pressed

    this.openapiService.makeApiRequest(path, method, params, {}).subscribe(
      (response) => {
        console.log('API Response:', response);
        this.showApiResponse(response); // Show response to the user
        // const cypherCodesss = this.generateCypherFromAPIResponse(response);
        // console.log('okoko');
        // console.log(cypherCodesss);
        this.customizedOutput = this.getCustomizedOutput(response); // Generate customized output
        this.generateCypherCodeFromCustomizedOutput(); // Generate Neo4j Cypher code
      },
      (error) => {
        console.error('API Error:', error);
        this.showApiResponse(error.error); // Show error to the user
      }
    );
  }

  // Method to show the API response in an alert
  async showApiResponse(response: any) {
    const alert = await this.alertController.create({
      header: 'API Response',
      message: `${JSON.stringify(response, null, 2)}`,
      buttons: ['OK'],
    });

    await alert.present();
  }

  private extractFieldsFromResponse(response: any, selectedFields: any): any {
    const output: any = {};

    Object.keys(selectedFields).forEach((field) => {
      if (selectedFields[field] && response[field] !== undefined) {
        if (Array.isArray(response[field])) {
          output[field] = response[field].map((item: any) => {
            if (typeof item === 'object' && item !== null) {
              return this.extractFieldsFromResponse(item, selectedFields);
            }
            return item;
          });
        } else if (
          typeof response[field] === 'object' &&
          response[field] !== null
        ) {
          output[field] = this.extractFieldsFromResponse(
            response[field],
            selectedFields
          );
        } else {
          // If it's a primitive value, just return it
          output[field] = response[field];
        }
      }
    });

    return output;
  }

  getCustomizedOutput(response: any): any {
    const parseObject = (obj: any): any => {
      const result: any = {};

      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          // Check if the array contains objects or primitive values
          result[key] = obj[key].map((item: any) =>
            typeof item === 'object' ? parseObject(item) : item
          );
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          result[key] = parseObject(obj[key]); // Nested object
        } else {
          result[key] = obj[key]; // Primitive value
        }
      }

      return result;
    };

    if (Array.isArray(response)) {
      return response.map((item: any) => parseObject(item));
    }

    return parseObject(response);
  }

  //-------------------------------------------------STEP 4-----------------------------------------------------------------------------

  generateCypherCodeFromCustomizedOutput() {
    let cypherStatements: string[] = [];
    const createdNodes = new Set(); // Track already created nodes

    const processObject = (customizedObject: any, index: number) => {
      console.log(this.executedModel);
      console.log(customizedObject);
      console.log(this.allRelatedModels[this.executedModel]?.relatedModels);

      // Step 1: Create the main node for the executedModel (e.g., Pet)
      const mainNodeIdentifier = `${this.executedModel}_${customizedObject.id}`;
      let mainNodeCypher = `MERGE (${mainNodeIdentifier}:${this.executedModel} {`;

      // Collect properties for the main node that do not match related models
      const nonRelatedProperties: string[] = [];
      let relationshipCounter = 0; // To ensure unique variable names for related models

      // Step 2: Iterate through the customized output and handle properties
      Object.entries(customizedObject).forEach(([key, value]) => {
        let isRelatedModel = false;

        // Step 3: Loop through the relatedModels
        this.allRelatedModels[this.executedModel]?.relatedModels.forEach(
          (model: {
            [x: string]: any;
            hasOwnProperty: (arg0: string) => any;
          }) => {
            for (const relatedModelName in model) {
              if (model.hasOwnProperty(relatedModelName)) {
                let relatedProperty = model[relatedModelName];

                // Check if the current property key (e.g., category or tags) matches the related property
                if (key === relatedProperty) {
                  if (relatedProperty.toLowerCase().includes('id')) {
                    relatedProperty = 'id';
                    const relatedNodeIdentifier = `${relatedModelName}_${value}`;
                    if (!createdNodes.has(relatedNodeIdentifier)) {
                      const relatedNodeCypher = `MERGE (${relatedNodeIdentifier}:${relatedModelName} {${relatedProperty}: ${value} })`;
                      cypherStatements.push(relatedNodeCypher);
                      createdNodes.add(relatedNodeIdentifier); // Track the created node
                    }

                    const relationshipCypher = `MERGE (${mainNodeIdentifier})-[:RELATED_TO]->(${relatedNodeIdentifier})`;
                    cypherStatements.push(relationshipCypher);
                  }

                  // Handle array of objects (e.g., tags)
                  if (Array.isArray(value)) {
                    value.forEach((item, arrayIndex) => {
                      if (typeof item === 'object') {
                        const relatedNodeIdentifier = `${relatedModelName}_${item.id}`;
                        if (!createdNodes.has(relatedNodeIdentifier)) {
                          const tagCypher = this.createRelatedModelCypher(
                            relatedModelName,
                            item,
                            arrayIndex
                          );
                          cypherStatements.push(tagCypher);
                          createdNodes.add(relatedNodeIdentifier); // Track the created node
                        }

                        const relationshipCypher = `MERGE (${mainNodeIdentifier})-[:RELATED_TO]->(${relatedNodeIdentifier})`;
                        cypherStatements.push(relationshipCypher);
                      } else {
                        // Handle array of primitives like photoUrls
                        nonRelatedProperties.push(
                          `${key}: [${value.map((v) => `"${v}"`).join(', ')}]`
                        );
                      }
                    });
                  } else if (typeof value === 'object') {
                    const relatedNodeIdentifier = `${relatedModelName}_${
                      (value as { id: number }).id
                    }`;
                    if (!createdNodes.has(relatedNodeIdentifier)) {
                      const categoryCypher = this.createRelatedModelCypher(
                        relatedModelName,
                        value,
                        relationshipCounter
                      );
                      cypherStatements.push(categoryCypher);
                      createdNodes.add(relatedNodeIdentifier); // Track the created node
                    }

                    const relationshipCypher = `MERGE (${mainNodeIdentifier})-[:RELATED_TO]->(${relatedNodeIdentifier})`;
                    cypherStatements.push(relationshipCypher);

                    relationshipCounter++; // Increment for each unique relationship
                  }
                  isRelatedModel = true;
                }
              }
            }
          }
        );
        // If the property doesn't match any related model, add it to the main node
        if (!isRelatedModel) {
          if (typeof value === 'string') {
            nonRelatedProperties.push(`${key}: "${value}"`);
          } else if (Array.isArray(value)) {
            // Handle arrays of primitives
            nonRelatedProperties.push(
              `${key}: [${value.map((v) => `"${v}"`).join(', ')}]`
            );
          } else {
            nonRelatedProperties.push(`${key}: ${value}`);
          }
        }
      });

      // Step 6: Add the non-related properties to the main node
      mainNodeCypher += nonRelatedProperties.join(', ') + ' })';
      cypherStatements.unshift(mainNodeCypher); // Add the main node at the beginning
    };

    // Handle both single and multiple objects in customizedOutput
    if (Array.isArray(this.customizedOutput)) {
      this.customizedOutput.forEach((customizedObject: any, index: number) => {
        processObject(customizedObject, index);
      });
    } else {
      processObject(this.customizedOutput, 0);
    }

    // Final Cypher Code
    this.cypherCode = cypherStatements.join('\n');
    console.log('Generated Cypher Code:', this.cypherCode);
  }

  // Helper method to create Cypher for related model nodes
  createRelatedModelCypher(
    relatedModelName: string,
    relatedObject: any,
    index: number
  ): string {
    console.log('----------------ffff');
    console.log(relatedModelName);
    console.log(relatedObject);
    const props = Object.entries(relatedObject)
      .map(([key, value]) => {
        return typeof value === 'string'
          ? `${key}: "${value}"`
          : `${key}: ${value}`;
      })
      .join(', ');

    // Use the index to ensure unique variable names for each related node
    return `MERGE (${relatedModelName}_${relatedObject.id}:${relatedModelName} {${props}})`;
  }

  executeQuery() {
    if (this.cypherCode) {
      this.neo4jService
        .runCypherQuery(this.cypherCode)
        .then((result) => {
          // this.queryResult = result;
          // this.querylength = this.queryResult.length;
          // this.graphData = this.parseResultForGraph(result);
          console.warn('Done');
        })
        .catch((error) => {
          console.error('Error executing query:', error);
        });
    } else {
      console.warn('Query is empty');
    }
  }
}
//import Neo4jd3 from 'neo4jd3';
//import * as d3 from 'd3';
//import { saveAs } from 'file-saver';

// downloadJson() {
//   const blob = new Blob([JSON.stringify(this.allModels)], {
//     type: 'application/json',
//   });
//   saveAs(blob, 'project.json');
// }

// onNextStep() {
//   let selectedModels: any = {};

//   // Loop through all related models and check if any property is selected
//   for (const modelKey in this.allRelatedModels) {
//     const selectedFields = this.allRelatedModels[modelKey].selectedFields;
//     if (Object.values(selectedFields).some((isSelected) => isSelected)) {
//       selectedModels[modelKey] = true;
//     }
//   }

//   if (Object.keys(selectedModels).length > 0) {
//     this.displayRelatedPaths(selectedModels);
//   } else {
//     console.log('Please select at least one property from a model.');
//   }
// }

// displayRelatedPaths(selectedModels: any) {
//   this.openapiService.getProjects().subscribe(
//     (data) => {
//       const paths = data.paths;
//       const schemas = data.components.schemas;

//       // Filter paths based on selected models and required parameters
//       let relatedPaths = this.findRelatedPaths(
//         paths,
//         selectedModels,
//         schemas
//       );

//       console.log('Related Paths: ', relatedPaths);

//       // Optionally, you can display related paths in a more user-friendly way
//       // For example, update a variable to show it in the template
//     },
//     (error) => {
//       console.error('Error fetching paths:', error);
//     }
//   );
// }

// Check if Execute button should be enabled for the given model and method
// Fetch OpenAPI paths (assuming this is stored in data.paths)
// this.openapiService.getProjects().subscribe(
//   (data) => {
//     const paths = data.paths;

//     // Iterate over all the paths
//     for (const path in paths) {
//       const methods = paths[path];

//       // Check if this path is related to any of the models in allRelatedModels
//       for (const method in methods) {
//         const methodSpec = methods[method];

//         if (methodSpec.responses) {
//           for (const responseCode in methodSpec.responses) {
//             const response = methodSpec.responses[responseCode];
//             let refType = this.getRefType(
//               response.content?.['application/json']?.schema?.$ref
//             );

//             // If the response refType exists in allRelatedModels, add the method and path to the model
//             if (refType && this.allRelatedModels[refType]) {
//               if (!this.allRelatedModels[refType].paths) {
//                 this.allRelatedModels[refType].paths = [];
//               }

//               // Add the method and path to the related model's paths
//               this.allRelatedModels[refType].paths.push({
//                 method: method.toUpperCase(),
//                 path: path,
//                 description:
//                   methodSpec.summary || 'No description available',
//               });
//             }
//           }
//         }
//       }
//     }

//     // Now, update available paths if any
//     this.pathsAvailable = this.availablePaths.length > 0;

//     // Display updated allRelatedModels in the console for debugging
//     console.log(
//       'Updated allRelatedModels with paths:',
//       this.allRelatedModels
//     );
//   },
//   (error) => {
//     console.error('Error fetching paths:', error);
//   }
// );

// Add a function to filter and show paths based on selected properties
// showPaths() {
//   this.openapiService.getProjects().subscribe(
//     (data) => {
//       const paths = data.paths;
//       const relatedPaths = [];

//       for (const path in paths) {
//         const methods = paths[path];
//         const relatedModels = new Set<string>();

//         // Check if the path references any of the selected models
//         for (const method in methods) {
//           const responses = methods[method].responses || {};
//           for (const responseCode in responses) {
//             const content = responses[responseCode]?.content || {};
//             const jsonSchema = content['application/json']?.schema || {};
//             const refType = this.getRefType(jsonSchema.$ref);

//             if (refType && this.checkedModels[refType]) {
//               relatedModels.add(refType);
//             }
//           }
//         }

//         if (relatedModels.size) {
//           relatedPaths.push({
//             path,
//             description:
//               methods.get?.description || methods.post?.description || '',
//             methods: Object.keys(methods),
//           });
//         }
//       }

//       console.log(relatedPaths);
//       this.displayRelatedPaths(relatedPaths);
//     },
//     (error) => {
//       console.error('Error fetching paths:', error);
//     }
//   );
// }

// private convertToNeo4jData(nodes: any[], relationships: any[]) {
//   return {
//     results: [
//       {
//         columns: ['user', 'entity'],
//         data: [
//           {
//             graph: {
//               nodes: nodes.map((node) => ({
//                 id: node.id,
//                 labels: [node.label],
//                 properties: {},
//               })),
//               relationships: relationships.map((rel, index) => ({
//                 id: index,
//                 type: rel.label,
//                 startNode: nodes.find((n) => n.id === rel.from).id,
//                 endNode: nodes.find((n) => n.id === rel.to).id,
//                 properties: {},
//               })),
//             },
//           },
//         ],
//       },
//     ],
//     zoomFit: true,
//   };
// }

//const neo4jd3 = new Neo4jd3('#neo4jd3', {
//   icons: {
//     Project: 'file',
//     Field: 'tag',
//   },
//   images: {},
//   minCollision: 60,
//   neo4jData: this.convertToNeo4jData(nodes, relationships),
//   nodeRadius: 25,
//   onNodeClick: (node: any) => {
//     console.log(node);
//   },
//   zoomFit: true,
// });

//projectDetails: any;
//filteredPaths: any[] = [];
//  selectedFields: any;
//  reqText: boolean = false;
//  selectedPaths: string[] = []; // Array to hold selected paths

// generateNeo4jGraph(
//   nodes: any[],
//   relationships: { from: any; to: any; label: any }[]
// ) {
//   (window as any).d3 = d3;

//   //
// }
