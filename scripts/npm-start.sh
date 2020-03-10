#!/bin/bash
cd ~/webapp
source ~/etc/profile
nohup npm start >~/output 2>&1 &