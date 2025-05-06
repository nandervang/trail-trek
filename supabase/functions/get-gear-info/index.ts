// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    if (!body || !body.name || !body.category) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: name and category'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    const { name, category } = body;
    
    // Initialize the OpenAI client - use the simpler fetch-based approach
    const url = "https://api.openai.com/v1/chat/completions";
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    
    const promptData = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Provide detailed information about the following outdoor gear item in JSON format:
          Item: ${name}
          Category: ${category}
          
          Include:
          - description (max 100 characters, general overview)
          - category of item type
          - purpose (specific use cases and when to use)
          - weight_kg (typical weight in kilograms, numeric value only)
          - volume (if applicable, e.g. backpack capacity)
          - sizes (typical dimensions or available sizes)
          - image_url (a direct product image URL from the manufacturer's website or major outdoor retailers like REI, Backcountry, etc.)
          - suggested_category (suggest the best category from: Shelter, Sleep System, Clothing, Kitchen, Electronics, First Aid, Navigation, Tools)
          
          Format the response as valid JSON with these exact keys. For weight_kg, provide a numeric value only. For image_url, provide a direct link to a high-quality product image from the manufacturer or retailer website.
          
          Example format:
          {
            "description": "Lightweight backpacking tent for two people",
            "purpose": "Three-season shelter for backpacking trips",
            "weight_kg": 1.2,
            "volume": null,
            "sizes": "2-person",
            "image_url": "https://example.com/image.jpg",
            "suggested_category": "Shelter",
            "category": "shelter"
          }`
        }
      ]
    };
    
    try {
      // Make the API call using fetch
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(promptData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        
        // Check specifically for quota errors (code 429 or specific error messages)
        if (response.status === 429 || 
            (errorData.error?.message && 
             (errorData.error.message.includes("quota") || 
              errorData.error.message.includes("rate limit")))) {
          
          // Return a specific error for quota issues
          return new Response(JSON.stringify({
            error: "OpenAI quota exceeded",
            message: "The AI service is currently at capacity. Please try again later or contact support.",
            suggestion: "You can still enter the gear information manually."
          }), {
            status: 429, // Too Many Requests
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }
        
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const responseData = await response.json();
      const content = responseData.choices[0].message?.content;
      
      if (!content) {
        throw new Error('No response content from OpenAI');
      }
      
      // Parse the content safely - this is a common failure point
      let jsonResponse;
      try {
        // Try to extract JSON if it's surrounded by backticks or other text
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        content.match(/\{[\s\S]*\}/);
                        
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        jsonResponse = JSON.parse(jsonString.replace(/```json|```/g, '').trim());
      } catch (error) {
        console.error('Failed to parse OpenAI response:', content);
        throw new Error('Failed to parse AI response as JSON');
      }
      
      return new Response(JSON.stringify(jsonResponse), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } catch (openAIError) {
      // For any other OpenAI-related errors, generate mock data as fallback
      console.error('Using mock data due to OpenAI error:', openAIError);
      
      const mockResponse = generateMockResponse(name, category);
      return new Response(JSON.stringify({
        ...mockResponse,
        _source: "mock_data", // Indicate this is mock data
        _error: openAIError instanceof Error ? openAIError.message : 'Unknown OpenAI error'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Edge function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return new Response(JSON.stringify({
      error: errorMessage,
      details: 'Failed to process request'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

// Function to generate realistic mock data as fallback
function generateMockResponse(name: string, category: string) {
  // Convert inputs to lowercase for easier matching
  const nameLower = name.toLowerCase();
  const categoryLower = category.toLowerCase();
  
  // Define weight ranges based on category
  let weightRange = { min: 0.1, max: 2.0 };
  
  if (categoryLower.includes('shelter') || categoryLower.includes('tent')) {
    weightRange = { min: 0.8, max: 3.5 };
  } else if (categoryLower.includes('sleep') || categoryLower.includes('bag')) {
    weightRange = { min: 0.5, max: 1.5 };
  } else if (categoryLower.includes('cook') || categoryLower.includes('stove')) {
    weightRange = { min: 0.1, max: 0.5 };
  } else if (categoryLower.includes('cloth') || categoryLower.includes('wear')) {
    weightRange = { min: 0.1, max: 0.8 };
  } else if (categoryLower.includes('pack') || categoryLower.includes('bag')) {
    weightRange = { min: 0.5, max: 2.5 };
  }
  
  // Generate a random weight within the range
  const weight = parseFloat(
    (Math.random() * (weightRange.max - weightRange.min) + weightRange.min).toFixed(2)
  );
  
  // Determine volume (mostly for packs/bags)
  let volume = null;
  if (categoryLower.includes('pack') || categoryLower.includes('bag')) {
    const volumeSizes = ['20L', '30L', '40L', '50L', '60L', '70L'];
    volume = volumeSizes[Math.floor(Math.random() * volumeSizes.length)];
  }
  
  // Determine suggested category
  let suggestedCategory = 'Uncategorized';
  
  if (categoryLower.includes('tent') || categoryLower.includes('tarp') || 
      categoryLower.includes('bivy') || categoryLower.includes('shelter')) {
    suggestedCategory = 'Shelter';
  } else if (categoryLower.includes('sleep') || categoryLower.includes('bag') || 
             categoryLower.includes('quilt') || categoryLower.includes('pad')) {
    suggestedCategory = 'Sleep System';
  } else if (categoryLower.includes('cloth') || categoryLower.includes('jacket') || 
             categoryLower.includes('pant') || categoryLower.includes('shirt') || 
             categoryLower.includes('sock')) {
    suggestedCategory = 'Clothing';
  } else if (categoryLower.includes('stove') || categoryLower.includes('pot') || 
             categoryLower.includes('cook') || categoryLower.includes('food') || 
             categoryLower.includes('spoon') || categoryLower.includes('utensil')) {
    suggestedCategory = 'Kitchen';
  } else if (categoryLower.includes('electronic') || categoryLower.includes('battery') || 
             categoryLower.includes('charger') || categoryLower.includes('light') || 
             categoryLower.includes('headlamp')) {
    suggestedCategory = 'Electronics';
  } else if (categoryLower.includes('first aid') || categoryLower.includes('medical') || 
             categoryLower.includes('drug') || categoryLower.includes('medicine')) {
    suggestedCategory = 'First Aid';
  } else if (categoryLower.includes('compass') || categoryLower.includes('map') || 
             categoryLower.includes('gps')) {
    suggestedCategory = 'Navigation';
  } else if (categoryLower.includes('knife') || categoryLower.includes('tool') || 
             categoryLower.includes('multi-tool') || categoryLower.includes('repair')) {
    suggestedCategory = 'Tools';
  } else if (categoryLower.includes('pack') || categoryLower.includes('bag') || 
             categoryLower.includes('stuff sack') || categoryLower.includes('dry bag')) {
    suggestedCategory = 'Storage';
  }
  
  // Generate a concise description and purpose
  const description = `${name} - a ${suggestedCategory.toLowerCase()} item for outdoor activities.`;
  const purpose = `The ${name} is designed for use in outdoor adventures, particularly for ${categoryLower} applications.`;
  
  return {
    description: description,
    purpose: purpose,
    weight_kg: weight,
    volume: volume,
    sizes: 'Standard',
    image_url: null,
    suggested_category: suggestedCategory,
    category: suggestedCategory.toLowerCase()
  };
}