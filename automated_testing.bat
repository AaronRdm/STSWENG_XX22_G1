@echo off

echo Installing Required Packages
pip install robotframework
pip install robotframework-seleniumlibrary

echo Running Test Scripts
robot --outputdir ./__test__/output/ ./__test__/. 
