@echo off
setlocal
	cd %~dp0..
	node node_modules\jasmine-node\lib\jasmine-node\cli.js spec --verbose --color
endlocal
