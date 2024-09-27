import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import neo4j from 'neo4j-driver';

@Injectable({
  providedIn: 'root',
})
export class Neo4jService {
  private driver;
  private previousState: any = null; // To store the previous state
  private pollingInterval = 5000; // Poll every 5 seconds

  constructor(private http: HttpClient) {
    this.driver = neo4j.driver(
      'bolt://localhost:7687',
      neo4j.auth.basic('neo4j', 'test1234')
    );
  }

  async runCypherQuery(query: string, params?: Record<string, any>) {
    const session = this.driver.session();
    try {
      const result = await session.run(query, params);
      return result.records;
    } finally {
      await session.close();
    }
  }

  // Poll the database and check for changes
  startTrackingChanges(query: string, params?: Record<string, any>) {
    // Use RxJS `interval` to poll the database at regular intervals
    interval(this.pollingInterval)
      .pipe(
        switchMap(() => this.runCypherQuery(query, params)) // Run the query at each interval
      )
      .subscribe((records) => {
        const currentState = this.extractDataFromRecords(records);

        // Compare the current state with the previous state
        if (
          this.previousState &&
          JSON.stringify(currentState) !== JSON.stringify(this.previousState)
        ) {
          console.log('Change Detected');
          console.log('Latest Nodes:', currentState); // Display the current state (latest nodes)
        }

        // Update previous state
        this.previousState = currentState;
      });
  }

  // Extract data from Neo4j records to create a comparable state
  private extractDataFromRecords(records: any[]): any {
    return records.map((record) => {
      return record.toObject();
    });
  }
}
