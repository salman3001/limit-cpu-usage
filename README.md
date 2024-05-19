### This repo demonstrate how we can throttle cpu intensive tasks and control max amount of cpu unitlized by each child process

## Instructions

please note that this code requires linux operating system. if you are using windows, you can use WSL.

- on your linux os first varify if it supports cg group. to to check run this command `ls /sys/fs/cgroup` if you see some list means it is supported.
- then install this utility `sudo apt install cgroup-tools`

- install ffmpeg in system os. `sudo apt-get install  ffmpeg`

- clone this repository
- make sure you have node installed
- run `npm install`
- to start conversion without any cpu limit apply run `node worker.js`

- to start conversion with 50% cpu limit `node main.js 50`

- to start conversion with max cpu power `node main.js 500`
