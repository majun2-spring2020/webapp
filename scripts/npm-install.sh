#!/bin/bash
cd /
rm -rf /webapp
cp -r /webapp-install /webapp
cd /webapp
npm install