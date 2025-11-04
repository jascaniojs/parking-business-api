# Roadmap

## PB-05 - Spike Ticket: Historical Session Data

**As the Parking Business,** I want an **historic record of all completed, charged parking sessions**, so that I can validate hypotheses for new features and make **data-driven decisions** to improve service and profitability.

-----

### **Requirements**

* **Goal:** Implement a scalable endpoint to retrieve non-resident parking session history.
* **Endpoint:** `GET /parking-sessions/history`
* **Response Status:** `200 OK`
* **Response Body (Minimum Fields):**
  ```json
  [
    {
      "parkingSpaceId": number,
      "checkedInAt": Date,
      "checkedOutAt": Date,
      "sessionLength": string, // e.g., "02h 30m"
      "ratePerHour": number,
      "totalCharge": number
    },
    // ... more sessions
  ]
  ```
* **Evaluate if needed to implement filtering (by date range, `parkingSpaceId`) and pagination to ensure the endpoint is performant in the long term. 