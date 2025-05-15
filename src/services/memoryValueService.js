/**
 * Service to handle memory value operations
 */

// Get the memory value for the current user
export async function getMemoryValue(userId) {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "value" } }
      ],
      where: [
        {
          fieldName: "user_id",
          Operator: "ExactMatch",
          values: [userId]
        }
      ],
      pagingInfo: {
        limit: 1,
        offset: 0
      }
    };

    const response = await apperClient.fetchRecords("memory_value", params);
    
    if (!response || !response.data || response.data.length === 0) {
      return 0; // Default value if not found
    }

    return parseFloat(response.data[0].value);
  } catch (error) {
    console.error("Error fetching memory value:", error);
    return 0; // Return default on error
  }
}

// Save or update the memory value for the current user
export async function saveMemoryValue(userId, value) {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // First check if a record already exists
    const params = {
      Fields: [
        { Field: { Name: "Id" } }
      ],
      where: [
        {
          fieldName: "user_id",
          Operator: "ExactMatch",
          values: [userId]
        }
      ]
    };

    const response = await apperClient.fetchRecords("memory_value", params);
    
    if (!response || !response.data || response.data.length === 0) {
      // Create new record
      const createParams = {
        records: [
          {
            Name: `Memory Value for ${userId}`,
            value: value,
            user_id: userId
          }
        ]
      };

      await apperClient.createRecord("memory_value", createParams);
    } else {
      // Update existing record
      const updateParams = {
        records: [
          {
            Id: response.data[0].Id,
            value: value
          }
        ]
      };

      await apperClient.updateRecord("memory_value", updateParams);
    }
    
    return true;
  } catch (error) {
    console.error("Error saving memory value:", error);
    throw error;
  }
}