#!/bin/sh
baseUrl="http://report.mitigation2014.org/report"

for i in {1..16}
do
  fileName="ipcc_wg3_ar5_chapter${i}.pdf"
  url="${baseUrl}/${fileName}"
  if test "$i" -lt 10
  then
    folder="chapter0$i-authors"
  else
    folder="chapter$i-authors"
  fi
  echo "Download Chapter ${i} to ${folder}"
  mkdir "${folder}"
  curl \
    "${url}" \
    > "${folder}"/"${fileName}"
  cat << EOF > "${folder}"/meta.txt
Year: 2014
Title: Chapter ${i}
URL: ${url}
Tags: ipcc, ar5, wg3
EOF
  sleep 1
done
