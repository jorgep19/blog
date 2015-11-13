#!/bin/sh
# copy and paste this in the directory you want 
# the project on your terminal do 
# "chmod +x {filename}" then on your terminal do 
# "./{filename}" to create the project structure

mkdir server
cd server
mkdir app
cd app
mkdir controllers
cd controllers
touch Main.scala
cd ../../
mkdir conf
cd conf
touch application.conf
touch routes
cd ../
mkdir project
cd project
touch application.conf
touch plugins.sbt
cd ../
touch build.sbt
touch manifest.yml