import os
import openai
from dotenv import load_dotenv
import json
import time
import random
load_dotenv()
with open('human.json') as f:
	humanPosts = json.load(f)
with open('ai.json') as f:
	aiPosts = json.load(f)       
genned = []

def generatePrompt(first,second):
    numExamples = 3
    prompt = "You will be shown "+str(numExamples)+" pairs of posts. For each pair, say which one is ai-generated: \n\n"

    hSeen = []
    aSeen = []
    
    for i in range(0,numExamples):
        firstIsAi = random.random() > 0.5
        prompt += "Pair "+str(i+1)+".\n\n"
        aiIndex = random.randint(0,len(aiPosts)-1)
        humanIndex = random.randint(0,len(humanPosts)-1)

        while(aiIndex in aSeen):
            aiIndex = random.randint(0,len(aiPosts)-1)
        while(humanIndex in hSeen):
            humanIndex = random.randint(0,len(humanPosts)-1)
        if(firstIsAi):
            


            prompt += "Post 1. \""+aiPosts[aiIndex][0]+"\"\n"
            prompt += "Post 2. \""+humanPosts[humanIndex]+"\"\n\n"
            prompt += "Post 1 is ai-generated\n\nCorrect.\n\n"

        else:
            prompt += "Post 1. \""+humanPosts[humanIndex]+"\"\n"
            prompt += "Post 2. \""+aiPosts[aiIndex][0]+"\"\n\n"
            prompt += "Post 2 is ai-generated\n\nCorrect.\n\n"
        hSeen.append(humanIndex)
        aSeen.append(aiIndex)
    #prompt += "Good, Now I will give you one more pair, and you should say which one is ai generated, as well as why you think that one is ai-generated. \n\n"
    prompt += "Pair "+str(numExamples+1)+".\n\n"
    prompt += "Post 1. \""+first+"\"\n"
    prompt += "Post 2. \""+second+"\"\n\n"
    return prompt

try :
    outfile = "diff2.json"
    # Load your API key from an environment variable or secret management service
    openai.api_key = os.getenv("OPENAI_API_KEY")
    for j in range(100):

        humanPost = humanPosts[random.randint(0,len(humanPosts)-1)]
        aiPost = aiPosts[random.randint(0,len(aiPosts)-1)][0]
        prompt = generatePrompt(humanPost,aiPost)
        response = openai.Completion.create(model="text-davinci-003", prompt=prompt, temperature=0, max_tokens=20)
        print(response)
        genned.append([humanPost,aiPost,response.choices[0].text])
        time.sleep(2)
        
    print("Done")
finally:
     with open(outfile,'w') as f:
            f.write(json.dumps(genned))
with open(outfile,'w') as f:
            f.write(json.dumps(genned))
right = 0
wrong = 0

for item in genned:
    if("2" in item[2]):
         right+= 1
    else:
         wrong += 1
print(right)
print(wrong)
print(right/(right+wrong))