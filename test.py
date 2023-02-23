import json
with open('human.json') as f:
	humanPosts = json.load(f)
with open('ai.json') as f:
	aiPosts = json.load(f)
uListAI = []
uListHum = []
def areDistinct(arr) :
 
    n = len(arr)
 
    # Put all array elements in a map
    s = set()
    for i in range(0, n):
        s.add(arr[i])
     
    # If all elements are distinct,
    # size of set should be same array.
    return (len(s) == len(arr))
with open('answers') as f:
	lines = f.readlines()
	for line in lines:
		if(line[:4] == " hid"):
			uListHum.append(int(line[6:]))
			#print(humanPosts[int(line[6:])])
		if(line[:4] == "aiid"):
			uListAI.append(int(line[6:]))
			#print(aiPosts[int(line[6:])])
print(areDistinct(uListHum))
print(areDistinct(uListAI))