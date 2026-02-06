#include <WiFi.h>
#include <HTTPClient.h>

// ================= WIFI =================
const char* ssid = "DICONTEX";
const char* password = "KALAMAR1974";

// Backend Node.js (Puerto 4000)
const char* serverUrl = "http://192.168.3.52:4000/api/sensores";

// ================= PINES =================
#define PIR_PIN        27
#define TRIG_PIN       26
#define ECHO_PIN       25
#define LED_alerta     18   // 🚨 Rompevelocidades/Bache
#define LED_correcto   19   // ✅ Calle normal

// Umbral para detectar bache (cm)
#define BACHE_UMBRAL 50

// ================= FUNCIONES =================
float leerDistancia() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duracion = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duracion == 0) return -1;

  return (duracion * 0.0343) / 2;
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  Serial.println("\n--- INICIALIZANDO PROYECTO ORÁCULO ---");

  pinMode(PIR_PIN, INPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  pinMode(LED_alerta, OUTPUT);
  pinMode(LED_correcto, OUTPUT);

  // Estado inicial
  digitalWrite(LED_alerta, LOW);
  digitalWrite(LED_correcto, HIGH);

  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi: ");
  Serial.println(ssid);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi conectado satisfactoriamente");
  Serial.print("IP del ESP32: ");
  Serial.println(WiFi.localIP());
}

// ================= LOOP OPTIMIZADO =================
void loop() {
  // 1. Leemos el PIR para ver si estamos activos
  bool movimiento = digitalRead(PIR_PIN); 
  
  // Si hay movimiento (o si prefieres leer siempre, quita este if)
  if (movimiento) {
      float distancia = leerDistancia();
      
      // Solo si la lectura del ultrasónico es válida
      if (distancia != -1) {
        
        // --- CASO 1: DETECTAMOS BACHE ---
        if (distancia > BACHE_UMBRAL) {
            Serial.println("\n--------------------------------");
            Serial.println("⚠️ ALERTA: ¡BACHE DETECTADO!");
            Serial.print("📏 Profundidad: ");
            Serial.print(distancia);
            Serial.println(" cm");

            // Encender LED Rojo
            digitalWrite(LED_alerta, HIGH);
            digitalWrite(LED_correcto, LOW);

            // --- ENVIAR AL SERVIDOR (Solo entramos aquí si hay bache) ---
            if (WiFi.status() == WL_CONNECTED) {
              HTTPClient http;
              http.begin(serverUrl);
              http.addHeader("Content-Type", "application/json");

              // Creamos el JSON solo con datos útiles
              String payload = "{";
              payload += "\"deviceId\":\"ESP32-01\",";
              payload += "\"movimiento\":true,";
              payload += "\"distancia\":" + String(distancia, 2) + ",";
              payload += "\"bache\":true"; // Confirmamos que es bache
              payload += "}";

              Serial.print("📤 Enviando reporte a BD... ");
              int responseCode = http.POST(payload);

              if (responseCode > 0) {
                Serial.print("✅ Éxito (Código ");
                Serial.print(responseCode);
                Serial.println(")");
              } else {
                Serial.print("❌ Fallo: ");
                Serial.println(http.errorToString(responseCode).c_str());
              }
              http.end();
              
              // ⚠️ COOLDOWN: Esperamos 5 segundos para no repetir el mismo bache
              delay(5000); 

            } else {
              Serial.println("📶 Error: WiFi desconectado en el momento crítico.");
            }

        } else {
            // --- CASO 2: CALLE NORMAL ---
            // Solo encendemos luz verde, NO enviamos nada a la BD
            digitalWrite(LED_alerta, LOW);
            digitalWrite(LED_correcto, HIGH);
            // Comentamos esto para no ensuciar la consola, descomenta si quieres ver todo
            // Serial.print("Calle OK: "); Serial.println(distancia);
            
            // Espera corta para seguir midiendo rápido
            delay(100); 
        }
      }
  } else {
      // Sin movimiento
      digitalWrite(LED_alerta, LOW);
      digitalWrite(LED_correcto, HIGH);
      delay(500);
  }
}