#!/bin/bash
cd /home/kavia/workspace/code-generation/hireiq-lite-114402-1d7df411/hireiq_lite_frontend_workspace/hireiq_lite_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

