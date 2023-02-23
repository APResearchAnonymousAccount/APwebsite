import csv

with open('iraTweetsRefined.csv', 'r') as file:
    reader = csv.DictReader(file)
    data = [row for row in reader]

accountCategories = []
for post in data:
    if(post['account_category'] in accountCategories):
        continue
    else:
        accountCategories.append(post['account_category'])
print(accountCategories)

accountTypes = []
for post in data:
    if(post['account_type'] in accountTypes):
        continue
    else:
        accountTypes.append(post['account_type'])
print(accountTypes)

dataSortedByAccountCategories = [[] for i in accountCategories]
dataSortedByAccountTypes = [[] for i in accountTypes]

for post in data:
    dataSortedByAccountCategories[accountCategories.index(post["account_category"])].append(post)
    dataSortedByAccountTypes[accountTypes.index(post["account_type"])].append(post)

print(len(dataSortedByAccountTypes[2]))
for post in dataSortedByAccountTypes[2][:2]:
    print(post)



