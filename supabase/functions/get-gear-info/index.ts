import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { Configuration, OpenAIApi } from "npm:openai@4.11.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.name || !body.category) {
      throw new Error('Invalid request: name and category are required');
    }

    const { name, category } = body;

    const configuration = new Configuration({
      apiKey,
    });
    const openai = new OpenAIApi(configuration);

    const prompt = `Provide detailed information about the following outdoor gear item in JSON format:
    Item: ${name}
    Category: ${category}
    
    Include:
    - description (max 100 characters, general overview)
    - purpose (specific use cases and when to use)
    - weight_kg (typical weight in kilograms, numeric value only)
    - volume (if applicable, e.g. backpack capacity)
    - sizes (typical dimensions or available sizes)
    - image_url (a direct product image URL from the manufacturer's website or major outdoor retailers like REI, Backcountry, etc.)
    - suggested_category (suggest the best category from: Shelter, Sleep System, Clothing, Kitchen, Electronics, First Aid, Navigation, Tools)
    
    Format the response as valid JSON with these exact keys. For weight_kg, provide a numeric value only. For image_url, provide a direct link to a high-quality product image from the manufacturer or retailer website.`;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.data.choices[0].message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse AI response');
    }

    return new Response(
      JSON.stringify(jsonResponse),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Failed to process request'
      }), 
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
      }
    );
  }
});