#!/bin/bash

# Fix the type errors first
sed -i 's/(message\.content\[0\] as any)\.text/message.content[0].type === "text" ? message.content[0].text : ""/g' server/lib/anthropic.ts

# Add validation calls to each primary analysis function
sed -i '/return JSON\.parse(responseText);/,/return { error: "Failed to parse JSON", rawResponse: responseText };/{
  s/return JSON\.parse(responseText);/initialResult = JSON.parse(responseText);\
    } catch (parseError) {\
      const jsonMatch = responseText.match(\/```(?:json)?\\s*([\\s\\S]+?)\\s*```\/);\
      if (jsonMatch) {\
        initialResult = JSON.parse(jsonMatch[1]);\
      } else {\
        console.error("Failed to parse JSON response:", responseText);\
        return { error: "Failed to parse JSON", rawResponse: responseText };\
      }\
    }\
\
    \/\/ VALIDATION STEP: Push back on scores and clarify percentile meaning\
    return await validateScores(anthropic, prompt, responseText, initialResult);/
  
  s/return { error: "Failed to parse JSON", rawResponse: responseText };/\/\/ This line is now handled above/
}' server/lib/anthropic.ts

echo "Applied validation fixes to anthropic.ts"