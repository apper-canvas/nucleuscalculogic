/**
 * Service to handle calculation history operations
 */

// Get calculation history for the current user
export async function getCalculationHistory(userId, limit = 10) {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "calculation" } },
        { Field: { Name: "result" } },
        { Field: { Name: "timestamp" } }
      ],
      where: [
        {
          fieldName: "Owner",
          Operator: "ExactMatch",
          values: [userId]
        }
      ],
      orderBy: [
        {
          field: "timestamp",
          direction: "DESC"
        }
      ],
      pagingInfo: {
        limit: limit,
        offset: 0
      }
    };

    const response = await apperClient.fetchRecords("calculation_history1", params);
    
    if (!response || !response.data || response.data.length === 0) {
      return [];
    }

    return response.data.map(record => ({
      id: record.Id,
      calculation: record.calculation,
      result: record.result,
      timestamp: record.timestamp
    }));
  } catch (error) {
    console.error("Error fetching calculation history:", error);
    throw error;
  }
}

// Save a new calculation to history
export async function saveCalculation(userId, calculation, result) {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      records: [
        {
          Name: `Calculation ${new Date().toISOString()}`,
          calculation: calculation,
          result: String(result),
          timestamp: new Date().toISOString()
        }
      ]
    };

    const response = await apperClient.createRecord("calculation_history1", params);
    
    if (response && response.success && response.results && response.results.length > 0) {
      const successfulRecord = response.results.find(result => result.success);
      if (successfulRecord) {
        return {
          id: successfulRecord.data.Id,
          calculation: successfulRecord.data.calculation,
          result: successfulRecord.data.result,
          timestamp: successfulRecord.data.timestamp
        };
      }
    }
    
    throw new Error("Failed to save calculation");
  } catch (error) {
    console.error("Error saving calculation:", error);
    throw error;
  }
}

// Clear all calculation history for the current user
export async function clearCalculationHistory(userId) {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // First, get all record IDs for the user
    const params = {
      Fields: [
        { Field: { Name: "Id" } }
      ],
      where: [
        {
          fieldName: "Owner",
          Operator: "ExactMatch",
          values: [userId]
        }
      ]
    };

    const response = await apperClient.fetchRecords("calculation_history1", params);
    
    if (!response || !response.data || response.data.length === 0) {
      return true; // No records to delete
    }

    // Get all record IDs
    const recordIds = response.data.map(record => record.Id);

    // Delete all records
    const deleteParams = {
      RecordIds: recordIds
    };

    const deleteResponse = await apperClient.deleteRecord("calculation_history1", deleteParams);
    
    return deleteResponse && deleteResponse.success;
  } catch (error) {
    console.error("Error clearing calculation history:", error);
    throw error;
  }
}