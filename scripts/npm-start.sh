#!/bin/bash
cd /webapp
source /etc/profile
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/webapp/cloudwatch_config.json -s
nohup npm start > ~/application.log 2>&1 &
