from groq import Groq
import os
import sys

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def callAPI(query):
    stream = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": query,
            }
        ],
        model="gemma2-9b-it",
        temperature=0.5,
        max_completion_tokens=1024,
        top_p=1,
        stop=None,
        stream=True,
    )
    print("-" * 20)
    for chunk in stream:
        if chunk.choices[0].delta.content == None:
         print("")
        else:
         print(chunk.choices[0].delta.content, end="")

if __name__ == "__main__":
    while True:
        print("-" * 20)
        user_input = input("You: ")
        if user_input == "!quit":
            sys.exit(0)
        callAPI(user_input)