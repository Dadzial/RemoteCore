# RemoteCore

Web application for controlling and monitoring a robot built on an ESP32 microcontroller.  
The project is developed using the **MEAN stack**:

- MongoDB
- Express.js
- Angular
- Node.js

## Project Status

Project in early development stage.  
Core architecture initialized.


## Codes from ESP32

#### connection.controller.ts

```ts
  void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    
    //Case for connection to connection controller
    case WStype_CONNECTED: 
      Serial.println("WS Connected");
      webSocket.sendTXT("{\"event\":\"connection:robot-online\",\"data\":{\"firmwareVersion\":\"1.0.0\"}}");
      break;

    case WStype_TEXT:
      handleMessage(payload);
      break;

    case WStype_DISCONNECTED:
      Serial.println("WS Disconnected");
      motorStop();
      break;

    case WStype_ERROR:
      Serial.println("WS Error");
      break;
  }
}
```

#### steering.controller.ts

```ts
void setMotors(int left, int right) {
  int pwmLeft  = map(abs(left),  0, 100, 0, 255);
  int pwmRight = map(abs(right), 0, 100, 0, 255);

  digitalWrite(AIN_1, left  > 0 ? HIGH : LOW);
  digitalWrite(AIN_2, left  > 0 ? LOW  : HIGH);
  digitalWrite(BIN_1, right > 0 ? LOW  : HIGH);
  digitalWrite(BIN_2, right > 0 ? HIGH : LOW);
  analogWrite(PWM_A, pwmLeft);
  analogWrite(PWM_B, pwmRight);
}


void motorStop() {
  digitalWrite(AIN_1, LOW); digitalWrite(AIN_2, LOW);
  digitalWrite(BIN_1, LOW); digitalWrite(BIN_2, LOW);
  analogWrite(PWM_A, 0);    analogWrite(PWM_B, 0);
}


void handleMessage(uint8_t* payload) {
    StaticJsonDocument<256> doc;
    DeserializationError err = deserializeJson(doc, payload);

    if (err) {
        Serial.println("JSON parse error");
        return;
    }

    const char* event = doc["event"];

   
    if (strcmp(event, "steering:command") == 0) {
        int leftMotor  = doc["data"]["leftMotor"]  | 0;
        int rightMotor = doc["data"]["rightMotor"] | 0;
        setMotors(leftMotor, rightMotor);
        Serial.printf("Steering: L=%d R=%d\n", leftMotor, rightMotor);
        return;
    }

    
    if (strcmp(event, "steering:stop") == 0) {
        motorStop();
        Serial.println("Motor stop");
        return;
    }

   
}
```
#### gryo.controller.ts

```ts
void sendImuData() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  filter.updateIMU(
    g.gyro.x, g.gyro.y, g.gyro.z,
    a.acceleration.x, a.acceleration.y, a.acceleration.z
  );

  StaticJsonDocument<128> doc;
  doc["event"]          = "gyro:data";
  doc["data"]["roll"]   = filter.getRoll();
  doc["data"]["pitch"]  = filter.getPitch();
  doc["data"]["yaw"]    = filter.getYaw();
  doc["data"]["ax"]     = a.acceleration.x;
  doc["data"]["ay"]     = a.acceleration.y;
  doc["data"]["az"]     = a.acceleration.z;
  doc["data"]["timestamp"] = millis();

  String output;
  serializeJson(doc, output);
  webSocket.sendTXT(output);
}
```



