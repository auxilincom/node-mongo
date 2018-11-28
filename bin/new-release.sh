#!/bin/sh
Green='\033[0;32m' 
BIGreen='\033[1;92m'
Color_Off='\033[0m'
Red='\033[0;31m'    
echo $BIGreen"Last three releases: $Green"
git tag -l --sort -refname | head -n 3
echo $Color_Off"-_________________-"

if [ -z "$1" ]; then 
  echo $Red"Release hasn't been created. Please, provide release version and description. e.x.: ./bin/new-release.sh \"v0.2.3\" \"Release notes goes here.\"" 
  echo $Color_Off
  exit 1
fi
echo "Pusing release $1"
git tag -a "$1" -m "$2" && git push origin $1