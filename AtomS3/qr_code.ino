#include <M5AtomS3.h>
#include <WiFi.h>
#include <PubSubClient.h>

#define RX   5
#define TX   6
#define TRIG 7
#define DLED 8

// Wi-FiとMQTT設定
const char* ssid = "Mesh-G";
const char* password = "staffhiro";
// const char* mqtt_server = "192.168.30.110";
const char* mqtt_server = "192.168.30.51";
const char* mqtt_topic = "AtomS3/Palette";

WiFiClient espClient;
PubSubClient client(espClient);

String receivedData = ""; // データバッファ

void setup()
{
    // auto cfg = M5.config();
    AtomS3.begin(true);
    AtomS3.dis.setBrightness(100);

    Serial.begin(115200);
    Serial2.begin(115200, SERIAL_8N1, 5, 6);
    
    // flush
    delay(1000);
    while (Serial2.available()) {
        Serial2.read();
    }
    pinMode(TRIG, OUTPUT);
    pinMode(DLED, INPUT);
    
    // Wi-Fi 接続
    AtomS3.dis.drawpix(0xff0000);
    AtomS3.update();
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(100);
        Serial.print(".");
    }
    Serial.println("\nWi-Fi connected!");

    // MQTT 接続
    AtomS3.dis.drawpix(0x0000ff);
    AtomS3.update();
    client.setServer(mqtt_server, 1883);
    while (!client.connected()) {
        if (client.connect("M5AtomS3Client")) {
            Serial.println("MQTT connected!");
        } else {
            Serial.print("MQTT connection failed, rc=");
            Serial.println(client.state());
            delay(5000);
        }
    }

    digitalWrite(TRIG, HIGH);
    AtomS3.dis.drawpix(0x00ff00);
    AtomS3.update();
}

void loop()
{
    AtomS3.update();
    client.loop(); // MQTT クライアントを維持

    if (digitalRead(DLED) == LOW) {
        digitalWrite(TRIG, LOW);
    } else {
        while (Serial2.available() > 0) {
            char ch = Serial2.read();
            if (ch == 0x0d) { // 終端文字に到達
                Serial.println(receivedData); // コンソール出力
                client.publish(mqtt_topic, receivedData.c_str()); // MQTT送信
                receivedData = ""; // バッファをリセット
            } else {
                receivedData += ch; // 文字をバッファに追加
            }
        }
        digitalWrite(TRIG, HIGH);
    }
}