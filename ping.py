import os
import sys

ping = os.popen('ping www.google.com -c 1')
result = ping.readlines()
msLine = result[1].strip()
print(msLine.split('=')[-1])
sys.stdout.flush()