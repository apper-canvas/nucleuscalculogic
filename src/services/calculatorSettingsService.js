/**
 * Service to handle calculator settings operations
 */

// Get calculator settings for the current user
export async function getCalculatorSettings(userId) {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "scientific_mode" } },
        { Field: { Name: "angle_mode" } },
        { Field: { Name: "dark_mode" } }
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

    const response = await apperClient.fetchRecords("calculator_settings", params);
    
    if (!response || !response.data || response.data.length === 0) {
      // Return default settings if not found
      return {
        scientificMode: false,
        angleMode: 'degrees',
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
      };
    }

    const settings = response.data[0];
    return {
      scientificMode: settings.scientific_mode,
      angleMode: settings.angle_mode,
      darkMode: settings.dark_mode
    };
  } catch (error) {
    console.error("Error fetching calculator settings:", error);
    // Return default settings on error
    return {
      scientificMode: false,
      angleMode: 'degrees',
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    };
  }
}

// Save or update calculator settings for the current user
export async function saveCalculatorSettings(userId, settings) {
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

    const response = await apperClient.fetchRecords("calculator_settings", params);
    
    if (!response || !response.data || response.data.length === 0) {
      // Create new record
      const createParams = {
        records: [
          {
            Name: `Calculator Settings for ${userId}`,
            scientific_mode: settings.scientificMode,
            angle_mode: settings.angleMode,
            dark_mode: settings.darkMode,
            user_id: userId
          }
        ]
      };

      await apperClient.createRecord("calculator_settings", createParams);
    } else {
      // Update existing record
      const updateParams = {
        records: [
          {
            Id: response.data[0].Id,
            scientific_mode: settings.scientificMode,
            angle_mode: settings.angleMode,
            dark_mode: settings.darkMode
          }
        ]
      };

      await apperClient.updateRecord("calculator_settings", updateParams);
    }
    
    return true;
  } catch (error) {
    console.error("Error saving calculator settings:", error);
    throw error;
  }
}