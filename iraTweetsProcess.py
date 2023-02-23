import csv

with open('tweets.csv') as f:
    fieldnames = f.readline().split(",")
fieldnames[len(fieldnames)-1] = fieldnames[len(fieldnames)-1][:-1]
data = []
with open('tweets.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        #if(row['post_type'] != "" or row['account_category'] == "NonEnglish" or 'http' in row['content'] or '@' in row['content']):
           # continue
        b = False
        for post in data:
            if post['text'] == row['text']:
                b = True
                break
        if(b):
            continue
        data.append(row)

print(len(data)," posts aggregated")

with open('iraTweetsRefined2.csv', 'w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(data)