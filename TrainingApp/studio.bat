@echo off
TITLE Guidewire Studio TrainingApp 8.0.0 GA E19
call ant -f "%~dp0\modules\ant\build.xml" %* studio
