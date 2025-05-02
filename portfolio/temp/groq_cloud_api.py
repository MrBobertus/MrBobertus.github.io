import requests
import os
import sys

def callEndpoint(query):
    url = "https://api.groq.com/openai/v1/chat/completions"
    model = "gemma2-9b-it"
    api_key = os.environ.get("GROQ_API_KEY")

    if not api_key:
        print("Error: GROQ_API_KEY environment variable not set")
        return

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": [{"role": "user", "content": query}],
        "temperature": 0.8,
        "top_p": 1.0,
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            return response.json()
        else:
            print("Error connecting to API")
    except:
        print("Error connecting to API")

if __name__ == "__main__":
    while True:
        print("-" * 20)
        user_query = input("You: ")
        if user_query == "!quit":
            sys.exit(0)
        assistant_response = callEndpoint(user_query)
        assistant_response = assistant_response["choices"][0]["message"]["content"]
        print("-" * 20)
        print("Assistant: " + assistant_response)