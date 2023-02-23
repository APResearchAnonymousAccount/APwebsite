import matplotlib.pyplot as plt

users = {}
wrong = [0 for i in range(200)]
right = [0 for i in range(200)]
def blurList(radius,list):
    newList = []
    for index in range(len(list)):
        toAvg = [list[index]]
        for i in range(1,radius+1):
            if(index-i>=0):
                toAvg.append(list[index-i])
            elif(index+i < len(list)):
                toAvg.append(list[index+i])
        newList.append(sum(toAvg)/len(toAvg))
    return newList
maxQ = 0;
with open('answers.txt','r') as f:
    lines = f.readlines()
answer = {}

for i in range(len(lines)):
    line = lines[i]
    if(i%4 == 1):
        answer['referrer'] = line[9:]
    elif(i%4 == 2):
        answer['uid'] = line[9:]
    elif(i%4 == 3):
        answer['acc'] = int(line[9:])
    else:
        if(answer != {}):
            if(answer['uid'] in users):
                users[answer['uid']].append(answer)
            else:
                users[answer['uid']] = [answer]
            if(len(users[answer['uid']]) > maxQ):
                maxQ = len(users[answer['uid']])
        answer = {}
        
pri =  0
for user in users:
    for i in range(len(users[user])):
        #if(pri<3 and users[user][i]['acc'] != 1):
         #   print(users[user][i])
          #  pri += 1
        if(users[user][i]['acc'] == 1):
            right[i]+=1
        else:
            wrong[i]+=1
right = blurList(10,right)
wrong = blurList(10,wrong)
print(right[:11])
print(wrong[:11])

fig, ax = plt.subplots()
lengthToPlot = maxQ-50



ax.plot([i for i in range(0,lengthToPlot)],[right[i]/(right[i]+wrong[i]) for i in range(0,lengthToPlot)])

plt.show()