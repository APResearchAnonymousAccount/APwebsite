import json
with open('diff.json',"r") as f:
    aidiff = json.loads(f.read())

right = 0
wrong = 0

for item in aidiff:
    if("2" in item[2]):
         right+= 1
    else:
         wrong += 1
print(right)
print(wrong)
print(right/(right+wrong))