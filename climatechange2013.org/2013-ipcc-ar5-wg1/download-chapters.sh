#!/bin/sh
for i in {10..14}
do
  echo "Download Chapter ${i}"
  mkdir "chapter${i}-contributors"
  curl \
    "http://www.climatechange2013.org/contributors/chapter/chapter-${i}" \
    > "chapter${i}-contributors"/"chapter-${i}.html"
  cat << EOF > "chapter0${i}-contributors"/meta.txt
Year: 2014
Title: Chapter ${i}
URL: http://www.climatechange2013.org/contributors/chapter/chapter-${i}
Tags: ipcc, ar5, wg1
EOF
  sleep 1
done
