import { encodeAbiParameters, parseAbiParameters } from "viem";

export type StorageRef = [string, string, string];

export function encodeLLM30FieldPayload(params: {
  provider: string;
  model: string;
  prompt: string;
  tokenAddress: `0x${string}`;
  encryptedSecrets: string;
}) {
  const convoHistory: StorageRef = [
    "gcs",
    `shrine/sessions/${params.tokenAddress.toLowerCase()}.jsonl`,
    "GCS_CREDS",
  ];

  // 30 fields total with convoHistory as field 29.
  return encodeAbiParameters(
    parseAbiParameters(
      "string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,(string,string,string)"
    ),
    [
      params.provider, // 0
      params.model, // 1
      params.prompt, // 2
      "json", // 3
      "", // 4
      "", // 5
      "", // 6
      "", // 7
      "", // 8
      "", // 9
      "", // 10
      "", // 11
      "", // 12
      "", // 13
      "", // 14
      "", // 15
      "", // 16
      "", // 17
      "", // 18
      "", // 19
      "", // 20
      "", // 21
      "", // 22
      "", // 23
      "", // 24
      "", // 25
      "", // 26
      params.encryptedSecrets, // 27
      "", // 28
      convoHistory, // 29 (REQUIRED; never empty)
    ]
  );
}

export const encodeHTTPRequest = (url: string, bearerSecretRef: string) => ({ url, bearerSecretRef });
