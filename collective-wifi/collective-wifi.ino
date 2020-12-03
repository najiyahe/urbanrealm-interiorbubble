#ifdef ESP8266
#include <ESP8266WiFi.h>
#else
#include <WiFi.h>
#endif
#include <ArduinoWebsockets.h>
#include <FastLED.h>
#include <OSCMessage.h>
#include <OSCBundle.h>
#include <OSCData.h>
#include <Print.h>

using namespace websockets;

#define X_PIN A9
#define Y_PIN A7
#define BUTTON_PIN 14

#define NUM_LEDS 60
#define DATA_PIN 21

#ifdef ESP32
// The ESP32 has a 12-bit ADC, so we get values from 0 - 4095 instead!
#define ANALOG_MAX_VALUE 4095.0
#else
#define ANALOG_MAX_VALUE 1023.0
#endif

const char ssid[] = "Fios-WE1WY"; // your network SSID (name)
const char pass[] = "9326cycle9048tanks"; // your network password
const char serverUrl[] = "wss://radiant-chamber-34629.herokuapp.com"; // The server you want to connect to


///////////////////////////////////////////////////////////////////////////////////////////////////
// This is an implementation detail, it makes the WebsocketsClient and OSC interfaces compatible

class WebsocketsWriter : public Print {
  public:
    // A client that will allow us to connect to a server via WebSockets
    WebsocketsClient client;

    size_t write(uint8_t character) {
      buffer_.push_back((char) character);
      return 1;
    }

    void endMessage() {
      client.sendBinary(buffer_.data(), buffer_.size());
      buffer_.clear();
    }

  private:
    std::vector<char> buffer_;
};
///////////////////////////////////////////////////////////////////////////////////////////////////

WebsocketsWriter writer;
CRGB leds[NUM_LEDS];
int lastButtonState = -1;
float lastX = -1.0;
float lastY = -1.0;

///////////////////////////////////////////////////////////P5 to arduino////////////////////////////////////////

void onRight(OSCMessage& msg) {
  float x = msg.getFloat(0);
  float y = msg.getFloat(1);

  // Right X will change position, Right Y will change hue
  int whichLed = round(x * (NUM_LEDS/2 -1));
  int newHue = round(y * 255);

  leds[whichLed].setHue(newHue);
}

void onLeft(OSCMessage& msg) {
  float x = msg.getFloat(0);
  float y = msg.getFloat(1);

//   // Left X will change position, Left Y will change hue
//   int whichLed = round(x * ((NUM_LEDS/2 -1)+30));
//   int newHue = round(y * 255);

//   leds[whichLed].setHue(newHue);
}


///////////////////////////////////////////////////////////P5 to arduino////////////////////////////////////////


void onToggle(OSCMessage& msg) {
  // Reset everything to red when the button is pressed
  if (msg.getFloat(0) == 1.0) {
    for (int i = 0; i < NUM_LEDS; i++) {
      leds[i] = CRGB::Red;
    }
  }
}

void onMessageCallback(WebsocketsMessage message) {
  OSCMessage oscMessage;
  // Why message.c_str()? See https://github.com/gilmaimon/ArduinoWebsockets#binary-data
  oscMessage.fill((uint8_t*) message.c_str(), message.length());

  if (oscMessage.hasError()) {
    OSCErrorCode error = oscMessage.getError();
    Serial.print("error: ");
    Serial.println(error);
    return;
  }

  // Print out messages for debugging
  oscMessage.send(Serial);
  Serial.println();

  /////////ADDRESS FROM SKETCH TO ARDUINO ////////////
  oscMessage.dispatch("right", onRight);
 oscMessage.dispatch("left", onLeft);
  // oscMessage.dispatch("/3/toggle1", onToggle);
//You can handle more addresses here if you like!
}

void setup() {
  pinMode(X_PIN, INPUT);
  pinMode(Y_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT);

  Serial.begin(57600);

  // Connect to WiFi network
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, pass);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");

  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // Setup callback
  writer.client.onMessage(onMessageCallback);

  // Connect to WebSockets server
  writer.client.connect(serverUrl);
  Serial.print("Connected to ");
  Serial.println(serverUrl);


  // Set up LEDs
  FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);
  FastLED.setBrightness(50);

  // Start them all out red
  for (int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CRGB::Red;
  }
}

void loop() {
  // Check for new messages on the WebSocket
  writer.client.poll();

  // Reconnect if we get disconnected
  if (!writer.client.available(false)) {
    writer.client.connect(serverUrl);
  }

  // Call show at the end of the loop to display any changes
  FastLED.show();

  delay(16);
}
