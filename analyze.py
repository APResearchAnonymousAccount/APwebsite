#! /bin/python3
import json
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from sklearn.linear_model import LinearRegression
import sqlite3
import os
import statistics
import math
import sys
import numpy as np

ages = ["<14", "14-18", "19-22", "23-29", "30-39",
        "40-49", "50-59", "60-69", " 70-79", "80+"]
educationLevels = ["No formal education","Primary education","Secondary education","GED","Vocational qualification","Bachelor's degree","Master's degree","Doctorate or higher"]
colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080',
          '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000']

with open('ai.json', 'r') as f:
    aiList = json.loads(f.read())
with open('human.json', 'r') as f:
    humanList = json.loads(f.read())
with open('aiIRA.json', 'r') as f:
    aiListira = json.loads(f.read())
with open('humanIRA.json', 'r') as f:
    humanListira = json.loads(f.read())


sql_query = """SELECT name FROM sqlite_master
    WHERE type='table';"""
mydb = sqlite3.connect(
    os.path.dirname(os.path.realpath(__file__))+'/apdb.sqlite')
cursor = mydb.cursor()


analysisIndex = 7
figIndex = 7
figIndex = sys.argv[1]
analysisTypes = ["topTenUsers", "tableDemographics","changeOverTime", "changeOverTimeAverage", "intervalAverageTime", "changeOverTimevsAge", "aiGenType", "aiGenTypeIRA",
                 "aiTextLengthScatter", "aiTextLengthPlot", "participationHistogram", "scatterPlotAge"]

if(figIndex == 0):
    analysisType = analysisTypes[analysisIndex]
else:
    analysisType = "fig"+str(figIndex)


cursor.execute("SELECT answers.id,users.referer, users.uid, users.age, users.experience, users.education, answers.hid, answers.aiid, answers.acc FROM answers INNER JOIN users ON users.uid = answers.uid WHERE users.referer != 'test' ORDER BY answers.id")
baseTweets = cursor.fetchall()
# stuff = cursor.fetchall()
cursor.execute("SELECT answersIRA.id,users.referer, users.uid, users.age, users.experience, users.education, answersIRA.hid, answersIRA.aiid, answersIRA.acc FROM answersIRA INNER JOIN users ON users.uid = answersIRA.uid WHERE users.referer != 'test' ORDER BY answersIRA.id")

iraTweets = cursor.fetchall()

# stuff.extend(cursor.fetchall())

stuff = iraTweets.copy()

stuff.extend(baseTweets)


answers = []
users = {}
answersIra = []
usersIra = {}
answersBase = []
usersBase = {}


maxQ = 0
# Processing
for (ansid, referer, uid, age, experience, education, hid, aiid, acc) in stuff:

    answer = {
        'hid': hid,
        "aiid": aiid,
        'acc': acc,
        'aiText': aiList[aiid][0],
        'aiGenType': aiList[aiid][1],
        'humanText': humanList[hid]
    }
    answers.append(answer)
    if (uid in users):
        users[uid]['answers'].append(answer)
    else:
        users[uid] = {
            'referrer': referer,
            'age': age,
            'education': education,
            'experience': experience,
            'answers': [answer]
        }
    if (len(users[uid]['answers']) > maxQ):
        maxQ = len(users[uid]['answers'])

for (ansid, referer, uid, age, experience, education, hid, aiid, acc) in iraTweets:

    answer = {
        'hid': hid,
        "aiid": aiid,
        'acc': acc,
        'aiText': aiListira[aiid][0],
        'aiGenType': aiListira[aiid][1],
        'humanText': humanListira[hid]
    }
    answersIra.append(answer)
    if (uid in usersIra):
        usersIra[uid]['answers'].append(answer)
    else:
        usersIra[uid] = {
            'referrer': referer,
            'age': age,
            'education': education,
            'experience': experience,
            'answers': [answer]
        }
    if (len(usersIra[uid]['answers']) > maxQ):
        maxQ = len(usersIra[uid]['answers'])

for (ansid, referer, uid, age, experience, education, hid, aiid, acc) in baseTweets:

    answer = {
        'hid': hid,
        "aiid": aiid,
        'acc': acc,
        'aiText': aiList[aiid][0],
        'aiGenType': aiList[aiid][1],
        'humanText': humanList[hid]
    }
    answersBase.append(answer)
    if (uid in usersBase):
        usersBase[uid]['answers'].append(answer)
    else:
        usersBase[uid] = {
            'referrer': referer,
            'age': age,
            'education': education,
            'experience': experience,
            'answers': [answer]
        }
    if (len(users[uid]['answers']) > maxQ):
        maxQ = len(users[uid]['answers'])


for i in range(len(aiList)):
    aiList[i] = {
        'text': aiList[i][0],
        'genType': aiList[1],
        "right": 0,
        "wrong": 0

    }


for i in range(len(humanList)):

    humanList[i] = {
        'text': humanList[i],
        "right": 0,
        "wrong": 0
    }


tRight = 0


for i in range(len(aiListira)):
    aiListira[i] = {
        'text': aiListira[i][0],
        'genType': aiListira[1],
        "right": 0,
        "wrong": 0

    }
for i in range(len(humanListira)):

    humanListira[i] = {
        'text': humanListira[i],
        "right": 0,
        "wrong": 0
    }


for answer in answers:
    aiList[answer['aiid']]["right"] += answer["acc"]
    aiList[answer['aiid']]["wrong"] -= (answer["acc"]-1)
    humanList[answer['hid']]["right"] += answer["acc"]
    humanList[answer['hid']]["wrong"] -= (answer["acc"]-1)
    tRight += answer["acc"]

def getAcc(user):
    right = 0
    total = 0
    for answer in user['answers']:
        total+= 1
        right += answer['acc']
    return right/total



def retAcc(user):
    return user['acc']

for user in users:
    acc = getAcc(users[user])
    users[user]['acc'] = acc
totalMean = tRight/len(answers)*100
print(len(users), " responses so far")
print("Average Accuracy: ", round(tRight/len(answers)*100, 2), "%")


if (analysisType == "topTenUsers"):
    topTen = []

    for user in users:
        if (len(topTen) < 10):
            topTen.append(users[user])
            if(len(topTen) == 10):
              topTen.sort(key=retAcc)
            continue
        for i in range(10):
            if(users[user]['acc'] < topTen[i]['acc']):
                if(i == 0):
                    break
                
                topTen.insert(i,users[user])

                topTen.pop(0)
                break
    topTenAccs = ""
    for user in topTen:
        right = 0
        total = 0
        for answer in user['answers']:
            total+= 1
            right += answer['acc']
        topTenAccs+=(str(right)+"/"+str(total)+" ("+str(right/total*100)+"%)  |  ")
    print(topTenAccs)
    print(topTen[2]['acc'])


if (analysisType == "fig1"):
    resps = [0 for i in range(0, 130)]

    for user in users:
        for i in range(len(users[user]['answers'])):
            resps[i] += 1

    fig, ax = plt.subplots()
    ax.set_ylabel('Number of participants')
    ax.set_xlabel('Index of question')
    plt.title("Figure 1. Participation Histogram")

    ax.bar([i for i in range(0, 130)], resps)
    plt.show()


if (analysisType == "fig2"):

    pri = 0
    wrong = [0 for i in range(200)]
    right = [0 for i in range(200)]
    total = [0 for i in range(200)]
    for user in users:
        for i in range(len(users[user]['answers'])):
            # if(pri<3 and users[user][i]['acc'] != 1):
            #   print(users[user][i])
            #  pri += 1
            if (users[user]['answers'][i]['acc'] == 1):
                right[i] += 1
            else:
                wrong[i] += 1
            total[i] += 1


    # right = blurList(1,right)
    # wrong = blurList(1,wrong)
    print(total)

    fig, ax = plt.subplots()
    lengthToPlot = 10

    ax.set_ylim([40, 80])
    x = np.array([i for i in range(1, lengthToPlot+1)])
    y = np.array([right[i]/(right[i]+wrong[i])*100 for i in range(0, lengthToPlot)])
    print("Standard Deviation: ",statistics.stdev(y))

    ax.scatter(x,y,label="Mean Accuracies")  # ,color='white')
    ax.plot(x,y,alpha=0.3)
    a, b = np.polyfit(x, y, 1)
    plt.plot(x, a*x+b,label="Trendline - least squares regression")
    print("Gap:",(a*len(x)+b)-(a*1+b))
    ax.legend()
    """ax.spines['bottom'].set_color('white')
    ax.spines['top'].set_color('white') 
    ax.spines['right'].set_color('white')
    ax.spines['left'].set_color('white')
    ax.xaxis.label.set_color('white')
    ax.yaxis.label.set_color('white') """
    ax.set_xlabel('Question #')
    ax.set_ylabel('Accuracy (%)')
    plt.grid(True, 'both', 'both', alpha=0.3)
    ax.tick_params(axis='x')  # , colors='white')
    ax.tick_params(axis='y')  # , colors='white')

    plt.title("Figure 2. Change in accuracy over time")
    plt.savefig('demo.png')  # , transparent=True)

    plt.show()

if (analysisType == "fig3"):

    pri = 0
    wrong = [0 for i in range(200)]
    right = [0 for i in range(200)]
    total = [0 for i in range(200)]
    for user in users:
        for i in range(len(users[user]['answers'])):
            # if(pri<3 and users[user][i]['acc'] != 1):
            #   print(users[user][i])
            #  pri += 1
            if (users[user]['answers'][i]['acc'] == 1):
                right[i] += 1
            else:
                wrong[i] += 1
            total[i] += 1


    # right = blurList(1,right)
    # wrong = blurList(1,wrong)
    print(total)

    fig, ax = plt.subplots()
    lengthToPlot = 100

    ax.set_ylim([20, 90])

    x = np.array([i for i in range(1, lengthToPlot+1)])
    y = np.array([right[i]/(right[i]+wrong[i])*100 for i in range(0, lengthToPlot)])

    print("Standard Deviation: ",statistics.stdev(y))

    ax.scatter(x,y,label="Mean Accuracies")  # ,color='white')
    #ax.plot(x,y,alpha=0.3)
    a, b = np.polyfit(x, y, 1)
    print("Gap:",(a*len(x)+b)-(a*1+b))
    plt.plot(x, a*x+b,color="#ff7f0e",label="Trendline - least squares regression")
    """ax.spines['bottom'].set_color('white')
    ax.spines['top'].set_color('white') 
    ax.spines['right'].set_color('white')
    ax.spines['left'].set_color('white')
    ax.xaxis.label.set_color('white')
    ax.yaxis.label.set_color('white') """
    ax.set_xlabel('Question #')
    ax.set_ylabel('Accuracy (%)')
    ax.legend()
    plt.grid(True, 'both', 'both', alpha=0.3)
    ax.tick_params(axis='x')  # , colors='white')
    ax.tick_params(axis='y')  # , colors='white')
    plt.title("Figure 3. Change in accuracy over time - extended")
    #plt.savefig('demo.png')  # , transparent=True)

    plt.show()


    pri = 0
    wrong = [0 for i in range(200)]
    right = [0 for i in range(200)]
    total = [0 for i in range(200)]
    for user in users:
        for i in range(len(users[user]['answers'])):
            # if(pri<3 and users[user][i]['acc'] != 1):
            #   print(users[user][i])
            #  pri += 1
            if (users[user]['answers'][i]['acc'] == 1):
                right[i] += 1
            else:
                wrong[i] += 1
            total[i] += 1



    # right = blurList(1,right)
    # wrong = blurList(1,wrong)
    print(total)

    fig, ax = plt.subplots()
    lengthToPlot = 100

    ax.set_ylim([20, 90])

    x = np.array([i for i in range(1, lengthToPlot+1)])
    y = np.array([right[i]/(right[i]+wrong[i])*100 for i in range(0, lengthToPlot)])

    print("Standard Deviation: ",statistics.stdev(y))

    ax.scatter(x,y,label="Mean Accuracies")  # ,color='white')
    #ax.plot(x,y,alpha=0.3)
    a, b = np.polyfit(x, y, 1)
    print("Gap:",(a*len(x)+b)-(a*1+b))
    plt.plot(x, a*x+b,color="#ff7f0e",label="Trendline - least squares regression")
    """ax.spines['bottom'].set_color('white')
    ax.spines['top'].set_color('white') 
    ax.spines['right'].set_color('white')
    ax.spines['left'].set_color('white')
    ax.xaxis.label.set_color('white')
    ax.yaxis.label.set_color('white') """
    ax.set_xlabel('Question #')
    ax.set_ylabel('Accuracy (%)')
    ax.legend()
    plt.grid(True, 'both', 'both', alpha=0.3)
    ax.tick_params(axis='x')  # , colors='white')
    ax.tick_params(axis='y')  # , colors='white')
    plt.title("Figure 3. Change in accuracy over time - extended")
    #plt.savefig('demo.png')  # , transparent=True)

    plt.show()



if (analysisType == "fig9"):
    agesTotal = [0 for i in ages]
    agesAcc = [0 for i in ages]
    xs = []
    ys = []
    tots = []
    num = 0
    for user in users:
        if (type(users[user]['age']) == int):
            total = 0
            num += 1
            for i in range(len(users[user]['answers'])):
                total += users[user]['answers'][i]['acc']
                agesAcc[users[user]['age']] += users[user]['answers'][i]['acc']
                agesTotal[users[user]['age']] += 1
            xs.append(users[user]['age'])
            ys.append(total/len(users[user]['answers'])*100)
            tots.append(len(users[user]['answers']))
    agesAvg = []
    for i in range(len(ages)):
        if (agesTotal[i] == 0):
            agesAvg.append(50)
            continue
        agesAvg.append(agesAcc[i]/agesTotal[i]*100)

    print(num, " users with recorded age")

    fig = plt.figure()
    ax = fig.add_subplot(111,projection='3d')

    ax.scatter(xs, tots, ys,alpha=0.7)
    
    #ax.plot([i for i in ages[:-1]], agesAvg[:-1])
    model = LinearRegression()
    X = np.column_stack((xs,tots))
    model.fit(X,ys)

    xs_range = np.linspace(min(xs),max(xs),10)
    tots_range = np.linspace(min(tots),max(tots),10)
    xs_grid, tots_grid = np.meshgrid(xs_range,tots_range)
    X_grid = np.column_stack((xs_grid.ravel(),tots_grid.ravel()))
    y_grid = model.predict(X_grid)
    y_grid = y_grid.reshape(xs_grid.shape)
    ax.plot_surface(xs_grid,tots_grid,y_grid,alpha=0.5)

    # x = np.array(xs)
    # y = np.array(ys)
    # a, b = np.polyfit(x, y, 1)
    #plt.plot(x, a*x+b)

    ax.set_ylabel('Question\'s Answered')

    ax.set_zlabel('Average Accuracy(%)')
    ax.set_zlim([30, 90])

    ax.set_xlabel('Age')

    plt.show()





if (analysisType == "fig4v1"):
    agesTotal = [0 for i in ages]
    agesAcc = [0 for i in ages]
    xs = []
    ys = []
    tots = []
    num = 0
    for user in users:
        if (type(users[user]['age']) == int):
            total = 0
            num += 1
            for i in range(len(users[user]['answers'])):
                total += users[user]['answers'][i]['acc']
                agesAcc[users[user]['age']] += users[user]['answers'][i]['acc']
                agesTotal[users[user]['age']] += 1
            xs.append(users[user]['age'])
            ys.append(total/len(users[user]['answers'])*100)
            tots.append(len(users[user]['answers']))
    agesAvg = []
    for i in range(len(ages)):
        if (agesTotal[i] == 0):
            agesAvg.append(50)
            continue
        agesAvg.append(agesAcc[i]/agesTotal[i]*100)

    print(num, " users with recorded age")

    fig, ax = plt.subplots()
    plt.title("Figure 4. Accuracy vs Age")
    ax.set_ylim([30, 90])

    ax.set_ylabel('Accuracy(%)')
    ax.set_xlabel('Age')
    ax.plot([i for i in ages[:-1]], agesAvg[:-1])
    x = np.array(xs)
    y = np.array(ys)
    a, b = np.polyfit(x, y, 1)
    plt.plot(x, a*x+b)
    ax.scatter(xs, ys,alpha=0.7,s=tots)
    plt.show()


if (analysisType == "fig4"):
    agesTotal = [0 for i in ages]
    agesAcc = [0 for i in ages]
    xs = []
    ys = []
    tots = []
    num = 0
    for user in users:
        if (type(users[user]['age']) == int):
            total = 0
            num += 1
            for i in range(len(users[user]['answers'])):
                total += users[user]['answers'][i]['acc']
                agesAcc[users[user]['age']] += users[user]['answers'][i]['acc']
                agesTotal[users[user]['age']] += 1
            xs.append(users[user]['age'])
            ys.append(total/len(users[user]['answers'])*100)
            tots.append(len(users[user]['answers']))
    
    pri = 0
    wrong = [0 for i in range(200)]
    right = [0 for i in range(200)]
    total = [0 for i in range(200)]
    for user in users:
        for i in range(len(users[user]['answers'])):
            # if(pri<3 and users[user][i]['acc'] != 1):
            #   print(users[user][i])
            #  pri += 1
            if (users[user]['answers'][i]['acc'] == 1):
                right[i] += 1
            else:
                wrong[i] += 1
            total[i] += 1  
    lengthToPlot = 100
    x = np.array([i for i in range(1, lengthToPlot+1)])
    y = np.array([right[i]/(right[i]+wrong[i])*100 for i in range(0, lengthToPlot)])
    a, b = np.polyfit(x, y, 1)
    plt.plot(x, a*x+b,color="#ff7f0e",label="Trendline - least squares regression")
    
    
    
    agesAvg = []
    for i in range(len(ages)):
        if (agesTotal[i] == 0):
            agesAvg.append(50)
            continue
        agesAvg.append(agesAcc[i]/agesTotal[i]*100)

    print(num, " users with recorded age")

    fig, ax = plt.subplots()
    plt.title("Figure 4. Accuracy vs Age")
    ax.set_ylim([30, 90])

    ax.set_ylabel('Accuracy(%)')
    ax.set_xlabel('Age')
    ax.plot([i for i in ages[:-1]], agesAvg[:-1])
    x = np.array(xs)
    y = np.array(ys)
    a, b = np.polyfit(x, y, 1)
    plt.plot(x, a*x+b)
    ax.scatter(xs, ys,alpha=0.7,s=tots)
    plt.show()


    
if (analysisType == "fig5"):
    educationTotal = [0 for i in educationLevels]
    educationAcc = [0 for i in educationLevels]
    xs = []
    ys = []
    tots = []
    num = 0
    for user in users:
        if (type(users[user]['education']) == str):
            total = 0
            num += 1
            for i in range(len(users[user]['answers'])):
                total += users[user]['answers'][i]['acc']
                educationAcc[educationLevels.index(users[user]['education'])] += users[user]['answers'][i]['acc']
                educationTotal[educationLevels.index(users[user]['education'])] += 1
            xs.append(educationLevels.index(users[user]['education']))
            ys.append(total/len(users[user]['answers'])*100)
            tots.append(len(users[user]['answers']))
    educationAvg = []
    for i in range(len(educationLevels)):
        if (educationTotal[i] == 0):
            educationAvg.append(50)
            continue
        educationAvg.append(educationAcc[i]/educationTotal[i]*100)

    print(num, " users with recorded education")

    fig, ax = plt.subplots()
    plt.title("Figure 5. Accuracy vs Education")
    ax.set_ylim([30, 90])

    ax.set_ylabel('Accuracy(%)')
    ax.set_xlabel('Highest level of Education')
    ax.plot([i for i in educationLevels], educationAvg)
    x = np.array(xs)
    y = np.array(ys)
    a, b = np.polyfit(x, y, 1)
    plt.plot(x, a*x+b)

    ax.scatter(xs, ys,alpha=0.7,s=tots)
    plt.show()


if (analysisType == "fig6"):
    possible = [i for i in range(1,11)]
    experienceTotal = [0 for i in possible]
    experienceAcc = [0 for i in possible]
    xs = []
    ys = []
    tots = []
    num = 0
    for user in users:
        if (type(users[user]['experience']) == int):
            total = 0
            num += 1
            for i in range(len(users[user]['answers'])):
                total += users[user]['answers'][i]['acc']
                experienceAcc[users[user]['experience']] += users[user]['answers'][i]['acc']
                experienceTotal[users[user]['experience']] += 1
            xs.append(users[user]['experience'])
            ys.append(total/len(users[user]['answers'])*100)
            tots.append(len(users[user]['answers']))
    experienceAvg = []
    for i in range(len(possible)):
        if (experienceTotal[i] == 0):
            experienceAvg.append(50)
            continue
        experienceAvg.append(experienceAcc[i]/experienceTotal[i]*100)

    print(num, " users with recorded Experience")

    fig, ax = plt.subplots()
    plt.title("Figure 6. Accuracy vs Experience")
    ax.set_ylim([30, 90])

    ax.set_ylabel('Accuracy(%)')
    ax.set_xlabel('Experience')
    x = np.array(xs)
    y = np.array(ys)
    a, b = np.polyfit(x, y, 1)
    plt.plot(x, a*x+b)
    ax.plot([i for i in possible[:-2]], experienceAvg[:-2])

    ax.scatter(xs, ys,alpha=0.7,s=tots)
    plt.show()

if (analysisType == "fig7"):

    genTypes = ["p", "o", "d", "d2", "c", "c2"]
    genTypesNames = ["ChatGPT Paraphrase", "ChatGPT Original", "Davinci 1", "Davinci 2", "Curie 1", "Curie 2"]

    typeCountRight = [0 for i in range(6)]
    typeCountWrong = [0 for i in range(6)]

    for answer in answersBase:
        ind = 0
        if (type(answer["aiGenType"]) != int):
            ind = genTypes.index(answer["aiGenType"])
        if (answer["acc"]):
            typeCountRight[ind] += 1
        else:
            typeCountWrong[ind] += 1
    fig, ax = plt.subplots()
    ax.set_ylim(50, 80)

    """ ax.spines['bottom'].set_color('white')
    ax.spines['top'].set_color('white')
    ax.spines['right'].set_color('white')
    ax.spines['left'].set_color('white')
    ax.xaxis.label.set_color('white')
    ax.yaxis.label.set_color('white') """
    ax.set_xlabel('Generation Type')
    ax.set_ylabel('Accuracy (%)')
    plt.title("Figure 7. AI Prompt and Model")

    """ ax.tick_params(axis='x', colors='white')
    ax.tick_params(axis='y', colors='white') """
    []
    ax.bar(genTypesNames, [typeCountRight[i]/(typeCountRight[i] +
           typeCountWrong[i])*100 for i in range(0, len(genTypes))])#, color="white")
    plt.savefig('demo.png', transparent=True)

    plt.show()




if (analysisType == "fig8"):

    genTypes = ["1", "2", "3", "4","5", "leftNone", "leftBasic",
                "leftSpecific", "rightNone", "rightBasic", "rightSpecific"]
    typeCountRight = [0 for i in range(len(genTypes))]
    typeCountWrong = [0 for i in range(len(genTypes))]

    for answer in answersIra:
        ind = 0
        if (type(answer["aiGenType"]) != int):
            print(answer)
            ind = genTypes.index(answer["aiGenType"])
        else:
            ind = answer["aiGenType"]
        if (answer["acc"]):
            typeCountRight[ind] += 1
        else:
            typeCountWrong[ind] += 1
    fig, ax = plt.subplots()
    ax.set_ylim(40, 80)
    """ ax.spines['bottom'].set_color('white')
    ax.spines['top'].set_color('white') 
    ax.spines['right'].set_color('white')
    ax.spines['left'].set_color('white')
    ax.xaxis.label.set_color('white')
    ax.yaxis.label.set_color('white')

    ax.tick_params(axis='x', colors='white')
    ax.tick_params(axis='y', colors='white') """
    ax.set_xlabel('Generation Type')
    ax.set_ylabel('Accuracy (%)')
    print(typeCountRight)
    print(typeCountWrong)
    plt.title("Figure 8. AI Prompting - Further Analysis")

    ax.bar(genTypes, [typeCountRight[i]/(typeCountRight[i] +
           typeCountWrong[i])*100 for i in range(0, len(genTypes))])  # ,color="white")
    plt.savefig('demo.png', transparent=True)

    plt.show()




if(analysisType == "tableDemographics"):
    ageCounts = [0 for i in ages]
    ageTotal = 0
    expCounts = [0 for i in range(0,10)]
    expTotal = 0
    eduCounts = [0 for i in range(0,8)]
    eduTotal = 0

    for user in users:
        try:
            if(type(users[user]['age']) == int):
                ageCounts[users[user]['age']] += 1    
                ageTotal+=1
            if(type(users[user]['experience']) == int):

                expCounts[users[user]['experience']-1] += 1
                expTotal +=1
            if(type(users[user]['education']) == str):

                eduCounts[educationLevels.index(users[user]['education'])] += 1
                eduTotal += 1


        except Exception as e:
            print(e)
            print(type(users[user]['age']))
    strs = [[],[],[]]
    for i in ageCounts:
        strs[0].append(str(i))
    for i in eduCounts:
        strs[1].append(str(i))
    for i in expCounts:
        strs[2].append(str(i))
    print("Ages: ",",".join(strs[0])," Total: ",ageTotal)

    print("Educations: ",",".join(strs[1])," Total: ",eduTotal)

    print("Experiences: ",",".join(strs[2])," Total: ",expTotal)



if (analysisType == "changeOverTime"):

    pri = 0
    wrong = [0 for i in range(200)]
    right = [0 for i in range(200)]
    total = [0 for i in range(200)]
    for user in users:
        for i in range(len(users[user]['answers'])):
            # if(pri<3 and users[user][i]['acc'] != 1):
            #   print(users[user][i])
            #  pri += 1
            if (users[user]['answers'][i]['acc'] == 1):
                right[i] += 1
            else:
                wrong[i] += 1
            total[i] += 1

    def blurList(radius, list):
        newList = []
        for index in range(len(list)):
            toAvg = [list[index]]
            for i in range(1, radius+1):
                if (index-i >= 0):
                    toAvg.append(list[index-i])
                elif (index+i < len(list)):
                    toAvg.append(list[index+i])
            newList.append(sum(toAvg)/len(toAvg))
        return newList
    # right = blurList(1,right)
    # wrong = blurList(1,wrong)
    print(total)

    fig, ax = plt.subplots()
    lengthToPlot = 100

    ax.set_ylim([20, 90])
    x = np.array([i for i in range(1, lengthToPlot+1)])
    y = np.array([right[i]/(right[i]+wrong[i])*100 for i in range(0, lengthToPlot)])

    #ax.plot(x,y,alpha=0.3)
    a, b = np.polyfit(x, y, 1)
    plt.plot(x, a*x+b)
    """ax.spines['bottom'].set_color('white')
    ax.spines['top'].set_color('white') 
    ax.spines['right'].set_color('white')
    ax.spines['left'].set_color('white')
    ax.xaxis.label.set_color('white')
    ax.yaxis.label.set_color('white') """
    ax.set_xlabel('Question #')
    ax.set_ylabel('Accuracy (%)')
    plt.grid(True, 'both', 'both', alpha=0.3)
    ax.tick_params(axis='x')  # , colors='white')
    ax.tick_params(axis='y')  # , colors='white')
    plt.title("Figure 1. Change in accuracy over time")
    plt.savefig('demo.png')  # , transparent=True)

    plt.show()

if (analysisType == "changeOverTimeAverage"):

    pri = 0

    avgs = [[] for i in range(200)]
    for user in users:
        # if(len(users[user]['answers']) != 129): continue
        # print(user)
        r = 0
        for i in range(0, len(users[user]['answers'])):
            r += users[user]['answers'][i]['acc']
            avgs[i].append(r/(i+1)*100)
    metaAvgs = []
    # print(avgs)

    for arr in avgs:
        if (arr == []):
            break
        metaAvgs.append(sum(arr)/len(arr))

    def blurList(radius, list):
        newList = []
        for index in range(len(list)):
            toAvg = [list[index]]
            for i in range(1, radius+1):
                if (index-i >= 0):
                    toAvg.append(list[index-i])
                elif (index+i < len(list)):
                    toAvg.append(list[index+i])
            newList.append(sum(toAvg)/len(toAvg))
        return newList
    # right = blurList(1,right)
    # wrong = blurList(1,wrong)

    fig, ax = plt.subplots()
    start = 0
    lengthToPlot = 100

    ax.set_ylim([40, 90])

    ax.plot([i for i in range(start, lengthToPlot)],
            metaAvgs[start:lengthToPlot])  # ,color='white')
    """ax.spines['bottom'].set_color('white')
    ax.spines['top'].set_color('white') 
    ax.spines['right'].set_color('white')
    ax.spines['left'].set_color('white')
    ax.xaxis.label.set_color('white')
    ax.yaxis.label.set_color('white') """
    ax.set_xlabel('Question #')
    ax.set_ylabel('Accuracy (%)')

    ax.tick_params(axis='x')  # , colors='white')
    ax.tick_params(axis='y')  # , colors='white')

    plt.savefig('demo.png')  # , transparent=True)

    plt.show()

if (analysisType == "intervalAverageTime"):
    interval = 5
    index = 0
    xWindow = [0, 10]
    pri = 0
    wrong = [0 for i in range(xWindow[1]//interval)]
    right = [0 for i in range(xWindow[1]//interval)]

    for user in users:
        for i in range(min(len(users[user]['answers']), xWindow[1])):
            # if(pri<3 and users[user][i]['acc'] != 1):
            #   print(users[user][i])
            #  pri += 1
            if (users[user]['answers'][i]['acc'] == 1):
                right[i//interval] += 1
            else:
                wrong[i//interval] += 1

    def blurList(radius, list):
        newList = []
        for index in range(len(list)):
            toAvg = [list[index]]
            for i in range(1, radius+1):
                if (index-i >= 0):
                    toAvg.append(list[index-i])
                elif (index+i < len(list)):
                    toAvg.append(list[index+i])
            newList.append(sum(toAvg)/len(toAvg))
        return newList
    # right = blurList(1,right)
    # wrong = blurList(1,wrong)

    fig, ax = plt.subplots()

    ax.set_ylim([0, 1])

    ax.bar([i for i in range(0, xWindow[1]//interval)], [
        right[i]/(right[i]+wrong[i]) for i in range(0, xWindow[1]//interval)])

    plt.show()

if (analysisType == "scatterPlotAge"):
    agesTotal = [0 for i in ages]
    agesAcc = [0 for i in ages]
    xs = []
    ys = []
    num = 0
    for user in users:
        if (type(users[user]['age']) == int):
            total = 0
            num += 1
            for i in range(len(users[user]['answers'])):
                total += users[user]['answers'][i]['acc']
                agesAcc[users[user]['age']] += users[user]['answers'][i]['acc']
                agesTotal[users[user]['age']] += 1
            xs.append(users[user]['age'])
            ys.append(total/len(users[user]['answers'])*100)
    agesAvg = []
    for i in range(len(ages)):
        if (agesTotal[i] == 0):
            agesAvg.append(50)
            continue
        agesAvg.append(agesAcc[i]/agesTotal[i]*100)

    print(num, " users with recorded age")

    fig, ax = plt.subplots()
    ax.set_ylabel('Accuracy(%)')
    ax.set_xlabel('Age')
    ax.scatter(xs, ys)
    ax.plot([i for i in ages], agesAvg)
    plt.show()

if (analysisType == "changeOverTimevsAge"):

    pri = 0
    ages = ["<14", "14-18", "19-22", "23-29", "30-39",
            "40-49", "50-59", "60-69", "70-79", "80+"]
    wrongs = [[0 for i in range(200)] for age in ages]
    rights = [[0 for i in range(200)] for age in ages]
    for j in range(len(ages)):
        for user in users:
            if (type(users[user]['age']) != int):
                continue
            if (users[user]['age'] // 2 != j):

                continue
            for i in range(len(users[user]['answers'])):
                # if(pri<3 and users[user][i]['acc'] != 1):
                #   print(users[user][i])
                #  pri += 1
                if (users[user]['answers'][i]['acc'] == 1):
                    rights[j][i] += 1
                else:
                    wrongs[j][i] += 1

    fig, ax = plt.subplots()
    lengthToPlot = 10
    print(rights, "\n", wrongs)
    ax.set_ylim([0, 1])
    for j in range(len(ages)//2-1):
        ax.plot([i for i in range(lengthToPlot)], [rights[j][i]/(rights[j]
                [i]+wrongs[j][i]) for i in range(lengthToPlot)], color=colors[j])

    plt.show()

if (analysisType == "aiGenType"):

    genTypes = ["p", "o", "d", "d2", "c", "c2"]
    typeCountRight = [0 for i in range(6)]
    typeCountWrong = [0 for i in range(6)]

    for answer in answersBase:
        ind = 0
        if (type(answer["aiGenType"]) != int):
            ind = genTypes.index(answer["aiGenType"])
        if (answer["acc"]):
            typeCountRight[ind] += 1
        else:
            typeCountWrong[ind] += 1
    fig, ax = plt.subplots()
    ax.set_ylim(50, 70)
    ax.spines['bottom'].set_color('white')
    ax.spines['top'].set_color('white')
    ax.spines['right'].set_color('white')
    ax.spines['left'].set_color('white')
    ax.xaxis.label.set_color('white')
    ax.yaxis.label.set_color('white')
    ax.set_xlabel('Generation Type')
    ax.set_ylabel('Accuracy (%)')

    ax.tick_params(axis='x', colors='white')
    ax.tick_params(axis='y', colors='white')
    ax.bar(genTypes, [typeCountRight[i]/(typeCountRight[i] +
           typeCountWrong[i])*100 for i in range(0, len(genTypes))], color="white")
    plt.savefig('demo.png', transparent=True)

    plt.show()


if (analysisType == "aiGenTypeIRA"):

    genTypes = ["0", "1", "2", "3","4", "leftNone", "leftBasic",
                "leftSpecific", "rightNone", "rightBasic", "rightSpecific"]
    typeCountRight = [0 for i in range(len(genTypes))]
    typeCountWrong = [0 for i in range(len(genTypes))]

    for answer in answersIra:
        ind = 0
        if (type(answer["aiGenType"]) != int):
            print(answer)
            ind = genTypes.index(answer["aiGenType"])
        else:
            ind = answer["aiGenType"]
        if (answer["acc"]):
            typeCountRight[ind] += 1
        else:
            typeCountWrong[ind] += 1
    fig, ax = plt.subplots()
    ax.set_ylim(40, 80)
    """ ax.spines['bottom'].set_color('white')
    ax.spines['top'].set_color('white') 
    ax.spines['right'].set_color('white')
    ax.spines['left'].set_color('white')
    ax.xaxis.label.set_color('white')
    ax.yaxis.label.set_color('white')

    ax.tick_params(axis='x', colors='white')
    ax.tick_params(axis='y', colors='white') """
    ax.set_xlabel('Generation Type')
    ax.set_ylabel('Accuracy (%)')
    print(typeCountRight)
    print(typeCountWrong)

    ax.bar(genTypes, [typeCountRight[i]/(typeCountRight[i] +
           typeCountWrong[i])*100 for i in range(0, len(genTypes))])  # ,color="white")
    plt.savefig('demo.png', transparent=True)

    plt.show()


if (analysisType == "participationHistogram"):
    resps = [0 for i in range(0, 130)]

    for user in users:
        for i in range(len(users[user]['answers'])):
            resps[i] += 1

    fig, ax = plt.subplots()
    ax.set_ylabel('Number of participants')
    ax.set_xlabel('Index of question')
    ax.bar([i for i in range(0, 130)], resps)
    plt.show()

if (analysisType == "aiTextLengthScatter"):

    fig, ax = plt.subplots()
    lengthToPlot = 10

    ax.set_ylim([0, 100])
    lessList = []
    for item in aiList:
        if (item["right"]+item["wrong"] > 5):
            lessList.append(item)

    ax.scatter([len(lessList[i]['text']) for i in range(0, len(lessList))], [
               lessList[i]["right"]*100/(lessList[i]["right"]+lessList[i]["wrong"]) for i in range(0, len(lessList))])

    plt.show()
if (analysisType == "aiTextLengthPlot"):

    plotInterval = 30
    averagedLengths = {
        'intervals': [],
        'values': [],
        'resps': []
    }
    xWindow = [100, 300]

    aiList.sort(key=lambda aip: len(aip['text']))
    currentIter = xWindow[0]//plotInterval
    cRight = 0
    cWrong = 0
    window = [30, 80]

    for item in aiList:
        if (item["right"]+item["wrong"] == 0 or len(item['text']) < xWindow[0] or len(item['text']) > xWindow[1]):
            continue
        # len(item['text'])
        while (len(item['text']) > (currentIter+1)*plotInterval):
           # print('b')
            if (cRight+cWrong > 0):
                averagedLengths["intervals"].append(
                    currentIter*plotInterval+plotInterval/2)
                averagedLengths["values"].append(cRight/(cRight+cWrong)*100)
                averagedLengths["resps"].append(cRight+cWrong)

                cWrong = 0
                cRight = 0
            currentIter += 1
        cRight += item['right']
        cWrong += item['wrong']

    fig, ax = plt.subplots()
    ax.set_ylim(window)
    print(averagedLengths)

    ax.bar(averagedLengths['intervals'], [i/(400/window[1]*5)
           for i in averagedLengths["resps"]], width=20, bottom=window[0])
    ax.plot(averagedLengths["intervals"], averagedLengths["values"])
    plt.show()

mydb.close()
