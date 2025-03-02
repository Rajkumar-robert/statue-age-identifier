import { NextResponse } from "next/server";
import { pinata } from "@/app/utils/config";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const result = await pinata.upload.file(file);
    const url = await pinata.gateways.createSignedURL({
      cid: result.cid,
      expires:50000
    })
  
    return NextResponse.json(url,{status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while uploading the file." },
      { status: 500 }
    );
  }
}
