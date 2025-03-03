import { NextResponse } from "next/server";
import { pinata } from "@/app/utils/config";

export const config = {
    api: {
        bodyParser: true,
    },
};

export async function POST(request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "No image CID provided" }, { status: 400 });
        }

        const url = await pinata.gateways.createSignedURL({
            cid: id,
            expires: 50000,
        });

        console.log(url)

        return NextResponse.json({ imgUrl: url, status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while fetching the image." },
            { status: 500 }
        );
    }
}