import subprocess
import json

# Define the model parameters


def get_response(prompt):
    model_params = f'{{"model": "deepseek-r1:1.5b", "prompt": "{prompt}", "stream": false}}'
    url = 'http://localhost:11434/api/generate'
    
    # Parse the command line arguments
    command = "curl -X POST -H \"Content-Type: application/json\" -d '{}' http://localhost:11434/api/generate".format(model_params)
    
    # Create a parametrized curl command and run it with subprocess
    result = subprocess.run(command, shell=True, capture_output=True, text=True)

    if not result.stdout:
        raise RuntimeError("CURL failed to generate response")

    # Parse the JSON data from the response
    json_data = json.loads(result.stdout.strip())

    return json_data['response']

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python aiLib.py <prompt>")
        exit(1)
   
    response = get_response(sys.argv[1])
    print(response)
