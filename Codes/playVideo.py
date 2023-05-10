import cv2
import numpy as np
import json
import requests
import socket
import time
import sys

start = time.time()
WLED_IP_ADDRESS = sys.argv[1]  # WLED IP address
WLED_PORT_NO = 21324  # Default WLED port number

DISPLAY_HEIGHT = int(sys.argv[2])
DISPLAY_WIDTH = int(sys.argv[3])
DISPLAY_SIZE = DISPLAY_HEIGHT*DISPLAY_WIDTH

#Seconds to wait after the last received packet before returning to normal mode
waitTime = int(sys.argv[5])
fileName = "../Sources/" + sys.argv[4]

# Create a UDP socket
client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# 1	WARLS	255
# 2	DRGB	490
# 3	DRGBW	367
# 4	DNRGB	489/packet
# 0	WLED Notifier	-
protocallNo = 4

#reading video
cap = cv2.VideoCapture(fileName)
i = 0
while(cap.isOpened()):
    ret, frame = cap.read()
    if ret != True:
        break

    # Reducing frame
    reducedFrame = cv2.resize(frame, (DISPLAY_HEIGHT,DISPLAY_WIDTH))

    # Convert BGR to RGB
    rgb_frame = cv2.cvtColor(reducedFrame, cv2.COLOR_BGR2RGB)

    # Get the pixel data
    pixels = rgb_frame.reshape(-1, 3)

    data = pixels.flatten().tobytes()

    for i in range(0,DISPLAY_SIZE,450):

        starting_index_highbyte = (i >> 8) & 0xFF
        starting_index_lowbyte = i & 0xFF
        
        sending_data = bytearray([protocallNo ,waitTime,starting_index_highbyte,starting_index_lowbyte]) + data[i*3:(3*i)+1350]
        print(sending_data)
        print(".................................................",i)
        time.sleep(0.010)

        # Send the message to the WLED server
        client_socket.sendto(sending_data, (WLED_IP_ADDRESS, WLED_PORT_NO))
    print("frames send : ",i)
    i+=1
    time.sleep(0.035)

client_socket.close()
end = time.time()
print("The time of execution of above program is :",(end-start) * 10**3, "ms")