#! /bin/bash
echo "SELECT users.referer, users.uid, answers.acc FROM answers INNER JOIN users ON users.uid =                          
answers.uid WHERE users.referer != 'test' \G" | mysql -h 34.162.43.147 -u apwebsiteuser --password='FpH{dXA62Koe%EVV' --database='apwebsitedb' > answers.txt