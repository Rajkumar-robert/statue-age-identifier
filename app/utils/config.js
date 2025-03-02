import "server-only"
import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
    pinataJwt:`${process.env.NEXT_PUBLIC_PINATA_JWT}`,
    pinataApiKey: "harlequin-giant-panda-964.mypinata.cloud",
});

console.log("jwt", process.env.NEXT_PUBLIC_PINATA_JWT);