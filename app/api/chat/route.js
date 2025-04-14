import { NextResponse } from "next/server";
import axios from "axios";

// Handle POST requests
export async function POST(req) {
  try {
    const { query } = await req.json(); // Extract query from the request body

    // Call the FastAPI backend (replace with your own endpoint)
    const response = await axios.post('http://127.0.0.1:8001/query', {
      query: query,
    });

    // Return response back to the client
    return NextResponse.json({
      summary: response.data.summary,
      reranked_passages: response.data.reranked_passages,
    });
  } catch (error) {
    console.error("Error querying FastAPI:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
